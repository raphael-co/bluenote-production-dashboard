import React from 'react';

interface CustomMenuIconProps {
  color?: string;
}

const CustomMenuIconClose: React.FC<CustomMenuIconProps> = ({ color = 'currentColor' }) => {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-1slccg-MuiSvgIcon-root"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="MenuOpenIcon"
      fill={color} // Ajout de la prop couleur ici
    >
      <path d="M3 18h13v-2H3zm0-5h10v-2H3zm0-7v2h13V6zm18 9.59L17.42 12 21 8.41 19.59 7l-5 5 5 5z"></path>
    </svg>
  );
};

export default CustomMenuIconClose;
