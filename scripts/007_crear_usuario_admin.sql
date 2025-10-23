-- Este script debe ejecutarse manualmente en Supabase Auth
-- O puedes crear el usuario desde el panel de Supabase

-- Nota: En Supabase, los usuarios se crean a través de la interfaz de Auth
-- o mediante la API de autenticación. Este es un recordatorio de las credenciales:

-- Email: admin@karate.com
-- Password: admin123

-- Para crear el usuario, puedes usar el siguiente código en tu aplicación
-- o desde la consola de Supabase:

/*
const { data, error } = await supabase.auth.signUp({
  email: 'admin@karate.com',
  password: 'admin123',
})
*/

-- Alternativamente, puedes crear el usuario desde el panel de Supabase:
-- 1. Ve a Authentication > Users
-- 2. Haz clic en "Add user"
-- 3. Ingresa el email: admin@karate.com
-- 4. Ingresa la contraseña: admin123
-- 5. Confirma el email automáticamente
