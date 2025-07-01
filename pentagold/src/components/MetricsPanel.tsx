import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Coins, BarChart3, Shield, Clock, RefreshCw, Activity, Target, Zap } from 'lucide-react';
import { useGoldPrice } from '../hooks/useGoldPrice';
import { formatCurrency, formatPercentage, formatNumber, calculateRSI, calculateSMA, calculateVolatility } from '../utils/calculations';
import logo from '../assets/logo.png';

const MetricsPanel: React.FC = () => {
  const { currentData, isLoading, refresh, getHistoryForTimeframe } = useGoldPrice();

  const technicalMetrics = useMemo(() => {
    const history = getHistoryForTimeframe('1D');
    const prices = history.map(point => point.price);
    
    const rsi = calculateRSI(prices, 14);
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const volatility = calculateVolatility(prices, 20);
    
    const currentRSI = rsi[rsi.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentVolatility = volatility[volatility.length - 1];
    
    // Calculate trend strength
    const priceChange = currentData.changePercent24h;
    const trendStrength = Math.abs(priceChange);
    
    // Determine market sentiment
    let sentiment = 'Neutral';
    let sentimentColor = 'text-gray-600';
    
    if (currentRSI > 70 && priceChange > 0) {
      sentiment = 'Overbought';
      sentimentColor = 'text-red-600';
    } else if (currentRSI < 30 && priceChange < 0) {
      sentiment = 'Oversold';
      sentimentColor = 'text-green-600';
    } else if (priceChange > 1) {
      sentiment = 'Bullish';
      sentimentColor = 'text-green-600';
    } else if (priceChange < -1) {
      sentiment = 'Bearish';
      sentimentColor = 'text-red-600';
    }
    
    // Calculate support and resistance levels
    const recentPrices = prices.slice(-20);
    const support = Math.min(...recentPrices);
    const resistance = Math.max(...recentPrices);
    
    return {
      rsi: currentRSI,
      sma20: currentSMA20,
      sma50: currentSMA50,
      volatility: currentVolatility,
      trendStrength,
      sentiment,
      sentimentColor,
      support,
      resistance
    };
  }, [currentData, getHistoryForTimeframe]);

  const priceChange = currentData.changePercent24h;
  const isPositive = priceChange >= 0;

  const metrics = [
    {
      title: 'Current Price',
      value: formatCurrency(currentData.price),
      change: currentData.changePercent24h,
      icon: DollarSign,
      color: 'amber'
    },
    {
      title: '24h Change',
      value: formatCurrency(Math.abs(currentData.change24h)),
      change: currentData.changePercent24h,
      icon: currentData.changePercent24h >= 0 ? TrendingUp : TrendingDown,
      color: currentData.changePercent24h >= 0 ? 'green' : 'red'
    },
    {
      title: 'Market Cap',
      value: `$${formatNumber(currentData.marketCap)}`,
      change: currentData.changePercent24h,
      icon: BarChart3,
      color: 'blue'
    },
    {
      title: 'Total Supply',
      value: formatNumber(currentData.totalSupply),
      change: 0,
      icon: Coins,
      color: 'purple'
    },
    {
      title: '24h Volume',
      value: `$${formatNumber(currentData.volume24h)}`,
      change: Math.random() * 20 - 10, // Simulated volume change
      icon: BarChart3,
      color: 'indigo'
    },
    {
      title: 'Backing Ratio',
      value: `${currentData.backingRatio.toFixed(1)}%`,
      change: 0,
      icon: Shield,
      color: 'emerald'
    }
  ];

  const getColorClasses = (color: string, isBackground: boolean = false) => {
    const prefix = isBackground ? 'bg' : 'text';
    const colorMap: Record<string, string> = {
      amber: `${prefix}-amber-600`,
      green: `${prefix}-green-600`,
      red: `${prefix}-red-600`,
      blue: `${prefix}-blue-600`,
      purple: `${prefix}-purple-600`,
      indigo: `${prefix}-indigo-600`,
      emerald: `${prefix}-emerald-600`
    };
    return colorMap[color] || `${prefix}-gray-600`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Market Metrics</h2>
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-amber-600" />
          <span className="text-sm text-gray-500 dark:text-gray-400">Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Price Metrics */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Price</p>
                <p className="text-2xl font-bold text-amber-600">
                  {formatCurrency(currentData.price)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
            <div className={`flex items-center mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{formatPercentage(Math.abs(priceChange))}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">24h High</p>
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(currentData.high24h)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">24h Low</p>
              <p className="text-lg font-semibold text-red-600">
                {formatCurrency(currentData.low24h)}
              </p>
            </div>
          </div>
        </div>

        {/* Technical Indicators */}
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">RSI (14)</p>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className={`text-2xl font-bold ${
              technicalMetrics.rsi > 70 ? 'text-red-600' : 
              technicalMetrics.rsi < 30 ? 'text-green-600' : 
              'text-blue-600'
            }`}>
              {technicalMetrics.rsi ? technicalMetrics.rsi.toFixed(1) : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {technicalMetrics.rsi > 70 ? 'Overbought' : 
               technicalMetrics.rsi < 30 ? 'Oversold' : 'Neutral'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">SMA 20</p>
              <p className="text-sm font-semibold text-purple-600">
                {technicalMetrics.sma20 ? formatCurrency(technicalMetrics.sma20) : 'N/A'}
              </p>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">SMA 50</p>
              <p className="text-sm font-semibold text-indigo-600">
                {technicalMetrics.sma50 ? formatCurrency(technicalMetrics.sma50) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Market Sentiment */}
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Sentiment</p>
              <Target className="h-5 w-5 text-gray-500" />
            </div>
            <div className={`text-xl font-bold ${technicalMetrics.sentimentColor}`}>
              {technicalMetrics.sentiment}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Trend Strength: {technicalMetrics.trendStrength.toFixed(2)}%
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Support</p>
              <p className="text-sm font-semibold text-green-600">
                {formatCurrency(technicalMetrics.support)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Resistance</p>
              <p className="text-sm font-semibold text-red-600">
                {formatCurrency(technicalMetrics.resistance)}
              </p>
            </div>
          </div>
        </div>

        {/* Volume & Volatility */}
        <div className="space-y-4">
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">24h Volume</p>
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">
              ${(currentData.volume24h / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Market Cap: ${(currentData.marketCap / 1000000).toFixed(2)}M
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Volatility</p>
              <p className="text-sm font-semibold text-yellow-600">
                {technicalMetrics.volatility ? technicalMetrics.volatility.toFixed(2) : 'N/A'}%
              </p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Backing Ratio</p>
              <p className="text-sm font-semibold text-cyan-600">
                {currentData.backingRatio.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Market Summary</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {isPositive ? (
            <p>
              PGAUx is showing <span className="text-green-600 font-medium">bullish momentum</span> with a 
              {technicalMetrics.rsi > 70 ? ' potentially overbought condition' : 
               technicalMetrics.rsi < 30 ? ' oversold condition indicating potential reversal' : 
               ' neutral technical indicators'}. 
              Volatility is {technicalMetrics.volatility ? technicalMetrics.volatility.toFixed(1) : 'N/A'}% 
              indicating {technicalMetrics.volatility && technicalMetrics.volatility > 20 ? 'high' : 'moderate'} market activity.
            </p>
          ) : (
            <p>
              PGAUx is experiencing <span className="text-red-600 font-medium">bearish pressure</span> with 
              {technicalMetrics.rsi > 70 ? ' overbought conditions' : 
               technicalMetrics.rsi < 30 ? ' oversold conditions suggesting potential reversal' : 
               ' neutral technical indicators'}. 
              Volatility is {technicalMetrics.volatility ? technicalMetrics.volatility.toFixed(1) : 'N/A'}% 
              indicating {technicalMetrics.volatility && technicalMetrics.volatility > 20 ? 'high' : 'moderate'} market activity.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;