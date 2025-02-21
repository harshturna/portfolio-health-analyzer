import { z } from "zod";

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
    prompt: `Extract the details for this earnings call summary request. Identify the company name, company stock ticker symbol, and which earnings call to summarize (latest, specific quarter, etc.). If you can't identify the stock ticker or the company, leave them empty.
    
    User query: "{{userQuestion}}"`,

    schema: z.object({
      company: z.string().describe("Full company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      timeFrame: z
        .enum([
          "latest",
          "previous",
          "Q1_2023",
          "Q2_2023",
          "Q3_2023",
          "Q4_2023",
          "Q1_2024",
          "Q2_2024",
          "Q3_2024",
          "Q4_2024",
        ])
        .describe("Which earnings call to summarize"),
    }),
  },

  EXECUTIVE_STATEMENTS: {
    prompt: `Extract details about executive statements from this query. Identify the executives mentioned, the company/companies they represent, companies stock ticker symbols, the topic of interest, and the relevant time period. If you can't identify the ticker or the company, leave them empty.

    User query: "{{userQuestion}}"`,

    schema: z.object({
      executives: z.array(z.string()).describe("Names of executives mentioned"),
      companies: z
        .array(z.string())
        .describe("Companies these executives represent"),
      tickers: z.array(z.string()).describe("Stock ticker symbols"),
      topic: z.string().describe("The subject matter of interest"),
      timeFrame: z
        .enum([
          "latest",
          "recent",
          "past_year",
          "past_quarter",
          "specific_date_range",
        ])
        .describe("Time period to search for statements"),
      dateRange: z
        .object({
          start: z.string().optional(),
          end: z.string().optional(),
        })
        .optional()
        .describe("Specific date range if applicable"),
    }),
  },

  METRIC_LOOKUP: {
    prompt: `Extract details for this financial metric lookup request. Identify the specific metrics mentioned, the company, company stock ticker symbol, and the time period referenced. If you can't identify the ticker or the company, leave them empty.
    
    User query: "{userQuestion}"`,

    schema: z.object({
      company: z.string().describe("Company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      metrics: z
        .array(z.string())
        .describe("Specific financial metrics or KPIs mentioned"),
      timeFrame: z
        .enum([
          "latest_quarter",
          "previous_quarter",
          "specific_quarter",
          "full_year",
          "trailing_twelve_months",
        ])
        .describe("Time period for the metrics"),
      specificPeriod: z
        .string()
        .optional()
        .describe("If a specific quarter/year is mentioned"),
    }),
  },

  TREND_ANALYSIS: {
    prompt: `Extract details for this trend analysis request. Identify the company, company stock ticker symbol,  topic or metric to track, and the time period over which to analyze the trend. If you can't identify the ticker or the company, leave them empty.
    
    User query: "{userQuestion}"`,

    schema: z.object({
      company: z.string().describe("Company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      topic: z.string().describe("Topic or metric to analyze over time"),
      timeSpan: z
        .enum([
          "past_year",
          "past_two_years",
          "past_four_quarters",
          "past_eight_quarters",
          "custom_range",
        ])
        .describe("Time span to analyze"),
      quarters: z
        .number()
        .min(1)
        .max(12)
        .optional()
        .describe("Number of quarters to analyze if custom"),
    }),
  },

  COMPARISON_QUERY: {
    prompt: `Extract details for this comparison request. Identify the companies being compared, companies stock ticker symbols, the topic or metric of comparison, and the relevant time period. If you can't identify the ticker or the company, leave them empty.
    
    User query: "{userQuestion}"`,

    schema: z.object({
      companies: z.array(z.string()).min(2).describe("Companies to compare"),
      tickers: z.array(z.string()).min(2).describe("Stock ticker symbols"),
      comparisonTopic: z.string().describe("Topic or metric to compare"),
      timeFrame: z
        .enum([
          "latest_quarter",
          "previous_quarter",
          "year_to_date",
          "trailing_twelve_months",
          "specific_period",
        ])
        .describe("Time period for comparison"),
      specificPeriod: z
        .string()
        .optional()
        .describe("If a specific time period is mentioned"),
    }),
  },

  COMBINED_QUERY: {
    prompt: `Extract details for this combined data and commentary request. Identify the company, company stock ticker symbol, the financial metrics requested, and the related topic for management commentary. If you can't identify the ticker or the company, leave them empty.
    
    User query: "{userQuestion}"`,

    schema: z.object({
      company: z.string().describe("Company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      metrics: z.array(z.string()).describe("Financial metrics requested"),
      commentaryTopic: z
        .string()
        .describe("Related topic for management commentary"),
      timeFrame: z
        .enum([
          "latest_quarter",
          "year_to_date",
          "past_year",
          "past_four_quarters",
          "specific_period",
        ])
        .describe("Time period to analyze"),
      specificPeriod: z
        .string()
        .optional()
        .describe("If a specific time period is mentioned"),
    }),
  },
};
