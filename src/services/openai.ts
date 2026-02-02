import OpenAI from "openai";
import { env } from "../config/env";
import { systemPrompt } from "../utils/promptTemplates";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export const generatePrompt = async (userPrompt: string) => {
  const response = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
};
