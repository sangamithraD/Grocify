-- Grocify Database Schema Setup Script
-- Database: postgresql

-- 1. Enable UUID Extension (required for uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Grocery Items Table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 1),
    expiry_date DATE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('food', 'non-food')),
    status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'consumed', 'expired')),
    consumed_at TIMESTAMP WITH TIME ZONE,
    wasted_at TIMESTAMP WITH TIME ZONE,
    saved_via_recipe BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Index on User ID for faster pantry queries
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_expiry_date ON items(expiry_date);
