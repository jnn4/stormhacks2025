# Using media in pages

1. In `extension.ts` for your function to get the webview,  
create the following for each URI
`
const screenshotUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'media', 'Screenshot.png')
);
`
2. Inside <script> ensure to have the following:
`
window.__MEDIA_URIS__ = {
    screenshot: '${screenshotUri}',
    [other_name]: '${other name Uri}}'
};
`

3. Inside the page for the component, have:
`
const mediaUris = window.__MEDIA_URIS__ || {};
`

then check if the name exists (for this example the name is screenshot)

{mediaUris.screenshot && (
    <img
        src={mediaUris.screenshot}
        alt="Screenshot"
    >
)
}