import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import couponRouter from "./routes/couponRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Allow local dev, the known deployed frontend, and anything extra added
// via ALLOWED_ORIGINS (comma-separated) in env vars — e.g. once the admin
// panel is deployed, add its URL to ALLOWED_ORIGINS on Render.
const extraOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://arabfoodrestrurant.netlify.app",
  process.env.FRONTEND_URL,
  ...extraOrigins,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

connectDB();

app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => res.send("Arab Food Punjab API ✅"));

app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
