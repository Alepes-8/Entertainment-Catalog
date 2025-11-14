import mongoose from "mongoose";

const apiCalledSchema = new mongoose.Schema({
    apiName: {type: String, required: true, unique: true},
    lastCalled: {type: Date, required: true}
});

export default mongoose.model("ApiCalled", apiCalledSchema);