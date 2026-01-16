"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}
// datos de preguntas frecuentes 
const faqData: FAQItem[] = [
  {
    question: "¿Qué edad mínima se requiere para practicar karate?",
    answer: "Aceptamos estudiantes desde los 4 años de edad. Tenemos programas especializados para diferentes grupos etarios: niños (4-12 años), adolescentes (13-17 años) y adultos (18+ años)."
  },
  {
    question: "¿Necesito experiencia previa para unirme?",
    answer: "No es necesaria experiencia previa. Nuestros programas están diseñados para recibir estudiantes de todos los niveles, desde principiantes absolutos hasta practicantes avanzados."
  },
  {
    question: "¿Qué estilo de karate enseñan?",
    answer: "Enseñamos karate tradicional Shotokan, uno de los estilos más reconocidos mundialmente. Nuestro enfoque combina técnica tradicional, defensa personal práctica y preparación para competencias."
  },
  {
    question: "¿Con qué frecuencia se realizan los exámenes de grado?",
    answer: "Los exámenes de grado se realizan cada 3-4 meses para cinturones de color (kyu) y cada 6-12 meses para cinturones negros (dan), dependiendo del nivel y progreso del estudiante."
  },
  {
    question: "¿Participan en competencias oficiales?",
    answer: "Sí, somos miembros de la federación nacional y participamos regularmente en torneos locales, regionales y nacionales. También organizamos nuestros propios eventos competitivos."
  },
  {
    question: "¿Qué beneficios ofrece la práctica del karate?",
    answer: "El karate desarrolla disciplina mental, mejora la condición física, aumenta la confianza, enseña defensa personal, promueve el respeto y ayuda a manejar el estrés de manera efectiva."
  }
]

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Resolvemos las dudas más comunes sobre nuestra asociación y la práctica del karate
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-muted/50 transition-colors"
            >
              <h3 className="font-semibold pr-4">{item.question}</h3>
              {openItems.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
              )}
            </button>
            {openItems.includes(index) && (
              <div className="px-6 pb-4">
                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="text-center mt-8">
        <p className="text-muted-foreground mb-4">
          ¿No encuentras la respuesta que buscas?
        </p>
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
          Contáctanos Directamente
        </button>
      </div>
    </section>
  )
}