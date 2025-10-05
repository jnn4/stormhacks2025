import CircleToggle from "./Components/CircleToggle";

function StudyBuddyApp() {
  const toggleItems = ["progress, tutor", "posture", "theme"];

  return (
    <>
      <div className="bg-[url('../../assets/bg_sudo.jpg')] h-screen bg-no-repeat bg-cover">
        <div className="flex justify-center space-x-4 p-4">
          {toggleItems.map((_, index) => (
            <CircleToggle index={index} key={index}></CircleToggle>
          ))}
        </div>
      </div>
    </>
  );
}

export default StudyBuddyApp;
