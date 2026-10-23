// LiveStatusPanel.jsx — Panel lateral derecho de Estado Operativo

import styles from "./LiveStatusPanel.module.css";

const statusItems = [
  {
    key: "scheduledFlights",
    label: "Vuelos Programados",
    desc: "Listos para operar",
    emoji: "✈️",
    bg: "var(--blue-soft)",
  },
  {
    key: "pendingPayment",
    label: "Pendientes de Pago",
    desc: "Reservadas sin emitir",
    emoji: "⏳",
    bg: "var(--amber-soft)",
  },
  {
    key: "delayedFlights",
    label: "Vuelos con Retraso",
    desc: "Demora > 0 min",
    emoji: "⚠️",
    bg: "var(--red-soft)",
  },
  {
    key: "completedFlights",
    label: "Vuelos Completados",
    desc: "Estado: arrived",
    emoji: "✅",
    bg: "var(--green-soft)",
  },
];

/** Mini SVG donut ring */
function DonutRing({ value, total }) {
  const size = 100;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(value / total, 1) : 0;
  const dashArray = `${pct * circumference} ${circumference}`;

  return (
    <svg className={styles.donutSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        className={styles.donutBg}
        cx={size / 2}
        cy={size / 2}
        r={radius}
      />
      <circle
        className={styles.donutFill}
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeDasharray={dashArray}
      />
      <text
        className={styles.donutText}
        x={size / 2}
        y={size / 2 - 6}
      >
        {Math.round(pct * 100)}%
      </text>
      <text
        className={styles.donutSub}
        x={size / 2}
        y={size / 2 + 10}
        style={{ fontSize: "8px" }}
      >
        conversión
      </text>
    </svg>
  );
}

export default function LiveStatusPanel({ status, conversionRate, totalBookings }) {
  return (
    <div className={styles.panel}>
      {/* Estado Operativo */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Estado Operativo</span>
          <span className={styles.liveDot}>
            <span className={styles.dot} />
            En vivo
          </span>
        </div>

        {/* Mini donut de conversión */}
        <div className={styles.donutWrapper}>
          <DonutRing value={conversionRate} total={100} />
        </div>

        {/* Lista de métricas */}
        <div className={styles.statusList}>
          {statusItems.map((item) => (
            <div key={item.key} className={styles.statusRow}>
              <div className={styles.statusIcon} style={{ background: item.bg }}>
                {item.emoji}
              </div>
              <div className={styles.statusInfo}>
                <div className={styles.statusLabel}>{item.label}</div>
                <div className={styles.statusDesc}>{item.desc}</div>
              </div>
              <div className={styles.statusCount}>{status[item.key] ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
