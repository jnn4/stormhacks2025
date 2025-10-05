import * as vscode from 'vscode';
import { AuthManager } from './auth';

const THROTTLE_INTERVAL = 30000; // 30 seconds
const IDLE_TIMEOUT = 60000; // 1 minute
const DEVICE_ID_KEY = 'stormhacks.device.id';
const LOGGING_ENABLED_KEY = 'stormhacks.logging.enabled';
const CONSENT_GIVEN_KEY = 'stormhacks.logging.consent';

export class ActivityTracker {
    private static instance: ActivityTracker | undefined;
    private context: vscode.ExtensionContext;
    private authManager: AuthManager;
    private isEnabled: boolean = false;
    private currentSessionId: number | undefined;
    private lastActivityTime: number = 0;
    private lastSendTime: number = 0;
    private idleTimer: NodeJS.Timeout | undefined;
    private disposables: vscode.Disposable[] = [];
    private deviceId: string;
    private statusBarItem: vscode.StatusBarItem;
    private outputChannel: vscode.OutputChannel;

    private constructor(context: vscode.ExtensionContext, authManager: AuthManager) {
        this.context = context;
        this.authManager = authManager;
        
        // Create output channel for logging
        this.outputChannel = vscode.window.createOutputChannel('Stormhacks Activity Tracker');
        
        // Get or create device ID
        this.deviceId = this.getOrCreateDeviceId();
        
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'stormhacks.toggleLogSession';
        
        // Load saved state
        this.isEnabled = context.globalState.get(LOGGING_ENABLED_KEY, false);
        this.updateStatusBar();
    }

    public static getInstance(context: vscode.ExtensionContext, authManager: AuthManager): ActivityTracker {
        if (!ActivityTracker.instance) {
            ActivityTracker.instance = new ActivityTracker(context, authManager);
        }
        return ActivityTracker.instance;
    }

    private getOrCreateDeviceId(): string {
        let deviceId = this.context.globalState.get<string>(DEVICE_ID_KEY);
        if (!deviceId) {
            deviceId = this.generateDeviceId();
            this.context.globalState.update(DEVICE_ID_KEY, deviceId);
        }
        return deviceId;
    }

