import "reflect-metadata";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import apiRoutes from "./routes";

dotenv.config();

const app = express();

//allow the React app (and, later, the deployed frontend) to call this API.
const origins = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json());

//quick liveness check: open http://localhost:3001/api/health in a browser.
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

app.use("/api", apiRoutes);

const PORT = Number(process.env.PORT ?? 3001);

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Database connected (TypeORM).");
    app.listen(PORT, () => console.log(`🚀 VV API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ Failed to connect to the database:", err);
    process.exit(1);
  });
