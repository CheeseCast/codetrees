/*
  # Create snippets schema

  1. New Tables
    - `snippets`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `description` (text)
      - `code` (text, not null)
      - `language` (text, not null)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `snippets` table
    - Add policies for:
      - Anyone can read snippets
      - Authenticated users can create snippets
      - Users can update and delete their own snippets
*/

CREATE TABLE IF NOT EXISTS snippets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  code text NOT NULL,
  language text NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read snippets
CREATE POLICY "Anyone can read snippets"
  ON snippets
  FOR SELECT
  TO public
  USING (true);

-- Policy: Authenticated users can create snippets
CREATE POLICY "Authenticated users can create snippets"
  ON snippets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own snippets
CREATE POLICY "Users can update own snippets"
  ON snippets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own snippets
CREATE POLICY "Users can delete own snippets"
  ON snippets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);