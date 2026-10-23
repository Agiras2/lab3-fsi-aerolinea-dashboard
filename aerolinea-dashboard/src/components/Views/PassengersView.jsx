// PassengersView.jsx — Vista "Pasajeros"
// Segmentación por nivel de fidelización (Basic / Gold / Platinum),
// heredado del motor de reglas de negocio del laboratorio anterior,
// y ranking de pasajeros por valor acumulado.

import styles from "./views.module.css";
import { formatCOP, formatCOPFull } from "../../utils/metrics";

const membershipPill = (m) => {
  if (m === "Platinum") return styles.pillAccent;
  if (m === "Gold") return styles.pillAmber;
  return styles.pillNeutral;
};

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function PassengersView({ segments, topPassengers }) {
  return (
    <>
      <div className={styles.segmentGrid}>
        {segments.map((s) => (
          <div className={styles.segmentCard} key={s.membership}>
            <div className={styles.segmentHead}>
              <span className={`${styles.pill} ${membershipPill(s.membership)}`}>
                {s.membership}
              </span>
              <span className={styles.tiny}>{s.avgPoints.toLocaleString("es-CO")} pts prom.</span>
            </div>
            <div className={styles.segmentValue}>{formatCOP(s.revenue)}</div>
            <div className={styles.segmentLabel}>
              {s.passengersCount} PASAJEROS · {s.bookingsCount} RESERVAS
            </div>
            <div className={styles.segmentFoot}>
              <span>Ticket promedio</span>
              <span className={styles.strong}>{formatCOP(s.avgTicket)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Pasajeros por Valor Acumulado</h2>
          <p className={styles.cardSubtitle}>
            Clientes ordenados por ingresos confirmados en el período seleccionado
          </p>
        </div>

        {topPassengers.length === 0 ? (
          <div className={styles.empty}>No hay pasajeros con reservas en este período.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pasajero</th>
                  <th>Membresía</th>
                  <th className={styles.num}>Puntos</th>
                  <th className={styles.num}>Reservas</th>
                  <th className={styles.num}>Valor acumulado</th>
                </tr>
              </thead>
              <tbody>
                {topPassengers.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className={styles.identity}>
                        <span className={styles.initials}>{initialsOf(p.full_name)}</span>
                        <div className={styles.identityText}>
                          <span className={styles.identityName}>{p.full_name}</span>
                          <span className={styles.tiny}>{p.email}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.pill} ${membershipPill(p.membership)}`}>
                        {p.membership}
                      </span>
                    </td>

                    <td className={`${styles.num} ${styles.muted}`}>
                      {p.loyalty_points.toLocaleString("es-CO")}
                    </td>

                    <td className={`${styles.num} ${styles.strong}`}>{p.bookingsCount}</td>

                    <td className={`${styles.num} ${styles.strong}`} title={formatCOPFull(p.revenue)}>
                      {formatCOP(p.revenue)}
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
