# Using Images/GIFs in Webview Pages

## ✅ Setup Complete! (Option 2: Copy to Dist)

Media files are automatically copied from `src/media/` to `dist/media/` during build, and URIs are passed from the extension to webviews.

## How It Works

1. **Build Time**: Webpack copies all files from `src/media/` to `dist/media/`
2. **Extension**: Creates webview-compatible URIs for media files
3. **Webview**: Accesses URIs via `window.__MEDIA_URIS__`

## How to Use

### 1. Add your image/gif to the media folder

```
src/media/
  ├── celebration.gif
  ├── logo.png
  └── Screenshot From 2025-05-25 14-36-39.png
```

### 2. Update extension.ts to create URIs

In `src/extension.ts`, add your media files to the `_getWebviewContent` method (or `getQuizWebviewContent` for quiz panel):

```typescript
private _getWebviewContent(webview: vscode.Webview): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'sidebar.js')
  );

  // Create URIs for media files
  const screenshotUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'media', 'Screenshot From 2025-05-25 14-36-39.png')
  );
  const logoUri = webview.asWebviewUri(
    vscode.Uri.joinPath(this._extensionUri, 'dist', 'media', 'logo.png')
  );

  // Pass to webview
  window.__MEDIA_URIS__ = {
    screenshot: '${screenshotUri}',
    logo: '${logoUri}'
  };
  
  // ... rest of HTML
}
```

### 3. Update type definitions (if adding new media)

In `src/webview/types/vscode.d.ts`, add your new media files to the `MediaUris` interface:

```typescript
interface MediaUris {
  screenshot?: string;
  logo?: string;
  celebration?: string;
  // Add more as needed
}
```

### 4. Use in React components

```tsx
const SidebarApp: React.FC = () => {
  // Access media URIs
  const mediaUris = window.__MEDIA_URIS__ || {};

  return (
    <div>
      {/* Use the URIs */}
      {mediaUris.screenshot && (
        <img src={mediaUris.screenshot} alt="Screenshot" />
      )}
      
      {mediaUris.logo && (
        <img src={mediaUris.logo} alt="Logo" className="w-20 h-20" />
      )}
    </div>
  );
}
```

## Working Example

Check out `src/webview/pages/SidebarApp.tsx` to see a live example using `Screenshot.png`!

## Build

After adding images, rebuild the extension:

```bash
npm run compile
```

The images will be copied to `dist/media/` and accessible in your webviews!

## Pros & Cons

### ✅ Advantages
- Images separate from bundle (smaller JS files)
- Simple to understand
- Easy to add/remove media files
- Works with existing VS Code webview security

### ⚠️ Considerations
- Need to update extension.ts when adding new media
- URIs must be passed explicitly
- Slight overhead managing URI mapping

## Alternative: Option 1 (Webpack Import)

If you prefer to import images directly in components like:
```tsx
import logo from '../../media/logo.png';
```

See the git history or ask for Option 1 implementation instead.
