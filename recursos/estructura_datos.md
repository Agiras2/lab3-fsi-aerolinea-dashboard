# Estructura de DATOS: Dashboard Comercial — Aerolínea Virtual

## 0. Contexto del Caso de Uso

**Dominio:** aerolínea virtual (continuación del sistema `aerolineaVirtual` construido en laboratorios previos con las entidades Pasajero, Reserva, Vuelo y Asiento).

**Problema / KPI a monitorear:** los ingresos por venta de tiquetes y la salud del embudo de reservas — cuánto se vende, cuántas reservas quedan estancadas antes de emitirse, qué porcentaje de cotizaciones termina en vuelo y cuál es la tarifa promedio.

**Usuario final:** el Gerente Comercial de la aerolínea. Perfil **ejecutivo, no técnico**: necesita leer el estado del negocio en segundos, sin consultas ni tablas crudas.

**Acción que toma con los datos:** redistribuir el esfuerzo comercial. Si hay muchas reservas atascadas en "Reservada" sin pasar a "Emitida", lanza una campaña de recuperación de pago; si un canal está por debajo de su meta, lo refuerza; si una ruta tiene baja ocupación, ajusta tarifa o frecuencia.

---

## 1. Tabla de Canales de Venta (Equipo Comercial)

Esta entidad es necesaria para los filtros del dashboard (ver el rendimiento individual de un canal vs. el equipo completo). Es el equivalente aeronáutico de la "tabla de vendedores" de un CRM: aquí no vende una persona, vende un canal de distribución.

```json
{
  "id": "string (UUID - identificador único del canal de venta)",
  "full_name": "string (Nombre del canal, ej: 'Counter Aeropuerto MDE', 'Sitio Web y App')",
  "team": "string (Equipo comercial al que pertenece: 'Directo', 'Digital', 'Agencias') — ESTE CAMPO ALIMENTA EL FILTRO POR EQUIPO",
  "email": "string (Correo corporativo del responsable)",
  "role": "string (Permisos: 'admin', 'supervisor', 'agente')",
  "avatar_url": "string (URL de la imagen para mostrar en la interfaz)",
  "quota_amount": "decimal (Meta mensual de ingresos asignada al canal, para comparar vs ingresos reales)",
  "status": "string (active, inactive)"
}
```

## 2. Tabla de Estados de Reserva (Pipeline)

Define las columnas del gráfico de barras "Ingresos por Estado de Reserva". Es vital que sea una tabla separada para poder reordenar o cambiar nombres en el futuro sin romper los datos.

```json
{
  "id": "string (UUID - identificador del estado)",
  "name": "string (Nombre visible: 'Cotización', 'Reservada', 'Emitida', 'Check-in', 'Abordada', 'Cancelada', 'No-show')",
  "display_order": "integer (1, 2, 3... para ordenar el gráfico de izquierda a derecha)",
  "conversion_probability": "integer (Porcentaje estimado de que la reserva llegue a volar, ej: 45%)",
  "color_hint": "string (Sugerencia de color para la gráfica: 'gris', 'azul', 'naranja', 'verde', 'rojo')"
}
```

**Valores fijos del pipeline (usar exactamente estos):**

| id | name | display_order | conversion_probability | color_hint |
|----|------|---------------|------------------------|------------|
| s1 | Cotización | 1 | 10 | gris |
| s2 | Reservada | 2 | 45 | azul |
| s3 | Emitida | 3 | 85 | naranja |
| s4 | Check-in | 4 | 97 | naranja |
| s5 | Abordada | 5 | 100 | verde |
| s6 | Cancelada | 6 | 0 | rojo |
| s7 | No-show | 7 | 0 | rojo |

## 3. Tabla de Pasajeros

La entidad a la que le vendemos. Es el equivalente de "Clientes" en un CRM. El campo `membership` proviene del motor de reglas de negocio del laboratorio anterior (Drools) y sirve para segmentar.

```json
{
  "id": "string (UUID - identificador único)",
  "full_name": "string (Nombre completo del pasajero)",
  "document_id": "string (Documento de identidad, ej: 'CC 1017234567')",
  "email": "string (Email de contacto)",
  "phone": "string (Teléfono)",
  "membership": "string (Nivel de fidelización: 'Basic', 'Gold', 'Platinum')",
  "loyalty_points": "integer (Puntos acumulados del programa de viajero frecuente)",
  "created_at": "datetime (Fecha de alta en el sistema)"
}
```

## 4. Tabla de Vuelos

El "producto" que se vende. No existe en un CRM genérico, pero es imprescindible aquí: permite agrupar ingresos por ruta y calcular el Factor de Ocupación.

```json
{
  "id": "string (UUID - identificador único)",
  "flight_number": "string (Número de vuelo, ej: 'AV8432')",
  "origin": "string (Código IATA del origen, ej: 'MDE')",
  "destination": "string (Código IATA del destino, ej: 'BOG')",
  "route": "string (Ruta legible para agrupar en gráficas, ej: 'MDE - BOG')",
  "departure_at": "datetime (Fecha y hora de salida programada)",
  "arrival_at": "datetime (Fecha y hora de llegada programada)",
  "aircraft": "string (Equipo asignado, ej: 'Airbus A320', 'Boeing 787-8')",
  "total_seats": "integer (Capacidad total de la aeronave. ALIMENTA EL FACTOR DE OCUPACIÓN)",
  "delay_minutes": "integer (Minutos de retraso. 0 si salió a tiempo)",
  "status": "string ('scheduled', 'boarding', 'departed', 'arrived', 'cancelled')"
}
```

