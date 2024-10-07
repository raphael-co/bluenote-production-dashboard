import React, { useEffect, useState } from 'react';
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
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import CampaignIcon from '@mui/icons-material/Campaign';
import EditNoteIcon from '@mui/icons-material/EditNote';
import ListAltIcon from '@mui/icons-material/ListAlt';

import RecentActorsIcon from '@mui/icons-material/RecentActors';
import PushPinIcon from '@mui/icons-material/PushPin';

import PermIdentityIcon from '@mui/icons-material/PermIdentity';

import DashboardIcon from '@mui/icons-material/Dashboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import MapIcon from '@mui/icons-material/Map';
import EditNotificationsIcon from '@mui/icons-material/EditNotifications';

import LayersIcon from '@mui/icons-material/Layers';
import axios from 'axios';
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
    const { token, realodingDrawerDoc, isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const [openReports, setOpenReports] = useState(false);
    const [openTabs, setOpenTabs] = useState(false);
    const [openDocumentation, setOpenDocumentation] = useState(false);
    const [documentationList, setDocumentationList] = useState<{ id: number, title: string }[]>([]);

    const handleReportsClick = () => {
        setOpenReports(!openReports);
    };

    const handleTabsClick = () => {
        setOpenTabs(!openTabs);
    };

    const handleDocumentationClick = () => {
        setOpenDocumentation(!openDocumentation);
    };

    const activeStyle = {
        color: currentTheme.iconColorActive,
    };

    useEffect(() => {
        const fetchAnnouncement = async () => {
            if (token) {
                try {
                    const response = await axios.get(`${process.env.REACT_APP_API_URL}/documentation/titles/list`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    setDocumentationList(response.data);

                } catch (error) {
                    console.error('Erreur lors de la récupération de l\'annonce :', error);
                }
            }
        };

        fetchAnnouncement();
    }, [token, realodingDrawerDoc]);

    const getTitleFromUrl = () => {
        const params = new URLSearchParams(location.search);
        return params.get('title');
    };

    const selectedTitle = getTitleFromUrl();


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
                    onClick={() => navigate('/map')}
                    style={location.pathname === '/map' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/map' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <MapIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Map" />}
                </ListItemButton>

                <ListItemButton
                    onClick={() => navigate('/announcements')}
                    style={location.pathname === '/announcements' ? activeStyle : { color: currentTheme.iconColor }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/announcements' ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <EditNotificationsIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Announcements" />}
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

                    <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate('/tabs/markers')}
                        style={{
                            ...(location.pathname === '/tabs/markers' ? activeStyle : { color: currentTheme.iconColor }),
                            paddingLeft: !collapsed ? '32px' : '16px',
                            transition: 'padding-left 0.3s',
                        }}

                    >
                        <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/tabs/markers' ? activeStyle : { color: currentTheme.iconColor }) }}>
                            <PushPinIcon />
                        </ListItemIcon>
                        <ListItemText style={{ marginLeft: '20px', width: '300px' }} primary="Markers" />
                    </ListItemButton>

                    <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => navigate('/tabs/announcements')}
                        style={{
                            ...(location.pathname === '/tabs/announcements' ? activeStyle : { color: currentTheme.iconColor }),
                            paddingLeft: !collapsed ? '32px' : '16px',
                            transition: 'padding-left 0.3s',
                        }}

                    >
                        <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/tabs/announcements' ? activeStyle : { color: currentTheme.iconColor }) }}>
                            <CampaignIcon />
                        </ListItemIcon>
                        <ListItemText style={{ marginLeft: '20px', width: '300px' }} primary="Announcements" />
                    </ListItemButton>
                </List>
            </Collapse>
            <Divider />
            <List>
                <ListItemButton
                    onClick={handleReportsClick}
                    style={{ minWidth: 'auto', ...(location.pathname.startsWith('/reports/') && !openReports ? activeStyle : { color: currentTheme.iconColor }) }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname.startsWith('/reports/') && !openReports ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <BarChartIcon />
                    </ListItemIcon>
                    {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Reports" />}
                    {/* {openReports ? <ExpandLess style={{ color: currentTheme.iconColorActive }} /> : <ExpandMore />} */}

                    {openReports ? (
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

                <Collapse in={openReports} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton
                            sx={{ pl: 4 }}
                            onClick={() => navigate('/reports/users')}
                            style={{
                                ...(location.pathname === '/reports/users' ? activeStyle : { color: currentTheme.iconColor }),
                                paddingLeft: !collapsed ? '32px' : '16px',
                                transition: 'padding-left 0.3s',
                            }}

                        >
                            <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/reports/users' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <PermIdentityIcon />
                                </div>
                            </ListItemIcon>
                            <ListItemText style={{ marginLeft: '20px', width: '300px' }} primary="Users" />
                        </ListItemButton>

                        <ListItemButton
                            sx={{ pl: 4 }}
                            onClick={() => navigate('/reports/markers')}
                            style={{
                                ...(location.pathname === '/reports/markers' ? activeStyle : { color: currentTheme.iconColor }),
                                paddingLeft: !collapsed ? '32px' : '16px',
                                transition: 'padding-left 0.3s',
                            }}

                        >
                            <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/reports/markers' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <PushPinOutlinedIcon />
                                </div>
                            </ListItemIcon>
                            <ListItemText style={{ marginLeft: '20px', width: '300px' }} primary="Markers" />
                        </ListItemButton>
                    </List>
                </Collapse>
                <Divider />

                {/* Documentation Section */}
                <ListItemButton
                    onClick={handleDocumentationClick}
                    style={{ minWidth: 'auto', ...(location.pathname.startsWith('/documentation') && !openDocumentation ? activeStyle : { color: currentTheme.iconColor }) }}
                >
                    <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname.startsWith('/documentation') && !openDocumentation ? activeStyle : { color: currentTheme.iconColor }) }}>
                        <LayersIcon />
                    </ListItemIcon>
                    <ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Documentation" />


                    {openDocumentation ? (
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

                <Collapse in={openDocumentation} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        {documentationList.map((doc) => (
                            <ListItemButton
                                sx={{ pl: 4 }}
                                key={doc.id}
                                onClick={() => navigate('/documentation?title=' + doc.title)}
                                style={{
                                    ...(selectedTitle === doc.title ? activeStyle : { color: currentTheme.iconColor }),
                                    paddingLeft: !collapsed ? '32px' : '20px',
                                    transition: 'padding-left 0.3s',
                                }}
                            >
                                <ListItemIcon style={{ minWidth: 'auto', ...(selectedTitle === doc.title ? activeStyle : { color: currentTheme.iconColor }) }}>
                                    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                        <LayersIcon style={{
                                            opacity: collapsed ? 0 : 1,
                                            transition: 'opacity 0.45s ease',
                                        }} />
                                    </div>
                                </ListItemIcon>
                                <span
                                    style={{
                                        marginLeft: collapsed ? '10px' : '0px',
                                        opacity: collapsed ? 1 : 0,
                                        width: collapsed ? '10px' : 0,
                                        transform: collapsed ? 'translateX(-40px)' : 'translateX(0)',
                                        transition: 'opacity 0.45s ease, transform 0.45s ease',
                                        fontWeight: 'bold',
                                        ...(selectedTitle === doc.title ? activeStyle : { color: currentTheme.iconColor }),
                                    }}
                                >
                                    {doc.title.slice(0, 3).toUpperCase()}
                                </span>
                                <ListItemText
                                    style={{
                                        marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s'
                                    }}
                                    primary={doc.title}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>
            </List>
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
                    <List>
                        <ListItemButton
                            // onClick={() => disconnect()}
                            style={location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }}
                        >
                            <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                <LoginIcon />
                            </ListItemIcon>
                            {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Login" />}
                        </ListItemButton>
                    </List>
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
                    <List>
                        <ListItemButton
                            // onClick={() => disconnect()}
                            style={location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }}
                        >
                            <ListItemIcon style={{ minWidth: 'auto', ...(location.pathname === '/login' ? activeStyle : { color: currentTheme.iconColor }) }}>
                                <LoginIcon />
                            </ListItemIcon>
                            {<ListItemText style={{ marginLeft: collapsed ? '20px' : '20px', transition: 'display 0.3s' }} primary="Login" />}
                        </ListItemButton>
                    </List>
                )}
            </Drawer>
        </>
    );
};

export default CustomDrawer;
