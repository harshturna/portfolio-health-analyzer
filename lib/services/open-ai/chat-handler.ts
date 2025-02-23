// src/lib/chat-handler.ts
import { combineResponses, processQueryWithData } from "../integeration";
import { analyzeContext } from "./context-analyzer";
import { analyzeQuery, processAnalyzedQuery } from "./query-analyzer";

export async function handleUserQuery(
  messages: Message[],
  newUserInput: string
): Promise<ChatResponse> {
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
}

export async function processNewTopic(
  userInput: string
): Promise<ChatResponse> {
  const analysis = await analyzeQuery(userInput);

  if (analysis.confidenceScore < 0.7) {
    return {
      type: "clarification_needed",
      message: analysis.clarifyQuestion,
      error: null,
    };
  }

  return await processAnalyzedQuery(analysis, userInput);
}

export async function handleClarification(
  messages: Message[],
  clarificationResponse: string
): Promise<ChatResponse> {
  const originalQuestion = messages[messages.length - 2].content;

  const enhancedQuestion = `${originalQuestion} (Additional info: ${clarificationResponse})`;

  return await processNewTopic(enhancedQuestion);
}

export async function generateFinalResponse(
  queryResults: QueryResult | QueryResult[],
  messages: Message[]
): Promise<string> {
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
}
