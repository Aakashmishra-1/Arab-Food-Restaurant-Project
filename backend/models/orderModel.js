import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, enum: ["Food Processing","Preparing","Out for Delivery","Delivered"], default: "Food Processing" },
  paymentMethod: { type: String, enum: ["cod","razorpay"], default: "cod" },
  payment: { type: Boolean, default: false },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },
  couponCode: { type: String, default: "" },
  discount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 50 },
  estimatedDelivery: { type: String, default: "30-45 mins" },
  date: { type: Date, default: Date.now },
});

const orderModel = mongoose.models.order || mongoose.model("order", orderSchema);
export default orderModel;
