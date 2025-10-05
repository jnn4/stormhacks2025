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
 * Media URIs that are passed from the extension to the webview
 * These are properly formatted webview URIs for accessing assets
 */
interface MediaUris {
  // Images
  bgSudo?: string;
  calendarIcon?: string;
  catHouse?: string;
  catTree?: string;
  cat?: string;
  foodBowl?: string;
  postureIcon?: string;
  tutorIcon?: string;
}

/**
 * Extend the Window interface to include media URIs
 */
interface Window {
  __MEDIA_URIS__?: MediaUris;
}
