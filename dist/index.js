"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const data_source_1 = require("./data-source"); // Importáld az adatbázis forrást
const reminders_1 = __importDefault(require("./routes/reminders"));
// Importáljuk a `node-schedule` csomagot az emlékeztetők ellenőrzéséhez
const node_schedule_1 = __importDefault(require("node-schedule"));
const reminderService_1 = require("./services/reminderService");
const users_1 = __importDefault(require("./routes/users"));
const memories_1 = __importDefault(require("./routes/memories"));
const chat_1 = __importDefault(require("./routes/chat"));
const app = (0, express_1.default)();
console.log("Environment variables:", process.env.CHAT_API_URL, process.env.CHAT_MODEL_NAME);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
// Regisztráljuk a routes-t a `users.ts`-ből
// app.use((req, res, next) => {
//   console.log(`Received request: ${req.method} ${req.url}`);
//   next();
// });
const PORT = process.env.PORT || 3000;
(0, users_1.default)(app);
(0, memories_1.default)(app);
app.use("/api/chat", chat_1.default);
app.use("/api/reminders", reminders_1.default);
// Adatbázis kapcsolat inicializálása
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Adatbázis kapcsolódva");
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})
    .catch((error) => console.error("Adatbázis kapcsolat hiba:", error));
// Ütemezés napi futtatáshoz
node_schedule_1.default.scheduleJob("0 8 * * *", () => {
    console.log("Emlékeztetők ellenőrzése...");
    (0, reminderService_1.checkReminders)();
});
