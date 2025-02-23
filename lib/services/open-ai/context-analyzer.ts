import { z } from "zod";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { CONTEXT_ANALYZER } from "@/lib/prompts";

const openai = new OpenAI();

export const analyzeContext = async (
  previousMessages: Message[],
  latestQuestion: string
): Promise<ContextAnalysisResult> => {
  const conversationHistory = previousMessages
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const contextPrompt = CONTEXT_ANALYZER.prompt
    .replace("{{conversationHistory}}", conversationHistory)
    .replace("{{latestQuestion}}", latestQuestion);

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini-2024-07-18",
      messages: [{ role: "user", content: contextPrompt }],
      response_format: zodResponseFormat(CONTEXT_ANALYZER.schema, "output"),
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
};
