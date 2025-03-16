import express, { Application } from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "./config/swagger";
import routes from "./routes"; // Importing the unified routes
import { connectDatabase } from "./config/database"; // MongoDB Connection Setup


const app: Application = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));


// MongoDB Connection
connectDatabase();

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Initialize Routes
app.use("/api/v1", routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

export default app;
