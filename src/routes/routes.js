import express from "express";
import enteraintmentControllers from "../controllers/entertainmentController.js"

const router = express.Router();

router.get("/health", enteraintmentControllers.healthCheck)
router.get("/search", enteraintmentControllers.findMoviesOnFilter);
router.post("/updatePlatformForRegion", enteraintmentControllers.uppdateEntertainemntData);
router.get("/updatePlatformIds", enteraintmentControllers.getPlatformIdsFromWatchmodeApi);

export default router;