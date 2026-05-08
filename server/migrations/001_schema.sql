-- Migration: Scraper Backend Setup
-- Up
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Scraper Categories
CREATE TABLE IF NOT EXISTS scrape_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES scrape_categories(id) ON DELETE SET NULL,
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraper Products
CREATE TABLE IF NOT EXISTS scrape_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price_gbp DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    original_currency VARCHAR(10),
    discount_price_gbp DECIMAL(10,2),
    category_id UUID REFERENCES scrape_categories(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    source_url TEXT UNIQUE,
    source_scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_synced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraper Product Variants (Sizes, dosages, etc)
CREATE TABLE IF NOT EXISTS scrape_product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES scrape_products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price_gbp DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    sku VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraper Product Images
CREATE TABLE IF NOT EXISTS scrape_product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES scrape_products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    storage_path TEXT,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(product_id, url)
);

-- Scraper Sources (Tracking runs per domain/url)
CREATE TABLE IF NOT EXISTS scrape_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    url TEXT NOT NULL UNIQUE,
    domain VARCHAR(255) NOT NULL,
    last_scraped_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'idle', -- 'idle', 'scraping', 'error'
    pages_scraped INTEGER DEFAULT 0,
    products_found INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrape Queue (Replaces BullMQ/Redis)
CREATE TABLE IF NOT EXISTS scrape_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL, -- 'SCRAPE_FULL', 'SCRAPE_CATEGORY', 'SCRAPE_PRODUCT', 'FALLBACK_SEARCH'
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    priority INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FX Rates Cache
CREATE TABLE IF NOT EXISTS fx_rates_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    rate DECIMAL(15,6) NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(base_currency, target_currency)
);

-- Optional existing tables linkage (for sync)
-- We will link to Research Peptides UK's actual `products` later via API.
