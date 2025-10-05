import React, { useState, useEffect } from "react";
import StudyBuddyApp from "./StudyBuddyApp";
import TerminalBuddyApp from "./TerminalBuddyApp";

const SidebarApp: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    vscode.postMessage({ command: 'login' });
  };

  const handleLogout = () => {
    vscode.postMessage({ command: 'logout' });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Send message to extension
    vscode.postMessage({
      type: 'userMessage',
      text: inputValue
    });

    setInputValue('');
  };

  useEffect(() => {
    console.log('SidebarApp component mounted!');

    // Listen for messages from the extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      
      if (message.type === 'reply') {
        setMessages(prev => [...prev, { text: message.text, isUser: false }]);
        setIsLoading(false);
      }
      
      if (message.command === 'authStatusChanged') {
        console.log('Auth status changed:', message.isAuthenticated);
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  //App State 1 = Buddy, 2 = Terminal
  const [appState, setAppState] = useState(1);

  //Change to BuddyApp
  function handleBuddy() {
    setAppState(1);
  }

  //Change to Terminal App
  function handleTerminal() {
    setAppState(2);
  }

  return (
    <div>
      <div className="relative p-10 bg-white">
        <div className="absolute w-full bottom-0 left-0 h-0.5 border-yellow-950"></div>
        <div className="max-w-full">
          {/* Auth buttons */}
          <div className="flex gap-2 mb-4">
            <button 
              className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600" 
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          {/* Chat interface */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">
              Stormhacks AI Assistant
            </h3>
            
            {/* Messages area */}
            <div className="h-64 overflow-y-auto mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              {messages.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Ask me anything about coding, Vim, or get help with your projects!
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded ${
                      msg.isUser
                        ? 'bg-blue-100 dark:bg-blue-900 text-right'
                        : 'bg-gray-100 dark:bg-gray-600'
                    }`}
                  >
                    <p className="text-sm text-gray-800 dark:text-white">
                      {msg.text}
                    </p>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="text-gray-500 dark:text-gray-400 text-sm">
                  AI is thinking...
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
              >
                Send
              </button>
            </div>
          </div>
        </div>
        <div
          className="absolute top-0 left-0 w-1/2 h-full border border-yellow-950"
          onClick={handleBuddy}
        ></div>
        <div
          className="absolute top-0 right-0 w-1/2 h-full border border-yellow-950"
          onClick={handleTerminal}
        ></div>
      </div>
      {appState == 1 ? <StudyBuddyApp /> : <TerminalBuddyApp />}
    </div>
  );
};

export default SidebarApp;
