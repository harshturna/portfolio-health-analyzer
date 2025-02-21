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
