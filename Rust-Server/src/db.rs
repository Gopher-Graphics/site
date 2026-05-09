use sqlx::PgPool;
use std::env;

pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let host = env::var("DB_HOST").unwrap_or_else(|_| "localhost".to_string());
    let port = env::var("DB_PORT").unwrap_or_else(|_| "5432".to_string());
    let user = env::var("DB_USER").unwrap_or_else(|_| "postgres".to_string());
    let password = env::var("DB_PASSWORD").unwrap_or_else(|_| "".to_string());
    let database = env::var("DB_NAME").unwrap_or_else(|_| "gopher_graphics".to_string());

    let database_url = format!(
        "postgres://{}:{}@{}:{}/{}",
        user, password, host, port, database
    );

    println!(
        "Connecting to database: {} on {}:{} as {}",
        database, host, port, user
    );

    PgPool::connect(&database_url).await
}
