import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { ChartOptions, ChartData, BarElement, LineElement } from 'chart.js';

// Types pour les props du graphique en barres
interface BarChartProps {
    data: ChartData<'bar', number[]>;
    options?: ChartOptions<'bar'>;
    type: 'bar';
}

// Types pour les props du graphique en lignes
interface LineChartProps {
    data: ChartData<'line', number[]>;
    options?: ChartOptions<'line'>;
    type: 'line';
}

// Union des deux types
type ChartComponentProps = BarChartProps | LineChartProps;

const ChartComponent: React.FC<ChartComponentProps> = ({ data, options, type }) => {
    return (
        <div style={{ maxWidth: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', aspectRatio: '16/9', minHeight: '300px' }}>
            {type === 'bar' ? <Bar style={{ width: '100%'}} data={data} options={options} /> : <Line style={{ width: '100%' }} data={data} options={options} />}
        </div>
    );
};

export default ChartComponent;
