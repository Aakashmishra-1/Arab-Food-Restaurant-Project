import express from "express";
import { adminAuth } from "../middleware/auth.js";
import { createCoupon, listCoupons, deleteCoupon, toggleCoupon, validateCoupon } from "../controllers/couponController.js";

const couponRouter = express.Router();
couponRouter.post("/create", adminAuth, createCoupon);
couponRouter.get("/list", adminAuth, listCoupons);
couponRouter.post("/delete", adminAuth, deleteCoupon);
couponRouter.post("/toggle", adminAuth, toggleCoupon);
couponRouter.post("/validate", validateCoupon); // public — used at customer checkout
export default couponRouter;
