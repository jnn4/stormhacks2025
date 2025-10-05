// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from "path";
import { AuthManager } from './auth';
import { ActivityTracker } from './activity-tracker';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('Stormhacks extension is now active!');

    // Initialize the authentication manager
    const authManager = AuthManager.getInstance(context);

    // Initialize the activity tracker
    const activityTracker = ActivityTracker.getInstance(context, authManager);
    context.subscriptions.push(activityTracker);

    // Register the webview view provider for sidebar
    const provider = new StormhacksViewProvider(context.extensionUri, authManager, context);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            StormhacksViewProvider.viewType,
            provider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true
                }
            }
        )
    );

	// Register the man page command to open man page in a new tab
	context.subscriptions.push(
		vscode.commands.registerCommand('stormhacks.openManPage', () => {
			openManPagePanel(context.extensionUri);
		})
	);

	// Register the quiz command to open quiz in a new tab
	context.subscriptions.push(
		vscode.commands.registerCommand('stormhacks.openQuiz', () => {
			openQuizPanel(context.extensionUri);
		})
	);
    // Register the toggle command to focus the sidebar view
    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.toggleStormhacks', () => {
            vscode.commands.executeCommand('stormhacks.stormhacksView.focus');
        })
    );

    // Register authentication commands
    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.login', async () => {
            try {
                const success = await authManager.login();
                if (success) {
                    // Notify the webview about authentication status change
                    provider.notifyAuthChange();
                }
            } catch (error: any) {
                vscode.window.showErrorMessage(`Login failed: ${error.message}`);
            }
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.logout', async () => {
            await authManager.logout();
            // Notify the webview about authentication status change
            provider.notifyAuthChange();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.checkAuth', async () => {
            const isAuthenticated = await authManager.isAuthenticated();
            if (isAuthenticated) {
                const user = await authManager.getCurrentUser();
                if (user && user.user) {
                    vscode.window.showInformationMessage(
                        `Authenticated as: ${user.user.login} (${user.user.name || 'No name'})`
                    );
                } else {
                    vscode.window.showInformationMessage('Authenticated but could not fetch user details');
                }
            } else {
                vscode.window.showInformationMessage('Not authenticated. Please login first.');
            }
        })
    );

    // Register activity tracking command
    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.toggleLogSession', async () => {
            await activityTracker.toggle();
        })
    );
}

function openManPagePanel(extensionUri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        'stormhacksManPage',
        'Terminal Reference',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
        }
    );
    
    panel.webview.html = getManPage(panel.webview, extensionUri);
}

function getManPage(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'manpage.js')
    );
    
    // Create URIs for all image assets
    const bgSudoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'bg_sudo.jpg')
    );
    const calendarIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'calendar_icon.png')
    );
    const catHouseUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat_house.png')
    );
    const catTreeUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat_tree.png')
    );
    const catUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat.png')
    );
    const foodBowlUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'food_bowl.png')
    );
    const postureIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'posture_icon.png')
    );
    const tutorIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'tutor_icon.png')
    );
    
    const nonce = getNonce();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <title>Terminal Reference</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            overflow-y: auto;
        }
        #root {
            width: 100%;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
        // Pass media URIs to the webview
        window.__MEDIA_URIS__ = {
            bgSudo: '${bgSudoUri}',
            calendarIcon: '${calendarIconUri}',
            catHouse: '${catHouseUri}',
            catTree: '${catTreeUri}',
            cat: '${catUri}',
            foodBowl: '${foodBowlUri}',
            postureIcon: '${postureIconUri}',
            tutorIcon: '${tutorIconUri}'
        };
        
        window.addEventListener('error', (e) => {
            console.error('Webview error:', e.message, e.filename, e.lineno, e.colno);
        });
        console.log('ManPage webview initializing with media URIs:', window.__MEDIA_URIS__);
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">
        console.log('ManPage webview script loaded');
    </script>
