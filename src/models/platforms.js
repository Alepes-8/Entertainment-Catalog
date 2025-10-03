import mongoose from "mongoose";

const platformsSchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true}, 
    url: {type: String}
});

export default mongoose.model("Platform", platformsSchema);