import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AlertCircle, TrendingUp, TrendingDown, Clock, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { formatCurrency, formatPercentage } from '../utils/calculations';
import logo from '../assets/logo.png';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const GoldPriceChart = () => {
  const { currentData, getHistoryForTimeframe, isLoading } = useGoldPrice();
  const [showIndicators, setShowIndicators] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1H' | '4H' | '1D'>('1D');

  const timeframes = [
    { key: '1H', label: '1H' },
    { key: '4H', label: '4H' },
    { key: '1D', label: '1D' }
  ];

  // Calculate technical indicators
  const technicalIndicators = useMemo(() => {
    const history = getHistoryForTimeframe(selectedTimeframe);
    const prices = history.map(point => point.price);
    
    // Simple Moving Average (SMA)
    const calculateSMA = (data: number[], period: number): number[] => {
      const sma: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          sma.push(NaN);
        } else {
          const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
          sma.push(sum / period);
        }
      }
      return sma;
    };

    // Relative Strength Index (RSI)
    const calculateRSI = (data: number[], period: number = 14): number[] => {
      const rsi: number[] = [];
      for (let i = 0; i < data.length; i++) {
        if (i < period) {
          rsi.push(NaN);
        } else {
          let gains = 0;
          let losses = 0;
          
          for (let j = i - period + 1; j <= i; j++) {
            const change = data[j] - data[j - 1];
            if (change > 0) {
              gains += change;
            } else {
              losses -= change;
            }
          }
          
          const avgGain = gains / period;
          const avgLoss = losses / period;
          const rs = avgGain / avgLoss;
          const rsiValue = 100 - (100 / (1 + rs));
          rsi.push(rsiValue);
        }
      }
      return rsi;
    };

    // Bollinger Bands
    const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
      const sma = calculateSMA(data, period);
      const upper: number[] = [];
      const lower: number[] = [];
      
      for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
          upper.push(NaN);
          lower.push(NaN);
        } else {
          const slice = data.slice(i - period + 1, i + 1);
          const mean = sma[i];
          const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
          const standardDeviation = Math.sqrt(variance);
          
          upper.push(mean + (stdDev * standardDeviation));
          lower.push(mean - (stdDev * standardDeviation));
        }
      }
      
      return { upper, lower };
    };

    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const rsi = calculateRSI(prices, 14);
    const bollinger = calculateBollingerBands(prices, 20, 2);
    
    return {
      sma20,
      sma50,
      rsi,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower
    };
  }, [getHistoryForTimeframe, selectedTimeframe]);

  const chartData = useMemo(() => {
    const history = getHistoryForTimeframe(selectedTimeframe);
    
    const datasets = [
      {
        label: 'PentaGold Price (USD)',
        data: history.map(point => point.price),
        borderColor: '#d97706',
        backgroundColor: 'rgba(217, 119, 6, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#d97706',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      }
    ];

    // Add technical indicators if enabled
    if (showIndicators) {
      // SMA 20
      datasets.push({
        label: 'SMA 20',
        data: technicalIndicators.sma20,
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });

      // SMA 50
      datasets.push({
        label: 'SMA 50',
        data: technicalIndicators.sma50,
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#8b5cf6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });

      // Bollinger Bands
      datasets.push({
        label: 'Bollinger Upper',
        data: technicalIndicators.bollingerUpper,
        borderColor: 'rgba(34, 197, 94, 0.3)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: 'rgba(34, 197, 94, 0.3)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });

      datasets.push({
        label: 'Bollinger Lower',
        data: technicalIndicators.bollingerLower,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: 'rgba(239, 68, 68, 0.3)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2
      });
    }
    
    return {
      labels: history.map(point => {
        const date = new Date(point.timestamp);
        switch (selectedTimeframe) {
          case '1H':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          case '4H':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          case '1D':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          default:
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }),
      datasets
    };
  }, [getHistoryForTimeframe, selectedTimeframe, showIndicators, technicalIndicators]);

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 750,
    easing: 'linear'
  },
  plugins: {
    legend: {
        display: showIndicators,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 11
          }
        }
    },
    tooltip: {
      mode: 'index',
      intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#1f2937',
      bodyColor: '#1f2937',
      borderColor: '#d1d5db',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
        displayColors: true,
      callbacks: {
          title: (tooltipItems) => {
            return `Time: ${tooltipItems[0].label}`;
          },
        label: (context) => {
          const value = context.parsed.y;
            if (isNaN(value)) return '';
            
            const label = context.dataset.label || '';
            if (label.includes('RSI')) {
              return `${label}: ${value.toFixed(2)}`;
            }
            return `${label}: ${formatCurrency(value)}`;
        }
      }
    }
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      grid: {
          color: 'rgba(0, 0, 0, 0.05)'
      },
      ticks: {
          callback: (value) => formatCurrency(value as number),
        stepSize: 10,
        font: {
          size: 11
          },
          color: '#6b7280'
        },
        border: {
          display: false
      },
      title: {
        display: true,
        text: 'Price (USD)',
        font: {
          size: 12,
          weight: 'bold'
        }
      }
    },
    x: {
      type: 'category',
      grid: {
        display: false
      },
      ticks: {
        maxRotation: 45,
        autoSkip: true,
        maxTicksLimit: 12,
        font: {
          size: 11
          },
          color: '#6b7280'
        },
        border: {
          display: false
      },
      title: {
        display: true,
        text: 'Time',
        font: {
          size: 12,
          weight: 'bold'
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'nearest'
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
      fill: 'start'
    },
    point: {
      radius: 0,
      hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3
      }
    }
  };

  const priceChange = currentData.changePercent24h;
  const isPositive = priceChange >= 0;
        
  // Calculate current RSI
  const currentRSI = technicalIndicators.rsi[technicalIndicators.rsi.length - 1];
  const rsiStatus = currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
      <header className="flex items-center justify-end p-2 border-b mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`p-2 rounded-lg transition-colors ${
              showIndicators 
                ? 'bg-amber-100 text-amber-600' 
                : 'bg-gray-100 text-gray-500 hover:text-amber-600'
            }`}
            title="Toggle Technical Indicators"
          >
            <Activity className="h-5 w-5" />
          </button>
        </div>
      </header>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">PentaGold Price</h3>
          <div className="flex items-center gap-4">
            {/* Timeframe Selector */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.key}
                  onClick={() => setSelectedTimeframe(timeframe.key as '1H' | '4H' | '1D')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedTimeframe === timeframe.key
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4" />
              <span>{selectedTimeframe} Chart</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</div>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(currentData.price)}
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">24h High</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentData.high24h)}
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">24h Low</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(currentData.low24h)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${priceChange >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Change</div>
            <div className={`text-2xl font-bold flex items-center ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {priceChange >= 0 ? (
                <TrendingUp className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              {formatPercentage(Math.abs(priceChange))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-[300px]">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          </div>
        ) : (
        <Line options={chartOptions} data={chartData} />
        )}
      </div>
      
      {/* Technical Analysis */}
      {showIndicators && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">RSI (14)</div>
            <div className={`text-lg font-semibold ${
              currentRSI > 70 ? 'text-red-600' : 
              currentRSI < 30 ? 'text-green-600' : 
              'text-gray-900 dark:text-white'
            }`}>
              {currentRSI ? currentRSI.toFixed(1) : 'N/A'}
            </div>
            <div className="text-xs text-gray-400">{rsiStatus}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">SMA 20</div>
            <div className="text-lg font-semibold text-blue-600">
              {technicalIndicators.sma20[technicalIndicators.sma20.length - 1] 
                ? formatCurrency(technicalIndicators.sma20[technicalIndicators.sma20.length - 1])
                : 'N/A'
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">SMA 50</div>
            <div className="text-lg font-semibold text-purple-600">
              {technicalIndicators.sma50[technicalIndicators.sma50.length - 1]
                ? formatCurrency(technicalIndicators.sma50[technicalIndicators.sma50.length - 1])
                : 'N/A'
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Volatility</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {((currentData.high24h - currentData.low24h) / currentData.price * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end">
        <Clock className="h-4 w-4 mr-1" />
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default GoldPriceChart;