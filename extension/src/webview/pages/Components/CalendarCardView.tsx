interface cardViewProps {
  isCurrentMonth: boolean;
  day: number;
  frequency?: number; // 0-4 representing activity level
}

function CalendarCardView({ isCurrentMonth, day, frequency = 0 }: cardViewProps) {
  // Map frequency levels to colors
  const getFrequencyColor = () => {
    if (!isCurrentMonth) return 'bg-gray-500';
    
    switch (frequency) {
      case 0: return 'bg-white';
      case 1: return 'bg-blue-200';
      case 2: return 'bg-blue-300';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-500';
      default: return 'bg-white';
    }
  };

  if (isCurrentMonth)
    return (
      <div className={`flex justify-center font-sans text-black m-2 w-5 h-5 ${getFrequencyColor()} border border-yellow-950 rounded-sm shadow-md`}>
        {day}
      </div>
    );
  else return <div className="m-2 w-5 h-5 bg-gray-500 border shadow-md"></div>;
}

export default CalendarCardView;
