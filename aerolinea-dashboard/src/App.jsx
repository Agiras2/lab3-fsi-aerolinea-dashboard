// App.jsx — Componente raíz: gestiona el estado de filtros y distribuye datos

import { useState, useMemo } from "react";
import "./App.css";

// Datos
import { bookings as initialBookings, passengers, flights } from "./data/mockData";

// Utilidades de cálculo
import {
  applyFilters,
  getTotalRevenue,
  getActiveBookings,
  getConversionRate,
  getAverageFare,
  getRevenueByStage,
  getRevenueByMonth,
  getOperationalStatus,
  getLatestBookings,
  formatCOP,
} from "./utils/metrics";

// Métricas de las vistas ampliadas del CRM (Fase 4)
import {
  getChannelPerformance,
  getRoutePerformance,
  getPassengerSegments,
  getTopPassengers,
  buildAssistantContext,
} from "./utils/crmMetrics";

// Componentes
import Sidebar from "./components/Sidebar/Sidebar";
import TopNav from "./components/TopNav/TopNav";
import KPICard from "./components/KPICard/KPICard";
import RevenueBarChart from "./components/RevenueBarChart/RevenueBarChart";
import RevenueLineChart from "./components/RevenueLineChart/RevenueLineChart";
import LiveStatusPanel from "./components/LiveStatusPanel/LiveStatusPanel";
import BookingsTable from "./components/BookingsTable/BookingsTable";
import ChatAssistant from "./components/ChatAssistant/ChatAssistant";
import ChannelsView from "./components/Views/ChannelsView";
import RoutesView from "./components/Views/RoutesView";
import PassengersView from "./components/Views/PassengersView";
import NewBookingModal from "./components/NewBookingModal/NewBookingModal";

// ── Iconos para los KPI cards ────────────────────────────────
const RevenueIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const BookingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12" />
    <path d="M22 7H2v5h20V7z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);

const ConversionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const FareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ── Títulos por pestaña ──────────────────────────────────────
const TAB_TITLES = {
  overview: "Panel Comercial",
  channels: "Canales de Venta",
  routes: "Rutas y Ocupación",
  passengers: "Pasajeros y Fidelización",
};

