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

export const injectValuesIntoPrompt = (
  promptTemplate: string,
  values: Record<string, string | number>
): string => {
  return Object.entries(values).reduce((prompt, [key, value]) => {
    const placeholder = new RegExp(`\\{{${key}\\}}`, "g");
    return prompt.replace(placeholder, String(value));
  }, promptTemplate);
};

export const addUserQuestion = (
  promptTemplate: string,
  userQuestion: string
): string => injectValuesIntoPrompt(promptTemplate, { userQuestion });

export const getCurrentDateParams = () => {
  const now = new Date();
  return {
    currentDate: now.toISOString().split("T")[0],
    currentYear: now.getFullYear(),
    currentQuarter: Math.floor(now.getMonth() / 3) + 1,
  };
};

export const calculateCurrentPrice = (listing: Listing): number =>
  listing.marketCapitalization / listing.shareOutstanding;

export const calculatePositionValue = (listing: Listing): number => {
  const currentPrice = calculateCurrentPrice(listing);
  return currentPrice * listing.userShares;
};

export const calculateTotalPortfolioValue = (listings: Listing[]): number => {
  return listings.reduce((total, listing) => {
    return total + calculatePositionValue(listing);
  }, 0);
};

export const calculatePortfolioAllocations = (
  listings: Listing[]
): Array<{ ticker: string; allocation: number }> => {
  const totalValue = calculateTotalPortfolioValue(listings);
  return listings.map((listing) => ({
    ticker: listing.ticker,
    allocation: (calculatePositionValue(listing) / totalValue) * 100,
  }));
};

export const calculatePortfolioRiskMetrics = (
  listings: Listing[]
): RiskMetrics => {
  const allocations = calculatePortfolioAllocations(listings);

  const weightedBeta = listings.reduce((total, listing, index) => {
    return total + listing.metrics.beta * (allocations[index].allocation / 100);
  }, 0);

  const volatility = listings.reduce((total, listing, index) => {
    const range =
      (listing.metrics["52WeekHigh"] - listing.metrics["52WeekLow"]) /
      listing.metrics["52WeekLow"];
    return total + range * (allocations[index].allocation / 100);
  }, 0);

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
    numberOfHoldings: listings.length,
  };
};

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

  Object.keys(sectorValues).forEach((sector) => {
    sectorValues[sector] = (sectorValues[sector] / totalValue) * 100;
  });

  return sectorValues;
};

export const calculatePositionRiskLevel = (
  listing: Listing
): "Low" | "Medium" | "High" => {
  let riskScore = 0;

  if (listing.metrics.beta > 1.5) riskScore += 3;
  else if (listing.metrics.beta > 1.2) riskScore += 2;
  else if (listing.metrics.beta > 1) riskScore += 1;

  const volatility = Math.abs(listing.metrics["52WeekPriceReturnDaily"]);
  if (volatility > 50) riskScore += 3;
  else if (volatility > 30) riskScore += 2;
  else if (volatility > 15) riskScore += 1;

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

export const generatePortfolioSummary = (listings: Listing[]) => {
  const totalValue = calculateTotalPortfolioValue(listings);
  const allocations = calculatePortfolioAllocations(listings);
  const riskMetrics = calculatePortfolioRiskMetrics(listings);
  const sectorDiversification = analyzeSectorDiversification(listings);
  const formattedSectorData = formatSectorData(sectorDiversification);

  const largestHolding = [...allocations].sort(
    (a, b) => b.allocation - a.allocation
  )[0];

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

export const calculatePortfolioRiskLevel = (
  listings: Listing[]
): RiskSummary => {
  const riskMetrics = calculatePortfolioRiskMetrics(listings);
  const sectorDiversity = analyzeSectorDiversification(listings);

  let riskScore = 0;
  const riskFactors: string[] = [];

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

  const highestSectorAllocation = Math.max(...Object.values(sectorDiversity));
  if (highestSectorAllocation > 50) {
    riskScore += 3;
    riskFactors.push("High sector concentration (>50% in one sector)");
  } else if (highestSectorAllocation > 30) {
    riskScore += 2;
    riskFactors.push("Moderate sector concentration (>30% in one sector)");
  }

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
