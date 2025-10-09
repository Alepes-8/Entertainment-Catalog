import dotenv from 'dotenv';
dotenv.config(); // loads variables from .env

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/entertainment";
export const PORT = process.env.PORT || 5000;