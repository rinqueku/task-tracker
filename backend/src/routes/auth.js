import { randomBytes } from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { auth } from "../middleware/auth.js";
import { requireFields, isValidEmail } from "../validators/index.js";

const router = Router();

const loginAttempts = new Map();

function loginRateLimiter(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];
  const recent = attempts.filter((t) => now - t < 15 * 60 * 1000);
  if (recent.length >= 10) {
    return res.status(429).json({ message: "Too many login attempts. Try again later." });
  }
  recent.push(now);
  loginAttempts.set(ip, recent);
  next();
}

const resetTokens = new Map();
const RESET_TTL = 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of resetTokens) {
    if (now > entry.expiresAt) resetTokens.delete(token);
  }
}, RESET_TTL);

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const missing = requireFields(req.body, ["name", "email", "password"]);
    if (missing) return res.status(400).json({ message: missing });

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );

    res.status(201).json({
      message: "Account created",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", loginRateLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    const missing = requireFields(req.body, ["email", "password"]);
    if (missing) return res.status(400).json({ message: missing });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
    );

    res.json({
      message: "Signed in",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const token = randomBytes(32).toString("hex");
    resetTokens.set(token, { email, expiresAt: Date.now() + RESET_TTL });

    console.log(`[Password Reset] Token for ${email}: ${token}`);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const entry = resetTokens.get(token);
    if (!entry || Date.now() > entry.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await User.update({ password: hashed }, { where: { email: entry.email } });
    resetTokens.delete(token);

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;