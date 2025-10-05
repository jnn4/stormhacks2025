import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function TerminalBuddyApp() {
  const [searchTerm, setSearchTerm] = useState("");
  const [command, setCommand] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("TerminalBuddyApp component mounted!");
  }, []);

const handleExplain = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setExplanation("");

    try {
        console.log('Attempting to fetch from:', `${API_BASE_URL}/api/terminal/explain`);
        console.log('Command:', command);

        const res = await fetch(`${API_BASE_URL}/api/terminal/explain`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ command }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error('API Error:', {
                status: res.status,
                statusText: res.statusText,
                body: errorText
            });
            throw new Error(`API returned ${res.status}: ${errorText}`);
        }

        const data = await res.json();
        console.log('API Response:', data);

        if (data.status === 'error') {
            throw new Error(data.error || 'Unknown error occurred');
        }

        setExplanation(data.explanation || "No explanation found.");
    } catch (error: unknown) {
        console.error('Fetch error:', error);
        setExplanation(
            error instanceof Error 
                ? `Error: ${error.message}`
                : "An unknown error occurred"
        );
    } finally {
        setLoading(false);
    }
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

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-3 py-3">
        <div className="max-w-full">
          {/* Header */}
          <div className="mb-3">
            <h1 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
              Terminal Buddy
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Mastering Terminal Commands
            </p>
          </div>

          {/* Command Explainer Section */}
          <div className="mb-6 bg-gray-900 p-4 rounded-lg">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Enter a Linux command (e.g., ls)"
                className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
              />
              <button
                onClick={handleExplain}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white"
                disabled={loading}
              >
                {loading ? "Thinking..." : "Explain"}
              </button>
            </div>

            {explanation && (
              <pre className="bg-gray-800 p-4 rounded whitespace-pre-wrap text-sm overflow-y-auto max-h-96 border border-gray-700 text-white">
                {explanation}
              </pre>
            )}
          </div>

          {/* Search Bar */}
          <div className="mb-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search command reference..."
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
          {/* ...existing command cards code... */}

          {/* Quick Tips */}
          {/* ...existing quick tips code... */}
        </div>
      </div>
    </div>
  );
}

export default TerminalBuddyApp;