use axum::{extract::State, http::StatusCode, response::Json, routing::post, Router};
use bcrypt::{hash, DEFAULT_COST};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::PgPool;
use std::env;

pub fn router() -> Router<PgPool> {
    Router::new().route("/create", post(create_user))
}

#[derive(Deserialize)]
struct CreateUserRequest {
    username_raw: String,
    password: String,
    name: String,
    avatar_data: Option<String>,
    avatar_url: Option<String>,
}

#[derive(Serialize)]
struct Claims {
    id: i32,
    username: String,
    exp: usize,
}

async fn create_user(
    State(pool): State<PgPool>,
    Json(body): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, Json<Value>)> {
    let jwt_secret = env::var("JWT_SECRET").map_err(|_| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({ "success": false, "error": "Missing JWT_SECRET" })),
        )
    })?;

    let username = sanitize_username(&body.username_raw).ok_or((
        StatusCode::BAD_REQUEST,
        Json(json!({ "success": false, "error": "username_raw must not be empty" })),
    ))?;

    let existing = sqlx::query!("SELECT id FROM users WHERE username = $1", username)
        .fetch_optional(&pool)
        .await
        .map_err(|_| internal_error())?;

    if existing.is_some() {
        return Err((
            StatusCode::CONFLICT,
            Json(json!({ "success": false, "error": "A user with this username already exists" })),
        ));
    }

    let final_avatar_url: Option<String> = if let Some(data) = body.avatar_data {
        Some(upload_image(&data, "avatars").await.map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                Json(json!({ "success": false, "error": "Invalid avatar image data" })),
            )
        })?)
    } else {
        body.avatar_url
    };

    let password_hash = hash(&body.password, DEFAULT_COST).map_err(|_| internal_error())?;

    let user = sqlx::query!(
        "INSERT INTO users (username, password_hash, name, avatar_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, username",
        username,
        password_hash,
        body.name,
        final_avatar_url,
    )
    .fetch_one(&pool)
    .await
    .map_err(|_| internal_error())?;

    let exp = (chrono::Utc::now() + chrono::Duration::days(30)).timestamp() as usize;
    let claims = Claims {
        id: user.id,
        username: user.username.clone(),
        exp,
    };
    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_bytes()),
    )
    .map_err(|_| internal_error())?;

    Ok((
        StatusCode::CREATED,
        Json(json!({ "success": true, "data": { "token": token, "username": user.username } })),
    ))
}

fn sanitize_username(raw: &str) -> Option<String> {
    let s = raw.trim().to_lowercase();
    if s.is_empty() {
        None
    } else {
        Some(s)
    }
}

fn internal_error() -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({ "success": false, "error": "Internal server error" })),
    )
}

async fn upload_image(data: &str, folder: &str) -> Result<String, ()> {
    todo!("implement image upload for folder: {}", folder)
}
