import { Router } from "express";
import { Task, Category } from "../models/index.js";
import { auth } from "../middleware/auth.js";
import { requireFields, isValidStatus } from "../validators/index.js";
import { Op } from "sequelize";

const router = Router();

router.get("/", auth, async (req, res) => {
  try {
    const { status, category_id, search, page = "1", limit = "10" } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = { user_id: req.user.id };

    if (status && isValidStatus(status)) {
      where.status = status;
    }

    if (category_id) {
      where.category_id = parseInt(category_id, 10);
    }

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Task.findAndCountAll({
      where,
      include: [{ model: Category, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit: limitNum,
      offset,
    });

    res.json({
      data: rows,
      total: count,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(count / limitNum),
    });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
      include: [{ model: Category, attributes: ["id", "name"] }],
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    console.error("Get task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const { title, description, status, due_date, category_id } = req.body;

    const missing = requireFields(req.body, ["title"]);
    if (missing) return res.status(400).json({ message: missing });

    if (status && !isValidStatus(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) return res.status(400).json({ message: "Category not found" });
    }

    const task = await Task.create({
      title,
      description: description || null,
      status: status || "pending",
      due_date: due_date || null,
      category_id: category_id || null,
      user_id: req.user.id,
    });

    const created = await Task.findByPk(task.id, {
      include: [{ model: Category, attributes: ["id", "name"] }],
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    const { title, description, status, due_date, category_id } = req.body;

    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (status && !isValidStatus(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    if (category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) return res.status(400).json({ message: "Category not found" });
    }

    await task.update({
      title: title !== undefined ? title : task.title,
      description: description !== undefined ? description : task.description,
      status: status !== undefined ? status : task.status,
      due_date: due_date !== undefined ? due_date : task.due_date,
      category_id: category_id !== undefined ? category_id : task.category_id,
    });

    const updated = await Task.findByPk(task.id, {
      include: [{ model: Category, attributes: ["id", "name"] }],
    });

    res.json(updated);
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOne({
      where: { id: req.params.id, user_id: req.user.id },
    });

    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.destroy();
    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;