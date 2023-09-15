import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "..";

export class Setting extends Model<
  InferAttributes<Setting>,
  InferCreationAttributes<Setting>
> {
  declare name: string;
  declare value: string;
}

Setting.init(
  {
    name: {
      type: DataTypes.TEXT,
      unique: true,
      primaryKey: true,
    },
    value: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
  },
);
