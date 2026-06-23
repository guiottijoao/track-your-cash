import '../config/zod'
import express from "express";
import swaggerUi from 'swagger-ui-express'
import routes from "./routes/index";
import { errorHandler } from "./middleware/error-handler";
import { generateOpenApiDocument } from '../config/openapi';

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);

const document = generateOpenApiDocument()
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(document))

export default app;
