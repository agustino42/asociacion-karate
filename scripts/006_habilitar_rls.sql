-- Habilitar Row Level Security en todas las tablas
ALTER TABLE atletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrenadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE jueces ENABLE ROW LEVEL SECURITY;
ALTER TABLE combates_individuales ENABLE ROW LEVEL SECURITY;
ALTER TABLE combates_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE enfrentamientos_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE jueces_combates ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings_atletas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rankings_equipos ENABLE ROW LEVEL SECURITY;

-- Políticas para lectura pública (todos pueden ver)
CREATE POLICY "Lectura pública atletas" ON atletas FOR SELECT USING (true);
CREATE POLICY "Lectura pública entrenadores" ON entrenadores FOR SELECT USING (true);
CREATE POLICY "Lectura pública equipos" ON equipos FOR SELECT USING (true);
CREATE POLICY "Lectura pública jueces" ON jueces FOR SELECT USING (true);
CREATE POLICY "Lectura pública combates individuales" ON combates_individuales FOR SELECT USING (true);
CREATE POLICY "Lectura pública combates equipos" ON combates_equipos FOR SELECT USING (true);
CREATE POLICY "Lectura pública enfrentamientos" ON enfrentamientos_equipo FOR SELECT USING (true);
CREATE POLICY "Lectura pública jueces combates" ON jueces_combates FOR SELECT USING (true);
CREATE POLICY "Lectura pública rankings atletas" ON rankings_atletas FOR SELECT USING (true);
CREATE POLICY "Lectura pública rankings equipos" ON rankings_equipos FOR SELECT USING (true);

-- Políticas para escritura (solo usuarios autenticados - administradores)
CREATE POLICY "Admin puede insertar atletas" ON atletas FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar atletas" ON atletas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar atletas" ON atletas FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar entrenadores" ON entrenadores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar entrenadores" ON entrenadores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar entrenadores" ON entrenadores FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar equipos" ON equipos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar equipos" ON equipos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar equipos" ON equipos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar jueces" ON jueces FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar jueces" ON jueces FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar jueces" ON jueces FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar combates individuales" ON combates_individuales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar combates individuales" ON combates_individuales FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar combates individuales" ON combates_individuales FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar combates equipos" ON combates_equipos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar combates equipos" ON combates_equipos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar combates equipos" ON combates_equipos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar enfrentamientos" ON enfrentamientos_equipo FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar enfrentamientos" ON enfrentamientos_equipo FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar enfrentamientos" ON enfrentamientos_equipo FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede insertar jueces combates" ON jueces_combates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar jueces combates" ON jueces_combates FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede eliminar jueces combates" ON jueces_combates FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin puede actualizar rankings atletas" ON rankings_atletas FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin puede actualizar rankings equipos" ON rankings_equipos FOR UPDATE USING (auth.role() = 'authenticated');
