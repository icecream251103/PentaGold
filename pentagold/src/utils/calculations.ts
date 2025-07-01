// Gas estimation utilities
export const estimateGasPrice = (): Promise<number> => {
  return new Promise((resolve) => {
    // Simulate gas price estimation
    setTimeout(() => {
      const baseGas = 20; // Base gas price in gwei
      const networkCongestion = Math.random() * 10; // Random congestion factor
      resolve(Math.round(baseGas + networkCongestion));
    }, 500);
  });
};

export const estimateTransactionCost = (gasPrice: number, gasLimit: number = 150000): number => {
  // Calculate transaction cost in ETH
  return (gasPrice * gasLimit) / 1e9; // Convert from gwei to ETH
};

// Slippage calculations
export const calculateSlippage = (amount: number, slippageTolerance: number): number => {
  return amount * (slippageTolerance / 100);
};

export const calculateMinimumReceived = (amount: number, slippageTolerance: number): number => {
  return amount - calculateSlippage(amount, slippageTolerance);
};

export const calculateMaximumSent = (amount: number, slippageTolerance: number): number => {
  return amount + calculateSlippage(amount, slippageTolerance);
};

// Price impact calculations
export const calculatePriceImpact = (tradeAmount: number, liquidity: number): number => {
  // Simplified price impact calculation
  const impact = (tradeAmount / liquidity) * 100;
  return Math.min(impact, 15); // Cap at 15%
};

// Technical Analysis Functions
export const calculateSMA = (data: number[], period: number): number[] => {
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

export const calculateEMA = (data: number[], period: number): number[] => {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i]);
    } else if (i < period - 1) {
      ema.push(NaN);
    } else {
      const prevEMA = ema[i - 1] || data[i - 1];
      const newEMA = (data[i] * multiplier) + (prevEMA * (1 - multiplier));
      ema.push(newEMA);
    }
  }
  return ema;
};

export const calculateRSI = (data: number[], period: number = 14): number[] => {
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
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        const rsiValue = 100 - (100 / (1 + rs));
        rsi.push(rsiValue);
      }
    }
  }
  return rsi;
};

export const calculateBollingerBands = (data: number[], period: number = 20, stdDev: number = 2) => {
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
  
  return { upper, lower, middle: sma };
};

export const calculateMACD = (data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
  const ema12 = calculateEMA(data, fastPeriod);
  const ema26 = calculateEMA(data, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(ema12[i]) || isNaN(ema26[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(ema12[i] - ema26[i]);
    }
  }
  
  const signalLine = calculateEMA(macdLine.filter(val => !isNaN(val)), signalPeriod);
  const histogram: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - signalLine[i]);
    }
  }
  
  return { macdLine, signalLine, histogram };
};

export const calculateStochastic = (highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) => {
  const kValues: number[] = [];
  const dValues: number[] = [];
  
  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(NaN);
      dValues.push(NaN);
    } else {
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const close = closes[i];
      
      const highestHigh = Math.max(...highSlice);
      const lowestLow = Math.min(...lowSlice);
      
      const k = ((close - lowestLow) / (highestHigh - lowestLow)) * 100;
      kValues.push(k);
      
      // Calculate %D (SMA of %K)
      if (i >= kPeriod + dPeriod - 2) {
        const kSlice = kValues.slice(i - dPeriod + 1, i + 1);
        const d = kSlice.reduce((sum, val) => sum + val, 0) / dPeriod;
        dValues.push(d);
      } else {
        dValues.push(NaN);
      }
    }
  }
  
  return { k: kValues, d: dValues };
};

export const calculateVolatility = (data: number[], period: number = 20): number[] => {
  const volatility: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      volatility.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const returns = slice.slice(1).map((price, index) => 
        (price - slice[index]) / slice[index]
      );
      
      const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
      const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
      const stdDev = Math.sqrt(variance);
      
      volatility.push(stdDev * Math.sqrt(252) * 100); // Annualized volatility
    }
  }
  
  return volatility;
};

// Format utilities
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
};

// Validation utilities
export const validateAmount = (amount: string, balance: number): string | null => {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount) || numAmount <= 0) {
    return 'Please enter a valid amount';
  }
  
  if (numAmount > balance) {
    return 'Insufficient balance';
  }
  
  return null;
};

export const validateSlippage = (slippage: number): string | null => {
  if (slippage < 0.1) {
    return 'Slippage too low - transaction may fail';
  }
  
  if (slippage > 10) {
    return 'Slippage too high - consider reducing';
  }
  
  return null;
};