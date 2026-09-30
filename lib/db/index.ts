import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "";

declare global {
  // eslint-disable-next-line no-var
  var postgresClient: ReturnType<typeof postgres> | undefined;
}

// Transaction pooler (port 6543) requires prepare: false
const client =
  globalThis.postgresClient ??
  postgres(connectionString, {
    prepare: false,
    ssl: "require",
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresClient = client;
}

export const db = drizzle(client, { schema });

