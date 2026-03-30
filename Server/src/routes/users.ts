import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db";
import getUserId from "../util/userId";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "";
if (JWT_SECRET == "") {
    throw new Error("Missing JWT Secret!");
}

router.post("/create", async (req: Request, res: Response) => {
    const { x500, password, name, avatar_data } = req.body;

    if (!x500 || !password || !name || !avatar_data) {
        console.log("Ensure all user details are complete");
        res.status(400).json({ error: "Ensure all user details are complete" });
        return;
    }

    const existing = await pool.query("SELECT id FROM users WHERE x500 = $1", [x500]);
    if (existing.rows.length > 0) {
        res.status(409).json({ error: "A user with this x500 already exists" });
        return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    // TODO: Post image to S3
    const avatar_url = "data";

    try {
        const result = await pool.query(
            "INSERT INTO users (x500, password_hash, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING id, x500",
            [x500, password_hash, name, avatar_url],
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, x500: user.x500 }, JWT_SECRET, {
            expiresIn: "30d",
        });
        res.status(201).json({ token, x500: user.x500 });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error });
        return;
    }
});

router.post("/login", async (req: Request, res: Response) => {
    const { x500, password } = req.body;

    if (!x500 || !password) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }

    const existing = await pool.query("SELECT id FROM users WHERE x500 = $1", [x500]);
    if (existing.rows.length > 0) {
        res.status(409).json({ error: "A user with this x500 already exists" });
        return;
    }

    const result = await pool.query("SELECT * FROM users WHERE x500 = $1", [x500]);
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
        res.status(400).json({ error: "Incorrect password" });
        return;
    }

    const token = jwt.sign({ id: user.id, x500: user.x500, email: user.email }, JWT_SECRET, {
        expiresIn: "30d",
    });

    res.status(200).json({ token, x500: user.x500 });
});

router.get("/me", async (req: Request, res: Response) => {
    const user_id = getUserId(req);
    if (!user_id) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [user_id]);
    if (result.rows.length === 0) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const user = result.rows[0];
    delete user.password_hash;

    res.status(200).json(user);
});

export default router;
