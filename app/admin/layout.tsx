import type React from "react"
import { getUser, signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-linear-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white font-bold">空</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Panel de Administración</h1>
                  <p className="text-xs text-muted-foreground">Asociación de Karate</p>
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/admin/atletas">
                <Button variant="ghost">Atletas</Button>
              </Link>
              <Link href="/admin/entrenadores">
                <Button variant="ghost">Entrenadores</Button>
              </Link>
              <Link href="/admin/jueces">
                <Button variant="ghost">Jueces</Button>
              </Link>
              <Link href="/admin/combates">
                <Button variant="ghost">Combates</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost">Ver Sitio Público</Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Administrador</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/admin">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/admin/atletas">Atletas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/admin/entrenadores">Entrenadores</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/admin/jueces">Jueces</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/admin/combates">Combates</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="md:hidden" />
                <form action={signOut}>
                  <button type="submit" className="w-full">
                    <DropdownMenuItem className="text-destructive cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
