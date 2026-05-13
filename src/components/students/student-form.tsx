"use client"

import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { GoalSelect } from "@/components/shared/goal-select"
import { createStudent, updateStudent } from "@/features/students/actions"
import { studentSchema, type StudentFormData } from "@/lib/validations/student"

interface Props {
  mode: "create" | "edit"
  studentId?: string
  initialData?: Partial<StudentFormData>
}

export function StudentForm({ mode, studentId, initialData }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: initialData?.full_name ?? "",
      email: initialData?.email ?? "",
      phone: initialData?.phone ?? "",
      date_of_birth: initialData?.date_of_birth ?? "",
      gender: initialData?.gender ?? undefined,
      goal: initialData?.goal ?? "",
      notes: initialData?.notes ?? "",
      is_active: initialData?.is_active ?? true,
    },
  })

  function onSubmit(data: StudentFormData) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createStudent(data)
          : await updateStudent(studentId!, data)

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error)
        } else {
          Object.entries(result.error).forEach(([field, msgs]) => {
            setError(field as keyof StudentFormData, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            })
          })
          toast.error("Verifique os campos do formulario")
        }
        return
      }

      toast.success(
        mode === "create" ? "Aluno cadastrado!" : "Alteracoes salvas!"
      )

      if (mode === "create" && result.data) {
        router.push(`/students/${result.data.id}`)
      } else {
        router.push(`/students/${studentId}`)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 md:space-y-6">
      <div className="space-y-5 rounded-xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-base font-semibold text-foreground md:text-sm">
          Informacoes pessoais
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="full_name">
              Nome completo <span className="text-primary">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Ex: Joao Silva"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">
                {errors.full_name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@exemplo.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">WhatsApp / Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register("phone")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date_of_birth">Data de nascimento</Label>
            <Input
              id="date_of_birth"
              type="date"
              {...register("date_of_birth")}
              className="[color-scheme:dark]"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Genero</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-border bg-card p-4 md:p-6">
        <h3 className="text-base font-semibold text-foreground md:text-sm">
          Objetivo e observacoes
        </h3>

        <div className="space-y-1.5">
          <Label>Objetivo</Label>
          <Controller
            control={control}
            name="goal"
            render={({ field }) => (
              <GoalSelect
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Observacoes / Anamnese</Label>
          <Textarea
            id="notes"
            placeholder="Lesoes, restricoes, historico relevante..."
            rows={4}
            {...register("notes")}
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 md:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Aluno ativo</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Alunos inativos nao aparecem nas estatisticas do dashboard
            </p>
          </div>
          <Controller
            control={control}
            name="is_active"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
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
          className="w-full min-w-36 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "create" ? "Cadastrando..." : "Salvando..."}
            </>
          ) : mode === "create" ? (
            "Cadastrar Aluno"
          ) : (
            "Salvar Alteracoes"
          )}
        </Button>
      </div>
    </form>
  )
}
