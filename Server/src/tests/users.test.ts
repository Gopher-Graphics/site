import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({
    default: {
        query: vi.fn(),
    },
}));
vi.mock("bcrypt");
vi.mock("jsonwebtoken");

describe("User Routes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("POST /users/create", () => {
        it("Should create a new user and return a token", async () => {
            const userData = {
                x500: "test500",
                password: "password",
                name: "name",
                avatar_data: "data",
            };

            vimocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
            vi.mocked(bcrypt.hash).mockResolvedValue("hashedpassword" as never);
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
            vi.mocked(pool.query).mockResolvedValueOnce({ rows: [] } as any);
            vi.mocked(pool.query).mockResolvedValueOnce({
                rows: [{ id: "1", x500: "test500", created_at: new Date() }],
            } as any);

            vi.mocked(jwt.sign).mockReturnValue("mocktoken" as any);
            const response = await request(app).post("/api/users/create").send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("token", "mocktoken");
        });
    });
});
