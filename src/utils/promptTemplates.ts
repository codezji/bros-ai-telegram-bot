export type PromptTemplateInput = Record<string, string>;

export const promptTemplates = {
  insta: (input: PromptTemplateInput) => `Act as a professional Instagram content strategist.\nCreate a high-engagement Instagram post.\nTopic: ${input.topic}\nTone: ${input.tone}\nAudience: ${input.audience}\nFormat:\n[Hook]\n[Body]\n[CTA]\n[Hashtags]`,
  image: (input: PromptTemplateInput) => `You are a cinematic AI image prompt engineer.\nGenerate an ultra-detailed prompt.\nSubject: ${input.subject}\nStyle: ${input.style}\nMood: ${input.mood}\nCamera: ${input.camera}\nInclude: lighting, camera, style, mood, resolution.`,
  reel: (input: PromptTemplateInput) => `Act as a short-form video strategist.\nCreate a reel script.\nTopic: ${input.topic}\nAudience: ${input.audience}\nLength: ${input.length}\nCTA: ${input.cta}\nFormat:\n[Hook]\n[Scene-by-scene]\n[On-screen text]\n[CTA]`,
  code: (input: PromptTemplateInput) => `Act as a senior software engineer.\nGenerate clean, production-ready code with comments.\nLanguage/Stack: ${input.stack}\nTask: ${input.task}\nConstraints: ${input.constraints}\nOutput: code only unless otherwise requested.`,
  chatgpt: (input: PromptTemplateInput) => `You are a prompt engineer for ChatGPT.\nCreate a reusable prompt.\nDomain: ${input.domain}\nGoal: ${input.goal}\nTone: ${input.tone}\nConstraints: ${input.constraints}\nOutput: a single prompt ready to paste.`
};

export const systemPrompt = `You are an expert prompt engineer.\nYour job is to generate a single, high-quality, copy-paste-ready prompt.\nBe concise and specific.\nDo not include explanations or filler.\nReturn only the final prompt.`;
