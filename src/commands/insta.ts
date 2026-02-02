import { Markup, Scenes } from "telegraf";
import { extractText } from "./helpers";
import { generatePrompt } from "../services/openai";
import { promptTemplates } from "../utils/promptTemplates";
import { trackUsage } from "../services/db";

interface InstaSession extends Scenes.WizardSessionData {
  topic?: string;
  tone?: string;
  audience?: string;
}

export const instaWizard = new Scenes.WizardScene<Scenes.WizardContext<InstaSession>>(
  "insta-wizard",
  async (ctx) => {
    await ctx.reply(
      "✨ *Instagram Prompt Builder*\nWhat is the topic?",
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const topic = extractText(ctx);
    if (!topic) {
      await ctx.reply("Please share a topic to continue.");
      return;
    }
    ctx.wizard.state.topic = topic;

    await ctx.reply(
      "Pick a tone (or type your own):",
      Markup.inlineKeyboard([
        [Markup.button.callback("Professional", "Professional")],
        [Markup.button.callback("Playful", "Playful")],
        [Markup.button.callback("Inspirational", "Inspirational")]
      ])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const tone = extractText(ctx);
    if (!tone) {
      await ctx.reply("Please share a tone to continue.");
      return;
    }
    ctx.wizard.state.tone = tone;

    await ctx.reply(
      "Who is the target audience?",
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const audience = extractText(ctx);
    if (!audience) {
      await ctx.reply("Please share the audience to continue.");
      return;
    }
    ctx.wizard.state.audience = audience;

    await ctx.reply("Generating your prompt...", { parse_mode: "Markdown" });

    const prompt = promptTemplates.insta({
      topic: ctx.wizard.state.topic ?? "",
      tone: ctx.wizard.state.tone ?? "",
      audience
    });

    const finalPrompt = await generatePrompt(prompt);
    await ctx.reply(`*Your Prompt*\n\n${finalPrompt}`, { parse_mode: "Markdown" });

    if (ctx.from) {
      await trackUsage(ctx.from.id, "/insta_prompt");
    }

    return ctx.scene.leave();
  }
);
