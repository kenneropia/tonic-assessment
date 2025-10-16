import fs from "fs";
import path from "path";
import morgan from "morgan";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const accessLogStream = fs.createWriteStream(path.join(logsDir, "access.log"), {
  flags: "a",
});
const transactionLogStream = fs.createWriteStream(
  path.join(logsDir, "transactions.log"),
  { flags: "a" }
);

morgan.token("user-id", (req: Request) => {
  return (req as AuthenticatedRequest).user?.userId || "anonymous";
});

const logFormat = ":method :url :status - :user-id - :response-time ms";

export const accessLogger = morgan(logFormat, { stream: accessLogStream });

export const logTransaction = (data: any) => {
  const entry = `[${new Date().toISOString()}] ${JSON.stringify(data)}\n`;
  transactionLogStream.write(entry);
};
