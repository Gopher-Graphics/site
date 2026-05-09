use axum::{extract::State, http::StatusCode, response::Json, routing::get, Router};
use governor::{Quota, RateLimiter};
use serde_json::{json, Value};
use sqlx::PgPool;
use std::num::NonZeroU32;
use std::{env, time::Duration};
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    limit::RequestBodyLimitLayer,
    services::ServeDir,
};

#[path = "routes/users.rs"]
mod users;

mod projects {
    use axum::Router;

    pub fn router() -> Router {
        Router::new()
    }
}

mod channels {
    use axum::Router;

    pub fn router() -> Router {
        Router::new()
    }
}

mod direct_messages {
    use axum::Router;

    pub fn router() -> Router {
        Router::new()
    }
}

pub fn create_app(pool: PgPool) -> Router {
    let client_origin =
        env::var("CLIENT_ORIGIN").unwrap_or_else(|_| "http://localhost:5173".to_string());

    let cors = CorsLayer::new()
        .allow_origin(client_origin.parse::<axum::http::HeaderValue>().unwrap())
        .allow_credentials(true)
        .allow_headers(tower_http::cors::Any)
        .allow_methods(tower_http::cors::Any);

    let body_limit = RequestBodyLimitLayer::new(10 * 1024 * 1024);

    let api_routes = Router::new()
        .route("/health", get(health_handler))
        .nest("/users", users::router())
        .nest("/projects", projects::router())
        .nest("/channels", channels::router())
        .nest("/direct-messages", direct_messages::router())
        .with_state(pool.clone());

    let mut router = Router::new()
        .nest("/api", api_routes)
        .layer(ServiceBuilder::new().layer(cors).layer(body_limit));

    router = router.nest_service("/uploads", ServeDir::new("uploads"));

    if env::var("NODE_ENV").as_deref() == Ok("production") {
        router = router
            .nest_service(
                "/",
                ServeDir::new("public").append_index_html_on_directories(true),
            )
            .fallback(spa_fallback);
    }

    router
}

async fn health_handler(
    State(pool): State<PgPool>,
) -> Result<Json<Value>, (StatusCode, Json<Value>)> {
    let row = sqlx::query!(
        r#"
        SELECT
            (SELECT COUNT(*)::int FROM users) AS user_count,
            (SELECT COUNT(*)::int FROM projects) AS project_count,
            (SELECT COUNT(*)::int FROM channels) AS channel_count,
            NOW() AS server_time
        "#
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| {
        (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(json!({ "success": false, "error": "Database unavailable" })),
        )
    })?;

    Ok(Json(json!({
        "success": true,
        "data": {
            "db": "ok",
            "user_count": row.user_count,
            "project_count": row.project_count,
            "channel_count": row.channel_count,
            "server_time": row.server_time,
        }
    })))
}

async fn spa_fallback() -> axum::response::Response {
    // Serve index.html for all non-API routes (React Router fallback)
    let path = std::path::Path::new("public/index.html");
    match tokio::fs::read(path).await {
        Ok(contents) => axum::response::Response::builder()
            .header("Content-Type", "text/html; charset=utf-8")
            .body(axum::body::Body::from(contents))
            .unwrap(),
        Err(_) => axum::response::Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body(axum::body::Body::from("Not found"))
            .unwrap(),
    }
}
