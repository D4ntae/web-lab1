CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    vatin VARCHAR(20) UNIQUE NOT NULL
);

CREATE TABLE tickets (
    id UUID PRIMARY KEY,
    time_generated TIMESTAMP NOT NULL,
    owner UUID NOT NULL,
    CONSTRAINT fk_owner
        FOREIGN KEY(owner) 
        REFERENCES users(id)
);

