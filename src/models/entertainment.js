import mongoose from "mongoose";

const entertainmentSchema = new mongoose.Schema({
    title: {type: String, required: true}, 
    entertainmentType: {type: String, enum: ["movie", "series"], required: true},
    genre: [{type: mongoose.Schema.Types.ObjectId, ref: "Genre"}], 
    releaseYear: {type: Date, required: true},
    lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model("Entertainment", entertainmentSchema);
