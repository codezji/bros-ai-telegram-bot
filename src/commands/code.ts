import { Markup, Scenes } from "telegraf";
import { extractText } from "./helpers";
import { generatePrompt } from "../services/openai";
import { promptTemplates } from "../utils/promptTemplates";
import { trackUsage } from "../services/db";

interface CodeSession extends Scenes.WizardSessionData {
  stack?: string;
  task?: string;
  constraints?: string;
}

export const codeWizard = new Scenes.WizardScene<Scenes.WizardContext<CodeSession>>(
  "code-wizard",
  async (ctx) => {
    await ctx.reply(
      "💻 *Code Prompt Builder*\nWhat language or stack?",
      { parse_mode: "Markdown" }
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    const stack = extractText(ctx);
    if (!stack) {
      await ctx.reply("Please share a language or stack to continue.");
      return;
    }
    ctx.wizard.state.stack = stack;

    await ctx.reply("Describe the coding task.");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const task = extractText(ctx);
    if (!task) {
      await ctx.reply("Please describe the task to continue.");
      return;
    }
    ctx.wizard.state.task = task;

    await ctx.reply(
      "Any constraints or preferences?",
      Markup.inlineKeyboard([
        [Markup.button.callback("Best practices", "Best practices")],
        [Markup.button.callback("Performance focused", "Performance focused")],
        [Markup.button.callback("Security focused", "Security focused")]
      ])
    );
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

    const prompt = promptTemplates.code({
      stack: ctx.wizard.state.stack ?? "",
      task: ctx.wizard.state.task ?? "",
      constraints
    });

    const finalPrompt = await generatePrompt(prompt);
    await ctx.reply(`*Your Prompt*\n\n${finalPrompt}`, { parse_mode: "Markdown" });

    if (ctx.from) {
      await trackUsage(ctx.from.id, "/code_prompt");
    }

    return ctx.scene.leave();
  }
);
