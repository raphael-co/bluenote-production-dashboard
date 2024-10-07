import React from 'react';

interface CustomMarkerProps {
  fillColor?: string;  // Prop to change the color of the marker
  size?: number;       // Prop to adjust the size of the marker
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ fillColor = '#4CAF50', size = 64 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#000000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Outer pin shape */}
      <path
        fill={fillColor}
        d="M12 2C8.1 2 5 5.1 5 9c0 5.3 7 13 7 13s7-7.7 7-13c0-3.9-3.1-7-7-7z"
      />
      {/* Inner circle */}
      <circle fill="#ffffff" cx="12" cy="9" r="3" />
    </svg>
  );
};

export default CustomMarker;
