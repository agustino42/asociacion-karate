// Sistema de simulación de combates de karate con reglas oficiales

export type TecnicaKarate = {
  nombre: string
  puntos: number // 1 = Yuko, 2 = Waza-ari, 3 = Ippon
  probabilidad: number
}

const TECNICAS: TecnicaKarate[] = [
  { nombre: "Yuko (Técnica básica)", puntos: 1, probabilidad: 0.5 },
  { nombre: "Waza-ari (Técnica media)", puntos: 2, probabilidad: 0.35 },
  { nombre: "Ippon (Técnica perfecta)", puntos: 3, probabilidad: 0.15 },
]

export type FaltaKarate = {
  tipo: string // C1, C2, C3, Hansoku-make
  descripcion: string
  penalizacion: number // puntos restados o agregados al oponente
  probabilidad: number
}

const FALTAS: FaltaKarate[] = [
  { tipo: "C1", descripcion: "Falta leve (advertencia)", penalizacion: 0, probabilidad: 0.6 },
  { tipo: "C2", descripcion: "Falta moderada (1 punto al oponente)", penalizacion: 1, probabilidad: 0.3 },
  { tipo: "C3", descripcion: "Falta grave (1 punto al oponente)", penalizacion: 1, probabilidad: 0.08 },
  { tipo: "Hansoku-make", descripcion: "Descalificación por conducta antideportiva", penalizacion: 2, probabilidad: 0.02 },
]

export type EventoCombate = {
  tiempo: number // segundos transcurridos
  atleta: 1 | 2
  tecnica?: string
  puntos?: number
  falta?: FaltaKarate
  tipo: 'tecnica' | 'falta'
}

export class SimuladorKarate {
  private eventos: EventoCombate[] = []
  private puntos1 = 0
  private puntos2 = 0
  private duracionSegundos: number

  constructor(duracionMinutos = 1) {
    this.duracionSegundos = duracionMinutos * 60
  }

  // Simula una técnica aleatoria basada en probabilidades
  private simularTecnica(): TecnicaKarate {
    const random = Math.random()
    let acumulado = 0

    for (const tecnica of TECNICAS) {
      acumulado += tecnica.probabilidad
      if (random <= acumulado) {
        return tecnica
      }
    }

    return TECNICAS[0] // fallback
  }

  // Simula una falta aleatoria basada en probabilidades
  private simularFalta(): FaltaKarate {
    const random = Math.random()
    let acumulado = 0

    for (const falta of FALTAS) {
      acumulado += falta.probabilidad
      if (random <= acumulado) {
        return falta
      }
    }

    return FALTAS[0] // fallback
  }

  // Simula un evento de combate (técnica o falta)
  simularEvento(tiempoActual: number): EventoCombate | null {
    // Probabilidad de que ocurra un evento en este segundo (ajustable)
    const probabilidadEvento = 0.12 // Reducido para incluir faltas

    if (Math.random() > probabilidadEvento) {
      return null
    }

    const atleta = Math.random() > 0.5 ? 1 : 2
    const esTecnica = Math.random() > 0.2 // 80% técnicas, 20% faltas

    if (esTecnica) {
      const tecnica = this.simularTecnica()

      const evento: EventoCombate = {
        tiempo: tiempoActual,
        atleta: atleta as 1 | 2,
        tecnica: tecnica.nombre,
        puntos: tecnica.puntos,
        tipo: 'tecnica'
      }

      // Actualizar puntos
      if (atleta === 1) {
        this.puntos1 += tecnica.puntos
      } else {
        this.puntos2 += tecnica.puntos
      }

      this.eventos.push(evento)
      return evento
    } else {
      const falta = this.simularFalta()

      const evento: EventoCombate = {
        tiempo: tiempoActual,
        atleta: atleta as 1 | 2,
        falta: falta,
        tipo: 'falta'
      }

      // Aplicar penalización
      if (atleta === 1) {
        this.puntos2 += falta.penalizacion // Penalización al oponente
      } else {
        this.puntos1 += falta.penalizacion // Penalización al oponente
      }

      this.eventos.push(evento)
      return evento
    }
  }

  // Verifica si el combate debe terminar por diferencia de puntos
  verificarFinPorDiferencia(): boolean {
    const diferencia = Math.abs(this.puntos1 - this.puntos2)
    return diferencia >= 8 // Regla: 8 puntos de diferencia termina el combate
  }

  getPuntos() {
    return { puntos1: this.puntos1, puntos2: this.puntos2 }
  }

  getEventos() {
    return this.eventos
  }

  getGanador(): 1 | 2 | null {
    if (this.puntos1 > this.puntos2) return 1
    if (this.puntos2 > this.puntos1) return 2
    return null
  }
}

// Función para generar sorteos de combates
export function generarSorteo(atletas: any[]): Array<[any, any]> {
  const shuffled = [...atletas].sort(() => Math.random() - 0.5)
  const parejas: Array<[any, any]> = []

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    parejas.push([shuffled[i], shuffled[i + 1]])
  }

  return parejas
}
