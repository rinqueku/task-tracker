import { Router } from "express";
import { Category } from "../models/index.js";
import { auth } from "../middleware/auth.js";
import { requireFields } from "../validators/index.js";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["name", "ASC"]],
    });
    res.json(categories);
  } catch (err) {
    console.error("Get categories error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const missing = requireFields(req.body, ["name"]);
    if (missing) return res.status(400).json({ message: missing });

    const existing = await Category.findOne({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;