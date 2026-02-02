import { Markup, Scenes } from "telegraf";
import { extractText } from "./helpers";
import { generatePrompt } from "../services/openai";
import { promptTemplates } from "../utils/promptTemplates";
import { trackUsage } from "../services/db";

interface ImageSession extends Scenes.WizardSessionData {
  subject?: string;
  style?: string;
  mood?: string;
  camera?: string;
}

export const imageWizard = new Scenes.WizardScene<Scenes.WizardContext<ImageSession>>(
  "image-wizard",
  async (ctx) => {
    await ctx.reply(
      "📸 *Image Prompt Builder*\nWhat is the main subject?",
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const subject = extractText(ctx);
    if (!subject) {
      await ctx.reply("Please share a subject to continue.");
      return;
    }
    ctx.wizard.state.subject = subject;

    await ctx.reply("Choose a style:", Markup.inlineKeyboard([
      [Markup.button.callback("Cinematic", "Cinematic")],
      [Markup.button.callback("Photorealistic", "Photorealistic")],
      [Markup.button.callback("Illustration", "Illustration")]
    ]));
    return ctx.wizard.next();
  },
  async (ctx) => {
    const style = extractText(ctx);
    if (!style) {
      await ctx.reply("Please share a style to continue.");
      return;
    }
    ctx.wizard.state.style = style;

    await ctx.reply("What mood should the image convey?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const mood = extractText(ctx);
    if (!mood) {
      await ctx.reply("Please share a mood to continue.");
      return;
    }
    ctx.wizard.state.mood = mood;

    await ctx.reply("Preferred camera or lens details?");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const camera = extractText(ctx);
    if (!camera) {
      await ctx.reply("Please share camera details to continue.");
      return;
    }
    ctx.wizard.state.camera = camera;

    await ctx.reply("Generating your prompt...", { parse_mode: "Markdown" });

    const prompt = promptTemplates.image({
      subject: ctx.wizard.state.subject ?? "",
      style: ctx.wizard.state.style ?? "",
      mood: ctx.wizard.state.mood ?? "",
      camera
    });

    const finalPrompt = await generatePrompt(prompt);
    await ctx.reply(`*Your Prompt*\n\n${finalPrompt}`, { parse_mode: "Markdown" });

    if (ctx.from) {
      await trackUsage(ctx.from.id, "/image_prompt");
    }

    return ctx.scene.leave();
  }
);
