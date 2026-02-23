-- Migration v13: Member Resources
-- Members can add their own resources to any week's "Members Resources" section.
-- These are completely separate from admin-curated session materials.

CREATE TABLE IF NOT EXISTS public.member_resources (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  week        text        NOT NULL,
  title       text        NOT NULL,
  link        text        NOT NULL,
  description text,
  added_by    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.member_resources ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read
CREATE POLICY "member_resources_select"
  ON public.member_resources FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can add their own resources
CREATE POLICY "member_resources_insert"
  ON public.member_resources FOR INSERT
  TO authenticated
  WITH CHECK (added_by = auth.uid());

-- Users can delete their own; admins can delete any
CREATE POLICY "member_resources_delete"
  ON public.member_resources FOR DELETE
  TO authenticated
  USING (
    added_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
