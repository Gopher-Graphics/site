use dotenv::dotenv;
use std::env;

use dotenv::dotenv;
use std::env;

mod app;
mod db;

#[tokio::main]
async fn main() {
    dotenv().ok();
    tracing_subscriber::fmt::init();

    let pool = db::create_pool().await.expect("Failed to create DB pool");

    // Test DB connection
    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => tracing::info!("Connected to PostgreSQL"),
        Err(e) => tracing::error!("Failed to connect to PostgreSQL: {}", e),
    }

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "3000".to_string())
        .parse()
        .expect("PORT must be a number");

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    let router = app::create_app(pool);

    tracing::info!("Server listening on port {}", port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, router).await.unwrap();
}
