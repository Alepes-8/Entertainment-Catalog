import mongoose from "mongoose";
import { MODEL_TYPES } from "../config/constants.js";

const platformsSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}, 
    watchModeSourceId: {type: Number, requred: true, unique: true},
    url: {type: String}
});

export default mongoose.model(MODEL_TYPES.PLATFORM, platformsSchema);