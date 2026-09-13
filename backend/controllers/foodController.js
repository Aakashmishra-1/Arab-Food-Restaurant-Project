import foodModel from "../models/foodModel.js";
import fs from "fs";

// All food items (admin use)
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Public, unauthenticated "all items" list — used by the customer-facing
// site to build category sections / the "All" tab. This must NOT require
// admin auth (unlike listFood above), otherwise the customer app can never
// load it and every section stays hidden.
const listAllFoodPublic = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

// Customer-facing list:
//  - If admin has set a custom Today's Menu (any item with inTodaysMenu:true),
//    return ONLY those items (regardless of inStock — frontend shows OOS badge).
//  - If no custom menu set, return ALL items.
const listFoodForCustomer = async (req, res) => {
  try {
    const menuActive = await foodModel.exists({ inTodaysMenu: true });
    let foods;
    if (menuActive) {
      // Return all today's menu items — do NOT filter by inStock here so that
      // Rice Combo (or any item) isn't silently dropped when stock flag is off.
      // The frontend FoodItem component already shows an "Out of Stock" overlay.
      foods = await foodModel.find({ inTodaysMenu: true });
    } else {
      foods = await foodModel.find({});
    }
    res.json({ success: true, data: foods });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const parseVariants = (raw) => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return parsed
      .filter(v => v.size && v.price !== '' && v.price !== null && v.price !== undefined && !isNaN(Number(v.price)))
      .map(v => ({ size: v.size, price: Number(v.price) }));
  } catch {
    return [];
  }
};

const addFood = async (req, res) => {
  try {
    if (!req.file) return res.json({ success: false, message: "Image is required" });
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      image: req.file.filename,
      variants: parseVariants(req.body.variants),
    });
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.error("addFood error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      variants: parseVariants(req.body.variants),
    };
    if (req.file) {
      const oldFood = await foodModel.findById(req.body.id);
      if (oldFood?.image) fs.unlink(`uploads/${oldFood.image}`, () => {});
      updateData.image = req.file.filename;
    }
    await foodModel.findByIdAndUpdate(req.body.id, updateData);
    res.json({ success: true, message: "Food Updated" });
  } catch (error) {
    console.error("updateFood error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (food?.image) fs.unlink(`uploads/${food.image}`, () => {});
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const toggleStock = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    await foodModel.findByIdAndUpdate(req.body.id, { inStock: !food.inStock });
    res.json({ success: true, message: "Stock updated" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const setTodaysMenu = async (req, res) => {
  try {
    const { selectedIds } = req.body;
    // Reset all
    await foodModel.updateMany({}, { inTodaysMenu: false });
    // Mark selected
    if (selectedIds && selectedIds.length > 0) {
      await foodModel.updateMany({ _id: { $in: selectedIds } }, { inTodaysMenu: true });
    }
    res.json({ success: true, message: "Today's menu updated" });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

const getTodaysMenu = async (req, res) => {
  try {
    const foods = await foodModel.find({ inTodaysMenu: true }).select("_id");
    res.json({ success: true, data: foods.map(f => f._id.toString()) });
  } catch (error) {
    res.json({ success: false, message: "Server error" });
  }
};

export { listFood, listAllFoodPublic, listFoodForCustomer, addFood, updateFood, removeFood, toggleStock, setTodaysMenu, getTodaysMenu };
