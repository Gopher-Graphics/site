import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";

function getUserId(req: Request): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return null;
    const JWT_SECRET = process.env.JWT_SECRET || "";
    try {
        const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { id: string };
        return payload.id;
    } catch {
        return null;
    }
}

export default getUserId;
