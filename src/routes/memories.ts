import { Router, Application, Request, Response } from "express";

import { AppDataSource } from "../data-source";
import { Memory } from "../models/memory";
import { User } from "../models/user";
import { validateId } from "../utils/validateId";

const router = Router();

// Új emlék hozzáadása
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { title, description, reminderDate, userId } = req.body;
  const memoryRepository = AppDataSource.getRepository(Memory);
  const userRepository = AppDataSource.getRepository(User);

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
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hiba történt az emlék hozzáadása során", error });
  }
});

// Emlékek listázása
router.get("/", async (req: Request, res: Response): Promise<void> => {
  const memoryRepository = AppDataSource.getRepository(Memory);

  try {
    const memories = await memoryRepository.find({ relations: ["user"] });
    res.json(memories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba történt az emlékek listázása során", error });
  }
});
// Emlékek szűrése dátumtartomány alapján
router.get("/filter", async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query; // Dátumtartomány lekérése
  const memoryRepository = AppDataSource.getRepository(Memory);

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
  } catch (error) {
    res.status(500).json({ message: "Hiba történt a szűrés során", error });
  }
});

// Emlékek keresése kulcsszó alapján
router.get("/search", async (req: Request, res: Response): Promise<void> => {
  const { query } = req.query; // Keresési kulcsszó
  if (!query || typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ message: "Keresési kulcsszó megadása kötelező" });
    return;
  }

  try {
    const memoryRepository = AppDataSource.getRepository(Memory);
    const memories = await memoryRepository
      .createQueryBuilder("memory")
      .where("memory.title LIKE :query OR memory.description LIKE :query", {
        query: `%${query}%`,
      })
      .getMany();

    res
      .status(200)
      .json(
        memories.length > 0
          ? memories
          : { message: "Nincs találat", memories: [] }
      );
  } catch (error) {
    res.status(500).json({ message: "Hiba történt a keresés során", error });
  }
});

// Emlék részleteinek lekérdezése
router.get("/:id(\\d+)", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const memoryRepository = AppDataSource.getRepository(Memory);

  const memoryId = validateId(id, res);
  if (memoryId === null) return;

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
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba történt az emlék lekérdezése során", error });
  }
});

// Emlék szerkesztése
router.put("/:id(\\d+)", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, reminderDate } = req.body;
  const memoryRepository = AppDataSource.getRepository(Memory);

  const memoryId = validateId(id, res);
  if (memoryId === null) return;

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
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hiba történt az emlék szerkesztése során", error });
  }
});

// Emlék törlése
router.get("/:id(\\d+)", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const memoryId = validateId(id, res);
  if (memoryId === null) return;
  const memoryRepository = AppDataSource.getRepository(Memory);

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
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hiba történt az emlék törlése során", error });
  }
});

export default (app: Application): void => {
  app.use("/api/memories", router);
};
