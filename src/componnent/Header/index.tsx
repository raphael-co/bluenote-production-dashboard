// Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Button, Typography, useMediaQuery, useTheme as useMuiTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { darkTheme, lightTheme } from './theme/themeHeader'; // Import des thèmes

const Header: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;
    const muiTheme = useMuiTheme(); // Utilise le thème de Material-UI pour gérer les breakpoints
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md')); // Détecte si l'écran est petit (md ou moins)

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleThemeChange = () => {
        toggleTheme();
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        setIsMenuOpen(true);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setIsMenuOpen(false);
    };

    return (
        <AppBar position="static" style={currentTheme.header}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    MapPoint
                </Typography>
                {/* Cacher les boutons de navigation sur mobile */}
                {!isMobile && (
                    <>
                        <Button color="inherit" onClick={handleThemeChange}>
                            {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                        </Button>

                        {isAuthenticated ? (
                            <>
                                <Button color="inherit" component={Link} to="/dashboard" style={currentTheme.navLink}>
                                    Dashboard
                                </Button>
                                <MenuItem key="annoncement" onClick={handleMenuClose} component={Link} to="/annoncement">
                                    Annoncement
                                </MenuItem>
                                <Button color="inherit" component={Link} to="/map" style={currentTheme.navLink}>
                                    Map
                                </Button>
                                <Button color="inherit" onClick={logout} style={currentTheme.navButton}>
                                    Se déconnecter
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button color="inherit" component={Link} to="/" style={currentTheme.navLink}>
                                    Accueil
                                </Button>
                                <Button color="inherit" component={Link} to="/login" style={currentTheme.navLink}>
                                    Connexion
                                </Button>
                            </>
                        )}
                    </>
                )}
                {isMobile && (
                    <>
                        <IconButton edge="end" color="inherit" aria-label="menu" onClick={handleMenuClick}>
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            open={isMenuOpen}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleMenuClose} style={{ width: '100%' }}>
                                <Button color="inherit" onClick={handleThemeChange}>
                                    {theme === 'light' ? 'Mode sombre' : 'Mode clair'}
                                </Button>
                            </MenuItem>
                            {isAuthenticated ? (
                                [
                                    <MenuItem key="dashboard" onClick={handleMenuClose} component={Link} to="/dashboard">
                                        Dashboard
                                    </MenuItem>,
                                    <MenuItem key="annoncement" onClick={handleMenuClose} component={Link} to="/annoncement">
                                        Annoncement
                                    </MenuItem>,
                                    <MenuItem key="map" onClick={handleMenuClose} component={Link} to="/map">
                                        Map
                                    </MenuItem>,
                                    <MenuItem key="logout" onClick={logout}>Se déconnecter</MenuItem>
                                ]
                            ) : (
                                [
                                    <MenuItem key="accueil" onClick={handleMenuClose} component={Link} to="/">
                                        Accueil
                                    </MenuItem>,
                                    <MenuItem key="login" onClick={handleMenuClose} component={Link} to="/login">
                                        Connexion
                                    </MenuItem>
                                ]
                            )}
                        </Menu>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
