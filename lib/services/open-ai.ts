import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { PROMPTS } from "@/lib/prompts";
import { addUserQuestion } from "@/lib/utils";

const openai = new OpenAI();

export async function analyzeQuery(messages: Messages, isInit = false) {
  if (isInit) {
    // inject user query into the initial prompt
    const analysisPrompt = addUserQuestion(
      PROMPTS.FINANCIAL_ANALYZER.prompt,
      messages[0].content
    );
    messages[0].content = analysisPrompt;
  }

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-2024-11-20",
    messages: messages,
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
    // send this to user and then process the query again, keep doing it until valid queries are found
    console.log(analysis.clarifyQuestion);
    return;
  }

  // Process all query types concurrently
  const queryPromises = analysis.queryTypes.map(async (queryType) => {
    const promptKey = queryType;
    const prompt = addUserQuestion(PROMPTS[promptKey].prompt, userInput);

    try {
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

      return {
        type: queryType,
        data: completion.choices[0].message.parsed,
      };
    } catch (error) {
      console.error(`Error processing query type ${queryType}:`, error);
      return {
        type: queryType,
        error: true,
        message: "Unknown error",
      };
    }
  });

  // Wait for all promises to resolve
  const results = await Promise.all(queryPromises);

  // If there's only one result, return it directly; otherwise return the array
  if (results.length === 1) {
    console.log(results[0]);
    return results[0];
  } else {
    console.log(results);
    return results;
  }
}
