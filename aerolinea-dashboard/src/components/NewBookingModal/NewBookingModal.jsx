// NewBookingModal.jsx — Función de escritura del CRM
// Permite registrar una nueva reserva. La reserva se añade al estado
// de la aplicación y todos los KPIs se recalculan en vivo, lo que
// demuestra que los indicadores son cálculos reales y no valores fijos.

import { useState } from "react";
import styles from "./NewBookingModal.module.css";
import { passengers, flights, channels } from "../../data/mockData";

const CABINS = ["Economy", "Premium", "Business"];

/** Genera un localizador de 6 caracteres tipo AVXXXX */
const genBookingCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
  let code = "AV";
  for (let i = 0; i < 4; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

export default function NewBookingModal({ open, onClose, onCreate, nextIndex }) {
  const [passengerId, setPassengerId] = useState(passengers[0]?.id || "");
  const [flightId, setFlightId] = useState(flights[0]?.id || "");
  const [channelId, setChannelId] = useState(channels[0]?.id || "");
  const [cabin, setCabin] = useState("Economy");
  const [pax, setPax] = useState(1);
  const [amount, setAmount] = useState(600000);
  const [baggage, setBaggage] = useState(15);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const numericAmount = Number(amount);
    const numericPax = Number(pax);

    if (!passengerId || !flightId || !channelId) {
      setError("Selecciona pasajero, vuelo y canal de venta.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("El valor de la reserva debe ser mayor que cero.");
      return;
    }
    if (!Number.isFinite(numericPax) || numericPax < 1) {
      setError("El número de pasajeros debe ser al menos 1.");
      return;
    }

    const flight = flights.find((f) => f.id === flightId);
    const now = new Date().toISOString();

    const booking = {
      id: `b${nextIndex}`,
      booking_code: genBookingCode(),
      passenger_id: passengerId,
      flight_id: flightId,
      channel_id: channelId,
      stage_id: "s2", // Reservada
      amount: numericAmount,
      currency: "COP",
      cabin_class: cabin,
      seat_number: `${Math.floor(Math.random() * 30) + 1}${"ABCDEF"[Math.floor(Math.random() * 6)]}`,
      passengers_count: numericPax,
      baggage_kg: Number(baggage) || 0,
      status: "open",
      created_at: now,
      expected_departure_date: flight ? flight.departure_at.split("T")[0] : null,
      closed_at: null,
      cancel_reason: null,
    };

    onCreate(booking);
    setError("");
    onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-label="Nueva reserva"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Nueva Reserva</h2>
            <p className={styles.subtitle}>
              Se registra en estado “Reservada” y los KPIs se actualizan al instante
            </p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Pasajero</span>
            <select
              className={styles.input}
              value={passengerId}
              onChange={(e) => setPassengerId(e.target.value)}
            >
              {passengers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name} · {p.membership}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Vuelo</span>
            <select
              className={styles.input}
              value={flightId}
              onChange={(e) => setFlightId(e.target.value)}
            >
              {flights.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.flight_number} · {f.route} · {f.departure_at.split("T")[0]}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Canal de venta</span>
            <select
              className={styles.input}
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            >
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} · {c.team}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Clase</span>
              <select
                className={styles.input}
                value={cabin}
                onChange={(e) => setCabin(e.target.value)}
              >
                {CABINS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Pasajeros</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                max="9"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>Valor total (COP)</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Equipaje (kg)</span>
              <input
                className={styles.input}
                type="number"
                min="0"
                max="40"
                value={baggage}
                onChange={(e) => setBaggage(e.target.value)}
              />
            </label>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <footer className={styles.footer}>
            <button type="button" className={styles.secondary} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className={styles.primary}>
              Registrar reserva
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