## 5. Tabla de Reservas (Tabla central de hechos)

Esta es la tabla más importante. De aquí salen TODOS los KPIs (Ingresos Totales, Tasa de Conversión, Reservas Activas, Tarifa Promedio). Es el equivalente exacto de la tabla "Deals" de un CRM.

```json
{
  "id": "string (UUID - identificador único de la reserva)",
  "booking_code": "string (Localizador de 6 caracteres, ej: 'AV7K2P')",

  "passenger_id": "string (Foreign Key -> Tabla Pasajeros. Quién viaja)",
  "flight_id": "string (Foreign Key -> Tabla Vuelos. En qué vuelo)",
  "channel_id": "string (Foreign Key -> Tabla Canales de Venta. Quién hizo la venta)",
  "stage_id": "string (Foreign Key -> Tabla Estados. Dónde está la reserva ahora)",

  "amount": "decimal (Valor total pagado en COP. ALIMENTA 'Ingresos Totales' Y 'Tarifa Promedio')",
  "currency": "string (ISO code, ej: 'COP', 'USD')",

  "cabin_class": "string ('Economy', 'Premium', 'Business')",
  "seat_number": "string (Asiento asignado, ej: '14A')",
  "passengers_count": "integer (Número de pasajeros cubiertos por la reserva)",
  "baggage_kg": "decimal (Kilos de equipaje facturado)",

  "status": "string (Estado final: 'open', 'confirmed', 'cancelled'. VITAL PARA LA TASA DE CONVERSIÓN)",

  "created_at": "datetime (Fecha de creación. Alimenta el KPI '+N esta semana')",
  "expected_departure_date": "date (Fecha prevista de vuelo. Para previsión de ingresos)",
  "closed_at": "datetime (Fecha real de emisión o cancelación. Para gráficas históricas)",

  "cancel_reason": "string (Opcional. Por qué se perdió: 'precio', 'cambio de planes', 'no-show', 'competencia')"
}
```

---

## Resumen de Relaciones para el Desarrollador

- **1 Canal de Venta gestiona N Reservas.**
- **1 Pasajero puede tener N Reservas** (histórico de viajes).
- **1 Vuelo contiene N Reservas** (base del Factor de Ocupación e ingresos por ruta).
- **1 Estado de Reserva contiene N Reservas** (para agrupar en el gráfico de barras).

---

## Fórmulas de los KPIs (CALCULADAS, NUNCA ESTÁTICAS)

Los KPIs del dashboard **no deben ser texto quemado en el componente**. Deben ser cálculos reales derivados del array de `reservas`, de modo que si se cambia el `status` o el `stage_id` de una reserva en `mockData.js`, los KPIs se actualicen automáticamente.

| KPI | Fórmula |
|-----|---------|
| **Ingresos Totales** | Suma de `amount` de todas las reservas con `status === 'confirmed'`. Mostrar comparativa porcentual contra el mes anterior usando `closed_at`. |
| **Reservas Activas** | Conteo de reservas con `status === 'open'` (aún en Cotización o Reservada, sin emitir). |
| **Tasa de Conversión** | `confirmadas / (confirmadas + canceladas) * 100`, es decir el porcentaje de reservas ganadas sobre el total de reservas cerradas. Equivale al "Win Rate" de un CRM. |
| **Tarifa Promedio** | Promedio de `amount` entre las reservas con `status === 'confirmed'`. |
| **Factor de Ocupación** *(ampliación)* | Para cada vuelo: `suma de passengers_count de sus reservas confirmadas / total_seats * 100`. |

### Agrupaciones para las gráficas

- **Gráfico de barras (principal):** eje X = `name` de los Estados de Reserva ordenados por `display_order`; eje Y = suma de `amount` de las reservas cuyo `stage_id` corresponde a cada estado.
- **Gráfico de línea (secundario):** evolución temporal de los ingresos, agrupando las reservas por mes de `created_at` (o `closed_at`) y sumando `amount`.
- **Tabla / lista lateral:** últimas reservas creadas, ordenadas por `created_at` descendente, mostrando localizador, pasajero, ruta, clase, monto y estado.

### Filtros obligatorios

1. **Por rango de fecha** — aplicado sobre `created_at` de las reservas. Todos los KPIs y ambas gráficas deben recalcularse al cambiarlo.
2. **Por equipo de ventas** — aplicado sobre el campo `team` del Canal de Venta asociado a cada reserva (`'Todos'`, `'Directo'`, `'Digital'`, `'Agencias'`). Todos los KPIs y ambas gráficas deben recalcularse al cambiarlo.

---

## Volumen de datos simulados requerido

Para que las gráficas se vean pobladas y realistas, generar como mínimo:

- **4** canales de venta (al menos uno por cada equipo: Directo, Digital, Agencias)
- **7** estados de reserva (los de la tabla fija de arriba)
- **15** pasajeros, con mezcla de membresías Basic / Gold / Platinum
- **10** vuelos, en rutas variadas (nacionales como MDE-BOG, MDE-CTG, BOG-CLO, y al menos dos internacionales como BOG-MIA, MDE-MEX), con algunos retrasos distintos de cero
- **30** reservas distribuidas entre los 7 estados y repartidas a lo largo de **los últimos 6 meses** (de mayo a octubre de 2026), con montos variados en COP (entre 300.000 y 3.000.000), para que el gráfico de línea muestre una evolución real.

**IMPORTANTE:** no conectar a ninguna base de datos real. Todos estos datos viven en un único archivo `mockData.js` separado del resto del código, para poder editarlos fácilmente.
