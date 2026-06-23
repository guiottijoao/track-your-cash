import { z } from "zod";
import { registry } from "../../config/openapi";

export const registerSchema = z.object({
  name: z.string().min(3).openapi({ example: "John Doe" }),
  email: z.email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
});

export const loginSchema = z.object({
  email: z.email().openapi({ example: "john@example.com" }),
  password: z.string().min(6).openapi({ example: "secret123" }),
});

const tokenResponseSchema = z
  .string()
  .openapi({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example" });

const validationErrorSchema = z.object({
  errors: z.unknown(),
});

const messageErrorSchema = z.object({
  message: z.string(),
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  summary: "Register user",
  request: {
    body: {
      content: {
        "application/json": { schema: registerSchema },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
      content: {
        "application/json": { schema: tokenResponseSchema },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": { schema: validationErrorSchema },
      },
    },
    409: {
      description: "User already exists",
      content: {
        "application/json": { schema: messageErrorSchema },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Authenticate user",
  request: {
    body: {
      content: {
        "application/json": { schema: loginSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
      content: {
        "application/json": { schema: tokenResponseSchema },
      },
    },
    400: {
      description: "Invalid data",
      content: {
        "application/json": { schema: validationErrorSchema },
      },
    },
    401: {
      description: "Invalid credentials",
      content: {
        "application/json": { schema: messageErrorSchema },
      },
    },
  },
});
