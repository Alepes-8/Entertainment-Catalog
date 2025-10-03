import express from "express";
import Entertainment from "../models/entertainment.js"
import Avalability from "../models/avalability.js";
import Platforms from "../models/platforms.js";
import Genres from "../models/genres.js";

const router = express.Router();

router.get("/health", async(req, res) => {
    res.status(200).json({status: 'ok'})
})

/** TODO
 * Create a get function in which it handles different inputs values each time
 *      - Get data based on country
 *      - Get data based on genre
 *      - get data based on platform
 *      - Get data based on title
 *      - Get data based on year
 */

router.get("/:title", async(req, res) => {
    const entertainment = await Entertainment.find({title: req.params.title}).populate("Genre");
    res.json(entertainment)
})

export default router;