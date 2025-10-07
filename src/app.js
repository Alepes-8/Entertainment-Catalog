// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/routes.js"
import { swaggerUi, swaggerSpec } from "../swagger/swaggerConfig.js";
import YAML from "yamljs";

//Create application and set it to use jsonb and movie routes.
dotenv.config();

const app = express();

// ----------------- Middleware -----------------
app.use(cors());
app.use(express.json());    //Without this, the body will be undefined


// ----------------- Setup swagger ui -----------------
// This runs on http://localhost:5000/api-docs
const swaggerDocument = YAML.load("../swagger/src/routes/openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ----------------- Routes -----------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/entertainment", routes);

// ----------------- MongoDB Connection -----------------
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/entertainment";

// Only connect to Mongo if not in test 
if (process.env.NODE_ENV !== "test") {
  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is not defined");
    process.exit(1);
  }

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log("✅ MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1); // Stop server if DB connection fails
    });
}

// ----------------- Export app for testing -----------------
export default app