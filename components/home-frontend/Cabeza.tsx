import React from 'react'
import { ThemeToggle } from '../theme-toggle'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { Button } from '../ui/button'


const cabeza = () => {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                {/* LOGO Y NOMBRE */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">空</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-orange-600">Asociación de Karate</h1>
                    <p className="text-sm  text-yellow-300">Excelencia en Artes Marciales</p>
                  </div>
                </div>
                
                {/* CONTROLES DEL HEADER */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Link href="/login">
                    <Button variant="outline">
                      <Shield className="mr-2 h-4 w-4" />
                      Acceso Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </header>
  )
}

export default cabeza
