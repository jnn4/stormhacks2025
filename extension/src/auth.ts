import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import * as url from 'url';
import * as crypto from 'crypto';

const BACKEND_URL = 'http://localhost:5000';
const OAUTH_PORT = 3000; // Local port for OAuth callback

export class AuthManager {
    private static instance: AuthManager;
    private context: vscode.ExtensionContext;
    private token: string | undefined;
    private server: http.Server | undefined;

    private constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Load token from secure storage
        this.loadToken();
    }

    public static getInstance(context?: vscode.ExtensionContext): AuthManager {
        if (!AuthManager.instance) {
            if (!context) {
                throw new Error('Context is required for initial AuthManager creation');
            }
            AuthManager.instance = new AuthManager(context);
        }
        return AuthManager.instance;
    }

    private async loadToken(): Promise<void> {
        this.token = await this.context.secrets.get('stormhacks.auth.token');
    }

    private async saveToken(token: string): Promise<void> {
        await this.context.secrets.store('stormhacks.auth.token', token);
        this.token = token;
    }

    private async clearToken(): Promise<void> {
        await this.context.secrets.delete('stormhacks.auth.token');
        this.token = undefined;
    }

    public async isAuthenticated(): Promise<boolean> {
        if (!this.token) {
            await this.loadToken();
        }
        
        if (!this.token) {
            return false;
        }

        // Verify token with backend
        try {
            const response = await this.makeAuthenticatedRequest('/auth/user', 'GET');
            return response.authenticated === true;
        } catch (error) {
            // Token might be expired or invalid
            await this.clearToken();
            return false;
        }
    }

    public async getToken(): Promise<string | undefined> {
        if (!this.token) {
            await this.loadToken();
        }
        return this.token;
    }

    public async login(): Promise<boolean> {
        const token = await this.getToken();
        if (token) {
            vscode.window.showInformationMessage(`Already logged in`);
            return true;
        }
        
        return new Promise((resolve, reject) => {
            // Generate a random state for CSRF protection
            const state = crypto.randomBytes(32).toString('hex');
            
            // Start local server to handle OAuth callback
            this.server = http.createServer(async (req, res) => {
                const parsedUrl = url.parse(req.url || '', true);
                
                if (parsedUrl.pathname === '/callback') {
                    // Extract token and user info from the redirect
                    const token = parsedUrl.query.token as string;
                    const login = parsedUrl.query.login as string;
                    const returnedState = parsedUrl.query.state as string;
                    
                    if (returnedState !== state) {
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>Invalid state parameter. Please try again.</p>
                                    <script>setTimeout(() => window.close(), 3000);</script>
                                </body>
                            </html>
                        `);
                        this.server?.close();
                        resolve(false);
                        return;
                    }
                    
                    if (token) {
                        await this.saveToken(token);
                        
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body style="font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                    <div style="text-align: center; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                        <h1 style="color: #10b981; margin: 0;">Authentication Successful!</h1>
                                        <p style="color: #6b7280; margin-top: 1rem;">You can now close this window and return to VS Code.</p>
                                    </div>
                                </body>
                            </html>
                        `);
                        
                        vscode.window.showInformationMessage(`Successfully logged in as ${login || 'user'}`);
                        this.server?.close();
                        resolve(true);
                    } else {
                        res.writeHead(500, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>No token received from authentication server</p>
                                </body>
                            </html>
                        `);
                        this.server?.close();
                        resolve(false);
                    }
                }
            });
            
            this.server.listen(OAUTH_PORT, async () => {
                // Build the OAuth URL with our local callback
                const oauthUrl = `${BACKEND_URL}/auth/github?extension_callback=http://localhost:${OAUTH_PORT}/callback&state=${state}`;
                
                // Open browser for authentication
                const opened = await vscode.env.openExternal(vscode.Uri.parse(oauthUrl));
                
                if (!opened) {
                    vscode.window.showErrorMessage('Failed to open browser for authentication');
                    this.server?.close();
                    resolve(false);
                }
            });
            
            // Timeout after 5 minutes
            setTimeout(() => {
                if (this.server) {
                    this.server.close();
                    reject(new Error('Authentication timeout'));
                }
            }, 5 * 60 * 1000);
        });
    }

    public async logout(): Promise<void> {
        await this.clearToken();
        vscode.window.showInformationMessage('Successfully logged out');
    }

    public async makeAuthenticatedRequest(endpoint: string, method: string, body?: any): Promise<any> {
        const token = await this.getToken();
        
        if (!token) {
            throw new Error('Not authenticated');
        }
        
        return new Promise((resolve, reject) => {
            const urlObj = new URL(`${BACKEND_URL}${endpoint}`);
            const isHttps = urlObj.protocol === 'https:';
            const httpModule = isHttps ? https : http;
            
            const postData = body ? JSON.stringify(body) : undefined;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
                }
            };
            
            const req = httpModule.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`HTTP Response [${method} ${endpoint}]:`, {
                        statusCode: res.statusCode,
                        statusMessage: res.statusMessage,
                        body: data
                    });
                    
                    if (res.statusCode === 401) {
                        // Token expired or invalid
                        this.clearToken();
                        reject(new Error('Authentication expired. Please login again.'));
                        return;
                    }
                    
                    if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                        try {
                            const error = JSON.parse(data);
                            const errorMsg = error.error || error.message || `Request failed: ${res.statusMessage}`;
                            console.error('Request error:', errorMsg, 'Full error:', error);
                            reject(new Error(errorMsg));
                        } catch (e) {
                            console.error('Failed to parse error response:', data);
                            reject(new Error(`Request failed: ${res.statusMessage || 'Unknown error'}`));
                        }
                        return;
                    }
                    
                    try {
                        const result = JSON.parse(data);
                        resolve(result);
                    } catch (e) {
                        console.error('Failed to parse success response:', data);
                        reject(new Error('Failed to parse response'));
                    }
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            if (postData) {
                req.write(postData);
            }
            
            req.end();
        });
    }

    public async getCurrentUser(): Promise<any> {
        try {
            return await this.makeAuthenticatedRequest('/auth/user', 'GET');
        } catch (error) {
            return null;
        }
    }
}
