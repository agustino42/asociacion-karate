-- Tabla de Atletas
CREATE TABLE IF NOT EXISTS atletas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  peso DECIMAL(5,2),
  categoria_peso VARCHAR(50),
  cinturon VARCHAR(50) NOT NULL,
  foto_url TEXT,
  equipo_id UUID,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Entrenadores
CREATE TABLE IF NOT EXISTS entrenadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  anos_experiencia INTEGER NOT NULL,
  especialidad VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(255),
  foto_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Equipos
CREATE TABLE IF NOT EXISTS equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  entrenador_id UUID REFERENCES entrenadores(id) ON DELETE SET NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Jueces
CREATE TABLE IF NOT EXISTS jueces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  cedula VARCHAR(20) UNIQUE NOT NULL,
  nivel_certificacion VARCHAR(100) NOT NULL,
  anos_experiencia INTEGER NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(255),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar foreign key de equipo a atletas
ALTER TABLE atletas 
ADD CONSTRAINT fk_atletas_equipo 
FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE SET NULL;

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_atletas_equipo ON atletas(equipo_id);
CREATE INDEX IF NOT EXISTS idx_atletas_activo ON atletas(activo);
CREATE INDEX IF NOT EXISTS idx_entrenadores_activo ON entrenadores(activo);
CREATE INDEX IF NOT EXISTS idx_equipos_entrenador ON equipos(entrenador_id);
