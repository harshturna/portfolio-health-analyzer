interface Listing {
  ticker: string;
  name: string;
  userShares: number;
  industry: string;
  exchange: string;
  currency: string;
  logoUrl: string;
  marketCapitalization: number;
  shareOutstanding: number;
  metrics: {
    "10DayAverageTradingVolume": number;
    "52WeekHigh": number;
    "52WeekLow": number;
    "52WeekLowDate": string;
    "52WeekPriceReturnDaily": number;
    beta: number;
    netMargin: {
      period: string;
      v: number;
    };
  };
}

interface MetricItem {
  key: string;
  name: string;
  getValue: (metrics: RiskMetrics) => string;
}

interface StatisticItem {
  key: string;
  name: string;
  getValue: (listing: Listing) => number | string;
}

type RiskLevel = "Low" | "Moderate" | "High";

interface RiskMetrics {
  portfolioBeta: number;
  portfolioVolatility: number;
  portfolioNetMargin: number;
  numberOfHoldings: number;
}

interface RiskSummary {
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: string[];
}
