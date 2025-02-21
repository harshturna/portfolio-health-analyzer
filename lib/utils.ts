import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isObjectEmpty = (obj: object) => {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
};

/**
 * Calculate current stock price from market cap and shares outstanding
 */
export const calculateCurrentPrice = (listing: Listing): number =>
  listing.marketCapitalization / listing.shareOutstanding;

/**
 * Calculate total value of a stock position
 */
export const calculatePositionValue = (listing: Listing): number => {
  const currentPrice = calculateCurrentPrice(listing);
  return currentPrice * listing.userShares;
};

/**
 * Calculate total portfolio value
 */
export const calculateTotalPortfolioValue = (listings: Listing[]): number => {
  return listings.reduce((total, listing) => {
    return total + calculatePositionValue(listing);
  }, 0);
};

/**
 * Calculate percentage allocation of each position in portfolio
 * Returns array of positions with their allocations
 */
export const calculatePortfolioAllocations = (
  listings: Listing[]
): Array<{ ticker: string; allocation: number }> => {
  const totalValue = calculateTotalPortfolioValue(listings);
  return listings.map((listing) => ({
    ticker: listing.ticker,
    allocation: (calculatePositionValue(listing) / totalValue) * 100,
  }));
};

/**
 * Calculate portfolio risk metrics
 * - Beta weighted by position size
 * - Portfolio volatility using 52 week ranges
 * - Average net margin weighted by position size
 */
export const calculatePortfolioRiskMetrics = (listings: Listing[]) => {
  const allocations = calculatePortfolioAllocations(listings);

  // Calculate weighted beta
  const weightedBeta = listings.reduce((total, listing, index) => {
    return total + listing.metrics.beta * (allocations[index].allocation / 100);
  }, 0);

  // Calculate average volatility (using 52 week range)
  const volatility = listings.reduce((total, listing, index) => {
    const range =
      (listing.metrics["52WeekHigh"] - listing.metrics["52WeekLow"]) /
      listing.metrics["52WeekLow"];
    return total + range * (allocations[index].allocation / 100);
  }, 0);

  // Calculate weighted net margin
  const weightedNetMargin = listings.reduce((total, listing, index) => {
    return (
      total +
      listing.metrics.netMargin.v * (allocations[index].allocation / 100)
    );
  }, 0);

  return {
    portfolioBeta: weightedBeta,
    portfolioVolatility: volatility,
    portfolioNetMargin: weightedNetMargin,
  };
};

/**
 * Analyze sector diversification
 * Returns percentage allocation by industry
 */
export const analyzeSectorDiversification = (
  listings: Listing[]
): Record<string, number> => {
  const totalValue = calculateTotalPortfolioValue(listings);
  const sectorValues: Record<string, number> = {};

  listings.forEach((listing) => {
    const value = calculatePositionValue(listing);
    sectorValues[listing.industry] =
      (sectorValues[listing.industry] || 0) + value;
  });

  // Convert to percentages
  Object.keys(sectorValues).forEach((sector) => {
    sectorValues[sector] = (sectorValues[sector] / totalValue) * 100;
  });

  return sectorValues;
};

/**
 * Calculate risk level for each position
 * Considers:
 * - Beta (market sensitivity)
 * - 52 week return volatility
 * - Trading volume (liquidity)
 * Returns: 'Low' | 'Medium' | 'High'
 */
export const calculatePositionRiskLevel = (
  listing: Listing
): "Low" | "Medium" | "High" => {
  let riskScore = 0;

  // Beta risk
  if (listing.metrics.beta > 1.5) riskScore += 3;
  else if (listing.metrics.beta > 1.2) riskScore += 2;
  else if (listing.metrics.beta > 1) riskScore += 1;

  // Volatility risk (52 week return)
  const volatility = Math.abs(listing.metrics["52WeekPriceReturnDaily"]);
  if (volatility > 50) riskScore += 3;
  else if (volatility > 30) riskScore += 2;
  else if (volatility > 15) riskScore += 1;

  // Volume risk (liquidity)
  if (listing.metrics["10DayAverageTradingVolume"] < 100000) riskScore += 2;
  else if (listing.metrics["10DayAverageTradingVolume"] < 500000)
    riskScore += 1;

  return riskScore >= 5 ? "High" : riskScore >= 3 ? "Medium" : "Low";
};

