// src/lib/context-analyzer.ts
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI();

const contextAnalysisSchema = z.object({
  isContinuation: z
    .boolean()
    .describe("Whether this question continues the previous conversation"),
  response: z
    .string()
    .describe("Direct response if this is a continuation, empty string if not"),
});

const CONTEXT_ANALYZER_PROMPT = `You are an assistant that determines if a new question is a continuation of the previous conversation or a new topic entirely in the context of financial analysis.

Given the conversation history and the latest question, determine:
1. If the latest question is continuing or referring to the previous topic/companies/metrics (isContinuation)
2. If it's a continuation, provide a direct response to the Latest question based on the context (response)
3. If it's a new topic, set isContinuation to false and response to empty string

Previous conversation:
{{conversationHistory}}

Latest question: "{{latestQuestion}}"`;

export async function analyzeContext(
  previousMessages: Message[],
  latestQuestion: string
): Promise<ContextAnalysisResult> {
  const conversationHistory = previousMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const contextPrompt = CONTEXT_ANALYZER_PROMPT.replace(
    "{{conversationHistory}}",
    conversationHistory
  ).replace("{{latestQuestion}}", latestQuestion);

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-11-20",
      messages: [{ role: "user", content: contextPrompt }],
      response_format: zodResponseFormat(contextAnalysisSchema, "output"),
    });

    if (!completion.choices[0].message.parsed) {
      return {
        isContinuation: false,
        response: "",
      };
    }

    return completion.choices[0].message.parsed;
  } catch (error) {
    console.error("Error analyzing context:", error);
    return {
      isContinuation: false,
      response: "",
    };
  }
}
