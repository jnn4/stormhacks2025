import { useState } from "react";
import CircleToggle from "./Components/CircleToggle";
import CalendarView from "./Components/CalendarView";
import TutorView from "./Components/TutorView";
import PostureView from "./Components/PostureView";

function StudyBuddyApp() {
  const toggleItems = ["progress, tutor", "posture", "theme"];
  const [selectedOption, setSelectedOption] = useState(-1);

  function handleSelected(index: number) {
    setSelectedOption(index);
  }

  const introMessage = () => {
    return (
      <div className="text-center mx-auto">
        <h1 className="font-sans font-bold text-3xl text-gray-800">
          Say Hi to Sudo!
        </h1>
        <p className="font-sans text-lg text-gray-800 w-auto">
          Choose track your study progress, study with a tutor or fix your
          posture with a reminder
        </p>
      </div>
    );
  };

  // const trackMessage = () => {
  //   return (
  //     <p className="text-center mx-auto font-sans text-base text-gray-800 w-auto">
  //       Your progress will be based on how much you edit your code in the
  //       current month
  //     </p>
  //   );
  // };

  const trackMessage = () => {
    return null;
  };

  return (
    <>
      <div className="bg-[url('../../assets/images/bg_sudo.jpg')] min-h-screen bg-no-repeat bg-cover flex-grow">
        <div className="flex justify-center space-x-10 p-10">
          {toggleItems.map((_, index) => (
            <CircleToggle
              key={index}
              index={index}
              onSelectedItem={handleSelected}
            ></CircleToggle>
          ))}
        </div>

        {selectedOption == -1 ? introMessage() : trackMessage()}

        <div className="flex justify-center p-5">
          {(() => {
            switch (selectedOption) {
              case 0:
                return <CalendarView></CalendarView>;
              case 1:
                return <TutorView></TutorView>;
              case 2:
                return <PostureView></PostureView>;
              default:
                return (
                  <p className="font-sans text-lg text-gray-800">
                    Please choose your options
                  </p>
                );
            }
          })()}
        </div>

        {/* <div className="relative bottom-0 top-0">
          <div className="relative bottom-0 left-0 w-10 h-10 rounded-full bg-red-100 border border-yellow-950">
            <p className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-sans font-bold text-sm text-gray-800">
              ?
            </p>
          </div>
        </div> */}
      </div>
    </>
  );
}

export default StudyBuddyApp;
