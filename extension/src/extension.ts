// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Stormhacks extension is now active!');

	// Register the webview view provider for sidebar
	const provider = new StormhacksViewProvider(context.extensionUri);
	
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

	// Register the toggle command to focus the sidebar view
	context.subscriptions.push(
		vscode.commands.registerCommand('stormhacks.toggleStormhacks', () => {
			vscode.commands.executeCommand('stormhacks.stormhacksView.focus');
		})
	);
}

class StormhacksViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'stormhacks.stormhacksView';

	constructor(
		private readonly _extensionUri: vscode.Uri
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken
	) {
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.joinPath(this._extensionUri, 'dist')
			]
		};

		webviewView.webview.html = this._getWebviewContent(webviewView.webview);

		// Handle messages from the webview (for debugging)
		
		webviewView.webview.onDidReceiveMessage((message) => {
			console.log(message);
		});

	}

	private _getWebviewContent(webview: vscode.Webview): string {
		// Get the local path to the webview script
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
		);

		// Use a nonce to only allow specific scripts to be run
		const nonce = getNonce();

		return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
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
		// Error handling
		window.addEventListener('error', (e) => {
			console.error('Webview error:', e.message, e.filename, e.lineno, e.colno);
		});
		console.log('Webview initializing...');
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
