"use client"

import { motion } from "framer-motion"

export default function Footer() {
  return (
    <motion.footer 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="border-t bg-card mt-24"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-center space-y-4"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div 
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center"
            >
              <span className="text-lg text-white font-bold">空</span>
            </motion.div>
            <p className="font-semibold text-xl">Asociación de Karate</p>
          </motion.div>
          <p className="text-muted-foreground max-w-md mx-auto">
            Desarrollo de Aplicaciones 2 .
             <br />
             <span className="text-blue-500">Profesor Franklin España..</span> 
            <span className="bg-amber-600 text-black">Equipo Dinamita</span>
            <br />
            <span>2025 Unellez</span>
          </p>
        </motion.div>
      </div>
    </motion.footer>
  )
}