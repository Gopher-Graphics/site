import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import pool from "../db";
import { requireAuth } from "../middleware/auth";
import { ok, created, fail } from "../util/response";
import { requireFields, sanitizeUsername } from "../util/validators";
import { uploadImage } from "../util/upload";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "";
if (!JWT_SECRET) {
    throw new Error("Missing JWT_SECRET environment variable");
}

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many authentication attempts, please try again later." },
});

// create user
router.post("/create", authLimiter, async (req: Request, res: Response) => {
    if (!requireFields(req, res, ["username_raw", "password", "name"])) return;

    const { username_raw, password, name, avatar_data, avatar_url } = req.body as {
        username_raw: string;
        password: string;
        name: string;
        avatar_data?: string;
        avatar_url?: string;
    };

    const username = sanitizeUsername(username_raw);
    if (!username) {
        fail(res, 400, "username_raw must not be empty");
        return;
    }

    // Uniqueness check
    const existing = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
    if (existing.rows.length > 0) {
        fail(res, 409, "A user with this username already exists");
        return;
    }

    let final_avatar_url: string | null = null;
    if (avatar_data) {
        try {
            const result = await uploadImage(avatar_data, "avatars");
            final_avatar_url = result.url;
        } catch (err) {
            console.error("Avatar upload failed:", err);
            fail(res, 400, "Invalid avatar image data");
            return;
        }
    } else if (avatar_url) {
        final_avatar_url = avatar_url;
    }

    const password_hash = await bcrypt.hash(password, 10);

    try {
        const result = await pool.query(
            `INSERT INTO users (username, password_hash, name, avatar_url)
             VALUES ($1, $2, $3, $4)
             RETURNING id, username`,
            [username, password_hash, name, final_avatar_url],
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
            expiresIn: "30d",
        });
        created(res, { token, username: user.username });
    } catch (err) {
        console.error("User create error:", err);
        fail(res, 500, "Internal server error");
    }
});

// login user
router.post("/login", authLimiter, async (req: Request, res: Response) => {
    if (!requireFields(req, res, ["username_raw", "password"])) return;

    const { username_raw, password } = req.body as { username_raw: string; password: string };
    const username = sanitizeUsername(username_raw);

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
        fail(res, 404, "User not found");
        return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        fail(res, 401, "Incorrect password");
        return;
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: "30d",
    });

    ok(res, { token, username: user.username });
});

// get current user profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, username, name, role, avatar_url, avatar_id, member_since, created_at, updated_at, major, github_url, linkedin_url, other_url, fav_language, fav_class, fav_professor, fav_game, fav_graphics_topic, fav_custom, least_fav_language, operating_system, graphics_software FROM users WHERE id = $1",
            [req.user!.id],
        );

        if (result.rows.length === 0) {
            fail(res, 404, "User not found");
            return;
        }

        ok(res, result.rows[0]);
    } catch (err) {
        console.error("GET /users/me error:", err);
        fail(res, 500, "Internal server error");
    }
});

