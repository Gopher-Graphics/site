import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({ default: { query: vi.fn() } }));
vi.mock("jsonwebtoken");

const mockQuery = vi.mocked(pool.query);
const VALID_TOKEN = "valid.jwt.token";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const CHANNEL_ID = "00000000-0000-0000-0000-000000000010";

function authed() {
    vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
}

describe("Channel Routes", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("GET /api/channels", () => {
        it("lists channels", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID, slug: "general", member_count: 5 }] } as any);
            const res = await request(app).get("/api/channels");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe("GET /api/channels/:slug", () => {
        it("returns channel detail", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID, slug: "general" }] } as any);
            const res = await request(app).get("/api/channels/general");
            expect(res.status).toBe(200);
        });

        it("returns 404 for unknown slug", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] } as any);
            const res = await request(app).get("/api/channels/nope");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /api/channels/:slug/join", () => {
        it("requires auth", async () => {
            const res = await request(app).post("/api/channels/general/join");
            expect(res.status).toBe(401);
        });

        it("joins channel successfully", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID }] } as any) // channel lookup
                .mockResolvedValueOnce({ rows: [] } as any)                    // INSERT member
                .mockResolvedValueOnce({ rows: [] } as any);                   // system message

            const res = await request(app)
                .post("/api/channels/general/join")
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(200);
            expect(res.body.data.joined).toBe("general");
        });
    });

    describe("GET /api/channels/:slug/messages", () => {
        it("returns 403 if not a member", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID }] } as any) // channel
                .mockResolvedValueOnce({ rows: [] } as any);                    // no membership

            const res = await request(app)
                .get("/api/channels/general/messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(403);
        });

        it("returns messages for members", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID }] } as any)     // channel
                .mockResolvedValueOnce({ rows: [{ user_id: USER_ID }] } as any)   // membership
                .mockResolvedValueOnce({ rows: [{ id: "m1", text: "hi" }] } as any); // messages

            const res = await request(app)
                .get("/api/channels/general/messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe("POST /api/channels/:slug/messages", () => {
        it("returns 400 if text and image both missing", async () => {
            authed();
            const res = await request(app)
                .post("/api/channels/general/messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it("posts a message successfully", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: CHANNEL_ID }] } as any)   // channel
                .mockResolvedValueOnce({ rows: [{ user_id: USER_ID }] } as any) // membership
                .mockResolvedValueOnce({ rows: [{ id: "msg1", text: "hello" }] } as any); // insert

            const res = await request(app)
                .post("/api/channels/general/messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ text: "hello" });
            expect(res.status).toBe(201);
        });
    });
});
