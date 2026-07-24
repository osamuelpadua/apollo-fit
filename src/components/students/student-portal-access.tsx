"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Copy,
  KeyRound,
  Loader2,
  MailCheck,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  ShieldX,
  UserRoundCheck,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  createStudentPortalAccess,
  inviteStudentToPortal,
  resendStudentPortalAccess,
  revokeStudentPortalAccess,
} from "@/features/students/portal-actions"

interface Props {
  studentId: string
  studentName: string
  email: string | null
  phone: string | null
  hasAccess: boolean
}

interface ManualAccess {
  studentName: string
  email: string
  temporaryPassword: string
  loginUrl: string
}

function accessMessage(access: ManualAccess) {
  return [
    `Olá, ${access.studentName}! Seu acesso ao Apolo Fit está pronto.`,
    "",
    `Acesse: ${access.loginUrl}`,
    `Usuário: ${access.email}`,
    `Senha temporária: ${access.temporaryPassword}`,
    "",
    "No primeiro acesso, você deverá criar uma nova senha.",
  ].join("\n")
}

function whatsappUrl(phone: string | null, message: string) {
  const digits = phone?.replace(/\D/g, "") ?? ""
  const recipient =
    digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
  const baseUrl = recipient
    ? `https://wa.me/${recipient}`
    : "https://wa.me/"

  return `${baseUrl}?text=${encodeURIComponent(message)}`
}

export function StudentPortalAccess({
  studentId,
  studentName,
  email,
  phone,
  hasAccess,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [manualOpen, setManualOpen] = useState(false)
  const [manualAccess, setManualAccess] = useState<ManualAccess | null>(null)

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

  function handleManualOpen(nextOpen: boolean) {
    if (!nextOpen && pending) return
    setManualOpen(nextOpen)
    if (!nextOpen) setManualAccess(null)
  }

  function createManualAccess() {
    startTransition(async () => {
      const result = await createStudentPortalAccess(studentId)
      if (result.error || !result.access) {
        toast.error(result.error ?? "Não foi possível criar o acesso.")
        return
      }

      setManualAccess(result.access)
      toast.success("Acesso criado com sucesso")
      router.refresh()
    })
  }

  async function copyManualAccess() {
    if (!manualAccess) return

    try {
      await navigator.clipboard.writeText(accessMessage(manualAccess))
      toast.success("Dados de acesso copiados")
    } catch {
      toast.error("Não foi possível copiar. Selecione os dados manualmente.")
    }
  }

  function shareOnWhatsApp() {
    if (!manualAccess) return
    window.open(
      whatsappUrl(phone, accessMessage(manualAccess)),
      "_blank",
      "noopener,noreferrer"
    )
  }

  return (
    <>
      <section className="app-panel p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            {hasAccess
              ? <UserRoundCheck className="size-5 text-primary" />
              : <KeyRound className="size-5 text-primary" />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold">Portal do aluno</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasAccess
                ? `Acesso ativo para ${email ?? "o aluno"}.`
                : email
                  ? `Crie o acesso agora ou envie um convite para ${email}.`
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
            <>
              <Button
                variant="outline"
                disabled={pending || !email}
                onClick={() => run(inviteStudentToPortal, "Convite enviado por e-mail.")}
              >
                <MailCheck className="size-4" />
                Enviar convite
              </Button>
              <Button
                disabled={pending || !email}
                onClick={() => setManualOpen(true)}
              >
                <KeyRound className="size-4" />
                Criar acesso
              </Button>
            </>
          )}
        </div>
      </section>

      <Dialog open={manualOpen} onOpenChange={handleManualOpen}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto left-0 w-full max-w-none translate-x-0 translate-y-0 rounded-b-none rounded-t-2xl border-border bg-card p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4">
          <DialogHeader className="border-b border-border/60 px-4 pb-4 pt-5 sm:border-0 sm:p-0">
            <DialogTitle>
              {manualAccess ? "Acesso criado" : "Criar acesso manual"}
            </DialogTitle>
            <DialogDescription>
              {manualAccess
                ? "Compartilhe estes dados agora. A senha não será exibida novamente."
                : `Crie uma conta para ${studentName} sem enviar nenhum e-mail.`}
            </DialogDescription>
          </DialogHeader>

          {manualAccess ? (
            <div className="space-y-3 px-4 pb-2 sm:px-0" aria-live="polite">
              <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
                  <ShieldCheck className="size-4" />
                  Conta ativada
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  O aluno deverá trocar a senha temporária no primeiro acesso.
                </p>
              </div>

              <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
                <div className="space-y-1 p-3">
                  <dt className="text-xs text-muted-foreground">Endereço</dt>
                  <dd className="break-all text-sm font-medium">
                    {manualAccess.loginUrl}
                  </dd>
                </div>
                <div className="space-y-1 p-3">
                  <dt className="text-xs text-muted-foreground">Usuário</dt>
                  <dd className="break-all text-sm font-medium">
                    {manualAccess.email}
                  </dd>
                </div>
                <div className="space-y-1 p-3">
                  <dt className="text-xs text-muted-foreground">Senha temporária</dt>
                  <dd className="select-all break-all font-mono text-base font-semibold text-primary">
                    {manualAccess.temporaryPassword}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="space-y-3 px-4 pb-2 sm:px-0">
              <div className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
                <p className="font-medium">{email}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  O sistema gerará uma senha temporária forte e confirmará este
                  e-mail sem utilizar o limite de envios do Supabase.
                </p>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Confirme que o endereço pertence ao aluno antes de compartilhar
                os dados pelo WhatsApp.
              </p>
            </div>
          )}

          <DialogFooter className="pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
            {manualAccess ? (
              <>
                <Button variant="outline" onClick={copyManualAccess}>
                  <Copy className="size-4" />
                  Copiar dados
                </Button>
                <Button onClick={shareOnWhatsApp}>
                  <MessageCircle className="size-4" />
                  Enviar pelo WhatsApp
                </Button>
              </>
            ) : (
              <Button
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={createManualAccess}
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Criando acesso…
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4" />
                    Gerar senha temporária
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
