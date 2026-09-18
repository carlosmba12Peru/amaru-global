# 🚨 COEN‑Digital Lab4 – Sistema de Alerta Temprana Bi-Escala (SAT-ENSO / AMARU)
## ARQUITECTURA MODULAR TRIPARTITA: COEN NACIONAL, COEN MUNICIPAL Y COEN SOCIAL DIGITAL

> **Centro de Operaciones de Emergencia Nacional (COEN) | INDECI – Presidencia del Consejo de Ministros (PCM) – Perú**  
> **Gemelo Digital Territorial Soberano & Arquitectura Swarm Multi-Agente Autónoma frente a El Niño (ENSO) y Heladas Altoandinas**  
> Desarrollado con **FastAPI**, **Next.js 14 (App Router)**, **Google Gemini 1.5**, **Open-Meteo Pro**, **SENAMHI WFS**, **DHN / IMARPE**, **CENEPRED**, **RENALIO (MINCUL)** y **Google Cloud Platform**.  
> **Marco Legal:** Ley Nº 29664 (SINAGERD), D.S. Nº 124-2026-PCM (FEN/Lluvias) y Ley Nº 29733 (Protección de Datos Personales).

---

## 📑 Tabla de Contenidos
1. [Visión General y Objetivos](#-visión-general-y-objetivos)
2. [Arquitectura Modular Tripartita](#-arquitectura-modular-tripartita-los-tres-pilares)
3. [Consola de Memoria Histórica Municipal de Desastres (1983-2017)](#-consola-de-memoria-histórica-municipal-de-desastres-1983-2017)
4. [Swarm Multi-Agente Autónomo](#-swarm-multi-agente-autónomo)
5. [Matriz de Triple Vulnerabilidad & Algoritmo IPI](#-matriz-de-triple-vulnerabilidad--algoritmo-ipi)
6. [Política Doctrinal de Difusión Bilingüe (RENALIO D.S. 009-2021-MC)](#-política-doctrinal-de-difusión-bilingüe-renalio-ds-009-2021-mc)
7. [Catálogo Cartográfico del Geovisor Táctico C2](#-catálogo-cartográfico-del-geovisor-táctico-c2-7-capas)
8. [Relojes Polares Tácticos AMARU](#-relojes-polares-tácticos-amaru)
9. [Seguridad y Prevención de Colapsos (Zero-Downtime)](#-seguridad-y-prevención-de-colapsos-zero-downtime)
10. [Catálogo de APIs y Endpoints](#-catálogo-de-apis-y-endpoints)
11. [Puesta en Marcha Local](#-puesta-en-marcha-local)
12. [Protocolos de Contingencia y Recuperación](#-protocolos-de-contingencia-y-recuperación)
13. [Documentación Técnica de Referencia](#-documentación-técnica-de-referencia)

---

## 🌎 Visión General y Objetivos

El proyecto **COEN-Digital Lab4 (SAT-ENSO / AMARU)** es un **Gemelo Digital Territorial Soberano** diseñado para transformar la gestión reactiva del riesgo de desastres en una **estrategia de anticipación táctica, algorítmica e inclusiva**.

### Principales Capacidades Operativas:
- **Cobertura Territorial Soberana:** Monitoreo activo de los **1,891 distritos del Perú** clasificados según nivel de peligro CENEPRED SIGRID y priorización legal de los **893 distritos declarados en Estado de Emergencia** bajo el **Decreto Supremo N° 124-2026-PCM**.
- **Memoria Histórica de Desastres (1983-2017):** Expediente histórico por código UBIGEO con cruce de 5 fuentes oficiales: **CAF** (Lecciones aprendidas), **INDECI** (Compendios 1998 y 2017), **OPS/OMS** (Salud y epidemias), **MINEDU/PUCP** (Escuelas) y **MINAG-OIA** (Pérdidas agrícolas).
- **Índice de Prioridad de Intervención (IPI):** Priorización algorítmica de 0 a 100 puntos que cruza CENEPRED, D.S. 124-2026-PCM, heladas altoandinas y brecha etnolingüística RENALIO. Incluye exportador a CSV oficial para salas de crisis.
- **Geocatálogo de Quebradas Críticas:** Catálogo detallado de **46 quebradas críticas nacionales** (conos de deyección, umbrales de activación en $mm/h$, tiempos de concentración y más de **1.2 millones de habitantes expuestos**).
- **Integración Hidrometeorológica y Marina Multifuente:**
  - **SENAMHI:** Red de Estaciones Meteorológicas Automáticas (EMA) mediante OGC WFS GeoServer con corrección de sesgo andino (*bias correction*).
  - **DHN / IMARPE:** Boyas oceanográficas y Bitácora Diaria Oceanográfica (BDO) con isoterma de 15°C, vientos alisios y anomalías térmicas en la **Región Niño 1+2**.
  - **ENFEN:** Comunicados oficiales y probabilidades bimensuales de El Niño Costero y El Niño Global.
  - **Open-Meteo Pro & GloFAS:** Modelos ECMWF IFS 9km, cálculo de energía convectiva (CAPE), humedad de suelo a 4 estratos pedológicos y simulación de caudales en tiempo real.
- **Inclusión Lingüística Soberana (RENALIO D.S. 009-2021-MC):** Adaptación dialectal territorializada en **Quechua Chanka**, **Quechua Collao**, **Quechua Áncash**, **Aymara Altiplánico**, **Asháninka**, **Awajún** y **Castellano Comunitario**.
- **Alertamiento Estandarizado Multicanal:** Cargas útiles compatibles con el estándar internacional **OASIS CAP v1.2 / ITU-T X.1303** para inyección a **SISMATE** (radiodifusión celular) y mensajería comunitaria (Telegram Bot API).

---

## 🏛️ Arquitectura Modular Tripartita: Los Tres Pilares

Para evitar el colapso del sistema y garantizar la máxima eficiencia operativa en todos los niveles del Estado, la plataforma se divide en tres subsistemas interoperables:

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │            TOP-DOWN: Alertas CAP v1.2,                 │
                                  │       Políticas Nacionales, SISMATE y Recursos         │
                                  └──────────────────────────┬─────────────────────────────┘
                                                             │
                                                             ▼
┌──────────────────────────────────────┐   Interoperabilidad   ┌──────────────────────────────────────┐   Interoperabilidad   ┌──────────────────────────────────────┐
│        COEN NACIONAL DIGITAL         │ ◄───────────────────► │        COEN MUNICIPAL DIGITAL        │ ◄───────────────────► │         COEN SOCIAL DIGITAL          │
│    (C2 Macro-Estratégico País)       │   Webhooks / BigQuery │    (Táctico Territorial Distrital)   │     Webhooks / PWA    │     (Comunitario de Primera Línea)   │
├──────────────────────────────────────┤                       ├──────────────────────────────────────┤                       ├──────────────────────────────────────┤
│ • 159 Cuencas Hidrográficas          │                       │ • 1,891 Distritos (Por UBIGEO)       │                       │ • Ollas Comunes y Comedores          │
│ • Monitoreo ENFEN / IMARPE / DHN     │                       │ • Consola Memoria Histórica (1983-17)│                       │ • Juntas Vecinales y Rondas          │
│ • Relojes Polares AMARU FEN/CHIRI    │                       │ • Inspector Climático Open-Meteo     │                       │ • Padrón Vulnerables (Ley 29733)     │
│ • Despacho Nacional SISMATE CAP v1.2 │                       │ • Ficha EDAN Preliminar (SINPAD)     │                       │ • Bot Telegram Bilingüe              │
│ • Geovisor 3D Nacional (Deck.gl)     │                       │ • Activación Cuadrillas / Albergues  │                       │ • PWA Ultra-Liviana Offline-First    │
└──────────────────────────────────────┘                       └──────────────────────────────────────┘                       └──────────────────────────────────────┘
                                                             ▲
                                                             │
                                  ┌──────────────────────────┴─────────────────────────────┐
                                  │           BOTTOM-UP: Groundtruth Ciudadano,            │
                                  │         Reporte de Quebradas y Necesidades EDAN        │
                                  └────────────────────────────────────────────────────────┘
```

1. **🏛️ COEN NACIONAL DIGITAL (`/`, `/geovisor`, `/imarpe`, `/enfen`, `/lex`, `/doctrina`):**  
   Comando y Control (C2) Macro-Estratégico para INDECI Central, Ministerios y FF.AA. Monitorea las 159 cuencas y gobierna el despacho nacional SISMATE.
2. **🏢 COEN MUNICIPAL DIGITAL (`/historico`, `/dashboard/[ubigeo]`, `/meteo`):**  
   Gestión Táctica Distrital para los 1,891 municipios del Perú. Incorpora la **Consola de Memoria Histórica 1983-2017**, el Inspector Climático Local y el asistente de pre-llenado de la **Ficha EDAN** compatible con SINPAD.
3. **🤝 COEN SOCIAL DIGITAL (`/ayni`, `/reporte-ciudadano`, `/yachay`, `/glosario`):**  
   Resiliencia Comunitaria y Primera Línea. Brinda acceso a dirigentas de Ollas Comunes, Juntas Vecinales y brigadistas barriales mediante un Bot Telegram bilingüe y una PWA ultra-ligera (< 3.5 MB) con soporte **Offline-First** (IndexedDB).

---

## 📜 Consola de Memoria Histórica Municipal de Desastres (1983-2017)

Ubicada en **`/historico`**, permite a los alcaldes y secretarios técnicos de Defensa Civil digitar su código UBIGEO o nombre distrital (ej. `150118` o `Chosica`) para auditar:
- **Resumen Comparativo FEN:** Comparativa directa de víctimas, damnificados y viviendas destruidas entre El Niño 1982-83, El Niño 1997-98 y El Niño Costero 2017.
- **Lecciones Aprendidas CAF:** Costos de rehabilitación y buenas prácticas extraídas del compendio oficial de la CAF (304 páginas).
- **Vigilancia Epidemiológica OPS:** Registro de brotes de cólera, dengue, malaria y leptospirosis tras lluvias e inundaciones.
- **Pérdidas Agrícolas MINAG-OIA:** Hectáreas de cultivo destruidas, canales de regadío afectados y familias campesinas damnificadas.
- **Impacto Educativo MINEDU:** Colegios dañados y estudiantes afectados.
- **Directorio de Emergencia GRD:** Teléfonos oficiales de enlace del alcalde, serenazgo y bomberos.

---

## 🤖 Swarm Multi-Agente Autónomo

El backend opera mediante una cadena coordinada de **4 agentes especializados**:

| Agente | Rol Operativo | Capacidades Clave | Latencia |
| :--- | :--- | :--- | :---: |
| **1. Agente Centinela** | *Data & Triage Agent* | Ingesta continua de pluviometría, saturación edáfica en 4 capas ($S_4$), CAPE, boyas DHN y caudal fluvial. Aplica matriz multicriterio de 4 niveles (*Verde, Amarillo, Naranja, Rojo*) y sesgo andino. | 38 ms |
| **2. Agente Táctico** | *Crisis Assessment Agent* | Cruza coordenadas con conos de deyección de quebradas, padrón poblacional INEI, vías en riesgo MTC y maquinaria INDECI. Redacta el Boletín Situacional Oficial con **Gemini 1.5**. | 112 ms |
| **3. Agente Lingüístico** | *Cultural & Dispatch Agent* | Transforma el boletín técnico aplicando la directriz RENALIO: emite alerta **BILINGÜE** (Lengua Nativa + Castellano) en distritos indígenas y en Castellano Llano en zonas urbanas. | 78 ms |
| **4. Agente Despachador** | *Notification & Audit Agent* | Serializa la alerta en norma internacional **OASIS CAP v1.2 / ITU-T X.1303 para SISMATE**, despacha a Telegram y registra auditoría inmutable UTC. | 45 ms |

---

## ⚖️ Matriz de Triple Vulnerabilidad & Algoritmo IPI

$$\text{IPI} = (0.35 \times P_{\text{CENEPRED}}) + (0.30 \times E_{\text{DS124}}) + (0.15 \times H_{\text{AMARU}}) + (0.20 \times B_{\text{RENALIO}})$$

Donde cada variable normalizada aporta entre 0 y 100 puntos:
- **$P_{\text{CENEPRED}}$ (35%)**: Nivel de Peligro CENEPRED (*Muy Alto = 100 pts, Alto = 70 pts, Medio = 40 pts, Bajo = 10 pts*).
- **$E_{\text{DS124}}$ (30%)**: Declaratoria vigente de Estado de Emergencia D.S. Nº 124-2026-PCM (*Vigente = 100 pts, No vigente = 0 pts*).
- **$H_{\text{AMARU}}$ (15%)**: Factor de exposición a heladas y friajes del catálogo AMARU-CHIRI (*100 pts si el distrito está en la franja crítica*).
- **$B_{\text{RENALIO}}$ (20%)**: Brecha etnolingüística según el Registro Nacional de Lenguas Indígenas u Originarias (*100 pts si población indígena > 50%*).

---

## 🛡️ Seguridad y Prevención de Colapsos (Zero-Downtime)

Para evitar colapsos de memoria o caídas de servidor:
1. **Activación Suave por Perfil (`COEN_PERFIL`):** El backend soporta `COEN_PERFIL=nacional`, `municipal`, `social` o `full` para cargar únicamente los routers requeridos en cada contenedor.
2. **Caché en Memoria con TTL:** Las consultas de búsqueda de distritos y datos históricos se almacenan en caché interna, resolviéndose en **0.01 ms**.
3. **Carga Perezosa Dinámica (`next/dynamic`):** El frontend utiliza importaciones dinámicas con `ssr: false` para componentes pesados 3D (Deck.gl y MapLibre), impidiendo que dispositivos móviles descarguen código innecesario.
4. **Protección de Datos Personales (Ley Nº 29733):** Los padrones comunitarios de adultos mayores y personas vulnerables están **cifrados localmente (AES-256)** y nunca se exponen en APIs públicas.

---

## 📡 Catálogo de APIs y Endpoints

### Núcleo y Perfiles
- `GET /health`: Estado del sistema y lista de agentes activos.
- `GET /api/profile`: Retorna el perfil modular tripartito activo (`nacional`, `municipal`, `social`, `full`).

### Memoria Histórica Municipal (1,891 Distritos)
- `GET /api/data/districts/search?q={query}`: Buscador omnicanal con autocompletado y alias peruanos populares (*Chosica, Huaycán, SJL, Tarma, etc.*).
- `GET /api/historico/distrito/{ubigeo}`: Expediente histórico completo de desastres (1983-2017) cruzado con CAF, INDECI, OPS, MINEDU y MINAG.
- `GET /api/historico/resumen`: Métricas nacionales consolidadas de memoria histórica del FEN.

### Meteorología y Decreto Supremo 124
- `GET /api/meteo/ds124-matrix`: Matriz de precipitación de los 893 distritos en emergencia.
- `GET /api/meteo/district-forecast/{ubigeo}`: Pronóstico horario a 7 días y variables convectivas CAPE vía Open-Meteo Pro.
- `GET /api/clocks/enso`: Cinemática polar de $360^\circ$ para los relojes AMARU-FEN y AMARU-CHIRI.

### Oceanografía y Normativa Legal
- `GET /api/imarpe/bulletin/latest`: Telemetría BDO de IMARPE (isoterma 15°C y vientos alisios).
- `GET /api/enfen/latest`: Comunicado oficial más reciente de la comisión ENFEN.
- `GET /api/legal/matrix`: Matriz de 51 normas legales del FEN auditadas con AMARU-LEX.

---

## 🚀 Puesta en Marcha Local

### 1️⃣ Iniciar el Backend (FastAPI)

```bash
cd backend

# 1. Activar entorno virtual
.\.venv\Scripts\Activate.ps1    # En Windows PowerShell
# source .venv/bin/activate     # En Linux/macOS

# 2. Iniciar el servidor
uvicorn main:app --reload --port 8000
```
* Backend activo en: **`http://localhost:8000`**
* Documentación Swagger: **`http://localhost:8000/docs`**

---

### 2️⃣ Iniciar el Frontend (Next.js 14)

```bash
cd frontend

# Iniciar servidor de desarrollo
npm run dev
```
* Frontend activo en: **`http://localhost:3000`**

### Rutas Directas de las Consolas Tripartitas:
| Pilar | Consola | URL |
| :--- | :--- | :--- |
| 🏛️ **COEN Nacional** | Consola de Mando C2 | `http://localhost:3000/` |
| 🏛️ **COEN Nacional** | Geovisor 3D Táctico C2 | `http://localhost:3000/geovisor` |
| 🏛️ **COEN Nacional** | Centro Oceanográfico IMARPE | `http://localhost:3000/imarpe` |
| 🏛️ **COEN Nacional** | Centro ENFEN Oficial | `http://localhost:3000/enfen` |
| 🏛️ **COEN Nacional** | Consola Jurídica AMARU-LEX | `http://localhost:3000/lex` |
| 🏢 **COEN Municipal** | **Memoria Histórica (1983-2017)** | `http://localhost:3000/historico` |
| 🏢 **COEN Municipal** | Inspector Distrital (Chosica) | `http://localhost:3000/dashboard/150118` |
| 🏢 **COEN Municipal** | Open-Meteo FEN (893 D.S. 124) | `http://localhost:3000/meteo` |
| 🤝 **COEN Social** | AMARU-AYNI (Ollas y Padrón) | `http://localhost:3000/ayni` |
| 🤝 **COEN Social** | Reporte Ciudadano Blindado | `http://localhost:3000/reporte-ciudadano` |
| 🤝 **COEN Social** | Saberes Ancestrales YACHAY | `http://localhost:3000/yachay` |

---

## 🆘 Protocolos de Contingencia y Recuperación

El sistema cuenta con un plan de rescate ante imprevistos técnicos o fallos de modelamiento:

* **Restauración Inmediata al Estado Estable (Tag `v1.0.0-stable`):**
  ```powershell
  .\scripts\restaurar_version_estable.ps1
  ```
  *(O mediante comando Git directo: `git reset --hard v1.0.0-stable && git clean -fd`)*

* **Generación de un Nuevo Respaldo ZIP Comprimido:**
  ```powershell
  .\scripts\crear_backup_snapshot.ps1
  ```
  *(Guarda un snapshot comprimido de ~48 MB en `backups/`)*

---

## 📖 Documentación Técnica de Referencia

En la carpeta [`docs/`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs) se encuentran los informes técnicos y confidenciales del proyecto:
- **[`PROPUESTA_TECNICA_EMPAQUETAMIENTO_MODULAR_TRIPARTITO.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/PROPUESTA_TECNICA_EMPAQUETAMIENTO_MODULAR_TRIPARTITO.md)**: Arquitectura de empaquetamiento tripartito, desacoplamiento hexagonal y perfiles Docker.
- **[`DOCUMENTO_PRIVADO_PROTOCOLO_DE_CONTINGENCIAS_Y_RECUPERACION_AMARU_CLIMATE.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/DOCUMENTO_PRIVADO_PROTOCOLO_DE_CONTINGENCIAS_Y_RECUPERACION_AMARU_CLIMATE.md)**: Manual de rescate ante fallos de modelamiento, colapso de Webpack y reconstrucción de entornos.
- **[`DOCUMENTO_PRIVADO_CONSOLA_MEMORIA_HISTORICA_MUNICIPAL.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/DOCUMENTO_PRIVADO_CONSOLA_MEMORIA_HISTORICA_MUNICIPAL.md)**: Arquitectura de la Consola de Memoria Histórica Distrital, datasets de CAF, INDECI, OPS, MINEDU y MINAG-OIA.
- **[`DOSSIER_PRIVADO_MAESTRO_AMARU_CLIMATE_YACHAY_LEX.md`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/docs/DOSSIER_PRIVADO_MAESTRO_AMARU_CLIMATE_YACHAY_LEX.md)**: Dossier maestro integral de ingeniería de datos climáticos, saberes ancestrales y marco legal.
