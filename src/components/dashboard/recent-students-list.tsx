import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, formatRelative } from "@/lib/utils"
import type { Student } from "@/types"

interface RecentStudentsListProps {
  students: Student[]
}

export function RecentStudentsList({ students }: RecentStudentsListProps) {
  if (students.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nenhum aluno cadastrado ainda.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border/70">
      {students.map((student) => (
        <li key={student.id}>
          <Link
            href={`/students/${student.id}`}
            className="group -mx-1 flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-accent/50"
          >
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={student.avatar_url ?? undefined} alt={student.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(student.full_name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {student.full_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {student.goal ?? "Sem objetivo definido"}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge
                variant={student.is_active ? "default" : "secondary"}
                className={
                  student.is_active
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs"
                    : "text-xs"
                }
              >
                {student.is_active ? "Ativo" : "Inativo"}
              </Badge>
              <span className="hidden sm:block text-xs text-muted-foreground whitespace-nowrap">
                {formatRelative(student.created_at)}
              </span>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
