import { useState } from "react";
import { API_BASE_URL } from "../config";

export default function TerminalBuddy() {
  const [command, setCommand] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExplain = async () => {
    if (!command.trim()) return;

    setLoading(true);
    setExplanation("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/terminal/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      const data = await res.json();
      setExplanation(data.explanation || "No explanation found.");
    } catch (err) {
      setExplanation("Error fetching explanation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-400">
        🧠 Terminal Buddy
      </h2>

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
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Explain"}
        </button>
      </div>

      {explanation && (
        <pre className="bg-gray-800 p-4 rounded whitespace-pre-wrap text-sm overflow-y-auto max-h-96 border border-gray-700">
          {explanation}
        </pre>
      )}
    </div>
  );
}