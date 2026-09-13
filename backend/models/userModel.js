import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  firstName: String,
  lastName: String,
  street: String,
  city: String,
  state: String,
  pincode: String,
  landmark: String,
  phone: String,
});

const claimedCouponSchema = new mongoose.Schema({
  code: String,
  discountType: String,
  discountValue: Number,
  minOrderAmount: Number,
  expiresAt: Date,
  claimedAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cartData: { type: Object, default: {} },
    wishlist: { type: [String], default: [] },
    savedAddresses: { type: [addressSchema], default: [] },
    loyaltyPoints: { type: Number, default: 0 },
    claimedCoupons: { type: [claimedCouponSchema], default: [] },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;
