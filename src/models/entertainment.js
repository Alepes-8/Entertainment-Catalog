import mongoose from "mongoose";
import { MODEL_TYPES, ENTERTAINMENT_TYPES } from "../config/constants.js";

const entertainmentSchema = new mongoose.Schema({
    title: {type: String, required: true}, 
    entertainmentType: {type: String, enum: [ENTERTAINMENT_TYPES.MOVIE, ENTERTAINMENT_TYPES.SERIES], required: true},
    genre: [{type: mongoose.Schema.Types.ObjectId, ref: MODEL_TYPES.GENRE}], 
    releaseYear: {type: Date, required: true},
    lastUpdate: { type: Date, default: Date.now },
    watchMongodEntertainemntID: {type: Number, unique: true, required: true}
});

export default mongoose.model(MODEL_TYPES.ENTERTAINEMNT, entertainmentSchema);
