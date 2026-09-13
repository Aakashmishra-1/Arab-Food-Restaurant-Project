import { createContext, useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const url = API_BASE_URL;
  const currency = "₹";
  const deliveryCharge = 50;

  // food_list   = Today's Menu only  (from /api/food/customer-list)
  // allFoodList = Every item ever    (from /api/food/list — no filter)
  const [food_list, setFoodList] = useState([]);
  const [allFoodList, setAllFoodList] = useState([]);

  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // For detecting admin-triggered status changes → user notification
  const prevOrderStatuses = useRef({});
  const orderPollRef = useRef(null);

  // ── Cart ──────────────────────────────────────────────────────────
  const addToCart = async (itemId, variant = "") => {
    const key = variant ? `${itemId}_${variant}` : itemId;
    setCartItems((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    if (token) {
      await axios.post(url + "/api/cart/add", { itemId, variant }, { headers: { token } });
    }
  };

  const removeFromCart = async (itemId, variant = "") => {
    const key = variant ? `${itemId}_${variant}` : itemId;
    setCartItems((prev) => ({ ...prev, [key]: Math.max(0, (prev[key] || 1) - 1) }));
    if (token) {
      await axios.post(url + "/api/cart/remove", { itemId, variant }, { headers: { token } });
    }
  };

  const getTotalCartAmount = () => {
    let total = 0;
    // Search in both lists so cart works regardless of view mode
    const combined = [...food_list, ...allFoodList];
    for (const key in cartItems) {
      if (cartItems[key] > 0) {
        const itemId = key.includes("_") ? key.split("_")[0] : key;
        const variant = key.includes("_") ? key.split("_")[1] : "";
        const item = combined.find((p) => p._id === itemId);
        if (!item) continue;
        if (variant && item.variants?.length > 0) {
          const v = item.variants.find((v) => v.size === variant);
          total += (v ? v.price : item.price) * cartItems[key];
        } else {
          total += item.price * cartItems[key];
        }
      }
    }
    return total;
  };

  const getCartCount = () => Object.values(cartItems).reduce((a, b) => a + b, 0);

  // ── Food fetching ─────────────────────────────────────────────────
  const fetchFoodList = async () => {
    try {
      const res = await axios.get(url + "/api/food/customer-list");
      if (res.data.success) setFoodList(res.data.data);
    } catch (err) {
      console.error("customer-list error:", err);
    }
  };

  const fetchAllFoodList = async () => {
    try {
      // NOTE: "/api/food/list" is admin-only (protected by adminAuth), so it
      // always failed here for regular customers and left allFoodList empty
      // — which hid every category section on the customer site. Use the
      // public "/api/food/all-list" route instead.
      const res = await axios.get(url + "/api/food/all-list");
      if (res.data.success) setAllFoodList(res.data.data);
    } catch (err) {
      console.error("food/all-list error:", err);
    }
  };

  const loadCartData = async (tkn) => {
    try {
      const res = await axios.post(url + "/api/cart/get", {}, { headers: { token: tkn } });
      if (res.data.success) setCartItems(res.data.cartData || {});
    } catch {}
  };

  const fetchWishlist = async (tkn) => {
    try {
      const res = await axios.post(url + "/api/user/wishlist/get", {}, { headers: { token: tkn } });
      if (res.data.success) setWishlist(res.data.wishlist || []);
    } catch {}
  };

  const toggleWishlist = async (foodId) => {
    if (!token) return;
    try {
      const res = await axios.post(url + "/api/user/wishlist/toggle", { foodId }, { headers: { token } });
      if (res.data.success) {
        setWishlist((prev) =>
          res.data.wishlisted ? [...prev, foodId] : prev.filter((id) => id !== foodId)
        );
      }
    } catch {}
  };

  const fetchProfile = async (tkn) => {
    try {
      const res = await axios.get(url + "/api/user/profile", { headers: { token: tkn } });
      if (res.data.success) setUserProfile(res.data.user);
    } catch {}
  };

  // ── Order status polling → user toast notifications ───────────────
  const pollOrderStatus = useCallback(async (tkn) => {
    if (!tkn) return;
    try {
      const res = await axios.post(url + "/api/order/userorders", {}, { headers: { token: tkn } });
      if (!res.data.success) return;
      const STATUS_ICONS = {
        "Food Processing": "🍳",
        "Preparing": "👨‍🍳",
        "Out for Delivery": "🚴",
        "Delivered": "✅",
      };
      res.data.data.forEach((order) => {
        const prev = prevOrderStatuses.current[order._id];
        if (prev && prev !== order.status) {
          const icon = STATUS_ICONS[order.status] || "📦";
          const names = order.items.map((i) => i.name).join(", ");
          toast.info(`${icon} Order Update: "${names}" is now ${order.status}`, {
            autoClose: 7000,
            position: "top-right",
          });
        }
        prevOrderStatuses.current[order._id] = order.status;
      });
    } catch {}
  }, [url]);

  // Seed statuses silently on login, then poll every 10 s
  useEffect(() => {
    if (orderPollRef.current) clearInterval(orderPollRef.current);
    if (!token) return;
    axios
      .post(url + "/api/order/userorders", {}, { headers: { token } })
      .then((res) => {
        if (res.data.success)
          res.data.data.forEach((o) => { prevOrderStatuses.current[o._id] = o.status; });
      })
      .catch(() => {});
    orderPollRef.current = setInterval(() => pollOrderStatus(token), 10000);
    return () => clearInterval(orderPollRef.current);
  }, [token, pollOrderStatus]);

  // ── Init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchFoodList(), fetchAllFoodList()]);
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        await loadCartData(savedToken);
        await fetchWishlist(savedToken);
        await fetchProfile(savedToken);
      }
    };
    init();
  }, []);

  const contextValue = {
    url, currency, deliveryCharge,
    food_list, setFoodList, fetchFoodList,
    allFoodList, fetchAllFoodList,
    cartItems, setCartItems, addToCart, removeFromCart,
    getTotalCartAmount, getCartCount,
    token, setToken,
    searchQuery, setSearchQuery,
    wishlist, toggleWishlist, fetchWishlist,
    userProfile, setUserProfile, fetchProfile,
    loadCartData,
  };

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export default StoreContextProvider;
