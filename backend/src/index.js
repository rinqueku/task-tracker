import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import sequelize from "./config/database.js";
import "./models/index.js";
import authRoutes from "./routes/auth.js";
import categoryRoutes from "./routes/categories.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin ? corsOrigin.split(",").map((s) => s.trim()) : true,
  credentials: true,
}));
app.use(helmet());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

async function start() {
  const MAX_RETRIES = 10;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sequelize.sync();
      console.log("Database synced");
      app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
      return;
    } catch (err) {
      console.error(`DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, err.message);
      if (attempt === MAX_RETRIES) {
        console.error("Failed to connect to database after all retries");
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY));
    }
  }
}

if (process.env.NODE_ENV !== "test") {
  start();
}

export default app;