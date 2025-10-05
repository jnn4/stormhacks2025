import { useEffect, useState } from "react";
import CalendarCardView from "./CalendarCardView";
import { vscode } from "../../utils/vscode-api";

interface TypingSession {
  typing_id: string;
  started_at: string;
  ended_at: string | null;
  language_tag: string;
}

interface DayFrequency {
  [day: number]: number;
}

function CalendarView() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dayFrequencies, setDayFrequencies] = useState<DayFrequency>({});
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(false);
  const [requestId, setRequestId] = useState(0);
  const monthList = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const currentMonthIndex = new Date().getMonth();
  const currentMonth = monthList[currentMonthIndex];
  const currentYear = new Date().getFullYear();
  const firstDay = new Date(currentYear, currentMonthIndex, 1).getDay();
  const lastDate = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const lastDay = new Date(currentYear, currentMonthIndex + 1, 0).getDay();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Listen for messages from the extension
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      
      if (message.command === 'authStatus') {
        setIsAuthenticated(message.isAuthenticated);
        setIsLoading(false);
        setIsTrackingEnabled(message.isTrackingEnabled || false);
        
        // If authenticated, fetch typing sessions
        if (message.isAuthenticated) {
          fetchTypingSessions();
        }
      }
      
      if (message.command === 'apiResponse' && message.requestId === requestId) {
        if (message.success) {
          processTypingSessions(message.data.sessions);
        } else {
          console.error('Failed to fetch typing sessions:', message.error);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [requestId]);

  const checkAuthStatus = () => {
    vscode?.postMessage({
      command: 'getAuthStatus'
    });
  };

  const fetchTypingSessions = () => {
    const newRequestId = Date.now();
    setRequestId(newRequestId);
    
    vscode?.postMessage({
      command: 'apiRequest',
      requestId: newRequestId,
      endpoint: '/api/activity/sessions',
      method: 'GET'
    });
  };

  const processTypingSessions = (sessions: TypingSession[]) => {
    const frequencies: DayFrequency = {};
    
    // Calculate frequency for each day of the current month
    sessions.forEach(session => {
      const sessionDate = new Date(session.started_at);
      if (sessionDate.getMonth() === currentMonthIndex && 
          sessionDate.getFullYear() === currentYear) {
        const day = sessionDate.getDate();
        frequencies[day] = (frequencies[day] || 0) + 1;
      }
    });
    
    // Normalize frequencies to 0-4 scale
    const maxFrequency = Math.max(...Object.values(frequencies), 1);
    const normalizedFrequencies: DayFrequency = {};
    
    Object.keys(frequencies).forEach(day => {
      const freq = frequencies[parseInt(day)];
      normalizedFrequencies[parseInt(day)] = Math.min(4, Math.floor((freq / maxFrequency) * 4));
    });
    
    setDayFrequencies(normalizedFrequencies);
  };

  const handleLogin = () => {
    vscode?.postMessage({
      command: 'login'
    });
    // After login, re-check auth status
    setTimeout(() => checkAuthStatus(), 1000);
  };

  const toggleTracking = () => {
    vscode?.postMessage({
      command: 'toggleTracking'
    });
    // Re-check auth status to get updated tracking state
    setTimeout(() => checkAuthStatus(), 500);
  };

  //Array to track which on is in the current month
  var calendarDays: { isCurrentMonth: boolean; day: number; frequency?: number }[] = [];

  //Not in this month - Beginning
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ isCurrentMonth: false, day: i });
  }

  //In this month
  for (let i = 1; i <= lastDate; i++) {
    calendarDays.push({ 
      isCurrentMonth: true, 
      day: i,
      frequency: dayFrequencies[i] || 0
    });
  }

  //Not in this month - Last
  for (let i = 0; i < 6 - lastDay; i++) {
    calendarDays.push({ isCurrentMonth: false, day: i });
  }

  return (
    <>
      <div className="flex flex-wrap flex-col items-center mx-auto mt-10 w-11/12 max-w-3xl m-3 bg-white rounded-lg border border-yellow-950 shadow-md">
        <h1 className="font-sans font-bold text-lg text-gray-800">
          {currentMonth}
        </h1>
        <p className="font-sans font-normal text-sm text-gray-800">
          Track your coding progress
        </p>
        
        {/* Authentication and tracking controls */}
        <div className="flex flex-col items-center gap-2 my-3">
          {isLoading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : !isAuthenticated ? (
            <button 
              onClick={handleLogin}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Login to track activity
            </button>
          ) : (
            <button 
              onClick={toggleTracking}
              className={`px-4 py-2 rounded transition-colors ${
                isTrackingEnabled 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isTrackingEnabled ? 'Stop Tracking' : 'Start Tracking'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => (
            <CalendarCardView
              key={index}
              isCurrentMonth={item.isCurrentMonth}
              day={item.day}
              frequency={item.frequency}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2 p-5">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-500 border border-gray-600"></div>
            <p className="font-sans font-normal text-sm text-gray-800">
              Not Available
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white border border-yellow-950"></div>
            <div className="w-5 h-5 bg-blue-200 border border-yellow-950"></div>
            <div className="w-5 h-5 bg-blue-300 border border-yellow-950"></div>
            <div className="w-5 h-5 bg-blue-400 border border-yellow-950"></div>
            <div className="w-5 h-5 bg-blue-500 border border-yellow-950"></div>
            <p className="font-sans font-normal text-sm text-gray-800 ml-2">
              Less → More Activity
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
export default CalendarView;
