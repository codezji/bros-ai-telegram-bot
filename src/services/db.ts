import { Pool } from "pg";
import { env } from "../config/env";

let pool: Pool | null = null;

export const getDb = () => {
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: env.DATABASE_URL });
  }

  return pool;
};

export const trackUsage = async (userId: number, command: string) => {
  const db = getDb();
  if (!db) {
    return;
  }

  try {
    await db.query(
      "INSERT INTO command_usage (user_id, command, used_at) VALUES ($1, $2, NOW())",
      [userId, command]
    );
  } catch (error) {
    console.error("Failed to track usage", error);
  }
};
