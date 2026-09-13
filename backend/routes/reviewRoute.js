import express from "express";
import authMiddleware from "../middleware/auth.js";
import { addReview, getFoodReviews, getAllReviews } from "../controllers/reviewController.js";

const reviewRouter = express.Router();
reviewRouter.post("/add", authMiddleware, addReview);
reviewRouter.get("/all", getAllReviews);
reviewRouter.get("/:foodId", getFoodReviews);
export default reviewRouter;
