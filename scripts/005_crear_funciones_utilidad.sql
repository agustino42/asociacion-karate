-- Función para actualizar el ranking de un atleta después de un combate
CREATE OR REPLACE FUNCTION actualizar_ranking_atleta(
  p_atleta_id UUID,
  p_resultado VARCHAR, -- 'victoria', 'derrota', 'empate'
  p_puntos INTEGER
) RETURNS VOID AS $$
BEGIN
  IF p_resultado = 'victoria' THEN
    UPDATE rankings_atletas 
    SET 
      puntos_totales = puntos_totales + p_puntos,
      victorias = victorias + 1,
      updated_at = NOW()
    WHERE atleta_id = p_atleta_id;
  ELSIF p_resultado = 'derrota' THEN
    UPDATE rankings_atletas 
    SET 
      derrotas = derrotas + 1,
      updated_at = NOW()
    WHERE atleta_id = p_atleta_id;
  ELSIF p_resultado = 'empate' THEN
    UPDATE rankings_atletas 
    SET 
      puntos_totales = puntos_totales + (p_puntos / 2),
      empates = empates + 1,
      updated_at = NOW()
    WHERE atleta_id = p_atleta_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el ranking de un equipo
CREATE OR REPLACE FUNCTION actualizar_ranking_equipo(
  p_equipo_id UUID,
  p_resultado VARCHAR,
  p_puntos INTEGER
) RETURNS VOID AS $$
BEGIN
  IF p_resultado = 'victoria' THEN
    UPDATE rankings_equipos 
    SET 
      puntos_totales = puntos_totales + p_puntos,
      victorias = victorias + 1,
      updated_at = NOW()
    WHERE equipo_id = p_equipo_id;
  ELSIF p_resultado = 'derrota' THEN
    UPDATE rankings_equipos 
    SET 
      derrotas = derrotas + 1,
      updated_at = NOW()
    WHERE equipo_id = p_equipo_id;
  ELSIF p_resultado = 'empate' THEN
    UPDATE rankings_equipos 
    SET 
      puntos_totales = puntos_totales + (p_puntos / 2),
      empates = empates + 1,
      updated_at = NOW()
    WHERE equipo_id = p_equipo_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Función para recalcular posiciones en el ranking de atletas
CREATE OR REPLACE FUNCTION recalcular_posiciones_atletas() RETURNS VOID AS $$
BEGIN
  WITH ranked AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (PARTITION BY categoria ORDER BY puntos_totales DESC, victorias DESC) as nueva_posicion
    FROM rankings_atletas
  )
  UPDATE rankings_atletas r
  SET posicion = ranked.nueva_posicion
  FROM ranked
  WHERE r.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- Función para recalcular posiciones en el ranking de equipos
CREATE OR REPLACE FUNCTION recalcular_posiciones_equipos() RETURNS VOID AS $$
BEGIN
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (ORDER BY puntos_totales DESC, victorias DESC) as nueva_posicion
    FROM rankings_equipos
  )
  UPDATE rankings_equipos r
  SET posicion = ranked.nueva_posicion
  FROM ranked
  WHERE r.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- Función para registrar una falta en un combate
CREATE OR REPLACE FUNCTION registrar_falta(
  p_combate_individual_id UUID DEFAULT NULL,
  p_combate_equipo_id UUID DEFAULT NULL,
  p_enfrentamiento_equipo_id UUID DEFAULT NULL,
  p_atleta_id UUID,
  p_tipo_falta VARCHAR,
  p_descripcion TEXT DEFAULT NULL,
  p_tiempo_segundos INTEGER DEFAULT NULL,
  p_juez_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO faltas_combate (
    combate_individual_id,
    combate_equipo_id,
    enfrentamiento_equipo_id,
    atleta_id,
    tipo_falta,
    descripcion,
    tiempo_segundos,
    juez_id
  ) VALUES (
    p_combate_individual_id,
    p_combate_equipo_id,
    p_enfrentamiento_equipo_id,
    p_atleta_id,
    p_tipo_falta,
    p_descripcion,
    p_tiempo_segundos,
    p_juez_id
  );
END;
$$ LANGUAGE plpgsql;

-- Función para calcular penalización por faltas
CREATE OR REPLACE FUNCTION calcular_penalizacion_faltas(p_atleta_id UUID, p_combate_id UUID DEFAULT NULL) RETURNS INTEGER AS $$
DECLARE
  total_faltas INTEGER;
  penalizacion INTEGER := 0;
BEGIN
  -- Contar faltas del atleta en el combate específico o en general
  SELECT COUNT(*) INTO total_faltas
  FROM faltas_combate
  WHERE atleta_id = p_atleta_id
    AND (combate_individual_id = p_combate_id OR combate_equipo_id = p_combate_id OR p_combate_id IS NULL);

  -- Penalización según cantidad de faltas (reglas de karate)
  IF total_faltas >= 4 THEN
    penalizacion := 1; -- Hansoku-make (descalificación)
  ELSIF total_faltas = 3 THEN
    penalizacion := 1; -- C3 = 1 punto al oponente
  ELSIF total_faltas = 2 THEN
    penalizacion := 1; -- C2 = 1 punto al oponente
  ELSIF total_faltas = 1 THEN
    penalizacion := 0; -- C1 = advertencia
  END IF;

  RETURN penalizacion;
END;
$$ LANGUAGE plpgsql;
