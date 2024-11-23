import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./models/user";
import { Memory } from "./models/memory";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "",
  database: "emlekidogep",
  synchronize: true,
  logging: false,
  entities: [User, Memory],
  migrations: [],
  subscribers: [],
});
