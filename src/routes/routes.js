import express from "express";
import entertainmentControllers from "../controllers/entertainmentController.js"
import { query, validationResult } from "express-validator";
const router = express.Router();

router.get("/health", entertainmentControllers.healthCheck)
router.get("/search", 
    [
        query("title").optional().isString().trim().escape(),
        query("type").optional().isString().trim().escape(),
        query("releaseYear").optional().isInt({ min: 1800, max: 2100 }),
        query("region").optional().isString().trim().escape(),
    ], 
    handleValidation,
    entertainmentControllers.findMoviesOnFilter
);

router.post("/updatePlatformForRegion",
    [
        query("platform").optional().isString().trim().escape(),
        query("region").optional().isString().trim().escape(),
    ], 
    handleValidation,
    entertainmentControllers.uppdateEntertainemntData
);

router.get("/updatePlatformIds", entertainmentControllers.getPlatformIdsFromWatchmodeApi);

export default router;

// Middleware reused for all routes
function handleValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}
