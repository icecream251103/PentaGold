import { useState, useEffect, useCallback } from 'react';

export interface PriceData {
  price: number;
  timestamp: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  backingRatio: number;
  open24h: number;
  close24h: number;
}

export interface PriceHistory {
  timestamp: number;
  price: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const REFRESH_INTERVAL = 15000; // 15 seconds for more frequent updates
const BASE_PRICE = 3350;
const BASE_SUPPLY = 1000000;
const BASE_MARKET_CAP = BASE_PRICE * BASE_SUPPLY;

// Enhanced price movement simulation with market patterns
const generatePriceMovement = (lastPrice: number, timeOfDay: number): number => {
  // Market volatility varies by time of day
  const baseVolatility = 0.001; // 0.1% base volatility
  const timeMultiplier = 1 + Math.sin(timeOfDay / 24 * Math.PI) * 0.5; // Higher volatility during active hours
  const volatility = baseVolatility * timeMultiplier;
  
  // Add market momentum (trend following)
  const momentum = Math.random() < 0.6 ? 1 : -1; // 60% chance of continuing trend
  const trendStrength = Math.random() * 0.3 + 0.1; // 10-40% trend strength
  
  // Random noise
  const noise = (Math.random() - 0.5) * volatility * 2;
  
  // Combine factors
  const change = (momentum * trendStrength * volatility) + noise;
  
  let newPrice = lastPrice * (1 + change);
  
  // Ensure price stays within realistic bounds
  newPrice = Math.max(3300, Math.min(3400, newPrice));
  
  return Number(newPrice.toFixed(2));
};

// Generate OHLC data for more realistic chart
const generateOHLC = (lastClose: number, timeOfDay: number): { open: number; high: number; low: number; close: number } => {
  const open = lastClose;
  const close = generatePriceMovement(open, timeOfDay);
  
  // Generate high and low within the period
  const range = Math.abs(close - open) * (1 + Math.random() * 2); // 1-3x the close-open range
  const high = Math.max(open, close) + Math.random() * range * 0.5;
  const low = Math.min(open, close) - Math.random() * range * 0.5;
  
  return {
    open: Number(open.toFixed(2)),
    high: Number(high.toFixed(2)),
    low: Number(low.toFixed(2)),
    close: Number(close.toFixed(2))
  };
};

export const useGoldPrice = () => {
  const [currentData, setCurrentData] = useState<PriceData>({
    price: BASE_PRICE,
    timestamp: Date.now(),
    change24h: 0,
    changePercent24h: 0,
    high24h: BASE_PRICE,
    low24h: BASE_PRICE,
    volume24h: 2500000,
    marketCap: BASE_MARKET_CAP,
    totalSupply: BASE_SUPPLY,
    backingRatio: 98.5,
    open24h: BASE_PRICE,
    close24h: BASE_PRICE
  });

  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize price history with realistic data
  useEffect(() => {
    const initializeHistory = () => {
      const history: PriceHistory[] = [];
      const now = Date.now();
      let lastClose = BASE_PRICE;
      
      // Generate 7 days of historical data (every 5 minutes = 2016 points)
      for (let i = 2016; i >= 0; i--) {
        const timestamp = now - (i * 5 * 60 * 1000);
        const date = new Date(timestamp);
        const timeOfDay = date.getHours() + date.getMinutes() / 60;
        
        const ohlc = generateOHLC(lastClose, timeOfDay);
        lastClose = ohlc.close;
        
        history.push({
          timestamp,
          price: ohlc.close, // Use close price for main price
          volume: Math.random() * 100000 + 50000, // 50k-150k volume per period
          open: ohlc.open,
          high: ohlc.high,
          low: ohlc.low,
          close: ohlc.close
        });
      }
      
      setPriceHistory(history);
      
      // Calculate 24h stats
      const last24h = history.slice(-288); // Last 24 hours (288 * 5 minutes)
      const firstPrice = last24h[0].open;
      const lastPrice = last24h[last24h.length - 1].close;
      const change24h = lastPrice - firstPrice;
      const changePercent24h = (change24h / firstPrice) * 100;
      
      const highs = last24h.map(h => h.high);
      const lows = last24h.map(h => h.low);
      const high24h = Math.max(...highs);
      const low24h = Math.min(...lows);
      const volume24h = last24h.reduce((sum, h) => sum + h.volume, 0);
      
      setCurrentData(prev => ({
        ...prev,
        price: lastPrice,
        change24h,
        changePercent24h,
        high24h,
        low24h,
        volume24h,
        open24h: firstPrice,
        close24h: lastPrice,
        timestamp: now
      }));
      
      setIsLoading(false);
    };

    initializeHistory();
  }, []);

  // Update price periodically with enhanced logic
  useEffect(() => {
    if (priceHistory.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const date = new Date(now);
      const timeOfDay = date.getHours() + date.getMinutes() / 60;
      
      const lastClose = currentData.price;
      const ohlc = generateOHLC(lastClose, timeOfDay);
      
      // Add new price to history
      const newHistoryPoint: PriceHistory = {
        timestamp: now,
        price: ohlc.close,
        volume: Math.random() * 100000 + 50000,
        open: ohlc.open,
        high: ohlc.high,
        low: ohlc.low,
        close: ohlc.close
      };
      
      setPriceHistory(prev => {
        const updated = [...prev.slice(-2015), newHistoryPoint]; // Keep last 7 days
        
        // Recalculate 24h stats
        const last24h = updated.slice(-288);
        const firstPrice = last24h[0].open;
        const change24h = ohlc.close - firstPrice;
        const changePercent24h = (change24h / firstPrice) * 100;
        
        const highs = last24h.map(h => h.high);
        const lows = last24h.map(h => h.low);
        const high24h = Math.max(...highs);
        const low24h = Math.min(...lows);
        const volume24h = last24h.reduce((sum, h) => sum + h.volume, 0);
        
        setCurrentData(prevData => ({
          ...prevData,
          price: ohlc.close,
          change24h,
          changePercent24h,
          high24h,
          low24h,
          volume24h,
          open24h: firstPrice,
          close24h: ohlc.close,
          marketCap: ohlc.close * prevData.totalSupply,
          timestamp: now
        }));
        
        return updated;
      });
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [currentData.price, priceHistory.length]);

  const getHistoryForTimeframe = useCallback((timeframe: '1H' | '4H' | '1D' | '1W' | '1M') => {
    const now = Date.now();
    let cutoffTime: number;
    
    switch (timeframe) {
      case '1H':
        cutoffTime = now - (60 * 60 * 1000);
        break;
      case '4H':
        cutoffTime = now - (4 * 60 * 60 * 1000);
        break;
      case '1D':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case '1W':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case '1M':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = now - (24 * 60 * 60 * 1000);
    }
    
    return priceHistory.filter(point => point.timestamp >= cutoffTime);
  }, [priceHistory]);

  // Get aggregated data for different timeframes
  const getAggregatedData = useCallback((timeframe: '1H' | '4H' | '1D' | '1W' | '1M') => {
    const history = getHistoryForTimeframe(timeframe);
    
    if (history.length === 0) return [];
    
    // Group data by time intervals
    const intervals: { [key: string]: PriceHistory[] } = {};
    
    history.forEach(point => {
      const date = new Date(point.timestamp);
      let key: string;
      
      switch (timeframe) {
        case '1H':
          key = `${date.getHours()}:${Math.floor(date.getMinutes() / 5) * 5}`;
          break;
        case '4H':
          key = `${date.getHours()}:${Math.floor(date.getMinutes() / 15) * 15}`;
          break;
        case '1D':
          key = `${date.getHours()}:${Math.floor(date.getMinutes() / 30) * 30}`;
          break;
        case '1W':
          key = date.toLocaleDateString();
          break;
        case '1M':
          key = date.toLocaleDateString();
          break;
        default:
          key = date.toLocaleTimeString();
      }
      
      if (!intervals[key]) {
        intervals[key] = [];
      }
      intervals[key].push(point);
    });
    
    // Aggregate each interval
    return Object.entries(intervals).map(([key, points]) => {
      const open = points[0].open;
      const close = points[points.length - 1].close;
      const high = Math.max(...points.map(p => p.high));
      const low = Math.min(...points.map(p => p.low));
      const volume = points.reduce((sum, p) => sum + p.volume, 0);
      const timestamp = points[0].timestamp;
      
      return {
        timestamp,
        price: close,
        volume,
        open,
        high,
        low,
        close,
        label: key
      };
    });
  }, [getHistoryForTimeframe]);

  return {
    currentData,
    priceHistory,
    getHistoryForTimeframe,
    getAggregatedData,
    isLoading,
    error,
    refresh: () => {
      setIsLoading(true);
      // Trigger a refresh
      setTimeout(() => setIsLoading(false), 1000);
    }
  };
};