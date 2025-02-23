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

interface QueryAnalysisResult {
  queryTypes: QueryType[];
  confidenceScore: number;
  clarifyQuestion: string;
}

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

type Messages = Message[];

interface ContextAnalysisResult {
  isContinuation: boolean;
  response: string;
  relevantCompanies?: string[];
  relevantMetrics?: string[];
}

type TimeFrame =
  | "latest_quarter"
  | "previous_quarter"
  | "year_to_date"
  | "trailing_twelve_months"
  | "specific_quarter"
  | "specific_year"
  | "specific_date_range"
  | "past_n_quarters"
  | "past_n_years"
  | "not_specified";

interface SpecificPeriod {
  quarter?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  count?: number;
}

type TranscriptSummaryData = {
  company: string;
  ticker: string;
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

type ExecutiveStatementsData = {
  executives: string[];
  companies: string[];
  tickers: string[];
  topics: string[];
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

type FinancialDataQueryData = {
  company: string;
  ticker: string;
  metrics: string[];
  dataType: "single_value" | "time_series";
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

type MetricAnalysisData = {
  company: string;
  ticker: string;
  metric: string;
  analysisType: "point_in_time" | "trend_over_time";
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

type TranscriptComparisonData = {
  companies: string[];
  tickers: string[];
  comparisonTopic: string;
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

type MetricComparisonData = {
  companies: string[];
  tickers: string[];
  metrics: string[];
  timeFrame: TimeFrame;
  specificPeriod?: SpecificPeriod;
};

interface BaseQueryResult {
  error: string | null;
}

type QueryResult =
  | (BaseQueryResult & {
      type: "METRIC_COMPARISON";
      data: MetricComparisonData;
    })
  | (BaseQueryResult & {
      type: "TRANSCRIPT_SUMMARY";
      data: TranscriptSummaryData;
    })
  | (BaseQueryResult & {
      type: "EXECUTIVE_STATEMENTS";
      data: ExecutiveStatementsData;
    })
  | (BaseQueryResult & {
      type: "FINANCIAL_DATA_QUERY";
      data: FinancialDataQueryData;
    })
  | (BaseQueryResult & {
      type: "METRIC_ANALYSIS";
      data: MetricAnalysisData;
    })
  | (BaseQueryResult & {
      type: "TRANSCRIPT_COMPARISON";
      data: TranscriptComparisonData;
    });

type QueryType = QueryResult["type"];

type ChatResponse =
  | (BaseQueryResult & {
      type: "direct_response";
      message: string;
    })
  | (BaseQueryResult & {
      type: "clarification_needed";
      message: string;
    })
  | QueryResult[]
  | QueryResult;
