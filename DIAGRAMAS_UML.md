# Diagramas UML - Sistema de Gestión de Karate

## 📋 Descripción del Sistema

Sistema web integral de gestión para asociaciones de karate .. sub proyecto desarrollo de aplicaciones 2 .. profesor Franklin españa.

### Stack Tecnológico
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Real-time + Auth)
- **Despliegue**: Vercel con Edge Network global

---

## 1. 📐 Diagrama de Clases

### 🎯 Entidades Principales del Dominio

```mermaid
classDiagram
    class Administrador {
        <<administrador>>
        -UUID id
        -string nombre
        -string apellido
        -string cedula
        -string email
        -string telefono
        -boolean activo
        -DateTime created_at
        -DateTime updated_at
        +validarDatos() boolean
        +activar() void
        +desactivar() void
    }

    class Atleta {
        -Date fecha_nacimiento
        -decimal peso
        -string categoria_peso
        -string cinturon
        -string foto_url
        -UUID equipo_id
        +calcularEdad() int
        +validarPeso() boolean
        +actualizarCategoria() void
    }

    class Entrenador {
        -int anos_experiencia
        -string especialidad
        -string certificaciones
        +validarExperiencia() boolean
        +obtenerEquipos() Equipo[]
    }

    class Juez {
        -string nivel_certificacion
        -int anos_experiencia
        -boolean disponible
        +validarCertificacion() boolean
        +puedeArbitrar(combate) boolean
    }

    class Equipo {
        -string nombre
        -string descripcion
        -string logo_url
        -UUID entrenador_id
        +contarMiembros() int
        +obtenerAtletas() Atleta[]
        +calcularPuntaje() decimal
    }

    class Combate {
        <<combates>>
        -UUID id
        -string estado
        -UUID juez_id
        -int puntos_equipo1
        -int puntos_equipo2
        -DateTime fecha_inicio
        -DateTime fecha_fin
        -DateTime created_at
        +iniciar() boolean
        +finalizar() void
        +validarEstado() boolean
    }

    class CombateIndividual {
        -UUID atleta1_id
        -UUID atleta2_id
        -int puntos_atleta1
        -int puntos_atleta2
        -UUID ganador_id
        +determinarGanador() UUID
        +simularRonda() void
    }

    class CombateEquipo {
        -UUID equipo1_id
        -UUID equipo2_id
        -UUID ganador_id
        +calcularPuntosEquipo() int[]
        +simularCombate() void
    }

    class Torneo {
        -string nombre
        -string descripcion
        -DateTime fecha_inicio
        -DateTime fecha_fin
        -string estado
        +crearRondas() void
        +avanzarTorneo() void
        +obtenerGanador() UUID
    }

    Usuario <|-- Atleta
    Usuario <|-- Entrenador
    Usuario <|-- Juez
    Entrenador --> Equipo
    Equipo --> Atleta
    Combate <|-- CombateIndividual
    Combate <|-- CombateEquipo
    Juez --> Combate
    Atleta --> CombateIndividual
    Equipo --> CombateEquipo
    Torneo --> Combate
```

### 🔌 Capa de Acceso a Datos y Servicios

```mermaid
classDiagram
    class SupabaseClient {
        -string url
        -string anonKey
        -PostgrestClient rest
        -RealtimeClient realtime
        +createBrowserClient() SupabaseClient
        +createServerClient() SupabaseClient
        +from(table) PostgrestQueryBuilder
        +auth() GoTrueClient
        +storage() StorageClient
    }

    class AtletaService {
        -SupabaseClient client
        +obtenerTodos() Promise~Atleta[]~
        +obtenerPorId(id) Promise~Atleta~
        +crear(atleta) Promise~Atleta~
        +actualizar(id, datos) Promise~boolean~
        +eliminar(id) Promise~boolean~
        +buscarPorCategoria(categoria) Promise~Atleta[]~
    }

    class CombateService {
        -SupabaseClient client
        +crearCombateIndividual(datos) Promise~CombateIndividual~
        +simularCombate(id) Promise~void~
        +obtenerCombatesActivos() Promise~CombateIndividual[]~
        +finalizarCombate(id) Promise~boolean~
    }

    class RealtimeService {
        -SupabaseClient client
        -RealtimeChannel channel
        +suscribirCombates(callback) void
        +enviarActualizacion(evento) void
        +desconectar() void
    }

    SupabaseClient --o AtletaService
    SupabaseClient --o CombateService
    SupabaseClient --o RealtimeService
```

