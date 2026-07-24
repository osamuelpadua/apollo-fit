import Image from "next/image"
import { Activity } from "lucide-react"
import { ProgressCharts } from "@/components/assessments/progress-charts"
import { EmptyState } from "@/components/shared/empty-state"
import { getPortalAssessments, getPortalPhotos } from "@/features/portal/queries"
import { formatDate, formatPercentage, formatWeight } from "@/lib/utils"

export default async function PortalProgressPage() {
  const [assessments, photos] = await Promise.all([
    getPortalAssessments(),
    getPortalPhotos(),
  ])
  const latest = assessments[0]

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Acompanhamento</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">Minha evolução</h1>
      </div>

      {latest ? (
        <>
          <section className="grid grid-cols-3 gap-3">
            {[
              ["Peso", formatWeight(latest.weight_kg)],
              ["Gordura", formatPercentage(latest.body_fat_pct)],
              ["Cintura", latest.waist_cm == null ? "—" : `${latest.waist_cm} cm`],
            ].map(([label, value]) => (
              <div key={label} className="app-panel p-3 text-center">
                <p className="text-[11px] text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-bold">{value}</p>
              </div>
            ))}
          </section>
          <p className="text-xs text-muted-foreground">
            Última avaliação: {formatDate(latest.assessed_at)}
          </p>
          <ProgressCharts assessments={assessments} />

          {photos.length > 0 && (
            <section>
              <h2 className="app-section-title mb-3">Fotos de progresso</h2>
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => photo.display_url && (
                  <div key={photo.id} className="app-panel overflow-hidden">
                    <div className="relative aspect-[3/4]">
                      <Image
                        src={photo.display_url}
                        alt={`Progresso em ${formatDate(photo.taken_at)}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <p className="p-3 text-xs text-muted-foreground">{formatDate(photo.taken_at)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <EmptyState
          icon={Activity}
          title="Sem avaliações"
          description="Suas avaliações e gráficos aparecerão aqui."
        />
      )}
    </div>
  )
}
