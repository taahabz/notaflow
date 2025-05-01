-- Add font column to profiles table

-- First check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'font'
    ) THEN
        -- Add the column with default value 'system-ui'
        ALTER TABLE profiles ADD COLUMN font TEXT NOT NULL DEFAULT 'system-ui';
        
        -- Add a comment to the column for documentation
        COMMENT ON COLUMN profiles.font IS 'The user''s preferred font family';
    END IF;
END
$$; 