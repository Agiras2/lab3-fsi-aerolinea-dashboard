// TopNav.jsx — Barra de navegación superior con pestañas y filtros

import styles from "./TopNav.module.css";

const tabs = [
  { id: "overview",   label: "Resumen General" },
  { id: "channels",   label: "Canales de Venta" },
  { id: "routes",     label: "Rutas" },
  { id: "passengers", label: "Pasajeros" },
];

const teams = ["Todos", "Directo", "Digital", "Agencias"];

export default function TopNav({
  activeTab,
  onTabChange,
  teamFilter,
  onTeamChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onReset,
}) {
  return (
    <header className={styles.topNav}>
      {/* Pestañas */}
      <nav className={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Filtros */}
      <div className={styles.filters}>
        <span className={styles.filterLabel}>Equipo:</span>
        <select
          className={styles.select}
          value={teamFilter}
          onChange={(e) => onTeamChange(e.target.value)}
        >
          {teams.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <div className={styles.filterSep} />

        <input
          type="date"
          className={styles.dateInput}
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          title="Desde"
        />
        <span className={styles.filterLabel}>→</span>
        <input
          type="date"
          className={styles.dateInput}
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          title="Hasta"
        />

        <button className={styles.resetBtn} onClick={onReset}>
          Limpiar
        </button>
      </div>
    </header>
  );
}
