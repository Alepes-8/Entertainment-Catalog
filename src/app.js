// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js"
import { swaggerUi, swaggerSpec } from "../swagger/swaggerConfig.js";
import YAML from "yamljs";
import { fileURLToPath } from "url";
import path from "path";
import { MONGO_URI, PORT } from './config/config.js';

//Create application and set it to use jsonb and movie routes.
dotenv.config();

const app = express();

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json());    //Without this, the body will be undefined


// ----------------- Setup swagger ui -----------------
// This runs on http://localhost:5000/api-docs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const swaggerPath = path.resolve(__dirname, "../swagger/src/routes/openapi.yaml");
const swaggerDocument = YAML.load(swaggerPath);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log("📘 Swagger docs available at: http://localhost:5000/api-docs");

// ----------------- Routes -----------------
app.get("/", (req, res) => {
  res.send("Entertainment API is running...");
});

app.use("/entertainment", routes);

// ----------------- MongoDB Connection -----------------
// Only connect to Mongo if not in test 
if (process.env.NODE_ENV !== "test") {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined");
    process.exit(1);
  }

  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

  // 👇 This was missing
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} \n Address ${MONGO_URI}`));
}
// ----------------- Export app for testing -----------------
export default app