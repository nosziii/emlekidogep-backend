"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Authentication failed: Token missing" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "yourSecretKey");
        if (typeof decoded === "string") {
            res.status(403).json({ message: "Invalid token format" });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ message: "Authentication failed: Invalid token" });
    }
};
exports.authenticate = authenticate;
