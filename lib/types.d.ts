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
