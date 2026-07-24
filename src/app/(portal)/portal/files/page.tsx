import { Download, FileText } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { getPortalFiles } from "@/features/portal/queries"
import { formatDate, formatFileSize } from "@/lib/utils"

export default async function PortalFilesPage() {
  const files = await getPortalFiles()

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Compartilhados</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">Meus arquivos</h1>
      </div>
      {files.length ? (
        <div className="app-panel divide-y divide-border/70 overflow-hidden">
          {files.map((file) => (
            <a
              key={file.id}
              href={file.download_url ?? "#"}
              download
              className="flex min-h-20 items-center gap-3 p-4 hover:bg-muted/30"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="size-5 text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{file.file_name}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {file.file_size ? formatFileSize(file.file_size) : "Arquivo"} · {formatDate(file.created_at)}
                </span>
              </span>
              <Download className="size-5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Nenhum arquivo"
          description="Documentos enviados pelo seu personal aparecerão aqui."
        />
      )}
    </div>
  )
}
