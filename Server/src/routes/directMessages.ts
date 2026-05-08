import { Router, Request, Response } from "express";
import pool from "../db";
import { requireAuth } from "../middleware/auth";
import { ok, created, fail } from "../util/response";

const router = Router();

// list conversations
router.get("/conversations", requireAuth, async (req: Request, res: Response) => {
    const myId = req.user!.id;
    try {
        const result = await pool.query(
            `SELECT DISTINCT ON (partner_id)
                CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END AS partner_id,
                u.username, u.name, u.avatar_url,
                dm.text AS last_message, dm.created_at AS last_message_at
             FROM direct_messages dm
             JOIN users u ON u.id = (CASE WHEN dm.sender_id = $1 THEN dm.receiver_id ELSE dm.sender_id END)
             WHERE dm.sender_id = $1 OR dm.receiver_id = $1
             ORDER BY partner_id, dm.created_at DESC`,
            [myId]
        );
        ok(res, result.rows);
    } catch (err) {
        console.error("GET /direct-messages/conversations error:", err);
        fail(res, 500, "Internal server error");
    }
});

// get conversation messages
router.get("/:userId", requireAuth, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { limit = "50", since } = req.query as Record<string, string>;
    const myId = req.user!.id;

    try {
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
        const params: unknown[] = [myId, userId, limitNum];
        let sinceClause = "";
        if (since) { params.push(since); sinceClause = `AND dm.created_at > $${params.length}`; }

        const result = await pool.query(
            `SELECT dm.id, dm.sender_id, dm.receiver_id, dm.text, dm.image_data, dm.created_at, dm.parent_id,
                    dm.sender_id AS author_id,
                    s.username AS author_username, s.name AS author_name, s.avatar_url AS author_avatar,
                    s.username AS sender_username, s.name AS sender_name, s.avatar_url AS sender_avatar,
                    r.username AS receiver_username, r.name AS receiver_name, r.avatar_url AS receiver_avatar,
                    pm.text AS parent_text, pm.image_data AS parent_image,
                    ps.name AS parent_author_name
             FROM direct_messages dm
             JOIN users s ON s.id = dm.sender_id
             JOIN users r ON r.id = dm.receiver_id
             LEFT JOIN direct_messages pm ON pm.id = dm.parent_id
             LEFT JOIN users ps ON ps.id = pm.sender_id
             WHERE (
                 (dm.sender_id = $1 AND dm.receiver_id = $2) OR
                 (dm.sender_id = $2 AND dm.receiver_id = $1)
             ) ${sinceClause}
             ORDER BY dm.created_at ASC
             LIMIT $3`,
            params,
        );
        ok(res, result.rows);
    } catch (err) {
        console.error("GET /direct-messages/:userId error:", err);
        fail(res, 500, "Internal server error");
    }
});

// send direct message
router.post("/", requireAuth, async (req: Request, res: Response) => {
    const { receiver_id, text, image_data, parent_id } = req.body as {
        receiver_id?: string;
        text?: string;
        image_data?: string;
        parent_id?: string;
    };

    if (!receiver_id) { fail(res, 400, "receiver_id is required"); return; }
    if (!text && !image_data) { fail(res, 400, "Message must include text or image"); return; }
    if (receiver_id === req.user!.id) { fail(res, 400, "Cannot send DM to yourself"); return; }

    try {
        const receiverCheck = await pool.query("SELECT id FROM users WHERE id = $1", [receiver_id]);
        if (receiverCheck.rows.length === 0) { fail(res, 404, "Recipient not found"); return; }

        const result = await pool.query(
            `INSERT INTO direct_messages (sender_id, receiver_id, text, image_data, parent_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, sender_id, receiver_id, text, image_data, parent_id, created_at`,
            [req.user!.id, receiver_id, text ?? null, image_data ?? null, parent_id ?? null],
        );
        created(res, result.rows[0]);
    } catch (err) {
        console.error("POST /direct-messages error:", err);
        fail(res, 500, "Internal server error");
    }
});

// delete direct message
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            "DELETE FROM direct_messages WHERE id = $1 AND sender_id = $2 RETURNING id",
            [req.params.id, req.user!.id]
        );
        if (result.rows.length === 0) {
            fail(res, 404, "Message not found or you are not the sender");
            return;
        }
        ok(res, { deleted: req.params.id });
    } catch (err) {
        console.error("DELETE /direct-messages/:id error:", err);
        fail(res, 500, "Internal server error");
    }
});

export default router;
