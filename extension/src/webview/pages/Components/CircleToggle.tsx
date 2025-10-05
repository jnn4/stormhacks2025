interface CircleProps {
  index: number;
}

function CircleToggle({ index }: CircleProps) {
  return (
    <div className="relative max-h-full w-16 h-16 rounded-full bg-orange-200 border border-yellow-950"></div>
  );
}
export default CircleToggle;
