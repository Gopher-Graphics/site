import "dotenv/config";
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import pool from "./db";
import usersRouter from "./routes/users";

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/users", usersRouter);

server.listen(Number(PORT), async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Connected to PostgreSQL");
    } catch (err) {
        console.error("Failed to connect to PostgreSQL:", err);
    }
    console.log(`Server listening on port ${PORT}`);
});

export default app;
