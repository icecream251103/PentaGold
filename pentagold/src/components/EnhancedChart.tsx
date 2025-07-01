import React, { useState, useMemo, useCallback } from 'react';
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
import { Clock, TrendingUp, TrendingDown, BarChart3, Maximize2, Settings, Activity } from 'lucide-react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { 
  formatCurrency, 
  formatPercentage, 
  calculateSMA, 
  calculateRSI, 
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculateVolatility
} from '../utils/calculations';
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

type Timeframe = '1H' | '4H' | '1D' | '1W' | '1M';
type ChartType = 'line' | 'candlestick' | 'area';

// Technical indicators
interface TechnicalIndicators {
  sma20: number[];
  sma50: number[];
  ema12: number[];
  ema26: number[];
  rsi: number[];
  bollingerUpper: number[];
  bollingerLower: number[];
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
  volatility: number[];
}

const EnhancedChart: React.FC = () => {
  const { currentData, getHistoryForTimeframe, isLoading } = useGoldPrice();
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [showIndicators, setShowIndicators] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const timeframes: { key: Timeframe; label: string }[] = [
    { key: '1H', label: '1H' },
    { key: '4H', label: '4H' },
    { key: '1D', label: '1D' },
    { key: '1W', label: '1W' },
    { key: '1M', label: '1M' }
  ];

  const chartTypes: { key: ChartType; label: string }[] = [
    { key: 'line', label: 'Line' },
    { key: 'area', label: 'Area' },
    { key: 'candlestick', label: 'Candlestick' }
  ];

  const technicalIndicators = useMemo(() => {
    const history = getHistoryForTimeframe(selectedTimeframe);
    const prices = history.map(point => point.price);
    
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const rsi = calculateRSI(prices, 14);
    const bollinger = calculateBollingerBands(prices, 20, 2);
    const macd = calculateMACD(prices, 12, 26, 9);
    const volatility = calculateVolatility(prices, 20);
    
    return {
      sma20,
      sma50,
      ema12,
      ema26,
      rsi,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      macdLine: macd.macdLine,
      signalLine: macd.signalLine,
      histogram: macd.histogram,
      volatility
    };
  }, [getHistoryForTimeframe, selectedTimeframe]);

  const chartData = useMemo(() => {
    const history = getHistoryForTimeframe(selectedTimeframe);
    
    const datasets = [
      {
        label: 'PGAUx Price',
        data: history.map(point => point.price),
        borderColor: '#d97706',
        backgroundColor: chartType === 'area' ? 'rgba(217, 119, 6, 0.1)' : 'transparent',
        fill: chartType === 'area',
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

      // EMA 12
      datasets.push({
        label: 'EMA 12',
        data: technicalIndicators.ema12,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: '#10b981',
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
          case '4H':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          case '1D':
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          case '1W':
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          case '1M':
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
          default:
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
      }),
      datasets
    };
  }, [getHistoryForTimeframe, selectedTimeframe, chartType, showIndicators, technicalIndicators]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart'
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
          font: {
            size: 11
          },
          color: '#6b7280',
          stepSize: 10
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
          maxRotation: 0,
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
      mode: 'index'
    },
    elements: {
      point: {
        hoverBorderWidth: 3
      }
    }
  };

  const priceChange = currentData.changePercent24h;
  const isPositive = priceChange >= 0;

  // Calculate current RSI
  const currentRSI = technicalIndicators.rsi[technicalIndicators.rsi.length - 1];
  const rsiStatus = currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral';

  // Calculate current volatility
  const currentVolatility = technicalIndicators.volatility[technicalIndicators.volatility.length - 1];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-amber-600" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">PGAUx Price Chart</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentData.price)}
              </div>
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{formatPercentage(Math.abs(priceChange))}</span>
              </div>
            </div>
          </div>

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

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-500 hover:text-amber-600 transition-colors"
              title="Toggle Fullscreen"
          >
            <Maximize2 className="h-5 w-5" />
          </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            {/* Timeframe Selector */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {timeframes.map((timeframe) => (
              <button
                key={timeframe.key}
                onClick={() => setSelectedTimeframe(timeframe.key)}
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

            {/* Chart Type Selector */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {chartTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setChartType(type.key)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    chartType === type.key
                      ? 'bg-amber-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:text-amber-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>Real-time data</span>
          </div>
        </div>

        {/* Chart */}
        <div className={`${isFullscreen ? 'h-96' : 'h-80'} relative`}>
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
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
              <div className="text-sm text-gray-500 dark:text-gray-400">EMA 12</div>
              <div className="text-lg font-semibold text-green-600">
                {technicalIndicators.ema12[technicalIndicators.ema12.length - 1]
                  ? formatCurrency(technicalIndicators.ema12[technicalIndicators.ema12.length - 1])
                  : 'N/A'
                }
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Volatility</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentVolatility ? currentVolatility.toFixed(2) : 'N/A'}%
              </div>
            </div>
          </div>
        )}

        {/* Chart Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">24h High</div>
            <div className="text-lg font-semibold text-green-600">
              {formatCurrency(currentData.high24h)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">24h Low</div>
            <div className="text-lg font-semibold text-red-600">
              {formatCurrency(currentData.low24h)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">24h Volume</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(currentData.volume24h / 1000000).toFixed(2)}M
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Market Cap</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              ${(currentData.marketCap / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChart;