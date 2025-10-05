// import studyIcon from "../../../assets/calendar_icon.png";
// import tutorIcon from "../../../assets/tutor_icon.png";
// import postureIcon from "../../../assets/posture_icon.png";

interface CircleProps {
  index: number;
  onSelectedItem: (index: number) => void;
}
function CircleToggle({ index, onSelectedItem }: CircleProps) {
  return (
    <>
      <div
        className="relative max-h-full w-16 h-16 rounded-full bg-orange-100 border border-yellow-950"
        onClick={() => onSelectedItem(index)}
      ></div>
      {/* {(() => {
        var image = null;
        switch (index) {
          case 1:
            return "../../../assets/calendar_icon.png";
          case 2:
            return "../../../assets/tutor_icon.png";
          case 3:
            return "../../../assets/posture_icon.png";
          default:
            return null;
        }
      )};} */}
    </>
  );
}
export default CircleToggle;
