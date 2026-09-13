import express from "express";
import authMiddleware from "../middleware/auth.js";
import { registerUser, loginUser, getProfile, updateProfile, addAddress, deleteAddress, toggleWishlist, getWishlist, claimCoupon, getClaimedCoupons } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.post("/profile/update", authMiddleware, updateProfile);
userRouter.post("/address/add", authMiddleware, addAddress);
userRouter.post("/address/delete", authMiddleware, deleteAddress);
userRouter.post("/wishlist/toggle", authMiddleware, toggleWishlist);
userRouter.post("/wishlist/get", authMiddleware, getWishlist);
userRouter.post("/coupon/claim", authMiddleware, claimCoupon);
userRouter.post("/coupon/my", authMiddleware, getClaimedCoupons);

export default userRouter;
