import reviewModel from "../models/reviewModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

const addReview = async (req, res) => {
  try {
    const { foodId, rating, comment, orderId } = req.body;
    const userId = req.body.userId;

    const order = await orderModel.findById(orderId);
    if (!order || order.status !== "Delivered") {
      return res.json({ success: false, message: "You can only review delivered orders" });
    }

    const existing = await reviewModel.findOne({ userId, orderId, foodId });
    if (existing) return res.json({ success: false, message: "Already reviewed this item" });

    const user = await userModel.findById(userId);
    const review = new reviewModel({ foodId, userId, userName: user.name, rating, comment, orderId });
    await review.save();

    const allReviews = await reviewModel.find({ foodId });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await foodModel.findByIdAndUpdate(foodId, { avgRating: avgRating.toFixed(1), totalRatings: allReviews.length });

    res.json({ success: true, message: "Review submitted" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const getFoodReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({ foodId: req.params.foodId }).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Get ALL reviews for admin panel and homepage section
const getAllReviews = async (req, res) => {
  try {
    const reviews = await reviewModel.find({}).sort({ createdAt: -1 });
    // Attach food name to each review
    const foodIds = [...new Set(reviews.map(r => r.foodId))];
    const foods = await foodModel.find({ _id: { $in: foodIds } }).select("name");
    const foodMap = {};
    foods.forEach(f => { foodMap[f._id.toString()] = f.name; });
    const enriched = reviews.map(r => ({ ...r._doc, foodName: foodMap[r.foodId] || "Unknown Item" }));
    res.json({ success: true, data: enriched });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

export { addReview, getFoodReviews, getAllReviews };
