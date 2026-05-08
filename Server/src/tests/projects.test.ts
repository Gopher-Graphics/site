import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../app";
import pool from "../db";
import jwt from "jsonwebtoken";

vi.mock("../db", () => ({ default: { query: vi.fn(), connect: vi.fn() } }));
vi.mock("jsonwebtoken");
vi.mock("../util/upload", () => ({
    uploadImage: vi.fn().mockResolvedValue({ url: "/uploads/projects/mock.png", key: null }),
}));

const mockQuery = vi.mocked(pool.query);
const VALID_TOKEN = "valid.jwt.token";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const PROJECT_ID = "00000000-0000-0000-0000-000000000002";

function authed() {
    vi.mocked(jwt.verify).mockReturnValue({ id: USER_ID, username: "u" } as any);
}

describe("Project Routes", () => {
    beforeEach(() => vi.clearAllMocks());

    describe("GET /api/projects", () => {
        it("returns project list", async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: PROJECT_ID, title: "My Project", tags: [] }] } as any)
                .mockResolvedValueOnce({ rows: [{ id: "t1", name: "C++" }] } as any);

            const res = await request(app).get("/api/projects");
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.projects).toHaveLength(1);
            expect(res.body.data.tags).toHaveLength(1);
        });
    });

    describe("GET /api/projects/:id", () => {
        it("returns full project detail", async () => {
            mockQuery
                .mockResolvedValueOnce({ rows: [{ id: PROJECT_ID, title: "P" }] } as any) // project
                .mockResolvedValueOnce({ rows: [] } as any)   // images
                .mockResolvedValueOnce({ rows: [] } as any)   // tech
                .mockResolvedValueOnce({ rows: [] } as any)   // highlights
                .mockResolvedValueOnce({ rows: [] } as any);  // tags

            const res = await request(app).get(`/api/projects/${PROJECT_ID}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(PROJECT_ID);
        });

        it("returns 404 for unknown project", async () => {
            mockQuery.mockResolvedValueOnce({ rows: [] } as any);
            const res = await request(app).get("/api/projects/nonexistent");
            expect(res.status).toBe(404);
        });
    });

    describe("POST /api/projects", () => {
        it("returns 401 without auth", async () => {
            const res = await request(app)
                .post("/api/projects")
                .send({ title: "T", description: "D" });
            expect(res.status).toBe(401);
        });

        it("returns 400 when required fields missing", async () => {
            authed();
            const res = await request(app)
                .post("/api/projects")
                .set("Authorization", `Bearer ${VALID_TOKEN}`)
                .send({});
            expect(res.status).toBe(400);
        });
    });

    describe("DELETE /api/projects/:id", () => {
        it("returns 403 if user is not the owner", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ author_id: "other-user" }] } as any) // project
                .mockResolvedValueOnce({ rows: [{ role: "Member" }] } as any);          // role check

            const res = await request(app)
                .delete(`/api/projects/${PROJECT_ID}`)
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(403);
        });

        it("deletes project for owner", async () => {
            authed();
            mockQuery
                .mockResolvedValueOnce({ rows: [{ author_id: USER_ID }] } as any) // project
                .mockResolvedValueOnce({ rows: [{ role: "Member" }] } as any)     // role check
                .mockResolvedValueOnce({ rows: [] } as any);                      // DELETE

            const res = await request(app)
                .delete(`/api/projects/${PROJECT_ID}`)
                .set("Authorization", `Bearer ${VALID_TOKEN}`);
            expect(res.status).toBe(200);
            expect(res.body.data.deleted).toBe(PROJECT_ID);
        });
    });
});
