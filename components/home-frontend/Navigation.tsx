"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Menu, X, Sun, Moon, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"

const navItems = [
  { id: "inicio", label: "Inicio" },
  { id: "combates-vivo", label: "En Vivo" },
  { id: "resultados", label: "Resultados" },
  { id: "entrenadores", label: "Entrenadores" },
  { id: "rankings", label: "Rankings" },
  { id: "atletas", label: "Atletas" },
]

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('inicio')
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      
      for (const item of navItems) {
        const section = document.getElementById(item.id)
        if (section) {
          const { offsetTop, offsetHeight } = section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(item.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    }
  }

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full bg-background/95 backdrop-blur-sm border-b z-50"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 md:w-10 md:h-10 bg-gradient-to-br from-red-600 to-black rounded-lg flex items-center justify-center"> 
              <span className="text-[0.8rem] md:text-[1.25rem] text-white font-bold">空</span> 
            </div>
            <span className="font-extrabold text-[0.8rem] md:text-[1.25rem] tracking-widest">ASO</span>
            <span className="font-extrabold text-[0.8rem] md:text-[1.25rem] tracking-widest text-red-600">KARATE</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => scrollToSection(item.id)}
                className={`group ${activeSection === item.id ? 'text-red-600' : 'text-foreground dark:text-white'} hover:text-red-600 dark:hover:text-red-600 transition-all duration-300 font-bold uppercase tracking-wider py-1 relative z-10 text-sm`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-600 transition-all duration-300 ${activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </motion.button>
            ))}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden flex-shrink-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                variant="ghost"
                className="w-full justify-start px-4"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-5 w-5 mr-2" /> : <Moon className="h-5 w-5 mr-2" />}
                {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
              </Button>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full justify-start px-4">
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}