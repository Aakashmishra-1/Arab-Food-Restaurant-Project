import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  size: { type: String, required: true }, // Small, Medium, Large
  price: { type: Number, required: true },
});

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  variants: { type: [variantSchema], default: [] },
  inStock: { type: Boolean, default: true },
  inTodaysMenu: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);
export default foodModel;
