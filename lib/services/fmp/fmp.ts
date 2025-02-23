import {
  BalanceSheetMetric,
  BalanceSheetMetrics,
  CashFlowMetric,
  CashFlowMetrics,
  IncomeStatementMetric,
  IncomeStatementMetrics,
  KeyMetric,
  KeyMetrics,
  RatioMetric,
  RatioMetrics,
} from "@/lib/constants";

const FMP_API_BASE_URL = "https://financialmodelingprep.com/api/v3";
const API_KEY = process.env.FMP_API_KEY;

if (!API_KEY) {
  console.warn("FMP_API_KEY is not defined in environment variables");
}

function getTimeFrameParams(
  timeFrame: TimeFrame,
  specificPeriod?: SpecificPeriod
): string {
  const params = new URLSearchParams();

  switch (timeFrame) {
    case "latest_quarter":
      params.set("period", "quarter");
      params.set("limit", "1");
      break;
    case "previous_quarter":
      params.set("period", "quarter");
      params.set("limit", "2");
      break;
    case "year_to_date":
      params.set("period", "quarter");
      params.set("from", `${new Date().getFullYear()}-01-01`);
      break;
    case "trailing_twelve_months":
      params.set("period", "quarter");
      params.set("limit", "4");
      break;
    case "specific_quarter":
      if (specificPeriod?.quarter && specificPeriod?.year) {
        params.set("period", "quarter");
        params.set("year", specificPeriod.year.toString());
        params.set("quarter", specificPeriod.quarter.toString());
      }
      break;
    case "specific_year":
      if (specificPeriod?.year) {
        params.set("period", "annual");
        params.set("year", specificPeriod.year.toString());
      }
      break;
    case "specific_date_range":
      if (specificPeriod?.startDate && specificPeriod?.endDate) {
        params.set("from", specificPeriod.startDate);
        params.set("to", specificPeriod.endDate);
      }
      break;
    case "past_n_quarters":
      params.set("period", "quarter");
      params.set("limit", (specificPeriod?.count || 4).toString());
      break;
    case "past_n_years":
      params.set("period", "annual");
      params.set("limit", (specificPeriod?.count || 1).toString());
      break;
    default:
      params.set("period", "quarter");
      params.set("limit", "1");
  }
  return `&${params.toString()}`;
}

async function fetchFmpApi(endpoint: string, params: string): Promise<any> {
  const url = `${FMP_API_BASE_URL}${endpoint}?apikey=${API_KEY}${params}`;

  console.log("FMP_URL", url);

  const response = await fetch(url);
  console.log("FMP_RESPONSE", response);
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log("FMP_DATA", data);
  if (Array.isArray(data) && data.length === 0) {
    throw new Error("No data returned from API");
  }

  return data;
}

function getRequiredStatements(metrics: string[]): string[] {
  const statements = new Set<string>();

  for (const metric of metrics) {
    if (IncomeStatementMetrics.includes(metric as IncomeStatementMetric)) {
      statements.add("income-statement");
    }
    if (BalanceSheetMetrics.includes(metric as BalanceSheetMetric)) {
      statements.add("balance-sheet-statement");
    }
    if (CashFlowMetrics.includes(metric as CashFlowMetric)) {
      statements.add("cash-flow-statement");
    }
    if (KeyMetrics.includes(metric as KeyMetric)) {
      statements.add("key-metrics");
    }
    if (RatioMetrics.includes(metric as RatioMetric)) {
      statements.add("ratios");
    }
  }

  return Array.from(statements);
}

export async function fetchDataForQuery(
  queryResult: QueryResult
): Promise<any> {
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
}

async function fetchTranscriptSummary(
  data: TranscriptSummaryData
): Promise<any> {
  const { ticker, timeFrame, specificPeriod } = data;
  if (!ticker) throw new Error("Ticker required");

  const endpoint = `/earning_call_transcript/${ticker}`;
  const params = getTimeFrameParams(timeFrame, specificPeriod);

  const transcripts = await fetchFmpApi(endpoint, params);
  return timeFrame === "previous_quarter" && transcripts.length > 1
    ? transcripts[1]
    : transcripts;
}

async function fetchExecutiveStatements(
  data: ExecutiveStatementsData
): Promise<any> {
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
}

async function fetchFinancialData(data: FinancialDataQueryData): Promise<any> {
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
}

async function fetchMetricAnalysis(data: MetricAnalysisData): Promise<any> {
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
}

async function fetchTranscriptComparison(
  data: TranscriptComparisonData
): Promise<any> {
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
}

async function fetchMetricComparison(data: MetricComparisonData): Promise<any> {
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
}
