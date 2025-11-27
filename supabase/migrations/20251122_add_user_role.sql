-- Add role column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('client', 'partner'));

-- Create index for role lookups
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users(role);

-- Update the handle_new_user function to NOT set a default role
-- Users will select their role during onboarding
