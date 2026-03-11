-- v20: Add submissions_closed flag to week_content
-- Allows admins to close a week so no new deliverables can be submitted.
-- Existing submissions are preserved and users can see whether they submitted in time.

ALTER TABLE week_content
  ADD COLUMN IF NOT EXISTS submissions_closed boolean NOT NULL DEFAULT false;
