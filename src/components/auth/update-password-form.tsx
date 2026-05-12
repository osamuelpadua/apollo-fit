"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
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
import { updatePassword } from "@/features/auth/actions"

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter pelo menos um número"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "As senhas não coincidem",
    path: ["confirm"],
  })

type FormData = z.infer<typeof schema>

export function UpdatePasswordForm() {
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  })

  function onSubmit(data: FormData) {
    startTransition(async () => {
      const result = await updatePassword(data.password)
      if (result?.error) {
        toast.error("Erro ao atualizar senha", { description: result.error })
      }
    })
  }

  return (
    <Card className="border-border bg-card shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold">Nova senha</CardTitle>
        <CardDescription className="text-muted-foreground">
          Escolha uma senha forte para sua conta
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nova senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                className="pr-10"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmar senha</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••"
                disabled={isPending}
                className="pr-10"
                {...form.register("confirm")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-xs text-destructive">
                {form.formState.errors.confirm.message}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Atualizando…
              </>
            ) : (
              "Atualizar senha"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
