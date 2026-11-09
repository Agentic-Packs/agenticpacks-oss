import { openai } from "@ai-sdk/openai";

export interface ActiveAIModel {
  model: ReturnType<typeof openai>;
  name: string;
  provider: "OpenAI";
}

export function getActiveAIModel(): ActiveAIModel | null {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (!openaiKey || openaiKey.includes("your-")) {
    return null;
  }

  return {
    model: openai("gpt-5-mini"),
    name: "GPT-5 Mini",
    provider: "OpenAI",
  };
}
