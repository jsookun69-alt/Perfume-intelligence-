-- Perfume Intelligence — production schema (Supabase / Postgres)
-- Replaces the static PERFUMES array. Run once, before supabase/seed.sql.

-- Extensions must exist before any index/function that uses them.
-- Supabase installs extensions into the "extensions" schema.
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;        -- fuzzy name matching
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA extensions;  -- levenshtein()

SET search_path = public, extensions;

-- ---------- Tables ----------

CREATE TABLE brands (
  id            SERIAL PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  name_norm     TEXT GENERATED ALWAYS AS (regexp_replace(lower(name), '[^a-z0-9]', '', 'g')) STORED,
  founded_year  INT,
  country       TEXT,
  logo_url      TEXT,
  official_url  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE perfumers (
  id    SERIAL PRIMARY KEY,
  slug  TEXT UNIQUE NOT NULL,
  name  TEXT NOT NULL
);

CREATE TABLE notes (
  id      SERIAL PRIMARY KEY,
  slug    TEXT UNIQUE NOT NULL,
  name    TEXT NOT NULL,
  family  TEXT  -- e.g. citrus, floral, woody — for browse/filter pages
);

CREATE TABLE fragrances (
  id                SERIAL PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,          -- url-safe, e.g. "dior-sauvage-edt"
  name              TEXT NOT NULL,
  name_norm         TEXT GENERATED ALWAYS AS (regexp_replace(lower(name), '[^a-z0-9]', '', 'g')) STORED,
  brand_id          INT NOT NULL REFERENCES brands(id),
  year              INT,
  concentration     TEXT,                          -- EDT / EDP / Parfum / Extrait / EDC / Cologne
  gender            TEXT,                          -- Masculine / Feminine / Unisex
  family            TEXT,
  subfamilies       TEXT[] NOT NULL DEFAULT '{}',
  longevity         NUMERIC(3,1) CHECK (longevity BETWEEN 0 AND 10),
  projection        NUMERIC(3,1) CHECK (projection BETWEEN 0 AND 10),
  price_tier        TEXT,                          -- Budget / Mid / Premium / Luxury
  rating            NUMERIC(3,1),                  -- community rating, once collected
  rating_count      INT NOT NULL DEFAULT 0,
  image_url         TEXT,                          -- see IMAGE_SOURCING.md before populating
  -- provenance: every row must record where its data came from
  source            TEXT NOT NULL CHECK (
                      source IN ('official_site', 'manual_verified')
                      OR source LIKE 'licensed_api:%'
                    ),
  source_url        TEXT,
  verified_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fragrance_notes (
  fragrance_id  INT REFERENCES fragrances(id) ON DELETE CASCADE,
  note_id       INT REFERENCES notes(id),
  tier          TEXT NOT NULL CHECK (tier IN ('top','heart','base')),
  position      SMALLINT NOT NULL DEFAULT 0,       -- display order within the tier
  PRIMARY KEY (fragrance_id, note_id, tier)
);

CREATE TABLE fragrance_accords (
  fragrance_id  INT REFERENCES fragrances(id) ON DELETE CASCADE,
  accord_name   TEXT NOT NULL,
  strength      INT NOT NULL CHECK (strength BETWEEN 1 AND 10),
  position      SMALLINT NOT NULL DEFAULT 0,       -- display order
  PRIMARY KEY (fragrance_id, accord_name)
);

CREATE TABLE fragrance_perfumers (
  fragrance_id  INT REFERENCES fragrances(id) ON DELETE CASCADE,
  perfumer_id   INT REFERENCES perfumers(id),
  PRIMARY KEY (fragrance_id, perfumer_id)
);

-- Affiliate links per retailer per fragrance (swap in real tags once approved)
CREATE TABLE retailer_links (
  id            SERIAL PRIMARY KEY,
  fragrance_id  INT REFERENCES fragrances(id) ON DELETE CASCADE,
  retailer      TEXT NOT NULL,   -- 'amazon' | 'fragrancex' | 'sephora'
  url           TEXT NOT NULL,
  is_affiliate  BOOLEAN NOT NULL DEFAULT false
);

-- ---------- Indexes ----------

CREATE INDEX idx_fragrances_brand       ON fragrances(brand_id);
CREATE INDEX idx_fragrances_family      ON fragrances(family);
CREATE INDEX idx_fragrances_source      ON fragrances(source);
CREATE INDEX idx_fragrances_name_trgm   ON fragrances USING gin (name_norm gin_trgm_ops);
CREATE INDEX idx_brands_name_trgm       ON brands     USING gin (name_norm gin_trgm_ops);
CREATE INDEX idx_fragrance_notes_note   ON fragrance_notes(note_id);
CREATE INDEX idx_fragrance_accords_name ON fragrance_accords(accord_name);
CREATE INDEX idx_retailer_links_frag    ON retailer_links(fragrance_id);

-- ---------- updated_at ----------

CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END $$;

CREATE TRIGGER fragrances_updated_at BEFORE UPDATE ON fragrances
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------- Read API ----------

-- Full profile in the shape the app renders: notes {top,heart,base}, accords [{name,strength}].
CREATE VIEW fragrance_profiles WITH (security_invoker = true) AS
SELECT
  f.id, f.slug, f.name,
  b.name AS brand, b.slug AS brand_slug,
  f.year, f.concentration, f.gender, f.family, f.subfamilies,
  f.longevity, f.projection, f.price_tier, f.rating, f.rating_count, f.image_url,
  f.source, f.source_url, f.verified_at,
  jsonb_build_object(
    'top',   COALESCE((SELECT jsonb_agg(n.name ORDER BY fn.position) FROM fragrance_notes fn JOIN notes n ON n.id = fn.note_id WHERE fn.fragrance_id = f.id AND fn.tier = 'top'),   '[]'::jsonb),
    'heart', COALESCE((SELECT jsonb_agg(n.name ORDER BY fn.position) FROM fragrance_notes fn JOIN notes n ON n.id = fn.note_id WHERE fn.fragrance_id = f.id AND fn.tier = 'heart'), '[]'::jsonb),
    'base',  COALESCE((SELECT jsonb_agg(n.name ORDER BY fn.position) FROM fragrance_notes fn JOIN notes n ON n.id = fn.note_id WHERE fn.fragrance_id = f.id AND fn.tier = 'base'),  '[]'::jsonb)
  ) AS notes,
  COALESCE((SELECT jsonb_agg(jsonb_build_object('name', a.accord_name, 'strength', a.strength) ORDER BY a.position)
            FROM fragrance_accords a WHERE a.fragrance_id = f.id), '[]'::jsonb) AS accords
FROM fragrances f
JOIN brands b ON b.id = f.brand_id;

-- Search suggestions. Same scoring tiers the app used client-side:
-- exact 100, name prefix 90, name contains 80, brand+name contains 70,
-- brand contains 55, else levenshtein ratio on the name (> 0.55) scaled to 60.
CREATE FUNCTION search_fragrances(q TEXT, max_results INT DEFAULT 6)
RETURNS TABLE (slug TEXT, name TEXT, brand TEXT, family TEXT, score INT)
LANGUAGE sql STABLE SET search_path = public, extensions AS $$
  WITH nq AS (
    SELECT left(regexp_replace(lower(COALESCE(q, '')), '[^a-z0-9]', '', 'g'), 100) AS q
  ),
  scored AS (
    SELECT f.id, f.slug, f.name, b.name AS brand, f.family,
      CASE
        WHEN f.name_norm = nq.q OR b.name_norm || f.name_norm = nq.q THEN 100
        WHEN starts_with(f.name_norm, nq.q)                         THEN 90
        WHEN strpos(f.name_norm, nq.q) > 0                          THEN 80
        WHEN strpos(b.name_norm || f.name_norm, nq.q) > 0           THEN 70
        WHEN strpos(b.name_norm, nq.q) > 0                          THEN 55
        ELSE (
          SELECT CASE WHEN r > 0.55 THEN round((r * 60)::numeric)::int ELSE 0 END
          FROM (SELECT 1 - levenshtein(nq.q, left(f.name_norm, length(nq.q) + 3))::float8
                         / greatest(length(nq.q), length(f.name_norm), 1) AS r) x
        )
      END AS score
    FROM fragrances f
    JOIN brands b ON b.id = f.brand_id
    CROSS JOIN nq
    WHERE nq.q <> ''
  )
  SELECT s.slug, s.name, s.brand, s.family, s.score
  FROM scored s
  WHERE s.score > 0
  ORDER BY s.score DESC, s.id
  LIMIT greatest(least(max_results, 50), 0);
$$;

-- "Smells similar": 0.5 * accord cosine + 0.3 * note jaccard + 0.2 * family bonus,
-- keeping matches scoring above 0.12. Only fragrances sharing an accord, a note or the
-- family can clear that bar, so candidates are narrowed to those before scoring.
CREATE FUNCTION similar_fragrances(fragrance_slug TEXT, max_results INT DEFAULT 4)
RETURNS TABLE (slug TEXT, name TEXT, brand TEXT, score FLOAT8)
LANGUAGE sql STABLE SET search_path = public AS $$
  WITH t AS (
    SELECT id, family, subfamilies FROM fragrances WHERE fragrances.slug = fragrance_slug
  ),
  t_acc AS (
    SELECT a.accord_name, a.strength FROM fragrance_accords a JOIN t ON a.fragrance_id = t.id
  ),
  t_notes AS (
    SELECT DISTINCT lower(n.name) AS nm
    FROM fragrance_notes fn JOIN notes n ON n.id = fn.note_id JOIN t ON fn.fragrance_id = t.id
  ),
  cand AS (
    SELECT a.fragrance_id AS id FROM fragrance_accords a JOIN t_acc USING (accord_name)
    UNION
    SELECT fn.fragrance_id FROM fragrance_notes fn JOIN notes n ON n.id = fn.note_id
      WHERE lower(n.name) IN (SELECT nm FROM t_notes)
    UNION
    SELECT f.id FROM fragrances f JOIN t ON f.family = t.family
  ),
  acc AS (
    SELECT c.id,
           COALESCE(sum(a.strength * ta.strength), 0)::float8 AS dot,
           sum(a.strength * a.strength)::float8               AS mag
    FROM cand c
    JOIN fragrance_accords a ON a.fragrance_id = c.id
    LEFT JOIN t_acc ta ON ta.accord_name = a.accord_name
    GROUP BY c.id
  ),
  nts AS (
    SELECT c.id,
           count(DISTINCT lower(n.name))                                                AS cnt,
           count(DISTINCT lower(n.name)) FILTER (WHERE lower(n.name) IN (SELECT nm FROM t_notes)) AS inter
    FROM cand c
    JOIN fragrance_notes fn ON fn.fragrance_id = c.id
    JOIN notes n ON n.id = fn.note_id
    GROUP BY c.id
  ),
  scored AS (
    SELECT f.id, f.slug, f.name, b.name AS brand,
      CASE WHEN COALESCE(acc.mag, 0) = 0 OR (SELECT sum(strength * strength) FROM t_acc) IS NULL THEN 0
           ELSE acc.dot / (sqrt((SELECT sum(strength * strength) FROM t_acc)::float8) * sqrt(acc.mag))
      END * 0.5
      + CASE WHEN (SELECT count(*) FROM t_notes) + COALESCE(nts.cnt, 0) - COALESCE(nts.inter, 0) = 0 THEN 0
             ELSE COALESCE(nts.inter, 0)::float8
                  / ((SELECT count(*) FROM t_notes) + COALESCE(nts.cnt, 0) - COALESCE(nts.inter, 0))
        END * 0.3
      + CASE WHEN f.family = t.family THEN 1
             WHEN f.subfamilies && t.subfamilies THEN 0.5
             ELSE 0
        END * 0.2 AS score
    FROM cand c
    CROSS JOIN t
    JOIN fragrances f ON f.id = c.id
    JOIN brands b ON b.id = f.brand_id
    LEFT JOIN acc ON acc.id = c.id
    LEFT JOIN nts ON nts.id = c.id
    WHERE c.id <> t.id
  )
  SELECT s.slug, s.name, s.brand, s.score
  FROM scored s
  WHERE s.score > 0.12
  ORDER BY s.score DESC, s.id
  LIMIT greatest(least(max_results, 20), 0);
$$;

-- ---------- Row Level Security: public read-only ----------
-- Browser clients (publishable key) can read everything and write nothing.
-- Writes go through the SQL editor or a server holding the secret key.

ALTER TABLE brands              ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfumers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragrances          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragrance_notes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragrance_accords   ENABLE ROW LEVEL SECURITY;
ALTER TABLE fragrance_perfumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE retailer_links      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read" ON brands              FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON perfumers           FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON notes               FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON fragrances          FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON fragrance_notes     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON fragrance_accords   FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON fragrance_perfumers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read" ON retailer_links      FOR SELECT TO anon, authenticated USING (true);

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
GRANT SELECT ON brands, perfumers, notes, fragrances, fragrance_notes, fragrance_accords,
                fragrance_perfumers, retailer_links, fragrance_profiles
  TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION search_fragrances(TEXT, INT), similar_fragrances(TEXT, INT), set_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_fragrances(TEXT, INT), similar_fragrances(TEXT, INT) TO anon, authenticated;
