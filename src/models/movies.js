import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    Title: {type: String, required: true}, 
    Type: {type: String, enum: ["movie", "series"], required: true},
    genre: [{type: mongoose.Schema.Types.ObjectId, ref: "Genre"}], 
    releaseYear: {type: Date, required: true},
    lastUpdate: { type: Date, default: Date.now }
});

export default mongoose.model("Movie", movieSchema);
