import express from "express";
import { errorHandler } from "./middleware/error-handler";
import routes from "./routes/index";

const app = express();

app.use(express.json());
app.use("/api", routes);
app.use(errorHandler);

export default app;
