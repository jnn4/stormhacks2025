import React, { useState, useEffect } from 'react';
import './App.css';

declare global {
  interface Window {
    acquireVsCodeApi?: <T = any>() => {
      postMessage: (message: T) => void;
      getState: () => T;
      setState: (state: T) => void;
    };
  }
}


const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);

  const sendMessage = () => {
    if (!searchTerm.trim()) return;

    console.log("Message to send:", searchTerm);

    setMessages((prev) => [...prev, { from: "You", text: searchTerm }]);

    if (window.acquireVsCodeApi) {
      const vscode = window.acquireVsCodeApi();
      console.log("Posting message to extension host:", searchTerm); // <-- debug
      vscode.postMessage({
        type: "userMessage",
        text: searchTerm,
    });
}
    setSearchTerm("");
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("Webview received message:", event.data);

      if (event.data.type === "reply") {
        setMessages((prev) => [...prev, { from: "Bot", text: event.data.text }]);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-3 py-3">
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              Stormhacks
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Mastering Vim commands
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search commands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="absolute right-2 top-1.5 text-gray-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Command Cards */}
          <div className="space-y-2">
            <CommandCard
              title="Navigation"
              commands={[
                { key: 'h, j, k, l', desc: 'Move left, down, up, right' },
                { key: 'w, b', desc: 'Move forward/backward by word' },
                { key: 'gg, G', desc: 'Go to start/end of file' },
                { key: '0, $', desc: 'Go to start/end of line' },
              ]}
            />
            <CommandCard
              title="Editing"
              commands={[
                { key: 'i, a', desc: 'Insert before/after cursor' },
                { key: 'o, O', desc: 'Open new line below/above' },
                { key: 'd, dd', desc: 'Delete (with motion)/line' },
                { key: 'y, yy', desc: 'Yank (copy) with motion/line' },
              ]}
            />
            <CommandCard
              title="Visual Mode"
              commands={[
                { key: 'v', desc: 'Character-wise visual mode' },
                { key: 'V', desc: 'Line-wise visual mode' },
                { key: 'Ctrl+v', desc: 'Block-wise visual mode' },
                { key: 'gv', desc: 'Reselect last visual selection' },
              ]}
            />
            <CommandCard
              title="Search & Replace"
              commands={[
                { key: '/', desc: 'Search forward' },
                { key: '?', desc: 'Search backward' },
                { key: 'n, N', desc: 'Next/previous search match' },
                { key: ':%s/old/new/g', desc: 'Replace all in file' },
              ]}
            />
          </div>

          {/* Quick Tips */}
          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded shadow">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-2">
              Quick Tips
            </h2>
            <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-500 mr-1.5">•</span>
                <span><kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to normal mode</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-1.5">•</span>
                <span><kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">u</kbd> undo, <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">Ctrl+r</kbd> redo</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-1.5">•</span>
                <span>Number + command (e.g., <kbd className="px-1 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">5dd</kbd>)</span>
              </li>
            </ul>
          </div>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff",
              borderRadius: "6px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <h2 style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "6px" }}>
              Chat with Bot
            </h2>
            <div style={{ display: "flex", marginBottom: "8px" }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  flex: 1,
                  width: "200px",
                  padding: "6px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  border: "1px solid gray",
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  marginLeft: "6px",
                  padding: "6px 12px",
                  backgroundColor: "#7c3aed",
                  color: "#fff",
                  borderRadius: "4px",
                  fontSize: "12px",
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Send
              </button>
            </div>
            <div
              style={{
                maxHeight: "160px",
                overflowY: "auto",
                borderTop: "1px solid #ddd",
                paddingTop: "4px",
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} style={{ fontSize: "12px", marginBottom: "2px" }}>
                  <strong>{msg.from}:</strong> {msg.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface Command {
  key: string;
  desc: string;
}

interface CommandCardProps {
  title: string;
  commands: Command[];
}

const CommandCard: React.FC<CommandCardProps> = ({ title, commands }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded shadow p-3">
      <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-2">
        {title}
      </h3>
      <div className="space-y-1.5">
        {commands.map((cmd, idx) => (
          <div key={idx} className="flex flex-col">
            <code className="text-purple-600 dark:text-purple-400 font-mono text-xs font-semibold">
              {cmd.key}
            </code>
            <span className="text-gray-600 dark:text-gray-300 text-xs">
              {cmd.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

