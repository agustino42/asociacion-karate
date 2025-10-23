-- Tabla de Combates Individuales (1v1)
CREATE TABLE IF NOT EXISTS combates_individuales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  atleta1_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  atleta2_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  ganador_id UUID REFERENCES atletas(id) ON DELETE SET NULL,
  juez_principal_id UUID REFERENCES jueces(id) ON DELETE SET NULL,
  puntos_atleta1 INTEGER DEFAULT 0,
  puntos_atleta2 INTEGER DEFAULT 0,
  categoria VARCHAR(100) NOT NULL,
  fecha_combate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duracion_minutos INTEGER DEFAULT 3,
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'programado', -- programado, en_curso, finalizado, cancelado
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Combates por Equipos (3v3)
CREATE TABLE IF NOT EXISTS combates_equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo1_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  equipo2_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
  equipo_ganador_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
  juez_principal_id UUID REFERENCES jueces(id) ON DELETE SET NULL,
  puntos_equipo1 INTEGER DEFAULT 0,
  puntos_equipo2 INTEGER DEFAULT 0,
  fecha_combate TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notas TEXT,
  estado VARCHAR(50) DEFAULT 'programado',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Enfrentamientos Individuales dentro de Combates por Equipos
CREATE TABLE IF NOT EXISTS enfrentamientos_equipo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combate_equipo_id UUID NOT NULL REFERENCES combates_equipos(id) ON DELETE CASCADE,
  atleta_equipo1_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  atleta_equipo2_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  ganador_id UUID REFERENCES atletas(id) ON DELETE SET NULL,
  puntos_atleta1 INTEGER DEFAULT 0,
  puntos_atleta2 INTEGER DEFAULT 0,
  faltas_atleta1 INTEGER DEFAULT 0,
  faltas_atleta2 INTEGER DEFAULT 0,
  orden_pelea INTEGER NOT NULL, -- 1, 2, o 3
  estado VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Faltas en Combates
CREATE TABLE IF NOT EXISTS faltas_combate (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combate_individual_id UUID REFERENCES combates_individuales(id) ON DELETE CASCADE,
  combate_equipo_id UUID REFERENCES combates_equipos(id) ON DELETE CASCADE,
  enfrentamiento_equipo_id UUID REFERENCES enfrentamientos_equipo(id) ON DELETE CASCADE,
  atleta_id UUID NOT NULL REFERENCES atletas(id) ON DELETE CASCADE,
  tipo_falta VARCHAR(50) NOT NULL, -- C1, C2, C3, Hansoku-make
  descripcion TEXT,
  tiempo_segundos INTEGER, -- segundo en que ocurrió la falta
  juez_id UUID REFERENCES jueces(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Jueces Asignados a Combates
CREATE TABLE IF NOT EXISTS jueces_combates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  combate_individual_id UUID REFERENCES combates_individuales(id) ON DELETE CASCADE,
  combate_equipo_id UUID REFERENCES combates_equipos(id) ON DELETE CASCADE,
  juez_id UUID NOT NULL REFERENCES jueces(id) ON DELETE CASCADE,
  rol VARCHAR(50) DEFAULT 'asistente', -- principal, asistente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para combates
CREATE INDEX IF NOT EXISTS idx_combates_ind_fecha ON combates_individuales(fecha_combate DESC);
CREATE INDEX IF NOT EXISTS idx_combates_ind_estado ON combates_individuales(estado);
CREATE INDEX IF NOT EXISTS idx_combates_eq_fecha ON combates_equipos(fecha_combate DESC);
CREATE INDEX IF NOT EXISTS idx_combates_eq_estado ON combates_equipos(estado);
CREATE INDEX IF NOT EXISTS idx_enfrentamientos_combate ON enfrentamientos_equipo(combate_equipo_id);
CREATE INDEX IF NOT EXISTS idx_faltas_combate_individual ON faltas_combate(combate_individual_id);
CREATE INDEX IF NOT EXISTS idx_faltas_combate_equipo ON faltas_combate(combate_equipo_id);
CREATE INDEX IF NOT EXISTS idx_faltas_enfrentamiento ON faltas_combate(enfrentamiento_equipo_id);
CREATE INDEX IF NOT EXISTS idx_faltas_atleta ON faltas_combate(atleta_id);
