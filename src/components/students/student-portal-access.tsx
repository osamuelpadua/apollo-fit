"use client"

import { useTransition } from "react"
import { MailCheck, RefreshCw, ShieldX, UserRoundCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  inviteStudentToPortal,
  resendStudentPortalAccess,
  revokeStudentPortalAccess,
} from "@/features/students/portal-actions"

interface Props {
  studentId: string
  email: string | null
  hasAccess: boolean
}

export function StudentPortalAccess({ studentId, email, hasAccess }: Props) {
  const [pending, startTransition] = useTransition()

  function run(
    action: (id: string) => Promise<{ error?: string; success?: boolean }>,
    successMessage: string
  ) {
    startTransition(async () => {
      const result = await action(studentId)
      if (result.error) toast.error(result.error)
      else toast.success(successMessage)
    })
  }

  return (
    <section className="app-panel p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          {hasAccess
            ? <UserRoundCheck className="size-5 text-primary" />
            : <MailCheck className="size-5 text-primary" />}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Portal do aluno</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {hasAccess
              ? `Acesso ativo para ${email ?? "o aluno"}.`
              : email
                ? `Envie o acesso de consulta para ${email}.`
                : "Adicione um e-mail ao cadastro para liberar o portal."}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        {hasAccess ? (
          <>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => run(resendStudentPortalAccess, "Novo acesso enviado por e-mail.")}
            >
              <RefreshCw className="size-4" />
              Reenviar acesso
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() => {
                if (window.confirm("Revogar o acesso deste aluno ao portal?")) {
                  run(revokeStudentPortalAccess, "Acesso ao portal revogado.")
                }
              }}
            >
              <ShieldX className="size-4" />
              Revogar
            </Button>
          </>
        ) : (
          <Button
            disabled={pending || !email}
            onClick={() => run(inviteStudentToPortal, "Convite enviado por e-mail.")}
          >
            <MailCheck className="size-4" />
            {pending ? "Enviando…" : "Convidar para o portal"}
          </Button>
        )}
      </div>
    </section>
  )
}
