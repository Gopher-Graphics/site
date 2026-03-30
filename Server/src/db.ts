import { Pool } from "pg";

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "gopher_graphics",
});

console.log(
    `Connecting to database: ${pool.options.database} on ${pool.options.host}:${pool.options.port} as ${pool.options.user}`,
);

export default pool;
