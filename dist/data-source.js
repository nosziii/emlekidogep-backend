"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const user_1 = require("./models/user");
const memory_1 = require("./models/memory");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "emlekidogep",
    synchronize: true,
    logging: false,
    entities: [user_1.User, memory_1.Memory],
    migrations: [],
    subscribers: [],
});
