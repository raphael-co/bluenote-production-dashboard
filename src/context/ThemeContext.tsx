import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Définir le type du contexte
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  collapsed: boolean;
  handleCollapseToggle: () => void;
  drawerWidth: number;
  collapsedDrawerWidth: number;
}

// Créer un contexte
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'dark';
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Initialiser l'état collapsed en fonction de la largeur de l'écran
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return window.innerWidth > 600; // collapsed sera true si l'écran est plus large que 600px
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);

  const drawerWidth = 240;
  const collapsedDrawerWidth = 60;

  // Fonction pour changer le thème
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('app-theme', newTheme); // Stocker dans le localStorage
      return newTheme;
    });
  };

  // Effet pour initialiser le thème à partir du localStorage au montage du composant
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  // Mettre à jour `collapsed` lors du redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setCollapsed(window.innerWidth < 600);
    };
    handleResize()

  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mobileOpen, handleDrawerToggle, collapsed, handleCollapseToggle, drawerWidth, collapsedDrawerWidth }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
