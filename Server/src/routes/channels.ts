import { Router, Request, Response } from "express";
import pool from "../db";
import { requireAuth, optionalAuth } from "../middleware/auth";
import { ok, created, fail } from "../util/response";
import { uploadImage } from "../util/upload";

const router = Router();

// list channels
router.get("/", optionalAuth, async (req: Request, res: Response) => {
    const userId = req.user?.id;
    try {
        const result = await pool.query(
            `SELECT c.id, c.slug, c.name, c.description, c.created_at,
                    COUNT(DISTINCT cm_count.user_id)::int AS member_count,
                    EXISTS(SELECT 1 FROM channel_members cm_check WHERE cm_check.channel_id = c.id AND cm_check.user_id = $1) AS is_member
             FROM channels c
             LEFT JOIN channel_members cm_count ON cm_count.channel_id = c.id
             GROUP BY c.id ORDER BY c.name`,
            [userId || null]
        );
        ok(res, result.rows);
    } catch (err) {
        console.error("GET /channels error:", err);
        fail(res, 500, "Internal server error");
    }
});

// create channel
router.post("/", requireAuth, async (req: Request, res: Response) => {
    const { name, description } = req.body as { name?: string; description?: string };
    if (!name || name.trim().length === 0) {
        fail(res, 400, "Channel name is required");
        return;
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (!slug) {
        fail(res, 400, "Invalid channel name");
        return;
    }

    try {
        const existing = await pool.query("SELECT id FROM channels WHERE slug = $1", [slug]);
        if (existing.rows.length > 0) {
            fail(res, 409, "A channel with a similar name already exists");
            return;
        }

        const result = await pool.query(
            `INSERT INTO channels (slug, name, description, created_by)
             VALUES ($1, $2, $3, $4)
             RETURNING id, slug, name, description, created_at`,
            [slug, name.trim(), description?.trim() || null, req.user!.id],
        );
        const channel = result.rows[0];

        // Auto-join creator
        await pool.query(
            "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2)",
            [channel.id, req.user!.id],
        );

        created(res, { ...channel, member_count: 1 });
    } catch (err) {
        console.error("POST /channels error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get channel detail
router.get("/:slug", async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT c.id, c.slug, c.name, c.description, c.created_at,
                    COUNT(cm.user_id)::int AS member_count
             FROM channels c
             LEFT JOIN channel_members cm ON cm.channel_id = c.id
             WHERE c.slug = $1 GROUP BY c.id`,
            [req.params.slug],
        );
        if (result.rows.length === 0) { fail(res, 404, "Channel not found"); return; }
        ok(res, result.rows[0]);
    } catch (err) {
        console.error("GET /channels/:slug error:", err);
        fail(res, 500, "Internal server error");
    }
});

// join channel
router.post("/:slug/join", requireAuth, async (req: Request, res: Response) => {
    try {
        const ch = await pool.query("SELECT id FROM channels WHERE slug = $1", [req.params.slug]);
        if (ch.rows.length === 0) { fail(res, 404, "Channel not found"); return; }
        const channelId = ch.rows[0].id;
        await pool.query(
            "INSERT INTO channel_members (channel_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
            [channelId, req.user!.id],
        );
        await pool.query(
            "INSERT INTO channel_messages (channel_id, author_id, message_type) VALUES ($1, $2, 'system_join')",
            [channelId, req.user!.id],
        );
        ok(res, { joined: req.params.slug });
    } catch (err) {
        console.error("join error:", err);
        fail(res, 500, "Internal server error");
    }
});

// leave channel
router.post("/:slug/leave", requireAuth, async (req: Request, res: Response) => {
    try {
        const ch = await pool.query("SELECT id FROM channels WHERE slug = $1", [req.params.slug]);
        if (ch.rows.length === 0) { fail(res, 404, "Channel not found"); return; }
        const channelId = ch.rows[0].id;
        await pool.query(
            "DELETE FROM channel_members WHERE channel_id = $1 AND user_id = $2",
            [channelId, req.user!.id],
        );
        await pool.query(
            "INSERT INTO channel_messages (channel_id, author_id, message_type) VALUES ($1, $2, 'system_leave')",
            [channelId, req.user!.id],
        );
        ok(res, { left: req.params.slug });
    } catch (err) {
        console.error("leave error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get channel messages
router.get("/:slug/messages", requireAuth, async (req: Request, res: Response) => {
    const { limit = "50", since } = req.query as Record<string, string>;
    try {
        const ch = await pool.query("SELECT id FROM channels WHERE slug = $1", [req.params.slug]);
        if (ch.rows.length === 0) { fail(res, 404, "Channel not found"); return; }
        const channelId = ch.rows[0].id;

        const membership = await pool.query(
            "SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2",
            [channelId, req.user!.id],
        );
        if (membership.rows.length === 0) { fail(res, 403, "Join channel to view messages"); return; }

        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const params: unknown[] = [channelId, limitNum];
        let sinceClause = "";
        if (since) { params.push(since); sinceClause = `AND m.created_at > $${params.length}`; }

        const result = await pool.query(
            `SELECT m.id, m.message_type, m.text, m.image_data, m.created_at, m.parent_id,
                    u.id AS author_id, u.username AS author_username,
                    u.name AS author_name, u.avatar_url AS author_avatar,
                    pm.text AS parent_text, pm.image_data AS parent_image,
                    pu.name AS parent_author_name
             FROM channel_messages m 
             JOIN users u ON u.id = m.author_id
             LEFT JOIN channel_messages pm ON pm.id = m.parent_id
             LEFT JOIN users pu ON pu.id = pm.author_id
             WHERE m.channel_id = $1 ${sinceClause}
             ORDER BY m.created_at ASC LIMIT $2`,
            params,
        );
        ok(res, result.rows);
    } catch (err) {
        console.error("messages error:", err);
        fail(res, 500, "Internal server error");
    }
});

// post channel message
router.post("/:slug/messages", requireAuth, async (req: Request, res: Response) => {
    const { text, image_data, parent_id } = req.body as { text?: string; image_data?: string; parent_id?: string };
    if (!text && !image_data) { fail(res, 400, "Message must include text or image"); return; }
    try {
        const ch = await pool.query("SELECT id FROM channels WHERE slug = $1", [req.params.slug]);
        if (ch.rows.length === 0) { fail(res, 404, "Channel not found"); return; }
        const channelId = ch.rows[0].id;

        const membership = await pool.query(
            "SELECT 1 FROM channel_members WHERE channel_id = $1 AND user_id = $2",
            [channelId, req.user!.id],
        );
        if (membership.rows.length === 0) { fail(res, 403, "Join channel to post messages"); return; }

        let final_image_url: string | null = null;
        if (image_data) {
            try {
                const uploadResult = await uploadImage(image_data, "messages");
                final_image_url = uploadResult.url;
            } catch (err) {
                console.error("Channel Image upload failed:", err);
                fail(res, 400, "Invalid image data");
                return;
            }
        }

        const result = await pool.query(
            `INSERT INTO channel_messages (channel_id, author_id, message_type, text, image_data, parent_id)
             VALUES ($1, $2, 'user', $3, $4, $5)
             RETURNING id, message_type, text, image_data, parent_id, created_at`,
            [channelId, req.user!.id, text ?? null, final_image_url, parent_id ?? null],
        );
        created(res, result.rows[0]);
    } catch (err) {
        console.error("post message error:", err);
        fail(res, 500, "Internal server error");
    }
});

// delete channel message
router.delete("/:slug/messages/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "DELETE FROM channel_messages WHERE id = $1 AND author_id = $2 RETURNING id",
            [req.params.id, req.user!.id]
        );
        if (result.rows.length === 0) {
            fail(res, 404, "Message not found or you are not the author");
            return;
        }
        ok(res, { deleted: req.params.id });
    } catch (err) {
        console.error("delete message error:", err);
        fail(res, 500, "Internal server error");
    }
});

export default router;
