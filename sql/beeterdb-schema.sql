drop database if exists beeterdb;
create database beeterdb;

use beeterdb;

CREATE TABLE users (
    id BINARY(16) NOT NULL,
    loginid VARCHAR(15) NOT NULL UNIQUE,
    password BINARY(16) NOT NULL,
    email VARCHAR(255) NOT NULL,
    fullname VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE user_roles (
    userid BINARY(16) NOT NULL,
    role ENUM ('registered'),
    FOREIGN KEY (userid) REFERENCES users(id) on delete cascade,
    PRIMARY KEY (userid, role)
);

CREATE TABLE auth_tokens (
    userid BINARY(16) NOT NULL,
    token BINARY(16) NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) on delete cascade,
    PRIMARY KEY (token)
);

CREATE TABLE stings (
    id BINARY(16) NOT NULL,
    userid BINARY(16) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    content VARCHAR(500) NOT NULL,
    last_modified TIMESTAMP NOT NULL,
    creation_timestamp DATETIME not null default current_timestamp,
    FOREIGN KEY (userid) REFERENCES users(id) on delete cascade,
    PRIMARY KEY (id)
);
