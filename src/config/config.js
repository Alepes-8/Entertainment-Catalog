import dotenv from 'dotenv';
dotenv.config(); // loads variables from .env

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/entertainment";
export const PORT = process.env.PORT || 5000;
export const WATCHMODE_API_KEY = process.env.WATCHMODE_API_KEY || 'K4EXjV3x3q7DbpiOr7XGFSKgOLJjfDbtIyznLNXc'; //TODO fix why this isn't adding the watchmodeapi key from env