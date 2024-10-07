import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import ChartComponent from '../ChartComponent';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Importer l'icône du calendrier
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
import { darkTheme, lightTheme } from '../theme';

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

interface UserStats {
    label: string;
    value: number;
}

const UserStat: React.FC = () => {
    const { logout, token } = useAuth();
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const [userData, setUserData] = useState<UserStats[] | null>(null);
    const [userDataYear, setUserDataYear] = useState<{ labels: string[]; datasets: any[] } | null>(null);
    const [userDataDay, setUserDataDay] = useState<UserStats[] | null>(null); // Pour les utilisateurs par jour

    // Sélecteurs de dates individuels
    const [selectedDateWeek, setSelectedDateWeek] = useState<Date | null>(new Date());
    const [selectedDateYear, setSelectedDateYear] = useState<Date | null>(new Date());
    const [selectedDateDay, setSelectedDateDay] = useState<Date | null>(new Date());

    // État pour afficher ou masquer les DatePickers
    const [showWeekPicker, setShowWeekPicker] = useState(false);
    const [showDayPicker, setShowDayPicker] = useState(false);

    // Fonction pour récupérer les statistiques des utilisateurs pour la semaine
    const fetchUserStatsForWeek = async (year: number, month: number, day: number) => {
        try {
            const userResponse = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/new-users?period=week&year=${year}&month=${month}&day=${day}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const userData = await userResponse.json();
            setUserData(Object.values(userData)[0] as UserStats[]);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs pour la semaine', error);
        }
    };
    // process.env.REACT_APP_API_URL

    // Fonction pour récupérer les statistiques des utilisateurs pour l'année
    const fetchUserStatsForYear = async (year: number) => {
        try {
            const userResponseYear = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/new-users?period=year&year=${year}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const userResponseYears = await userResponseYear.json();

            const years = Object.keys(userResponseYears);
            const datasets = years.map((year) => ({
                label: `Year ${year}`,
                data: userResponseYears[year].map((month: { value: number }) => month.value),
                backgroundColor: year === '2023' ? 'rgba(153, 102, 255, 0.6)' : 'rgba(75, 192, 192, 0.6)',
                borderColor: year === '2023' ? 'rgba(153, 102, 255, 1)' : 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }));

            setUserDataYear({
                labels: userResponseYears['2023'].map((month: { label: string }) => month.label),
                datasets,
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs pour l\'année', error);
        }
    };

    // Fonction pour récupérer les statistiques des utilisateurs pour le jour sélectionné
    const fetchUserStatsForDay = async (year: number, month: number, day: number) => {
        try {
            const userResponseDay = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/new-users?period=day&year=${year}&month=${month}&day=${day}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const userData = await userResponseDay.json();
            setUserDataDay(Object.values(userData)[0] as UserStats[]); // Mise à jour pour les utilisateurs par jour
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs pour le jour', error);
        }
    };

    // useEffect pour la semaine
    useEffect(() => {
        if (selectedDateWeek && token) {
            const year = selectedDateWeek.getFullYear();
            const month = selectedDateWeek.getMonth() + 1;
            const day = selectedDateWeek.getDate();
            fetchUserStatsForWeek(year, month, day);
        }
    }, [selectedDateWeek, token]);

    // useEffect pour l'année
    useEffect(() => {
        if (selectedDateYear && token) {
            const year = selectedDateYear.getFullYear();
            fetchUserStatsForYear(year);
        }
    }, [selectedDateYear, token]);

    // useEffect pour le jour
    useEffect(() => {
        if (selectedDateDay && token) {
            const year = selectedDateDay.getFullYear();
            const month = selectedDateDay.getMonth() + 1;
            const day = selectedDateDay.getDate();
            fetchUserStatsForDay(year, month, day);
        }
    }, [selectedDateDay, token]);

    // Traiter les données pour les graphiques utilisateurs (bar chart)
    const processedUserData = userData
        ? {
            labels: userData.map((item: UserStats) => item.label),
            datasets: [
                {
                    label: 'Users ' + selectedDateWeek?.toLocaleDateString('fr-FR'),
                    data: userData.map((item: UserStats) => item.value),
                    backgroundColor: ['rgba(75, 192, 192, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1,
                },
            ],
        }
        : null;

    // Traiter les données pour les graphiques des utilisateurs par année (line chart)
    const processedMarkerData = userDataYear
        ? {
            labels: userDataYear.labels,
            datasets: userDataYear.datasets,
        }
        : null;

    // Traiter les données pour les utilisateurs par jour (line chart)
    const processedUserDayData = userDataDay
        ? {
            labels: userDataDay.map((item: UserStats) => item.label),
            datasets: [
                {
                    label: 'Users per hour ' + selectedDateDay?.toLocaleDateString('fr-FR'),
                    data: userDataDay.map((item: UserStats) => item.value),
                    backgroundColor: ['rgba(255, 99, 132, 0.6)'],
                    borderColor: ['rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                },
            ],
        }
        : null;

    const handleLogout = () => {
        logout();
    };

    return (

        <div style={currentTheme.container}>
            <h1 style={currentTheme.title}>Tableau de bord</h1>
            <p style={currentTheme.subtitle}>Bienvenue sur votre tableau de bord</p>

            <div style={currentTheme.cardContainer}>
                <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs</h2>
                <div style={currentTheme.card}>
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <IconButton onClick={() => setShowWeekPicker(!showWeekPicker)}>
                            <CalendarTodayIcon style={currentTheme.icon} />
                        </IconButton>
                        {showWeekPicker && (
                            <DatePicker
                                selected={selectedDateWeek}
                                onChange={(date) => {
                                    setSelectedDateWeek(date);
                                    setShowWeekPicker(false);
                                }}
                                dateFormat="dd/MM/yyyy"
                                inline
                            />
                        )}
                    </div>
                    {processedUserData && (
                        <ChartComponent
                            data={processedUserData}
                            type="bar"
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    title: { display: true, text: 'Statistiques des utilisateurs' },
                                    legend: { display: true },
                                },
                            }}
                        />
                    )}
                </div>

                <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs par année</h2>
                <div style={currentTheme.card}>
                    {processedMarkerData && (
                        <ChartComponent
                            data={processedMarkerData}
                            type="line"
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    title: { display: true, text: 'Statistiques des utilisateurs par année' },
                                    legend: { display: true },
                                },
                            }}
                        />
                    )}
                </div>

                {/* Graphique en ligne des utilisateurs par jour */}
                <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs par jour</h2>
                <div style={currentTheme.card}>
                    <div style={{ position: 'absolute', right: '10px', top: '10px' }}>
                        <IconButton onClick={() => setShowDayPicker(!showDayPicker)}>
                            <CalendarTodayIcon style={currentTheme.icon} />
                        </IconButton>
                        {showDayPicker && (
                            <DatePicker
                                selected={selectedDateDay}
                                onChange={(date) => {
                                    setSelectedDateDay(date);
                                    setShowDayPicker(false);
                                }}
                                dateFormat="dd/MM/yyyy"
                                inline
                            />
                        )}
                    </div>
                    {processedUserDayData && (
                        <ChartComponent
                            data={processedUserDayData}
                            type="line"
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    title: { display: true, text: 'Statistiques des utilisateurs par jour' },
                                    legend: { display: true },
                                },
                            }}
                        />
                    )}
                </div>
            </div>
        </div>

    );
};

export default UserStat;
