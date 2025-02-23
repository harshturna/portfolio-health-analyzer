import { z } from "zod";

import { calculatePositionRiskLevel } from "@/lib/utils";

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

export const chatPlaceHolderQuestions: {
  title: string;
  description: string;
}[] = [
  {
    title: "Summarize",
    description: " Spotify's latest conference call.",
  },
  {
    title: "How many",
    description: " new large deals did ServiceNow sign in the last quarter?",
  },
  {
    title: "Compare",
    description: "top 3 cloud providers on their security investments",
  },
  {
    title: "What are",
    description:
      "Mark Zuckerberg's and Satya Nadella's recent comments about AI?",
  },
];

export const portfolioPlaceholderQuestions: {
  title: string;
  description: string;
}[] = [
  {
    title: "Can you give me",
    description: "a quick summary of my portfolio's current state?",
  },
  {
    title: "What is my biggest ",
    description: "concentration risk right now?",
  },
  {
    title: "What sectors am",
    description: "I missing entirely from my portfolio?",
  },
  {
    title: "Am I too heavily",
    description: "weighted in Technology compared to the S&P 500?",
  },
];

export const incomeStatementMetrics = [
  "revenue",
  "gross profit",
  "net income",
  "operating income",
  "eps",
  "ebitda",
  "profit margin",
  "operating margin",
  "tax rate",
  "interest expense",
  "sales",
] as const;

export const balanceSheetMetrics = [
  "assets",
  "liabilities",
  "equity",
  "debt",
  "cash",
  "current assets",
  "current liabilities",
  "inventory",
  "accounts receivable",
  "accounts payable",
] as const;

export const cashFlowMetrics = [
  "operating cash flow",
  "free cash flow",
  "capital expenditure",
  "dividends paid",
  "cash flow from investing",
  "cash flow from financing",
] as const;

export const keyMetrics = [
  "pe ratio",
  "price to earnings",
  "pb ratio",
  "price to book",
  "market cap",
  "eps growth",
  "revenue growth",
  "debt to equity",
  "roe",
  "roa",
] as const;

export const ratioMetrics = [
  "current ratio",
  "quick ratio",
  "debt ratio",
  "debt to equity",
  "return on equity",
  "return on assets",
  "gross margin",
  "profit margin",
] as const;

export type IncomeStatementMetric = (typeof incomeStatementMetrics)[number];
export type BalanceSheetMetric = (typeof balanceSheetMetrics)[number];
export type CashFlowMetric = (typeof cashFlowMetrics)[number];
export type KeyMetric = (typeof keyMetrics)[number];
export type RatioMetric = (typeof ratioMetrics)[number];

export type FinancialMetric =
  | IncomeStatementMetric
  | BalanceSheetMetric
  | CashFlowMetric
  | KeyMetric
  | RatioMetric;

export const allMetrics = [
  ...incomeStatementMetrics,
  ...balanceSheetMetrics,
  ...cashFlowMetrics,
  ...keyMetrics,
  ...ratioMetrics,
] as const;

export const timeFrameEnum = z.enum([
  "latest_quarter",
  "previous_quarter",
  "year_to_date",
  "trailing_twelve_months",
  "specific_quarter",
  "specific_year",
  "specific_date_range",
  "past_n_quarters",
  "past_n_years",
  "not_specified",
]);

export const specificPeriodSchema = z.object({
  quarter: z.number().optional().describe("Quarter (1, 2, 3 or 4)"),
  year: z.number().optional(),
  startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
  count: z.number().optional().describe("Number of quarters/years to analyze"),
});
