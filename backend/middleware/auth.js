import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Please login." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: "Invalid token. Please login again." });
  }
};

// Same as authMiddleware but additionally requires the token to belong to an
// admin account. Any admin account (there can be many) passes; regular user
// tokens and missing/invalid tokens are rejected. Use this on every
// admin-only route (add/edit/remove food, manage orders, manage coupons).
export const adminAuth = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized. Please login as admin." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.json({ success: false, message: "Access denied. Admins only." });
    }
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: "Invalid token. Please login again." });
  }
};

export default authMiddleware;
