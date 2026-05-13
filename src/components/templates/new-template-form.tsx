"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createTemplate } from "@/features/templates/actions"
import { templateSchema, type TemplateFormData } from "@/lib/validations/template"

export function NewTemplateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: { name: "", description: "", goal: "" },
  })

  function onSubmit(data: TemplateFormData) {
    startTransition(async () => {
      const result = await createTemplate(data)
      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error)
        } else {
          Object.entries(result.error).forEach(([field, msgs]) => {
            setError(field as keyof TemplateFormData, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            })
          })
        }
        return
      }

      toast.success("Template criado!")
      router.push(`/templates/${result.data!.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="tpl-name">
          Nome <span className="text-primary">*</span>
        </Label>
        <Input
          id="tpl-name"
          placeholder="Ex: Treino Full Body - Iniciante"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-goal">Objetivo</Label>
        <Input
          id="tpl-goal"
          placeholder="Ex: Hipertrofia, emagrecimento..."
          {...register("goal")}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tpl-desc">Descricao</Label>
        <Textarea
          id="tpl-desc"
          placeholder="Descreva para qual perfil de aluno este template e indicado..."
          rows={3}
          {...register("description")}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full min-w-32 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Template"
          )}
        </Button>
      </div>
    </form>
  )
}
