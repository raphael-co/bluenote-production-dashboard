// themeHeader.tsx
import { createTheme } from '@mui/material/styles';

export const lightTheme = {
    header: {
        backgroundColor: '#007aff',
        color: '#fff',
    },
    navLink: {
        color: '#fff',
    },
    navButton: {
        backgroundColor: '#fff',
        color: '#007aff',
    },
    close: {
        color: 'red',
    }
};

export const darkTheme = {
    header: {
        backgroundColor: '#bb86fc',
        color: '#fff',
    },
    navLink: {
        color: '#fff',
    },
    navButton: {
        backgroundColor: '#333',
        color: '#fff',
    },
    close: {
        color: 'red',
    }
};

export const muiLightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#007aff',
        },
        secondary: {
            main: '#ff4081',
        },
    },
});

export const muiDarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#bb86fc',
        },
        secondary: {
            main: '#03dac6',
        },
    },
});
