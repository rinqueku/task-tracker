import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.MYSQL_DATABASE || process.env.DB_NAME;
const dbUser = process.env.MYSQL_USER || process.env.DB_USER;
const dbPassword = process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD;
const dbHost = process.env.MYSQL_HOST || process.env.DB_HOST || "localhost";
const dbPort = parseInt(process.env.MYSQL_PORT || process.env.DB_PORT, 10) || 3306;

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