    private generateDeviceId(): string {
        return `vscode-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }

    public async toggle(): Promise<void> {
        if (this.isEnabled) {
            await this.stop();
        } else {
            await this.start();
        }
    }

    public async start(): Promise<void> {
        // Check if user is authenticated
        const isAuthenticated = await this.authManager.isAuthenticated();
        if (!isAuthenticated) {
            vscode.window.showErrorMessage(
                'Please login first before enabling activity logging.',
                'Login'
            ).then(selection => {
                if (selection === 'Login') {
                    vscode.commands.executeCommand('stormhacks.login');
                }
            });
            return;
        }

        // Check for consent
        const hasConsent = this.context.globalState.get(CONSENT_GIVEN_KEY, false);
        if (!hasConsent) {
            const result = await this.promptForConsent();
            if (!result) {
                return; // User declined
            }
        }

        this.isEnabled = true;
        await this.context.globalState.update(LOGGING_ENABLED_KEY, true);
        
        // Register event listeners
        this.registerEventListeners();
        
        // Start a session
        await this.startSession();
        
        this.updateStatusBar();
        vscode.window.showInformationMessage('Activity logging enabled');
    }

    public async stop(): Promise<void> {
        this.isEnabled = false;
        await this.context.globalState.update(LOGGING_ENABLED_KEY, false);
        
        // Dispose all event listeners
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        
        // Clear idle timer
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
        
        // End current session
        await this.endSession();
        
        this.updateStatusBar();
        vscode.window.showInformationMessage('Activity logging disabled');
    }

    private async promptForConsent(): Promise<boolean> {
        const message = 'Stormhacks would like to track your typing activity. ' +
                       'We will only collect: when you type and the file extension you\'re working on. ' +
                       'This helps improve your learning experience. Do you consent?';
        
        const result = await vscode.window.showInformationMessage(
            message,
            { modal: true },
            'Yes, I consent',
            'No'
        );

        if (result === 'Yes, I consent') {
            await this.context.globalState.update(CONSENT_GIVEN_KEY, true);
            return true;
        }
        
        return false;
    }

    private registerEventListeners(): void {
        // Listen to text document changes (typing)
        const changeDisposable = vscode.workspace.onDidChangeTextDocument(
            this.onTextChanged.bind(this)
        );
        this.disposables.push(changeDisposable);

        // Listen to active editor changes
        const editorDisposable = vscode.window.onDidChangeActiveTextEditor(
            this.onEditorChanged.bind(this)
        );
        this.disposables.push(editorDisposable);
    }

    private async onTextChanged(event: vscode.TextDocumentChangeEvent): Promise<void> {
        if (!this.isEnabled || event.contentChanges.length === 0) {
            return;
        }

        const now = Date.now();
        this.lastActivityTime = now;

        // Throttle: only send update if 30 seconds have passed
        if (now - this.lastSendTime >= THROTTLE_INTERVAL) {
            await this.updateSession(event.document);
            this.lastSendTime = now;
        }

        // Reset idle timer
        this.resetIdleTimer();
    }

    private async onEditorChanged(editor: vscode.TextEditor | undefined): Promise<void> {
        if (!this.isEnabled || !editor) {
            return;
        }

        const now = Date.now();
        this.lastActivityTime = now;
        
        // Reset idle timer when switching editors
        this.resetIdleTimer();
    }

    private resetIdleTimer(): void {
        // Clear existing timer
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }

        // Set new idle timer
        this.idleTimer = setTimeout(async () => {
            this.log('User idle for more than 1 minute, ending session');
            await this.endSession();
            this.currentSessionId = undefined;
        }, IDLE_TIMEOUT);
    }

    private getLanguageTag(document?: vscode.TextDocument): string {
        if (!document) {
            const editor = vscode.window.activeTextEditor;
            document = editor?.document;
        }

        if (!document) {
            return 'unknown';
        }

        // Extension to language mapping for common cases
        const extensionToLanguage: { [key: string]: string } = {
            // C/C++
            'c': 'c',
            'cc': 'cpp',
            'cpp': 'cpp',
            'cxx': 'cpp',
            'h': 'c',
            'hpp': 'cpp',
            'hxx': 'cpp',
            // Python
            'py': 'python',
            'pyw': 'python',
            'pyi': 'python',
            // JavaScript/TypeScript
            'js': 'javascript',
            'jsx': 'javascriptreact',
            'ts': 'typescript',
            'tsx': 'typescriptreact',
            'mjs': 'javascript',
            // Web
            'html': 'html',
            'htm': 'html',
            'css': 'css',
            'scss': 'scss',
            'sass': 'sass',
            'less': 'less',
            // Java
            'java': 'java',
            // Go
            'go': 'go',
            // Rust
            'rs': 'rust',
            // Ruby
            'rb': 'ruby',
            // PHP
            'php': 'php',
            // Shell
            'sh': 'shellscript',
            'bash': 'shellscript',
            'zsh': 'shellscript',
            // Other
            'json': 'json',
            'xml': 'xml',
            'yaml': 'yaml',
            'yml': 'yaml',
            'md': 'markdown',
            'sql': 'sql',
            'swift': 'swift',
            'kt': 'kotlin',
            'kts': 'kotlin',
        };

        // Get file extension
        const fileName = document.fileName;
        const extension = fileName.split('.').pop()?.toLowerCase();
        
        // PRIORITY 1: Check our extension mapping FIRST for known file types
        // This ensures .cc files always map to 'cpp' even if VS Code detects them as 'plaintext'
        if (extension && extensionToLanguage[extension]) {
            this.log(`Mapped extension .${extension} to language: ${extensionToLanguage[extension]}`);
            return extensionToLanguage[extension];
        }
        
        // PRIORITY 2: If extension not in our mapping, use VS Code's languageId (if not plaintext)
        const languageId = document.languageId;
        if (languageId && languageId !== 'plaintext') {
            this.log(`Using VS Code languageId: ${languageId}`);
            return languageId;
        }
        
        // PRIORITY 3: Final fallback - return the raw extension or 'unknown'
        const fallback = extension || 'unknown';
        this.log(`No mapping found, using fallback: ${fallback}`);
        vscode.window.showInformationMessage(`Fallback is ${fallback}`);
        return fallback;
    }

    private async startSession(): Promise<void> {
        try {
            const languageTag = this.getLanguageTag();
            
            this.log('Starting session with:', {
                language_tag: languageTag,
                source: 'vscode',
                device_id: this.deviceId
            });
            
            const response = await this.authManager.makeAuthenticatedRequest(
                '/api/activity/start',
                'POST',
                {
                    language_tag: languageTag,
                    source: 'vscode',
                    device_id: this.deviceId
                }
            );

            this.log('Session response:', response);

            if (response.success && response.session) {
                this.currentSessionId = response.session.typing_id;
                this.log('Started typing session:', this.currentSessionId);
                
                // Initialize timers
                this.lastActivityTime = Date.now();
                this.lastSendTime = Date.now();
                this.resetIdleTimer();
            }
        } catch (error: any) {
            this.log('Failed to start session - Full error:', error);
            this.log('Error message:', error.message);
            this.log('Error stack:', error.stack);
            vscode.window.showErrorMessage(`Failed to start activity session: ${error.message}`);
        }
    }

    private async updateSession(document: vscode.TextDocument): Promise<void> {
        // If no active session, start one
        if (!this.currentSessionId) {
            await this.startSession();
            return;
        }

        try {
            const languageTag = this.getLanguageTag(document);
            
            // Just call start again - the backend handles updating existing sessions
            const response = await this.authManager.makeAuthenticatedRequest(
                '/api/activity/start',
                'POST',
                {
                    language_tag: languageTag,
                    source: 'vscode',
                    device_id: this.deviceId
                }
            );

            if (response.success && response.session) {
                this.currentSessionId = response.session.typing_id;
                this.log('Updated/maintained session:', this.currentSessionId);
            }
        } catch (error: any) {
            this.log('Failed to update session:', error);
        }
    }

    private async endSession(): Promise<void> {
        if (!this.currentSessionId) {
            return;
        }

        try {
            const response = await this.authManager.makeAuthenticatedRequest(
                '/api/activity/end',
                'POST',
                {
                    typing_id: this.currentSessionId,
                    device_id: this.deviceId
                }
            );

            if (response.success) {
                this.log('Ended typing session:', this.currentSessionId);
                this.currentSessionId = undefined;
            }
        } catch (error: any) {
            this.log('Failed to end session:', error);
        }

        // Clear idle timer
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = undefined;
        }
    }

    private updateStatusBar(): void {
        if (this.isEnabled) {
            this.statusBarItem.text = '$(record) Activity Logging';
            this.statusBarItem.tooltip = 'Activity logging is enabled. Click to disable.';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        } else {
            this.statusBarItem.text = '$(circle-slash) Activity Logging';
            this.statusBarItem.tooltip = 'Activity logging is disabled. Click to enable.';
            this.statusBarItem.backgroundColor = undefined;
        }
        this.statusBarItem.show();
    }

    private log(message: string, ...args: any[]): void {
        const timestamp = new Date().toISOString();
        const formattedMessage = `[${timestamp}] ${message}`;
        
        // Log to output channel (visible in VS Code)
        if (args.length > 0) {
            this.outputChannel.appendLine(`${formattedMessage} ${JSON.stringify(args, null, 2)}`);
        } else {
            this.outputChannel.appendLine(formattedMessage);
        }
        
        // Also log to console for debugging
        console.log(formattedMessage, ...args);
    }

    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        // End session on dispose
        this.endSession();
    }

    public isActive(): boolean {
        return this.isEnabled;
    }
}