export default function App() {
  // ── Estado de datos (permite añadir reservas en vivo) ────────
  const [allBookings, setAllBookings] = useState(initialBookings);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Estado de filtros ────────────────────────────────────────
  const [activeNav, setActiveNav] = useState("analytics");
  const [activeTab, setActiveTab] = useState("overview");
  const [teamFilter, setTeamFilter] = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const handleReset = () => {
    setTeamFilter("Todos");
    setDateFrom("");
    setDateTo("");
  };

  const handleCreateBooking = (booking) => {
    setAllBookings((prev) => [booking, ...prev]);
  };

  // ── Datos filtrados ──────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    return applyFilters(allBookings, teamFilter, from, to);
  }, [allBookings, teamFilter, dateFrom, dateTo]);

  // ── KPIs calculados ─────────────────────────────────────────
  const revenue = useMemo(
    () => getTotalRevenue(filteredBookings, null, null, null, allBookings),
    [filteredBookings, allBookings]
  );
  const activeCount = useMemo(() => getActiveBookings(filteredBookings), [filteredBookings]);
  const conversion = useMemo(() => getConversionRate(filteredBookings), [filteredBookings]);
  const avgFare = useMemo(() => getAverageFare(filteredBookings), [filteredBookings]);

  // ── Datos para gráficos ─────────────────────────────────────
  const stageData = useMemo(() => getRevenueByStage(filteredBookings), [filteredBookings]);
  const monthData = useMemo(() => getRevenueByMonth(filteredBookings), [filteredBookings]);
  const opStatus = useMemo(() => getOperationalStatus(filteredBookings), [filteredBookings]);
  const latestBkgs = useMemo(
    () => getLatestBookings(filteredBookings, passengers, flights, 8),
    [filteredBookings]
  );

  // ── Datos de las vistas ampliadas del CRM ───────────────────
  const channelPerf = useMemo(() => getChannelPerformance(filteredBookings), [filteredBookings]);
  const routePerf = useMemo(() => getRoutePerformance(filteredBookings), [filteredBookings]);
  const segments = useMemo(() => getPassengerSegments(filteredBookings), [filteredBookings]);
  const topPax = useMemo(() => getTopPassengers(filteredBookings, 12), [filteredBookings]);

  // ── Contexto que se envía al asistente de IA ────────────────
  const assistantContext = useMemo(
    () =>
      buildAssistantContext({
        teamFilter,
        dateFrom,
        dateTo,
        revenue,
        activeCount,
        conversion,
        avgFare,
        totalBookings: filteredBookings.length,
        stageData,
        channelPerf,
        routePerf,
        segments,
        opStatus,
      }),
    [
      teamFilter, dateFrom, dateTo, revenue, activeCount, conversion, avgFare,
      filteredBookings, stageData, channelPerf, routePerf, segments, opStatus,
    ]
  );

  return (
    <div className="dashboard-root">
      {/* ── Sidebar ─────────────────────────────────── */}
      <Sidebar activeNav={activeNav} onNavChange={setActiveNav} />

      {/* ── Área principal ─────────────────────────── */}
      <main className="dashboard-main">
        {/* Barra de navegación superior */}
        <TopNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          teamFilter={teamFilter}
          onTeamChange={setTeamFilter}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
          onReset={handleReset}
        />

        {/* Contenido desplazable */}
        <div className="dashboard-content">

          {/* Título de sección */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
            <h1 style={{
              fontSize: "26px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}>
              {TAB_TITLES[activeTab] || "Panel Comercial"}
            </h1>
            <span style={{
              fontSize: "14px",
              color: "var(--text-tertiary)",
              fontWeight: 500,
            }}>
              {teamFilter !== "Todos" ? `· ${teamFilter}` : "· Todos los canales"}
              {dateFrom && ` · desde ${dateFrom}`}
              {dateTo && ` hasta ${dateTo}`}
            </span>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                background: "var(--accent)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "999px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font)",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(255, 107, 74, 0.32)",
              }}
            >
              <PlusIcon />
              Nueva Reserva
            </button>
          </div>

          {/* ── Fila de KPIs ────────────────────────── */}
          <div className="kpi-row">
            <KPICard
              label="Ingresos Totales"
              value={formatCOP(revenue.total)}
              icon={<RevenueIcon />}
              iconBg="var(--accent-soft)"
              iconColor="var(--accent)"
              change={revenue.change}
              subtext={revenue.subtext}
              badgeText={revenue.badgeText}
            />
            <KPICard
              label="Reservas Activas"
              value={String(activeCount)}
              icon={<BookingIcon />}
              iconBg="var(--blue-soft)"
              iconColor="var(--blue)"
              change={null}
              subtext={`de ${filteredBookings.length} reservas totales`}
            />
            <KPICard
              label="Tasa de Conversión"
              value={`${conversion.toFixed(1)}%`}
              icon={<ConversionIcon />}
              iconBg="var(--green-soft)"
              iconColor="var(--green)"
              change={null}
              subtext="confirmadas / (conf. + canceladas)"
            />
            <KPICard
              label="Tarifa Promedio"
              value={formatCOP(avgFare)}
              icon={<FareIcon />}
              iconBg="var(--amber-soft)"
              iconColor="var(--amber)"
              change={null}
              subtext="reservas confirmadas"
            />
          </div>

          {/* ── Cuerpo principal (2 columnas) ────────── */}
          <div className="content-body">

            {/* Columna central: cambia según la pestaña activa */}
            <div className="content-center">
              {activeTab === "overview" && (
                <>
                  <RevenueBarChart data={stageData} />
                  <RevenueLineChart data={monthData} />
                  <BookingsTable bookings={latestBkgs} />
                </>
              )}

              {activeTab === "channels" && <ChannelsView channels={channelPerf} />}

              {activeTab === "routes" && <RoutesView routes={routePerf} />}

              {activeTab === "passengers" && (
                <PassengersView segments={segments} topPassengers={topPax} />
              )}
            </div>

            {/* Columna lateral derecha */}
            <aside className="content-side">
              <LiveStatusPanel
                status={opStatus}
                conversionRate={conversion}
                totalBookings={filteredBookings.length}
              />
              <ChatAssistant context={assistantContext} />
            </aside>
          </div>

        </div>
      </main>

      {/* ── Modal de nueva reserva ──────────────────── */}
      <NewBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateBooking}
        nextIndex={allBookings.length + 1}
      />
    </div>
  );
}
