import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-markdown-editor-lite/lib/index.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './context/ProtectedRoute';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import LoginPage from './screen/auth/LoginPage';
import { lightTheme, darkTheme } from './themeApp';
import DashboardPage from './screen/dashboard/DashboardPage';
import MapScreen from './screen/map';
import Annoncement from './screen/annoncement/annoncement';
import EditMarker from './componnent/EditMarker/EditMarker';
import { SnackbarProvider } from 'notistack';
import {
  Box, CssBaseline, Toolbar, AppBar, IconButton, Typography, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CustomDrawer from './componnent/Drawer';
import UsersReports from './screen/reports/users';
import Users from './screen/tabs/Users';
import Markers from './screen/tabs/Markers';
import AnnouncementsTable from './screen/tabs/Announcements';
import MarkersReports from './screen/reports/markers';
import Documentation from './screen/documentation';


const AppContent: React.FC = () => {
  const { theme, toggleTheme, mobileOpen, collapsed, handleDrawerToggle, handleCollapseToggle, drawerWidth, collapsedDrawerWidth } = useTheme();
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  // const [mobileOpen, setMobileOpen] = useState(false);
  // const [collapsed, setCollapsed] = useState(true);
  // const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  // const handleCollapseToggle = () => setCollapsed(!collapsed);

  const handleThemeChange = () => {
    toggleTheme();
  };

  useEffect(() => {
    // Assurez-vous que la variable `currentStyles` contient la propriété `background`
    if (currentTheme && currentTheme.backgroundColor) {
      document.body.style.background = currentTheme.backgroundColor;
    }

    // Nettoyage lors du démontage ou du changement de thème pour éviter des effets indésirables
    return () => {
      document.body.style.background = ''; // Réinitialiser si nécessaire
    };
  }, [currentTheme]);

  // const drawerWidth = 240;
  // const collapsedDrawerWidth = 60;

  return (
    <Box sx={{ display: 'flex', width: '100%', backgroundColor: currentTheme.backgroundColor }}>
      <CssBaseline />
      <AppBar
        style={{ backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color }}
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? 60 : 240}px)` },
          ml: { sm: `${collapsed ? 60 : 240}px` },
          transition: 'width 0.3s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography style={{ width: '100%' }} variant="h5" noWrap component="div">
            Map Point
          </Typography>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <Button color="inherit" onClick={handleThemeChange}>
              {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            </Button>
          </div>
        </Toolbar>
      </AppBar>


      <Box
        // style={{ backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color }}
        component="nav"
        sx={{ width: { sm: collapsed ? collapsedDrawerWidth : drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s', }}
        aria-label="mailbox folders"
        style={{ background: 'transparent' }}
      >
        <CustomDrawer
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
          collapsed={collapsed}
          handleCollapseToggle={handleCollapseToggle}
        />

      </Box>

      <Box
        style={{ width: '100%', height: '100%', backgroundColor: currentTheme.backgroundColor, color: currentTheme.color, flex: 1, padding: 0 }}
        component="main"
        sx={{
          transition: 'width 0.3s ease',
          width: collapsed ? `calc(100% - 60px)` : `calc(100% - 240px)`,
          overflow: 'hidden',
        }}
      >
        <Toolbar />
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/reports/users" element={<ProtectedRoute><UsersReports /></ProtectedRoute>} />
            <Route path="/tabs/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            <Route path="/tabs/markers" element={<ProtectedRoute><Markers /></ProtectedRoute>} />
            <Route path="/tabs/announcements" element={<ProtectedRoute><AnnouncementsTable /></ProtectedRoute>} />
            <Route path="/reports/markers" element={<ProtectedRoute><MarkersReports /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapScreen /></ProtectedRoute>} />
            <Route path="/announcements" element={<ProtectedRoute><Annoncement /></ProtectedRoute>} />
            <Route path="/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
            <Route path="/create-documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
            <Route path="/markers/edit/:id" element={<ProtectedRoute><EditMarker /></ProtectedRoute>} />
          </Routes>
        </div>
      </Box>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <SnackbarProvider maxSnack={3}>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </SnackbarProvider>
  );
};

export default App;
