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

const CONTEXT_ANALYZER_PROMPT = `You are a financial context analyzer that directly answers follow-up questions when you have the required financial context.

Given the conversation history and the latest question:

1. First, identify any companies, tickers, or financial entities, topics mentioned in the latest question

2. Check if the conversation history EXPLICITLY contains:
   - Financial statements summary (Income Statement, Balance Sheet, Cash Flow)
   - Key metrics summary (Revenue, Profit, Margins, etc.)
   - Financial ratios discussion
   - Earnings transcript summaries
   - Detailed financial analysis
   For the SPECIFIC companies/entities identified in step 1

3. Rules:
   - If isContinuation is true, you MUST provide a complete answer in directAnswer to Latest question, not just acknowledge you can answer
   - Never respond with phrases like "I can do that" or "Certainly" - always give the actual answer
   - If the question requires previously discussed data, use that data to answer immediately
   - Must include specific numbers, metrics, and analysis in directAnswer when available
   - Must be false if data needed isn't in conversation history
   
4. Example Good Response:
   Question: "What was their revenue growth?"
   BAD: "Certainly, I can tell you about the revenue growth."
   GOOD: "Revenue grew by 23% year-over-year to $5.2B in Q4 2023, driven by..."

Previous conversation:
{{conversationHistory}}

Latest question: "{{latestQuestion}}"

If you have the required financial context, provide the complete answer immediately without acknowledgment phrases.`;

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
      model: "gpt-4o-mini-2024-07-18",
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
