import { z } from "zod";
import { getCurrentDateParams } from "./utils";

const timeFrameEnum = z.enum([
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

const specificPeriodSchema = z.object({
  quarter: z.number().optional().describe("Quarter (1 or 2 or 3 or 4)"),
  year: z.number().optional(),
  startDate: z.string().optional().describe("Start date in YYYY-MM-DD format"),
  endDate: z.string().optional().describe("End date in YYYY-MM-DD format"),
  count: z.number().optional().describe("Number of quarters/years to analyze"),
});

const currDateParams = getCurrentDateParams();

export const PROMPTS = {
  FINANCIAL_ANALYZER: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Analyze the user's question and classify it into one of the following categories:
  TRANSCRIPT_SUMMARY: Provides an overall summary of an earnings call or conference call.
  EXECUTIVE_STATEMENTS: Extracts specific statements made by named executives.
  METRIC_LOOKUP: Finds specific financial metrics or KPIs mentioned in earnings calls.
  TREND_ANALYSIS: Analyzes how topics or metrics have evolved over multiple quarters.
  COMPARISON_QUERY: Compares statements or metrics across different companies.
  COMBINED_QUERY: Requests both quantitative data and qualitative commentary.
  Provide:
  1. The most appropriate query type (queryType)
  2. A confidence score (0-1) representing how clearly the query matches this type (confidenceScore)
  3. A clarifying question if the confidence score is below 0.7 that would help determine the user's intent. If the score is above 0.7, leave it empty (clarifyQuestion)
 
  User question: "{{userQuestion}}"`,

    schema: z.object({
      queryType: z.enum([
        "TRANSCRIPT_SUMMARY",
        "EXECUTIVE_STATEMENTS",
        "METRIC_LOOKUP",
        "TREND_ANALYSIS",
        "COMPARISON_QUERY",
        "COMBINED_QUERY",
      ]),
      confidenceScore: z.number(),
      clarifyQuestion: z.string(),
    }),
  },

  TRANSCRIPT_SUMMARY: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Extract the details for this earnings call summary request from the user question below.
    
    Follow these strict guidelines:
    1. Identify ONLY the exact company name as mentioned in the user question - do not infer, expand, or generate company names not explicitly stated
    2. Infer the stock ticker symbol when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. If you cannot determine the ticker with absolute certainty, leave the ticker field empty
    4. Determine which specific earnings call to summarize based on the question
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. For time periods:
       - If the user mentions "latest" or "most recent", use "latest_quarter"
       - If the user mentions "last quarter" or "previous quarter" or a similar variation, use "previous_quarter"
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions a specific quarter like "Q2 2023", use "specific_quarter" and fill in the specificPeriod details
       - If the user doesn't specify a time period, use "not_specified"
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z
        .string()
        .describe("Exact company name as mentioned in the question"),
      ticker: z
        .string()
        .describe(
          "Stock ticker symbol - infer when 100% confident, otherwise leave empty"
        ),
      timeFrame: timeFrameEnum.describe(
        "Which specific earnings call to summarize"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  EXECUTIVE_STATEMENTS: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Extract details about executive statements from the following user question.
    
    Follow these strict guidelines:
    1. Identify ONLY the exact executive names as mentioned in the user question
    2. Identify ONLY the exact company names as mentioned in the question - do not infer, expand, or generate company names not explicitly stated
    3. Infer stock ticker symbols when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    4. If you cannot determine the tickers with absolute certainty, leave the ticker entries empty
    5. Extract the specific topic of interest mentioned in the question
    6. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    7. Determine the time period for the statements based on the question:
       - If the user mentions "latest" or "most recent", use "latest_quarter"
       - If the user mentions "last quarter" or "previous quarter" or a similar variation, use "previous_quarter"
       - If the user mentions a date range like "between January and March 2023", use "specific_date_range" and fill in startDate and endDate
       - If the user mentions "past year", use "past_n_years" with count=1
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user doesn't specify a time period, use "not_specified"
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      executives: z
        .array(z.string())
        .describe("Exact names of executives as mentioned in the question"),
      companies: z
        .array(z.string())
        .describe("Exact company names as mentioned in the question"),
      tickers: z
        .array(z.string())
        .describe(
          "Stock ticker symbols - infer when 100% confident, otherwise leave empty"
        ),
      topic: z
        .string()
        .describe(
          "Specific subject matter of interest mentioned in the question"
        ),
      timeFrame: timeFrameEnum.describe(
        "Time period referenced in the question"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  METRIC_LOOKUP: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Extract details for this financial metric lookup request from the user question below.
  
    Follow these strict guidelines:
    1. Identify ONLY the exact company name as mentioned in the user question - do not infer, expand, or generate company names not explicitly stated
    2. Infer the stock ticker symbol when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. If you cannot determine the ticker with absolute certainty, leave the ticker field empty
    4. Extract all specific financial metrics or KPIs mentioned in the question
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time period for the metrics based on the question:
       - If the user mentions "latest" or "most recent quarter", use "latest_quarter"
       - If the user mentions "last quarter" or "previous quarter" or a similar variation, use "previous_quarter"
       - If the user mentions a specific quarter like "Q1 2023", use "specific_quarter" and fill in quarter and year
       - If the user mentions "full year 2022", use "specific_year" and fill in year
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions "this year", use "specific_year" and fill in year=${
         currDateParams.currentYear
       }
       - If the user mentions "TTM" or "trailing twelve months", use "trailing_twelve_months"
       - If the user mentions "YTD" or "year to date", use "year_to_date"
       - If the user doesn't specify a time period, use "not_specified"
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z
        .string()
        .describe("Exact company name as mentioned in the question"),
      ticker: z
        .string()
        .describe(
          "Stock ticker symbol - infer when 100% confident, otherwise leave empty"
        ),
      metrics: z
        .array(z.string())
        .describe(
          "All specific financial metrics or KPIs mentioned in the question"
        ),
      timeFrame: timeFrameEnum.describe("Time period for the metrics"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  TREND_ANALYSIS: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Extract details for this trend analysis request from the user question below.
    
    Follow these strict guidelines:
    1. Identify ONLY the exact company name as mentioned in the user question - do not infer, expand, or generate company names not explicitly stated
    2. Infer the stock ticker symbol when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. If you cannot determine the ticker with absolute certainty, leave the ticker field empty
    4. Extract the specific topic or metric to be analyzed over time
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time span for the trend analysis based on the question:
       - If the user mentions "past 4 quarters", use "past_n_quarters" and fill in count=4
       - If the user mentions "past year", use "past_n_years" and fill in count=1
       - If the user mentions "past 2 years", use "past_n_years" and fill in count=2
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions "this year", use "specific_year" and fill in year=${
         currDateParams.currentYear
       }
       - If the user mentions a date range like "2020 to 2023", use "specific_date_range" and fill in startDate and endDate
       - If the user doesn't specify a time period, use "not_specified"
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z
        .string()
        .describe("Exact company name as mentioned in the question"),
      ticker: z
        .string()
        .describe(
          "Stock ticker symbol - infer when 100% confident, otherwise leave empty"
        ),
      topic: z
        .string()
        .describe("Specific topic or metric to analyze over time"),
      timeFrame: timeFrameEnum.describe("Time span referenced in the question"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  COMPARISON_QUERY: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Your task is to carefully extract specific details for a comparison request from the user question.
  
    Follow these strict guidelines:
    1. Identify ONLY the exact company names as mentioned in the user question - do not infer, expand, or generate company names not explicitly stated
    2. Infer stock ticker symbols for well-known companies when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. For company names where you cannot determine the ticker with absolute certainty, leave the ticker entry empty
    4. Identify the specific comparison topic or metric mentioned (e.g., revenue, profit margin, EPS)
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time period requested for comparison:
       - If the user mentions "latest quarter", use "latest_quarter"
       - If the user mentions "previous quarter", use "previous_quarter"
       - If the user mentions "YTD" or "year to date", use "year_to_date"
       - If the user mentions "TTM" or "trailing twelve months", use "trailing_twelve_months"
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions "this year", use "specific_year" and fill in year=${
         currDateParams.currentYear
       }
       - If the user mentions a specific quarter like "Q3 2023", use "specific_quarter" and fill in quarter=3 and year=2023
       - If the user mentions a specific year like "fiscal 2022", use "specific_year" and fill in year=2022
       - If the user mentions a date range, use "specific_date_range" and fill in startDate and endDate
       - If the user doesn't specify a time period, use "not_specified"
  
    User question: "{{userQuestion}}"`,

    schema: z.object({
      companies: z
        .array(z.string())
        .describe(
          "ONLY the exact company names explicitly mentioned in the question"
        ),
      tickers: z
        .array(z.string())
        .describe(
          "Stock ticker symbols - infer for well-known companies when 100% confident, otherwise leave empty"
        ),
      comparisonTopic: z
        .string()
        .describe("Specific topic or metric requested for comparison"),
      timeFrame: timeFrameEnum.describe("Time period for comparison"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  COMBINED_QUERY: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Extract details for this combined data and commentary request from the user question below.
    
    Follow these strict guidelines:
    1. Identify ONLY the exact company name as mentioned in the user question - do not infer, expand, or generate company names not explicitly stated
    2. Infer the stock ticker symbol when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. If you cannot determine the ticker with absolute certainty, leave the ticker field empty
    4. Extract all specific financial metrics requested in the question
    5. Identify the specific topic for management commentary
    6. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    7. Determine the time period referenced in the question:
       - If the user mentions "latest quarter", use "latest_quarter"
       - If the user mentions "previous quarter", use "previous_quarter"
       - If the user mentions "YTD" or "year to date", use "year_to_date"
       - If the user mentions "past year", use "past_n_years" with count=1
       - If the user mentions "past 4 quarters", use "past_n_quarters" with count=4
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions "this year", use "specific_year" and fill in year=${
         currDateParams.currentYear
       }
       - If the user mentions a specific quarter like "Q2 2023", use "specific_quarter" and fill in quarter=2 and year=2023
       - If the user mentions a specific year like "2022", use "specific_year" and fill in year=2022
       - If the user doesn't specify a time period, use "not_specified"
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z
        .string()
        .describe("Exact company name as mentioned in the question"),
      ticker: z
        .string()
        .describe(
          "Stock ticker symbol - infer when 100% confident, otherwise leave empty"
        ),
      metrics: z
        .array(z.string())
        .describe(
          "All financial metrics specifically requested in the question"
        ),
      commentaryTopic: z
        .string()
        .describe(
          "Specific topic for management commentary mentioned in the question"
        ),
      timeFrame: timeFrameEnum.describe(
        "Time period referenced in the question"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },
};
