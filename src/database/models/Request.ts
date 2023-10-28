import {
  Association,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize";

import { sequelize } from "..";

export enum RequestStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export class Request extends Model<
  InferAttributes<Request, { omit: "metas" }>,
  InferCreationAttributes<Request, { omit: "metas" }>
> {
  declare id: CreationOptional<number>;
  declare member: string;
  declare name: string;
  declare email: string;
  declare curriculum: string;
  declare extra: string | null;
  declare status: RequestStatus;
  declare statusText: string;

  declare getMetas: HasManyGetAssociationsMixin<RequestMetaData>;
  declare createMeta: HasManyCreateAssociationMixin<
    RequestMetaData,
    "requestId"
  >;

  declare metas?: NonAttribute<RequestMetaData[]>;

  getMeta(key: string): NonAttribute<string> {
    if (!this.metas) return "";

    const meta = this.metas.find((meta) => meta.key === key);

    return meta?.value || "";
  }

  declare static associations: {
    metas: Association<Request, RequestMetaData>;
  };
}

export class RequestMetaData extends Model<
  InferAttributes<RequestMetaData>,
  InferCreationAttributes<RequestMetaData>
> {
  declare key: string;
  declare value: string;

  declare requestId: ForeignKey<Request["id"]>;
}

Request.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    member: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    curriculum: {
      type: DataTypes.STRING,
    },
    extra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM({
        values: ["pending", "in_progress", "completed"],
      }),
      defaultValue: "pending",
    },
    statusText: {
      type: DataTypes.TEXT,
    },
  },
  {
    sequelize,
  },
);

RequestMetaData.init(
  {
    key: { type: DataTypes.TEXT },
    value: { type: DataTypes.TEXT },
  },
  {
    sequelize,
  },
);

Request.hasMany(RequestMetaData, {
  sourceKey: "id",
  foreignKey: "requestId",
  as: "metas",
});
