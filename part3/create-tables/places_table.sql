CREATE TABLE IF NOT EXISTS places (
    id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    rooms INTEGER NOT NULL,
    capacity INTEGER NOT NULL,
    surface FLOAT NOT NULL,
    owner_id CHAR(36) NOT NULL,
    created_at DATETIME,
    updated_at DATETIME,
    PRIMARY KEY (id),
    FOREIGN KEY (owner_id) REFERENCES users(id)
);
