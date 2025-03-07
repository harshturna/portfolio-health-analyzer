import { getTimeFrameParams } from "@/lib/utils";
import {
  BalanceSheetMetric,
  balanceSheetMetrics,
  CashFlowMetric,
  cashFlowMetrics,
  IncomeStatementMetric,
  incomeStatementMetrics,
  KeyMetric,
  keyMetrics,
  RatioMetric,
  ratioMetrics,
} from "@/lib/constants";

const FMP_API_BASE_URL = "https://financialmodelingprep.com/api/v3";
const API_KEY = process.env.FMP_API_KEY;

if (!API_KEY) {
  console.warn("FMP_API_KEY is not defined in environment variables");
}

const fetchFmpApi = async (endpoint: string, params: string): Promise<any> => {
  const url = `${FMP_API_BASE_URL}${endpoint}?apikey=${API_KEY}${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (Array.isArray(data) && data.length === 0) {
    throw new Error("No data returned from API");
  }

  return data;
};

const getRequiredStatements = (metrics: string[]): string[] => {
  const statements = new Set<string>();

  for (const metric of metrics) {
    if (incomeStatementMetrics.includes(metric as IncomeStatementMetric)) {
      statements.add("income-statement");
    }
    if (balanceSheetMetrics.includes(metric as BalanceSheetMetric)) {
      statements.add("balance-sheet-statement");
    }
    if (cashFlowMetrics.includes(metric as CashFlowMetric)) {
      statements.add("cash-flow-statement");
    }
    if (keyMetrics.includes(metric as KeyMetric)) {
      statements.add("key-metrics");
    }
    if (ratioMetrics.includes(metric as RatioMetric)) {
      statements.add("ratios");
    }
  }

  return Array.from(statements);
};

export const fetchDataForQuery = async (
  queryResult: QueryResult
): Promise<any> => {
  if (queryResult.error) {
    throw new Error(
      `Cannot fetch data for query with error: ${queryResult.error}`
    );
  }

  switch (queryResult.type) {
    case "TRANSCRIPT_SUMMARY":
      return fetchTranscriptSummary(queryResult.data);
    case "EXECUTIVE_STATEMENTS":
      return fetchExecutiveStatements(queryResult.data);
    case "FINANCIAL_DATA_QUERY":
      return fetchFinancialData(queryResult.data);
    case "METRIC_ANALYSIS":
      return fetchMetricAnalysis(queryResult.data);
    case "TRANSCRIPT_COMPARISON":
      return fetchTranscriptComparison(queryResult.data);
    case "METRIC_COMPARISON":
      return fetchMetricComparison(queryResult.data);
    default:
      throw new Error(`Unsupported query type: ${(queryResult as any).type}`);
  }
};

const fetchTranscriptSummary = async (
  data: TranscriptSummaryData
): Promise<any> => {
  const { ticker, timeFrame, specificPeriod } = data;
  if (!ticker) throw new Error("Ticker required");

  const endpoint = `/earning_call_transcript/${ticker}`;
  const params = getTimeFrameParams(timeFrame, specificPeriod);

  const transcripts = await fetchFmpApi(endpoint, params);
  return timeFrame === "previous_quarter" && transcripts.length > 1
    ? transcripts[1]
    : transcripts;
};

const fetchExecutiveStatements = async (
  data: ExecutiveStatementsData
): Promise<any> => {
  const { tickers, executives, topics, timeFrame, specificPeriod } = data;
  if (!tickers?.length) throw new Error("At least one ticker required");

  const fetchPromises = tickers.filter(Boolean).map(async (ticker) => {
    const endpoint = `/earning_call_transcript/${ticker}`;
    const transcripts = await fetchFmpApi(
      endpoint,
      getTimeFrameParams(timeFrame, specificPeriod)
    );
    return [ticker, { transcripts, executives, topics }];
  });

  const results = await Promise.all(fetchPromises);
  return Object.fromEntries(results);
};

const fetchFinancialData = async (
  data: FinancialDataQueryData
): Promise<any> => {
  const { ticker, metrics, timeFrame, specificPeriod } = data;
  if (!ticker) throw new Error("Ticker required");

  const statements = getRequiredStatements(metrics);
  const params = getTimeFrameParams(timeFrame, specificPeriod);

  const fetchPromises = [
    ...statements.map(async (statement) => {
      const data = await fetchFmpApi(`/${statement}/${ticker}`, params);
      return [statement, data];
    }),
    fetchFmpApi(`/profile/${ticker}`, "").then((data) => ["profile", data]),
  ];

  const results = await Promise.all(fetchPromises);
  return Object.fromEntries(results);
};

const fetchMetricAnalysis = async (data: MetricAnalysisData): Promise<any> => {
  const { ticker, metric, timeFrame, specificPeriod } = data;
  if (!ticker) throw new Error("Ticker required");

  const statements = getRequiredStatements([metric]);
  const params = getTimeFrameParams(timeFrame, specificPeriod);

  const fetchPromises = [
    ...statements.map(async (statement) => {
      const data = await fetchFmpApi(`/${statement}/${ticker}`, params);
      return [statement, data];
    }),
    fetchFmpApi(`/earning_call_transcript/${ticker}`, params).then((data) => [
      "transcripts",
      data,
    ]),
  ];

  const results = await Promise.all(fetchPromises);
  return Object.fromEntries(results);
};

const fetchTranscriptComparison = async (
  data: TranscriptComparisonData
): Promise<any> => {
  const { tickers, comparisonTopic, timeFrame, specificPeriod } = data;
  if (!tickers?.length) throw new Error("At least one ticker required");

  const fetchPromises = tickers.filter(Boolean).map(async (ticker) => {
    const endpoint = `/earning_call_transcript/${ticker}`;
    const transcripts = await fetchFmpApi(
      endpoint,
      getTimeFrameParams(timeFrame, specificPeriod)
    );
    return [ticker, { transcripts, comparisonTopic }];
  });

  const results = await Promise.all(fetchPromises);
  return Object.fromEntries(results);
};

const fetchMetricComparison = async (
  data: MetricComparisonData
): Promise<any> => {
  const { tickers, metrics, timeFrame, specificPeriod } = data;
  if (!tickers?.length) throw new Error("At least one ticker required");

  const statements = getRequiredStatements(metrics);
  const params = getTimeFrameParams(timeFrame, specificPeriod);

  const fetchPromises = tickers.filter(Boolean).map(async (ticker) => {
    const statementPromises = [
      ...statements.map(async (statement) => {
        const data = await fetchFmpApi(`/${statement}/${ticker}`, params);
        return [statement, data];
      }),
      fetchFmpApi(`/profile/${ticker}`, "").then((data) => ["profile", data]),
    ];

    const results = await Promise.all(statementPromises);
    return [ticker, Object.fromEntries(results)];
  });

  const results = await Promise.all(fetchPromises);
  return Object.fromEntries(results);
};
