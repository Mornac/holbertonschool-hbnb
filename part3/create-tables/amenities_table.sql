CREATE TABLE IF NOT EXISTS amenities (
    id CHAR(36) PRIMARY KEY NOT NULL,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at DATETIME,
    updated_at DATETIME
);
