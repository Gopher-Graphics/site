import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
    id: string;
    username: string;
}

// Extend Express Request so downstream handlers have req.user typed.
declare module "express-serve-static-core" {
    interface Request {
        user?: AuthPayload;
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
    const auth = req.headers.authorization;

    let token: string | undefined;
    if (auth?.startsWith("Bearer ")) {
        token = auth.slice(7);
    } else if (req.cookies?.token) {
        token = req.cookies.token as string;
    }

    if (!token) {
        res.status(401).json({ success: false, error: "Unauthorized – no token provided" });
        return;
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = { id: payload.id, username: payload.username };
        next();
    } catch {
        res.status(401).json({ success: false, error: "Unauthorized – invalid or expired token" });
    }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
    const auth = req.headers.authorization;
    let token: string | undefined;
    if (auth?.startsWith("Bearer ")) {
        token = auth.slice(7);
    } else if (req.cookies?.token) {
        token = req.cookies.token as string;
    }

    if (!token) {
        return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || "";
    try {
        const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
        req.user = { id: payload.id, username: payload.username };
    } catch {
        // Just ignore invalid tokens in optional mode
    }
    next();
}
