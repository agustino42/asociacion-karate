import { createClient } from "@/lib/supabase/server"

export async function setupDatabase() {
  const supabase = await createClient()

  try {
    // Verificar si las tablas principales existen
    const { data: atletas, error: atletasError } = await supabase
      .from("atletas")
      .select("count", { count: "exact", head: true })

    const { data: entrenadores, error: entrenadoresError } = await supabase
      .from("entrenadores")
      .select("count", { count: "exact", head: true })

    const { data: jueces, error: juecesError } = await supabase
      .from("jueces")
      .select("count", { count: "exact", head: true })

    // Si hay errores, las tablas no existen
    if (atletasError || entrenadoresError || juecesError) {
      console.log("Algunas tablas no existen, creando...")
      await createTables()
      await insertSampleData()
    }

    return { success: true }
  } catch (error) {
    console.error("Error verificando base de datos:", error)
    return { success: false, error }
  }
}

async function createTables() {
  const supabase = await createClient()

  // Crear tabla de entrenadores
  await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })

  // Crear tabla de equipos
  await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS equipos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(255) NOT NULL,
        entrenador_id UUID REFERENCES entrenadores(id) ON DELETE SET NULL,
        descripcion TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Crear tabla de atletas
  await supabase.rpc('exec_sql', {
    sql: `
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
        equipo_id UUID REFERENCES equipos(id) ON DELETE SET NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })

  // Crear tabla de jueces
  await supabase.rpc('exec_sql', {
    sql: `
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
    `
  })
}

async function insertSampleData() {
  const supabase = await createClient()

  // Insertar entrenadores de ejemplo
  await supabase.from("entrenadores").insert([
    {
      nombre: "Carlos",
      apellido: "Rodríguez",
      cedula: "12345678",
      anos_experiencia: 15,
      especialidad: "Kumite",
      telefono: "555-0101",
      email: "carlos@karate.com"
    },
    {
      nombre: "María",
      apellido: "González",
      cedula: "23456789",
      anos_experiencia: 12,
      especialidad: "Kata",
      telefono: "555-0102",
      email: "maria@karate.com"
    },
    {
      nombre: "José",
      apellido: "Martínez",
      cedula: "34567890",
      anos_experiencia: 10,
      especialidad: "Kumite",
      telefono: "555-0103",
      email: "jose@karate.com"
    }
  ])

  // Obtener IDs de entrenadores
  const { data: entrenadoresData } = await supabase.from("entrenadores").select("id, cedula")
  const carlosId = entrenadoresData?.find(e => e.cedula === "12345678")?.id
  const mariaId = entrenadoresData?.find(e => e.cedula === "23456789")?.id
  const joseId = entrenadoresData?.find(e => e.cedula === "34567890")?.id

  // Insertar equipos
  await supabase.from("equipos").insert([
    {
      nombre: "Dragones Rojos",
      entrenador_id: carlosId,
      descripcion: "Equipo de élite especializado en kumite"
    },
    {
      nombre: "Tigres Blancos",
      entrenador_id: mariaId,
      descripcion: "Equipo enfocado en técnica y kata"
    },
    {
      nombre: "Águilas Negras",
      entrenador_id: joseId,
      descripcion: "Equipo de competición avanzada"
    }
  ])

  // Obtener IDs de equipos
  const { data: equiposData } = await supabase.from("equipos").select("id, nombre")
  const dragonesId = equiposData?.find(e => e.nombre === "Dragones Rojos")?.id
  const tigresId = equiposData?.find(e => e.nombre === "Tigres Blancos")?.id
  const aguilasId = equiposData?.find(e => e.nombre === "Águilas Negras")?.id

  // Insertar atletas
  await supabase.from("atletas").insert([
    {
      nombre: "Juan",
      apellido: "Pérez",
      cedula: "A1234567",
      fecha_nacimiento: "2000-05-15",
      peso: 75.5,
      categoria_peso: "Medio",
      cinturon: "Negro 1er Dan",
      equipo_id: dragonesId
    },
    {
      nombre: "Ana",
      apellido: "López",
      cedula: "A2345678",
      fecha_nacimiento: "2001-08-22",
      peso: 60.0,
      categoria_peso: "Ligero",
      cinturon: "Negro 2do Dan",
      equipo_id: dragonesId
    },
    {
      nombre: "Pedro",
      apellido: "Sánchez",
      cedula: "A3456789",
      fecha_nacimiento: "1999-03-10",
      peso: 80.0,
      categoria_peso: "Pesado",
      cinturon: "Negro 1er Dan",
      equipo_id: dragonesId
    },
    {
      nombre: "Laura",
      apellido: "Ramírez",
      cedula: "A4567890",
      fecha_nacimiento: "2002-11-05",
      peso: 58.0,
      categoria_peso: "Ligero",
      cinturon: "Marrón",
      equipo_id: tigresId
    },
    {
      nombre: "Miguel",
      apellido: "Torres",
      cedula: "A5678901",
      fecha_nacimiento: "2000-07-18",
      peso: 72.0,
      categoria_peso: "Medio",
      cinturon: "Negro 1er Dan",
      equipo_id: tigresId
    },
    {
      nombre: "Sofia",
      apellido: "Vargas",
      cedula: "A6789012",
      fecha_nacimiento: "2001-02-28",
      peso: 62.0,
      categoria_peso: "Ligero",
      cinturon: "Negro 1er Dan",
      equipo_id: tigresId
    }
  ])

  // Insertar jueces
  await supabase.from("jueces").insert([
    {
      nombre: "Fernando",
      apellido: "Ruiz",
      cedula: "J1234567",
      nivel_certificacion: "Internacional Nivel A",
      anos_experiencia: 20,
      telefono: "555-0201",
      email: "fernando@karate.com"
    },
    {
      nombre: "Patricia",
      apellido: "Morales",
      cedula: "J2345678",
      nivel_certificacion: "Nacional Nivel B",
      anos_experiencia: 15,
      telefono: "555-0202",
      email: "patricia@karate.com"
    },
    {
      nombre: "Alberto",
      apellido: "Jiménez",
      cedula: "J3456789",
      nivel_certificacion: "Regional Nivel C",
      anos_experiencia: 10,
      telefono: "555-0203",
      email: "alberto@karate.com"
    }
  ])
}