import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

import { NeonHttpDatabase } from "drizzle-orm/neon-http";

let instance: NeonHttpDatabase<typeof fullSchema> | undefined;

export function getDb() {
  if (!instance) {
    const queryClient = neon(env.databaseUrl);
    instance = drizzle(queryClient, {
      schema: fullSchema,
    });
  }
  return instance;
}
