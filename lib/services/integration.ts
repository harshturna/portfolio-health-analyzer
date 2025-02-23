import OpenAI from "openai";

import { SUMMARY_PROMPTS } from "@/lib/prompts";
import { injectValuesIntoPrompt } from "@/lib/utils";
import { fetchDataForQuery } from "@/lib/services/fmp/fmp";

const openai = new OpenAI();

export const processQueryWithData = async (
  queryResult: QueryResult,
  messages: Message[]
): Promise<string> => {
  try {
    const financialData = await fetchDataForQuery(queryResult);

    const promptContent = generatePromptForData(queryResult, financialData);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst assistant that provides helpful, accurate, and concise information based on financial data and earnings transcripts.",
        },
        ...messages.slice(-10), // keeping context short, could be increased
        {
          role: "user",
          content: promptContent,
        },
      ],
      temperature: 0.3,
    });

    return (
      response.choices[0].message.content ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error processing query with data:", error);
    return `I apologize, but I encountered an error while retrieving the financial information, Please try again or rephrase your question.`;
  }
};

export const combineResponses = (responses: string[]): string => {
  if (responses.length === 0) return "No information could be found.";
  if (responses.length === 1) return responses[0];

  return responses.join("\n\n");
};

const generatePromptForData = (
  queryResult: QueryResult,
  financialData: any
): string => {
  const dataString = JSON.stringify(financialData, null, 2);

  const basePrompt = injectValuesIntoPrompt(
    SUMMARY_PROMPTS.FINALIZED_SUMMARY.prompt,
    {
      DATA_STRING: dataString,
    }
  );

  switch (queryResult.type) {
    case "TRANSCRIPT_SUMMARY":
      return basePrompt + generateTranscriptSummaryPrompt(queryResult.data);

    case "EXECUTIVE_STATEMENTS":
      return basePrompt + generateExecutiveStatementsPrompt(queryResult.data);

    case "FINANCIAL_DATA_QUERY":
      return basePrompt + generateFinancialDataPrompt(queryResult.data);

    case "METRIC_ANALYSIS":
      return basePrompt + generateMetricAnalysisPrompt(queryResult.data);

    case "TRANSCRIPT_COMPARISON":
      return basePrompt + generateTranscriptComparisonPrompt(queryResult.data);

    case "METRIC_COMPARISON":
      return basePrompt + generateMetricComparisonPrompt(queryResult.data);

    default:
      return (
        basePrompt +
        "Please analyze this financial data and provide a comprehensive answer."
      );
  }
};

const generateTranscriptSummaryPrompt = (data: TranscriptSummaryData): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.TRANSCRIPT_SUMMARY.prompt, {
    COMPANY: data.company,
    TICKER: data.ticker,
  });

const generateExecutiveStatementsPrompt = (
  data: ExecutiveStatementsData
): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.EXECUTIVE_SUMMARY.prompt, {
    EXECUTIVE_LIST: data.executives.join(", "),
    COMPANIES: data.companies.join(", "),
    TOPICS: data.topics.join(", "),
  });

const generateFinancialDataPrompt = (data: FinancialDataQueryData): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.FINANCIAL_DATA_SUMMARY.prompt, {
    COMPANY: data.company,
    TICKER: data.ticker,
    METRICS: data.metrics.join(", "),
  });

const generateMetricAnalysisPrompt = (data: MetricAnalysisData): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.METRIC_ANALYSIS_SUMMARY.prompt, {
    COMPANY: data.company,
    TICKER: data.ticker,
    METRIC: data.metric,
  });

const generateTranscriptComparisonPrompt = (
  data: TranscriptComparisonData
): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.TRANSCRIPT_COMPARISON_SUMMARY.prompt, {
    TOPIC: data.comparisonTopic,
    COMPANIES: data.companies.join(", "),
  });

const generateMetricComparisonPrompt = (data: MetricComparisonData): string =>
  injectValuesIntoPrompt(SUMMARY_PROMPTS.METRIC_COMPARISON_SUMMARY.prompt, {
    METRICS: data.metrics.join(", "),
    COMPANIES: data.companies.join(", "),
  });
