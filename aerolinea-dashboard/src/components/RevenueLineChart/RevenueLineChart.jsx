// RevenueLineChart.jsx — Gráfico de línea: evolución mensual de ingresos

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Dot,
} from "recharts";
import { formatCOP, formatCOPFull } from "../../utils/metrics";
import styles from "./RevenueLineChart.module.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className={styles.customTooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{formatCOPFull(payload[0].value)}</div>
    </div>
  );
};

export default function RevenueLineChart({ data }) {
  const total = data.reduce((acc, d) => acc + d.revenue, 0);

  if (!data || data.length === 0) {
    return (
      <div className={`card ${styles.wrapper}`}>
        <p style={{ color: "var(--text-tertiary)", textAlign: "center", padding: "40px 0" }}>
          Sin datos para el rango seleccionado
        </p>
      </div>
    );
  }

  return (
    <div className={`card ${styles.wrapper}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.title}>Evolución de Ingresos</div>
          <div className={styles.subtitle}>Reservas confirmadas — agrupadas por mes</div>
        </div>
        <div className={styles.totalBadge}>
          <div className={styles.totalLabel}>Total acumulado</div>
          <div className={styles.totalValue}>{formatCOP(total)}</div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#FF6B4A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#FF6B4A" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "var(--text-secondary)", fontFamily: "var(--font)", fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontFamily: "var(--font)" }}
              tickFormatter={(v) => formatCOP(v)}
              width={64}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#FF6B4A"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={{ fill: "#FF6B4A", r: 4, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ fill: "#FF6B4A", r: 6, strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
