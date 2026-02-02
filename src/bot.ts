import { Telegraf, Markup, Scenes, session, Context } from "telegraf";
import { env } from "./config/env";
import { instaWizard } from "./commands/insta";
import { imageWizard } from "./commands/image";
import { reelWizard } from "./commands/reel";
import { codeWizard } from "./commands/code";
import { chatgptWizard } from "./commands/chatgpt";
import { trackUsage } from "./services/db";

const stage = new Scenes.Stage([
  instaWizard,
  imageWizard,
  reelWizard,
  codeWizard,
  chatgptWizard
]);

const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

const rateLimitMiddleware = async (ctx: Context, next: () => Promise<void>) => {
  if (!ctx.from) {
    return next();
  }

  const now = Date.now();
  const entry = rateLimitMap.get(ctx.from.id);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ctx.from.id, { count: 1, resetAt: now + env.RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= env.RATE_LIMIT_MAX) {
    await ctx.reply("⚠️ Rate limit reached. Please try again in a minute.");
    return;
  }

  entry.count += 1;
  return next();
};

export const createBot = () => {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  bot.use(rateLimitMiddleware);
  bot.use(session());
  bot.use(stage.middleware());

  bot.start(async (ctx) => {
    await ctx.reply(
      "🚀 *bros.ai Prompt Bot*\nChoose a prompt category:",
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("Instagram", "cmd_insta")],
          [Markup.button.callback("Image", "cmd_image")],
          [Markup.button.callback("Reel Script", "cmd_reel")],
          [Markup.button.callback("Code", "cmd_code")],
          [Markup.button.callback("ChatGPT", "cmd_chatgpt")]
        ])
      }
    );
    if (ctx.from) {
      await trackUsage(ctx.from.id, "/start");
    }
  });

  bot.help(async (ctx) => {
    await ctx.reply(
      "*Available Commands*\n" +
        "/insta_prompt - Instagram post prompt\n" +
        "/image_prompt - Image generation prompt\n" +
        "/reel_script - Short-form reel script prompt\n" +
        "/code_prompt - Coding prompt\n" +
        "/chatgpt_prompt - ChatGPT prompt\n\n" +
        "Use /start to see buttons.",
      { parse_mode: "Markdown" }
    );
    if (ctx.from) {
      await trackUsage(ctx.from.id, "/help");
    }
  });

  bot.action("cmd_insta", (ctx) => ctx.scene.enter("insta-wizard"));
  bot.action("cmd_image", (ctx) => ctx.scene.enter("image-wizard"));
  bot.action("cmd_reel", (ctx) => ctx.scene.enter("reel-wizard"));
  bot.action("cmd_code", (ctx) => ctx.scene.enter("code-wizard"));
  bot.action("cmd_chatgpt", (ctx) => ctx.scene.enter("chatgpt-wizard"));

  bot.command("insta_prompt", (ctx) => ctx.scene.enter("insta-wizard"));
  bot.command("image_prompt", (ctx) => ctx.scene.enter("image-wizard"));
  bot.command("reel_script", (ctx) => ctx.scene.enter("reel-wizard"));
  bot.command("code_prompt", (ctx) => ctx.scene.enter("code-wizard"));
  bot.command("chatgpt_prompt", (ctx) => ctx.scene.enter("chatgpt-wizard"));

  bot.catch(async (err, ctx) => {
    console.error("Bot error", err);
    await ctx.reply("Something went wrong. Please try again later.");
  });

  return bot;
};
