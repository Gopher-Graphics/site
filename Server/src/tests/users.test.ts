import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({ default: { query: vi.fn() } }));
vi.mock("bcrypt");
vi.mock("jsonwebtoken");
vi.mock("../util/upload", () => ({
    uploadImage: vi.fn().mockResolvedValue({ url: "/uploads/avatars/mock.png", key: null }),
}));

const mockQuery = vi.mocked(pool.query);
const VALID_TOKEN = "valid.jwt.token";
const USER_ID = "00000000-0000-0000-0000-000000000001";

describe("User Routes", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("POST /api/users/create", () => {
        it("creates a new user and returns token", async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [] } as any)          // uniqueness check
                .mockResolvedValueOnce({ rows: [{ id: USER_ID, username: "test_user" }] } as any); // INSERT
            vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never);
            vi.mocked(jwt.sign).mockReturnValue(VALID_TOKEN as any);

            const res = await request(app).post("/api/users/create").send({
                username_raw: "Test User",
                password: "password123",
                name: "Test",
            });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBe(VALID_TOKEN);
            expect(res.body.data.username).toBe("test_user");
        });

        it("returns 400 when fields are missing", async () => {
            const res = await request(app).post("/api/users/create").send({ username_raw: "a" });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("returns 409 when username already exists", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [{ id: USER_ID }] } as any);
            const res = await request(app).post("/api/users/create").send({
                username_raw: "taken",
                password: "pass",
                name: "Name",
            });
            expect(res.status).toBe(409);
        });
    });

    describe("POST /api/users/login", () => {
        it("logs in successfully", async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: USER_ID, username: "test_user", password_hash: "hashed" }],
            } as any);
            vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
            vi.mocked(jwt.sign).mockReturnValue(VALID_TOKEN as any);

            const res = await request(app)
                .post("/api/users/login")
                .send({ username_raw: "test_user", password: "password123" });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBe(VALID_TOKEN);
        });

        it("returns 404 when user not found", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] } as any);
            const res = await request(app)
                .post("/api/users/login")
                .send({ username_raw: "nobody", password: "pass" });
            expect(res.status).toBe(404);
        });

        it("returns 401 on wrong password", async () => {
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: USER_ID, username: "u", password_hash: "hash" }],
            } as any);
            vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
            const res = await request(app)
                .post("/api/users/login")
                .send({ username_raw: "u", password: "wrong" });
            expect(res.status).toBe(401);
        });

        it("returns 400 when fields missing", async () => {
            const res = await request(app).post("/api/users/login").send({});
            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/users/me", () => {
        it("returns user when token is valid", async () => {
            vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: USER_ID, username: "u", name: "Name" }],
            } as any);

            const res = await request(app)
                .get("/api/users/me")
                .set("Authorization", `Bearer ${VALID_TOKEN}`);

            expect(res.status).toBe(200);
            expect(res.body.data.username).toBe("u");
        });

        it("returns 401 without token", async () => {
            const res = await request(app).get("/api/users/me");
            expect(res.status).toBe(401);
        });
    });

    describe("POST /api/users/edit", () => {
        it("updates user name successfully", async () => {
            vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
            mockQuery.mockResolvedValueOnce({
                rows: [{ id: USER_ID, username: "u", name: "New Name" }],
            } as any);

            const res = await request(app)
                .post("/api/users/edit")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({ name: "New Name" });

            expect(res.status).toBe(200);
            expect(res.body.data.name).toBe("New Name");
        });

        it("returns 400 if no fields provided", async () => {
            vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
            const res = await request(app)
                .post("/api/users/edit")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({});
            expect(res.status).toBe(400);
        });

        it("returns 401 without auth", async () => {
            const res = await request(app).post("/api/users/edit").send({ name: "x" });
            expect(res.status).toBe(401);
        });
    });
});
