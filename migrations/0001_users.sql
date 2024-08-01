-- Migration number: 0001 	 2024-07-31T10:47:21.684Z

PRAGMA defer_foreign_keys = ON;

-- USER TABLE
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    username VARCHAR(30) PRIMARY KEY,
    password_hash VARCHAR(97) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_created_at_index
ON users (created_at);

CREATE INDEX users_email_index
ON users (email);


PRAGMA defer_foreign_keys = OFF;