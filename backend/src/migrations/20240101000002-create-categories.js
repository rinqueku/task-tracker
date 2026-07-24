import { DataTypes } from "sequelize";

export default {
  async up(sequelize) {
    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    if (tables.includes("Categories")) return;
    await qi.createTable("Categories", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    });
  },
  async down(sequelize) {
    await sequelize.getQueryInterface().dropTable("Categories");
  },
};