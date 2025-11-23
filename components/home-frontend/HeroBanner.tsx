"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Award, Swords, ArrowDown, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { useTheme } from "next-themes"
import { HTMLAttributes } from "react"

interface MetricCardProps extends HTMLAttributes<HTMLDivElement> {
  count: number | string
  label: string
  Icon: LucideIcon
  iconColor: string
}

const MetricCard = ({ count, label, Icon, iconColor, ...props }: MetricCardProps) => {
  return (
    <div 
      className={`
        relative w-[150px] h-[100px] md:w-[190px] md:h-[120px]
        rounded-xl overflow-hidden
        bg-black/50 border border-white/30 
        text-white
        transition-all duration-300 ease-in-out
        group
        hover:border-red-600 
        hover:shadow-2xl hover:shadow-red-600/40 
        hover:scale-[1.02]
      `}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true"></div>

      <div className="relative z-10 p-4 flex flex-col h-full justify-between items-end text-right">
        <p className="text-3xl md:text-4xl font-extrabold text-white leading-none">
          {count}
        </p> 
        <p className="text-xs uppercase tracking-widest flex items-center"> 
          <Icon className={`h-4 w-4 mr-1 ${iconColor}`} /> 
          {label}
        </p>
      </div>
    </div>
  )
}

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
    <section className="relative min-h-[90vh] w-screen overflow-x-hidden flex items-center justify-center">
      <div className="absolute inset-0 w-screen h-full">
        <div className={`relative w-full h-full ${theme === 'dark' ? 'opacity-40' : 'opacity-100'}`}>
          <Image 
            src="/karatefondo.png" 
            alt="Karate" 
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={85}
            style={{
              objectPosition: 'center',
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 via-red-900/60 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/30"></div>
      </div>

      <div className="relative z-20 w-full max-w-[100vw] flex flex-col md:flex-row items-center justify-center min-h-[50vh] max-w-7xl mx-10 px-4 sm:px-6 lg:px-8">
        <div className="flex-1 text-center md:text-left space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col relative"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-6 flex flex-col items-start">
              <span className="text-white">ASO</span>
              <span className="text-red-600">KARATE</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto md:mx-0 leading-relaxed">
              Promoviendo la disciplina, el respeto y la excelencia en el arte del Karate
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-8 text-center md:text-left"
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, staggerChildren: 0.2 }}
          className="mt-12 md:mt-0 flex flex-row md:flex-col gap-5 flex-wrap justify-center"
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <MetricCard 
              count={atletasCount} 
              label="Atletas" 
              Icon={Users} 
              iconColor="text-blue-500" 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <MetricCard 
              count={entrenadoresCount} 
              label="Entrenadores" 
              Icon={Award} 
              iconColor="text-yellow-400" 
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <MetricCard 
              count={combatesCount} 
              label="Combates" 
              Icon={Swords} 
              iconColor="text-red-500" 
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}