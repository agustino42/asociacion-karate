import { JuezForm } from "@/components/admin/juez-form"

export default function NuevoJuezPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agregar Juez</h1>
        <p className="text-muted-foreground">Completa el formulario para registrar un nuevo juez</p>
      </div>

      <JuezForm />
    </div>
  )
}
