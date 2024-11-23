"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const memory_1 = require("../models/memory");
const user_1 = require("../models/user");
const validateId_1 = require("../utils/validateId");
const router = (0, express_1.Router)();
// Új emlék hozzáadása
router.post("/", async (req, res) => {
    const { title, description, reminderDate, userId } = req.body;
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    const userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
    try {
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: "Felhasználó nem található" });
            return;
        }
        const newMemory = memoryRepository.create({
            title,
            description,
            reminderDate,
            user,
        });
        const savedMemory = await memoryRepository.save(newMemory);
        res.status(201).json(savedMemory);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Hiba történt az emlék hozzáadása során", error });
    }
});
// Emlékek listázása
router.get("/", async (req, res) => {
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    try {
        const memories = await memoryRepository.find({ relations: ["user"] });
        res.json(memories);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Hiba történt az emlékek listázása során", error });
    }
});
// Emlékek szűrése dátumtartomány alapján
router.get("/filter", async (req, res) => {
    const { startDate, endDate } = req.query; // Dátumtartomány lekérése
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    if (!startDate || !endDate) {
        res
            .status(400)
            .json({ message: "A kezdő és záró dátum megadása kötelező" });
        return;
    }
    try {
        const memories = await memoryRepository
            .createQueryBuilder("memory")
            .where("memory.reminderDate BETWEEN :startDate AND :endDate", {
            startDate,
            endDate,
        })
            .getMany();
        res.status(200).json(memories);
    }
    catch (error) {
        res.status(500).json({ message: "Hiba történt a szűrés során", error });
    }
});
// Emlékek keresése kulcsszó alapján
router.get("/search", async (req, res) => {
    const { query } = req.query; // Keresési kulcsszó
    if (!query || typeof query !== "string" || query.trim() === "") {
        res.status(400).json({ message: "Keresési kulcsszó megadása kötelező" });
        return;
    }
    try {
        const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
        const memories = await memoryRepository
            .createQueryBuilder("memory")
            .where("memory.title LIKE :query OR memory.description LIKE :query", {
            query: `%${query}%`,
        })
            .getMany();
        res
            .status(200)
            .json(memories.length > 0
            ? memories
            : { message: "Nincs találat", memories: [] });
    }
    catch (error) {
        res.status(500).json({ message: "Hiba történt a keresés során", error });
    }
});
// Emlék részleteinek lekérdezése
router.get("/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    const memoryId = (0, validateId_1.validateId)(id, res);
    if (memoryId === null)
        return;
    try {
        const memory = await memoryRepository.findOne({
            where: { id: memoryId },
            relations: ["user"],
        });
        if (!memory) {
            res.status(404).json({ message: "Emlék nem található" });
            return;
        }
        res.json(memory);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Hiba történt az emlék lekérdezése során", error });
    }
});
// Emlék szerkesztése
router.put("/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const { title, description, reminderDate } = req.body;
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    const memoryId = (0, validateId_1.validateId)(id, res);
    if (memoryId === null)
        return;
    try {
        const memory = await memoryRepository.findOne({
            where: { id: memoryId },
        });
        if (!memory) {
            res.status(404).json({ message: "Emlék nem található" });
            return;
        }
        memory.title = title;
        memory.description = description;
        memory.reminderDate = reminderDate;
        const updatedMemory = await memoryRepository.save(memory);
        res.json(updatedMemory);
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Hiba történt az emlék szerkesztése során", error });
    }
});
// Emlék törlése
router.get("/:id(\\d+)", async (req, res) => {
    const { id } = req.params;
    const memoryId = (0, validateId_1.validateId)(id, res);
    if (memoryId === null)
        return;
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    try {
        const memory = await memoryRepository.findOne({
            where: { id: memoryId },
        });
        if (!memory) {
            res.status(404).json({ message: "Emlék nem található" });
            return;
        }
        await memoryRepository.remove(memory);
        res.status(204).send();
    }
    catch (error) {
        res
            .status(400)
            .json({ message: "Hiba történt az emlék törlése során", error });
    }
});
exports.default = (app) => {
    app.use("/api/memories", router);
};
