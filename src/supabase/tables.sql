-- Create enum types first
CREATE TYPE task_state_enum AS ENUM ('new', 'assigned', 'completed', 'reviewed');
CREATE TYPE technology_type_enum AS ENUM ('frontend', 'backend', 'llm');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_id VARCHAR NOT NULL UNIQUE,
    name VARCHAR,
    role VARCHAR,
    admin BOOLEAN NOT NULL DEFAULT FALSE,
    points INTEGER NOT NULL DEFAULT 0
);

-- Create tasks table with foreign key to users
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    state task_state_enum NOT NULL DEFAULT 'new',
    assigned_to_id UUID REFERENCES users(id),
    col INTEGER NOT NULL,
    row INTEGER NOT NULL,
    reference_url TEXT,
    technology technology_type_enum,
    points INTEGER
);

CREATE TABLE columns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR,
    order INTEGER
);
-- Create indexes for better performance
CREATE INDEX idx_users_external_id ON users(external_id);
CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_state ON tasks(state);