// update user profile
router.post("/edit", requireAuth, async (req: Request, res: Response) => {
    const { username, name, avatar_url, avatar_data, role, member_since, major, github_url, linkedin_url, other_url, fav_language, fav_class, fav_professor, fav_game, fav_graphics_topic, fav_custom, least_fav_language, operating_system, graphics_software } = req.body as {
        username?: string;
        name?: string;
        avatar_url?: string;
        avatar_data?: string;
        role?: string;
        member_since?: string;
        major?: string;
        github_url?: string;
        linkedin_url?: string;
        other_url?: string;
        fav_language?: string;
        fav_class?: string;
        fav_professor?: string;
        fav_game?: string;
        fav_graphics_topic?: string;
        fav_custom?: string;
        least_fav_language?: string;
        operating_system?: string;
        graphics_software?: string;
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (username !== undefined) {
        const username_final = sanitizeUsername(username);
        const existing = await pool.query(
            "SELECT id FROM users WHERE username = $1 AND id != $2",
            [username_final, req.user!.id],
        );
        if (existing.rows.length > 0) {
            fail(res, 409, "A user with this username already exists");
            return;
        }
        updates.push(`username = $${paramIdx++}`);
        values.push(username_final);
    }

    if (name !== undefined) {
        updates.push(`name = $${paramIdx++}`);
        values.push(name);
    }

    // Handle avatar: prefer raw image data over pre-supplied URL
    if (avatar_data) {
        try {
            const uploadResult = await uploadImage(avatar_data, "avatars");
            updates.push(`avatar_url = $${paramIdx++}`);
            values.push(uploadResult.url);
        } catch (err) {
            console.error("Avatar upload failed:", err);
            fail(res, 400, "Invalid avatar image data");
            return;
        }
    } else if (avatar_url !== undefined) {
        updates.push(`avatar_url = $${paramIdx++}`);
        values.push(avatar_url);
    }

    if (role !== undefined) {
        updates.push(`role = $${paramIdx++}`);
        values.push(role);
    }

    if (member_since !== undefined) {
        updates.push(`member_since = $${paramIdx++}`);
        values.push(member_since);
    }

    const stringFields: Array<[string | undefined, string]> = [
        [major,              "major"],
        [github_url,         "github_url"],
        [linkedin_url,       "linkedin_url"],
        [other_url,          "other_url"],
        [fav_language,       "fav_language"],
        [fav_class,          "fav_class"],
        [fav_professor,      "fav_professor"],
        [fav_game,           "fav_game"],
        [fav_graphics_topic, "fav_graphics_topic"],
        [fav_custom,         "fav_custom"],
        [least_fav_language, "least_fav_language"],
        [operating_system,   "operating_system"],
        [graphics_software,  "graphics_software"],
    ];
    for (const [val, col] of stringFields) {
        if (val !== undefined) {
            updates.push(`${col} = $${paramIdx++}`);
            values.push(val === "" ? null : val); // allow clearing with empty string
        }
    }

    if (updates.length === 0) {
        fail(res, 400, "No fields provided to update");
        return;
    }

    values.push(req.user!.id);
    const result = await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIdx}
         RETURNING id, username, name, role, avatar_url, avatar_id, member_since, created_at, updated_at, major, github_url, linkedin_url, other_url, fav_language, fav_class, fav_professor, fav_game, fav_graphics_topic, fav_custom, least_fav_language, operating_system, graphics_software`,
        values,
    );

    ok(res, result.rows[0]);
});

// delete user account
router.delete("/delete", requireAuth, async (req: Request, res: Response) => {
    try {
        await pool.query("DELETE FROM users WHERE id = $1", [req.user!.id]);
        ok(res, { message: "Account deleted successfully" });
    } catch (err) {
        console.error("DELETE /users/delete error:", err);
        fail(res, 500, "Internal server error");
    }
});

// list all members
router.get("/", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, username, name, role, avatar_url, member_since, major, github_url, linkedin_url, other_url, fav_language, fav_class, fav_professor, fav_game, fav_graphics_topic, fav_custom, least_fav_language, operating_system, graphics_software FROM users ORDER BY name ASC",
        );
        ok(res, result.rows);
    } catch (err) {
        console.error("GET /users error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get user by id
router.get("/id/:id", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, username, name, role, avatar_url, member_since FROM users WHERE id = $1",
            [req.params.id],
        );
        if (result.rows.length === 0) {
            fail(res, 404, "User not found");
            return;
        }
        ok(res, result.rows[0]);
    } catch (err) {
        console.error("GET /users/id/:id error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get user by username
router.get("/:username", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "SELECT id, username, name, role, avatar_url, member_since, major, github_url, linkedin_url, other_url, fav_language, fav_class, fav_professor, fav_game, fav_graphics_topic, fav_custom, least_fav_language, operating_system, graphics_software FROM users WHERE username = $1",
            [req.params.username],
        );
        if (result.rows.length === 0) {
            fail(res, 404, "User not found");
            return;
        }
        ok(res, result.rows[0]);
    } catch (err) {
        console.error("GET /users/:username error:", err);
        fail(res, 500, "Internal server error");
    }
});

export default router;

