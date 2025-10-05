interface CircleProps {
  index: number;
  onSelectedItem: (index: number) => void;
}

function CircleToggle({ index, onSelectedItem }: CircleProps) {
  // Get the appropriate icon based on index
  const getIconSrc = () => {
    switch (index) {
      case 0:
        return window.__MEDIA_URIS__?.calendarIcon;
      case 1:
        return window.__MEDIA_URIS__?.tutorIcon;
      case 2:
        return window.__MEDIA_URIS__?.postureIcon;
      default:
        return undefined;
    }
  };

  const iconSrc = getIconSrc();

  return (
    <>
      <div
        className="relative max-h-full w-16 h-16 rounded-full bg-orange-100 border border-yellow-950 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => onSelectedItem(index)}
      >
        {iconSrc && (
          <img 
            src={iconSrc} 
            alt="Icon" 
            className="w-10 h-10 object-contain"
          />
        )}
      </div>
    </>
  );
}

export default CircleToggle;
