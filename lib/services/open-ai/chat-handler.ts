import {
  combineResponses,
  processQueryWithData,
} from "@/lib/services/integration";
import { analyzeContext } from "@/lib/services/open-ai/context-analyzer";
import {
  analyzeQuery,
  processAnalyzedQuery,
} from "@/lib/services/open-ai/query-analyzer";

export const handleUserQuery = async (
  messages: Message[],
  newUserInput: string
): Promise<ChatResponse> => {
  const isInitialMessage = messages.length === 0;

  if (isInitialMessage) {
    return await processNewTopic(newUserInput);
  } else {
    const contextAnalysis = await analyzeContext(messages, newUserInput);

    if (contextAnalysis.isContinuation) {
      return {
        type: "direct_response",
        message: contextAnalysis.response,
        error: null,
      };
    } else {
      return await processNewTopic(newUserInput);
    }
  }
};

export const processNewTopic = async (
  userInput: string
): Promise<ChatResponse> => {
  const analysis = await analyzeQuery(userInput);

  if (analysis.confidenceScore < 0.7) {
    return {
      type: "clarification_needed",
      message: analysis.clarifyQuestion,
      error: null,
    };
  }

  return await processAnalyzedQuery(analysis, userInput);
};

export const handleClarification = async (
  messages: Message[],
  clarificationResponse: string
): Promise<ChatResponse> => {
  const originalQuestion = messages[messages.length - 2].content;

  const enhancedQuestion = `${originalQuestion} (Additional info: ${clarificationResponse})`;

  return await processNewTopic(enhancedQuestion);
};

export const generateFinalResponse = async (
  queryResults: QueryResult | QueryResult[],
  messages: Message[]
): Promise<string> => {
  try {
    if (!Array.isArray(queryResults)) {
      return await processQueryWithData(queryResults, messages);
    }

    const responsePromises = queryResults.map((result) =>
      processQueryWithData(result, messages)
    );
    const responses = await Promise.all(responsePromises);

    return combineResponses(responses);
  } catch (error) {
    console.error("Error generating final response:", error);
    return "I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.";
  }
};
