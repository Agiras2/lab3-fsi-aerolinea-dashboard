# Laboratorio 3 — Integración de n8n con Agentes de IA

**Dashboard Comercial para una Aerolínea Virtual**

Universidad de Antioquia · Facultad de Ingeniería
Curso: Fundamentos de Sistemas de Información · Semestre 2026-2
Docente: Ph.D. Diego José Luis Botía Valderrama
Estudiante: Andrés Giraldo Arismendy

---

## Descripción

Dashboard comercial construido mediante *vibecoding* (desarrollo asistido por IA) con el IDE Google Antigravity, e integrado con un agente de inteligencia artificial autónomo alojado en n8n.

El sistema continúa el dominio de la **aerolínea virtual** trabajado en los laboratorios anteriores del curso (Laboratorio 1 con JHipster y Laboratorio 2 con Drools), reutilizando sus entidades —Pasajero, Reserva, Vuelo— y sus conceptos de negocio, como los niveles de fidelización Basic, Gold y Platinum.

El panel permite al Gerente Comercial de la aerolínea monitorear los ingresos por venta de tiquetes y la salud del embudo de reservas, y conversar con un asistente de IA que responde con las cifras reales del tablero.

---

## Estructura del repositorio

```
lab3fsi/
├── aerolinea-dashboard/    Aplicación frontend (React + Vite)
│   └── src/
│       ├── data/           Datos simulados (mock data)
│       ├── utils/          Cálculo de KPIs y métricas del CRM
│       └── components/     Componentes de interfaz
├── n8n/                    Exportación del workflow del agente de IA (.json)
├── recursos/               Esquema de datos e imagen de referencia de diseño
└── capturas/               Evidencias gráficas del procedimiento
```

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 19 + Vite |
| Gráficas | Recharts |
| Estilos | CSS Modules con sistema de design tokens |
| Orquestación de IA | n8n Cloud (Webhook → AI Agent → Respond to Webhook) |
| Modelo de lenguaje | Google Gemini (`gemini-3-flash-preview`) vía Google AI Studio |
| Memoria conversacional | Simple Memory de n8n, ventana de 10 interacciones |

No se utiliza base de datos real: toda la información proviene de un archivo de datos simulados (`src/data/mockData.js`) con 4 canales de venta, 7 estados de reserva, 30 pasajeros, 24 vuelos y 90 reservas.

---

## Funcionalidades

**Resumen General.** Cuatro KPIs calculados en tiempo real sobre el conjunto de reservas —Ingresos Totales, Reservas Activas, Tasa de Conversión y Tarifa Promedio—, gráfico de barras de ingresos por etapa del pipeline, gráfico de línea de evolución mensual, panel de estado operativo y tabla de últimas reservas.

**Canales de Venta.** Rendimiento de cada canal con ingresos reales frente a la meta asignada, barra de cumplimiento, tarifa promedio y conversión propia.

**Rutas.** Ingresos por ruta y **Factor de Ocupación** (pasajeros confirmados sobre sillas ofertadas), junto con el reporte de vuelos con retraso.

**Pasajeros.** Segmentación por nivel de fidelización con puntos acumulados y ranking de clientes por valor.

**Nueva Reserva.** Formulario que registra una reserva y provoca el recálculo inmediato de todos los indicadores, lo que evidencia que los KPIs son cálculos reales y no valores fijos.

**Asistente de IA.** Ventana de chat conectada al workflow de n8n. En cada mensaje el frontend envía una instantánea del estado del tablero —filtros aplicados, KPIs, ingresos por etapa, cumplimiento por canal, rutas y segmentación—, de modo que el agente responde con las cifras concretas que el usuario está viendo y advierte cuando un filtro está recortando los datos.

---

## Cómo ejecutar el proyecto

Requisitos: Node.js 18 o superior.

```bash
cd aerolinea-dashboard
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

### Reproducir el backend de IA

1. Importar `n8n/asistente-ia-aerolinea-virtual.json` en una instancia de n8n.
2. Crear una credencial de *Google Gemini(PaLM) Api* con una clave obtenida en Google AI Studio, usando como host `https://generativelanguage.googleapis.com`.
3. Publicar el workflow y copiar su *Production URL*.
4. Reemplazar la constante `WEBHOOK_URL` en `src/components/ChatAssistant/ChatAssistant.jsx` por esa dirección.

> La clave de API no se incluye en el repositorio. El archivo exportado del workflow contiene únicamente una referencia interna a la credencial, nunca el secreto.

---

## Nota sobre el flujo de trabajo

El proyecto se construyó siguiendo la metodología de *vibecoding* propuesta en la guía del laboratorio: definición previa del esquema de datos, prompt maestro con referencia visual adjunta e iteración sobre el resultado generado. Durante el desarrollo se documentaron las correcciones que el agente no detectó por sí mismo y las limitaciones operativas encontradas; el detalle se encuentra en el informe del laboratorio.
