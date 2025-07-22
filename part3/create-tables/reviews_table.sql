CREATE TABLE IF NOT EXISTS reviews (
    id CHAR(36) NOT NULL,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    Rating INT NOT NULL,
    user_id CHAR(36) NOT NULL,
    place_id CHAR(36) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (user_id, place_id),
    Foreign Key (user_id) REFERENCES `user`(id),
    Foreign Key (place_id) REFERENCES `place`(id)
);
