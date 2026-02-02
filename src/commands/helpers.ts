import { Context } from "telegraf";

export const extractText = (ctx: Context) => {
  if ("message" in ctx && ctx.message && "text" in ctx.message) {
    return ctx.message.text.trim();
  }

  if ("callbackQuery" in ctx && ctx.callbackQuery && "data" in ctx.callbackQuery) {
    return ctx.callbackQuery.data;
  }

  return "";
};
