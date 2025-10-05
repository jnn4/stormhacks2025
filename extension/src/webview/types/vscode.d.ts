// Type definitions for VS Code webview API

interface VSCodeAPI {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
}

declare const vscode: VSCodeAPI;

declare function acquireVsCodeApi(): VSCodeAPI;