---

## 2. 🔄 Diagrama de Actividades

### ⚔️ Proceso de Gestión de Combate Individual

```mermaid
flowchart TD
    A[Iniciar Sistema] --> B[Autenticar Usuario]
    B --> C{Credenciales Válidas?}
    C -->|No| D[Mostrar Error]
    D --> B
    C -->|Sí| E[Panel Administración]
    E --> F[Módulo Combates]
    F --> G[Crear Nuevo Combate]
    G --> H[Seleccionar Atletas]
    H --> I[Validar Categorías]
    I --> J{Categorías Compatibles?}
    J -->|No| K[Mostrar Advertencia]
    K --> L{Forzar Combate?}
    L -->|No| H
    L -->|Sí| M[Seleccionar Juez]
    J -->|Sí| M
    M --> N[Configurar Combate]
    N --> O[Validar Configuración]
    O --> P{Configuración Válida?}
    P -->|No| Q[Corregir Errores]
    Q --> N
    P -->|Sí| R[Guardar en BD]
    R --> S{Guardado Exitoso?}
    S -->|No| T[Error BD]
    T --> G
    S -->|Sí| U[Iniciar Simulador]
    U --> V[Iniciar Simulación]
    V --> W[Bucle Simulación]
    W --> X[Generar Evento]
    X --> Y{Tipo Evento?}
    Y -->|Golpe| Z[Sumar Puntos]
    Y -->|Bloqueo| AA[Cambiar Turno]
    Y -->|Técnica| BB[Puntos Dobles]
    Z --> CC[Transmitir]
    BB --> CC
    AA --> DD[Esperar]
    CC --> EE[Actualizar UI]
    EE --> FF{Condición Victoria?}
    FF -->|No| GG{Tiempo Agotado?}
    GG -->|No| DD
    DD --> W
    GG -->|Sí| HH[Comparar Puntos]
    HH --> II{Empate?}
    II -->|Sí| JJ[Ronda Extra]
    JJ --> W
    FF -->|Sí| KK[Determinar Ganador]
    II -->|No| KK
    KK --> LL[Finalizar Combate]
    LL --> MM[Guardar Resultados]
    MM --> NN[Actualizar Stats]
    NN --> OO[Notificar]
    OO --> PP[Proceso Completado]
```

### 📝 Proceso de Registro de Atleta

```mermaid
flowchart TD
    A[Registro Atleta] --> B[Abrir Formulario]
    B --> C[Ingresar Datos]
    C --> D[Validar Cédula]
    D --> E{Cédula Disponible?}
    E -->|No| F[Error Cédula]
    F --> C
    E -->|Sí| G[Datos Físicos]
    G --> H[Calcular Categoría]
    H --> I{Categoría Válida?}
    I -->|No| J[Sugerir Categoría]
    J --> G
    I -->|Sí| K[Datos Equipo]
    K --> L[Validación Completa]
    L --> M{Todos Campos Válidos?}
    M -->|No| N[Resaltar Errores]
    N --> O[Enfocar Campo]
    O --> C
    M -->|Sí| P[Guardar BD]
    P --> Q{Guardado Exitoso?}
    Q -->|No| R[Error Conexión]
    R --> S{Reintentar?}
    S -->|Sí| P
    S -->|No| T[Cancelar]
    Q -->|Sí| U[Actualizar Cache]
    U --> V[Mostrar Confirmación]
    V --> W[Redirigir Lista]
    W --> X[Resaltar Nuevo]
    X --> Y[Registro Completado]
```

