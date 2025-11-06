"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Swords, ArrowDown } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"

interface HeroBannerProps {
  atletasCount: number
  entrenadoresCount: number
  combatesCount: number
}

export default function HeroBanner({ atletasCount, entrenadoresCount, combatesCount }: HeroBannerProps) {
  const { theme } = useTheme()
  
  const scrollToNext = () => {
    const element = document.getElementById('combates-vivo')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images */}
      <div className={`absolute inset-0 grid grid-cols-2 md:grid-cols-4 ${theme === 'dark' ? 'opacity-10' : 'opacity-100'}`}>
        <div className="relative">
          <Image src="/karate1.png" alt="Karate" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src="/karate2.png" alt="Karate" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src="/karate1.png" alt="Karate" fill className="object-cover" />
        </div>
        <div className="relative">
          <Image src="/karate4.png" alt="Karate" fill className="object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-6">
            ASO-KARATE
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Promoviendo la disciplina, el respeto y la excelencia en el arte del Karate
          </p>
        </motion.div>
        
        {/* MÉTRICAS PRINCIPALES */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-6 pt-8"
        >
          <Card className="w-40 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-blue-600" />
              <p className="text-3xl font-bold">{atletasCount}</p>
              <p className="text-sm text-muted-foreground">Atletas</p>
            </CardContent>
          </Card>
          <Card className="w-40 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Award className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <p className="text-3xl font-bold">{entrenadoresCount}</p>
              <p className="text-sm text-muted-foreground">Entrenadores</p>
            </CardContent>
          </Card>
          <Card className="w-40 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6 text-center">
              <Swords className="h-10 w-10 mx-auto mb-3 text-red-600" />
              <p className="text-3xl font-bold">{combatesCount}</p>
              <p className="text-sm text-muted-foreground">Combates</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="pt-8"
        >
          <Button 
            onClick={scrollToNext}
            size="lg" 
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            Explorar <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  )
}