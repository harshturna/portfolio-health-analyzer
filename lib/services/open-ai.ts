import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { PROMPTS } from "@/lib/prompts";
import { addUserQuestion } from "@/lib/utils";

const openai = new OpenAI();

export async function analyzeQuery(query: string) {
  const analysisPrompt = addUserQuestion(
    PROMPTS.FINANCIAL_ANALYZER.prompt,
    query
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

  return completion.choices[0].message.parsed;
}

export async function processAnalyzedQuery(
  analysis: QueryAnalysisResult,
  userInput: string
) {
  if (analysis.confidenceScore < 0.7) {
    console.log(analysis.clarifyQuestion);
    return;
  }

  const promptKey = analysis.queryType;
  const prompt = addUserQuestion(PROMPTS[promptKey].prompt, userInput);

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-11-20",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: zodResponseFormat(PROMPTS[promptKey].schema, "output"),
  });

  console.log({
    type: analysis.queryType,
    data: completion.choices[0].message.parsed,
  });
}
