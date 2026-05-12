"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Link from "next/link"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { resetPassword } from "@/features/auth/actions"

const schema = z.object({
  email: z.string().email("E-mail inválido"),
})
type FormData = z.infer<typeof schema>

export function ResetPasswordForm() {
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await resetPassword(data.email)
      if (result?.error) {
        toast.error("Erro", { description: result.error })
      } else {
        setSent(true)
      }
    })
  }

  if (sent) {
    return (
      <Card className="border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <CardTitle className="text-center text-xl font-bold">
            E-mail enviado
          </CardTitle>
          <CardDescription className="text-center">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center pt-2">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao login
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold">Recuperar senha</CardTitle>
        <CardDescription className="text-muted-foreground">
          Informe seu e-mail e enviaremos um link de recuperação
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={isPending}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enviando…
              </>
            ) : (
              "Enviar link de recuperação"
            )}
          </Button>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Voltar ao login
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
