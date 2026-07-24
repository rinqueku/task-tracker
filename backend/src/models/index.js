import User from "./User.js";
import Category from "./Category.js";
import Task from "./Task.js";

Category.hasMany(Task, { foreignKey: "category_id" });
Task.belongsTo(Category, { foreignKey: "category_id" });

User.hasMany(Task, { foreignKey: "user_id" });
Task.belongsTo(User, { foreignKey: "user_id" });

export { User, Category, Task };