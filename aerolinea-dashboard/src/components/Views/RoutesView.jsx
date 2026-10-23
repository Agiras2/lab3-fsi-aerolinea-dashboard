// RoutesView.jsx — Vista "Rutas"
// Ingresos por ruta y Factor de Ocupación: pasajeros confirmados
// sobre la capacidad total de los vuelos que cubren cada ruta.

import styles from "./views.module.css";
import { formatCOP, formatCOPFull } from "../../utils/metrics";

const occupancyColor = (pct) => {
  if (pct >= 75) return "var(--green)";
  if (pct >= 45) return "var(--accent)";
  return "var(--red)";
};

export default function RoutesView({ routes }) {
  const totalRevenue = routes.reduce((s, r) => s + r.revenue, 0);
  const totalPax = routes.reduce((s, r) => s + r.pax, 0);
  const totalSeats = routes.reduce((s, r) => s + r.seats, 0);
  const avgOccupancy = totalSeats ? (totalPax / totalSeats) * 100 : 0;
  const delayedTotal = routes.reduce((s, r) => s + r.delayedFlights, 0);

  return (
    <>
      <div className={styles.segmentGrid}>
        <div className={styles.segmentCard}>
          <div className={styles.segmentHead}>
            <span className={`${styles.pill} ${styles.pillAccent}`}>Ingresos</span>
          </div>
          <div className={styles.segmentValue}>{formatCOP(totalRevenue)}</div>
          <div className={styles.segmentLabel}>EN {routes.length} RUTAS OPERADAS</div>
          <div className={styles.segmentFoot}>
            <span>Pasajeros confirmados</span>
            <span className={styles.strong}>{totalPax}</span>
          </div>
        </div>

        <div className={styles.segmentCard}>
          <div className={styles.segmentHead}>
            <span className={`${styles.pill} ${styles.pillGreen}`}>Ocupación</span>
          </div>
          <div className={styles.segmentValue} style={{ color: occupancyColor(avgOccupancy) }}>
            {avgOccupancy.toFixed(1)}%
          </div>
          <div className={styles.segmentLabel}>FACTOR DE OCUPACIÓN PROMEDIO</div>
          <div className={styles.segmentFoot}>
            <span>Sillas ofertadas</span>
            <span className={styles.strong}>{totalSeats.toLocaleString("es-CO")}</span>
          </div>
        </div>

        <div className={styles.segmentCard}>
          <div className={styles.segmentHead}>
            <span className={`${styles.pill} ${delayedTotal > 0 ? styles.pillRed : styles.pillNeutral}`}>
              Puntualidad
            </span>
          </div>
          <div className={styles.segmentValue}>{delayedTotal}</div>
          <div className={styles.segmentLabel}>VUELOS CON RETRASO</div>
          <div className={styles.segmentFoot}>
            <span>Rutas afectadas</span>
            <span className={styles.strong}>
              {routes.filter((r) => r.delayedFlights > 0).length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Rendimiento por Ruta</h2>
          <p className={styles.cardSubtitle}>
            Ingresos confirmados y factor de ocupación de cada par origen-destino
          </p>
        </div>

        {routes.length === 0 ? (
          <div className={styles.empty}>No hay rutas con reservas en este período.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ruta</th>
                  <th className={styles.num}>Vuelos</th>
                  <th className={styles.num}>Reservas</th>
                  <th className={styles.num}>Pasajeros</th>
                  <th>Factor de ocupación</th>
                  <th className={styles.num}>Ingresos</th>
                  <th className={styles.num}>Retrasos</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((r) => (
                  <tr key={r.route}>
                    <td>
                      <div className={styles.identity}>
                        <span className={styles.initials}>{r.origin}</span>
                        <div className={styles.identityText}>
                          <span className={styles.identityName}>{r.route}</span>
                          <span className={styles.tiny}>
                            {r.origin} hacia {r.destination}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className={`${styles.num} ${styles.muted}`}>{r.flightsCount}</td>
                    <td className={`${styles.num} ${styles.strong}`}>{r.bookingsCount}</td>
                    <td className={`${styles.num} ${styles.muted}`}>
                      {r.pax} <span className={styles.tiny}>/ {r.seats}</span>
                    </td>

                    <td className={styles.progressCell}>
                      <div className={styles.progressTop}>
                        <span
                          className={styles.progressValue}
                          style={{ color: occupancyColor(r.occupancy) }}
                        >
                          {r.occupancy.toFixed(0)}%
                        </span>
                      </div>
                      <div className={styles.progressTrack}>
                        <div
                          className={styles.progressFill}
                          style={{
                            width: `${Math.min(100, r.occupancy)}%`,
                            background: occupancyColor(r.occupancy),
                          }}
                        />
                      </div>
                    </td>

                    <td className={`${styles.num} ${styles.strong}`} title={formatCOPFull(r.revenue)}>
                      {formatCOP(r.revenue)}
                    </td>

                    <td className={styles.num}>
                      {r.delayedFlights > 0 ? (
                        <span className={`${styles.pill} ${styles.pillRed}`}>
                          {r.delayedFlights} · {r.avgDelay} min
                        </span>
                      ) : (
                        <span className={`${styles.pill} ${styles.pillNeutral}`}>A tiempo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
