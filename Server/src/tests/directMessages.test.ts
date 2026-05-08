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
const OTHER_ID = "00000000-0000-0000-0000-000000000002";

function authed() {
    vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
}

describe("Direct Message Routes", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("GET /api/direct-messages/:userId", () => {
        it("requires auth", async () => {
            const res = await request(app).get(`/api/direct-messages/${OTHER_ID}`);
            expect(res.status).toBe(401);
        });

        it("returns conversation messages", async () => {
            authed();
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: "dm1", text: "hi", sender_id: USER_ID, receiver_id: OTHER_ID }],
            } as any);

            const res = await request(app)
                .get(`/api/direct-messages/${OTHER_ID}`)
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(1);
        });
    });

    describe("POST /api/direct-messages", () => {
        it("requires auth", async () => {
            const res = await request(app)
                .post("/api/direct-messages")
                .send({ receiver_id: OTHER_ID, text: "hi" });
            expect(res.status).toBe(401);
        });

        it("returns 400 when receiver_id missing", async () => {
            authed();
            const res = await request(app)
                .post("/api/direct-messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ text: "hi" });
            expect(res.status).toBe(400);
        });

        it("returns 400 when sending to self", async () => {
            authed();
            const res = await request(app)
                .post("/api/direct-messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ receiver_id: USER_ID, text: "hi" });
            expect(res.status).toBe(400);
        });

        it("returns 400 when no text or image", async () => {
            authed();
            const res = await request(app)
                .post("/api/direct-messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ receiver_id: OTHER_ID });
            expect(res.status).toBe(400);
        });

        it("sends DM successfully", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: OTHER_ID }] } as any) // receiver check
                .mockResolvedValueOnce({
                    rows: [{ id: "dm1", sender_id: USER_ID, receiver_id: OTHER_ID, text: "hi" }],
                } as any); // INSERT

            const res = await request(app)
                .post("/api/direct-messages")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ receiver_id: OTHER_ID, text: "hi" });
            expect(res.status).toBe(201);
            expect(res.body.data.text).toBe("hi");
        });
    });
});