</body>
</html>`;
}

function openQuizPanel(extensionUri: vscode.Uri) {
    // Create and show a new webview panel
    const panel = vscode.window.createWebviewPanel(
        'stormhacksQuiz', // Identifies the type of the webview
        'Vim Quiz', // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
        }
    );

    // Set the webview's HTML content
    panel.webview.html = getQuizWebviewContent(panel.webview, extensionUri);
}

function getQuizWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    // Get the local path to the quiz script
    const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'quiz.js')
    );

    // Create URIs for all image assets
    const bgSudoUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'bg_sudo.jpg')
    );
    const calendarIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'calendar_icon.png')
    );
    const catHouseUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat_house.png')
    );
    const catTreeUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat_tree.png')
    );
    const catUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'cat.png')
    );
    const foodBowlUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'food_bowl.png')
    );
    const postureIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'posture_icon.png')
    );
    const tutorIconUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'images', 'tutor_icon.png')
    );

    // Use a nonce to only allow specific scripts to be run
    const nonce = getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; connect-src http://localhost:5000 http://127.0.0.1:5000 https://api.github.com;">
    <title>Vim Quiz</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            overflow-y: auto;
        }
        #root {
            width: 100%;
            min-height: 100vh;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
        // Acquire VS Code API
        const vscode = acquireVsCodeApi();
        
        // Pass media URIs to the webview
        window.__MEDIA_URIS__ = {
            bgSudo: '${bgSudoUri}',
            calendarIcon: '${calendarIconUri}',
            catHouse: '${catHouseUri}',
            catTree: '${catTreeUri}',
            cat: '${catUri}',
            foodBowl: '${foodBowlUri}',
            postureIcon: '${postureIconUri}',
            tutorIcon: '${tutorIconUri}'
        };
        
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Webview error:', e.message, e.filename, e.lineno, e.colno);
        });
        console.log('Quiz webview initializing with media URIs:', window.__MEDIA_URIS__);
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">
        console.log('Quiz webview script loaded');
    </script>
</body>
</html>`;
}

class StormhacksViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'stormhacks.stormhacksView';
    private _view?: vscode.WebviewView;
    private _messageDisposable?: vscode.Disposable;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _authManager: AuthManager,
        private readonly _context: vscode.ExtensionContext
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        console.log('[Stormhacks] resolveWebviewView called');
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(this._extensionUri, 'dist')],
        };

        webviewView.webview.html = this._getWebviewContent(webviewView.webview);

        // Dispose any previous listener to avoid duplicates / stale handlers
        if (this._messageDisposable) {
            this._messageDisposable.dispose();
            this._messageDisposable = undefined;
        }

        // Register message listener and attach disposable to extension context
        this._messageDisposable = webviewView.webview.onDidReceiveMessage(
            async (message) => {
                console.log('[Stormhacks] got message from webview:', message);
                
                // Handle authentication-related messages
                switch (message.command) {
                    case 'getAuthStatus':
                        const isAuthenticated = await this._authManager.isAuthenticated();
                        const user = isAuthenticated ? await this._authManager.getCurrentUser() : null;
                        webviewView.webview.postMessage({
                            command: 'authStatus',
                            isAuthenticated,
                            user: user?.user
                        });
                        break;
                    case 'login':
                        await vscode.commands.executeCommand('stormhacks.login');
                        break;
                    case 'logout':
                        await vscode.commands.executeCommand('stormhacks.logout');
                        break;
                    case 'apiRequest':
                        try {
                            const response = await this._authManager.makeAuthenticatedRequest(
                                message.endpoint,
                                message.method,
                                message.body
                            );
                            webviewView.webview.postMessage({
                                command: 'apiResponse',
                                requestId: message.requestId,
                                success: true,
                                data: response
                            });
                        } catch (error: any) {
                            webviewView.webview.postMessage({
                                command: 'apiResponse',
                                requestId: message.requestId,
                                success: false,
                                error: error.message
                            });
                        }
                        break;
                }
                
                // Handle chat messages
                if (message?.type === 'userMessage') {
                    try {
                        const res = await fetch('http://127.0.0.1:5000/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: message.text }),
                        });

                        if (!res.ok) {
                            const text = await res.text();
                            console.error('[Stormhacks] backend non-OK:', res.status, text);
                            await webviewView.webview.postMessage({
                                type: 'reply',
                                text: `Backend error: ${res.status}`,
                            });
                            return;
                        }

                        const data = await res.json();
                        console.log('[Stormhacks] sending reply to webview:', data.reply);
                        await webviewView.webview.postMessage({
                            type: 'reply',
                            text: data.reply,
                        });
                    } catch (err) {
                        console.error('[Stormhacks] error contacting backend', err);
                        await webviewView.webview.postMessage({
                            type: 'reply',
                            text: 'Error contacting backend. Make sure the backend is running on port 5000.',
                        });
                    }
                }

                // Handle terminal command explanation requests
                if (message?.type === 'explain') {
                    try {
                        console.log('[Stormhacks] explain request for command:', message.command);
                        const res = await fetch('http://127.0.0.1:5000/api/terminal/explain', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ command: message.command }),
                        });

                        if (!res.ok) {
                            const text = await res.text();
                            console.error('[Stormhacks] terminal explain backend error:', res.status, text);
                            await webviewView.webview.postMessage({
                                type: 'explanation',
                                data: { explanation: `Backend error: ${res.status} - ${text}` },
                            });
                            return;
                        }

                        const data = await res.json();
                        console.log('[Stormhacks] sending explanation to webview:', data);
                        await webviewView.webview.postMessage({
                            type: 'explanation',
                            data: { explanation: data.explanation },
                        });
                    } catch (err) {
                        console.error('[Stormhacks] error getting explanation from backend', err);
                        await webviewView.webview.postMessage({
                            type: 'explanation',
                            data: { explanation: 'Error contacting backend. Make sure the backend is running on port 5000.' },
                        });
                    }
                }
            },
            undefined,
            this._context.subscriptions
        );

        webviewView.onDidDispose(() => {
            console.log('[Stormhacks] webviewView disposed');
            // Clean up
            this._messageDisposable?.dispose();
            this._messageDisposable = undefined;
            this._view = undefined;
        });
    }

    public notifyAuthChange() {
        if (this._view) {
            this._authManager.isAuthenticated().then(isAuthenticated => {
                this._authManager.getCurrentUser().then(user => {
                    this._view?.webview.postMessage({
                        command: 'authStatusChanged',
                        isAuthenticated,
                        user: user?.user
                    });
                });
            });
        }
    }

    private _getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js')
        );

        // Create URIs for all image assets
        const bgSudoUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'bg_sudo.jpg')
        );
        const calendarIconUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'calendar_icon.png')
        );
        const catHouseUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'cat_house.png')
        );
        const catTreeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'cat_tree.png')
        );
        const catUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'cat.png')
        );
        const foodBowlUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'food_bowl.png')
        );
        const postureIconUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'posture_icon.png')
        );
        const tutorIconUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'assets', 'images', 'tutor_icon.png')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource}; connect-src http://localhost:5000 http://127.0.0.1:5000 https://api.github.com;">
    <title>Stormhacks</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            overflow-y: auto;
        }
        #root {
            width: 100%;
            min-height: 100%;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
        // Pass media URIs to the webview
        window.__MEDIA_URIS__ = {
            bgSudo: '${bgSudoUri}',
            calendarIcon: '${calendarIconUri}',
            catHouse: '${catHouseUri}',
            catTree: '${catTreeUri}',
            cat: '${catUri}',
            foodBowl: '${foodBowlUri}',
            postureIcon: '${postureIconUri}',
            tutorIcon: '${tutorIconUri}'
        };
        
        // Error handling
        window.addEventListener('error', (e) => {
            console.error('Webview error:', e.message, e.filename, e.lineno, e.colno);
        });
        console.log('Webview initializing with media URIs:', window.__MEDIA_URIS__);
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">
        console.log('Webview script loaded');
    </script>
</body>
</html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// This method is called when your extension is deactivated
export function deactivate() {}
