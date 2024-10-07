import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import 'react-datepicker/dist/react-datepicker.css';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { darkTheme, lightTheme } from './theme';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const DashboardPage: React.FC = () => {
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    return (
        <div style={currentTheme.container}>
            <h1 style={currentTheme.title}>Tableau de bord</h1>
            <p style={currentTheme.subtitle}>Bienvenue sur votre tableau de bord</p>
        </div>

    );
};

export default DashboardPage;
