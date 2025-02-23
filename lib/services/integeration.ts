// src/lib/services/integration-service.ts

import OpenAI from "openai";
import { fetchDataForQuery } from "@/lib/services/fmp/fmp";
import { SUMMARY_PROMPTS } from "../prompts";
import { injectValuesIntoPrompt } from "../utils";

const openai = new OpenAI();

export async function processQueryWithData(
  queryResult: QueryResult,
  messages: Message[]
): Promise<string> {
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
        ...messages.slice(-10),
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
}

export function combineResponses(responses: string[]): string {
  if (responses.length === 0) return "No information could be found.";
  if (responses.length === 1) return responses[0];

  return responses.join("\n\n");
}

function generatePromptForData(
  queryResult: QueryResult,
  financialData: any
): string {
  const dataString = JSON.stringify(financialData, null, 2);
  const basePrompt = `Answer the user's question based on the following financial data in markdown format with proper formatting:
  Please ensure your response:
- Uses proper header hierarchy (# for main titles, ## for subtitles)
- Includes a blank line before and after headers, lists, and code blocks
- Formats numbers consistently with appropriate decimal places
- Employs emphasis (*italic* or **bold**) to highlight key insights
- Breaks down complex information into readable paragraphs
- Uses horizontal rules (---) to separate major sections when appropriate
- Uses tables for structured financial data
- Uses the following syntax for tables (include new lines)
| Title 1 | Title 2  |\n  
|--|--|\n
| data 1 row 1 | data 2 row 1 |\n
|data 1 row 2| data 2 row 2 |
  
  Financial data:
  \n\n${dataString}\n\n`;

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
}

function generateTranscriptSummaryPrompt(data: TranscriptSummaryData): string {
  return injectValuesIntoPrompt(SUMMARY_PROMPTS.TRANSCRIPT_SUMMARY.prompt, {
    COMPANY: data.company,
    TICKER: data.ticker,
  });
}

function generateExecutiveStatementsPrompt(
  data: ExecutiveStatementsData
): string {
  return injectValuesIntoPrompt(SUMMARY_PROMPTS.EXECUTIVE_SUMMARY.prompt, {
    EXECUTIVE_LIST: data.executives.join(", "),
    COMPANIES: data.companies.join(", "),
    TOPICS: data.topics.join(", "),
  });
}

function generateFinancialDataPrompt(data: FinancialDataQueryData): string {
  return injectValuesIntoPrompt(SUMMARY_PROMPTS.FINANCIAL_DATA_SUMMARY.prompt, {
    COMPANY: data.company,
    TICKER: data.ticker,
    METRICS: data.metrics.join(", "),
  });
}

function generateMetricAnalysisPrompt(data: MetricAnalysisData): string {
  return injectValuesIntoPrompt(
    SUMMARY_PROMPTS.METRIC_ANALYSIS_SUMMARY.prompt,
    {
      COMPANY: data.company,
      TICKER: data.ticker,
      METRIC: data.metric,
    }
  );
}

function generateTranscriptComparisonPrompt(
  data: TranscriptComparisonData
): string {
  return injectValuesIntoPrompt(
    SUMMARY_PROMPTS.TRANSCRIPT_COMPARISON_SUMMARY.prompt,
    {
      TOPIC: data.comparisonTopic,
      COMPANIES: data.companies.join(", "),
    }
  );
}

function generateMetricComparisonPrompt(data: MetricComparisonData): string {
  return injectValuesIntoPrompt(
    SUMMARY_PROMPTS.METRIC_COMPARISON_SUMMARY.prompt,
    {
      METRICS: data.metrics.join(", "),
      COMPANIES: data.companies.join(", "),
    }
  );
}
