import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { QUERY_PROMPTS as PROMPTS } from "@/lib/prompts";
import { addUserQuestion } from "@/lib/utils";

const openai = new OpenAI();

export async function analyzeQuery(
  userQuery: string
): Promise<QueryAnalysisResult> {
  try {
    const analysisPrompt = addUserQuestion(
      PROMPTS.FINANCIAL_ANALYZER.prompt,
      userQuery
    );

    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-11-20",
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
      response_format: zodResponseFormat(
        PROMPTS.FINANCIAL_ANALYZER.schema,
        "output"
      ),
    });

    if (!completion.choices[0].message.parsed) {
      return {
        queryTypes: [],
        confidenceScore: 0,
        clarifyQuestion:
          "I'm having trouble understanding your question. Could you please rephrase it or provide more details?",
      };
    }

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("Error analyzing query:", error);
    return {
      queryTypes: [],
      confidenceScore: 0,
      clarifyQuestion:
        "I'm having trouble understanding your question. Could you please rephrase it or provide more details?",
    };
  }
}

export async function processAnalyzedQuery(
  analysis: QueryAnalysisResult,
  userInput: string
): Promise<QueryResult | QueryResult[]> {
  if (analysis.queryTypes.length === 0) {
    return {
      type: "EXECUTIVE_STATEMENTS",
      data: {
        executives: [],
        companies: [],
        tickers: [],
        topics: [],
        timeFrame: "not_specified",
      } as ExecutiveStatementsData,
      error: "Could not determine query type.",
    };
  }

  // Process all query types concurrently
  const queryPromises = analysis.queryTypes.map(async (queryType) => {
    const promptKey = queryType;
    const prompt = addUserQuestion(PROMPTS[promptKey].prompt, userInput);

    try {
      const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o-2024-11-20",
        messages: [{ role: "user", content: prompt }],
        response_format: zodResponseFormat(PROMPTS[promptKey].schema, "output"),
      });

      const parsedData = completion.choices[0].message.parsed;

      if (!parsedData) {
        return createEmptyResult(
          queryType,
          "Unable to extract details from the prompt"
        );
      }

      return createResultForType(queryType, parsedData, null);
    } catch (error) {
      console.error(`Error processing query type ${queryType}:`, error);
      return createEmptyResult(queryType, "Error processing this query type.");
    }
  });

  const results = await Promise.all(queryPromises);

  return results.length === 1 ? results[0] : results;
}

function createEmptyResult(
  queryType: QueryType,
  errorMessage: string
): QueryResult {
  switch (queryType) {
    case "TRANSCRIPT_SUMMARY":
      return {
        type: queryType,
        data: {
          company: "",
          ticker: "",
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };

    case "EXECUTIVE_STATEMENTS":
      return {
        type: queryType,
        data: {
          executives: [],
          companies: [],
          tickers: [],
          topics: [],
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };

    case "FINANCIAL_DATA_QUERY":
      return {
        type: queryType,
        data: {
          company: "",
          ticker: "",
          metrics: [],
          dataType: "single_value",
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };

    case "METRIC_ANALYSIS":
      return {
        type: queryType,
        data: {
          company: "",
          ticker: "",
          metric: "",
          analysisType: "point_in_time",
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };

    case "TRANSCRIPT_COMPARISON":
      return {
        type: queryType,
        data: {
          companies: [],
          tickers: [],
          comparisonTopic: "",
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };

    case "METRIC_COMPARISON":
      return {
        type: queryType,
        data: {
          companies: [],
          tickers: [],
          metrics: [],
          timeFrame: "not_specified",
        },
        error: errorMessage,
      };
  }
}

function createResultForType(
  queryType: QueryType,
  data: any,
  error: string | null
): QueryResult {
  switch (queryType) {
    case "TRANSCRIPT_SUMMARY":
      return {
        type: queryType,
        data: data as TranscriptSummaryData,
        error,
      };

    case "EXECUTIVE_STATEMENTS":
      return {
        type: queryType,
        data: data as ExecutiveStatementsData,
        error,
      };

    case "FINANCIAL_DATA_QUERY":
      return {
        type: queryType,
        data: data as FinancialDataQueryData,
        error,
      };

    case "METRIC_ANALYSIS":
      return {
        type: queryType,
        data: data as MetricAnalysisData,
        error,
      };

    case "TRANSCRIPT_COMPARISON":
      return {
        type: queryType,
        data: data as TranscriptComparisonData,
        error,
      };

    case "METRIC_COMPARISON":
      return {
        type: queryType,
        data: data as MetricComparisonData,
        error,
      };
  }
}
