-- Fix categories that were stored as slash-separated strings instead of individual array elements.
-- e.g. {"AI Fundamentals / Implementation Strategy / Applied Use Cases"}
--   → {"AI Fundamentals","Implementation Strategy","Applied Use Cases"}

UPDATE materials
SET categories = (
  SELECT ARRAY(
    SELECT DISTINCT TRIM(part)
    FROM unnest(categories) AS elem,
    LATERAL unnest(string_to_array(elem, '/')) AS part
    WHERE TRIM(part) != ''
    ORDER BY TRIM(part)
  )
)
WHERE EXISTS (
  SELECT 1 FROM unnest(categories) AS elem WHERE elem LIKE '%/%'
);
