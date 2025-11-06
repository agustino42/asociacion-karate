"use client"

import { Badge } from "@/components/ui/badge" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox" 
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group" 


function JuecesControlPanel() {
  return (
    <div className='max-7xl mx-auto space-y-6 p-4 bg-background text-foreground'>
     <div className='bg-card rounded-lg shadow-2xl overflow-hidden border'>
    {/*Encabezado del Panel de Control de Jueces */}
        <div className='bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
           <span className='font-bold text-blue-700'>(Tablero de jueces)</span>
          </div>
        </div>

        {/*Contenido*/}
        <div className='grid grid-cols-2 gap-0'>
           {/*Columna Izquierda Azul*/}
            <div className='bg-blue-600 text-white p-6 dark:bg-blue-800'>
              <div className='mb-4'>
                  <label className='text-sm font-semibold block mb-2'>Nombre del Competidor</label>
                  
              </div>
            </div>

             <div className="bg-red-600 text-white p-6 dark:bg-red-800">
                <div className="mb-4">
                   
                </div>
            </div>       
        </div>

     </div>
    </div>
  )
}

export default JuecesControlPanel
