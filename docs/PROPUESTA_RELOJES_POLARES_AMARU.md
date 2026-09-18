# PROPUESTA TÉCNICA: RELOJES POLARES TÁCTICOS Y VENTANAS DORADAS LOGÍSTICAS (AMARU-FEN & AMARU-CHIRI)
## SISTEMA DE ALERTA TEMPRANA BI-ESCALA & COMANDO C2 COEN-DIGITAL

**Clasificación:** DOCUMENTO PRIVADO / CONFIDENCIAL  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Autores:** Antigravity AI & Equipo de Arquitectura de Misión Crítica COEN-Digital  

---

## 1. INTRODUCCIÓN Y CONCEPTO OPERACIONAL (C2 DOCTRINE)

En las salas de crisis del **COEN (Centro de Operaciones de Emergencia Nacional)**, los mapas cartográficos tradicionales muestran *dónde* está el peligro, pero fallan en transmitir *cuánto tiempo resta* para que la ventana logística de mitigación se cierre.

La doctrina de **Relojes Polares Tácticos (Tactical Polar Clocks)** resuelve esta limitación transformando el ciclo estacional de 12 meses en un dial polar de 360°, donde los arcos de amenaza y las **Ventanas Doradas Logísticas (Logistics Golden Windows)** determinan hitos operativos improrrogables para INDECI, ministerios sectoriales (MIDAGRI, MTC, MINSA, MINEDU) y gobiernos regionales.

Se establecen dos instrumentos complementarios:
1. **AMARU-FEN:** Vigilancia de El Niño Costero e inundaciones/huaicos en la Costa Pacífica y Cuencas Bajas.
2. **AMARU-CHIRI:** Vigilancia de La Niña, heladas agrometeorológicas y friajes en la Sierra Sur y Alto Altiplano.

---

## 2. ESPECIFICACIÓN TÉCNICA DE LOS RELOJES POLARES

### 2.1. Reloj AMARU-FEN (Pacific Coast & Lowlands)

```
                       [12] DICIEMBRE (Inicio Lluvias)
                               ▲
                 [11] NOV      │      [1] ENE
             (VENTANA DORADA)  │   (AMENAZA HUAICOS)
                     \         │         /
        [10] OCT      \        │        /      [2] FEB (PICO FEN)
           │           \       │       /           │
           │            \      │      /            │
  ─────────┼───────────────────(O)─────────────────┼─────────
  [9] SET  │                     \                 │  [3] MAR
           │                      \                │ (DESBORDES)
           │                       \ AGUJA         │
        [8] AGO                     ▼ CINÉTICA [4] ABR
                     /                   \
                 [7] JUL       │      [5] MAY
                               ▼
                          [6] JUNIO
```

- **Geometría del Dial:** Círculo polar 360°, subdividido en 12 sectores horarios de 30° correspondientes a los 12 meses cronológicos (Enero = 30°, Febrero = 60°, ..., Diciembre = 360°/0°).
- **Arco de Amenaza Roja (Red Threat Arc):**
  - Sector angular de Diciembre a Marzo (amplitud de 90°: 330° a 90°).
  - Gradiente térmico de 7 tonos (de ámbar `#f97316` a rojo magma `#991b1b` y magenta crítico `#450a0a`).
- **Aguja Cinética Autónoma (Kinetic Hand):**
  - Posicionamiento dinámico: La aguja avanza en el tiempo cronológico mensual base, pero **su deflexión angular y longitud vectorial se aceleran** proporcionalmente a la **anomalía de Temperatura Superficial del Mar (TSM) en la región Niño 1+2** ($> +1.5^\circ\text{C}$ hasta $+4.1^\circ\text{C}$).
  - Si la anomalía supera $+2.5^\circ\text{C}$ (condición El Niño Fuerte/Extraordinario), la aguja activa un efecto de pulso radiante estroboscópico.
- **Análogos Históricos Superpuestos:**
  - Marcadores de referencia angular de los eventos catastróficos pasados:
    - **FEN 1982-1983** (Anomalía máxima: $+4.1^\circ\text{C}$, 1,200 mm en Piura).
    - **FEN 1997-1998** (Anomalía máxima: $+3.8^\circ\text{C}$, desborde generalizado cuencas norte).
    - **Ciclón Yaku (Marzo 2023)** (Activación inusual de quebradas secas de la vertiente occidental).
