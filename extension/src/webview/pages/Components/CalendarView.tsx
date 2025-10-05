import CalendarCardView from "./CalendarCardView";

function CalendarView() {
  const monthList = [
    "January",
    "Feburary",
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

  //Array to track which on is in the current month
  var calendarDays: { isCurrentMonth: boolean; day: number }[] = [];

  //Not in this month - Beginning
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push({ isCurrentMonth: false, day: i });
  }

  //In this month
  for (let i = 0; i < lastDate - 1; i++) {
    calendarDays.push({ isCurrentMonth: true, day: i + 1 });
  }

  //Not in this month - Last
  for (let i = 0; i < 7 - lastDay; i++) {
    calendarDays.push({ isCurrentMonth: false, day: i });
  }

  return (
    <>
      <div className="flex flex-col items-center mx-auto mt-10 w-11/12 max-w-3xl h-[30vh] m-3 bg-white rounded-lg border border-yellow-950 shadow-md">
        <h1 className="font-sans font-bold text-lg text-gray-800">
          {currentMonth}
        </h1>
        <p className="font-sans font-normal text-sm text-gray-800">
          Track your coding progress
        </p>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => (
            <CalendarCardView
              key={index}
              isCurrentMonth={item.isCurrentMonth}
              day={item.day}
            ></CalendarCardView>
          ))}
        </div>
      </div>
    </>
  );
}
export default CalendarView;
