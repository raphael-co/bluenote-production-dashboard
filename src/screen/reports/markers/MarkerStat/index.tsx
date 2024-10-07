import React, { useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, IconButton, useMediaQuery } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
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
import MyDocument from '../../MyDocument';
import { pdf } from '@react-pdf/renderer';
import saveAs from 'file-saver';

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

interface StatsData {
    label: string;
    value: number;
}

interface YearlyStats {
    [key: string]: StatsData[];
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

const borderColors = colors.map(color => color.replace('0.6', '1')); // Same colors but with full opacity for borders

const StatsChart: React.FC = () => {
    const { token } = useAuth();
    const { theme } = useTheme();
    const currentTheme = theme === 'light' ? lightTheme : darkTheme;

    const [commentsData, setCommentsData] = useState<YearlyStats | null>(null);
    const [markersData, setMarkersData] = useState<YearlyStats | null>(null);
    const [markersDataWeek, setMarkersDataWeek] = useState<StatsData[] | null>(null);
    const [markersDataDay, setMarkersDataDay] = useState<StatsData[] | null>(null);

    const [showWeekPicker, setShowWeekPicker] = useState(false);
    const [showDayPicker, setShowDayPicker] = useState(false);

    const [selectedDateWeek, setSelectedDateWeek] = useState<Date | null>(new Date());
    const [selectedDateDay, setSelectedDateDay] = useState<Date | null>(new Date());


    const isMobile = useMediaQuery('(max-width:800px)');

    const chartRef = useRef<HTMLDivElement>(null);
    const chartMmarqueursRef = useRef<HTMLDivElement>(null);
    const chartCommentairesMarqueursRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Fonction pour récupérer les statistiques des commentaires
    const fetchStats = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/comments-by-month-year`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const statsData = await response.json();
            setCommentsData(statsData); // Met à jour les données des commentaires
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques', error);
        }
    };

    // Fonction pour récupérer les statistiques des marqueurs
    const fetchStatsMarkers = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/markers-by-month-year`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const statsData = await response.json();
            setMarkersData(statsData); // Met à jour les données des marqueurs
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques des marqueurs', error);
        }
    };

    // Fonction pour récupérer les statistiques des marqueurs par semaine
    const fetchMarkersStatsForWeek = async (year: number, month: number, day: number) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/markers-by-period?period=week&year=${year}&month=${month}&day=${day}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setMarkersDataWeek(Object.values(data)[0] as StatsData[]);
        } catch (error) {
            console.error('Erreur lors de la récupération des marqueurs pour la semaine', error);
        }
    };

    // Fonction pour récupérer les statistiques des marqueurs par jour
    const fetchMarkersStatsForDay = async (year: number, month: number, day: number) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/stats/markers-by-period?period=day&year=${year}&month=${month}&day=${day}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            setMarkersDataDay(Object.values(data)[0] as StatsData[]);
        } catch (error) {
            console.error('Erreur lors de la récupération des marqueurs pour le jour', error);
        }
    };

    // useEffect pour récupérer les statistiques dès que le composant est monté
    useEffect(() => {
        if (token) {
            fetchStats();
            fetchStatsMarkers(); // Appel des deux API pour récupérer les statistiques des commentaires et des marqueurs
        }
    }, [token]);

    // useEffect pour récupérer les marqueurs de la semaine
    useEffect(() => {
        if (selectedDateWeek && token) {
            const year = selectedDateWeek.getFullYear();
            const month = selectedDateWeek.getMonth() + 1;
            const day = selectedDateWeek.getDate();
            fetchMarkersStatsForWeek(year, month, day);
        }
    }, [selectedDateWeek, token]);

    // useEffect pour récupérer les marqueurs du jour
    useEffect(() => {
        if (selectedDateDay && token) {
            const year = selectedDateDay.getFullYear();
            const month = selectedDateDay.getMonth() + 1;
            const day = selectedDateDay.getDate();
            fetchMarkersStatsForDay(year, month, day);
        }
    }, [selectedDateDay, token]);

    // Traitement des données des commentaires pour générer des datasets dynamiques
    const processedCommentsData = commentsData
        ? {
            labels: commentsData[Object.keys(commentsData)[0]]?.map((item: StatsData) => item.label) || [],
            datasets: Object.keys(commentsData).map((year, index) => ({
                label: `Commentaires ${year}`,
                data: commentsData[year].map((item: StatsData) => item.value),
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
            })),
        }
        : null;

    // Traitement des données des marqueurs pour générer des datasets dynamiques
    const processedMarkersData = markersData
        ? {
            labels: markersData[Object.keys(markersData)[0]]?.map((item: StatsData) => item.label) || [],
            datasets: Object.keys(markersData).map((year, index) => ({
                label: `Marqueurs ${year}`,
                data: markersData[year].map((item: StatsData) => item.value),
                backgroundColor: colors[index % colors.length],
                borderColor: borderColors[index % borderColors.length],
                borderWidth: 1,
            })),
        }
        : null;

    // Traiter les données pour les graphiques des marqueurs par semaine
    const processedMarkersWeekData = markersDataWeek
        ? {
            labels: markersDataWeek.map((item: StatsData) => item.label),
            datasets: [
                {
                    label: 'Markers par semaine',
                    data: markersDataWeek.map((item: StatsData) => item.value),
                    backgroundColor: ['rgba(75, 192, 192, 0.6)'],
                    borderColor: ['rgba(75, 192, 192, 1)'],
                    borderWidth: 1,
                },
            ],
        }
        : null;

    // Traiter les données pour les graphiques des marqueurs par jour
    const processedMarkersDayData = markersDataDay
        ? {
            labels: markersDataDay.map((item: StatsData) => item.label),
            datasets: [
                {
                    label: 'Markers par jour',
                    data: markersDataDay.map((item: StatsData) => item.value),
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

    const handleDownloadPDF = async () => {
        setIsGenerating(true); // Start generating
        const newImages: string[] = [];

        const chartImage = await captureChartAsImage(chartRef);
        if (chartImage) newImages.push(chartImage);

        const chartMmarqueursImage = await captureChartAsImage(chartMmarqueursRef);
        if (chartMmarqueursImage) newImages.push(chartMmarqueursImage);

        const chartCommentairesMarqueursImage = await captureChartAsImage(chartCommentairesMarqueursRef);
        if (chartCommentairesMarqueursImage) newImages.push(chartCommentairesMarqueursImage);

        const doc = <MyDocument images={newImages} />;
        const pdfBlob = await pdf(doc).toBlob();
        saveAs(pdfBlob, 'markeurs-users.pdf');

        setIsGenerating(false); // Stop generating
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                {isMobile ? (
                    <IconButton style={currentTheme.iconActive} color="primary" onClick={handleDownloadPDF} disabled={isGenerating}>
                        <DownloadIcon />
                    </IconButton>
                ) : (
                    <Button style={currentTheme.button} variant="outlined" color="primary" onClick={handleDownloadPDF} disabled={isGenerating}>
                        {isGenerating ? 'Génération...' : 'Télécharger en PDF'}
                    </Button>
                )}
            </div>
            <div style={currentTheme.container}>
                <h1 style={currentTheme.title}>Statistiques des commentaires et des marqueurs</h1>

                <div style={currentTheme.cardContainer}>
                    <div className='cardsRow' ref={chartRef}>
                        {/* Graphique des marqueurs par semaine */}
                        <div className='cardsRowcellules'>
                            <h2 style={currentTheme.subtitle}>Statistiques des marqueurs par semaine</h2>
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
                                {processedMarkersWeekData && (
                                    <ChartComponent
                                        data={processedMarkersWeekData}
                                        type="bar"
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                title: { display: true, text: 'Statistiques des marqueurs par semaine' },
                                                legend: { display: true },
                                            },
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Graphique des marqueurs par jour */}
                        <div className='cardsRowcellules'>
                            <h2 style={currentTheme.subtitle}>Statistiques des marqueurs par jour</h2>
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
                                {processedMarkersDayData && (
                                    <ChartComponent
                                        data={processedMarkersDayData}
                                        type="line"
                                        options={{
                                            maintainAspectRatio: false,
                                            plugins: {
                                                title: { display: true, text: 'Statistiques des marqueurs par jour' },
                                                legend: { display: true },
                                            },
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <h2 style={currentTheme.subtitle}>Statistiques des marqueurs</h2>
                    <div style={currentTheme.card} ref={chartMmarqueursRef}>
                        {processedMarkersData && (
                            <ChartComponent
                                data={processedMarkersData}
                                type="line"
                                options={{
                                    maintainAspectRatio: false,

                                    plugins: {
                                        title: { display: true, text: 'Statistiques des marqueurs par année' },
                                        legend: { display: true },
                                    },
                                }}
                            />
                        )}
                    </div>

                    <h2 style={currentTheme.subtitle}>Statistiques des commentaires</h2>

                    <div style={currentTheme.card} ref={chartCommentairesMarqueursRef}>
                        {processedCommentsData && (
                            <ChartComponent
                                data={processedCommentsData}
                                type="line"
                                options={{
                                    maintainAspectRatio: false,

                                    plugins: {
                                        title: { display: true, text: 'Statistiques des commentaires par année' },
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

export default StatsChart;
