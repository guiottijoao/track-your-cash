import { z } from "zod";
import { registry } from "../../config/openapi";
import { idSchema } from "./generic/id.schema";

export const pierreApiKeySchema = z.object({
  pierre_api_key: z
    .string()
    .startsWith("sk-")
    .openapi({ example: "sk-abc123" }),
});

registry.registerPath({
  method: "post",
  path: "/users/{id}/pierre-key",
  summary: "Save Pierre API key",
  request: {
    params: idSchema,
    body: {
      content: {
        "application/json": { schema: pierreApiKeySchema },
      },
    },
  },
  responses: {
    204: { description: "Key saved successfully" },
    400: { description: "Invalid data" },
    404: { description: "User not found" },
  },
});
