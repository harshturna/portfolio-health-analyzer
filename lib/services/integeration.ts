// src/lib/services/integration-service.ts

import OpenAI from "openai";
import { fetchDataForQuery } from "@/lib/services/fmp/fmp";

const openai = new OpenAI();

/**
 * Process a query result with financial data to generate a comprehensive answer
 */
export async function processQueryWithData(
  queryResult: QueryResult,
  messages: Message[]
): Promise<string> {
  try {
    // 1. Fetch financial data based on the query type
    const financialData = await fetchDataForQuery(queryResult);

    // 2. Generate a prompt for OpenAI based on the query type and data
    const promptContent = generatePromptForData(queryResult, financialData);

    // 3. Get OpenAI to generate a comprehensive answer
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "system",
          content:
            "You are a financial analyst assistant that provides helpful, accurate, and concise information based on financial data and earnings transcripts.",
        },
        ...messages.slice(-5), // Include recent conversation context
        {
          role: "user",
          content: promptContent,
        },
      ],
      temperature: 0.3, // Lower temperature for more factual responses
    });

    return (
      response.choices[0].message.content ||
      "Sorry, I couldn't generate a response."
    );
  } catch (error) {
    console.error("Error processing query with data:", error);
    return `I apologize, but I encountered an error while retrieving the financial information: ${
      error instanceof Error ? error.message : String(error)
    }`;
  }
}

/**
 * Combine multiple responses into a coherent answer
 */
export function combineResponses(responses: string[]): string {
  if (responses.length === 0) return "No information could be found.";
  if (responses.length === 1) return responses[0];

  // Simple concatenation with headers for now
  // In a more sophisticated version, you might want to use OpenAI to combine these more elegantly
  return responses.join("\n\n");
}

/**
 * Generate a prompt for OpenAI based on the query type and retrieved data
 */
function generatePromptForData(
  queryResult: QueryResult,
  financialData: any
): string {
  // Base prompt with data
  const dataString = JSON.stringify(financialData, null, 2);
  let basePrompt = `Answer the user's question based on the following financial data:\n\n${dataString}\n\n`;

  // Add type-specific instructions
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

// Type-specific prompt generators
function generateTranscriptSummaryPrompt(data: TranscriptSummaryData): string {
  return `Please provide a concise summary of ${data.company}'s (${data.ticker}) earnings call transcript.
  
Focus on:
1. Key financial highlights
2. Major announcements
3. Strategic initiatives
4. Forward-looking statements
5. Any notable analyst questions and management responses

Be conversational but informative in your response.`;
}

function generateExecutiveStatementsPrompt(
  data: ExecutiveStatementsData
): string {
  const executivesList = data.executives.join(", ");
  const topicsList = data.topics.join(", ");

  return `Please extract and analyze statements made by ${executivesList} from ${data.companies.join(
    ", "
  )} regarding ${topicsList}.

Focus on:
1. Direct quotes from the executives on these topics
2. Context and implications of their statements
3. Any changes in sentiment or messaging over time
4. How these statements relate to company strategy or performance

Provide a conversational and informative summary of what these executives have said about these topics.`;
}

function generateFinancialDataPrompt(data: FinancialDataQueryData): string {
  return `Please analyze the financial data for ${data.company} (${
    data.ticker
  }) focusing on the metrics: ${data.metrics.join(", ")}.

Provide:
1. The specific values for these metrics
2. Context on what these values mean
3. Any trends or notable changes
4. Brief comparison to industry standards if available

Be conversational but precise with numbers and percentages.`;
}

function generateMetricAnalysisPrompt(data: MetricAnalysisData): string {
  return `Please analyze how ${data.company} (${data.ticker}) discusses "${
    data.metric
  }" in their earnings calls and financial data.

${
  data.analysisType === "point_in_time"
    ? "Focus on the specific value and context for this period."
    : "Focus on the trend over time and how the narrative has evolved."
}

Include:
1. Actual metrics/numbers from the financial data
2. How executives discuss this metric
3. Any explanations for changes or performance
4. Implications for the company's strategy or outlook

Be conversational but factual in your analysis.`;
}

function generateTranscriptComparisonPrompt(
  data: TranscriptComparisonData
): string {
  return `Please compare how the companies ${data.companies.join(
    ", "
  )} discuss "${data.comparisonTopic}" in their earnings calls.

Focus on:
1. Different approaches or emphasis each company places on this topic
2. Specific strategies mentioned by each company
3. How the messaging differs between competitors
4. Any notable quotes that highlight their distinct approaches

Provide a conversational but insightful comparison that highlights the key differences in how these companies talk about this topic.`;
}

function generateMetricComparisonPrompt(data: MetricComparisonData): string {
  return `Please compare the following metrics: ${data.metrics.join(
    ", "
  )} across these companies: ${data.companies.join(", ")}.

Include:
1. A direct comparison of the actual values
2. Relative performance analysis
3. Context on why there might be differences
4. Any trends that are visible across the companies

Be conversational but include specific numbers and percentages to make the comparison clear.`;
}
