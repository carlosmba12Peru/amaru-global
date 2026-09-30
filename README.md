# ⚡ AMARU-CLIMATE • Suite Tripartita Soberana de Inteligencia Territorial y Emergencia Climática
## PLATAFORMA DE MISIÓN CRÍTICA, GOBERNANZA ANTICIPATORIA & AUDITORÍA FORENSE
### Fenómeno El Niño (FEN 2026-2027) & Eventos Hidrometeorológicos Extremos

> **Plataforma Tecnológica Soberana e Interoperable de Respuesta, Anticipación y Auditoría ante Desastres**  
> Desarrollado con **FastAPI**, **Next.js 14 (App Router)**, **Google Gemini 1.5 Pro & Vision**, **Open-Meteo Pro (ECMWF IFS 9km)**, **SENAMHI WFS / Radares WRM200 Banda C**, **DHN / IMARPE SIOFEN**, **ENFEN**, **ANA GeoSNIRH**, **CENEPRED**, **MEF Consulta Amigable (PP 0068)**, **RENIEC PIDE**, **MINSA CDC**, **MINCUL (BDPI / RENALIO)** y **Google Cloud Platform**.  
> **Marco Legal e Institucional:** Ley N.º 29664 (SINAGERD), D.S. N.º 124-2026-PCM (Estado de Emergencia FEN), Ley N.º 31526 & D.S. N.º 008-2022-VIVIENDA (Bono BAE de S/ 500), Ley N.º 29735 (Uso y Preservación de Lenguas Originarias del Perú), Ley N.º 29733 (Protección de Datos Personales / Bóveda Zero-PII AES-256), Ley N.º 26842 (Ley General de Salud), NTS N.º 105-MINSA (Triaje en Emergencias), Ley N.º 31814 & D.S. N.º 115-2025-PCM (Uso Ético de IA y Soberanía Humana / HITL), Ley N.º 30225 (Ley de Contrataciones del Estado - Art. 27 Contratación Directa), R.J. N.º 058-2019-CENEPRED/J (PPRRD), y Art. 377 del Código Penal (Inacción Funcional).

---

