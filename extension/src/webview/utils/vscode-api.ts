// VS Code Webview types
declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (message: any) => void;
      getState: () => any;
      setState: (state: any) => void;
    };
  }
}

// Acquire the VS Code API only once and export it
// This prevents "already been acquired" errors when multiple components need it
let vsCodeApi: ReturnType<NonNullable<typeof window.acquireVsCodeApi>> | undefined;

try {
  if (window.acquireVsCodeApi && !vsCodeApi) {
    vsCodeApi = window.acquireVsCodeApi();
    console.log('VS Code API acquired successfully');
  }
} catch (error) {
  console.warn('Failed to acquire VS Code API:', error);
}

export const vscode = vsCodeApi;


