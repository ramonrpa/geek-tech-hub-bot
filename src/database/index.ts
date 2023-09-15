import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "database.sqlite",
});

import "./models/Request";
import "./models/Setting";
