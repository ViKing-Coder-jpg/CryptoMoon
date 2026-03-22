import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { api } from '../../functions';

const BTCCandleChart = () => {
    const chartRef = useRef(null);

    useEffect(() => {
        const chart = createChart(chartRef.current, {
            autoSize: true,
            height: 380,
            layout: {
                background: { color: 'transparent' },
                textColor: '#d1d4dc',
            },
            grid: {
                vertLines: { color: '#2B2B43' },
                horzLines: { color: '#2B2B43' },
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        api.get('/btc-candles')
            .then(res => candleSeries.setData(res.data));

        return () => {
            chart.remove();
        };
    }, []);

    return <div ref={chartRef} style={{ width: '100%' }} />;
};

export default BTCCandleChart;