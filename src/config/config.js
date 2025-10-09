import dotenv from 'dotenv';
dotenv.config(); // loads variables from .env

export const DB_URI = process.env.DB_URI;
export const PORT = process.env.PORT || 3000;