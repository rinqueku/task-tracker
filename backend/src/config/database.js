import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbHost = process.env.MYSQL_HOST || process.env.MYSQLHOST || process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.MYSQL_PORT || process.env.MYSQLPORT || process.env.DB_PORT, 10) || 3306;
const dbUser = process.env.MYSQL_USER || process.env.MYSQLUSER || process.env.DB_USER || "root";
const dbPassword = process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "";
const dbName = process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || process.env.DB_NAME || "task_tracker";

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false,
  define: {
    freezeTableName: true,
    underscored: false,
  },
});

export default sequelize;