import { createBot } from "./bot";

const bot = createBot();

bot.launch().then(() => {
  console.log("Bot launched");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
