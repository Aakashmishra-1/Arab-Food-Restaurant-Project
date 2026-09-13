import express from "express";
import multer from "multer";
import { adminAuth } from "../middleware/auth.js";
import { listFood, listAllFoodPublic, listFoodForCustomer, addFood, updateFood, removeFood, toggleStock, setTodaysMenu, getTodaysMenu } from "../controllers/foodController.js";

const foodRouter = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}${file.originalname}`),
});
const upload = multer({ storage });

// Admin-only management routes
foodRouter.get("/list", adminAuth, listFood);
foodRouter.post("/add", adminAuth, upload.single("image"), addFood);
foodRouter.post("/update", adminAuth, upload.single("image"), updateFood);
foodRouter.post("/remove", adminAuth, removeFood);
foodRouter.post("/toggle-stock", adminAuth, toggleStock);
foodRouter.post("/todays-menu/set", adminAuth, setTodaysMenu);

// Public routes used by the customer-facing site
foodRouter.get("/all-list", listAllFoodPublic);
foodRouter.get("/customer-list", listFoodForCustomer);
foodRouter.get("/todays-menu/get", getTodaysMenu);

export default foodRouter;
