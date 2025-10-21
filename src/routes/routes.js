import express from "express";
import enteraintmentControllers from "../controllers/entertainmentController.js"

const router = express.Router();

router.get("/health", enteraintmentControllers.healthCheck)
router.get("/", enteraintmentControllers.findMoviesOnFilter);
router.post("/:platform", enteraintmentControllers.uppdateEntertainemntData);
router.get("/updateSourceId", enteraintmentControllers.getSourceIdsFromWatchmodeApi);

export default router;