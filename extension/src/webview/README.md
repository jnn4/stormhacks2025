# Webview Structure

This directory contains all webview-related code for the VS Code extension, organized for easy maintenance and scalability.

## Directory Structure

```
src/webview/
├── entries/        # Entry points for each webview (webpack bundles)
├── pages/          # Main React components for each webview
├── styles/         # Shared styles (Tailwind CSS)
└── README.md       # This file
```

## How to Add a New Webview

Follow these steps to create a new webview:

### 1. Create the Page Component

Create a new React component in `pages/`:

```tsx
// src/webview/pages/MyNewPage.tsx
import React from 'react';

const MyNewPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <h1 className="text-4xl font-bold text-gray-800">My New Page</h1>
      {/* Your content here */}
    </div>
  );
};

export default MyNewPage;
```

### 2. Create the Entry Point

Create a new entry file in `entries/`:

```tsx
// src/webview/entries/mynewpage.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import MyNewPage from '../pages/MyNewPage';
import '../styles/global.css';

console.log('MyNewPage webview loaded');

function mountApp() {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <MyNewPage />
      </React.StrictMode>
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
```

### 3. Update Webpack Config

Add a new webview configuration in `webpack.config.js`:

```js
const myNewPageConfig = createWebviewConfig('mynewpage.tsx', 'mynewpage.js');

module.exports = [ 
  extensionConfig, 
  sidebarWebviewConfig, 
  quizWebviewConfig,
  myNewPageConfig  // Add your new config here
];
```

### 4. Add Command in Extension

In `src/extension.ts`, add the command registration and webview creation:

```ts
// Register command
context.subscriptions.push(
  vscode.commands.registerCommand('stormhacks.openMyNewPage', () => {
    openMyNewPagePanel(context.extensionUri);
  })
);

// Create panel function
function openMyNewPagePanel(extensionUri: vscode.Uri) {
  const panel = vscode.window.createWebviewPanel(
    'stormhacksMyNewPage',
    'My New Page',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')]
    }
  );
  
  panel.webview.html = getMyNewPageContent(panel.webview, extensionUri);
}

function getMyNewPageContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'dist', 'mynewpage.js')
  );
  const nonce = getNonce();
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}'; font-src ${webview.cspSource};">
  <title>My New Page</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}
```

### 5. Register Command in package.json

Add the command to `package.json`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "stormhacks.openMyNewPage",
        "title": "Open My New Page"
      }
    ]
  }
}
```

### 6. Build and Test

```bash
npm run compile
```

Then test your extension by pressing F5 in VS Code and running the command from the Command Palette.

## Styling

All webviews share the same Tailwind CSS configuration defined in `styles/global.css`. You can:

- Use any Tailwind utility classes in your components
- Add custom CSS if needed in the global.css file
- Extend the Tailwind config in `tailwind.config.js` at the root

## Available Dependencies

The following packages are already available:
- React & React DOM
- Tailwind CSS
- lucide-react (for icons)

## Tips

1. **Hot Reload**: Use `npm run watch` during development
2. **Dark Mode**: VS Code webviews automatically support dark mode through Tailwind's `dark:` prefix
3. **Communication**: Use `vscode.postMessage()` in webview to communicate with the extension
4. **State**: Consider using React hooks for local state management

