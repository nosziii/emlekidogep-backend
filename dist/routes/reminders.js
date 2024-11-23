"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_source_1 = require("../data-source");
const memory_1 = require("../models/memory");
const typeorm_1 = require("typeorm");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const memoryRepository = data_source_1.AppDataSource.getRepository(memory_1.Memory);
    try {
        const today = new Date();
        const upcomingReminders = await memoryRepository.find({
            where: {
                reminderDate: (0, typeorm_1.MoreThanOrEqual)(today),
            },
            relations: ["user"],
        });
        res.json(upcomingReminders);
    }
    catch (error) {
        res.status(500).json({
            message: "Hiba történt az emlékeztetők lekérdezése során",
            error,
        });
    }
});
exports.default = router;
