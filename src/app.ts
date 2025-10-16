import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { connectMongoDB, connectRedis } from "./config/database";
import routes from "./routes";
import { apiLimiter } from "./middlewares/rateLimiter.middleware";
import { accessLogger, logTransaction } from "./utils/logger";
import { requestLogger, errorLogger } from "./middlewares/logger.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectMongoDB();
connectRedis();

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(accessLogger);
app.use(requestLogger);
app.use("/api", apiLimiter);

app.use("/api", routes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error logging middleware
app.use(errorLogger);

// ERROR handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLogStream = fs.createWriteStream(path.join(logsDir, "error.log"), {
    flags: "a",
  });

  const timestamp = new Date().toISOString();
  const errorMessage = `[${timestamp}] ${
    err.stack || err.message || "Unknown error"
  }\n`;
  errorLogStream.write(errorMessage);

  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
