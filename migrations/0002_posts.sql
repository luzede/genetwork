-- Migration number: 0002 	 2024-08-03T13:31:15.188Z

PRAGMA defer_foreign_keys = ON;

DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    "owner" VARCHAR(30) NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("owner") REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX posts_created_at_index
ON posts (created_at);


DROP TABLE IF EXISTS user_likes_post;
CREATE TABLE user_likes_post (
    username VARCHAR(30) NOT NULL,
    post_id INTEGER NOT NULL,
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    PRIMARY KEY (username, post_id)
);

PRAGMA defer_foreign_keys = OFF;