- **Ventana Dorada de Noviembre (November Golden Window):**
  - Sector angular destacado en **amarillo táctico (#eab308)** entre 300° y 330°.
  - **Doctrina Logística:** Deadline operativo improrrogable antes de la consolidación de la masa húmeda ecuatorial:
    1. Descolmatación intensiva de cauces de ríos (Rímac, Piura, La Leche, Chicama).
    2. Enrocado al volteo y conformación de diques riprap en márgenes urbanas vulnerables.
    3. Defensas ribereñas y desvío de bocatomas rústicas de riego agrícola.
    4. Preposicionamiento de maquinaria pesada de INDECI y MTC en campamentos estratégicos.

---

### 2.2. Reloj AMARU-CHIRI (Southern Andes & High Altiplano)

```
                            [12] DIC
                               ▲
                 [11] NOV      │      [1] ENE
                               │
        [10] OCT               │               [2] FEB
           │                   │                   │
  ─────────┼───────────────────(O)─────────────────┼─────────
  [9] SET  │                     \                 │  [3] MAR
           │                      \                │
        [8] AGO                    \               │
                     /              \  ABR★ [4] ABR (VENTANA DORADA)
                 [7] JUL       │     ▼ (Amarillo Táctico #facc15)
                               ▼
                          [6] JUN    [5] MAY
                      ◄─── ARCO GLACIAL (90°) ───►
```

- **Geometría Calibrada C2:**
  - Centro polar en coordenadas $(c_x = 260.0, c_y = 260.0)$.
  - Radio exterior nominal $r = 247.0$ px.
  - Origen polar calibrado para monitores tácticos C2 en cuarto oscuro (Dark Mode grado militar).
- **Arco de Amenaza Glacial (Glacial Threat Arc):**
  - Sector angular de Mayo a Julio (amplitud de 90°: 120° a 210°).
  - Tres pistas radiales concéntricas (*Triple Radial Tracks*):
    - Pista exterior ($r_1 = 247.0$ a $220.0$): Isotermas bajo cero ($T_{min} \le -5^\circ\text{C}$, $-10^\circ\text{C}$, $-18^\circ\text{C}$).
    - Pista media ($r_2 = 220.0$ a $180.0$): Tasa de mortandad neonatal de camélidos sudamericanos.
    - Pista interior ($r_3 = 180.0$ a $140.0$): Capacidad remanente de heno y forraje en tambos.
  - Rotulación de alto contraste: Texto en negro sólido (`#000000`, `font-weight: 900`) sobre sustrato cian/azul gélido (`#38bdf8` a `#0284c7`) para máxima legibilidad táctica a distancia en monitores de crisis.
- **Sector Amarillo Táctico de la Ventana Dorada (Abril):**
  - Resaltado en **amarillo táctico (#facc15)**, con borde radiante (`#fef08a`, ancho: 2.5px) y badge perimetral hexagonal **`ABR★`**.
  - **Doctrina Logística para Abril (Improrrogable antes de Mayo):**
    1. **Salud Animal Camélida:** Desparasitación entérica y aplicación de complejos vitamínicos ADE a madres alpacas en último tercio de preñez antes de que el choque térmico suprima la respuesta humoral.
    2. **Seguridad Forrajera:** Acopio y almacenamiento en seco de pacas de heno de alfalfa y avena forrajera en la red de cobertizos y Tambos comunales de Agro Rural.
    3. **Resguardo Humano y Educativo:** Acondicionamiento térmico (muros trombe, cielorraso) de escuelas rurales sobre los 3,800 msnm y ajuste de horarios de entrada escolar del programa PREVAED (MINEDU).
- **Análogos Históricos:**
  - **La Niña 1988-1989:** Helada negra extrema en Puno y Arequipa con temperaturas de $-22^\circ\text{C}$ en Mazocruz y pérdida de más del 30% de crías de alpaca.
  - **La Niña 2007-2008:** Friaje severo en selva baja combinado con heladas prolongadas en cuencas altas de Cusco y Puno.

---

## 3. ARQUITECTURA DE DATOS EN TIEMPO REAL & FÓRMULAS DE ACTUALIZACIÓN

Ambos relojes no son animaciones estáticas; son **instrumentos analíticos conectados al backend de telemetría**:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          FUENTES EN TIEMPO REAL (INGESTA CONTINUA)                          │
├──────────────────────────────┬──────────────────────────────┬───────────────────────────────┤
│ Open-Meteo Marine API        │ Open-Meteo Pro (ECMWF IFS)   │ Boyas DHN / SENAMHI EMA       │
│ TSM Niño 1+2 / Costa Norte   │ Temp Mínima 2m Altiplano     │ Telemetría In-Situ Validada   │
└──────────────────────────────┴──────────────┬───────────────┴───────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                       BACKEND FASTAPI: SERVICE `clocks_service.py`                          │
│                                                                                             │
│  1. Cálculo de Ángulo Horario Cronológico:                                                  │
│     θ_tiempo = (Mes_Actual - 1) * 30° + (Día_Actual / Días_Mes) * 30°                      │
│                                                                                             │
│  2. Deflexión Cinética AMARU-FEN:                                                           │
│     Δθ_FEN = min(45°, max(0°, (Anomalia_TSM_12 - 0.5) * 15°))                              │
│     θ_aguja_FEN = θ_tiempo + Δθ_FEN                                                         │
│                                                                                             │
│  3. Deflexión Cinética AMARU-CHIRI:                                                         │
│     Factor_Helada = max(0.0, (-T_min_Altiplano) / 15.0)                                     │
│     θ_aguja_CHIRI = θ_tiempo + (Factor_Helada * 12°)                                        │
│                                                                                             │
│  4. Cálculo de Cuenta Regresiva de Ventana Dorada:                                          │
│     Días_Restantes = Target_Deadline - Fecha_Actual                                         │
└─────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                              │ GET /api/clocks/enso (Polling / SSE)
                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                             FRONTEND NEXT.JS 14 (COMPONENTE SVG)                            │
│                                                                                             │
│  • MODO WIDGET COMPACTO (En Tablero Nacional):                                              │
│    Mini dial interactivo (180x180 px) con aguja en vivo, badge de alerta y botón "Expandir"│
│                                                                                             │
│  • MODO PANTALLA COMPLETA (Modal Táctico C2 / Videowall):                                   │
│    Visualizador 4K de alta definición con:                                                  │
│    - Selector de modo: [ AMARU-FEN (Costa) ] vs [ AMARU-CHIRI (Sierra/Altiplano) ]          │
│    - Indicador numérico de telemetría viva (TSM, Anamomalía, Tmin Altiplano)                │
│    - Cronómetro de cuenta regresiva para la Ventana Dorada (Días, Horas, Minutos)           │
│    - Checklist operativo de doctrina logística para gobernadores y alcaldes                 │
│    - Cuadro comparativo con Análogos Históricos (1983, 1998, Yaku, 1988, 2007)              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. ESQUEMA DE DATOS JSON (ENDPOINT `/api/clocks/enso`)

```json
{
  "timestamp": "2026-09-14T19:25:00Z",
  "mes_actual": 9,
  "dia_actual": 14,
  "amaru_fen": {
    "nombre": "AMARU-FEN (Costa Pacífica & Cuencas Bajas)",
    "amenaza_activa": "VIGILANCIA_ALERTA",
    "anomalia_tsm_nino12": 2.45,
    "temperatura_mar_c": 23.6,
    "angulo_aguja_deg": 268.5,
    "sector_amenaza": {
      "mes_inicio": "Diciembre",
      "mes_fin": "Marzo",
      "angulo_inicio": 330.0,
      "angulo_fin": 90.0
    },
    "ventana_dorada": {
      "mes": "Noviembre",
      "dias_restantes": 47,
      "estado": "PRE-VENTANA_CRITICA",
      "hitos_obligatorios": [
        {"hito": "Descolmatación de cauces Rímac y Piura", "progreso": 62},
        {"hito": "Enrocado riprap en fajas marginales urbanas", "progreso": 48},
        {"hito": "Bocatomas de riego y compuertas de purga", "progreso": 55},
        {"hito": "Preposicionamiento de maquinaria pesada INDECI", "progreso": 70}
      ]
    },
    "analogos_historicos": [
      {"evento": "FEN 1982-1983", "anomalia": "+4.1°C", "angulo": 45.0, "impacto": "Catastrófico"},
      {"evento": "FEN 1997-1998", "anomalia": "+3.8°C", "angulo": 60.0, "impacto": "Severo Extremo"},
      {"evento": "Ciclón Yaku 2023", "anomalia": "+2.8°C", "angulo": 75.0, "impacto": "Inundaciones Repentinas"}
    ]
  },
  "amaru_chiri": {
    "nombre": "AMARU-CHIRI (Sierra Sur & Alto Altiplano)",
    "amenaza_activa": "NORMAL_TRANSICION",
    "temp_minima_altiplano_c": -6.8,
    "isoterma_critica_c": -10.0,
    "angulo_aguja_deg": 255.0,
    "sector_amenaza": {
      "mes_inicio": "Mayo",
      "mes_fin": "Julio",
      "angulo_inicio": 120.0,
      "angulo_fin": 210.0
    },
    "ventana_dorada": {
      "mes": "Abril (ABR★)",
      "dias_restantes": 198,
      "estado": "PLANIFICACION_TEMPRANA",
      "hitos_obligatorios": [
        {"hito": "Desparasitación y vitaminización de madres alpacas", "progreso": 85},
        {"hito": "Acopio de pacas de heno en Tambos Agro Rural", "progreso": 90},
        {"hito": "Acondicionamiento térmico de escuelas PREVAED", "progreso": 78}
      ]
    },
    "analogos_historicos": [
      {"evento": "La Niña 1988-1989", "tmin": "-22.0°C Mazocruz", "angulo": 165.0, "impacto": "Mortandad masiva camélidos"},
      {"evento": "La Niña 2007-2008", "tmin": "-18.5°C Imata", "angulo": 180.0, "impacto": "Helada persistente y friaje selva"}
    ]
  }
}
```

---

## 5. EXPERIENCIA DE USUARIO (UX/UI EN SALA DE CRISIS)

1. **Visualización por defecto (Widget en Columna de Telemetría):**
   - Muestra el dial circular con la aguja viva, el arco de amenaza actual y los días restantes hacia la siguiente Ventana Dorada.
   - Pestaña para alternar con 1 clic entre `AMARU-FEN (Niño / Costa)` y `AMARU-CHIRI (Niña / Altiplano)`.
   - Botón de maximizar `[ ⛶ PANTALLA COMPLETA ]`.

2. **Visualización Ampliada (Fullscreen C2 Command Center):**
   - Modal oscuro semitransparente con desenfoque de fondo (*glassmorphism*).
   - Dial vectorial SVG de alta definición de $520 \times 520$ px en el centro.
   - Panel lateral izquierdo con:
     - Telemetría física en tiempo real (TSM Boya DHN, anomalía Niño 1+2, temperatura nocturna Altiplano).
     - Contador regresivo en tiempo real (Cuenta regresiva DD:HH:MM hasta el cierre de la Ventana Dorada).
   - Panel lateral derecho con:
     - Checklist de Doctrina Logística con barras de avance porcentual.
     - Comparativa histórica con eventos análogos (1983, 1998, Yaku, 1989, 2008).
     - Botón de exportación de reporte operacional en PDF / JSON para sesión de Consejo de Ministros.

---

## 6. CONCLUSIÓN TÉCNICA

La implementación de los **Relojes Polares Tácticos AMARU-FEN y AMARU-CHIRI** dota al COEN de una ventaja estratégica sin precedentes:
- Transforma la meteorología abstracta en **urgencia logística medible**.
- Establece la diferencia legal y operativa entre actuar a tiempo en la **Ventana Dorada** o asumir costos multimillonarios en reconstrucción post-desastre.
- Conecta directamente los modelos satelitales globales de Open-Meteo Pro y boyas de la Marina con las decisiones de campo de alcaldes y ministros.
