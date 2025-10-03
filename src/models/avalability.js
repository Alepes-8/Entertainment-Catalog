import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    movieId: {type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
    platformId: {type: mongoose.Schema.Types.ObjectId, ref: "Platform", required: true },
    region: {type: String, required: true, match: /^[A-Z]{2}$/},
    available: Boolean
})

export default mongoose.model("Avalability", availabilitySchema);