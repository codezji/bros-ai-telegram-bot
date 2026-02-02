import { Markup, Scenes } from "telegraf";
import { extractText } from "./helpers";
import { generatePrompt } from "../services/openai";
import { promptTemplates } from "../utils/promptTemplates";
import { trackUsage } from "../services/db";

interface ReelSession extends Scenes.WizardSessionData {
  topic?: string;
  audience?: string;
  length?: string;
  cta?: string;
}

export const reelWizard = new Scenes.WizardScene<Scenes.WizardContext<ReelSession>>(
  "reel-wizard",
  async (ctx) => {
    await ctx.reply(
      "🎬 *Reel Script Builder*\nWhat is the reel topic?",
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

    await ctx.reply("Who is the audience?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const audience = extractText(ctx);
    if (!audience) {
      await ctx.reply("Please share the audience to continue.");
      return;
    }
    ctx.wizard.state.audience = audience;

    await ctx.reply(
      "Select a reel length:",
      Markup.inlineKeyboard([
        [Markup.button.callback("15 seconds", "15 seconds")],
        [Markup.button.callback("30 seconds", "30 seconds")],
        [Markup.button.callback("60 seconds", "60 seconds")]
      ])
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const length = extractText(ctx);
    if (!length) {
      await ctx.reply("Please share a length to continue.");
      return;
    }
    ctx.wizard.state.length = length;

    await ctx.reply("What is the call-to-action?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const cta = extractText(ctx);
    if (!cta) {
      await ctx.reply("Please share a CTA to continue.");
      return;
    }
    ctx.wizard.state.cta = cta;

    await ctx.reply("Generating your prompt...", { parse_mode: "Markdown" });

    const prompt = promptTemplates.reel({
      topic: ctx.wizard.state.topic ?? "",
      audience: ctx.wizard.state.audience ?? "",
      length: ctx.wizard.state.length ?? "",
      cta
    });

    const finalPrompt = await generatePrompt(prompt);
    await ctx.reply(`*Your Prompt*\n\n${finalPrompt}`, { parse_mode: "Markdown" });

    if (ctx.from) {
      await trackUsage(ctx.from.id, "/reel_script");
    }

    return ctx.scene.leave();
  }
);
