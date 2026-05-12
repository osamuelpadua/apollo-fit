"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { studentSchema, type StudentFormData } from "@/lib/validations/student"
import { createStudent, updateStudent } from "@/features/students/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
          toast.error("Verifique os campos do formulário")
        }
        return
      }

      toast.success(mode === "create" ? "Aluno cadastrado!" : "Alterações salvas!")

      if (mode === "create" && result.data) {
        router.push(`/students/${result.data.id}`)
      } else {
        router.push(`/students/${studentId}`)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informações pessoais */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Informações Pessoais</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="full_name">
              Nome completo <span className="text-primary">*</span>
            </Label>
            <Input
              id="full_name"
              placeholder="Ex: João Silva"
              {...register("full_name")}
              className={errors.full_name ? "border-destructive" : ""}
            />
            {errors.full_name && (
              <p className="text-xs text-destructive">{errors.full_name.message}</p>
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
            <Label>Gênero</Label>
            <Controller
              control={control}
              name="gender"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9">
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

      {/* Objetivo e notas */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Objetivo e Observações</h3>

        <div className="space-y-1.5">
          <Label htmlFor="goal">Objetivo</Label>
          <Textarea
            id="goal"
            placeholder="Ex: Hipertrofia, perda de peso, condicionamento..."
            rows={2}
            {...register("goal")}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Observações / Anamnese</Label>
          <Textarea
            id="notes"
            placeholder="Lesões, restrições, histórico relevante..."
            rows={4}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Status */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Aluno ativo</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alunos inativos não aparecem nas estatísticas do dashboard
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

      {/* Footer */}
      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold min-w-36"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {mode === "create" ? "Cadastrando..." : "Salvando..."}
            </>
          ) : mode === "create" ? (
            "Cadastrar Aluno"
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </div>
    </form>
  )
}
