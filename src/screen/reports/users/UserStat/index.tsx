import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, IconButton, useMediaQuery } from '@mui/material';
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
import { useAuth } from '../../../../context/AuthContext';
import { useTheme } from '../../../../context/ThemeContext';
import { darkTheme, lightTheme } from './theme';
import ChartComponent from '../../ChartComponent';
import './theme/theme.css';
import html2canvas from 'html2canvas';
import DownloadIcon from '@mui/icons-material/Download';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import MyDocument from '../../MyDocument';

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

const colors = [
    'rgba(75, 192, 192, 0.6)',  // teal
    'rgba(153, 102, 255, 0.6)', // purple
    'rgba(255, 159, 64, 0.6)',  // orange
    'rgba(255, 99, 132, 0.6)',  // red
    'rgba(54, 162, 235, 0.6)',  // blue
    'rgba(255, 206, 86, 0.6)',  // yellow
    'rgba(75, 192, 192, 0.6)',  // cyan
    'rgba(153, 102, 255, 0.6)', // violet
    'rgba(255, 159, 64, 0.6)',  // light orange
    'rgba(201, 203, 207, 0.6)', // grey
];





const borderColors = colors.map(color => color.replace('0.6', '1')); // Same colors with full opacity for borders

const UserStat: React.FC = () => {
    const { token } = useAuth();
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const [userData, setUserData] = useState<UserStats[] | null>(null);
    const [userDataYear, setUserDataYear] = useState<{ labels: string[]; datasets: any[] } | null>(null);
    const [userActifDataYear, setUserActifDataYear] = useState<{ labels: string[]; datasets: any[] } | null>(null);
    const [userDataDay, setUserDataDay] = useState<UserStats[] | null>(null);

    // Sélecteurs de dates individuels
    const [selectedDateWeek, setSelectedDateWeek] = useState<Date | null>(new Date());
    const [selectedDateYear, ] = useState<Date | null>(new Date());
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

            // Générer les datasets pour chaque année
            const datasets = years.map((year, index) => ({
                label: `Year ${year}`,
                data: userResponseYears[year].map((month: { value: number }) => month.value),
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
            }));

            // Assurer que l'année pour laquelle nous générons les labels existe dans la réponse
            const firstYear = years[0];
            const labels = userResponseYears[firstYear]?.map((month: { label: string }) => month.label) || [];

            setUserDataYear({
                labels,
                datasets,
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs pour l\'année', error);
        }
    };

    // Fonction pour récupérer les statistiques des utilisateurs actifs pour l'année
    const fetchActifUserStatsForYear = async (year: number) => {
        try {
            const userResponseYear = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/active-users-all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const userResponseYears = await userResponseYear.json();

            const years = Object.keys(userResponseYears);
            const datasets = years.map((year, index) => ({
                label: `Year ${year}`,
                data: userResponseYears[year].map((month: { value: number }) => month.value),
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
            }));

            setUserActifDataYear({
                labels: userResponseYears[year]?.map((month: { label: string }) => month.label) || [],
                datasets,
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs actifs pour l\'année', error);
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
            fetchActifUserStatsForYear(year); // Fetching active user stats
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

    // Traiter les données pour les utilisateurs actifs (line chart)
    const processedActiveUserData = userActifDataYear
        ? {
            labels: userActifDataYear.labels,
            datasets: userActifDataYear.datasets,
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


    const captureChartAsImage = async (chartRef: React.RefObject<HTMLDivElement>) => {
        if (chartRef.current) {
            const canvas = await html2canvas(chartRef.current);
            return canvas.toDataURL('image/png');
        }
        return null;
    };

    const [isGenerating, setIsGenerating] = useState(false); 


    const handleDownloadPDF = async () => {
        setIsGenerating(true); // Start generating
        const newImages: string[] = [];

        const chartImage = await captureChartAsImage(chartRef);
        if (chartImage) newImages.push(chartImage);

        const activeUserYearImage = await captureChartAsImage(activeUserYearRef);
        if (activeUserYearImage) newImages.push(activeUserYearImage);

        const activeUserActifYearImage = await captureChartAsImage(activeUserActifYearRef);
        if (activeUserActifYearImage) newImages.push(activeUserActifYearImage);



        // Générer le PDF après la capture des images
        const doc = <MyDocument images={newImages} />;
        const pdfBlob = await pdf(doc).toBlob();
        saveAs(pdfBlob, 'statistiques-users.pdf');

        setIsGenerating(false); // Stop generating
    };


    const chartRef = useRef<HTMLDivElement>(null);

    const activeUserYearRef = useRef<HTMLDivElement>(null);
    const activeUserActifYearRef = useRef<HTMLDivElement>(null);

    const isMobile = useMediaQuery('(max-width:800px)');

    return (
        <div style={{ position: 'relative' }}>
            {/* Bouton pour créer et télécharger le PDF */}
            <div style={{ position: 'absolute', right: '20px', top: '20px', background: 'transparent' }}>
                {isMobile ? (
                    <IconButton style={currentTheme.iconActive} onClick={handleDownloadPDF} disabled={isGenerating}>
                        <DownloadIcon />
                    </IconButton>
                ) : (
                    <Button  style={currentTheme.button} variant="outlined" onClick={handleDownloadPDF} disabled={isGenerating}>
                        {isGenerating ? 'Génération...' : 'Télécharger en PDF'}
                    </Button>
                )}
            </div>
            <div style={currentTheme.container}>
                <h1 style={currentTheme.title}>Statistiques des Utilisateurs</h1>
                <div style={currentTheme.cardContainer}>
                    <div className='cardsRow' ref={chartRef}>

                        <div className='cardsRowcellules' >
                            <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs</h2>
                            <div style={currentTheme.card} >
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
                        </div>

                        <div className='cardsRowcellules' >
                            <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs par jour</h2>
                            <div style={currentTheme.card} >
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

                    <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs par année</h2>
                    <div style={currentTheme.card} ref={activeUserYearRef}>
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

                    <h2 style={currentTheme.subtitle}>Statistiques des utilisateurs actifs par année</h2>
                    <div style={currentTheme.card} ref={activeUserActifYearRef}>
                        {processedActiveUserData && (
                            <ChartComponent
                                data={processedActiveUserData}
                                type="line"
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        title: { display: true, text: 'Utilisateurs actifs par année' },
                                        legend: { display: true },
                                    },
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserStat;
