/**
 * Type definitions for VS Code Webview API
 * 
 * This provides type safety for the vscode global object available in webviews.
 * The vscode object is acquired via acquireVsCodeApi() in the webview HTML.
 * 
 * Note: Webviews communicate with the extension via postMessage().
 * The extension handles these messages and can execute commands on behalf of the webview.
 */

interface VsCodeApi {
  /**
   * Post a message to the extension
   * The extension's onDidReceiveMessage handler will receive this message
   */
  postMessage(message: any): void;

  /**
   * Get the current state that was previously set with setState()
   */
  getState(): any;

  /**
   * Set the state that will be persisted across webview reloads
   */
  setState(state: any): void;
}

/**
 * Global vscode API object available in webviews after calling acquireVsCodeApi()
 */
declare const vscode: VsCodeApi;

/**
 * Function to acquire the VS Code API (only available in webview context)
 * Note: This should be called in the HTML before loading your bundle
 */
declare function acquireVsCodeApi(): VsCodeApi;

/**
 * Media URIs passed from the extension to the webview
 * These URIs point to files in the dist/media folder
 */
interface MediaUris {
  screenshot?: string;
  // Add more media file URIs here as needed
}

/**
 * Global window object with media URIs
 */
interface Window {
  __MEDIA_URIS__?: MediaUris;
}

