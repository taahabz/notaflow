-- Migration to add header_title column to profiles table
-- This SQL script should be run on your Supabase database

-- Check if the column already exists, if not, add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'header_title'
    ) THEN
        ALTER TABLE profiles ADD COLUMN header_title TEXT DEFAULT 'Notaflow';
    END IF;
END
$$;

-- Ensure profiles table exists
CREATE TABLE IF NOT EXISTS profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    theme TEXT DEFAULT 'light',
    header_title TEXT DEFAULT 'Notaflow',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);

-- Make sure user_id is NOT NULL and UNIQUE
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
    END IF;
END
$$;

-- Migration to add a separate header_titles table
-- This SQL script should be run on your Supabase database

-- Drop existing table if needed for clean recreation
DROP TABLE IF EXISTS header_titles;

-- Create a dedicated table for header titles with the right structure
CREATE TABLE header_titles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    title TEXT DEFAULT 'Notaflow' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS header_titles_user_id_idx ON header_titles(user_id);

-- Enable Row Level Security
ALTER TABLE header_titles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read/write only their own titles
CREATE POLICY "Users can read their own header titles" 
    ON header_titles 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own header titles" 
    ON header_titles 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own header titles" 
    ON header_titles 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps automatically
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update timestamps
CREATE TRIGGER update_header_titles_updated_at
    BEFORE UPDATE ON header_titles
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
