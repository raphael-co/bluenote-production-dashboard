import React, { useState } from 'react';
import {
    Toolbar, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton,
    Collapse, Drawer
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../themeApp';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import CustomMenuIconClose from '../svg/CustomMenuIconClose';
import CustomMenuIconOpen from '../svg/CustomMenuIconopen';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ListAltIcon from '@mui/icons-material/ListAlt';

import RecentActorsIcon from '@mui/icons-material/RecentActors';

import DashboardIcon from '@mui/icons-material/Dashboard';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';
import { useAuth } from '../../context/AuthContext';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';

interface CustomDrawerProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    collapsed: boolean;
    handleCollapseToggle: () => void;
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({ mobileOpen, handleDrawerToggle, collapsed, handleCollapseToggle }) => {
    const { theme, drawerWidth, collapsedDrawerWidth } = useTheme();
    const navigate = useNavigate();
    const {  isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const [openTabs, setOpenTabs] = useState(false);
    const handleTabsClick = () => {
        setOpenTabs(!openTabs);
    };
    const activeStyle = {
        color: currentTheme.iconColorActive,
    };


    // const getTitleFromUrl = () => {
    //     const params = new URLSearchParams(location.search);
    //     return params.get('title');
    // };

    const handleLogout = () => {
        const confirmLogout = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');

        if (confirmLogout) {
            logout();
            navigate('/login');
        }
    };

    const drawerContent = (
        <div style={{ backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color }}>
            <Toolbar style={{ padding: 0 }}>
                <Toolbar>
                    {/* Collapse button hidden on mobile */}
                    <IconButton
                        onClick={handleCollapseToggle}
                        sx={{ position: 'absolute', bottom: '10px', left: '10px', display: { xs: 'none', sm: 'block' }, zIndex: 100 }}
                    >
                        {collapsed ? (
                            <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                <CustomMenuIconOpen color={currentTheme.iconColor} />
                            </div>
                        ) : (
                            <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                <CustomMenuIconClose color={currentTheme.iconColorActive} />
                            </div>
                        )}
                    </IconButton>
                </Toolbar>
            </Toolbar>
            <Divider />
            <List>
                <ListItemButton
                    onClick={() => navigate('/dashboard')}
                    style={location.pathname === '/dashboard' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/dashboard' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <DashboardIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Dashboard" />}
                </ListItemButton>

                <ListItemButton
                    onClick={() => navigate('/about')}
                    style={location.pathname === '/about' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/about' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <EditNotificationsIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="About" />}
                </ListItemButton>

                <ListItemButton
                    onClick={() => navigate('/work')}
                    style={location.pathname === '/work' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/work' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <EditNotificationsIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Work" />}
                </ListItemButton>
                
                <ListItemButton
                    onClick={() => navigate('/create-documentation')}
                    style={location.pathname === '/create-documentation' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/create-documentation' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <EditNoteIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Documentation" />}
                </ListItemButton>


            </List>
            <Divider />
            <ListItemButton
                onClick={handleTabsClick}
                style={{ minWidth: 'auto', ...(location.pathname.startsWith('/tabs/') && !openTabs ? activeStyle : { color: currentTheme.iconColor }) }}
            >
                <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname.startsWith('/tabs/') && !openTabs ? activeStyle : { color: currentTheme.iconColor }) }}>
                    <ListAltIcon />
                </ListItemIcon>
                {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Tabs" />}
                {openTabs ? (
                    <ExpandLess
                        style={{
                            color: currentTheme.iconColorActive,
                            // marginLeft: collapsed ? '18px' : '0px',
                            transform: collapsed ? 'translateX(-24px)' : 'translateX(0)',
                            transition: 'transform 0.3s ease, margin-left 0.6s ease'
                        }}
                    />
                ) : (
                    <ExpandMore
                        style={{
                            color: currentTheme.iconColor,
                            // position: collapsed ? 'absolute' : 'static',
                            // marginLeft: collapsed ? '18px' : '0px',
                            transform: collapsed ? 'translateX(-24px)' : 'translateX(0)',
                            transition: 'transform 0.3s ease, margin-left 0.6s ease'
                        }}
                    />
                )}
            </ListItemButton>

            <Collapse in={openTabs} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                    <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate('/tabs/users')}
                        style={{
                            ...(location.pathname === '/tabs/users' ? activeStyle : { color: currentTheme.iconColor }),
                            paddingLeft: !collapsed ? '32px' : '16px',
                            transition: 'padding-left 0.3s',
                        }}

                    >
                        <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/tabs/users' ? activeStyle : { color: currentTheme.iconColor }) }}>
                            <RecentActorsIcon />
                        </ListItemIcon>
                        <ListItemText style={{ marginLeft: '20px', width: '300px' }} primary="Users" />
                    </ListItemButton>
                </List>
            </Collapse>
            <Divider />
            
            <List>
                <ListItemButton
                    onClick={handleLogout}
                    style={location.pathname === '/logout' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/logout' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Decconnexion" />}
                </ListItemButton>


            </List>
        </div>
    );

    return (
        <>
            {/* Drawer for mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                    BackdropProps: { style: { backgroundColor: 'rgba(0, 0, 0, 0.1)' } }
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: drawerWidth,
                        backgroundColor: currentTheme.backgroundColorHeader,
                        color: currentTheme.color
                    },
                }}
            >
                {isAuthenticated ? (

                    drawerContent

                ) : (
                    <div style={{ backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color }}>
                        <Toolbar style={{ padding: 0 }}>
                            <Toolbar>
                                {/* Collapse button hidden on mobile */}
                                <IconButton
                                    onClick={handleCollapseToggle}
                                    sx={{ position: 'absolute', bottom: '10px', left: '10px', display: { xs: 'none', sm: 'block' }, zIndex: 100 }}
                                >
                                    {collapsed ? (
                                        <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                            <CustomMenuIconOpen color={currentTheme.iconColor} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                            <CustomMenuIconClose color={currentTheme.iconColorActive} />
                                        </div>
                                    )}
                                </IconButton>
                            </Toolbar>
                        </Toolbar>
                        <Divider />
                        <List>
                            <ListItemButton
                                onClick={() => navigate('/login')}
                                style={location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }}
                            >
                                <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                    <LoginIcon />
                                </ListItemIcon>
                                {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Login" />}
                            </ListItemButton>
                        </List>
                    </div>
                )}
            </Drawer>

            {/* Drawer for desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: collapsed ? collapsedDrawerWidth : drawerWidth,
                        transition: 'width 0.3s',
                        backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color,
                        overflowX: 'hidden',
                    },
                    overflowX: 'hidden',
                }}
                open
            >
                {isAuthenticated ? (

                    drawerContent

                ) : (
                    <div style={{ backgroundColor: currentTheme.backgroundColorHeader, color: currentTheme.color }}>
                        <Toolbar style={{ padding: 0 }}>
                            <Toolbar>
                                {/* Collapse button hidden on mobile */}
                                <IconButton
                                    onClick={handleCollapseToggle}
                                    sx={{ position: 'absolute', bottom: '10px', left: '10px', display: { xs: 'none', sm: 'block' }, zIndex: 100 }}
                                >
                                    {collapsed ? (
                                        <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                            <CustomMenuIconOpen color={currentTheme.iconColor} />
                                        </div>
                                    ) : (
                                        <div style={{ width: '30px', height: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                                            <CustomMenuIconClose color={currentTheme.iconColorActive} />
                                        </div>
                                    )}
                                </IconButton>
                            </Toolbar>
                        </Toolbar>
                        <Divider />
                        <List>
                            <ListItemButton
                                onClick={() => navigate('/login')}
                                style={location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }}
                            >
                                <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                    <LoginIcon />
                                </ListItemIcon>
                                {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Login" />}
                            </ListItemButton>
                        </List>
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default CustomDrawer;