## 📑 Tabla de Contenidos
1. [Arquitectura Tripartita Soberana de AMARU-CLIMATE](#-arquitectura-tripartita-soberana-de-amaru-climate)
2. [Subservicio 1: COED Nacional AMARU (C2 Macro-Estratégico)](#-subservicio-1-coed-nacional-amaru-c2-macro-estratégico)
3. [Subservicio 2: COED Municipal AMARU (Suite Municipal 360° & Bandeja CGR / ANA)](#-subservicio-2-coed-municipal-amaru-suite-municipal-360)
4. [Subservicio 3: COED Social AMARU (Ground-Truth Comunitario & Resiliencia)](#-subservicio-3-coed-social-amaru-ground-truth-comunitario--resiliencia)
5. [Consola de Auditoría Forense y Calidad de Gobernanza (`/auditoria`)](#-consola-de-auditoría-forense-y-calidad-de-gobernanza-auditoria)
6. [Estación de Radar Meteorológico Doppler Banda C en COED Nacional](#-estación-de-radar-meteorológico-doppler-banda-c-en-coed-nacional)
7. [Pipeline Dual Soberano de Ingesta Oficial: IMARPE (BDO N° 268) & ENFEN](#-pipeline-dual-soberano-de-ingesta-oficial-imarpe--enfen)
8. [Calibración Pericial INDECI Ground Truth (SINPAD 100%) & Simulación Mega-FEN](#-calibración-pericial-indeci-ground-truth-sinpad-100--simulación-mega-fen)
9. [Doctrina Logística PP 0068, Obras ANA & Reloj Táctico Polar](#-doctrina-logística-pp-0068--reloj-táctico-polar)
10. [Geovisor C2 con Doble Motor de Mapeo](#-geovisor-c2-con-doble-motor-de-mapeo)
11. [Reporte Ciudadano Bimodal Blindado](#-reporte-ciudadano-bimodal-blindado)
12. [Inclusión Intercultural: Pre-Padrón EDAN en Lenguas Originarias & Voz Oral](#-inclusión-intercultural-pre-padrón-edan-en-lenguas-originarias--voz-oral)
13. [Módulo SALUD-AMARU: Triaje Digital Desacoplado & Soberanía Médica](#-módulo-salud-amaru-triaje-digital-desacoplado--soberanía-médica)
14. [Swarm Multi-Agente Autónomo & Enjaulamiento Cognitivo](#-swarm-multi-agente-autónomo--enjaulamiento-cognitivo)
15. [Bóveda Criptográfica Envelope Zero-PII & Auditoría WORM](#-bóveda-criptográfica-envelope-zero-pii--auditoría-worm)
16. [Catálogo de Endpoints REST de la API](#-catálogo-de-endpoints-rest-de-la-api)
17. [Despliegue en Google Cloud Platform (Producción 200 OK)](#-despliegue-en-google-cloud-platform--puesta-en-marcha)

---

## 🏛️ Arquitectura Tripartita Soberana de AMARU-CLIMATE

**AMARU-CLIMATE** unifica la toma de decisiones del Estado peruano, la ingeniería municipal de mitigación y la respuesta de primera línea vecinal a través de tres pilares operacionales coordinados:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      AMARU-CLIMATE: SUITE TRIPARTITA SOBERANA                          │
│               Inteligencia Territorial, Alerta Temprana, C2 y Auditoría                │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│     COED NACIONAL AMARU      │ │     COED MUNICIPAL AMARU     │ │      COED SOCIAL AMARU     │
│   (C2 Macro-Estratégico)     │ │   (Suite Municipal 360°)     │ │ (Comunidad & Primera Línea)│
├──────────────────────────────┤ ├──────────────────────────────┤ ├──────────────────────────────┤
│ • Geovisor 3D Multiescala    │ │ • Consola PP 0068 (MEF/SIAF) │ │ • Reporte Ciudadano Blindado │
│ • Radar Doppler Banda C Now. │ │ • Certificador de Maquinaria │ │ • Pre-Padrón EDAN Bilingüe   │
│ • Monitoreo ENFEN/IMARPE/DHN │ │ • Reloj FEN Micro-Calibrado  │ │ • Grabación Oral SHA-256     │
│ • Despacho CAP v1.2 / SISMATE│ │ • Plan Contingencia (PCMD)   │ │ • AMARU-AYNI & Albergues     │
│ • Ingesta KURAQ (27 Fuentes) │ │ • Consola Homologación T1    │ │ • SALUD-AMARU (Triaje NTS)   │
│ • Consola Auditoría Forense  │ │ • Ficha EDAN / BAE S/ 500    │ │ • AMARU-AGRO (SAC / PPA)     │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 🌐 Subservicio 1: COED Nacional AMARU (C2 Macro-Estratégico)

Diseñado para las salas de comando y control del nivel central, ministerios, INDECI, CENEPRED y Fuerzas Armadas:
- **Geovisor 3D Nacional:** Visualización espacial en tiempo real de precipitaciones ECMWF IFS 9km, aforos fluviales telemétricos de la ANA, susceptibilidad aluvial CENEPRED y albergues temporales.
- **Modo War Room:** Expansión visual que maximiza el mapa operativo a pantalla panorámica y colapsa paneles accesorios para videowalls de salas de crisis.
- **Estación Permanente de Radar Doppler Banda C:** Integrada directamente en la consola principal (`/`) con loops de nowcasting interactivos y reflectividad calibrada en dBZ.
- **Fusión Oceanográfica & Fluvial:** Ingesta de la Bitácora Diaria Oceanográfica IMARPE/DHN (Región Niño 1+2), comunicados ENFEN y aforos ANA GeoSNIRH.
- **Despacho Estandarizado OASIS CAP v1.2:** Emisión de alertas estandarizadas compatibles con SISMATE (difusión celular masiva e interoperabilidad internacional).

---

## 🏛️ Subservicio 2: COED Municipal AMARU (Suite Municipal 360° & Bandeja CGR / ANA)

Ubicado en `/municipal/[ubigeo]`, provee a los alcaldes y gerentes de Defensa Civil de los **1,891 municipios del Perú** un centro táctico integral:
1. **Consola de Obras PP 0068 & Certificador de Maquinaria:**
   - Auditoría en tiempo real del avance físico y financiero SIAF de 643 proyectos de defensas ribereñas y descolmatación.
   - **Certificador de Razonabilidad de Precios de Maquinaria Pesada:** Validación instantánea del precio por hora de tractores oruga D8, excavadoras y motobombas frente a la banda de precios oficiales de mercado, habilitando la contratación directa sin sobreprecios conforme al Art. 27 de la Ley N.º 30225.
   - **Alerta por Inacción Funcional:** Notificación preventiva sobre riesgo de responsabilidad penal bajo el **Art. 377 del Código Penal**.
2. **Bandeja de Control Concurrente CGR & Obras de la ANA (`/contraloria`):**
   - Centraliza **todas las obras públicas del Fenómeno El Niño** y las intervenciones fluviales de la **Autoridad Nacional del Agua (ANA)** en un único visor de auditoría gubernamental.
   - Filtros multicriterio por Ubigeo, estado físico/financiero SIAF, tipo de obra (dique, descolmatación, encauzamiento) y semáforo de riesgo CGR.
   - Cuantificación de la inversión requerida y alertas tempranas para evitar observaciones y congelamiento de cuentas ediles.
3. **Reloj FEN Municipal Micro-Calibrado & Arquitectura Horizontal:**
   - Cálculo del tiempo de concentración de la cuenca ($t_c$), tiempo de retardo hidrocinético ($T_{\text{lag}}$) y fecha límite de la **Ventana Dorada (30 de Noviembre)** para trabajos de descolmatación antes de la crecida de ríos ($Q < 15\text{ m}^3/\text{s}$).
   - **Rediseño Ergonómico:** Los **Análogos Históricos (1982-83, 1997-98, 2017, Yaku 2023)** se despliegan en franja horizontal directamente debajo del reloj polar, y a su lado se exhibe el resumen estructurado de las **Obras de la ANA e Inversión Requerida**.
4. **Plan de Contingencia Municipal Digital (PCMD):**
   - Generador automatizado de planes distritales con cálculo de Bienes de Ayuda Humanitaria (BAH) bajo directivas INDECI y proyecto formal de **Resolución de Alcaldía lista para firma**.
5. **PPRRD Digital (CENEPRED):**
   - Cartera de inversiones estructurales y medidas no estructurales conforme a la R.J. N.º 058-2019-CENEPRED/J.
6. **Pre-Padrón EDAN & Damnificados Validados:**
   - Bandeja distrital con desglose de familias, viviendas colapsadas, inhabitables, elegibles al Bono BAE y formalización en SINPAD.

---

## 👥 Subservicio 3: COED Social AMARU (Ground-Truth Comunitario & Resiliencia)

Herramientas concebidas para la ciudadanía, juntas vecinales, ollas comunes y brigadas barriales de primera línea:
- **Consola de Reporte Ciudadano Blindado (`/reporte-ciudadano`):** Formulario estricto en Tiempo Real con selector ergonómico de tirante de agua en un toque (`🦶 Tobillo ~15cm`, `🦵 Rodilla ~50cm`, `🧍 Cintura ~1.00m`, `🏠 Techo >2.00m`).
- **AMARU-AYNI (`/ayni`):** Red comunitaria para ollas comunes (Ley N.º 31458), albergues temporales y canalización de necesidades logísticas y víveres.
- **YACHAY (`/yachay`):** Bioindicadores ancestrales y memoria histórica de resiliencia comunitaria.

---

## 🛡️ Consola de Auditoría Forense y Calidad de Gobernanza (`/auditoria`)

AMARU-CLIMATE incorpora una consola dedicada a la supervisión y verificación independiente de los **7 Controles Forenses Automatizados**:

| # | Control Forense | Base Normativa | Mecanismo Automatizado | Estado Operativo |
|---|---|---|---|---|
| **1** | **Sellado Inmutable SHA-256** | Ley 29733, RFC 3161 | Árbol de Merkle con hash SHA-256 por ficha. Desacoplamiento en Bóveda Cero-PII. | 🟢 CONFORME (14 registros ledger) |
| **2** | **Filtro Anti-Agricultores de Escritorio** | Copernicus Sentinel-1 Banda C + Sentinel-2 | Comparativa SAR pre/post evento y NDVI histórico de 60 días para descartar parcelas sin cultivo previo y duplicidad parcelaria comunal. | 🟢 ACTIVO (6 fraudes bloqueados) |
| **3** | **Alarma de Inacción Financiera PP 0068** | Directiva CGR N.° 013-2022-CG, MEF SIAF | Detección de descalce PIM vs. Devengado en 643 obras. Activación de alertas de Control Concurrente CGR y Art. 377 Código Penal. | 🟢 AUDITANDO (87 obras en alarma) |
| **4** | **Custodia Forense NTS-105 MINSA** | Ley General de Salud 26842, Art. 290 CP | Triaje IA limitado a categorización sindrómica; prescripción médica exclusivamente reservada a galenos CMP mediante protocolo Break-the-Glass (bitácora WORM). | 🟢 BLINDADO (2 desbloqueos auditados) |
| **5** | **Homologación Humana T1 (T+15 / T+30)** | D.S. 008-2021-VIVIENDA | El sistema asigna el código pre-calificado (`CUP-DAMN` o `CUP-MINSA`) para no detener la ayuda al 80% vulnerable; el perito humano valida in-situ a los 15-30 días con certificación SHA-256. | 🟢 VENTANA ABIERTA T1 |
| **6** | **Circuit Breaker HITL** | Estándares C2 de Seguridad Operacional | Parada automática de emergencia (*fail-safe*) que suspende despachos masivos si la discrepancia estadística entre la IA y las actas físicas supera el 15%. | 🟢 ARMADO NORMAL (0 fallas críticas) |
| **7** | **Anti-Fakenews & EXIF Forense** | ISO/IEC 27037 | Validación de Magic Bytes binarios, coordenadas GPS del sensor y verificación de compresión para evitar inyección de fotos descargadas de redes sociales o eventos pasados. | 🟢 ACTIVO (11 fotos espurias rechazadas) |

*Incluye un Validador Interactivo de Códigos Únicos (`CUP-DAMN` y `CUP-MINSA`) y telemetría en vivo conectada al backend vía `GET /api/v1/auditoria/metricas-forenses`.*

---

## 📡 Estación de Radar Meteorológico Doppler Banda C en COED Nacional

Emplazada como consola táctica interactiva en la página principal del COED Nacional (`/`):
- **Estaciones Estratégicas:**
  - **Piura (Banda C 5.6 GHz):** Cobertura operativa sobre las cuencas binacionales Chira, Piura y Tumbes.
  - **Ica (Cerro Colorado):** Cobertura sobre la vertiente occidental y quebradas de Pisco, Ica y Palpa.
- **Arquitectura de Doble Motor con Failover:**
  - Motor primario: SENAMHI WRM200 Banda C.
  - Motor de contingencia: Capa Doppler compuesta **RainViewer Perú**, evitando pantallas en negro ante geo-bloqueos externos.
- **Controles de Comando:**
  - Bucle animado de *Nowcasting* (0 a 120 minutos).
  - Ángulos de elevación de haz (0.5°, 1.5°, 3.0°, 4.5°).
  - Escala de reflectividad calibrada en dBZ (5 a 70 dBZ) para detección temprana de núcleos convectivos severos y lluvia torrencial.

---

## 🌊 Pipeline Dual Soberano de Ingesta Oficial: IMARPE (37 Boletines BDO) & ENFEN

Para neutralizar el fallo estructural del web scraping ocasionado por WAF, bloqueos de IPs de centros de datos y variaciones de plantillas HTML, AMARU-CLIMATE implementa un canal dual:
1. **Canal Automático & Catálogo Histórico Consolidado:**
   - Indexación continua de **37 boletines oficiales diarios** (desde el 15 de agosto hasta el **25 de setiembre de 2026**, BDO N° 268).
   - Monitoreo de TSM in-situ y anomalías térmicas $\Delta T$ en las **12 estaciones costeras fijas** (Tumbes a Ilo).
   - Detección de alerta térmica extrema: **Chicama (+7.6 °C, TSM 23.5 °C)** y **Paita (+8.0 °C)** al 25 de setiembre de 2026 (Boletín N° 268).
   - **Extracción Satelital Oficial de Alta Resolución (Copernicus / OSTIA / LHFM IMARPE):**
     - **Figura 1:** Extensión macroescala en el Pacífico Tropical (Niño 1+2 / Niño 3.4) mostrando la colosal lengua de agua cálida acoplada a la costa septentrional y central.
     - **Figura 3:** Anomalías térmicas de alta resolución en las 200 millas náuticas del mar peruano, evidenciando el retroceso del afloramiento de Humboldt.
2. **Canal Manual de Depósito Forense de PDF:**
   - Botón **`[ 📥 Depositar BDO (PDF) ]`** en la [Consola IMARPE (`/imarpe`)](https://coen-frontend-289004262994.us-central1.run.app/imarpe): Extrae en **< 1.5s** la temperatura superficial del mar (TSM) y anomalías en las 12 estaciones costeras, asociando el hash SHA-256 e indexando las figuras satelitales oficiales.
   - Botón **`[ 📥 Depositar Comunicado (PDF) ]`** en la [Consola ENFEN (`/enfen`)](https://coen-frontend-289004262994.us-central1.run.app/enfen): Parsea el Comunicado Oficial, extrae las probabilidades de El Niño Costero (Com. N° 10 a 16-2026) y actualiza los indicadores multisectoriales sin depender de internet exterior.

---

## 🔬 Calibración Pericial INDECI Ground Truth (SINPAD 100%) & Simulación Mega-FEN

Ubicado en la [Consola de Simulación Mega-FEN (`/simulacion`)](https://coen-frontend-289004262994.us-central1.run.app/simulacion), el motor de computación táctica **AMARU-C4ISR** está anclado formalmente a la base empírica auditada al 100% de liquidación por la Dirección de Respuesta del INDECI:

1. **Contraste Empírico de Catástrofe (FEN 2017 vs. Temporada Regular 2018):**
   - **Damnificados:** 283,137 vs. 13,085 (**21.6x** de incremento).
   - **Viviendas Destruidas/Inhabitables:** 65,942 vs. 3,074 (**21.5x** de incremento).
   - **Canales de Riego Destruidos:** 3,019 km vs. 36.5 km (**82.5x** de devastación agrícola).
   - **Carreteras Destruidas:** 4,030 km vs. 418 km (**9.6x**).
   - **Puentes Destruidos:** 493 puentes vs. 64 puentes (**7.7x** de fractura logística vial).
2. **Leyes de Colapso de Servicios Esenciales (Auditoría SINPAD 2017):**
   - Falla crítica en **Agua Potable y Saneamiento: 66.0%** (28% destruido, 38% afectado).
   - Falla crítica en **Alcantarillado y Desagüe: 47.0%** (27% destruido, 20% colapsado).
   - Falla crítica en **Energía Eléctrica: 48.0%** (16% destruido, 32% cortado).
3. **Ecuaciones Logísticas de Mitigación con AMARU-CLIMATE:**
   - **Veto y Evacuación en Fajas Marginales ANA:** 229 manzanas ribereñas identificadas en cauces críticos. La evacuación guiada con $T-48\text{h}$ de alerta salva 2,860 vidas en un escenario extremo ($\text{TSM} \ge +2.5^\circ\text{C}$).
   - **Pre-posicionamiento T-144h:** Despacho terrestre de Bienes de Ayuda Humanitaria (BAH) a un coeficiente de $8.89\text{ kg/damnificado}$, evitando el costoso puente aéreo tras la caída de los 493 puentes costeros.

---

## 🛰️ Pipeline de Telemetría SENAMHI a Nivel Nacional en Google Cloud Platform

AMARU-CLIMATE cuenta con un pipeline analítico de datos que conecta la red de observación del **SENAMHI** directamente con **Google Cloud Platform (us-central1)**:

* **Censo de Estaciones a Nivel Nacional:** **973 estaciones** censadas a lo largo de los 24 departamentos (699 meteorológicas, 247 hidrológicas automáticas, 27 agrometeorológicas/sutron; 316 automáticas y 657 convencionales).
* **Almacenamiento en Data Lake (Cloud Storage):** `gs://amaru-fen-demo-senamhi-lake`, particionado por `/raw/year=YYYY/month=MM/day=DD/` con políticas de ciclo de vida automáticas (`NEARLINE` a 30 días, `COLDLINE` a 90 días, `ARCHIVE` a 365 días).
* **Data Warehouse Analítico (BigQuery):**
  - **Dataset:** `amaru_senamhi_dw`
  - **Tabla Particionada & Clustered:** `telemetria_estaciones`, particionada diariamente por `fecha_observacion` y agrupada (clustered) por `ubigeo`, `departamento` y `codigo_estacion`.
  - **Vista Materializada:** `mv_resumen_hidro_distrital`, precomputando lluvia máxima de 24h, temperatura media y caudal máximo por distrito.
* **Orquestación Continua (Cloud Scheduler):** Job `senamhi-telemetry-hourly-sync` ejecutado automáticamente cada hora (`0 * * * *`, hora Lima) disparando la ingesta telemétrica hacia Cloud Run.
* **Manejo de Períodos Descontinuados (Failover Híbrido):** Para las estaciones con lagunas temporales históricas (7.6% - 12%) o los distritos sin estación física (~65% del país), el sistema activa automáticamente interpolación espacial (IDW / Kriging) y respaldo satelital en malla (**NASA GPM IMERG 0.1°** y **CHIRPS v2.0 0.05°**).

---

## ⏱️ Doctrina Logística PP 0068 & Reloj Táctico Polar

El **Reloj Táctico Polar** (`TacticalPolarClock.tsx`) sintetiza en tiempo real los promedios de avance físico y financiero de las **6 Familias Estratégicas de Ingeniería del PP 0068** auditadas por el MEF y la Contraloría:
1. Descolmatación intensiva de cauces fluviales (Rímac/Piura/La Leche).
2. Enrocado riprap en fajas marginales urbanas.
3. Defensas ribereñas y desvío de bocatomas rústicas.
4. Preposicionamiento de convoyes de maquinaria INDECI/MTC.
5. Limpieza de drenes pluviales y cuencas ciegas SARE.
6. Mallas geodinámicas y barreras dinámicas en quebradas activas.

---

## 🗺️ Geovisor C2 con Doble Motor de Mapeo

Ubicado en `/geovisor`, el operador táctico puede alternar al instante entre:
- **Retícula Táctica C2 (Deck.gl / MapLibre):** Optimizado para baja latencia, capas temáticas vectoriales de cuencas, aforos ANA y reflectividad radar.
- **Google Maps Platform Satelital 3D:** Ortofoto de alta resolución para inspección pericial de infraestructura, cauces de quebradas, puentes críticos y centros poblados.

---

## 🚨 Reporte Ciudadano Bimodal Blindado

En `/reporte-ciudadano`, el flujo de registro se bifurca de manera estricta y transparente:
- **Flujo de Afectación en Hábitat / Vivienda:** Conduce a la pre-calificación `CUP-DAMN` para la gestión del **Bono de Arrendamiento de Emergencia (BAE) de S/ 500** ante el Ministerio de Vivienda.
- **Flujo de Afectación en Salud:** Banner y enlace directo hacia la consola médica **SALUD-AMARU (`/salud/triaje`)** para atención sindrómica bajo la **NTS N.° 105-MINSA** con emisión de código `CUP-MINSA`.

---

## 🌐 Inclusión Intercultural: Pre-Padrón EDAN en Lenguas Originarias & Voz Oral

Bajo el amparo de la **Ley N.º 29735**, AMARU-CLIMATE garantiza soberanía e inclusión lingüística:
- **Traducción y Locución en Quechua y Aymara:** Fichas EDAN con interfaz bilingüe auditiva para comunidades rurales.
- **Sellado Criptográfico Local de Audio:** Los testimonios orales se firman con hash SHA-256 localmente en el dispositivo antes de transmitirse, garantizando validez probatoria sin exponer datos biométricos.
- **Certificación ReNITLI:** Validación por peritos traductores colegiados con fe pública pericial (Art. 220 Código Procesal Penal).

---

## 🩺 Módulo SALUD-AMARU: Triaje Digital Desacoplado & Soberanía Médica

- **Clasificación Automatizada NTS-105 MINSA:** Determinación objetiva de prioridades I (Grave/Shock), II (Urgencia Mayor), III (Urgencia Menor) y IV (No Urgente).
- **Protocolo Break-the-Glass:** La identidad del paciente permanece cifrada hasta que un médico colegiado (CMP) rompe el sello por necesidad clínica justificada, auditado en bitácora WORM.
- **Soberanía Médica Absoluta:** Cumplimiento de la Ley General de Salud N.° 26842 y el Art. 290 del Código Penal; la IA asiste pero jamás prescribe ni reemplaza al médico.

---

## 🤖 Swarm Multi-Agente Autónomo & Enjaulamiento Cognitivo

| Agente | Nombre / Rol | Misión Principal y Herramientas |
|---|---|---|
| 👑 **Agente 1** | **KURAQ** (Master Data Ingestion) | Ingesta y validación de 27 fuentes oficiales (SENAMHI, IMARPE, ENFEN, ANA, GloFAS). |
| 🧠 **Agente 2** | **YACHAY** (Memoria Histórica & Saberes) | Análogos históricos FEN (1983, 1998, 2017, Yaku 2023), bioindicadores y nodos CAF. |
| ✍️ **Agente 3** | **QILQAY** (Escribano Oficial C2) | Redacción de Resoluciones de Alcaldía, informes situacionales e inyección CAP v1.2. |
| 📐 **Agente 4** | **YUPAQ** (Cálculo Físico & Hidrometeorológico) | Ecuaciones de Manning, Mohr-Coulomb, fórmulas tetra-índice Saaty AHP. |
| ⚖️ **Agente 5** | **FISCALIZADOR** (Auditoría MEF & CGR) | Cruce de proyectos PP 0068, alertas SIAF y razonabilidad de maquinaria (Ley 30225). |
| 👥 **Agente 6** | **COMUNITARIO** (Intercultural & Difusión) | Adaptación lingüística Quechua/Aymara y despacho a Telegram/WhatsApp. |
| 🛰️ **Agente 7** | **SATELITAL** (Teledetección & Radar) | Nowcasting de radares Banda C WRM200 y detección de humedad de suelo Sentinel/ECMWF. |
| 📜 **Agente 8** | **ReNITLI** (Fe Pública Intercultural) | Certificación pericial bilingüe con hash SHA-256 inmutable (Ley N.º 29735). |
| 🩺 **Agente 9** | **SALUD-AMARU** (Triaje Desacoplado) | Clasificación preliminar NTS-105 MINSA y custodia de expedientes CUP-MINSA. |
| 📋 **Agente 10** | **AMARU-DAMNIFICADOS** (Auditor Territorial) | Validación cruzada de Fichas EDAN, consistencia territorial y elegibilidad Bono BAE. |

---

## 🔒 Bóveda Criptográfica Envelope Zero-PII & Auditoría WORM

- **Envelope Encryption:** Claves simétricas AES-256 generadas en memoria volátil; llaves maestras en KMS.
- **Códigos Opacos:** `CUP-MINSA-{UBIGEO}-{HEX}` para atenciones médicas y `CUP-DAMN-{UBIGEO}-{HEX}` para damnificados.
- **Bitácoras WORM (Write Once, Read Many):** Registros inmutables `.jsonl` auditables con marca de tiempo UTC y hash SHA-256 encadenado:
  - `backend/data/audit_salud_break_glass.jsonl`
  - `backend/data/audit_damnificados_break_glass.jsonl`

---

## 🔌 Catálogo de Endpoints REST de la API

### Auditoría Forense y Gobernanza Anticipatoria
- `GET /api/v1/auditoria/metricas-forenses`: Estado consolidado de los 7 controles forenses, pre-padrón ledger, obras PP 0068, triaje NTS-105 y circuit breaker.

### Ingesta Telemétrica SENAMHI en Google Cloud (BigQuery & Cloud Storage)
- `POST /api/v1/jobs/ingest-senamhi`: Ingesta por lotes hacia `gs://amaru-fen-demo-senamhi-lake` y tabla particionada `telemetria_estaciones` en BigQuery.
- `GET /api/v1/jobs/ingest-senamhi/health`: Diagnóstico de salud, conteo de estaciones censadas (973) y estado de conectividad.

### Ingesta Dual Soberana (IMARPE & ENFEN)
- `POST /api/imarpe/upload-pdf`: Carga manual y extracción forense instantánea de Boletín Diario Oceanográfico BDO (PDF).
- `POST /api/enfen/upload-pdf`: Carga manual y extracción forense instantánea de Comunicado Oficial ENFEN (PDF).
- `GET /api/imarpe/latest`: Último informe de TSM y anomalías térmicas en 12 estaciones costeras (al 25 de setiembre de 2026, BDO N° 268).
- `GET /api/imarpe/history`: Serie histórica completa de 37 días continuos (15-Ago a 25-Set).
- `GET /api/enfen/history`: Serie histórica de probabilidades de El Niño Costero (Comunicados N° 10 a 16-2026).

### Módulo Simulación C4ISR & INDECI Ground Truth
- `GET /api/v1/simulacion/mega-fen/nacional`: Simulación probabilística con asimilación dinámica, curvas TSM y avance PP0068.
- `GET /api/v1/simulacion/mega-fen/indeci-ground-truth`: Datos oficiales SINPAD al 100% de liquidación (FEN 2017 vs. 2018 regular), multiplicadores y daño neto.
- `GET /api/v1/simulacion/mega-fen/distritos`: Filtrado pericial de distritos con balances de mitigación C4ISR.
- `GET /api/v1/simulacion/mega-fen/distrito/{ubigeo}`: Perfil distrital de estrés y vidas salvadas en fajas marginales ANA.

### Módulo AMARU-DAMNIFICADOS (Pre-Padrón EDAN & Bono BAE S/ 500)
- `POST /api/v1/damnificados/registrar`: Pre-empadronamiento bilingüe con emisión de `CUP-DAMN` y hash SHA-256.
- `GET /api/v1/municipal/{ubigeo}/padron-damnificados`: Bandeja distrital desacoplada para Defensa Civil.
- `POST /api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/desbloquear-identidad`: Protocolo Break-the-Glass.
- `POST /api/v1/municipal/{ubigeo}/padron-damnificados/{cup}/aprobar-sinpad`: Aprobación y formalización en SINPAD.

### Módulo SALUD-AMARU (Triaje Médico Desacoplado)
- `POST /api/v1/salud/triaje/registrar`: Registro de paciente y emisión de observación NTS-105 con `CUP-MINSA`.
- `GET /api/v1/salud/bandeja-minsa`: Bandeja médica con prioridad de gravedad (I, II, III).
- `POST /api/v1/salud/caso/{cup}/desbloquear-identidad`: Protocolo Break-the-Glass médico con CMP.
- `POST /api/v1/salud/caso/{cup}/resolucion-medica`: Dictamen de conducta médica y rescate.

### Suite Municipal 360°, Obras PP 0068 & Bandeja CGR / ANA
- `GET /api/v1/municipal/{ubigeo}/obras-pp0068`: Cartera de proyectos MEF Consulta Amigable, obras ANA y cuellos de botella SIAF.
- `POST /api/v1/municipal/{ubigeo}/certificar-maquinaria`: Certificación de razonabilidad de maquinaria pesada (Art. 27 Ley 30225).
- `GET /api/v1/municipal/{ubigeo}/reloj-fen`: Métricas hidrocinéticas de cuenca, Ventana Dorada y obras ANA asociadas.
- `GET /api/v1/municipal/{ubigeo}/plan-contingencia-digital`: Generador del Plan PCMD y resolución de alcaldía.

---

## ☁️ Despliegue en Google Cloud Platform & Puesta en Marcha (Producción 200 OK)

### URLs Oficiales en Producción (Cloud Run `us-central1`):
* **Consola COED Nacional C2:** [https://coen-frontend-289004262994.us-central1.run.app/](https://coen-frontend-289004262994.us-central1.run.app/)
* **Consola de Simulación Mega-FEN & Ground Truth INDECI:** [https://coen-frontend-289004262994.us-central1.run.app/simulacion](https://coen-frontend-289004262994.us-central1.run.app/simulacion)
* **Bandeja de Control Concurrente CGR & Obras ANA:** [https://coen-frontend-289004262994.us-central1.run.app/contraloria](https://coen-frontend-289004262994.us-central1.run.app/contraloria)
* **Consola Oceanográfica IMARPE (37 BDOs al 25-Set-2026):** [https://coen-frontend-289004262994.us-central1.run.app/imarpe](https://coen-frontend-289004262994.us-central1.run.app/imarpe)
* **Consola de Auditoría Forense:** [https://coen-frontend-289004262994.us-central1.run.app/auditoria](https://coen-frontend-289004262994.us-central1.run.app/auditoria)
* **Suite Municipal 360° (Ej. Piura):** [https://coen-frontend-289004262994.us-central1.run.app/municipal/200101](https://coen-frontend-289004262994.us-central1.run.app/municipal/200101)
* **Consola Táctica ENFEN (7 Comunicados):** [https://coen-frontend-289004262994.us-central1.run.app/enfen](https://coen-frontend-289004262994.us-central1.run.app/enfen)
* **Consola Médica SALUD-AMARU:** [https://coen-frontend-289004262994.us-central1.run.app/salud/consola-medica](https://coen-frontend-289004262994.us-central1.run.app/salud/consola-medica)
* **Visor Multitemporal Satelital Soberano:** [https://coen-frontend-289004262994.us-central1.run.app/satelites](https://coen-frontend-289004262994.us-central1.run.app/satelites)
* **Consola de Fiscalización Legal:** [https://coen-frontend-289004262994.us-central1.run.app/fiscal](https://coen-frontend-289004262994.us-central1.run.app/fiscal)
* **Backend API REST & Swagger OpenAPI:** [https://coen-backend-289004262994.us-central1.run.app/docs](https://coen-backend-289004262994.us-central1.run.app/docs)

### Despliegue Automatizado con Cloud Build
```bash
# 1. Despliegue de Backend:
gcloud builds submit --tag gcr.io/amaru-fen-demo/coen-backend:latest ./backend --project amaru-fen-demo
gcloud run deploy coen-backend --image gcr.io/amaru-fen-demo/coen-backend:latest --region us-central1 --project amaru-fen-demo --allow-unauthenticated --memory 1Gi --cpu 1 --quiet

# 2. Despliegue de Frontend (Next.js 14):
gcloud builds submit --config ./frontend/cloudbuild.yaml ./frontend --project amaru-fen-demo
gcloud run deploy coen-frontend --image gcr.io/amaru-fen-demo/coen-frontend:latest --region us-central1 --project amaru-fen-demo --allow-unauthenticated --memory 1Gi --cpu 1 --quiet
```

### Ejecución Local
```bash
# Backend:
cd backend
python -m venv .venv
source .venv/bin/activate  # o .\.venv\Scripts\Activate.ps1 en Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend:
cd frontend
npm install
npm run dev
# Acceso en http://localhost:3000
```

---

## 📄 Licencia y Soberanía Tecnológica

Desarrollado bajo principios de **Soberanía Tecnológica Nacional y Ciencia Abierta**. Prohibida su comercialización privada o apropiación sin autorización institucional expresa de las entidades rectoras del SINAGERD.
