# Componentes Home Frontend

Esta carpeta contiene todos los componentes modulares utilizados en la página principal (`app/page.tsx`) de la aplicación de Karate.

## Componentes Disponibles

### 1. **Cabeza.tsx**
- Componente del header/navegación principal
- Ya existía previamente

### 2. **HeroBanner.tsx**
- Banner principal con métricas de la aplicación
- Muestra contadores de atletas, entrenadores y combates
- **Props**: `atletasCount`, `entrenadoresCount`, `combatesCount`

### 3. **CombatesEnVivo.tsx**
- Muestra combates que están actualmente en curso
- Se renderiza condicionalmente solo si hay combates en vivo
- **Props**: `combates` (array de combates en vivo)

### 4. **ResultadosRecientes.tsx**
- Muestra los resultados de combates finalizados
- Incluye lógica para determinar ganadores y estilos condicionales
- **Props**: `combates` (array de combates recientes)

### 5. **ProximosCombates.tsx**
- Muestra combates programados para el futuro
- Se renderiza condicionalmente solo si hay combates programados
- **Props**: `combates` (array de próximos combates)

### 6. **MejoresEntrenadores.tsx**
- Lista de entrenadores destacados con sus especialidades
- Muestra hasta 6 entrenadores con información de equipos
- **Props**: `entrenadores` (array de entrenadores)

### 7. **RankingsSection.tsx**
- Sección de doble columna con rankings de atletas y equipos
- Incluye tablas con posiciones, estadísticas y puntos
- **Props**: `rankingAtletas`, `rankingEquipos`

### 8. **ListaAtletas.tsx**
- Grid responsive de atletas activos
- Muestra información básica de cada atleta
- **Props**: `atletas` (array de atletas)

### 9. **Footer.tsx**
- Pie de página de la aplicación
- Componente estático sin props

## Beneficios de la Refactorización

### ✅ **Modularidad**
- Cada sección tiene su propio componente
- Fácil mantenimiento y testing individual

### ✅ **Reutilización**
- Los componentes pueden ser reutilizados en otras páginas
- Interfaces TypeScript bien definidas

### ✅ **Legibilidad**
- El archivo `page.tsx` es mucho más limpio y fácil de leer
- Cada componente tiene una responsabilidad específica

### ✅ **Mantenibilidad**
- Cambios en una sección no afectan otras
- Fácil localización de bugs y mejoras

### ✅ **Colaboración**
- Diferentes desarrolladores pueden trabajar en componentes separados
- Código bien documentado y estructurado

## Estructura del Archivo Principal

```tsx
export default async function HomePage() {
  // ... lógica de obtención de datos ...

  return (
    <div className="min-h-screen bg-linear-to-b from-background to-muted/20">
      <Cabeza />
      
      <main className="container mx-auto px-4 py-12 space-y-16">
        <HeroBanner {...props} />
        <CombatesEnVivo combates={combatesEnVivo || []} />
        <ResultadosRecientes combates={combatesRecientes || []} />
        <ProximosCombates combates={proximosCombates || []} />
        <MejoresEntrenadores entrenadores={entrenadores || []} />
        <RankingsSection {...rankingProps} />
        <ListaAtletas atletas={atletas || []} />
        <JuecesControlPanel />
      </main>
      
      <Footer />
    </div>
  )
}
```

## Tipos TypeScript

Cada componente incluye interfaces TypeScript bien definidas para sus props, asegurando type safety y mejor experiencia de desarrollo.

## Próximos Pasos

- Considerar agregar tests unitarios para cada componente
- Implementar Storybook para documentación visual
- Optimizar performance con React.memo si es necesario