-- Insertar entrenadores de ejemplo
INSERT INTO entrenadores (nombre, apellido, cedula, anos_experiencia, especialidad, telefono, email) VALUES
('Carlos', 'Rodríguez', '12345678', 15, 'Kumite', '555-0101', 'carlos@karate.com'),
('María', 'González', '23456789', 12, 'Kata', '555-0102', 'maria@karate.com'),
('José', 'Martínez', '34567890', 10, 'Kumite', '555-0103', 'jose@karate.com');

-- Insertar equipos
INSERT INTO equipos (nombre, entrenador_id, descripcion) VALUES
('Dragones Rojos', (SELECT id FROM entrenadores WHERE cedula = '12345678'), 'Equipo de élite especializado en kumite'),
('Tigres Blancos', (SELECT id FROM entrenadores WHERE cedula = '23456789'), 'Equipo enfocado en técnica y kata'),
('Águilas Negras', (SELECT id FROM entrenadores WHERE cedula = '34567890'), 'Equipo de competición avanzada');

-- Insertar atletas de ejemplo
INSERT INTO atletas (nombre, apellido, cedula, fecha_nacimiento, peso, categoria_peso, cinturon, equipo_id) VALUES
('Juan', 'Pérez', 'A1234567', '2000-05-15', 75.5, 'Medio', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Dragones Rojos')),
('Ana', 'López', 'A2345678', '2001-08-22', 60.0, 'Ligero', 'Negro 2do Dan', (SELECT id FROM equipos WHERE nombre = 'Dragones Rojos')),
('Pedro', 'Sánchez', 'A3456789', '1999-03-10', 80.0, 'Pesado', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Dragones Rojos')),
('Laura', 'Ramírez', 'A4567890', '2002-11-05', 58.0, 'Ligero', 'Marrón', (SELECT id FROM equipos WHERE nombre = 'Tigres Blancos')),
('Miguel', 'Torres', 'A5678901', '2000-07-18', 72.0, 'Medio', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Tigres Blancos')),
('Sofia', 'Vargas', 'A6789012', '2001-02-28', 62.0, 'Ligero', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Tigres Blancos')),
('Diego', 'Castro', 'A7890123', '1998-12-12', 78.0, 'Medio', 'Negro 2do Dan', (SELECT id FROM equipos WHERE nombre = 'Águilas Negras')),
('Carmen', 'Flores', 'A8901234', '2000-09-30', 65.0, 'Medio', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Águilas Negras')),
('Roberto', 'Mendoza', 'A9012345', '1999-06-25', 82.0, 'Pesado', 'Negro 1er Dan', (SELECT id FROM equipos WHERE nombre = 'Águilas Negras'));

-- Insertar jueces de ejemplo
INSERT INTO jueces (nombre, apellido, cedula, nivel_certificacion, anos_experiencia, telefono, email) VALUES
('Fernando', 'Ruiz', 'J1234567', 'Internacional Nivel A', 20, '555-0201', 'fernando@karate.com'),
('Patricia', 'Morales', 'J2345678', 'Nacional Nivel B', 15, '555-0202', 'patricia@karate.com'),
('Alberto', 'Jiménez', 'J3456789', 'Regional Nivel C', 10, '555-0203', 'alberto@karate.com');

-- Inicializar rankings para todos los atletas
INSERT INTO rankings_atletas (atleta_id, categoria, puntos_totales, victorias, derrotas, empates)
SELECT id, categoria_peso, 0, 0, 0, 0 FROM atletas;

-- Inicializar rankings para todos los equipos
INSERT INTO rankings_equipos (equipo_id, puntos_totales, victorias, derrotas, empates)
SELECT id, 0, 0, 0, 0 FROM equipos;
