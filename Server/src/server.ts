import "dotenv/config";
import http from "http";
import pool from "./db";
import app from "./app";

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(Number(PORT), async () => {
    try {
        await pool.query("SELECT 1");
        console.log("Connected to PostgreSQL");
    } catch (err) {
        console.error("Failed to connect to PostgreSQL:", err);
    }
    console.log(`Server listening on port ${PORT}`);
});
