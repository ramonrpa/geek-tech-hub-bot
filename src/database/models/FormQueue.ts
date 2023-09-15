import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";

import { sequelize } from "..";

export class FormQueue extends Model<
  InferAttributes<FormQueue>,
  InferCreationAttributes<FormQueue>
> {
  declare id: CreationOptional<number>;
  declare member: string;
}

FormQueue.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    member: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
  },
);
