"use client";

// NO CAMBIAR NADA - Este código debe mantenerse exactamente como está
// Importaciones necesarias para el componente
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Plus,
  Minus,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useSound from "use-sound";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * PANEL DE CONTROL - EVALUACIÓN DE KATA
 * Sistema de evaluación compacto de Kata uno contra uno
 *
 * Estructura de la Competencia
 * Formato compacto: Es una forma rápida y sencilla de evaluar, comparada con el sistema de panel tradicional.
 *
 * Posiciones: Se presentan dos atletas simultáneamente: uno a la izquierda del juez (color azul) y otro a la derecha (color rojo).
 *
 * Ejecución: Cada uno realiza su presentación de Kata de manera individual.
 */

// Interfaz para datos de atleta
interface Atleta {
  nombre: string;
  equipo: string;
  ubicacion: string;
}

function PanelControlKata() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [montado, setMontado] = useState(false);
  const [sonidoActivado, setSonidoActivado] = useState(true);
  const [esLandscape, setEsLandscape] = useState(false);

  // Hooks para sonidos
  const [reproducirSonidoPunto] = useSound("/sounds/point.mp3", {
    volume: 0.5,
  });
  const [reproducirSonidoGanador] = useSound("/sounds/winner.mp3", {
    volume: 0.5,
  });

  useEffect(() => {
    setMontado(true);

    // Detectar orientación del dispositivo
    const detectarOrientacion = () => {
      const esHorizontal = window.innerWidth > window.innerHeight;
      setEsLandscape(esHorizontal);
    };

    detectarOrientacion();
    window.addEventListener("resize", detectarOrientacion);
    window.addEventListener("orientationchange", detectarOrientacion);

    return () => {
      window.removeEventListener("resize", detectarOrientacion);
      window.removeEventListener("orientationchange", detectarOrientacion);
    };
  }, []);

  // ========== ESTADOS DE ATLETAS ==========
  const [atleta1, setAtleta1] = useState<Atleta>({
    nombre: "ATLETA AZUL",
    equipo: "EQUIPO 1",
    ubicacion: "UBICACIÓN 1",
  });
  const [atleta2, setAtleta2] = useState<Atleta>({
    nombre: "ATLETA ROJO",
    equipo: "EQUIPO 2",
    ubicacion: "UBICACIÓN 2",
  });



  // ========== ESTADOS DE CRONÓMETRO ==========
  // Temporizador simple: 5 minutos (300 segundos)
  const [tiempo, setTiempo] = useState(300);
  const [estaEjecutandose, setEstaEjecutandose] = useState(false);
  const [combateIniciado, setCombateIniciado] = useState(false);

  // ========== ESTADOS DE GANADOR ==========
  const [mostrarDialogoGanador, setMostrarDialogoGanador] = useState(false);
  const [ganador, setGanador] = useState<{ atleta: number; razon: string }>({
    atleta: 0,
    razon: "",
  });
  const [tiempoFin, setTiempoFin] = useState<number | null>(null);

  // ========== ESTADOS PARA ALERTAS ==========
  const [panelDeshabilitado, setPanelDeshabilitado] = useState(false);

  // ========== SISTEMA HANTEI (VOTACIÓN DE JUECES) ==========
  // 5 jueces votan azul (1) o rojo (2) - cada juez vota solo una vez
  const [votosHantei, setVotosHantei] = useState<(1 | 2 | null)[]>([null, null, null, null, null]);
  const [mostrarVotacionHantei, setMostrarVotacionHantei] = useState(true);



  // ========== EFECTO: CRONÓMETRO CUENTA REGRESIVA ==========
  useEffect(() => {
    let intervalo: NodeJS.Timeout;
    if (estaEjecutandose && tiempo > 0) {
      intervalo = setInterval(() => {
        setTiempo((prev) => {
          if (prev <= 1) {
            setEstaEjecutandose(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [estaEjecutandose, tiempo]);

  // Calcular votos registrados
  const votosAzul = votosHantei.filter((v) => v === 1).length;
  const votosRojo = votosHantei.filter((v) => v === 2).length;
  const votosRegistrados = votosAzul + votosRojo;

  // ========== EFECTO: CUANDO TODOS LOS JUECES VOTAN, PAUSAR CRONÓMETRO ==========
  useEffect(() => {
    if (votosRegistrados === 5 && estaEjecutandose) {
      setEstaEjecutandose(false);
    }
  }, [votosRegistrados, estaEjecutandose]);





  const declararGanador = (atletaGanador: number, razon: string) => {
    setPanelDeshabilitado(true);
    setEstaEjecutandose(false);
    setGanador({ atleta: atletaGanador, razon });
    setTiempoFin(tiempo);
    if (sonidoActivado) {
      reproducirSonidoGanador();
    }
    setMostrarDialogoGanador(true);
  };

  const iniciarCombate = () => {
    setCombateIniciado(true);
    setEstaEjecutandose(true);
    setPanelDeshabilitado(false);
  };

  const pausarCombate = () => {
    setEstaEjecutandose(!estaEjecutandose);
  };





  const finalizarVotacionHantei = () => {
    const votosAzul = votosHantei.filter((v) => v === 1).length;
    const votosRojo = votosHantei.filter((v) => v === 2).length;

    if (votosAzul > votosRojo) {
      declararGanador(1, `Hantei ${votosAzul}-${votosRojo}`);
    } else if (votosRojo > votosAzul) {
      declararGanador(2, `Hantei ${votosRojo}-${votosAzul}`);
    } else {
      // Empate - necesita revisión
      declararGanador(0, "EMPATE - Revisión requerida");
    }
    // No ocultar la votación después de confirmar el ganador
  };

  const registrarVoto = (juez: number, voto: 1 | 2 | null) => {
    const nuevoVotos = [...votosHantei];
    nuevoVotos[juez] = voto;
    setVotosHantei(nuevoVotos);
  };



  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? "0" : ""}${segs}`;
  };

  if (!montado) return null;

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-2 md:p-4"
      >
        <div className="max-w-5xl mx-auto space-y-2">
          {/* Encabezado */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-center mb-2"
          >
            <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 mb-1">
              EVALUACIÓN DE KATA
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Sistema de Evaluación Compacto - Uno contra Uno
            </p>
          </motion.div>







        </div>

        {/* PANTALLA COMPLETA - VOTACIÓN HANTEI */}
        {mostrarVotacionHantei && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6"
          >
            <div className="max-w-5xl mx-auto space-y-4">
              {/* CRONÓMETRO Y CONTROLES */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="bg-gradient-to-b from-cyan-900/80 to-cyan-950/80 p-6 rounded-xl border-3 border-cyan-500 text-center shadow-2xl shadow-cyan-500/30"
              >
                <p className="text-cyan-300 text-xs md:text-sm font-bold mb-2 uppercase tracking-wider">Tiempo de Presentación</p>
                <p className="text-5xl md:text-6xl font-black text-cyan-400 font-mono drop-shadow-lg mb-4">
                  {formatearTiempo(tiempo)}
                </p>

                {/* Botones de Control */}
                <div className="flex gap-2 justify-center flex-wrap">
                  {!combateIniciado ? (
                    <Button
                      onClick={iniciarCombate}
                      className="bg-green-600 hover:bg-green-700 font-bold px-6 h-10"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      INICIAR
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={pausarCombate}
                        className="bg-yellow-600 hover:bg-yellow-700 font-bold px-6 h-10"
                      >
                        {estaEjecutandose ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            PAUSAR
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            REANUDAR
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setCombateIniciado(false);
                          setEstaEjecutandose(false);
                          setPanelDeshabilitado(false);
                          setTiempo(300);
                          setGanador({ atleta: 0, razon: "" });
                          setTiempoFin(null);
                          setVotosHantei([null, null, null, null, null]);
                        }}
                        variant="outline"
                        className="font-bold px-6 h-10"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        REINICIAR
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Encabezado */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500">
                  HANTEI
                </h1>
                <p className="text-slate-400 text-base md:text-lg font-bold mt-2">
                  VOTACIÓN DE 5 JUECES
                </p>
              </motion.div>

              {/* Info de Votos */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-slate-900/50 p-4 rounded-lg border border-yellow-500/50 text-center"
              >
                <p className="text-slate-300 text-sm font-bold mb-2">Votos Registrados</p>
                <p className="text-5xl font-black text-yellow-400">{votosRegistrados}/5</p>
              </motion.div>

              {/* Grid de Jueces - Horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((juez) => (
                  <motion.div
                    key={juez}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: juez * 0.05 }}
                    className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 hover:border-slate-600 text-center"
                  >
                    <div className="text-xs font-bold text-slate-300 mb-2">
                      JUEZ {juez + 1}
                    </div>
                    <div className="flex flex-col gap-1">
                      {/* Botón Azul */}
                      <motion.button
                        onClick={() =>
                          registrarVoto(
                            juez,
                            votosHantei[juez] === 1 ? null : 1
                          )
                        }
                        className={`px-3 py-2 rounded font-bold text-xs transition-all ${votosHantei[juez] === 1
                            ? "bg-blue-600 border-2 border-blue-300 text-white shadow-lg shadow-blue-500/50"
                            : "bg-blue-950/50 border-2 border-blue-500 text-blue-400 hover:bg-blue-900/50"
                          }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {votosHantei[juez] === 1 ? "✓" : "🚩"} AZUL
                      </motion.button>

                      {/* Botón Rojo */}
                      <motion.button
                        onClick={() =>
                          registrarVoto(
                            juez,
                            votosHantei[juez] === 2 ? null : 2
                          )
                        }
                        className={`px-3 py-2 rounded font-bold text-xs transition-all ${votosHantei[juez] === 2
                            ? "bg-red-600 border-2 border-red-300 text-white shadow-lg shadow-red-500/50"
                            : "bg-red-950/50 border-2 border-red-500 text-red-400 hover:bg-red-900/50"
                          }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {votosHantei[juez] === 2 ? "✓" : "🚩"} ROJO
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Resumen de Votos - Horizontal */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-slate-900/50 p-3 rounded-lg border"
                animate-border={{
                  borderColor:
                    votosAzul > votosRojo
                      ? "#3b82f6"
                      : votosRojo > votosAzul
                        ? "#dc2626"
                        : "#64748b",
                }}
              >
                <div className="flex justify-center items-center gap-8 text-center">
                  <div>
                    <div className="text-blue-400 font-bold text-sm mb-1">
                      ATLETA AZUL
                    </div>
                    <div className="text-4xl font-black text-blue-400">
                      {votosAzul}
                    </div>
                    <div className="text-xs text-blue-500 font-bold">
                      BANDERAS
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-400">VS</div>
                  <div>
                    <div className="text-red-400 font-bold text-sm mb-1">
                      ATLETA ROJO
                    </div>
                    <div className="text-4xl font-black text-red-400">
                      {votosRojo}
                    </div>
                    <div className="text-xs text-red-500 font-bold">
                      BANDERAS
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Botones de Acción */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-2"
              >
                {votosRegistrados === 5 ? (
                  <Button
                    onClick={finalizarVotacionHantei}
                    className="w-full bg-green-600 hover:bg-green-700 font-black h-12 text-base"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    CONFIRMAR GANADOR
                  </Button>
                ) : (
                  <div className="w-full bg-slate-700/50 text-slate-300 font-bold h-11 rounded-md flex items-center justify-center text-xs border border-slate-600">
                    {5 - votosRegistrados} juez{5 - votosRegistrados !== 1 ? "es" : ""} por votar
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Diálogo de Ganador */}
        <AnimatePresence>
          {mostrarDialogoGanador && (
            <Dialog open={mostrarDialogoGanador}>
              <DialogContent className="bg-black/95 border-2 border-yellow-500 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-center text-2xl font-black text-yellow-400">
                    RESULTADO
                  </DialogTitle>
                </DialogHeader>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="text-center py-8 space-y-6"
                >
                  <div>
                    <div className="text-5xl font-black text-yellow-400 mb-4">
                      {ganador.atleta === 1
                        ? atleta1.nombre
                        : atleta2.nombre}
                    </div>
                    <div
                      className={`text-2xl font-bold mb-2 ${ganador.atleta === 1
                          ? "text-blue-400"
                          : "text-red-400"
                        }`}
                    >
                      GANADOR
                    </div>
                    <div className="text-xl text-slate-300">
                      {ganador.razon}
                    </div>
                  </div>
                </motion.div>

                <div className="flex gap-2 justify-center mt-6">
                  <Button
                    onClick={() => {
                      setMostrarDialogoGanador(false);
                      setCombateIniciado(false);
                      setEstaEjecutandose(false);
                      setPanelDeshabilitado(false);
                      setTiempo(300); // 5 minutos
                      setGanador({ atleta: 0, razon: "" });
                      setTiempoFin(null);
                      setVotosHantei([null, null, null, null, null]);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 font-bold px-6"
                  >
                    NUEVA EVALUACIÓN
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
}

export default PanelControlKata;
