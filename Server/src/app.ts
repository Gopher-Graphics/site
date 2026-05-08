import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import rateLimit from "express-rate-limit";
import pool from "./db";
import usersRouter from "./routes/users";
import projectsRouter from "./routes/projects";
import channelsRouter from "./routes/channels";
import directMessagesRouter from "./routes/directMessages";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
        credentials: true,
    }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// serve locally-uploaded files in dev
app.use("/uploads", express.static("uploads"));

// global rate limiter for all /api routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1500, // limit each IP to 1500 requests per windowMs (increased for message polling)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { success: false, error: "Too many requests, please try again later." },
});
app.use("/api/", apiLimiter);

// routers
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/channels", channelsRouter);
app.use("/api/direct-messages", directMessagesRouter);

// health check
app.get("/api/health", async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT
                (SELECT COUNT(*)::int FROM users) AS user_count,
                (SELECT COUNT(*)::int FROM projects) AS project_count,
                (SELECT COUNT(*)::int FROM channels) AS channel_count,
                NOW() AS server_time`,
        );
        res.json({ success: true, data: { db: "ok", ...result.rows[0] } });
    } catch {
        res.status(503).json({ success: false, error: "Database unavailable" });
    }
});

// serve static frontend files in production
if (process.env.NODE_ENV === "production") {
    const publicPath = path.join(__dirname, "..", "public");
    app.use(express.static(publicPath));
    
    // fallback for react router
    app.get("/*any", (req: Request, res: Response) => {
        if (!req.path.startsWith("/api")) {
            res.sendFile(path.join(publicPath, "index.html"));
        } else {
            res.status(404).json({ success: false, error: "API route not found" });
        }
    });
}

export default app;
