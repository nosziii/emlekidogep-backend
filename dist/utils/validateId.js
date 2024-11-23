"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateId = validateId;
/**
 * Ellenőrzi és konvertálja az azonosítót számra.
 * Ha érvénytelen, hibát küld vissza a válasz objektumon keresztül.
 *
 * @param id - Az azonosító stringként
 * @param res - Az Express válasz objektuma
 * @returns A számként konvertált azonosító, vagy null, ha érvénytelen
 */
function validateId(id, res) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
        res.status(400).json({ message: "Hibás azonosító formátum" });
        return null;
    }
    return parsedId;
}
