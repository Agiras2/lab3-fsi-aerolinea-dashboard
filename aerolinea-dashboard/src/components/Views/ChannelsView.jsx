// ChannelsView.jsx — Vista "Canales de Venta"
// Rendimiento comercial de cada canal: ingresos reales contra la meta
// asignada, volumen de reservas, tarifa promedio y conversión propia.

import styles from "./views.module.css";
import { formatCOP, formatCOPFull } from "../../utils/metrics";

const quotaColor = (pct) => {
  if (pct >= 100) return "var(--green)";
  if (pct >= 70) return "var(--accent)";
  return "var(--red)";
};

const teamPill = (team) => {
  if (team === "Digital") return styles.pillBlue;
  if (team === "Agencias") return styles.pillAmber;
  return styles.pillGreen;
};

export default function ChannelsView({ channels }) {
  const totalRevenue = channels.reduce((s, c) => s + c.revenue, 0);
  const totalQuota = channels.reduce((s, c) => s + (c.quota_amount || 0), 0);
  const globalPct = totalQuota ? (totalRevenue / totalQuota) * 100 : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>Rendimiento por Canal de Venta</h2>
        <p className={styles.cardSubtitle}>
          Ingresos confirmados frente a la meta asignada a cada canal ·
          cumplimiento global {globalPct.toFixed(1)}% ({formatCOP(totalRevenue)} de {formatCOP(totalQuota)})
        </p>
      </div>

      {channels.length === 0 ? (
        <div className={styles.empty}>No hay canales con datos en este período.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Canal</th>
                <th>Equipo</th>
                <th className={styles.num}>Reservas</th>
                <th className={styles.num}>Ingresos</th>
                <th>Cumplimiento de meta</th>
                <th className={styles.num}>Tarifa prom.</th>
                <th className={styles.num}>Conversión</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className={styles.identity}>
                      <img
                        className={styles.avatar}
                        src={c.avatar_url}
                        alt=""
                        onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                      />
                      <div className={styles.identityText}>
                        <span className={styles.identityName}>{c.full_name}</span>
                        <span className={styles.tiny}>{c.email}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`${styles.pill} ${teamPill(c.team)}`}>{c.team}</span>
                  </td>

                  <td className={styles.num}>
                    <span className={styles.strong}>{c.bookingsCount}</span>
                    <div className={styles.tiny}>{c.confirmedCount} confirmadas</div>
                  </td>

                  <td className={`${styles.num} ${styles.strong}`} title={formatCOPFull(c.revenue)}>
                    {formatCOP(c.revenue)}
                  </td>

                  <td className={styles.progressCell}>
                    <div className={styles.progressTop}>
                      <span
                        className={styles.progressValue}
                        style={{ color: quotaColor(c.quotaPct) }}
                      >
                        {c.quotaPct.toFixed(0)}%
                      </span>
                      <span className={styles.tiny}>meta {formatCOP(c.quota_amount)}</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(100, c.quotaPct)}%`,
                          background: quotaColor(c.quotaPct),
                        }}
                      />
                    </div>
                  </td>

                  <td className={`${styles.num} ${styles.muted}`}>
                    {formatCOP(c.avgFare)}
                  </td>

                  <td className={styles.num}>
                    <span className={`${styles.pill} ${c.conversion >= 70 ? styles.pillGreen : styles.pillNeutral}`}>
                      {c.conversion.toFixed(0)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
