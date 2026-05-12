"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Assessment } from "@/features/assessments/queries"

interface Props {
  assessments: Assessment[]
}

const GRID_COLOR = "#2A2A2A"
const TICK_COLOR = "#71717a"
const TOOLTIP_STYLE = {
  backgroundColor: "#171717",
  border: "1px solid #2A2A2A",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#F5F5F5",
}

export function ProgressCharts({ assessments }: Props) {
  const sorted = [...assessments].sort(
    (a, b) => new Date(a.assessed_at).getTime() - new Date(b.assessed_at).getTime()
  )

  const data = sorted.map(a => ({
    date: format(new Date(a.assessed_at), "dd/MM", { locale: ptBR }),
    peso: a.weight_kg,
    gordura: a.body_fat_pct,
    cintura: a.waist_cm,
    quadril: a.hip_cm,
    peito: a.chest_cm,
  }))

  const hasWeight = data.some(d => d.peso != null)
  const hasFat = data.some(d => d.gordura != null)
  const hasMeasures = data.some(d => d.cintura != null || d.quadril != null || d.peito != null)

  if (!hasWeight && !hasFat && !hasMeasures) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Composição */}
      {(hasWeight || hasFat) && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Composição Corporal</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGordura" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#2A2A2A" }} />
              {hasWeight && (
                <Area
                  type="monotone"
                  dataKey="peso"
                  name="Peso (kg)"
                  stroke="#FF7A00"
                  strokeWidth={2}
                  fill="url(#gradPeso)"
                  dot={{ fill: "#FF7A00", r: 3 }}
                  connectNulls
                />
              )}
              {hasFat && (
                <Area
                  type="monotone"
                  dataKey="gordura"
                  name="Gordura (%)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#gradGordura)"
                  dot={{ fill: "#3B82F6", r: 3 }}
                  connectNulls
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center">
            {hasWeight && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-primary inline-block" />
                Peso (kg)
              </span>
            )}
            {hasFat && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-blue-500 inline-block" />
                Gordura (%)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Medidas */}
      {hasMeasures && (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Medidas (cm)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: TICK_COLOR, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "#2A2A2A" }} />
              {data.some(d => d.cintura != null) && (
                <Line
                  type="monotone"
                  dataKey="cintura"
                  name="Cintura"
                  stroke="#FF7A00"
                  strokeWidth={2}
                  dot={{ fill: "#FF7A00", r: 3 }}
                  connectNulls
                />
              )}
              {data.some(d => d.quadril != null) && (
                <Line
                  type="monotone"
                  dataKey="quadril"
                  name="Quadril"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981", r: 3 }}
                  connectNulls
                />
              )}
              {data.some(d => d.peito != null) && (
                <Line
                  type="monotone"
                  dataKey="peito"
                  name="Peito"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: "#8B5CF6", r: 3 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3 justify-center flex-wrap">
            {data.some(d => d.cintura != null) && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-primary inline-block" />
                Cintura
              </span>
            )}
            {data.some(d => d.quadril != null) && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                Quadril
              </span>
            )}
            {data.some(d => d.peito != null) && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-2.5 rounded-full bg-purple-500 inline-block" />
                Peito
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
