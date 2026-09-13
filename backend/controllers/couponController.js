import couponModel from "../models/couponModel.js";

const createCoupon = async (req, res) => {
  try {
    const coupon = new couponModel(req.body);
    await coupon.save();
    res.json({ success: true, message: "Coupon created" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    await couponModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await couponModel.findById(req.body.id);
    await couponModel.findByIdAndUpdate(req.body.id, { isActive: !coupon.isActive });
    res.json({ success: true, message: "Coupon toggled" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const validateCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;
    const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.json({ success: false, message: "Invalid or expired coupon" });
    if (coupon.usedCount >= coupon.maxUses) return res.json({ success: false, message: "Coupon usage limit reached" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.json({ success: false, message: "Coupon expired" });
    if (amount < coupon.minOrderAmount) return res.json({ success: false, message: `Min order ₹${coupon.minOrderAmount} required` });

    const discount = coupon.discountType === "percent"
      ? Math.round((amount * coupon.discountValue) / 100)
      : coupon.discountValue;

    res.json({ success: true, discount, discountType: coupon.discountType, discountValue: coupon.discountValue, message: `Coupon applied! You save ₹${discount}` });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

export { createCoupon, listCoupons, deleteCoupon, toggleCoupon, validateCoupon };
