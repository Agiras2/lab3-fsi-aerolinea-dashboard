// ============================================================
// metrics.js — Utilidades de cálculo de KPIs
// Todas las funciones son PURAS: reciben datos y devuelven valores.
// Si cambias mockData.js, los KPIs se actualizan automáticamente.
// ============================================================

import { stages, flights, channels, bookings as allMockBookings } from "../data/mockData";

// ── Helpers de fecha ────────────────────────────────────────

/** Devuelve el mes ISO (ej: "2026-05") de un string datetime en UTC */
const toMonthKey = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

/** Devuelve el timestamp unix de un string datetime */
const toTs = (dateStr) => (dateStr ? new Date(dateStr).getTime() : 0);

/** Normaliza string o Date a timestamp UTC inicio del día (00:00:00.000) */
const getUtcStartOfDay = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const parts = d.split("T")[0].split("-");
    if (parts.length === 3) return Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 0, 0, 0, 0);
  }
  const dt = new Date(d);
  return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 0, 0, 0, 0);
};

/** Normaliza string o Date a timestamp UTC fin del día (23:59:59.999) */
const getUtcEndOfDay = (d) => {
  if (!d) return null;
  if (typeof d === "string") {
    const parts = d.split("T")[0].split("-");
    if (parts.length === 3) return Date.UTC(+parts[0], +parts[1] - 1, +parts[2], 23, 59, 59, 999);
  }
  const dt = new Date(d);
  return Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 23, 59, 59, 999);
};

// ── Filtros ──────────────────────────────────────────────────

/**
 * Aplica los filtros de fecha y equipo a un array de reservas.
 * @param {Array}  bookings    - Array completo de reservas
 * @param {string} teamFilter  - 'Todos' | 'Directo' | 'Digital' | 'Agencias'
 * @param {Date|string|null} dateFrom - Fecha de inicio (inclusive)
 * @param {Date|string|null} dateTo   - Fecha de fin (inclusive)
 */
export const applyFilters = (bookings, teamFilter, dateFrom, dateTo) => {
  const startTs = dateFrom ? getUtcStartOfDay(dateFrom) : null;
  const endTs = dateTo ? getUtcEndOfDay(dateTo) : null;

  const result = bookings.filter((b) => {
    // Filtro por equipo
    if (teamFilter && teamFilter !== "Todos") {
      const ch = channels.find((c) => c.id === b.channel_id);
      if (!ch || ch.team !== teamFilter) return false;
    }
    // Filtro por fecha (sobre created_at)
    if (startTs !== null || endTs !== null) {
      const ts = toTs(b.created_at);
      if (startTs !== null && ts < startTs) return false;
      if (endTs !== null && ts > endTs) return false;
    }
    return true;
  });

  result._filterMeta = { teamFilter, dateFrom, dateTo };
  return result;
};

// ── KPI 1: Ingresos Totales ──────────────────────────────────

/**
 * Suma de amount donde status === 'confirmed'.
 * Compara contra el período anterior de la misma duración (si hay rango activo)
 * o contra el mes inmediatamente anterior (si no hay rango activo).
 */
export const getTotalRevenue = (
  bookings,
  dateFrom = null,
  dateTo = null,
  teamFilter = null,
  allBookings = allMockBookings
) => {
  const meta = bookings?._filterMeta || {};
  const activeDateFrom = dateFrom !== null && dateFrom !== undefined ? dateFrom : meta.dateFrom;
  const activeDateTo = dateTo !== null && dateTo !== undefined ? dateTo : meta.dateTo;
  const activeTeam = teamFilter !== null && teamFilter !== undefined ? teamFilter : (meta.teamFilter || "Todos");

  const isDateRangeActive = Boolean(activeDateFrom || activeDateTo);

  let total = 0;
  bookings.forEach((b) => {
    if (b.status === "confirmed") total += b.amount;
  });

  let currentRevenue = 0;
  let prevRevenue = 0;
  let currentMonthRevenue = 0;
  let prevMonthRevenue = 0;
  let change = null;
  let subtext = "vs. mes anterior";

  if (isDateRangeActive) {
    subtext = "vs. período anterior";
    currentRevenue = total;

    const baseBookings = allBookings || bookings;
    const allTs = baseBookings.map((b) => toTs(b.created_at)).filter(Boolean);
    const minDatasetTs = allTs.length > 0 ? Math.min(...allTs) : 0;
    const maxDatasetTs = allTs.length > 0 ? Math.max(...allTs) : Date.now();

    const startMs = activeDateFrom ? getUtcStartOfDay(activeDateFrom) : minDatasetTs;
    const endMs = activeDateTo ? getUtcEndOfDay(activeDateTo) : maxDatasetTs;
    const durationMs = Math.max(1, endMs - startMs + 1);

    const prevEndMs = startMs - 1;
    const prevStartMs = startMs - durationMs;

    const channelTeamMap = new Map(channels.map((c) => [c.id, c.team]));
    const prevConfirmed = baseBookings.filter((b) => {
      if (b.status !== "confirmed") return false;
      if (activeTeam && activeTeam !== "Todos") {
        if (channelTeamMap.get(b.channel_id) !== activeTeam) return false;
      }
      const ts = toTs(b.created_at);
      return ts >= prevStartMs && ts <= prevEndMs;
    });

    prevRevenue = prevConfirmed.reduce((sum, b) => sum + b.amount, 0);

    if (prevRevenue > 0) {
      change = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    } else {
      change = null;
    }
  } else {
    subtext = "vs. mes anterior";
    const confirmed = bookings.filter((b) => b.status === "confirmed");
    const months = Array.from(
      new Set(confirmed.map((b) => toMonthKey(b.closed_at || b.created_at)).filter(Boolean))
    ).sort();

    if (months.length > 0) {
      const latestMonth = months[months.length - 1];
      const [y, m] = latestMonth.split("-").map(Number);
      const prevMonthDate = new Date(Date.UTC(y, m - 2, 1));
      const prevMonth = `${prevMonthDate.getUTCFullYear()}-${String(prevMonthDate.getUTCMonth() + 1).padStart(2, "0")}`;

      confirmed.forEach((b) => {
        const mKey = toMonthKey(b.closed_at || b.created_at);
        if (mKey === latestMonth) currentMonthRevenue += b.amount;
        if (mKey === prevMonth) prevMonthRevenue += b.amount;
      });

      currentRevenue = currentMonthRevenue;
      prevRevenue = prevMonthRevenue;

      if (prevMonthRevenue > 0) {
        change = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
      } else {
        change = null;
      }
    }
  }

  return {
    total,
    currentRevenue: isDateRangeActive ? currentRevenue : currentMonthRevenue,
    prevRevenue: isDateRangeActive ? prevRevenue : prevMonthRevenue,
    currentMonthRevenue,
    prevMonthRevenue,
    change,
    subtext,
    comparisonLabel: subtext,
    badgeText: change === null ? "sin datos comparables" : null,
  };
};

