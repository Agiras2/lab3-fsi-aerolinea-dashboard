// BookingsTable.jsx — Tabla de últimas reservas creadas

import { formatCOPFull } from "../../utils/metrics";
import styles from "./BookingsTable.module.css";

const STATUS_LABELS = {
  confirmed: "Confirmada",
  open:      "Activa",
  cancelled: "Cancelada",
};

const CABIN_LABELS = {
  Economy: "Económica",
  Premium: "Premium",
  Business: "Ejecutiva",
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function BookingsTable({ bookings }) {
  if (!bookings || bookings.length === 0) {
    return (
      <div className={`card ${styles.wrapper}`}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>Últimas Reservas</div>
            <div className={styles.subtitle}>Sin registros para el filtro actual</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${styles.wrapper}`}>
      <div className={styles.header}>
        <div>
          <div className={styles.title}>Últimas Reservas</div>
          <div className={styles.subtitle}>
            Las {bookings.length} más recientes · ordenadas por fecha de creación
          </div>
        </div>
        <button className={styles.viewAll}>Ver todas →</button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Localizador</th>
            <th>Pasajero</th>
            <th>Ruta</th>
            <th>Clase</th>
            <th>Monto</th>
            <th>Fecha</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id}>
              <td><span className={styles.code}>{b.booking_code}</span></td>
              <td><span className={styles.passengerName}>{b.passenger_name}</span></td>
              <td>
                <span className={styles.route}>
                  {b.route}
                </span>
              </td>
              <td>
                <span className={styles.cabin}>
                  {CABIN_LABELS[b.cabin_class] || b.cabin_class}
                </span>
              </td>
              <td>
                <span className={styles.amount}>
                  {formatCOPFull(b.amount)}
                </span>
              </td>
              <td style={{ color: "var(--text-tertiary)", fontSize: "12px" }}>
                {formatDate(b.created_at)}
              </td>
              <td>
                <span className={`${styles.badge} ${styles[b.status]}`}>
                  {STATUS_LABELS[b.status] || b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
