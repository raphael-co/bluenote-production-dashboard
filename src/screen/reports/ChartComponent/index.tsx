import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { ChartOptions, ChartData } from 'chart.js';
import '../users/UserStat/theme/theme.css';

interface BarChartProps {
    data: ChartData<'bar', number[]>;
    options?: ChartOptions<'bar'>;
    type: 'bar';
}

interface LineChartProps {
    data: ChartData<'line', number[]>;
    options?: ChartOptions<'line'>;
    type: 'line';
}

type ChartComponentProps = BarChartProps | LineChartProps;

const ChartComponent: React.FC<ChartComponentProps> = ({ data, options, type }) => {
    const [tention, setTention] = useState(0.4);
    const [barOption, setBarOption] = useState({
        borderRadius: 0,
        borderWidth: 0,
        inflateAmount: 0
    });

    useEffect(() => {
        const generateRandomTention = () => Math.random() * 5;
    
        const generateRandomBarOption = () => Math.floor(Math.random() * 51);
    
        const urlParams = new URLSearchParams(window.location.search);
        const wtfParam = urlParams.get('wtf');
    
        let intervalId: NodeJS.Timeout | null = null;
    
        if (wtfParam) {
            // Convertir wtfParam en nombre
            const interval = Number(wtfParam);
    
            // Vérifier si c'est un nombre valide
            if (!isNaN(interval) && interval > 0) {
                intervalId = setInterval(() => {
                    setTention(generateRandomTention());
                    setBarOption({
                        borderRadius: generateRandomBarOption(),
                        borderWidth: generateRandomBarOption(),
                        inflateAmount: generateRandomBarOption(),
                    });
                }, interval);
            } else {
                intervalId = setInterval(() => {
                    setTention(generateRandomTention());
                    setBarOption({
                        borderRadius: generateRandomBarOption(),
                        borderWidth: generateRandomBarOption(),
                        inflateAmount: generateRandomBarOption(),
                    });
                }, 500);
            }
        }
    
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, []);
    

    // Si c'est un graphique à barres, on applique uniquement les options pour les barres
    const extendedBarOptions: ChartOptions<'bar'> | undefined = type === 'bar' ? {
        ...options,
        elements: {
            bar: {
                ...options?.elements?.bar,
                borderRadius: barOption.borderRadius,
                borderWidth: barOption.borderWidth,
                inflateAmount: barOption.inflateAmount,
            },
        },
    } : undefined;

    // Si c'est un graphique en ligne, on applique uniquement les options pour les lignes
    const extendedLineOptions: ChartOptions<'line'> | undefined = type === 'line' ? {
        ...options,
        elements: {
            line: {
                ...options?.elements?.line,
                tension: tention,
            },
        },
    } : undefined;

    return (
        <div className='chart' style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {type === 'bar' ? (
                <Bar data={data} options={extendedBarOptions} />
            ) : (
                <Line data={data} options={extendedLineOptions} />
            )}
        </div>
    );
};

export default ChartComponent;
