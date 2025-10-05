interface cardViewProps {
  isCurrentMonth: boolean;
  day: number;
}

function CalendarCardView({ isCurrentMonth, day }: cardViewProps) {
  if (isCurrentMonth)
    return (
      <div className="flex justify-center font-sans text-black m-2 w-5 h-5 bg-white border border-yellow-950 rounded-sm shadow-md">
        {day}
      </div>
    );
  else return <div className="m-2 w-5 h-5 bg-gray-500 border shadow-md"></div>;
}

export default CalendarCardView;
