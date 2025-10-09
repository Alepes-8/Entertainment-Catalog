import mongoose from "mongoose";
import { MODEL_TYPES } from "../config/constants.js";

const availabilitySchema = new mongoose.Schema({
    entertainmentId: {type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.ENTERTAINEMNT, required: true },
    platformId: {type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.PLATFORM, required: true },
    region: {type: String, required: true, match: /^[A-Z]{2}$/},
    available: Boolean
})

export default mongoose.model(MODEL_TYPES.AVAILABILITY, availabilitySchema);