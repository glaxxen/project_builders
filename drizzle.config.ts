import { defineConfig } from "drizzle-kit";
import fs from "fs";

// Load .env.local if present
let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";
if (!connectionString && fs.existsSync(".env.local")) {
  const content = fs.readFileSync(".env.local", "utf8");
  const directMatch = content.match(/DIRECT_URL="([^"]+)"/);
  const dbMatch = content.match(/DATABASE_URL="([^"]+)"/);
  connectionString = (directMatch?.[1] || dbMatch?.[1] || "") as string;
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
