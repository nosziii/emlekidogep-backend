import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Authentication failed: Token missing" });
    return;
  }

  try {
    const decoded = jwt.verify(token, "yourSecretKey");

    if (typeof decoded === "string") {
      res.status(403).json({ message: "Invalid token format" });
      return;
    }

    req.user = decoded as JwtPayload & { userId: number };
    next();
  } catch (error) {
    res.status(403).json({ message: "Authentication failed: Invalid token" });
  }
};
