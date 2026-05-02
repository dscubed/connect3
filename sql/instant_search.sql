-- Run this in the Supabase SQL editor before using the instant search feature.
-- Step 1: Create the search function
CREATE OR REPLACE FUNCTION instant_search(query_text TEXT, result_limit INT DEFAULT 4)
RETURNS TABLE (
  id          TEXT,
  result_type TEXT,
  name        TEXT,
  snippet     TEXT,
  avatar_url  TEXT,
  sub_label   TEXT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  -- People & clubs
  (
    SELECT
      p.id::text,
      p.account_type::text                                   AS result_type,
      CASE WHEN p.account_type = 'organisation'
           THEN p.first_name
           ELSE TRIM(p.first_name || ' ' || COALESCE(p.last_name, ''))
      END                                                   AS name,
      LEFT(COALESCE(p.tldr, ''), 120)                       AS snippet,
      p.avatar_url,
      p.university                                          AS sub_label
    FROM profiles p
    WHERE
      to_tsvector('english',
        COALESCE(p.first_name, '')   || ' ' ||
        COALESCE(p.last_name, '')    || ' ' ||
        COALESCE(p.tldr, '')         || ' ' ||
        COALESCE(p.university, '')
      ) @@ websearch_to_tsquery('english', query_text)
      OR LOWER(p.first_name) LIKE LOWER(query_text) || '%'
    LIMIT result_limit
  )
  UNION ALL
  -- Events (future, published only)
  (
    SELECT
      e.id::text,
      'event'                                               AS result_type,
      e.name,
      LEFT(
        regexp_replace(COALESCE(e.description, ''), '<[^>]+>', ' ', 'g'),
        120
      )                                                     AS snippet,
      NULL                                                  AS avatar_url,
      TO_CHAR(e.start AT TIME ZONE 'UTC', 'Mon DD, YYYY')   AS sub_label
    FROM events e
    WHERE
      e.status = 'published'
      AND (
        to_tsvector('english',
          COALESCE(e.name, '')        || ' ' ||
          COALESCE(e.description, '') || ' ' ||
          COALESCE(e.tags::text, '')
        ) @@ websearch_to_tsquery('english', query_text)
        OR LOWER(e.name) LIKE LOWER(query_text) || '%'
      )
    ORDER BY e.start DESC
    LIMIT result_limit
  )
  UNION ALL
  -- Instagram posts
  (
    SELECT
      ip.id::text,
      'instagram_post'                                                AS result_type,
      COALESCE(p.first_name, ip.posted_by)                           AS name,
      LEFT(COALESCE(ip.caption, ''), 120)                            AS snippet,
      p.avatar_url,
      TO_CHAR(to_timestamp(ip.timestamp), 'Mon DD, YYYY')            AS sub_label
    FROM instagram_posts ip
    LEFT JOIN instagram_club_fetches icf ON icf.instagram_slug = ip.posted_by
    LEFT JOIN profiles p ON p.id = icf.profile_id
    WHERE
      to_tsvector('english', COALESCE(ip.caption, ''))
      @@ websearch_to_tsquery('english', query_text)
    ORDER BY ip.timestamp DESC
    LIMIT result_limit
  )
$$;

-- Grant execute to both anon and authenticated roles
GRANT EXECUTE ON FUNCTION instant_search(TEXT, INT) TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- BM25-ranked version: scores all categories together with ts_rank_cd and
-- returns top result_limit rows globally ordered by relevance.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION instant_search_bm25(query_text TEXT, result_limit INT DEFAULT 5)
RETURNS TABLE (
  id          TEXT,
  result_type TEXT,
  name        TEXT,
  snippet     TEXT,
  avatar_url  TEXT,
  sub_label   TEXT,
  score       REAL
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT * FROM (

    -- People & clubs
    SELECT
      p.id::text,
      p.account_type::text AS result_type,
      CASE WHEN p.account_type = 'organisation'
           THEN p.first_name
           ELSE TRIM(p.first_name || ' ' || COALESCE(p.last_name, ''))
      END AS name,
      LEFT(COALESCE(p.tldr, ''), 120) AS snippet,
      p.avatar_url,
      p.university AS sub_label,
      GREATEST(
        ts_rank_cd(
          to_tsvector('english',
            COALESCE(p.first_name, '')  || ' ' ||
            COALESCE(p.last_name, '')   || ' ' ||
            COALESCE(p.tldr, '')        || ' ' ||
            COALESCE(p.university, '')
          ),
          websearch_to_tsquery('english', query_text)
        ),
        CASE WHEN LOWER(p.first_name) LIKE LOWER(query_text) || '%' THEN 0.01 ELSE 0 END
      ) AS score
    FROM profiles p
    WHERE
      to_tsvector('english',
        COALESCE(p.first_name, '')  || ' ' ||
        COALESCE(p.last_name, '')   || ' ' ||
        COALESCE(p.tldr, '')        || ' ' ||
        COALESCE(p.university, '')
      ) @@ websearch_to_tsquery('english', query_text)
      OR LOWER(p.first_name) LIKE LOWER(query_text) || '%'

    UNION ALL

    -- Events (published only)
    SELECT
      e.id::text,
      'event' AS result_type,
      e.name,
      LEFT(regexp_replace(COALESCE(e.description, ''), '<[^>]+>', ' ', 'g'), 120) AS snippet,
      (SELECT ei.url FROM event_images ei WHERE ei.event_id = e.id ORDER BY ei.sort_order ASC LIMIT 1) AS avatar_url,
      TO_CHAR(e.start AT TIME ZONE 'UTC', 'Mon DD, YYYY') AS sub_label,
      GREATEST(
        ts_rank_cd(
          to_tsvector('english',
            COALESCE(e.name, '')        || ' ' ||
            COALESCE(e.description, '') || ' ' ||
            COALESCE(e.tags::text, '')
          ),
          websearch_to_tsquery('english', query_text)
        ),
        CASE WHEN LOWER(e.name) LIKE LOWER(query_text) || '%' THEN 0.01 ELSE 0 END
      ) AS score
    FROM events e
    WHERE
      e.status = 'published'
      AND (
        to_tsvector('english',
          COALESCE(e.name, '')        || ' ' ||
          COALESCE(e.description, '') || ' ' ||
          COALESCE(e.tags::text, '')
        ) @@ websearch_to_tsquery('english', query_text)
        OR LOWER(e.name) LIKE LOWER(query_text) || '%'
      )

    UNION ALL

    -- Instagram posts
    SELECT
      ip.id::text,
      'instagram_post' AS result_type,
      COALESCE(p.first_name, ip.posted_by) AS name,
      LEFT(COALESCE(ip.caption, ''), 120) AS snippet,
      COALESCE(ip.images[1], p.avatar_url) AS avatar_url,
      TO_CHAR(to_timestamp(ip.timestamp), 'Mon DD, YYYY') AS sub_label,
      ts_rank_cd(
        to_tsvector('english', COALESCE(ip.caption, '')),
        websearch_to_tsquery('english', query_text)
      ) AS score
    FROM instagram_posts ip
    LEFT JOIN instagram_club_fetches icf ON icf.instagram_slug = ip.posted_by
    LEFT JOIN profiles p ON p.id = icf.profile_id
    WHERE
      to_tsvector('english', COALESCE(ip.caption, ''))
      @@ websearch_to_tsquery('english', query_text)

  ) combined
  WHERE score > 0
  ORDER BY score DESC
  LIMIT result_limit;
$$;

GRANT EXECUTE ON FUNCTION instant_search_bm25(TEXT, INT) TO anon, authenticated;

-- Step 2: GIN indexes for fast full-text search
CREATE INDEX IF NOT EXISTS profiles_fts_idx ON profiles
  USING GIN (
    to_tsvector('english',
      COALESCE(first_name, '') || ' ' ||
      COALESCE(last_name,  '') || ' ' ||
      COALESCE(tldr,       '')
    )
  );

CREATE INDEX IF NOT EXISTS events_fts_idx ON events
  USING GIN (
    to_tsvector('english',
      COALESCE(name,        '') || ' ' ||
      COALESCE(description, '')
    )
  );
