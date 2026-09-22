-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE concepts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  category    TEXT        NOT NULL CHECK (category IN ('Psychological','Philosophical','Experiential','Relational','Medicine')),
  description TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pitches (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id            UUID        REFERENCES concepts(id) ON DELETE SET NULL,
  title                 TEXT        NOT NULL,
  mundane_moment        TEXT        NOT NULL,
  psychological_reframe TEXT        NOT NULL,
  visual_metaphor       TEXT        NOT NULL,
  status                TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE scripts (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_id        UUID        REFERENCES pitches(id) ON DELETE SET NULL,
  version         INTEGER     NOT NULL DEFAULT 1,
  opening_shot    TEXT,
  visual_sequence TEXT,
  voiceover_line  TEXT,
  closing_shot    TEXT,
  sound_design    TEXT,
  cherry_on_top   TEXT,
  moral           TEXT,
  themes          TEXT[]      NOT NULL DEFAULT '{}',
  shot_analysis   JSONB       NOT NULL DEFAULT '{"shots":[]}',
  status          TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','final')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE script_feedback (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id        UUID        NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  version          INTEGER     NOT NULL,
  content_snapshot JSONB       NOT NULL,
  feedback_text    TEXT        NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE videos (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  script_id            UUID        REFERENCES scripts(id) ON DELETE SET NULL,
  title                TEXT        NOT NULL,
  platform             TEXT        NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram','tiktok','youtube','other')),
  published_at         TIMESTAMPTZ,
  views                INTEGER     NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes                INTEGER     NOT NULL DEFAULT 0 CHECK (likes >= 0),
  shares               INTEGER     NOT NULL DEFAULT 0 CHECK (shares >= 0),
  comments             INTEGER     NOT NULL DEFAULT 0 CHECK (comments >= 0),
  saves                INTEGER     NOT NULL DEFAULT 0 CHECK (saves >= 0),
  watch_time_seconds   INTEGER     NOT NULL DEFAULT 0 CHECK (watch_time_seconds >= 0),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE analytics_cache (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_type TEXT        NOT NULL CHECK (analysis_type IN ('themes','viral','shots','overlap')),
  result        JSONB       NOT NULL,
  generated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);

-- ============================================================
-- INDICES
-- ============================================================

CREATE INDEX idx_pitches_status       ON pitches(status);
CREATE INDEX idx_pitches_concept_id   ON pitches(concept_id);
CREATE INDEX idx_scripts_pitch_id     ON scripts(pitch_id);
CREATE INDEX idx_scripts_version      ON scripts(pitch_id, version);
CREATE INDEX idx_script_feedback_script ON script_feedback(script_id);
CREATE INDEX idx_videos_published_at  ON videos(published_at DESC);
CREATE INDEX idx_videos_platform      ON videos(platform);
CREATE INDEX idx_analytics_type_exp   ON analytics_cache(analysis_type, expires_at);
CREATE INDEX idx_concepts_category    ON concepts(category);

-- ============================================================
-- updated_at TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to every table that has updated_at
CREATE TRIGGER trg_concepts_updated_at
  BEFORE UPDATE ON concepts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_pitches_updated_at
  BEFORE UPDATE ON pitches
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_scripts_updated_at
  BEFORE UPDATE ON scripts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED: 47 concepts
-- ============================================================

INSERT INTO concepts (name, category) VALUES
  -- Psychological (12)
  ('Sonder',               'Psychological'),
  ('Spotlight effect',     'Psychological'),
  ('Hedonic adaptation',   'Psychological'),
  ('Learned helplessness', 'Psychological'),
  ('Cognitive dissonance', 'Psychological'),
  ('Emotional contagion',  'Psychological'),
  ('Peak-end rule',        'Psychological'),
  ('Bystander effect',     'Psychological'),
  ('Loss aversion',        'Psychological'),
  ('Confirmation bias',    'Psychological'),
  ('Decision fatigue',     'Psychological'),
  ('Impostor syndrome',    'Psychological'),

  -- Philosophical (13)
  ('Liminal',          'Philosophical'),
  ('Anemoia',          'Philosophical'),
  ('Kenopsia',         'Philosophical'),
  ('Exulansis',        'Philosophical'),
  ('Monachopsis',      'Philosophical'),
  ('Vellichor',        'Philosophical'),
  ('Wabi-sabi',        'Philosophical'),
  ('Mono no aware',    'Philosophical'),
  ('Hiraeth',          'Philosophical'),
  ('Apophenia',        'Philosophical'),
  ('Kairos',           'Philosophical'),
  ('Lethe',            'Philosophical'),
  ('Ruinenlust',       'Philosophical'),

  -- Experiential (10)
  ('Chrysalism',        'Experiential'),
  ('Compression',       'Experiential'),
  ('Residue',           'Experiential'),
  ('Threshold moment',  'Experiential'),
  ('The 3am feeling',   'Experiential'),
  ('Dead reckoning',    'Experiential'),
  ('The witness',       'Experiential'),
  ('Borrowed time',     'Experiential'),
  ('Soft apocalypse',   'Experiential'),
  ('Embodied cognition','Experiential'),

  -- Relational (6)
  ('In-yun',                    'Relational'),
  ('The third place',           'Relational'),
  ('Phantom relationship',      'Relational'),
  ('Belonging vs. fitting in',  'Relational'),
  ('Mirror neurons',            'Relational'),
  ('Social comparison',         'Relational'),

  -- Medicine (6)
  ('Placebo',         'Medicine'),
  ('Anamnesis',       'Medicine'),
  ('Triage',          'Medicine'),
  ('Nosocomial',      'Medicine'),
  ('Pain asymbolia',  'Medicine'),
  ('Homeostasis',     'Medicine');