---

## 3. 🎭 Diagrama de Casos de Uso

```mermaid
flowchart TB
    subgraph Actores [ACTORES]
        Admin[Administrador]
        Entrenador[Entrenador]
        Sistema[Sistema]
        Juez[Juez]
        Atleta[Atleta]
    end

    Espectador[Espectador]

    subgraph SistemaPrincipal [MÓDULOS PRINCIPALES]
        subgraph GestionEntidades [ENTIDADES]
            UC1[Gestionar Atletas]
            UC2[Gestionar Entrenadores]
            UC3[Gestionar Jueces]
            UC4[Gestionar Equipos]
        end

        subgraph GestionCombates [COMBATES]
            UC5[Combate Individual]
            UC6[Combate Equipos]
            UC7[Simular Combates]
            UC8[Control Simulación]
        end

        subgraph GestionTorneos [TORNEOS]
            UC9[Organizar Torneo]
            UC10[Generar Brackets]
            UC11[Gestionar Rondas]
            UC12[Proclamar Ganadores]
        end

        subgraph Visualizacion [VISUALIZACIÓN]
            UC13[Ver Rankings]
            UC14[Ver Estadísticas]
            UC15[Mostrar Victorias]
        end
    end

    Admin --> UC1 & UC2 & UC3 & UC4
    Admin --> UC5 & UC6 & UC7
    Admin --> UC9 & UC10
    Entrenador --> UC1 & UC4
    Entrenador --> UC13 & UC14 & UC15
    Sistema --> UC7
    Juez --> UC5 & UC6
    Atleta --> UC13 & UC14
    Espectador --> UC13 & UC14 & UC15 & UC7

    UC5 --> UC7
    UC6 --> UC7
    UC7 --> UC8
    UC9 --> UC10 & UC11 & UC12
    UC10 --> UC11
    UC11 --> UC12
```

---

## 4. 📦 Diagrama de Despliegue

```mermaid
flowchart TB
    subgraph ClientLayer [CLIENTE]
        Browser[Navegador Web]
        Mobile[Dispositivo Móvil]
        Tablet[Tablet]
    end
    
    subgraph NetworkLayer [RED]
        CDN[Vercel Edge Network]
    end
    
    subgraph AppLayer [APLICACIÓN]
        NextJS[Next.js 15 Server]
        API[API Routes]
    end
    
    subgraph DataLayer [DATOS]
        PostgreSQL[PostgreSQL]
        Realtime[Realtime Engine]
        Storage[Object Storage]
    end
    
    subgraph Services [SERVICIOS]
        Auth[Supabase Auth]
        Analytics[Vercel Analytics]
    end
    
    Browser --> CDN
    Mobile --> CDN
    Tablet --> CDN
    CDN --> NextJS
    CDN --> API
    API --> PostgreSQL
    API --> Realtime
    NextJS --> Storage
    NextJS --> Auth
    NextJS --> Analytics
    Browser --> Realtime
```

---

## 🛠️ Tecnologías Utilizadas

### 🎨 Frontend
- Next.js 15, React 19, TypeScript
- Tailwind CSS, Radix UI
- Framer Motion, Lucide React

### ⚙️ Backend
- Supabase (PostgreSQL + Auth)
- Server Actions de Next.js

### 🚀 Despliegue
- Vercel para hosting
- Git para control de versiones

---

## ✨ Características

### Funcionalidades Principales
✅ Gestión completa de atletas y equipos  
✅ Combates individuales y por equipos  
✅ Simulador en tiempo real  
✅ Rankings y estadísticas  
✅ Panel administrativo completo  

### Características Técnicas
✅ Server-Side Rendering  
✅ Real-time updates  
✅ Type-safe con TypeScript  
✅ Responsive design  

---

*© 2025 Sistema de Gestión de Karate - Ingeniería en Informática*
