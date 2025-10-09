import mongoose from "mongoose";
import { MODEL_TYPES } from "../config/constants.js";

const genreSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}
})

export default mongoose.model(MODEL_TYPES.GENRE, genreSchema);
