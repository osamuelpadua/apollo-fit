import { Mail, Phone, Target } from "lucide-react"
import { PortalProfileActions } from "@/components/portal/portal-profile-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getPortalStudent } from "@/features/portal/queries"
import { getInitials } from "@/lib/utils"

export default async function PortalProfilePage() {
  const student = await getPortalStudent()

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Minha conta</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">Perfil</h1>
      </div>
      {student && (
        <section className="app-panel p-5">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarImage src={student.avatar_url ?? undefined} alt={student.full_name} />
              <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
                {getInitials(student.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold">{student.full_name}</h2>
              <p className="text-sm text-muted-foreground">Aluno Apolo Fit</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 border-t border-border/70 pt-5 text-sm">
            {student.email && <p className="flex items-center gap-3"><Mail className="size-4 text-primary" />{student.email}</p>}
            {student.phone && <p className="flex items-center gap-3"><Phone className="size-4 text-primary" />{student.phone}</p>}
            {student.goal && <p className="flex items-center gap-3"><Target className="size-4 text-primary" />{student.goal}</p>}
          </div>
        </section>
      )}
      <PortalProfileActions />
    </div>
  )
}
