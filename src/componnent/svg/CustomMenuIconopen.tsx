import React from 'react';

interface CustomMenuIconProps {
  color?: string;
}

const CustomMenuIconOpen: React.FC<CustomMenuIconProps> = ({ color = 'currentColor' }) => {
  return (
    <svg
      className="MuiSvgIcon-root MuiSvgIcon-fontSizeMedium css-1slccg-MuiSvgIcon-root"
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      data-testid="MenuIcon"
      fill={color} // Ajout de la prop couleur ici
    >
      <path d="M3 18h18v-2H3zm0-5h18v-2H3zm0-7v2h18V6z"></path>
    </svg>
  );
};

export default CustomMenuIconOpen;
