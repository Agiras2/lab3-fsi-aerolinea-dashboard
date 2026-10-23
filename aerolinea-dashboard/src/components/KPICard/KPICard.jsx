// KPICard.jsx — Tarjeta reutilizable de indicador clave

import styles from "./KPICard.module.css";

const ArrowUpIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="5 12 12 5 19 12"/>
  </svg>
);

const ArrowDownIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="19 12 12 19 5 12"/>
  </svg>
);

/**
 * @param {string}  label       - Título del KPI
 * @param {string}  value       - Valor formateado a mostrar
 * @param {string}  icon        - Emoji o elemento SVG del ícono
 * @param {string}  iconBg      - CSS background para el recuadro del ícono
 * @param {string}  iconColor   - CSS color para el ícono
 * @param {number|null} change  - Variación porcentual (null = sin comparativa)
 * @param {string}  subtext     - Texto secundario debajo de la variación
 */
export default function KPICard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  change,
  subtext,
  badgeText,
}) {
  const changeDir = change === null ? "neutral" : change >= 0 ? "up" : "down";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <div
          className={styles.iconBox}
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>

      <div className={styles.value}>{value}</div>

      <div className={styles.footer}>
        {change !== null ? (
          <span className={`${styles.badge} ${styles[changeDir]}`}>
            {changeDir === "up" ? <ArrowUpIcon /> : changeDir === "down" ? <ArrowDownIcon /> : null}
            {Math.abs(change).toFixed(1)}%
          </span>
        ) : (
          <span className={`${styles.badge} ${styles.neutral}`}>
            {badgeText || "—"}
          </span>
        )}
        {subtext && <span className={styles.subtext}>{subtext}</span>}
      </div>
    </div>
  );
}