// ── KPI 2: Reservas Activas ──────────────────────────────────

/** Conteo de reservas con status === 'open' */
export const getActiveBookings = (bookings) => {
  return bookings.filter((b) => b.status === "open").length;
};

// ── KPI 3: Tasa de Conversión (Win Rate) ────────────────────

/**
 * confirmed / (confirmed + cancelled) * 100
 * Solo sobre reservas cerradas (excluye 'open').
 */
export const getConversionRate = (bookings) => {
  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled").length;
  const closed = confirmed + cancelled;
  if (closed === 0) return 0;
  return (confirmed / closed) * 100;
};

// ── KPI 4: Tarifa Promedio ───────────────────────────────────

/** Promedio de amount entre reservas confirmadas */
export const getAverageFare = (bookings) => {
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  if (confirmed.length === 0) return 0;
  const sum = confirmed.reduce((acc, b) => acc + b.amount, 0);
  return sum / confirmed.length;
};

// ── Gráfico de Barras: Ingresos por Estado ───────────────────

/**
 * Devuelve array ordenado por display_order con el total de amount
 * de todas las reservas agrupadas por stage_id.
 */
export const getRevenueByStage = (bookings) => {
  const stageMap = {};
  stages.forEach((s) => {
    stageMap[s.id] = { ...s, revenue: 0, count: 0 };
  });

  bookings.forEach((b) => {
    if (stageMap[b.stage_id]) {
      stageMap[b.stage_id].revenue += b.amount;
      stageMap[b.stage_id].count += 1;
    }
  });

  return Object.values(stageMap).sort((a, b) => a.display_order - b.display_order);
};

// ── Gráfico de Línea: Evolución mensual ─────────────────────

/**
 * Agrupa reservas confirmadas por mes de created_at (o closed_at)
 * y devuelve array [{month, revenue, label}] ordenado cronológicamente.
 */
export const getRevenueByMonth = (bookings) => {
  const monthMap = {};

  bookings.forEach((b) => {
    if (b.status !== "confirmed") return;
    const key = toMonthKey(b.closed_at || b.created_at);
    if (!key) return;
    if (!monthMap[key]) monthMap[key] = { month: key, revenue: 0, count: 0 };
    monthMap[key].revenue += b.amount;
    monthMap[key].count += 1;
  });

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return Object.values(monthMap)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      ...m,
      label: monthNames[parseInt(m.month.split("-")[1], 10) - 1],
    }));
};

// ── Panel Operativo ──────────────────────────────────────────

/** Métricas rápidas del panel "Estado Operativo" */
export const getOperationalStatus = (bookings) => {
  const scheduledFlights = flights.filter(
    (f) => f.status === "scheduled" || f.status === "boarding"
  ).length;

  const delayedFlights = flights.filter((f) => f.delay_minutes > 0).length;

  const completedFlights = flights.filter(
    (f) => f.status === "arrived"
  ).length;

  const pendingPayment = bookings.filter(
    (b) => b.status === "open" && (b.stage_id === "s2" || b.stage_id === "s3")
  ).length;

  return { scheduledFlights, delayedFlights, completedFlights, pendingPayment };
};

// ── Últimas Reservas ─────────────────────────────────────────

/**
 * Devuelve las últimas N reservas ordenadas por created_at descendente,
 * con datos de pasajero y vuelo ya resueltos.
 */
export const getLatestBookings = (bookings, passengers, flights, n = 8) => {
  const sorted = [...bookings].sort(
    (a, b) => toTs(b.created_at) - toTs(a.created_at)
  );

  return sorted.slice(0, n).map((b) => {
    const passenger = passengers.find((p) => p.id === b.passenger_id);
    const flight = flights.find((f) => f.id === b.flight_id);
    return {
      ...b,
      passenger_name: passenger ? passenger.full_name : "—",
      route: flight ? flight.route : "—",
    };
  });
};

// ── Formatters ───────────────────────────────────────────────

/** Formatea un número como moneda COP compacta */
export const formatCOP = (value) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString("es-CO")}`;
};

/** Formatea un número completo como COP legible */
export const formatCOPFull = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
