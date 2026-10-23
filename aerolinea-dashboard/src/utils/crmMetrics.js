// ============================================================
// crmMetrics.js — Métricas de las vistas ampliadas del CRM
// Fase 4: Canales de Venta, Rutas, Pasajeros y contexto del asistente.
// Todas las funciones son PURAS: reciben las reservas ya filtradas
// y devuelven agregados listos para pintar.
// ============================================================

import { channels, flights, passengers } from "../data/mockData";

// ── Vista: Canales de Venta ─────────────────────────────────

/**
 * Rendimiento comercial por canal: ingresos reales contra la meta
 * asignada (quota_amount), número de reservas, tarifa promedio
 * y tasa de conversión propia del canal.
 */
export const getChannelPerformance = (bookings) => {
  return channels
    .map((ch) => {
      const own = bookings.filter((b) => b.channel_id === ch.id);
      const confirmed = own.filter((b) => b.status === "confirmed");
      const cancelled = own.filter((b) => b.status === "cancelled").length;
      const revenue = confirmed.reduce((sum, b) => sum + b.amount, 0);
      const closed = confirmed.length + cancelled;

      return {
        ...ch,
        bookingsCount: own.length,
        confirmedCount: confirmed.length,
        openCount: own.filter((b) => b.status === "open").length,
        revenue,
        avgFare: confirmed.length ? revenue / confirmed.length : 0,
        quotaPct: ch.quota_amount ? (revenue / ch.quota_amount) * 100 : 0,
        conversion: closed ? (confirmed.length / closed) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
};

// ── Vista: Rutas ────────────────────────────────────────────

/**
 * Rendimiento por ruta. Calcula el Factor de Ocupación:
 * pasajeros confirmados sobre la capacidad total de los vuelos
 * que cubren esa ruta.
 */
export const getRoutePerformance = (bookings) => {
  const flightById = new Map(flights.map((f) => [f.id, f]));
  const map = {};

  bookings.forEach((b) => {
    const f = flightById.get(b.flight_id);
    if (!f) return;

    if (!map[f.route]) {
      map[f.route] = {
        route: f.route,
        origin: f.origin,
        destination: f.destination,
        revenue: 0,
        bookingsCount: 0,
        pax: 0,
        flightIds: new Set(),
      };
    }

    const r = map[f.route];
    r.bookingsCount += 1;
    r.flightIds.add(f.id);

    if (b.status === "confirmed") {
      r.revenue += b.amount;
      r.pax += b.passengers_count || 1;
    }
  });

  return Object.values(map)
    .map((r) => {
      let seats = 0;
      let delayed = 0;
      let totalDelayMin = 0;

      r.flightIds.forEach((id) => {
        const f = flightById.get(id);
        if (!f) return;
        seats += f.total_seats || 0;
        if (f.delay_minutes > 0) {
          delayed += 1;
          totalDelayMin += f.delay_minutes;
        }
      });

      const { flightIds, ...rest } = r;
      return {
        ...rest,
        flightsCount: flightIds.size,
        seats,
        delayedFlights: delayed,
        avgDelay: delayed ? Math.round(totalDelayMin / delayed) : 0,
        occupancy: seats ? (r.pax / seats) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
};

// ── Vista: Pasajeros ────────────────────────────────────────

/**
 * Segmentación por nivel de fidelización (Basic / Gold / Platinum),
 * heredado del motor de reglas del laboratorio anterior.
 */
export const getPassengerSegments = (bookings) => {
  const byId = new Map(passengers.map((p) => [p.id, p]));
  const levels = ["Basic", "Gold", "Platinum"];

  const seg = {};
  levels.forEach((l) => {
    seg[l] = { ids: new Set(), bookingsCount: 0, revenue: 0 };
  });

  bookings.forEach((b) => {
    const p = byId.get(b.passenger_id);
    if (!p || !seg[p.membership]) return;
    const s = seg[p.membership];
    s.ids.add(p.id);
    s.bookingsCount += 1;
    if (b.status === "confirmed") s.revenue += b.amount;
  });

  return levels.map((level) => {
    const s = seg[level];
    const ids = Array.from(s.ids);
    const points = ids.reduce(
      (acc, id) => acc + (byId.get(id)?.loyalty_points || 0),
      0
    );
    return {
      membership: level,
      passengersCount: ids.length,
      bookingsCount: s.bookingsCount,
      revenue: s.revenue,
      avgPoints: ids.length ? Math.round(points / ids.length) : 0,
      avgTicket: s.bookingsCount ? s.revenue / s.bookingsCount : 0,
    };
  });
};

/** Pasajeros ordenados por valor acumulado (los más rentables primero). */
export const getTopPassengers = (bookings, n = 12) => {
  const byId = new Map(passengers.map((p) => [p.id, p]));
  const agg = {};

  bookings.forEach((b) => {
    if (!agg[b.passenger_id]) {
      agg[b.passenger_id] = { id: b.passenger_id, bookingsCount: 0, revenue: 0 };
    }
    agg[b.passenger_id].bookingsCount += 1;
    if (b.status === "confirmed") agg[b.passenger_id].revenue += b.amount;
  });

  return Object.values(agg)
    .map((a) => {
      const p = byId.get(a.id) || {};
      return {
        ...a,
        full_name: p.full_name || "—",
        membership: p.membership || "—",
        loyalty_points: p.loyalty_points || 0,
        email: p.email || "—",
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, n);
};

// ── Integración con el ChatBot ──────────────────────────────

const money = (v) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Math.round(v || 0));

/**
 * Construye una instantánea en texto del estado actual del dashboard.
 * Se envía a n8n junto con cada mensaje para que el agente de IA
 * pueda responder con las cifras reales del panel en lugar de
 * limitarse a explicar qué significa cada indicador.
 */
export const buildAssistantContext = ({
  teamFilter,
  dateFrom,
  dateTo,
  revenue,
  activeCount,
  conversion,
  avgFare,
  totalBookings,
  stageData,
  channelPerf,
  routePerf,
  segments,
  opStatus,
}) => {
  const lines = [];

  lines.push("FILTROS ACTIVOS");
  lines.push(`- Equipo comercial: ${teamFilter || "Todos"}`);
  lines.push(
    `- Rango de fechas: ${dateFrom || "sin limite inferior"} a ${dateTo || "sin limite superior"}`
  );
  lines.push(`- Reservas incluidas en el periodo: ${totalBookings}`);
  lines.push("");

  lines.push("KPIS PRINCIPALES");
  lines.push(`- Ingresos Totales: ${money(revenue?.total)}`);
  if (revenue?.change !== null && revenue?.change !== undefined) {
    lines.push(
      `- Variacion: ${revenue.change >= 0 ? "+" : ""}${revenue.change.toFixed(1)}% ${revenue.subtext}`
    );
  } else {
    lines.push("- Variacion: sin datos comparables en el periodo anterior");
  }
  lines.push(`- Reservas Activas (abiertas, sin emitir): ${activeCount}`);
  lines.push(`- Tasa de Conversion: ${Number(conversion || 0).toFixed(1)}%`);
  lines.push(`- Tarifa Promedio: ${money(avgFare)}`);
  lines.push("");

  if (stageData?.length) {
    lines.push("INGRESOS POR ETAPA DEL PIPELINE");
    stageData.forEach((s) => {
      lines.push(`- ${s.name}: ${money(s.revenue)} en ${s.count} reservas`);
    });
    lines.push("");
  }

  if (channelPerf?.length) {
    lines.push("RENDIMIENTO POR CANAL DE VENTA (ingresos vs meta)");
    channelPerf.forEach((c) => {
      lines.push(
        `- ${c.full_name} (equipo ${c.team}): ${money(c.revenue)} de una meta de ${money(c.quota_amount)} = ${c.quotaPct.toFixed(0)}% de cumplimiento, ${c.bookingsCount} reservas, conversion ${c.conversion.toFixed(0)}%`
      );
    });
    lines.push("");
  }

  if (routePerf?.length) {
    lines.push("TOP 8 RUTAS POR INGRESOS");
    routePerf.slice(0, 8).forEach((r) => {
      lines.push(
        `- ${r.route}: ${money(r.revenue)}, ${r.bookingsCount} reservas, ${r.pax} pasajeros, factor de ocupacion ${r.occupancy.toFixed(0)}%, ${r.delayedFlights} vuelos con retraso`
      );
    });
    lines.push("");
  }

  if (segments?.length) {
    lines.push("SEGMENTACION POR NIVEL DE FIDELIZACION");
    segments.forEach((s) => {
      lines.push(
        `- ${s.membership}: ${s.passengersCount} pasajeros, ${s.bookingsCount} reservas, ${money(s.revenue)} en ingresos, promedio ${s.avgPoints} puntos`
      );
    });
    lines.push("");
  }

  if (opStatus) {
    lines.push("ESTADO OPERATIVO");
    lines.push(`- Vuelos programados: ${opStatus.scheduledFlights}`);
    lines.push(`- Reservas pendientes de pago: ${opStatus.pendingPayment}`);
    lines.push(`- Vuelos con retraso: ${opStatus.delayedFlights}`);
    lines.push(`- Vuelos completados: ${opStatus.completedFlights}`);
  }

  return lines.join("\n");
};
