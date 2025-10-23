-- Tabla de Rankings de Atletas
CREATE TABLE IF NOT EXISTS rankings_atletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  puntos_totales INTEGER DEFAULT 0,
  victorias INTEGER DEFAULT 0,
  derrotas INTEGER DEFAULT 0,
  empates INTEGER DEFAULT 0,
  posicion INTEGER,
  categoria VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(atleta_id, categoria)
);

-- Tabla de Rankings de Equipos
CREATE TABLE IF NOT EXISTS rankings_equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  puntos_totales INTEGER DEFAULT 0,
  victorias INTEGER DEFAULT 0,
  derrotas INTEGER DEFAULT 0,
  empates INTEGER DEFAULT 0,
  posicion INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(equipo_id)
);

-- Índices para rankings
CREATE INDEX IF NOT EXISTS idx_ranking_atletas_puntos ON rankings_atletas(puntos_totales DESC);
CREATE INDEX IF NOT EXISTS idx_ranking_atletas_categoria ON rankings_atletas(categoria);
CREATE INDEX IF NOT EXISTS idx_ranking_equipos_puntos ON rankings_equipos(puntos_totales DESC);
