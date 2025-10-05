import React, { useState, useEffect } from 'react';

const SidebarApp: React.FC = () => {
  const handleLogin = () => {
    vscode.postMessage({ command: 'login' });
  };

  const handleLogout = () => {
    vscode.postMessage({ command: 'logout' });
  };

  useEffect(() => {
    console.log('SidebarApp component mounted!');
  }, []);

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="px-3 py-3">
        <div className="max-w-full">
          <button className="bg-blue-500 text-white p-2 rounded-md" onClick={() => {
            handleLogin();
          }}>Login</button>
          <button className="bg-red-500 text-white p-2 rounded-md" onClick={() => {
            handleLogout();
          }}>Logout</button>
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

export default SidebarApp;

