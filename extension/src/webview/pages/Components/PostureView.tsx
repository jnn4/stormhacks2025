import { useState, useEffect } from "react";
import { vscode } from "../../utils/vscode-api";

function PostureView() {
  const [minutes, setMinutes] = useState(30);
  const [isActive, setIsActive] = useState(false);

  // Listen for messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.command === "postureStatus") {
        setIsActive(message.isActive);
        if (message.minutes !== undefined) {
          setMinutes(message.minutes);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    
    // Request current status when component loads
    if (vscode) {
      vscode.postMessage({ command: "getPostureStatus" });
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleStartTimer = () => {
    if (vscode && minutes > 0) {
      vscode.postMessage({ command: "startPostureReminder", minutes });
      setIsActive(true);
    }
  };

  const handleStopTimer = () => {
    if (vscode) {
      vscode.postMessage({ command: "stopPostureReminder" });
      setIsActive(false);
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setMinutes(value);
      // If timer is active, update it
      if (isActive && vscode) {
        vscode.postMessage({ command: "updatePostureReminder", minutes: value });
      }
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mx-auto mt-10 w-11/12 max-w-3xl m-3 bg-white rounded-lg border border-yellow-950 shadow-md p-10">
        <h1 className="font-sans font-bold text-lg text-gray-800">
          Posture Reminder
        </h1>
        <p className="font-sans text-base text-gray-800">
          Set a regular reminder to adjust your posture.
        </p>
        <div className="flex flex-col items-center mx-auto pt-10 gap-4">
          <p className="font-sans text-xl text-gray-800">Remind me every</p>
          <input
            type="number"
            min="1"
            value={minutes}
            onChange={handleMinutesChange}
            className="bg-yellow-100 border rounded-lg p-2 text-gray-800 text-center w-24"
          />
          <p className="font-sans text-xl text-gray-800">minutes</p>
          <div className="flex gap-4 mt-4">
            {!isActive ? (
              <button 
                onClick={handleStartTimer}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded"
              >
                Start Reminders
              </button>
            ) : (
              <button 
                onClick={handleStopTimer}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
              >
                Stop Reminders
              </button>
            )}
          </div>
          {isActive && (
            <p className="font-sans text-sm text-green-600 mt-2">
              ✓ Posture reminders are active
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default PostureView;
