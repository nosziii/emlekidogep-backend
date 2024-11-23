import { Router, Application, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../models/user";
import jwt from "jsonwebtoken";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Felhasználó bejelentkezése
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const userRepository = AppDataSource.getRepository(User);

  try {
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      res.status(404).json({ message: "Felhasználó nem található" });
      return;
    }

    const isValid = await user.validatePassword(password);
    if (!isValid) {
      res.status(401).json({ message: "Helytelen jelszó" });
      return;
    }

    // JWT generálása
    const token = jwt.sign({ userId: user.id }, "yourSecretKey", {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Sikeres bejelentkezés", user, token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba történt a bejelentkezés során", error });
  }
});
// Felhasználó létrehozása
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { email, password, name } = req.body;
  const userRepository = AppDataSource.getRepository(User);

  try {
    //mail egyedisegenek vizsgalata
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "Az email már használatban van" });
      return;
    }

    const newUser = userRepository.create({ email, password, name });
    await newUser.hashPassword(); // Jelszó hash-elése
    const savedUser = await userRepository.save(newUser);
    res
      .status(201)
      .json({ message: "Felhasználó létrehozva!", user: savedUser });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hiba a felhasználó létrehozásakor", error });
  }
});

// Kijelentkezés végpont (opcionális feketelistázással)
router.post(
  "/logout",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Itt lehetőség van a token feketelistázására (ha használunk ilyet)
      res.status(200).json({ message: "Sikeres kijelentkezés" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Hiba történt a kijelentkezés során", error });
    }
  }
);

// Felhasználók listázása
router.get("/", authenticate, async (req: Request, res: Response) => {
  const userRepository = AppDataSource.getRepository(User);

  try {
    const users = await userRepository.find();
    res.json(users); // Küldjük a választ
  } catch (error) {
    res
      .status(500)
      .json({ message: "Hiba történt a felhasználók listázása során", error });
  }
});

router.patch(
  "/change-password",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "Minden mező kitöltése kötelező" });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Az új jelszavak nem egyeznek" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: { id: req.user.userId },
      });

      if (!user) {
        res.status(404).json({ message: "Felhasználó nem található" });
        return;
      }

      // Jelenlegi jelszó ellenőrzése
      const isCurrentPasswordValid = await user.validatePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        res.status(401).json({ message: "Helytelen jelenlegi jelszó" });
        return;
      }

      // Új jelszó mentése és hash-elése
      user.password = newPassword; // Először beállítjuk az új jelszót
      await user.hashPassword(); // Ez gondoskodik a hash-elésről
      await userRepository.save(user); // Mentjük az adatbázisba

      res.status(200).json({ message: "Jelszó sikeresen megváltoztatva" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Hiba történt a jelszó módosítása során", error });
    }
  }
);

// Felhasználói adatok frissítése
router.patch(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email } = req.body; // Frissítendő mezők

    // Ellenőrizd, hogy a bejelentkezett felhasználó azonos-e az id-val
    if (parseInt(id, 10) !== req.user?.userId) {
      res
        .status(403)
        .json({ message: "Nem módosíthatod más felhasználó adatait" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: { id: parseInt(id, 10) },
      });
      if (!user) {
        res.status(404).json({ message: "Felhasználó nem található" });
        return;
      }

      // Adatok frissítése
      if (name) user.name = name;
      if (email) user.email = email;

      const updatedUser = await userRepository.save(user);
      res.status(200).json({
        message: "Felhasználói adatok frissítve",
        user: updatedUser,
      });
    } catch (error) {
      res.status(500).json({
        message: "Hiba történt a felhasználói adatok frissítése során",
        error,
      });
    }
  }
);

export default (app: Application): void => {
  app.use("/api/users", router);
};