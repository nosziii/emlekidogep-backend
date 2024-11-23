"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const axios_1 = __importDefault(require("axios"));
const authenticate_1 = require("../middleware/authenticate");
const router = (0, express_1.Router)();
const API_URL = process.env.CHAT_API_URL;
const MODEL_NAME = process.env.CHAT_MODEL_NAME;
console.log("CHAT_API_URL:", process.env.CHAT_API_URL);
console.log("CHAT_MODEL_NAME:", process.env.CHAT_MODEL_NAME);
// Chat végpont
router.post("/", authenticate_1.authenticate, async (req, res) => {
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
        const response = await axios_1.default.post(API_URL, requestData, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const chatResponse = response.data.choices[0].message.content; // Válasz kinyerése
        res.json({ response: chatResponse });
    }
    catch (error) {
        console.error("Hiba történt:", error.response
            ? error.response.data
            : error.message);
        res.status(500).json({
            error: "Hiba történt a chat API-val való kommunikáció során.",
        });
    }
});
exports.default = router;
