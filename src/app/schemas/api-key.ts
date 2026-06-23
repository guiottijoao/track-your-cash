import { z } from "zod";

export const pierreApiKeySchema = z.object({
  pierre_api_key: z.string().startsWith("sk-"),
});