import { calculatePositionRiskLevel } from "./utils";

export const LISTING_STATISTICS: StatisticItem[] = [
  {
    key: "beta",
    name: "Beta",
    getValue: (listing) => listing.metrics.beta,
  },
  {
    key: "yearReturn",
    name: "Year Return",
    getValue: (listing) => listing.metrics["52WeekPriceReturnDaily"],
  },
  {
    key: "riskLevel",
    name: "Risk Level",
    getValue: (listing) => calculatePositionRiskLevel(listing),
  },
  {
    key: "annualHigh",
    name: "Annual High",
    getValue: (listing) => listing.metrics["52WeekHigh"],
  },
  {
    key: "annualLow",
    name: "Annual Low",
    getValue: (listing) => listing.metrics["52WeekLow"],
  },
];

export const METRICS: MetricItem[] = [
  {
    key: "beta",
    name: "Beta",
    getValue: (metrics) => metrics.portfolioBeta.toFixed(3),
  },
  {
    key: "netMargin",
    name: "Net Margin",
    getValue: (metrics) => `${(metrics.portfolioNetMargin * 100).toFixed(2)}%`,
  },
  {
    key: "volatility",
    name: "Volatility",
    getValue: (metrics) => metrics.portfolioVolatility.toFixed(3),
  },
  {
    key: "totalHoldings",
    name: "Total Holdings",
    getValue: (metrics) => metrics.numberOfHoldings.toString(),
  },
];
