# 🚨 COEN‑Digital Lab4 – Sistema de Alerta Temprana Bi-Escala (SAT-ENSO / AMARU)

> **Centro de Operaciones de Emergencia Nacional (COEN) | INDECI – Presidencia del Consejo de Ministros (PCM) – Perú**  
> **Gemelo Digital Territorial Soberano & Arquitectura Swarm Multi-Agente Autónoma frente a El Niño (ENSO) y Heladas Altoandinas**  
> Desarrollado con **FastAPI**, **Next.js 14 (App Router)**, **Google Gemini 1.5**, **Open-Meteo Pro**, **SENAMHI WFS**, **DHN / IMARPE**, **CENEPRED**, **RENALIO (MINCUL)** y **Google Cloud Platform**.

---

## 📑 Tabla de Contenidos
1. [Visión General y Objetivos](#-visión-general-y-objetivos)
2. [Arquitectura del Sistema & Consolas C2](#-arquitectura-del-sistema--consolas-c2)
3. [Swarm Multi-Agente Autónomo](#-swarm-multi-agente-autónomo)
4. [Matriz de Triple Vulnerabilidad & Algoritmo IPI](#-matriz-de-triple-vulnerabilidad--algoritmo-ipi)
5. [Política Doctrinal de Difusión Bilingüe (RENALIO D.S. 009-2021-MC)](#-política-doctrinal-de-difusión-bilingüe-renalio-ds-009-2021-mc)
6. [Catálogo Cartográfico del Geovisor Táctico C2 (7 Capas)](#-catálogo-cartográfico-del-geovisor-táctico-c2-7-capas)
7. [Relojes Polares Tácticos AMARU](#-relojes-polares-tácticos-amaru)
8. [Módulo de Reporte Ciudadano Seguro & Blindaje Anti-Fake News](#-módulo-de-reporte-ciudadano-seguro--blindaje-anti-fake-news)
9. [Estructura del Repositorio](#-estructura-del-repositorio)
10. [Catálogo de APIs y Endpoints](#-catálogo-de-apis-y-endpoints)
11. [Puesta en Marcha Local](#-puesta-en-marcha-local)
12. [Variables de Entorno](#-variables-de-entorno)
13. [Documentación Técnica de Referencia](#-documentación-técnica-de-referencia)

---

## 🌎 Visión General y Objetivos

El proyecto **COEN-Digital Lab4 (SAT-ENSO / AMARU)** es un **Gemelo Digital Territorial Soberano** diseñado para transformar la gestión reactiva del riesgo de desastres en una **estrategia de anticipación táctica, algorítmica e inclusiva**.

### Principales Capacidades Operativas:
- **Cobertura Territorial Soberana:** Monitoreo activo de **1,891 distritos del Perú** clasificados según nivel de peligro CENEPRED SIGRID y priorización legal de los **893 distritos declarados en Estado de Emergencia** bajo el **Decreto Supremo N° 124-2026-PCM**.
- **Índice de Prioridad de Intervención (IPI):** Priorización algorítmica de 0 a 100 puntos que cruza CENEPRED, D.S. 124-2026-PCM, heladas altoandinas y brecha etnolingüística RENALIO. Incluye exportador a CSV oficial para salas de crisis.
- **Geocatálogo de Quebradas Críticas:** Catálogo detallado de **46 quebradas críticas nacionales** (conos de deyección, umbrales de activación en $mm/h$, tiempos de concentración y más de **1.2 millones de habitantes expuestos**).
- **Integración Hidrometeorológica y Marina Multifuente:**
  - **SENAMHI:** Red de Estaciones Meteorológicas Automáticas (EMA) mediante OGC WFS GeoServer con corrección de sesgo andino (*bias correction*).
  - **DHN / IMARPE:** Red de boyas oceanográficas frente a la costa norte y centro (Paita, Puerto Pizarro, Chicama, Callao) para monitoreo de anomalías de Temperatura Superficial del Mar (TSM) y detección de **Ondas Kelvin cálidas** en la **Región Niño 1+2**.
  - **ENFEN:** Integración con los comunicados oficiales y comisiones de alerta de El Niño Costero y El Niño Global (factor multiplicador estacional x1.35).
  - **Open-Meteo Pro & GloFAS:** Modelos ECMWF IFS 9km, cálculo de energía convectiva (CAPE), humedad de suelo a 4 estratos pedológicos y simulación de caudales en tiempo real.
- **Inclusión Lingüística Soberana (RENALIO D.S. 009-2021-MC):** Adaptación dialectal territorializada en **Quechua Chanka**, **Quechua Collao**, **Quechua Áncash**, **Aymara Altiplánico**, **Asháninka**, **Awajún** y **Castellano Comunitario**.
- **Alertamiento Estandarizado Multicanal:** Generación automática de cargas útiles compatibles con el estándar internacional **OASIS CAP v1.2 / ITU-T X.1303** para su inyección al sistema **SISMATE** (radiodifusión celular) y despacho por mensajería instantánea comunitaria (Telegram Bot API).

---

## 🏛️ Arquitectura del Sistema & Consolas C2

El sistema ofrece **6 consolas especializadas de mando y control**, interconectadas en tiempo real:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                   FRONTEND (Next.js 14)                                  │
│  1. Consola de Mando Nacional (/)        : Tablero situacional C2 24/7 y orquestación    │
│  2. Consola Geovisor Táctico C2 (/geovisor): Mapa vectorial/satelital con 7 capas activas│
│  3. Consola Municipal (/dashboard/[ubigeo]): Mando táctico para Alcaldes y COEL local   │
│  4. Consola Doctrinal & Fórmulas (/doctrina): Formulación matemática (IPI, IPH, ISH)    │
│  5. Consola de Glosario & Mapas (/glosario): Diccionario técnico, catálogo y fuentes     │
│  6. Consola Reporte Ciudadano (/reporte-ciudadano): Blindaje Anti-Fake, Privacidad C2    │
└─────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ HTTP / REST JSON (CORS)
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 BACKEND (FastAPI Server)                                 │
│  • Orquestador Swarm Multi-Agente Deliberativo y Reactivo                                │
│  • Servicio de Datos Históricos: 1,891 CENEPRED, 893 D.S. 124, AMARU-CHIRI, RENALIO      │
│  • Motor Algorítmico IPI (Ranking y Exportador CSV Nacional)                             │
│  • Servicios Nacionales: SENAMHI (WFS), DHN (Boyas), ENFEN, Open-Meteo Pro               │
│  • Motor de Cinemática Polar y Telemetría de Relojes AMARU                               │
└─────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ Inferencia Cognitiva
                                              ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                        MOTOR COGNITIVO (Google Gemini 1.5 Flash)                         │
│  • Evaluación de Impacto Táctico y Logístico (Población, Red Vial, Maquinaria)           │
│  • Adaptación Cultural Dialectal Bilingüe (Castellano Llano + Lenguas Originarias)       │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Swarm Multi-Agente Autónomo

El backend opera mediante una cadena coordinada de **4 agentes especializados**:

| Agente | Rol Operativo | Capacidades Clave | Latencia |
| :--- | :--- | :--- | :---: |
| **1. Agente Centinela** | *Data & Triage Agent* | Ingesta continua de pluviometría, saturación edáfica en 4 capas ($S_4$), CAPE, boyas DHN y caudal fluvial. Aplica matriz multicriterio de 4 niveles (*Verde, Amarillo, Naranja, Rojo*) y sesgo andino. | 38 ms |
| **2. Agente Táctico** | *Crisis Assessment Agent* | Cruza coordenadas con conos de deyección de quebradas, padrón poblacional INEI, vías en riesgo MTC y maquinaria INDECI. Redacta el Boletín Situacional Oficial con **Gemini 1.5**. | 112 ms |
| **3. Agente Lingüístico** | *Cultural & Dispatch Agent* | Transforma el boletín técnico aplicando la directriz RENALIO: si el distrito es indígena, emite alerta **BILINGÜE** (Lengua Nativa + Castellano); si es hispano, emite **ÚNICAMENTE en Castellano Llano**. | 78 ms |
| **4. Agente Despachador** | *Notification & Audit Agent* | Serializa la alerta en norma internacional **OASIS CAP v1.2 / ITU-T X.1303 para SISMATE** (con 2 bloques `<info>` para bilingües y 1 bloque para castellano), despacha a Telegram y registra auditoría inmutable UTC. | 45 ms |

---

## ⚖️ Matriz de Triple Vulnerabilidad & Algoritmo IPI

Para evitar la asignación discrecional o centralizada de ayuda humanitaria y despacho de alertas, el sistema ejecuta el **Índice de Prioridad de Intervención (IPI)** sobre los **1,891 distritos del Perú**:

$$\text{IPI} = (0.35 \times P_{\text{CENEPRED}}) + (0.30 \times E_{\text{DS124}}) + (0.15 \times H_{\text{AMARU}}) + (0.20 \times B_{\text{RENALIO}})$$

Donde cada variable normalizada aporta entre 0 y 100 puntos:
- **$P_{\text{CENEPRED}}$ (35%)**: Nivel de Peligro CENEPRED (*Muy Alto = 100 pts, Alto = 70 pts, Medio = 40 pts, Bajo = 10 pts*).
- **$E_{\text{DS124}}$ (30%)**: Declaratoria vigente de Estado de Emergencia por El Niño (*Vigente = 100 pts, No vigente = 0 pts*).
- **$H_{\text{AMARU}}$ (15%)**: Exposición crítica a heladas y friajes (*Crítico = 100 pts, No crítico = 0 pts*).
- **$B_{\text{RENALIO}}$ (20%)**: Brecha de vulnerabilidad etnolingüística (*Lengua originaria predominante = 100 pts, Hispanohablante = 25 pts*).

### Escala de Respuesta Operativa:
- **$\ge 80.0$ pts**: **ZONA ROJA / TRIPLE VULNERABILIDAD CRÍTICA** (Intervención y alerta inmediata en lengua originaria + castellano).
- **$60.0 - 79.9$ pts**: **ALTA PRIORIDAD OPERATIVA** (Monitoreo continuo y prealerta).
- **$40.0 - 59.9$ pts**: **VIGILANCIA MODERADA** (Vigilancia ordinaria de cuenca).
- **$< 40.0$ pts**: **BAJO IMPACTO PREVENTIVO** (Régimen preventivo regular).

---

## 🇵🇪 Política Doctrinal de Difusión Bilingüe (RENALIO D.S. 009-2021-MC)

En estricto cumplimiento del **Decreto Supremo N° 009-2021-MC** y la Ley N° 29735, se implementa la regla de oro:

1. **Distritos con Lengua Originaria Predominante (según RENALIO)**:
   - El despacho es **BILINGÜE OBLIGATORIO**.
   - Se consigna la alerta en la **Lengua Originaria Predominante** (*Runasimi Chanka, Collao o Áncash; Aymara; Asháninka; Awajún*).
   - Se acompaña **SIEMPRE de la versión en CASTELLANO / ESPAÑOL**.
   - En el estándar celular **CAP v1.2 / SISMATE**, se generan **dos bloques informativos**: `info[0]` (`es-PE`) e `info[1]` (`qu-PE`, `ay-PE`, `cni-PE` o `agr-PE`).
2. **Distritos Predominantemente Hispanohablantes (e.g. Piura, Catacaos, Íllimo, Lima Costa)**:
   - El despacho se emite **ÚNICAMENTE en Castellano Comunitario / Llano**.
   - En el estándar celular **CAP v1.2 / SISMATE**, se genera **un único bloque informativo**: `info[0]` (`es-PE`).
   - **No se fuerza traducción artificial** donde la comunidad es hispanohablante.

---

## 🗺️ Catálogo Cartográfico del Geovisor Táctico C2 (7 Capas)

El Geovisor C2 (`/geovisor`) integra 7 capas analíticas conmutables y 4 modos de mapa base:

1. **Capa NOAA SST Niño 1+2**: Polígono térmico del Pacífico costero con anomalía en tiempo real (+2.5°C a +3.2°C). Gatilla factor x1.35.
2. **Capa Boyas Oceanográficas DHN**: Telemetría in situ de estaciones fondeadas (Paita, Puerto Pizarro, Chicama, Callao) con indicador de **Ondas Kelvin cálidas de hundimiento** y profundidad de termoclina.
3. **Capa Radar Doppler & GOES-16**: Malla dinámica de reflectividad (10 a 65 dBZ) con bucle temporal animado (-120 min a +60 min de previsión).
4. **Capa 46 Quebradas Críticas**: Polígonos de conos de deyección (Chosica, Trujillo, Huaycoloro) con umbrales milimétricos ($mm/h$) y tiempos de concentración aluvional (1.5 a 3.0 h).
5. **Capa Estaciones de Aforo Fluvial**: Caudales en $m^3/s$ de ríos Piura, Tumbes, Rímac y La Leche contrastados contra el umbral rojo de desborde y el **récord histórico de El Niño 1998 (4,424 m³/s)**.
6. **Capa Memoria Histórica FEN**: Georreferenciación de diques colapsados, puentes destruidos y lecciones tácticas aprendidas de 1998 y 2017.
7. **Capa Corredor de Heladas (AMARU-CHIRI)**: Localidades altoandinas (>3,800 msnm) expuestas a temperaturas bajo cero (-10°C a -16°C), hatos de alpacas y tambos de Agro Rural.
8. **Capa RENALIO & Triple Vulnerabilidad (IPI)**: 7ma capa cartográfica que visualiza los distritos con mayor puntaje IPI y régimen de despacho bilingüe obligatorio.
9. **Modos de Mapa Base**: *Oscuro Táctico C2* (baja luminiscencia), *Satelital* (inspección óptica), *Terreno* (curvas de nivel) y *Océano Pacífico* (termodinámica marina).

---

## 🧭 Relojes Polares Tácticos AMARU

Los **Relojes Polares AMARU** representan la estacionalidad del riesgo hidrometeorológico en una esfera polar cinemática de $360^\circ$:

1. **AMARU-FEN (Costa Pacífica & Cuencas Bajas):**
   - **Amenaza:** Inundaciones, crecidas fluviales y activación de quebradas (huaicos) por El Niño Costero / Global.
   - **Sector Crítico:** Diciembre a Marzo ($330^\circ$ a $90^\circ$).
   - **Ventana Dorada (Deadline):** Noviembre (plazo límite para descolmatación de cauces antes del tren de avenidas).
   - **Análogos Históricos Integrados:** Mega-Niño 1982-1983, FEN 1997-1998, El Niño Costero 2017 y Ciclón Yaku 2023.

2. **AMARU-CHIRI (Sierra Sur & Alto Altiplano):**
   - **Amenaza:** Heladas meteorológicas extremas ($<-12^\circ\text{C}$), friajes en selva y nevadas cordilleranas asociadas a La Niña.
   - **Sector Crítico:** Mayo a Julio ($120^\circ$ a $210^\circ$).
   - **Ventana Dorada (Golden Window):** Abril (preparación de tambos, entrega de kits veterinarios y cobertizos térmicos para alpacas).
   - **Análogos Históricos Integrados:** Crisis Polares 1988-1989, 2007-2008, 2015-2016 y Helada Negra 2022.

---

## 🛡️ Módulo de Reporte Ciudadano Seguro & Blindaje Anti-Fake News

El sistema incorpora un canal soberano de **Ground-Truth Ciudadano** para recolectar información de campo durante el **Fenómeno El Niño 2026-2027** y calibrar la memoria histórica de desastres pasados (1983, 1998, 2017 y Yaku 2023).

### Principios Doctrinales de Seguridad y Privacidad:
1. **Blindaje Anti-Pánico y Protección de Datos (Ley N° 29733):**
   - Las fotografías, videos y testimonios que ingresa la ciudadanía **NUNCA son expuestos públicamente en internet ni en redes sociales**.
   - En el visor público solo se genera un **pin discreto y anónimo** con el nivel de afectación codificado (Tobillo, Rodilla, Cintura, Techo), impidiendo la revictimización o la propagación de rumores alarmistas.
2. **Peritaje Forense con IA Multimodal (Google Gemini Vision):**
   - Detección de fotos falsas, montajes o imágenes recicladas de catástrofes de otros años o países mediante análisis de metadatos EXIF, iluminación solar y patrones morfológicos de sedimentación.
   - Si se detecta un intento de desinformación, el reporte se clasifica automáticamente como `RECHAZADO_POR_FRAUDE` y queda bloqueado de la cartografía pública.
3. **Motor de Consenso Espacial (≥ 3 Reportes Comunitarios):**
   - Un reporte aislado en una quebrada o cauce se mantiene en estado `EN_EVALUACION_FORENSE`.
   - Cuando se acumulan 3 o más reportes independientes dentro de un radio de **600 metros**, el sistema activa una **Alerta por Consenso Táctico** en la Sala de Crisis C2 del COEN.
4. **Supervisión de Transmisiones en Directo (TikTok / YouTube / Drones COE):**
   - Los directos de creadores de contenido o reporteros en terreno se aíslan en un **Sandbox de Cuarentena Audiovisual** en la Sala de Crisis.
   - El operador triangula al instante lo que dice el video frente a la telemetría en tiempo real: estaciones de aforo hidrológico del SENAMHI/ANA y pluviómetros satelitales antes de validar cualquier alerta.

---

## 🗂️ Estructura del Repositorio

```
Lab4/
├── backend/
│   ├── agents/
│   │   ├── dispatcher_agent.py    # Despacho Telegram dual + serializador CAP v1.2 (1 o 2 bloques info)
│   │   ├── linguistic_agent.py    # Traducción cultural (Quechua Chanka/Collao/Áncash, Aymara, Asháninka, Awajún, Castellano)
│   │   ├── orchestrator.py        # Orquestador del flujo multi-agente y bitácora de auditoría
│   │   ├── schemas.py             # Modelos Pydantic v2 (Telemetría, Triaje, CAP, Logs, es_bilingue)
│   │   ├── sentinel_agent.py      # Detección y triaje multicriterio con bias correction
│   │   └── tactical_agent.py      # Cruce territorial INEI, MTC, maquinaria e INDECI
│   ├── data/                      # 18 bases de datos JSON (1,891 distritos, D.S. 124, RENALIO, etc.)
│   ├── services/
│   │   ├── clocks_service.py      # Cinemática polar y telemetría de Relojes AMARU
│   │   ├── historical_data_service.py # Algoritmo IPI, ranking triple vulnerabilidad, exportador CSV
│   │   ├── citizen_report_service.py  # Pipeline anti-fake, peritaje forense IA y consenso espacial
│   │   ├── meteo_service.py       # Cliente Open-Meteo Pro + GloFAS Flood
│   │   ├── gemini_service.py      # Conexión con Google Gemini 1.5 Flash
│   │   ├── telegram_service.py    # Despacho de mensajes vía Telegram Bot API
│   │   ├── national/
│   │   │   ├── dhn_buoy_service.py # Red de boyas oceanográficas DHN / TSM Niño 1+2
│   │   │   ├── enfen_service.py    # Comunicados y alertas oficiales ENFEN
│   │   │   └── senamhi_service.py  # Conector WFS OGC GeoServer y red EMA
│   │   └── tools/
│   │       └── territorial_tools.py# Herramientas territoriales y resolución lingüística RENALIO
│   ├── main.py                    # Servidor FastAPI y declaración de endpoints
│   ├── requirements.txt           # Dependencias Python
│   └── Dockerfile                 # Contenedor del backend
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx           # Consola de Mando Nacional C2 interactiva
│   │   │   ├── layout.tsx         # Layout principal institucional
│   │   │   ├── globals.css        # Estilos globales y tokens
│   │   │   ├── geovisor/          # Consola Geovisor Táctico C2 a pantalla completa
│   │   │   ├── doctrina/          # Consola Doctrinal & Fórmulas Matemáticas (IPI, IPH, ISH)
│   │   │   ├── glosario/          # Consola de Glosario Técnico & Catálogo de Mapas C2
│   │   │   ├── reporte-ciudadano/ # Consola de Reporte Ciudadano Seguro & Blindaje Anti-Fake
│   │   │   ├── dashboard/[ubigeo]/# Panel de detalle distrital por UBIGEO
│   │   │   └── municipal/[ubigeo]/# Consola táctica para gobiernos locales
│   │   ├── components/
│   │   │   ├── HeaderNav.tsx      # Barra de navegación institucional con selector de 6 consolas
│   │   │   ├── GeovisorConsole.tsx# Motor del Geovisor C2 con las 7 capas cartográficas
│   │   │   ├── MapViewer.tsx      # Geovisor territorial embebido
│   │   │   ├── TacticalPolarClock.tsx # Componente visual de Relojes AMARU
│   │   │   ├── MunicipalCommand.tsx   # Despacho y comando municipal
│   │   │   ├── HydroCharts.tsx    # Gráficos Recharts (Precipitación vs Caudal)
│   │   │   ├── KpiGrid.tsx        # Indicadores hidrometeorológicos clave
│   │   │   └── CuencaSelector.tsx # Selector interactivo de cuencas
│   │   └── context/
│   │       └── TelemetryContext.tsx   # Proveedor de estado global de telemetría
│   ├── package.json               # Dependencias de Node.js (Next.js 14, Lucide, Recharts)
│   ├── next.config.js             # Configuración Next.js
│   ├── tailwind.config.js         # Configuración Tailwind CSS
│   └── Dockerfile                 # Contenedor del frontend
│
├── docs/
│   ├── DISTRIBUCION_ANTIGRAVITY_VS_GOOGLE.md # Matriz de roles Antigravity vs GCP
│   ├── INTEGRACION_DATA_HISTORICA_COEN.md   # Informe de fuentes oficiales y datos históricos
│   ├── PROPUESTA_RELOJES_POLARES_AMARU.md   # Especificación técnica AMARU
│   ├── PROPUESTA_TECNICA_ALERTA_ETNOTERRITORIAL_RENALIO.md # Doctrina de difusión bilingüe
│   └── PROPUESTA_TECNICA_SAT_ENSO.md        # Propuesta técnica completa del SAT
│
├── data/                          # Catálogos de respaldo y reportes técnicos
└── README.md                      # Documentación maestra del proyecto
```

---

## 📡 Catálogo de APIs y Endpoints

El backend de **FastAPI** expone los siguientes servicios en `http://localhost:8000`:

| Método | Endpoint | Descripción |
| :---: | :--- | :--- |
| `GET` | `/health` | Estado del servicio y lista de los 4 agentes activos. |
| `GET` | `/api/clocks/enso` | Telemetría cinemática polar viva para **AMARU-FEN** y **AMARU-CHIRI**. |
| `GET` | `/api/maps/layers/telemetry` | Capas territoriales unificadas: boyas DHN, polígono Niño 1+2, clima por UBIGEO y heladas. |
| `GET` | `/api/data/historical/summary` | Estadísticas consolidadas (1,891 distritos, D.S. 124, 46 quebradas). |
| `GET` | `/api/data/distrito/{ubigeo}/profile` | Perfil censal INEI, legal y de riesgo CENEPRED de cualquier UBIGEO. |
| `GET` | `/api/data/distrito/{ubigeo}/etnoterritorial` | Perfil etnoterritorial con evaluación bilingüe vs monolingüe bajo D.S. 009-2021-MC. |
| `GET` | `/api/data/distrito/{ubigeo}/ipi` | Cálculo detallado del **Índice de Prioridad de Intervención (IPI)** y desglose de 4 factores. |
| `GET` | `/api/data/etnoterritorial/ranking-triple-vulnerabilidad` | Ranking nacional IPI filtrable (`todos`, `triple_vulnerabilidad`, `fen_ds124`, `heladas`, `bilingues`). |
| `GET` | `/api/data/etnoterritorial/exportar-csv` | Descarga de la Matriz Nacional de Triple Vulnerabilidad en archivo **CSV estructurado**. |
| `GET` | `/api/data/etnoterritorial/formulas` | Metadatos analíticos y especificación formal LaTeX de los índices (IPI, IPH, ISH). |
| `GET` | `/api/data/quebradas/criticas` | Catálogo nacional de las 46 quebradas críticas con umbrales milimétricos. |
| `GET` | `/api/cuencas/macro` | Resumen de criticidad en macro-cuencas (Rímac, Piura, La Leche, Altiplano). |
| `GET` | `/api/distrito/{ubigeo}/telemetria` | Telemetría rápida y nivel de alerta del distrito. |
| `POST` | `/api/agents/run/{ubigeo}` | **Disparo completo del pipeline de los 4 Agentes** (Centinela → Táctico → Lingüístico → Despachador). |
| `GET` | `/api/agents/status` | Diagnóstico de disponibilidad operativa del Swarm. |
| `GET` | `/api/agents/audit` | Registro inmutable de bitácora de auditoría y latencias de despacho. |
| `POST` | `/api/distrito/{ubigeo}/alerta` | Emisión y despacho de alerta temprana distrital. |
| `GET` | `/api/ciudadano/reportes` | Consulta de señales ciudadanas. Soporta `vista=publica` (blindada) y `vista=militar_c2` (forense). |
| `POST` | `/api/ciudadano/reportar` | Ingesta de reporte con peritaje forense IA, hash SHA-256 y consenso espacial. |
| `GET` | `/api/ciudadano/estadisticas` | Métricas de protección comunitaria, memoria histórica y efectividad anti-fake. |
| `GET` | `/api/ciudadano/transmisiones-en-vivo` | Directorio supervisado de streaming en zona (Drones COE, YouTubers y TikTokers en cuarentena C2). |

---

## 🚀 Puesta en Marcha Local

### Requisitos Previos:
- **Node.js** (v18.x o superior) y **npm**
- **Python** (v3.10 o superior) y **pip**
- (Opcional) **Docker** y **Docker Compose**

### 1️⃣ Iniciar el Backend (FastAPI)

```bash
cd backend

# 1. Crear y activar entorno virtual
python -m venv .venv
# En Windows (PowerShell):
.venv\Scripts\Activate.ps1
# En Linux/macOS:
# source .venv/bin/activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Iniciar el servidor
uvicorn main:app --reload --port 8000
```

El backend estará disponible en: **`http://localhost:8000`**  
Documentación Swagger interactiva: **`http://localhost:8000/docs`**

---

### 2️⃣ Iniciar el Frontend (Next.js 14)

```bash
cd frontend

# 1. Instalar dependencias
npm install

# 2. Compilar bundle de producción (opcional para verificar)
npm run build

# 3. Iniciar el entorno de desarrollo
npm run dev
```

El frontend estará disponible en: **`http://localhost:3000`**

Rutas directas del sistema:
- **`http://localhost:3000/`** : Consola de Mando Nacional C2
- **`http://localhost:3000/geovisor`** : Consola Geovisor Táctico C2 (7 Capas)
- **`http://localhost:3000/doctrina`** : Consola Doctrinal & Fórmulas Matemáticas (IPI, IPH, ISH)
- **`http://localhost:3000/glosario`** : Consola de Glosario Técnico & Catálogo de Mapas C2
- **`http://localhost:3000/dashboard/150118`** : Consola de Comando Municipal (Lurigancho-Chosica)

---

## ⚙️ Variables de Entorno

### Backend (`backend/.env`)
```ini
# Identificadores de Google Cloud Platform
PROJECT_ID=amaru-fen-demo
GCP_REGION=us-central1
GOOGLE_CLOUD_PROJECT=amaru-fen-demo
GOOGLE_CLOUD_LOCATION=us-central1

# Google Gemini / Vertex AI (Google AI Studio)
GEMINI_API_KEY=tu_clave_gemini_aqui

# Telegram Bot API (Opcional para despacho a canales reales)
TELEGRAM_BOT_TOKEN=tu_token_de_bot_aqui
TELEGRAM_CANAL_AUTORIDADES_ID=-100xxxxxxxxxx
TELEGRAM_CANAL_VECINAL_ID=-100xxxxxxxxxx

# Modo Estacional por Defecto
SEASON_MODE=EL_NINO
```

---

## 📖 Documentación Técnica de Referencia

En la carpeta [`docs/`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs) se encuentran los informes técnicos y doctrinales completos:
- **[`DOCUMENTO_PRIVADO_IMPLEMENTACIONES_REPORTE_CIUDADANO_VIDEOWALL_C2.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/DOCUMENTO_PRIVADO_IMPLEMENTACIONES_REPORTE_CIUDADANO_VIDEOWALL_C2.md)**: *(Privado / Reservado)* Doctrina de seguridad y ciberdefensa C2, blindaje anti-fake news (Ley N° 29733), peritaje forense con Gemini Vision, consenso espacial y consola Video Wall C2.
- **[`PROPUESTA_TECNICA_ALERTA_ETNOTERRITORIAL_RENALIO.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/PROPUESTA_TECNICA_ALERTA_ETNOTERRITORIAL_RENALIO.md)**: Especificación formal de la política de difusión bilingüe obligatoria (D.S. 009-2021-MC) y contratos CAP v1.2.
- **[`INTEGRACION_DATA_HISTORICA_COEN.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/INTEGRACION_DATA_HISTORICA_COEN.md)**: Inventario de bases de datos de CENEPRED, D.S. 124-2026-PCM, 46 quebradas críticas e informes oceanográficos FEN 1998/2017.
- **[`PROPUESTA_RELOJES_POLARES_AMARU.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/PROPUESTA_RELOJES_POLARES_AMARU.md)**: Fundamento físico y cinemática polar de $360^\circ$ para `AMARU-FEN` y `AMARU-CHIRI`.
- **[`DISTRIBUCION_ANTIGRAVITY_VS_GOOGLE.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/DISTRIBUCION_ANTIGRAVITY_VS_GOOGLE.md)**: Matriz de responsabilidades y roles tecnológicos de Antigravity vs Google Cloud Platform.
