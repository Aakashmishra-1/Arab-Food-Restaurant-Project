import userModel from "../models/userModel.js";

const addToCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    const cartData = userData.cartData || {};
    const key = req.body.itemId + (req.body.variant ? `_${req.body.variant}` : "");
    cartData[key] = (cartData[key] || 0) + 1;
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added to cart" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    const cartData = userData.cartData || {};
    const key = req.body.itemId + (req.body.variant ? `_${req.body.variant}` : "");
    if (cartData[key] > 0) cartData[key] -= 1;
    await userModel.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed from cart" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const getCart = async (req, res) => {
  try {
    const userData = await userModel.findById(req.body.userId);
    res.json({ success: true, cartData: userData.cartData });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

export { addToCart, removeFromCart, getCart };
