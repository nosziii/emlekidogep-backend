import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    export interface Request {
      user?: JwtPayload & { userId: number };
    }
  }
}

export {};

console.log("Custom Express types loaded.");
