import { Router, Request, Response } from "express";
import axios from "axios";
import { authenticate } from "../middleware/authenticate";

const router = Router();

const API_URL = process.env.CHAT_API_URL!;
const MODEL_NAME = process.env.CHAT_MODEL_NAME!;

// Chat végpont
router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Üzenet megadása kötelező." });
      return;
    }

    const requestData = {
      model: MODEL_NAME,
      messages: [{ role: "user", content: message }],
    };

    try {
      const response = await axios.post(API_URL, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const chatResponse = response.data.choices[0].message.content; // Válasz kinyerése
      res.json({ response: chatResponse });
    } catch (error) {
      console.error(
        "Hiba történt:",
        (error as any).response
          ? (error as any).response.data
          : (error as any).message
      );
      res.status(500).json({
        error: "Hiba történt a chat API-val való kommunikáció során.",
      });
    }
  }
);

export default router;
