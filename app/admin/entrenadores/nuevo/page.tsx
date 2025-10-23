import { EntrenadorForm } from "@/components/admin/entrenador-form"

export default function NuevoEntrenadorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agregar Entrenador</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar un nuevo entrenador</p>
      </div>

      <EntrenadorForm />
    </div>
  )
}
