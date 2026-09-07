import { createHash } from "node:crypto";
import { z } from "zod";

export const visitorIdSchema = z.string().uuid();

export function hashVisitorId(visitorId: string) {
  return createHash("sha256").update(visitorId).digest("hex");
}
