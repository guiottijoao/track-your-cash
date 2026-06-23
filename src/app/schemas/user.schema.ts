import { z } from "zod";
import { registry } from "../../config/openapi";
import { idSchema } from "./generic/id.schema";

export const createUserSchema = z.object({
  name: z.string().min(3).openapi({ example: "John Doe" }),
  email: z.email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
});

export const updateUserSchema = createUserSchema.partial();

const userResponseSchema = z.object({
  id: z.number().int().openapi({ example: 1 }),
  name: z.string().openapi({ example: "John Doe" }),
  email: z.string().openapi({ example: "john@example.com" }),
  created_at: z.iso.datetime().openapi({ example: "2026-06-23T10:00:00.000Z" }),
});

const messageErrorSchema = z.object({
  message: z.string(),
});

const validationErrorSchema = z.object({
  errors: z.unknown(),
});

registry.registerPath({
  method: "get",
  path: "/users",
  summary: "List all users",
  responses: {
    200: {
      description: "Users returned successfully",
      content: {
        "application/json": {
          schema: z.array(userResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/users/{id}",
  summary: "Get user by id",
  request: {
    params: idSchema,
  },
  responses: {
    200: {
      description: "User returned successfully",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/users",
  summary: "Create user",
  request: {
    body: {
      content: {
        "application/json": {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    409: {
      description: "Email already in use",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/users/{id}",
  summary: "Update user",
  request: {
    params: idSchema,
    body: {
      content: {
        "application/json": {
          schema: updateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: userResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": {
          schema: validationErrorSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
    409: {
      description: "Email already in use",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/users/{id}",
  summary: "Delete user",
  request: {
    params: idSchema,
  },
  responses: {
    204: { description: "User deleted successfully" },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: messageErrorSchema,
        },
      },
    },
  },
});