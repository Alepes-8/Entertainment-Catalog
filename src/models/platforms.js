import mongoose from "mongoose";
import { MODEL_TYPES } from "../config/constants.js";

const platformsSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}, 
    watchModePlatformId: {type: Number, requred: true, unique: true}
});

export default mongoose.model(MODEL_TYPES.PLATFORM, platformsSchema);