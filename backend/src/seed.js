import "dotenv/config";
import bcrypt from "bcryptjs";
import { Umzug, SequelizeStorage } from "umzug";
import sequelize from "./config/database.js";
import { User, Category, Task } from "./models/index.js";

const umzug = new Umzug({
  migrations: { glob: "src/migrations/*.js" },
  context: sequelize,
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

async function seed() {
  try {
    await umzug.up();
    console.log("Migrations complete");

    const existing = await User.findOne({ where: { email: "test@example.com" } });
    if (existing) {
      console.log("Seed data already exists, skipping");
      process.exit(0);
    }

    const hashed = await bcrypt.hash("password123", 10);
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: hashed,
    });

    const categories = await Category.bulkCreate([
      { name: "Work" },
      { name: "Personal" },
      { name: "Shopping" },
    ]);

    const tasks = [];
    const statuses = ["pending", "in_progress", "completed"];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const due = new Date(now);
      due.setDate(due.getDate() + Math.floor(Math.random() * 30) - 10);
      tasks.push({
        title: `Task ${i + 1}`,
        description: `Description for task ${i + 1}`,
        status: statuses[i % 3],
        due_date: due.toISOString().slice(0, 10),
        category_id: categories[i % 3].id,
        user_id: user.id,
      });
    }
    await Task.bulkCreate(tasks);

    console.log("Seed complete — test account: test@example.com / password123");
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  }
}

seed();