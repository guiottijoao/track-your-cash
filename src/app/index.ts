import "../config/zod";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index";
import { errorHandler } from "./middleware/error-handler";
import { generateOpenApiDocument } from "../config/openapi";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);
app.use(errorHandler);

const document = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(document));

export default app;
