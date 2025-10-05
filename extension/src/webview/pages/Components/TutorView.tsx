import React, { useState, useEffect } from 'react';
import { vscode } from '../../utils/vscode-api';

function TutorView() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage = { text: inputValue, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Send message to extension
    console.log('TutorView sending message:', inputValue);
    vscode?.postMessage({
      type: 'userMessage',
      text: inputValue
    });

    setInputValue('');
  };

  useEffect(() => {
    // Listen for messages from the extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;
      
      if (message.type === 'reply') {
        setMessages(prev => [...prev, { text: message.text, isUser: false }]);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <div className="flex flex-col items-center mx-auto mt-10 w-11/12 max-w-3xl m-3 bg-white rounded-lg border border-yellow-950 shadow-md p-6">
      <h1 className="font-sans font-bold text-lg text-gray-800 mb-2">
        AI Tutor
      </h1>
      <p className="font-sans text-sm text-gray-600 mb-4">
        Ask me anything about coding, Vim, or get help with your projects!
      </p>
      
      {/* Messages area */}
      <div className="w-full h-64 overflow-y-auto mb-4 p-3 bg-gray-50 rounded border border-gray-200">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Start a conversation by typing a message below...
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-2 p-2 rounded ${
                msg.isUser
                  ? 'bg-blue-100 text-right ml-8'
                  : 'bg-gray-100 mr-8'
              }`}
            >
              <p className="text-sm text-gray-800">
                {msg.text}
              </p>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-gray-500 text-sm italic">
            AI is thinking...
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="w-full flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 disabled:bg-gray-400"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default TutorView;
