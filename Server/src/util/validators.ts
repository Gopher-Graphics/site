import { Request, Response } from "express";
import { fail } from "./response";

/**
 * Ensure every key in `fields` is a non-empty string on req.body.
 * Returns true if all pass, or sends a 400 and returns false.
 */
export function requireFields(req: Request, res: Response, fields: string[]): boolean {
    for (const field of fields) {
        const value = req.body[field];
        if (value === undefined || value === null || value === "") {
            fail(res, 400, `Missing required field: ${field}`);
            return false;
        }
    }
    return true;
}

/** Sanitize a raw username: lowercase + replace spaces with underscores. */
export function sanitizeUsername(raw: string): string {
    return raw.trim().replaceAll(" ", "_").toLowerCase();
}
