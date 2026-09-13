import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import couponModel from "../models/couponModel.js";

const createToken = (id, role) => jwt.sign({ id, role }, process.env.JWT_SECRET);

// Register
const registerUser = async (req, res) => {
  const { name, email, password, role, adminSetupKey } = req.body;
  try {
    // Creating an admin account requires the shared setup key (set in
    // backend .env / Render env vars as ADMIN_SETUP_KEY). This lets the
    // restaurant owner create as many admin accounts as they want, while
    // stopping random site visitors from granting themselves admin access.
    if (role === "admin") {
      if (!process.env.ADMIN_SETUP_KEY || adminSetupKey !== process.env.ADMIN_SETUP_KEY) {
        return res.json({ success: false, message: "Invalid admin setup key" });
      }
    }

    const exists = await userModel.findOne({ email });
    if (exists) return res.json({ success: false, message: "User already exists" });
    if (!validator.isEmail(email)) return res.json({ success: false, message: "Invalid email" });
    if (password.length < 8) return res.json({ success: false, message: "Password must be 8+ characters" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({ name, email, password: hashedPassword, role: role || "user" });
    const user = await newUser.save();
    const token = createToken(user._id, user.role);
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

// Login — role-separated: admin portal sends role:"admin", user portal sends no role
const loginUser = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (role === "admin") {
      // Admin portal login — must be admin
      if (user.role !== "admin") return res.json({ success: false, message: "Access denied. Not an admin account." });
    } else {
      // User portal login — admin accounts cannot login here
      if (user.role === "admin") return res.json({ success: false, message: "Admin accounts must use the admin portal." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

    const token = createToken(user._id, user.role);
    res.json({ success: true, token, role: user.role });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    if (!user) return res.json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { userId, name, phone } = req.body;
  try {
    await userModel.findByIdAndUpdate(userId, { name, phone });
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Add Address
const addAddress = async (req, res) => {
  const { userId, address } = req.body;
  try {
    await userModel.findByIdAndUpdate(userId, { $push: { savedAddresses: address } });
    res.json({ success: true, message: "Address saved" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Delete Address
const deleteAddress = async (req, res) => {
  const { userId, addressId } = req.body;
  try {
    await userModel.findByIdAndUpdate(userId, { $pull: { savedAddresses: { _id: addressId } } });
    res.json({ success: true, message: "Address removed" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Toggle Wishlist
const toggleWishlist = async (req, res) => {
  const { userId, foodId } = req.body;
  try {
    const user = await userModel.findById(userId);
    const isWishlisted = user.wishlist.includes(foodId);
    if (isWishlisted) {
      await userModel.findByIdAndUpdate(userId, { $pull: { wishlist: foodId } });
      res.json({ success: true, message: "Removed from wishlist", wishlisted: false });
    } else {
      await userModel.findByIdAndUpdate(userId, { $push: { wishlist: foodId } });
      res.json({ success: true, message: "Added to wishlist", wishlisted: true });
    }
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Get Wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("wishlist");
    res.json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Claim coupon — saves to user's claimedCoupons
const claimCoupon = async (req, res) => {
  const { userId, code } = req.body;
  try {
    const coupon = await couponModel.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.json({ success: false, message: "Invalid or inactive coupon" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.json({ success: false, message: "Coupon has expired" });
    if (coupon.usedCount >= coupon.maxUses) return res.json({ success: false, message: "Coupon usage limit reached" });

    const user = await userModel.findById(userId);
    const alreadyClaimed = user.claimedCoupons?.some(c => c.code === coupon.code);
    if (alreadyClaimed) return res.json({ success: false, message: "You have already claimed this coupon" });

    await userModel.findByIdAndUpdate(userId, {
      $push: {
        claimedCoupons: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount,
          expiresAt: coupon.expiresAt,
          claimedAt: new Date(),
        }
      }
    });
    res.json({ success: true, message: "Coupon claimed successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

// Get user's claimed coupons
const getClaimedCoupons = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("claimedCoupons");
    res.json({ success: true, coupons: user.claimedCoupons || [] });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

export { registerUser, loginUser, getProfile, updateProfile, addAddress, deleteAddress, toggleWishlist, getWishlist, claimCoupon, getClaimedCoupons };
