import { Router, Request, Response } from "express";
import pool from "../db";
import { requireAuth } from "../middleware/auth";
import { ok, created, fail } from "../util/response";
import { requireFields } from "../util/validators";
import { uploadImage } from "../util/upload";

const router = Router();

// list projects
router.get("/", async (req: Request, res: Response) => {
    const { tag, author, limit = "20", offset = "0" } = req.query as Record<string, string>;

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (tag) {
        conditions.push(
            `p.id IN (SELECT pt.project_id FROM project_tags pt JOIN tags t ON t.id = pt.tag_id WHERE t.name = $${paramIdx++})`,
        );
        values.push(tag);
    }

    if (author) {
        conditions.push(`u.username = $${paramIdx++}`);
        values.push(author);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    values.push(limitNum, offsetNum);

    const projectsQuery = `
        SELECT p.id, p.title, p.description, p.project_url, p.date_label, p.created_at,
               u.username AS author_username, u.name AS author_name, u.avatar_url AS author_avatar,
               COALESCE(
                   json_agg(DISTINCT jsonb_build_object('name', t.name)) FILTER (WHERE t.id IS NOT NULL),
                   '[]'
               ) AS tags,
               (SELECT pi.image_url FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.display_order LIMIT 1) AS thumbnail
        FROM projects p
        JOIN users u ON u.id = p.author_id
        LEFT JOIN project_tags pt ON pt.project_id = p.id
        LEFT JOIN tags t ON t.id = pt.tag_id
        ${where}
        GROUP BY p.id, u.username, u.name, u.avatar_url
        ORDER BY p.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `;

    try {
        const [projectsResult, tagsResult] = await Promise.all([
            pool.query(projectsQuery, values),
            pool.query("SELECT id, name FROM tags ORDER BY name"),
        ]);
        ok(res, { projects: projectsResult.rows, tags: tagsResult.rows });
    } catch (err) {
        console.error("GET /projects error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get project detail
router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, u.username AS author_username, u.name AS author_name, u.avatar_url AS author_avatar
             FROM projects p JOIN users u ON u.id = p.author_id
             WHERE p.id = $1`,
            [id],
        );

        if (result.rows.length === 0) {
            fail(res, 404, "Project not found");
            return;
        }

        const project = result.rows[0];

        const [images, tech, highlights, tags] = await Promise.all([
            pool.query(
                "SELECT id, image_url, display_order FROM project_images WHERE project_id = $1 ORDER BY display_order",
                [id],
            ),
            pool.query(
                "SELECT id, name, display_order FROM project_tech WHERE project_id = $1 ORDER BY display_order",
                [id],
            ),
            pool.query(
                "SELECT id, description, display_order FROM project_highlights WHERE project_id = $1 ORDER BY display_order",
                [id],
            ),
            pool.query(
                `SELECT t.id, t.name FROM tags t
                 JOIN project_tags pt ON pt.tag_id = t.id
                 WHERE pt.project_id = $1 ORDER BY t.name`,
                [id],
            ),
        ]);

        ok(res, {
            ...project,
            images: images.rows,
            tech: tech.rows,
            highlights: highlights.rows,
            tags: tags.rows,
        });
    } catch (err) {
        console.error("GET /projects/:id error:", err);
        fail(res, 500, "Internal server error");
    }
});

// create project
router.post("/", requireAuth, async (req: Request, res: Response) => {
    if (!requireFields(req, res, ["title", "description"])) return;

    const {
        title,
        description,
        long_description,
        project_url,
        date_label,
        tags = [],
        images = [],
        tech = [],
        highlights = [],
    } = req.body as {
        title: string;
        description: string;
        long_description?: string;
        project_url?: string;
        date_label?: string;
        tags?: string[];
        images?: string[]; // base64 data URIs
        tech?: string[];
        highlights?: string[];
    };

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Insert the project
        const projectResult = await client.query(
            `INSERT INTO projects (author_id, title, description, long_description, project_url, date_label)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [req.user!.id, title, description, long_description ?? null, project_url ?? null, date_label ?? null],
        );
        const project = projectResult.rows[0];

        // Tags: upsert, then link
        for (const tagName of tags) {
            const tagResult = await client.query(
                `INSERT INTO tags (name) VALUES ($1)
                 ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                 RETURNING id`,
                [tagName.trim()],
            );
            const tagId = tagResult.rows[0].id;
            await client.query(
                "INSERT INTO project_tags (project_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [project.id, tagId],
            );
        }

        // Tech stack
        for (let i = 0; i < tech.length; i++) {
            await client.query(
                "INSERT INTO project_tech (project_id, name, display_order) VALUES ($1, $2, $3)",
                [project.id, tech[i], i],
            );
        }

        // Highlights
        for (let i = 0; i < highlights.length; i++) {
            await client.query(
                "INSERT INTO project_highlights (project_id, description, display_order) VALUES ($1, $2, $3)",
                [project.id, highlights[i], i],
            );
        }

        // Images
        for (let i = 0; i < images.length; i++) {
            const uploadResult = await uploadImage(images[i], "projects");
            await client.query(
                "INSERT INTO project_images (project_id, image_url, display_order) VALUES ($1, $2, $3)",
                [project.id, uploadResult.url, i],
            );
        }

        await client.query("COMMIT");
        created(res, { id: project.id });
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("POST /projects error:", err);
        fail(res, 500, "Internal server error");
    } finally {
        client.release();
    }
});

// update project
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;

    // Ownership check
    const existing = await pool.query("SELECT author_id FROM projects WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
        fail(res, 404, "Project not found");
        return;
    }

    const userResult = await pool.query("SELECT role FROM users WHERE id = $1", [req.user!.id]);
    const isAdmin = userResult.rows[0]?.role === "admin";

    if (existing.rows[0].author_id !== req.user!.id && !isAdmin) {
        fail(res, 403, "Forbidden");
        return;
    }

    const { title, description, long_description, project_url, date_label } = req.body as {
        title?: string;
        description?: string;
        long_description?: string;
        project_url?: string;
        date_label?: string;
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (title !== undefined) { updates.push(`title = $${paramIdx++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${paramIdx++}`); values.push(description); }
    if (long_description !== undefined) { updates.push(`long_description = $${paramIdx++}`); values.push(long_description); }
    if (project_url !== undefined) { updates.push(`project_url = $${paramIdx++}`); values.push(project_url); }
    if (date_label !== undefined) { updates.push(`date_label = $${paramIdx++}`); values.push(date_label); }

    if (updates.length === 0) {
        fail(res, 400, "No fields provided to update");
        return;
    }

    values.push(id);
    const result = await pool.query(
        `UPDATE projects SET ${updates.join(", ")} WHERE id = $${paramIdx} RETURNING *`,
        values,
    );

    ok(res, result.rows[0]);
});

// delete project
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;

    const existing = await pool.query("SELECT author_id FROM projects WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
        fail(res, 404, "Project not found");
        return;
    }

    const userResult = await pool.query("SELECT role FROM users WHERE id = $1", [req.user!.id]);
    const isAdmin = userResult.rows[0]?.role === "admin";

    if (existing.rows[0].author_id !== req.user!.id && !isAdmin) {
        fail(res, 403, "Forbidden");
        return;
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [id]);
    ok(res, { deleted: id });
});

export default router;
