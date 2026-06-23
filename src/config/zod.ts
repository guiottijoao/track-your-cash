import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Add method .openapi() to zod
extendZodWithOpenApi(z)