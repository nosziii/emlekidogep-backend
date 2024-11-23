import { Router, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Memory } from "../models/memory";
import { MoreThanOrEqual } from "typeorm";

const router = Router();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  const memoryRepository = AppDataSource.getRepository(Memory);

  try {
    const today = new Date();
    const upcomingReminders = await memoryRepository.find({
      where: {
        reminderDate: MoreThanOrEqual(today),
      },
      relations: ["user"],
    });

    res.json(upcomingReminders);
  } catch (error) {
    res.status(500).json({
      message: "Hiba történt az emlékeztetők lekérdezése során",
      error,
    });
  }
});

export default router;
