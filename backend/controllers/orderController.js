import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import couponModel from "../models/couponModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Lazy initialize Razorpay so dotenv loads first
const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const DELIVERY_CHARGE = 50;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ─── Email helper ────────────────────────────────────────────
const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;
    const t = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await t.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
  } catch (e) { console.error("Email error:", e.message); }
};

const orderConfirmHtml = (order, userName) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
  <h2 style="color:#FF6B35">🎉 Order Confirmed — Arab Food Punjab</h2>
  <p>Hi <b>${userName}</b>, your order has been placed!</p>
  <table width="100%" cellpadding="8" style="border-collapse:collapse;margin:16px 0">
    <tr style="background:#FFF5F0"><th align="left">Item</th><th>Qty</th><th align="right">Price</th></tr>
    ${order.items.map(i => `<tr><td>${i.name}${i.selectedVariant ? ` (${i.selectedVariant})` : ''}</td><td align="center">${i.quantity}</td><td align="right">₹${i.price * i.quantity}</td></tr>`).join("")}
  </table>
  <hr/>
  <p><b>Delivery:</b> ₹${order.deliveryCharge}</p>
  ${order.discount > 0 ? `<p><b>Discount:</b> −₹${order.discount}</p>` : ""}
  <p style="font-size:1.1rem"><b>Total: ₹${order.amount}</b></p>
  <p><b>Payment:</b> ${order.paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</p>
  <p><b>Estimated Delivery:</b> ${order.estimatedDelivery}</p>
  <p style="color:#aaa;font-size:12px;margin-top:20px">Thank you for ordering from Arab Food Punjab 🌿</p>
</div>`;

// ─── Shared order builder ────────────────────────────────────
const buildOrder = (req, extra = {}) => {
  const { items, amount, address, couponCode, discount = 0 } = req.body;
  const finalAmount = amount + DELIVERY_CHARGE - discount;
  return {
    userId: req.body.userId,
    items,
    amount: finalAmount,
    address,
    couponCode: couponCode || "",
    discount,
    deliveryCharge: DELIVERY_CHARGE,
    estimatedDelivery: "30-45 mins",
    ...extra,
  };
};

// ─── Apply coupon helper ─────────────────────────────────────
const applyCoupon = async (code, amount) => {
  if (!code) return 0;
  const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon || coupon.usedCount >= coupon.maxUses) return 0;
  if (coupon.expiresAt && new Date() > coupon.expiresAt) return 0;
  const discount = coupon.discountType === "percent"
    ? Math.round((amount * coupon.discountValue) / 100)
    : coupon.discountValue;
  await couponModel.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
  return discount;
};

// ─── Place COD ───────────────────────────────────────────────
const placeOrderCod = async (req, res) => {
  try {
    const discount = await applyCoupon(req.body.couponCode, req.body.amount);
    const newOrder = new orderModel(buildOrder(req, { payment: true, paymentMethod: "cod", discount }));
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });
    const user = await userModel.findById(req.body.userId);
    if (user?.email) await sendEmail(user.email, "Order Confirmed — Arab Food Punjab", orderConfirmHtml(newOrder, user.name));
    res.json({ success: true, message: "Order placed successfully!" });
  } catch (e) { console.error(e); res.json({ success: false, message: "Server error" }); }
};

// ─── Place Razorpay ──────────────────────────────────────────
const placeOrderRazorpay = async (req, res) => {
  try {
    const discount = await applyCoupon(req.body.couponCode, req.body.amount);
    const finalAmount = req.body.amount + DELIVERY_CHARGE - discount;
    const rzpOrder = await getRazorpay().orders.create({ amount: finalAmount * 100, currency: "INR", receipt: `rcpt_${Date.now()}` });
    const newOrder = new orderModel(buildOrder(req, { payment: false, paymentMethod: "razorpay", discount, razorpayOrderId: rzpOrder.id }));
    await newOrder.save();
    res.json({ success: true, razorpayOrderId: rzpOrder.id, amount: finalAmount * 100, currency: "INR", orderId: newOrder._id });
  } catch (e) { console.error(e); res.json({ success: false, message: "Server error" }); }
};

// ─── Verify Razorpay ─────────────────────────────────────────
const verifyRazorpay = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  try {
    const sign = razorpayOrderId + "|" + razorpayPaymentId;
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(sign).digest("hex");
    if (expected !== razorpaySignature) {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Payment verification failed" });
    }
    const order = await orderModel.findByIdAndUpdate(orderId, { payment: true, razorpayPaymentId }, { new: true });
    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
    const user = await userModel.findById(order.userId);
    if (user?.email) await sendEmail(user.email, "Order Confirmed — Arab Food Punjab", orderConfirmHtml(order, user.name));
    res.json({ success: true, message: "Payment verified" });
  } catch (e) { console.error(e); res.json({ success: false, message: "Server error" }); }
};

// ─── List all orders (admin) ─────────────────────────────────
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (e) { res.json({ success: false, message: "Server error" }); }
};

// ─── User orders ─────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
    res.json({ success: true, data: orders });
  } catch (e) { res.json({ success: false, message: "Server error" }); }
};

// ─── Update status + notify ──────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const order = await orderModel.findByIdAndUpdate(req.body.orderId, { status: req.body.status }, { new: true });
    const user = await userModel.findById(order.userId);
    if (user?.email) {
      await sendEmail(user.email, `Order ${req.body.status} — Arab Food Punjab`,
        `<div style="font-family:Arial,sans-serif;padding:24px"><h2 style="color:#FF6B35">Order Update</h2>
         <p>Hi <b>${user.name}</b>, your order is now: <b>${req.body.status}</b></p>
         <p>Est. delivery: ${order.estimatedDelivery}</p></div>`);
    }
    res.json({ success: true, message: "Status updated" });
  } catch (e) { res.json({ success: false, message: "Server error" }); }
};

// ─── Delete one / all ─────────────────────────────────────────
const removeOrder = async (req, res) => {
  try { await orderModel.findByIdAndDelete(req.body.orderId); res.json({ success: true }); }
  catch (e) { res.json({ success: false, message: "Server error" }); }
};

const deleteAllOrders = async (req, res) => {
  try { await orderModel.deleteMany({}); res.json({ success: true, message: "All orders deleted" }); }
  catch (e) { res.json({ success: false, message: "Server error" }); }
};

// ─── Dashboard stats ─────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const deliveredOrders = await orderModel.countDocuments({ status: "Delivered" });
    const revenueData = await orderModel.aggregate([{ $match: { payment: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    const totalRevenue = revenueData[0]?.total || 0;
    const topItems = await orderModel.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } }, { $limit: 5 }
    ]);
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0,0,0,0));
      const end = new Date(d.setHours(23,59,59,999));
      const rev = await orderModel.aggregate([{ $match: { date: { $gte: start, $lte: end }, payment: true } }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
      last7Days.push({ date: start.toLocaleDateString("en-IN", { weekday: "short" }), revenue: rev[0]?.total || 0 });
    }
    const todayStart = new Date(); todayStart.setHours(0,0,0,0);
    const todayOrders = await orderModel.countDocuments({ date: { $gte: todayStart } });
    res.json({ success: true, totalOrders, deliveredOrders, totalRevenue, topItems, last7Days, todayOrders });
  } catch (e) { console.error(e); res.json({ success: false, message: "Server error" }); }
};

export { placeOrderCod, placeOrderRazorpay, verifyRazorpay, listOrders, userOrders, updateStatus, removeOrder, deleteAllOrders, getDashboardStats };