const formatSectorData = (
  sectorData: Record<string, number>
): Array<{ sector: string; allocation: number }> => {
  return Object.entries(sectorData).map(([sector, value]) => ({
    sector,
    allocation: Number(value.toFixed(2)),
  }));
};

/**
 * Generate portfolio summary with key metrics
 */
export const generatePortfolioSummary = (listings: Listing[]) => {
  const totalValue = calculateTotalPortfolioValue(listings);
  const allocations = calculatePortfolioAllocations(listings);
  const riskMetrics = calculatePortfolioRiskMetrics(listings);
  const sectorDiversification = analyzeSectorDiversification(listings);
  const formattedSectorData = formatSectorData(sectorDiversification);

  // Find largest holding
  const largestHolding = [...allocations].sort(
    (a, b) => b.allocation - a.allocation
  )[0];

  // Find riskiest stock
  const riskiestStock = listings.reduce((riskiest, current) => {
    return current.metrics.beta > (riskiest?.metrics.beta || 0)
      ? current
      : riskiest;
  });

  return {
    totalValue,
    numberOfHoldings: listings.length,
    largestHolding: {
      ticker: largestHolding.ticker,
      allocation: largestHolding.allocation,
    },
    riskiestPosition: {
      ticker: riskiestStock.ticker,
      beta: riskiestStock.metrics.beta,
    },
    portfolioMetrics: riskMetrics,
    sectorAllocation: sectorDiversification,
    formattedSectorData,
  };
};

/**
 * Calculate overall portfolio risk level based on multiple factors:
 * - Weighted beta
 * - Sector concentration
 * - Individual stock risk levels
 * Returns an object with risk level and contributing factors
 */
export const calculatePortfolioRiskLevel = (
  listings: Listing[]
): RiskSummary => {
  const riskMetrics = calculatePortfolioRiskMetrics(listings);
  const sectorDiversity = analyzeSectorDiversification(listings);

  let riskScore = 0;
  const riskFactors: string[] = [];

  // Beta risk (weighted portfolio beta)
  if (riskMetrics.portfolioBeta > 1.5) {
    riskScore += 3;
    riskFactors.push("High market sensitivity (β > 1.5)");
  } else if (riskMetrics.portfolioBeta > 1.2) {
    riskScore += 2;
    riskFactors.push("Above-average market sensitivity (β > 1.2)");
  } else if (riskMetrics.portfolioBeta > 1) {
    riskScore += 1;
    riskFactors.push("Moderate market sensitivity (β > 1)");
  }

  // Sector concentration risk
  const highestSectorAllocation = Math.max(...Object.values(sectorDiversity));
  if (highestSectorAllocation > 50) {
    riskScore += 3;
    riskFactors.push("High sector concentration (>50% in one sector)");
  } else if (highestSectorAllocation > 30) {
    riskScore += 2;
    riskFactors.push("Moderate sector concentration (>30% in one sector)");
  }

  // Individual stock risk levels
  const stockRiskLevels = listings.map(calculatePositionRiskLevel);
  const highRiskCount = stockRiskLevels.filter(
    (level) => level === "High"
  ).length;
  if (highRiskCount > listings.length * 0.3) {
    riskScore += 2;
    riskFactors.push(`${highRiskCount} stocks with high risk ratings`);
  }

  return {
    riskLevel: riskScore >= 6 ? "High" : riskScore >= 3 ? "Moderate" : "Low",
    riskScore,
    riskFactors,
  };
};
