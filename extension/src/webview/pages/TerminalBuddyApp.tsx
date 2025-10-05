import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { vscode } from "../utils/vscode-api";
import QuizApp from "./QuizApp";

function TerminalBuddyApp() {
  const [command, setCommand] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  // Debug: confirm component mounted
  useEffect(() => {
    console.log("TerminalBuddyApp mounted");
  }, []);

  // Listen for messages from extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        console.log("Webview received message:", event.data);
        const { type, data } = event.data || {};
        if (type === "explanation" && data?.explanation) {
          setExplanation(data.explanation);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error handling message:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Send explain request to extension
  const handleExplain = () => {
    if (!command.trim()) return;

    setLoading(true);
    setExplanation("");

    try {
      console.log("Sending explain request to extension:", command);
      vscode?.postMessage({
        type: "explain",
        command,
      });
    } catch (err) {
      console.error("Failed to post message to extension:", err);
      setExplanation("Error sending request to extension.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "12px", fontFamily: "sans-serif", color: "#fff" }}>
      <h1 style={{ marginBottom: "12px" }}>Terminal Buddy</h1>

      {/* Cat 2 image at the top */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        {window.__MEDIA_URIS__?.cat2 && (
          <img 
            src={window.__MEDIA_URIS__.cat2} 
            alt="Cat 2" 
            style={{ width: "128px", height: "128px", objectFit: "contain" }}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter a Linux command (e.g., ls)"
          style={{ flex: 1, padding: "6px", color: "black" }}
        />
        <button onClick={handleExplain} disabled={loading}>
          {loading ? "Thinking..." : "Explain"}
        </button>
      </div>

      <div>
        {explanation ? (
          <pre
            style={{
              background: "#222",
              padding: "8px",
              borderRadius: "4px",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {explanation}
          </pre>
        ) : (
          <p>No explanation yet.</p>
        )}
      </div>

      <QuizApp></QuizApp>
    </div>
  );
}

export default TerminalBuddyApp;
