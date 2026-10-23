// RevenueBarChart.jsx — Gráfico de barras: Ingresos por Estado de Reserva

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { formatCOP, formatCOPFull } from "../../utils/metrics";
import styles from "./RevenueBarChart.module.css";

// Mapeo de color_hint a color real
const COLOR_MAP = {
  gris:    "#9CA3AF",
  azul:    "#3B82F6",
  naranja: "#FF6B4A",
  verde:   "#22C55E",
  rojo:    "#EF4444",
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className={styles.customTooltip}>
      <div className={styles.tooltipLabel}>{label}</div>
      <div className={styles.tooltipValue}>{formatCOPFull(d.value)}</div>
      <div className={styles.tooltipCount}>{d.payload.count} reservas</div>
    </div>
  );
};

const CustomBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (height <= 0) return null;
  const radius = 6;
  return (
    <path
      d={`M${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} L${x},${y + height} Z`}
      fill={fill}
    />
  );
};

export default function RevenueBarChart({ data }) {
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
          <div className={styles.title}>Ingresos por Estado de Reserva</div>
          <div className={styles.subtitle}>Pipeline completo — suma de montos por etapa</div>
        </div>
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            barCategoryGap="32%"
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="4 4"
              stroke="var(--border)"
            />
            <XAxis
              dataKey="name"
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <Bar dataKey="revenue" shape={<CustomBar />}>
              {data.map((entry) => (
                <Cell
                  key={entry.id}
                  fill={COLOR_MAP[entry.color_hint] || "#9CA3AF"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
