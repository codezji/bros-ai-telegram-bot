# bros.ai Prompt Bot

Telegram bot that generates high-quality, copy-paste-ready prompts for creators, developers, and AI users.

## Environment Setup

1. Copy the example file and fill in values:

```bash
cp .env.example .env
```

2. Required variables:

- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `OPENAI_API_KEY` - OpenAI API key
- `OPENAI_MODEL` - Model ID (default: `gpt-4o-mini`)
- `DATABASE_URL` - Optional PostgreSQL connection string
- `RATE_LIMIT_WINDOW_MS` - Rate limit window (default: 60000)
- `RATE_LIMIT_MAX` - Max requests per user in window (default: 10)

## Install & Run

```bash
npm install
npm run dev
```

## Build & Start

```bash
npm run build
npm start
```

## Database Setup (Optional)

Create a table for usage tracking:

```sql
CREATE TABLE IF NOT EXISTS command_usage (
  id SERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  command TEXT NOT NULL,
  used_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Deployment (Railway / Render / Fly.io)

1. Create a new service and link this repo.
2. Add environment variables from `.env`.
3. Set start command to:

```bash
npm run build && npm start
```

4. Deploy and verify logs for `Bot launched`.

## Example API Calls (OpenAI)

The bot sends a deterministic request with a system role and user prompt:

```ts
const response = await client.chat.completions.create({
  model: "gpt-4o-mini",
  temperature: 0.2,
  messages: [
    { role: "system", content: "You are an expert prompt engineer..." },
    { role: "user", content: "Act as a professional Instagram content strategist..." }
  ]
});
```

## Future Feature Suggestions

- Monetization: tiered plans for premium prompt packs and brand voice presets.
- Premium prompts: saved prompt library per user with tagging and analytics.
- Team workspaces: shared prompt projects and approval workflows.
- Media kits: auto-generate reels + captions + image prompts in bundles.
- CRM sync: push leads to Airtable/HubSpot when users request growth prompts.

## Commands

- `/start` - Main menu
- `/help` - Command list
- `/insta_prompt` - Instagram post prompt
- `/image_prompt` - Image generation prompt
- `/reel_script` - Reel script prompt
- `/code_prompt` - Coding prompt
- `/chatgpt_prompt` - General ChatGPT prompt
