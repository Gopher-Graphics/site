-- GopherGraphics Database Schema

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    x500            VARCHAR(50)  NOT NULL UNIQUE,   
    password_hash   VARCHAR(255) NOT NULL,          -- bcrypt
    name            VARCHAR(100) NOT NULL,          -- display name, editable
    role            VARCHAR(50)  NOT NULL DEFAULT 'Member',  -- e.g. President, Officer, Member
    avatar_url      TEXT,                           -- URL for profile picture
    member_since    DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast login lookup
CREATE INDEX idx_users_x500 ON users(x500);



-- PROJECTS
CREATE TABLE projects (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(200) NOT NULL,
    description     TEXT         NOT NULL,           
    long_description TEXT,                           
    project_url     TEXT,                           
    date_label      VARCHAR(20),                     
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_author ON projects(author_id);
CREATE INDEX idx_projects_created ON projects(created_at DESC);


-- TAGS
CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);


-- PROJECT_TAGS (junction table)
-- Many-to-many relationship between projects and tags.
CREATE TABLE project_tags (
    project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX idx_project_tags_tag ON project_tags(tag_id);


-- PROJECT_TECH
-- Tech stack items associated with a project (displayed in detail modal).
CREATE TABLE project_tech (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    display_order   INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_project_tech_project ON project_tech(project_id);


-- PROJECT_IMAGES
CREATE TABLE project_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_url       TEXT         NOT NULL,           -- S3/storage URL
    display_order   INT          NOT NULL DEFAULT 0, -- ordering for carousel
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_project_images_project ON project_images(project_id);


-- PROJECT_HIGHLIGHTS
CREATE TABLE project_highlights (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id      UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    description     TEXT         NOT NULL,
    display_order   INT          NOT NULL DEFAULT 0
);

CREATE INDEX idx_project_highlights_project ON project_highlights(project_id);


-- CHANNELS
CREATE TABLE channels (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            VARCHAR(100) NOT NULL UNIQUE,    -- URL-safe identifier 
    name            VARCHAR(100) NOT NULL,           -- display name
    description     TEXT,
    created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channels_slug ON channels(slug);


-- CHANNEL_MEMBERS
-- Tracks which users have joined which channels.
CREATE TABLE channel_members (
    channel_id      UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX idx_channel_members_user ON channel_members(user_id);


-- CHANNEL_MESSAGES
CREATE TABLE channel_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id      UUID         NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
    author_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_type    VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system_join', 'system_leave')),
    text            TEXT,                             -- message body
    image_data      TEXT,                             -- image url
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_channel_messages_channel ON channel_messages(channel_id, created_at);
CREATE INDEX idx_channel_messages_author ON channel_messages(author_id);


-- DIRECT_MESSAGES
CREATE TABLE direct_messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    text            TEXT,                             -- message body
    image_data      TEXT,                             -- base64 image data stored directly
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT dm_no_self_message CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_dm_sender ON direct_messages(sender_id, created_at);
CREATE INDEX idx_dm_receiver ON direct_messages(receiver_id, created_at);
-- Composite index for conversation lookup between two users
CREATE INDEX idx_dm_conversation ON direct_messages(
    LEAST(sender_id, receiver_id),
    GREATEST(sender_id, receiver_id),
    created_at
);

-- SEED DATA: Default channels
INSERT INTO channels (slug, name, description) VALUES
    ('general',   'general',       'General club chat');


-- SEED DATA: Default tags
INSERT INTO tags (name) VALUES
    ('C++'),
    ('Ray Tracing'),
    ('Blender'),
    ('OpenGL'),
    ('Art'),
    ('Animation');


-- ANALYTICS VIEWS
-- Helps query tag popularity without recalculating joins manually.
CREATE OR REPLACE VIEW tag_usage_stats AS
SELECT 
    t.id AS tag_id,
    t.name AS tag_name,
    COUNT(pt.project_id) AS project_count
FROM tags t
LEFT JOIN project_tags pt ON t.id = pt.tag_id
GROUP BY t.id, t.name;

-- HELPER FUNCTION: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- HELPER FUNCTION: Auto-join 'general' channel
CREATE OR REPLACE FUNCTION auto_join_general_channel()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO channel_members (channel_id, user_id)
    SELECT id, NEW.id FROM channels WHERE slug = 'general';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_auto_join_general
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION auto_join_general_channel();
