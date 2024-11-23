import { Response } from "express";

/**
 * Ellenőrzi és konvertálja az azonosítót számra.
 * Ha érvénytelen, hibát küld vissza a válasz objektumon keresztül.
 *
 * @param id - Az azonosító stringként
 * @param res - Az Express válasz objektuma
 * @returns A számként konvertált azonosító, vagy null, ha érvénytelen
 */
export function validateId(id: string, res: Response): number | null {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    res.status(400).json({ message: "Hibás azonosító formátum" });
    return null;
  }
  return parsedId;
}
