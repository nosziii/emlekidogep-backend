import * as dotenv from "dotenv";
dotenv.config();
import "reflect-metadata";
import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { AppDataSource } from "./data-source"; // Importáld az adatbázis forrást
import reminderRoutes from "./routes/reminders";

// Importáljuk a `node-schedule` csomagot az emlékeztetők ellenőrzéséhez
import schedule from "node-schedule";
import { checkReminders } from "./services/reminderService";

import userRoutes from "./routes/users";
import memoryRoutes from "./routes/memories";
import chatRoutes from "./routes/chat";

const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json());
// Regisztráljuk a routes-t a `users.ts`-ből
// app.use((req, res, next) => {
//   console.log(`Received request: ${req.method} ${req.url}`);
//   next();
// });

const PORT = process.env.PORT || 3000;

userRoutes(app);
memoryRoutes(app);
app.use("/api/chat", chatRoutes);
app.use("/api/reminders", reminderRoutes);

// Adatbázis kapcsolat inicializálása
AppDataSource.initialize()
  .then(() => {
    console.log("Adatbázis kapcsolódva");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.error("Adatbázis kapcsolat hiba:", error));

// Ütemezés napi futtatáshoz
schedule.scheduleJob("0 8 * * *", () => {
  console.log("Emlékeztetők ellenőrzése...");
  checkReminders();
});
