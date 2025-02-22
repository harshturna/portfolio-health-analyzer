// src/lib/chat-handler.ts
import { combineResponses, processQueryWithData } from "../integeration";
import { analyzeContext } from "./context-analyzer";
import { analyzeQuery, processAnalyzedQuery } from "./query-analyzer";

export async function handleUserQuery(
  messages: Message[],
  newUserInput: string
): Promise<ChatResponse> {
  // Add the new message to our collection (copy only, don't modify original)
  const updatedMessages = [
    ...messages,
    { role: "user", content: newUserInput },
  ];

  // Check if this is the initial message
  const isInitialMessage = messages.length === 0;

  if (isInitialMessage) {
    // Direct path for first message
    return await processNewTopic(newUserInput);
  } else {
    // Check if continuation or new topic
    const contextAnalysis = await analyzeContext(messages, newUserInput);

    if (contextAnalysis.isContinuation) {
      // It's a follow-up question, return the direct response
      return {
        type: "direct_response",
        message: contextAnalysis.response,
        error: null,
      };
    } else {
      // It's a new topic, process it fresh
      return await processNewTopic(newUserInput);
    }
  }
}

/**
 * Process a new topic query
 */
export async function processNewTopic(
  userInput: string
): Promise<ChatResponse> {
  // Run the financial analyzer
  const analysis = await analyzeQuery(userInput);

  // Handle low confidence with a request for clarification
  if (analysis.confidenceScore < 0.7) {
    return {
      type: "clarification_needed",
      message: analysis.clarifyQuestion,
      error: null,
    };
  }

  // Process the identified query types
  return await processAnalyzedQuery(analysis, userInput);
}

/**
 * Handle clarification responses
 */
export async function handleClarification(
  messages: Message[],
  clarificationResponse: string
): Promise<ChatResponse> {
  // Get the original question (second-to-last message)
  const originalQuestion = messages[messages.length - 2].content;

  // Create a combined question with the clarification
  const enhancedQuestion = `${originalQuestion} (Additional info: ${clarificationResponse})`;

  // Process as a new query with the enhanced context
  return await processNewTopic(enhancedQuestion);
}

export async function generateFinalResponse(
  queryResults: QueryResult | QueryResult[],
  messages: Message[]
): Promise<string> {
  try {
    // Handle single result
    if (!Array.isArray(queryResults)) {
      return await processQueryWithData(queryResults, messages);
    }

    // Handle multiple results
    const responsePromises = queryResults.map((result) =>
      processQueryWithData(result, messages)
    );
    const responses = await Promise.all(responsePromises);

    // Combine the responses
    return combineResponses(responses);
  } catch (error) {
    console.error("Error generating final response:", error);
    return "I apologize, but I encountered an error while processing your question. Please try again or rephrase your question.";
  }
}
