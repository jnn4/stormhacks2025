// extension.ts (replacement)
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Stormhacks extension is now active!');

    // pass the extension context into the provider so it can register disposables
    const provider = new StormhacksViewProvider(context.extensionUri, context);

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

    context.subscriptions.push(
        vscode.commands.registerCommand('stormhacks.toggleStormhacks', () => {
            vscode.commands.executeCommand('stormhacks.stormhacksView.focus');
        })
    );
}

class StormhacksViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'stormhacks.stormhacksView';
    private _currentWebview?: vscode.WebviewView;
    private _messageDisposable?: vscode.Disposable;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        console.log('[Stormhacks] resolveWebviewView called');
        this._currentWebview = webviewView;

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
                        // wait for the postMessage promise to complete (optional)
                        await webviewView.webview.postMessage({
                            type: 'reply',
                            text: data.reply,
                        });
                    } catch (err) {
                        console.error('[Stormhacks] error contacting backend', err);
                        await webviewView.webview.postMessage({
                            type: 'reply',
                            text: 'Error contacting backend',
                        });
                    }
                } else {
                    console.log('[Stormhacks] ignoring message type:', message?.type);
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
            this._currentWebview = undefined;
        });
    }

    private _getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
        );

        const nonce = getNonce();

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
    <title>Stormhacks</title>
    <style>body{margin:0;padding:0;overflow-x:hidden;overflow-y:auto;}#root{width:100%;min-height:100%;}</style>
</head>
<body>
    <div id="root"></div>
    <script nonce="${nonce}">
        window.addEventListener('error', (e) => {
            console.error('Webview error:', e.message, e.filename, e.lineno, e.colno);
        });
        console.log('Webview initializing...');
    </script>
    <script nonce="${nonce}" src="${scriptUri}"></script>
    <script nonce="${nonce}">console.log('Webview script loaded');</script>
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

export function deactivate() {}
