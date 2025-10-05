import React, { useState, useEffect } from "react";
import StudyBuddyApp from "./StudyBuddyApp";
import TerminalBuddyApp from "./TerminalBuddyApp";

const SidebarApp: React.FC = () => {
  useEffect(() => {
    console.log("SidebarApp component mounted!");
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
      <div className="relative p-10 ">
        <div className="absolute w-full bottom-0 left-0 h-0.5 border-yellow-950"></div>
        <div
          className="bg-white absolute top-0 left-0 w-1/2 h-full border border-yellow-950"
          onClick={handleBuddy}
        ></div>
        <div
          className="bg-#222 absolute top-0 right-0 w-1/2 h-full border border-yellow-950"
          onClick={handleTerminal}
        ></div>
      </div>
      {appState == 1 ? <StudyBuddyApp /> : <TerminalBuddyApp />}
    </div>
  );
};

export default SidebarApp;
