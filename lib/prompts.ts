import { z } from "zod";

import { getCurrentDateParams } from "@/lib/utils";
import {
  IncomeStatementMetrics,
  BalanceSheetMetrics,
  CashFlowMetrics,
  KeyMetrics,
  RatioMetrics,
  AllMetrics,
  timeFrameEnum,
  specificPeriodSchema,
} from "@/lib/constants";

const currDateParams = getCurrentDateParams();

export const QUERY_PROMPTS = {
  FINANCIAL_ANALYZER: {
    prompt: `You are a financial query analyzer specializing in earnings calls and financial metrics. Analyze the user's question and classify it into one or more of the following categories:
  
    TRANSCRIPT_SUMMARY: Provides an overall summary of an earnings call or conference call. Use for general summaries of what was discussed. 
      
    EXECUTIVE_STATEMENTS: Extracts specific statements made by named executives or finds discussion of a specific topic from earnings calls.
      
    FINANCIAL_DATA_QUERY: ONLY for conventional, quantitative financial metrics that appear directly in financial statements or standard financial reporting (revenue, EPS, net income, profit margins, etc.). Do NOT use for business segments, product categories, or qualitative aspects.
      
    METRIC_ANALYSIS: Finds how specific metrics were mentioned or discussed in earnings calls and analyzes them over time if needed. Use for qualitative analysis of metrics in transcripts.
      
    TRANSCRIPT_COMPARISON: Compares how different companies discuss specific topics, business segments, product categories, or strategies in their earnings calls. Use for qualitative comparisons about how companies talk about their business.
      
    METRIC_COMPARISON: ONLY for comparing conventional, quantitative financial metrics across different companies (revenue, profit margins, P/E ratios, etc.). Do NOT use for comparing business segments, product categories, or strategic initiatives.
    
    Provide:
    1. An array of query types that apply to the question, with the most relevant one first (queryTypes)
    2. A confidence score (0-1) for the primary (first) query type, representing how clearly the query matches this type (confidenceScore)
    3. A clarifying question if the confidence score is below 0.7 that would help determine the user's intent. If the score is above 0.7, leave it empty (clarifyQuestion)
     
    If the user's question clearly combines multiple query intents, include all relevant types in the queryTypes array. For example, a question asking both for financial data and executive statements should include both types.

    Important: 
    - If you cannot infer companies, executives, metrics from user's question, score it a low confidence and ask clarifying question
    
    Example classifications:
    - "What did Apple say in their last earnings call?" → ["TRANSCRIPT_SUMMARY"]
    - "What's Apple's revenue for 2023?" → ["FINANCIAL_DATA_QUERY"]
    - "How has Netflix discussed content spending over the past year?" → ["METRIC_ANALYSIS"]
    - "What did Tim Cook say about AI?" → ["EXECUTIVE_STATEMENTS"]
    - "Compare how Netflix and Disney discuss international expansion" → ["TRANSCRIPT_COMPARISON"]
    - "Compare AWS and Azure growth rates" → ["METRIC_COMPARISON"]
    - "Compare the cloud segments of MSFT and the company that Bezos founded" → ["TRANSCRIPT_COMPARISON"]
    - "Compare Apple and Samsung's discussion of their product roadmaps" → ["TRANSCRIPT_COMPARISON"]
    - "What's Amazon's revenue for 2023 and what did Andy Jassy say about AWS growth?" → ["FINANCIAL_DATA_QUERY", "EXECUTIVE_STATEMENTS"]
    - "Compare Netflix and Disney+ subscriber numbers and how their CEOs discuss content strategy" → ["METRIC_COMPARISON", "TRANSCRIPT_COMPARISON"]
    
    User question: "{{userQuestion}}"`,

    schema: z.object({
      queryTypes: z
        .array(
          z.enum([
            "TRANSCRIPT_SUMMARY",
            "EXECUTIVE_STATEMENTS",
            "FINANCIAL_DATA_QUERY",
            "METRIC_ANALYSIS",
            "TRANSCRIPT_COMPARISON",
            "METRIC_COMPARISON",
          ])
        )
        .describe("Array of query types that apply, with most relevant first"),
      confidenceScore: z
        .number()
        .describe("Confidence score for the primary (first) query type"),
      clarifyQuestion: z
        .string()
        .describe("Clarifying question if confidence is low"),
    }),
  },

  TRANSCRIPT_SUMMARY: {
    prompt: `You are a financial query analyzer specializing in earnings calls. Extract the details for this earnings call summary request from the user question below.
    
    Follow these strict guidelines:
    1. Identify the company name as mentioned in the user question (take into consideration misspellings and variations of company names spellings)
    2. Infer the stock ticker symbol when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. If you cannot determine the ticker with absolute certainty, leave the ticker field empty
    4. Determine which specific earnings call to summarize based on the question
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. For time periods:
       - If the user mentions "latest" or "most recent" or a similar variation, use "latest_quarter"
       - If the user mentions "last quarter" or "previous quarter" or a similar variation, use "previous_quarter"
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user mentions a specific quarter like "Q2 2023", use "specific_quarter" and fill in the specificPeriod details
       - If the user doesn't specify a time period, use "not_specified"
    
       7. Infer ticker symbols and company names from on the executive names, topics when not explicity mentioned. Examples:
       - Executive "Mark Zuckerberg" -> Meta (prev Facebook)
       - Executive "Jeff Bezos" -> Amazon
       - Topic "Leading GPU manufacturer" -> Nvidia
       - Topic "Dominant browser market share" -> Google (Alphabet Inc)
       - Topic "Windows operating system" -> Microsoft

    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z.string().describe("company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      timeFrame: timeFrameEnum.describe(
        "Which specific earnings call to summarize"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  EXECUTIVE_STATEMENTS: {
    prompt: `You are a financial query analyzer specializing in earnings calls. Extract details about executive statements from the following user question.
    
    Follow these strict guidelines:
    1. Identify the executive names as mentioned in the user question (take into consideration misspellings and nicknames and variations of names)
    2. IMPORTANT: Identify the company names as mentioned in the question or infer from executive names and topics (take into consideration misspellings and variations of company names spellings)
    3. IMPORTANT: Infer stock ticker symbols based on the company names, executive names, topics (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    5. Extract the specific topic of interest mentioned in the question
    6. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    7. Determine the time period for the statements based on the question:
       - If the user mentions "latest" or "most recent" or a similar variation, use "latest_quarter"
       - If the user mentions "last quarter" or "previous quarter" or a similar variation, use "previous_quarter"
       - If the user mentions a date range like "between January and March 2023", use "specific_date_range" and fill in startDate and endDate
       - If the user mentions "past year", use "past_n_years" with count=1
       - If the user mentions "last year" or "previous year" or a similar variation, use "specific_year" and fill in year=${
         currDateParams.currentYear - 1
       }
       - If the user doesn't specify a time period, use "not_specified"
    8. Infer ticker symbols and company names from on the executive names, topics when not explicity mentioned. Examples:
       - Executive "Mark Zuckerberg" -> Meta (prev Facebook)
       - Executive "Jeff Bezos" -> Amazon
       - Topic "Leading GPU manufacturer" -> Nvidia
       - Topic "Dominant browser market share" -> Google (Alphabet Inc)
       - Topic "Windows operating system" -> Microsoft

    User question: "{{userQuestion}}"`,

    schema: z.object({
      executives: z.array(z.string()).describe("names of executives"),
      companies: z.array(z.string()).describe("company names"),
      tickers: z
        .array(z.string())
        .describe(
          "Stock ticker symbols - infer when 100% confident, otherwise leave empty"
        ),
      topics: z
        .array(z.string())
        .describe(
          "Specific subject matter/matters of interest mentioned in the question"
        ),
      timeFrame: timeFrameEnum.describe(
        "Time period referenced in the question"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  FINANCIAL_DATA_QUERY: {
    prompt: `You are a financial data analyst. Extract details for this financial data request.
  
    Follow these strict guidelines:
    1. Identify the company name mentioned in the user question or infer from executive names and topics mentioned in the user question (take into consideration misspellings and variations of company names spellings)
    2. Infer the stock ticker symbol from company name, topic (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. Extract the specific financial metric(s) requested by matching to these available metrics:

 Income Statement Metrics:
    ${IncomeStatementMetrics.join(", ")}

    Balance Sheet Metrics:
    ${BalanceSheetMetrics.join(", ")}

    Cash Flow Metrics:
    ${CashFlowMetrics.join(", ")}

    Key Metrics:
    ${KeyMetrics.join(", ")}

    Ratios:
    ${RatioMetrics.join(", ")}

    IMPORTANT: Only use the exact metrics listed above. Map similar terms to these metrics:
    - "profits" → "net income"
    - "earnings" → "net income"
    - "p/e" → "pe ratio"
    - "margin" → "profit margin"
    - "growth" → "revenue growth"
    - "cash position" → "cash"
    - "leverage" → "debt to equity"
    - "profitability" → ["profit margin", "net income"]

    4. Determine if the request is for a specific value (e.g., "What was Apple's revenue in 2023?") or a time series (e.g., "Show me Apple's quarterly revenue for the past 2 years")
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    [Rest of the time period guidelines...]

    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z.string().describe("company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      metrics: z
        .array(z.enum(AllMetrics))
        .describe("Specific financial metrics requested"),
      dataType: z
        .enum(["single_value", "time_series"])
        .describe("Whether the user wants a specific value or data over time"),
      timeFrame: timeFrameEnum.describe("Time period for the data"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period"),
    }),
  },

  METRIC_ANALYSIS: {
    prompt: `You are a financial query analyzer specializing in earnings calls and metrics. Extract details for this metric analysis request from the user question below.
    
    Follow these strict guidelines:
    1. Identify the company name as mentioned in the user question or infer from executive names and topics mentioned in the user question - (take into consideration misspellings and variations of company names spellings)
    2. Infer the stock ticker symbol from the company name and topics (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. Extract the specific topic or metric to be analyzed (metric)
    4. Determine if the request is for:
       - A point-in-time metric (e.g., "How many new subscribers did Netflix add last quarter?")
       - A trend analysis over time (e.g., "How has Netflix's subscriber growth changed over the past year?")
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time span based on the question:
       - For a single point in time:
         - If "latest quarter" or "most recent quarter", use "latest_quarter"
         - If "previous quarter" or "last quarter", use "previous_quarter"
         - If a specific quarter like "Q3 2023", use "specific_quarter" with quarter=3 and year=2023
         - If "TTM" or "trailing twelve months", use "trailing_twelve_months"
       - For a trend over time:
         - If "past 4 quarters", use "past_n_quarters" with count=4
         - If "past year", use "past_n_years" with count=1
         - If "past 2 years", use "past_n_years" with count=2
         - If a date range like "2020 to 2023", use "specific_date_range" with startDate and endDate
         - If "last year" or "previous year", use "specific_year" with year=${
           currDateParams.currentYear - 1
         }
         - If "this year", use "specific_year" with year=${
           currDateParams.currentYear
         }
       - If the user doesn't specify a time period, use "not_specified"
    
    8. Infer ticker symbols and company names from on the executive names, topics when not explicity mentioned. Examples:
       - Executive "Mark Zuckerberg" -> Meta (prev Facebook)
       - Executive "Jeff Bezos" -> Amazon
       - Topic "Leading GPU manufacturer" -> Nvidia
       - Topic "Dominant browser market share" -> Google (Alphabet Inc)

    User question: "{{userQuestion}}"`,

    schema: z.object({
      company: z.string().describe("company name"),
      ticker: z.string().describe("Stock ticker symbol"),
      metric: z.string().describe("Specific financial metric to analyze"),
      analysisType: z
        .enum(["point_in_time", "trend_over_time"])
        .describe("Whether the request is for a specific point or a trend"),
      timeFrame: timeFrameEnum.describe(
        "Time period referenced in the question"
      ),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  TRANSCRIPT_COMPARISON: {
    prompt: `You are a financial query analyzer specializing in comparative transcript analysis. Extract details for this request to compare how different companies discuss specific topics in their earnings calls.
    
    Follow these strict guidelines:
    1. Identify the company names as mentioned in the user question or infer from executive names and topics mentioned in the user question (take into consideration misspellings and variations of company names spellings)
    2. Infer stock ticker symbols for companies from company names (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    4. Extract the specific topic that should be compared across company transcripts (e.g., AI strategy, international expansion, cost-cutting initiatives)
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time period for the comparison:
       - If "latest quarter", use "latest_quarter"
       - If "previous quarter", use "previous_quarter"
       - If "last year" or "previous year", use "specific_year" with year=${
         currDateParams.currentYear - 1
       }
       - If "this year", use "specific_year" with year=${
         currDateParams.currentYear
       }
       - If a specific quarter like "Q3 2023", use "specific_quarter" with quarter=3 and year=2023
       - If a date range, use "specific_date_range" with startDate and endDate
       - If the user doesn't specify a time period, use "not_specified"
  
    7. Infer ticker symbols and company names from on the executive names, topics when not explicity mentioned. Examples:
       - Executive "Mark Zuckerberg" -> Meta (prev Facebook)
       - Executive "Jeff Bezos" -> Amazon
       - Topic "Leading GPU manufacturer" -> Nvidia
       - Topic "Dominant browser market share" -> Google (Alphabet Inc)
       - Topic "Operating systems" -> Apple, Microsoft


    User question: "{{userQuestion}}"`,

    schema: z.object({
      companies: z.array(z.string()).describe("company names"),
      tickers: z.array(z.string()).describe("Stock ticker symbols"),
      comparisonTopic: z
        .string()
        .describe("Specific topic to compare across company transcripts"),
      timeFrame: timeFrameEnum.describe("Time period for the comparison"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },

  METRIC_COMPARISON: {
    prompt: `You are a financial query analyzer specializing in comparative financial analysis. Extract details for this request to compare specific metrics across different companies.
    
    Follow these strict guidelines:
    1. Identify the company names as mentioned in the user question or infer from executive names and topics (take into consideration misspellings and variations of company names spellings)
    2. Infer stock ticker symbols for well-known companies when you are 100% confident (e.g., "Apple" → "AAPL", "Microsoft" → "MSFT")
    3. Extract the specific financial metric(s) to compare by matching to these available metrics:

 Income Statement Metrics:
    ${IncomeStatementMetrics.join(", ")}

    Balance Sheet Metrics:
    ${BalanceSheetMetrics.join(", ")}

    Cash Flow Metrics:
    ${CashFlowMetrics.join(", ")}

    Key Metrics:
    ${KeyMetrics.join(", ")}

    Ratios:
    ${RatioMetrics.join(", ")}

    IMPORTANT: Only use the exact metrics listed above. Map similar terms to these metrics:
    - "profits" → "net income"
    - "earnings" → "net income"
    - "p/e" → "pe ratio"
    - "margin" → "profit margin"
    - "growth" → "revenue growth"
    - "cash position" → "cash"
    - "leverage" → "debt to equity"
    - "profitability" → ["profit margin", "net income"]
    5. IMPORTANT: When interpreting relative time references, use the current date of ${
      currDateParams.currentDate
    } as reference
    6. Determine the time period for the comparison:
       - If "latest quarter", use "latest_quarter"
       - If "previous quarter", use "previous_quarter"
       - If "YTD" or "year to date", use "year_to_date"
       - If "TTM" or "trailing twelve months", use "trailing_twelve_months" 
       - If "last year" or "previous year", use "specific_year" with year=${
         currDateParams.currentYear - 1
       }
       - If "this year", use "specific_year" with year=${
         currDateParams.currentYear
       }
       - If a specific quarter like "Q3 2023", use "specific_quarter" with quarter=3 and year=2023
       - If a specific year like "fiscal 2022", use "specific_year" with year=2022
       - If a date range, use "specific_date_range" with startDate and endDate
       - If the user doesn't specify a time period, use "not_specified"

    7. Infer ticker symbols and company names from on the executive names, topics when not explicity mentioned. Examples:
       - Executive "Mark Zuckerberg" -> Meta (prev Facebook)
       - Executive "Jeff Bezos" -> Amazon
       - Topic "Leading GPU manufacturer" -> Nvidia
       - Topic "Dominant browser market share" -> Google (Alphabet Inc)
       - Topic "Operating systems" -> Apple, Microsoft
  
    User question: "{{userQuestion}}"`,

    schema: z.object({
      companies: z.array(z.string()).describe("company names"),
      tickers: z.array(z.string()).describe("Stock ticker symbols"),
      metrics: z
        .array(z.enum(AllMetrics))
        .describe("Specific financial metrics to compare"),
      timeFrame: timeFrameEnum.describe("Time period for the comparison"),
      specificPeriod: specificPeriodSchema
        .optional()
        .describe("Details of the specific time period mentioned"),
    }),
  },
};

export const SUMMARY_PROMPTS = {
  TRANSCRIPT_SUMMARY: {
    prompt: `Please provide a concise summary of {{COMPANY}}'s ({{TICKER}}) earnings call transcript.
  
Focus on:
1. Key financial highlights
2. Major announcements
3. Strategic initiatives
4. Forward-looking statements
5. Any notable analyst questions and management responses

Be conversational but informative in your response.`,
  },

  EXECUTIVE_SUMMARY: {
    prompt: `Please extract and analyze statements made by {{EXECUTIVE_LIST}} from {{COMPANIES}} regarding {{TOPICS}}.

Focus on:
1. Direct quotes from the executives on these topics
2. Context and implications of their statements
3. Any changes in sentiment or messaging over time
4. How these statements relate to company strategy or performance

Provide a conversational and informative summary of what these executives have said about these topics.`,
  },

  FINANCIAL_DATA_SUMMARY: {
    prompt: `Please analyze the financial data for {{COMPANY}} ({{TICKER}})
  }) focusing on the metrics: {{METRICS}}.

Provide:
1. The specific values for these metrics
2. Context on what these values mean
3. Any trends or notable changes
4. Brief comparison to industry standards if available

Be conversational but precise with numbers and percentages.`,
  },

  METRIC_ANALYSIS_SUMMARY: {
    prompt: `Please analyze how {{COMPANY}} ({{TICKER}}) discusses "{{METRIC}}" in their earnings calls and financial data.

  {{ANALYSIS_TYPE}} === "point_in_time"
    ? "Focus on the specific value and context for this period."
    : "Focus on the trend over time and how the narrative has evolved."
}

Include:
1. Actual metrics/numbers from the financial data
2. How executives discuss this metric
3. Any explanations for changes or performance
4. Implications for the company's strategy or outlook

Be conversational but factual in your analysis.`,
  },

  TRANSCRIPT_COMPARISON_SUMMARY: {
    prompt: `Please compare how the companies {{COMPANIES}} discuss "{{COMPARISON_TOPIC}}" in their earnings calls.

Focus on:
1. Different approaches or emphasis each company places on this topic
2. Specific strategies mentioned by each company
3. How the messaging differs between competitors
4. Any notable quotes that highlight their distinct approaches

Provide a conversational but insightful comparison that highlights the key differences in how these companies talk about this topic.`,
  },

  METRIC_COMPARISON_SUMMARY: {
    prompt: `Please compare the following metrics: {{METRICS}} across these companies: {{COMPANIES}}.

Include:
1. A direct comparison of the actual values
2. Relative performance analysis
3. Context on why there might be differences
4. Any trends that are visible across the companies

Be conversational but include specific numbers and percentages to make the comparison clear.`,
  },
};

export const PORTFOLIO_ANALYZER = {
  prompt: `You are a Portfolio Assistant AI analyzing the following investment portfolio.\n Your role is to provide clear, direct answers about portfolio composition, health, and metrics, highlighting important concerns like over-concentration or sector imbalances. You should not make specific buy/sell recommendations, provide tax advice, or predict market performance.
When analyzing the portfolio, consider diversification across sectors, position sizes, concentration risks, and overall return metrics. Use straightforward language, include relevant numbers, and provide context for any metrics. If you encounter missing data or unclear queries, ask for clarification. Structure responses as "Summary → Key Details → Concerns (if any)".\n\n

If the portfolio information is not available, ask user for relevant data

Portfolio to analyze:
{{PORTFOLIO}}

`,
};
