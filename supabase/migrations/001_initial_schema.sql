-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Each petshop is owned by one Supabase Auth user (owner_id).
-- This is the root of the multi-tenant tree.
CREATE TABLE petshops (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome                TEXT NOT NULL,
  whatsapp_numero     TEXT,
  endereco            TEXT,
  gcal_access_token   TEXT,
  gcal_refresh_token  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clientes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petshop_id  UUID NOT NULL REFERENCES petshops(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  telefone    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (petshop_id, telefone)
);

CREATE TABLE pets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id  UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  nome        TEXT NOT NULL,
  especie     TEXT NOT NULL,
  raca        TEXT,
  -- porte uses a check so the app always stores consistent values
  porte       TEXT CHECK (porte IN ('pequeno', 'medio', 'grande')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE servicos_catalogo (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petshop_id    UUID NOT NULL REFERENCES petshops(id) ON DELETE CASCADE,
  tipo_servico  TEXT NOT NULL,
  preco_base    NUMERIC(10, 2) NOT NULL CHECK (preco_base >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE agendamentos (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  petshop_id        UUID NOT NULL REFERENCES petshops(id) ON DELETE CASCADE,
  cliente_id        UUID REFERENCES clientes(id) ON DELETE SET NULL,
  pet_id            UUID REFERENCES pets(id) ON DELETE SET NULL,
  tipo_servico      TEXT NOT NULL,
  -- status drives the Kanban columns
  status            TEXT NOT NULL DEFAULT 'agendado'
                      CHECK (status IN ('agendado', 'em_andamento', 'finalizado', 'cancelado')),
  data_hora_inicio  TIMESTAMPTZ NOT NULL,
  data_hora_fim     TIMESTAMPTZ,
  valor_cobrado     NUMERIC(10, 2) CHECK (valor_cobrado >= 0),
  gcal_event_id     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE petshops          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets              ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicos_catalogo ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos      ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTION
-- Resolves the logged-in user's petshop_id in a single call.
-- SECURITY DEFINER means it runs as the function owner (postgres),
-- bypassing RLS on petshops so we can look up the id safely.
-- ============================================================
CREATE OR REPLACE FUNCTION public.current_petshop_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM petshops WHERE owner_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- RLS POLICIES — petshops
-- Direct: compare owner_id to the JWT subject (auth.uid())
-- ============================================================
CREATE POLICY "petshops: owner can select"
  ON petshops FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "petshops: owner can insert"
  ON petshops FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "petshops: owner can update"
  ON petshops FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "petshops: owner can delete"
  ON petshops FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================
-- RLS POLICIES — clientes
-- Indirect: the row's petshop_id must equal this user's petshop.
-- ============================================================
CREATE POLICY "clientes: petshop owner select"
  ON clientes FOR SELECT
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "clientes: petshop owner insert"
  ON clientes FOR INSERT
  WITH CHECK (petshop_id = public.current_petshop_id());

CREATE POLICY "clientes: petshop owner update"
  ON clientes FOR UPDATE
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "clientes: petshop owner delete"
  ON clientes FOR DELETE
  USING (petshop_id = public.current_petshop_id());

-- ============================================================
-- RLS POLICIES — pets
-- Two-hop join: pets → clientes → petshop.
-- ============================================================
CREATE POLICY "pets: via cliente select"
  ON pets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = pets.cliente_id
        AND clientes.petshop_id = public.current_petshop_id()
    )
  );

CREATE POLICY "pets: via cliente insert"
  ON pets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = pets.cliente_id
        AND clientes.petshop_id = public.current_petshop_id()
    )
  );

CREATE POLICY "pets: via cliente update"
  ON pets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = pets.cliente_id
        AND clientes.petshop_id = public.current_petshop_id()
    )
  );

CREATE POLICY "pets: via cliente delete"
  ON pets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clientes
      WHERE clientes.id = pets.cliente_id
        AND clientes.petshop_id = public.current_petshop_id()
    )
  );

-- ============================================================
-- RLS POLICIES — servicos_catalogo
-- ============================================================
CREATE POLICY "servicos: petshop owner select"
  ON servicos_catalogo FOR SELECT
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "servicos: petshop owner insert"
  ON servicos_catalogo FOR INSERT
  WITH CHECK (petshop_id = public.current_petshop_id());

CREATE POLICY "servicos: petshop owner update"
  ON servicos_catalogo FOR UPDATE
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "servicos: petshop owner delete"
  ON servicos_catalogo FOR DELETE
  USING (petshop_id = public.current_petshop_id());

-- ============================================================
-- RLS POLICIES — agendamentos
-- ============================================================
CREATE POLICY "agendamentos: petshop owner select"
  ON agendamentos FOR SELECT
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "agendamentos: petshop owner insert"
  ON agendamentos FOR INSERT
  WITH CHECK (petshop_id = public.current_petshop_id());

CREATE POLICY "agendamentos: petshop owner update"
  ON agendamentos FOR UPDATE
  USING (petshop_id = public.current_petshop_id());

CREATE POLICY "agendamentos: petshop owner delete"
  ON agendamentos FOR DELETE
  USING (petshop_id = public.current_petshop_id());

-- ============================================================
-- INDEXES (performance for the most common query patterns)
-- ============================================================
CREATE INDEX idx_clientes_petshop     ON clientes(petshop_id);
CREATE INDEX idx_clientes_telefone    ON clientes(telefone);
CREATE INDEX idx_agendamentos_petshop ON agendamentos(petshop_id);
CREATE INDEX idx_agendamentos_status  ON agendamentos(petshop_id, status);
CREATE INDEX idx_agendamentos_data    ON agendamentos(petshop_id, data_hora_inicio);
