import { Markup, Scenes } from "telegraf";
import { extractText } from "./helpers";
import { generatePrompt } from "../services/openai";
import { promptTemplates } from "../utils/promptTemplates";
import { trackUsage } from "../services/db";

interface ChatgptSession extends Scenes.WizardSessionData {
  domain?: string;
  goal?: string;
  tone?: string;
  constraints?: string;
}

export const chatgptWizard = new Scenes.WizardScene<Scenes.WizardContext<ChatgptSession>>(
  "chatgpt-wizard",
  async (ctx) => {
    await ctx.reply(
      "🤖 *ChatGPT Prompt Builder*\nWhat is the domain or topic?",
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const domain = extractText(ctx);
    if (!domain) {
      await ctx.reply("Please share the domain to continue.");
      return;
    }
    ctx.wizard.state.domain = domain;

    await ctx.reply("What should the prompt help accomplish?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const goal = extractText(ctx);
    if (!goal) {
      await ctx.reply("Please share the goal to continue.");
      return;
    }
    ctx.wizard.state.goal = goal;

    await ctx.reply(
      "Choose a tone:",
      Markup.inlineKeyboard([
        [Markup.button.callback("Professional", "Professional")],
        [Markup.button.callback("Friendly", "Friendly")],
        [Markup.button.callback("Direct", "Direct")]
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

    await ctx.reply("Any constraints or requirements?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const constraints = extractText(ctx);
    if (!constraints) {
      await ctx.reply("Please share constraints to continue.");
      return;
    }
    ctx.wizard.state.constraints = constraints;

    await ctx.reply("Generating your prompt...", { parse_mode: "Markdown" });

    const prompt = promptTemplates.chatgpt({
      domain: ctx.wizard.state.domain ?? "",
      goal: ctx.wizard.state.goal ?? "",
      tone: ctx.wizard.state.tone ?? "",
      constraints
    });

    const finalPrompt = await generatePrompt(prompt);
    await ctx.reply(`*Your Prompt*\n\n${finalPrompt}`, { parse_mode: "Markdown" });

    if (ctx.from) {
      await trackUsage(ctx.from.id, "/chatgpt_prompt");
    }

    return ctx.scene.leave();
  }
);
