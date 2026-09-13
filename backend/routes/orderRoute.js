import express from "express";
import authMiddleware, { adminAuth } from "../middleware/auth.js";
import { placeOrderCod, placeOrderRazorpay, verifyRazorpay, listOrders, userOrders, updateStatus, removeOrder, deleteAllOrders, getDashboardStats } from "../controllers/orderController.js";

const orderRouter = express.Router();
// Customer routes — any logged-in user
orderRouter.post("/place-cod", authMiddleware, placeOrderCod);
orderRouter.post("/place-razorpay", authMiddleware, placeOrderRazorpay);
orderRouter.post("/verify-razorpay", authMiddleware, verifyRazorpay);
orderRouter.post("/userorders", authMiddleware, userOrders);

// Admin-only routes
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/remove", adminAuth, removeOrder);
orderRouter.post("/delete-all", adminAuth, deleteAllOrders);
orderRouter.get("/dashboard-stats", adminAuth, getDashboardStats);
export default orderRouter;
