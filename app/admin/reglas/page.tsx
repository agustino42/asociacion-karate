import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Trophy, Clock, Users, Target, Shield } from "lucide-react"

const Reglas = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Reglas Oficiales de Karate Competitivo</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Sistema de puntuación y reglas basadas en las normativas oficiales de la World Karate Federation (WKF)
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sistema de Puntuación */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-blue-600" />
              Sistema de Puntuación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-green-800 dark:text-green-200">Ippon (3 puntos)</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">Técnica perfecta, control total</p>
                </div>
                <Badge className="bg-green-600">3 pts</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Waza-ari (2 puntos)</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">Técnica buena, buen control</p>
                </div>
                <Badge className="bg-yellow-600">2 pts</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">Yuko (1 punto)</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400">Técnica básica, control mínimo</p>
                </div>
                <Badge className="bg-orange-600">1 pt</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Faltas */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Sistema de Faltas y Penalizaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                <div>
                  <h4 className="font-semibold">C1 - Falta Leve</h4>
                  <p className="text-sm text-muted-foreground">Advertencia verbal</p>
                </div>
                <Badge variant="outline">0 pts</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">C2 - Falta Moderada</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">1 punto al oponente</p>
                </div>
                <Badge className="bg-yellow-600">+1 pt oponente</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200">C3 - Falta Grave</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400">1 punto al oponente</p>
                </div>
                <Badge className="bg-orange-600">+1 pt oponente</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                <div>
                  <h4 className="font-semibold text-red-800 dark:text-red-200">Hansoku-make</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">Descalificación</p>
                </div>
                <Badge className="bg-red-600">Descalificado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reglas Generales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Reglas Generales del Combate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Duración del Combate</h4>
                  <p className="text-sm text-muted-foreground">
                    3 minutos para adultos, con posibilidad de prórroga en caso de empate.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-green-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Áreas Válidas</h4>
                  <p className="text-sm text-muted-foreground">
                    Cabeza, cuello, tronco, cara y brazos. Prohibido golpear piernas.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Combates por Equipos</h4>
                  <p className="text-sm text-muted-foreground">
                    3 atletas por equipo. Sistema de eliminación directa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Trophy className="h-5 w-5 text-yellow-600 mt-1" />
                <div>
                  <h4 className="font-semibold">Fin del Combate</h4>
                  <p className="text-sm text-muted-foreground">
                    Diferencia de 8 puntos o tiempo cumplido.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Reglas Específicas</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li>• No se permite golpear después de "Ippon"</li>
                <li>• Las técnicas deben ser controladas</li>
                <li>• Respeto mutuo entre competidores</li>
                <li>• Los jueces tienen autoridad absoluta</li>
              </ul>
              <ul className="space-y-2">
                <li>• Prohibido hablar durante el combate</li>
                <li>• No salir del área de combate</li>
                <li>• No fingir lesiones</li>
                <li>• Seguir instrucciones del árbitro</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sistema de Rankings */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-600" />
            Sistema de Rankings y Puntuación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200">Victoria</h4>
              <p className="text-2xl font-bold text-green-600">3 puntos</p>
              <p className="text-sm text-muted-foreground">al ranking</p>
            </div>

            <div className="text-center p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
              <h4 className="font-semibold">Empate</h4>
              <p className="text-2xl font-bold">1.5 puntos</p>
              <p className="text-sm text-muted-foreground">a cada uno</p>
            </div>

            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <h4 className="font-semibold text-red-800 dark:text-red-200">Derrota</h4>
              <p className="text-2xl font-bold text-red-600">0 puntos</p>
              <p className="text-sm text-muted-foreground">al ranking</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Sistema de Equipos</h4>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Los equipos ganan puntos basados en el rendimiento colectivo. Cada victoria individual contribuye
              al ranking del equipo, con bonificaciones por victorias consecutivas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Reglas
