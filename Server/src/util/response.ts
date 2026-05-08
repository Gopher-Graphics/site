import { Response } from "express";

/** Send a successful response. */
export function ok(res: Response, data: unknown, status = 200): void {
    res.status(status).json({ success: true, data });
}

/** Send a created (201) response. */
export function created(res: Response, data: unknown): void {
    ok(res, data, 201);
}

/** Send an error response. */
export function fail(res: Response, status: number, error: string | object): void {
    res.status(status).json({ success: false, error });
}
