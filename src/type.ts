import jwt from "jsonwebtoken";

export interface JwtPayloadWithUserId extends jwt.JwtPayload {
  userId: number;
}
