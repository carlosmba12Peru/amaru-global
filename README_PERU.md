# ⚡ AMARU-CLIMATE • Suite Cuatripartita Soberana de Inteligencia Territorial y Emergencia Climática
## PLATAFORMA DE MISIÓN CRÍTICA, GOBERNANZA ANTICIPATORIA & AUDITORÍA FORENSE
### Fenómeno El Niño (FEN 2026-2027) & Eventos Hidrometeorológicos Extremos (La Niña / Crioclima)

> **Plataforma Tecnológica Soberana e Interoperable de Respuesta, Anticipación y Auditoría ante Desastres**  
> Desarrollado con **FastAPI**, **Next.js 14 (App Router)**, **Google Gemini 1.5 Pro & Vision**, **Open-Meteo Pro (ECMWF IFS 9km)**, **SENAMHI WFS / Radares WRM200 Banda C**, **DHN / IMARPE SIOFEN**, **ENFEN**, **ANA GeoSNIRH**, **CENEPRED**, **MEF Consulta Amigable (PP 0068)**, **RENIEC PIDE**, **MINSA CDC**, **MINCUL (BDPI / RENALIO)**, **Polygon Blockchain (Smart Contract Anclaje L3)** y **Google Cloud Platform**.  
> **Marco Legal e Institucional:** Ley N.º 29664 (SINAGERD), D.S. N.º 124-2026-PCM (Estado de Emergencia FEN), Ley N.º 31526 & D.S. N.º 008-2022-VIVIENDA (Bono BAE de S/ 500), Ley N.º 29735 (Uso y Preservación de Lenguas Originarias del Perú), Ley N.º 29733 (Protección de Datos Personales / Bóveda Zero-PII AES-256), Ley N.º 26842 (Ley General de Salud), NTS N.º 105-MINSA (Triaje en Emergencias), Ley N.º 31814 & D.S. N.º 115-2025-PCM (Uso Ético de IA y Soberanía Humana / HITL), Ley N.º 30225 (Ley de Contrataciones del Estado - Art. 27 Contratación Directa), R.J. N.º 058-2019-CENEPRED/J (PPRRD), Directiva CGR N.° 016-2022-CG (Transferencia de Gestión Municipal), Ley N.° 31358 (Control Concurrente CGR) y Art. 377 del Código Penal (Inacción Funcional).

---

## 📑 Tabla de Contenidos
1. [Arquitectura Cuatripartita Soberana de AMARU-CLIMATE (4 Niveles & 4 Anillos)](#-arquitectura-cuatripartita-soberana-de-amaru-climate)
2. [Motor Dual de Simulación de Estrés Climático: Mega-FEN El Niño (Cálido) vs. La Niña Crioclima (Frío)](#-motor-dual-de-simulación-de-estrés-climático-mega-fen-el-niño-vs-la-niña-crioclima)
3. [Matriz Vectorial Interactivas SVG para Alcaldes: Arquitectura SINAGERD Relacional](#-matriz-vectorial-interactiva-svg-para-alcaldes-arquitectura-sinagerd-relacional)
4. [Subservicio 1: COED Nacional AMARU (C2 Macro-Estratégico)](#-subservicio-1-coed-nacional-amaru-c2-macro-estratégico)
5. [Subservicio 2: COED Municipal AMARU (Suite Municipal 360° & Bandeja CGR / ANA)](#-subservicio-2-coed-municipal-amaru-suite-municipal-360)
6. [Subservicio 3: COED Social AMARU (Ground-Truth Comunitario & Resiliencia)](#-subservicio-3-coed-social-amaru-ground-truth-comunitario--resiliencia)
7. [Subservicio 4: Gobernanza, Fe Pública, Auditoría & Anclaje Blockchain Polygon](#-subservicio-4-gobernanza-fe-pública-auditoría--anclaje-blockchain-polygon)
8. [Matriz Integral SINAGERD: Marco Legal, Procesos y Consolas C2](#-matriz-integral-sinagerd-marco-legal-procesos-subyacentes-y-consolas-c2)
9. [Protocolo Forense de Transición de Mandato Municipal (2023-2026)](#-protocolo-forense-de-transición-de-mandato-municipal-2023-2026)
10. [Consola de Auditoría Forense y Calidad de Gobernanza (`/auditoria`)](#-consola-de-auditoría-forense-y-calidad-de-gobernanza-auditoria)
11. [Estación de Radar Meteorológico Doppler Banda C en COED Nacional](#-estación-de-radar-meteorológico-doppler-banda-c-en-coed-nacional)
12. [Pipeline Dual Soberano de Ingesta Oficial: IMARPE (BDO N° 268) & ENFEN](#-pipeline-dual-soberano-de-ingesta-oficial-imarpe--enfen)
13. [Calibración Pericial INDECI Ground Truth (SINPAD 100%) & Simulación Mega-FEN](#-calibración-pericial-indeci-ground-truth-sinpad-100--simulación-mega-fen)
14. [Doctrina Logística PP 0068, Obras ANA & Reloj Táctico Polar](#-doctrina-logística-pp-0068--reloj-táctico-polar)
15. [Geovisor C2 con Doble Motor de Mapeo](#-geovisor-c2-con-doble-motor-de-mapeo)
16. [Reporte Ciudadano Bimodal Blindado & Tríada CUP](#-reporte-ciudadano-bimodal-blindado)
17. [Inclusión Intercultural: Pre-Padrón EDAN en Lenguas Originarias & Voz Oral](#-inclusión-intercultural-pre-padrón-edan-en-lenguas-originarias--voz-oral)
18. [Módulo SALUD-AMARU: Triaje Digital Desacoplado & Soberanía Médica](#-módulo-salud-amaru-triaje-digital-desacoplado--soberanía-médica)
19. [Swarm Multi-Agente Autónomo & Enjaulamiento Cognitivo](#-swarm-multi-agente-autónomo--enjaulamiento-cognitivo)
20. [Bóveda Criptográfica Envelope Zero-PII & Auditoría WORM](#-bóveda-criptográfica-envelope-zero-pii--auditoría-worm)
21. [Suite de Respuesta Humanitaria E2E & Certificación Operacional (Fases 1 al 4)](#-suite-de-respuesta-humanitaria-e2e--certificación-operacional-fases-1-al-4)
22. [Optimización Arquitectónica UI/UX, Navegación de Alta Velocidad & Experiencia C2](#-optimización-arquitectónica-uiux-navegación-de-alta-velocidad--experiencia-c2)
23. [Gran Escudo Costero FEN 2026: 7 Regiones, 513 Puntos Críticos Georreferenciados, S/ 748.5M en Obras Fluviales y Anclaje Polygon Blockchain](#-gran-escudo-costero-fen-2026-7-regiones-513-puntos-críticos-georreferenciados-s-7485m-en-obras-fluviales-y-anclaje-polygon-blockchain)
24. [Despliegue Local & Servicios (`http://localhost:3000` & `http://localhost:8000`)](#-despliegue-local--servicios)

---

## 🏛️ Arquitectura Cuatripartita Soberana de AMARU-CLIMATE

**AMARU-CLIMATE** organiza la inteligencia territorial, la ingeniería de mitigación, la respuesta comunitaria y la fe pública probatoria a través de **cuatro niveles operacionales sincronizados** respaldados por una **Estrategia Concéntrica de 4 Anillos de Blindaje Legal**:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               AMARU-CLIMATE: SUITE CUATRIPARTITA SOBERANA                                       │
│                        Inteligencia Territorial, Alerta Temprana, C2 y Auditoría Forense                        │
└────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                                         │
         ┌───────────────────────────┬───────────────────┴───────────────────┬───────────────────────────┐
         ▼                           ▼                                       ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐     ┌─────────────────────────┐ ┌─────────────────────────┐
│   COED NACIONAL AMARU   │ │   COED MUNICIPAL AMARU  │     │    COED SOCIAL AMARU    │ │ GOBERNANZA & FE PÚBLICA │
│ (Nivel 1: Macro-C2)     │ │ (Nivel 2: Táctico 360°) │     │ (Nivel 3: Borde Social) │ │ (Nivel 4: Blindaje)   │
├─────────────────────────┤ ├─────────────────────────┤     ├─────────────────────────┤ ├─────────────────────────┤
│ • Sala Situación (/)    │ │ • Suite Edil (/municipal)│     │ • Reporte (/reporte-c.) │ │ • Radar Normas (/lex)   │
│ • Hub Alertas (/alertas)│ │ • Reloj Polar (/pronost.)│     │ • Red AYNI (/ayni)      │ │ • Ficha EDAN (/edan)    │
│ • Geovisor (/geovisor)  │ │ • Obras PP 0068 & ANA   │     │ • Triaje NTS (/salud)   │ │ • Control CGR (/contra) │
│ • Radares Doppler Nowc. │ │ • Certificador Maquinaria│     │ • Saberes (/yachay)     │ │ • Auditoría (/auditoria)│
│ • ENFEN / IMARPE SIOFEN │ │ • Plan Contingencia PCMD│     │ • Glosario (/glosario)  │ │ • Fiscal (/fiscal)      │
│ • Simulación Mega-FEN   │ │ • Alerta Inacción Art.377│    │ • Tríada CUP Zero-PII   │ │ • Doctrina (/doctrina)  │
│ [Anillo 1: Hidrocinético│ │ [Anillo 2: Táctico Oper.]│     │ [Anillo 2: Cripto Borde]│ │ [Anillo 3: Blindaje Leg]│
└─────────────────────────┘ └─────────────────────────┘     └─────────────────────────┘ └─────────────────────────┘
```munidad & Primera Línea)│
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
- **Hub de Alertas Tripartitas C2 (`/alertas`):** Conecta en cascada inmediata los tres niveles de respuesta:
  1. *COED Nacional AMARU:* Emisión macro-estratégica multi-modelo (ECMWF IFS 9km, GloFAS, Radares) en ventanas anticipatorias $T-144\text{h}$ (Estratégico), $T-72\text{h}$ (Táctico) y $T-24\text{h}$ (Operativo Inminente) con sellado SHA-256.
  2. *COED Municipal AMARU:* Bandeja de entrada oficial por UBIGEO para el Alcalde distrital/provincial con cruce local (cuencas ciegas SARE, fajas marginales ANA, cobertizos alpaqueros) y botón de detonación EAP bajo el PP 0068 y el Art. 27 literal b de la Ley N.º 30225.
  3. *COED Social AMARU:* Despliegue cívico anti-pánico con semáforo amigable, geolocalización de albergues seguros, números de emergencia y traducción oficial a lenguas originarias (Castellano, Quechua y Aymara).
- **Matriz Territorial Nacional Multi-Régimen (1,813 Distritos - `/meteo`):** Integración de todos los distritos del país conmutando dinámicamente entre **6 Teatros Operacionales C2**:
  - `🔴 Teatro FEN` (875 distritos D.S. Nº 124-2026-PCM): Lluvias torrenciales, crecidas de ríos y huaicos en costa y vertiente occidental.
  - `🌊 Teatro EPICENTRO PIURA` (64 distritos): Núcleo hidrometeorológico pluvial del Norte (cuencas ciegas SARE, Radar Doppler SENAMHI y cuenca Chira-Piura).
  - `🔵 Teatro CHIRI` (1,530 distritos PMHF / CENEPRED ERHF): Heladas severas en Andes y friajes en la Amazonía.
  - `❄️ Teatro EPICENTRO PUNO` (110 distritos altiplánicos / 106 ERHF): Núcleo crioclimático puro con monitoreo de ganado alpaquero/ovino, bofedales y heladas extremas ($T_{\min} \le -18.5^\circ\text{C}$).
  - `🟣 Teatro PINZA MULTI-AMENAZA` (592 distritos solapados): Doble vulnerabilidad con saturación hídrica diurna y congelamiento nocturno.
  - `🌐 Teatro TODOS` (1,813 distritos): Visión holística de inteligencia territorial de la República.
- **Módulo Predictivo Multidía (7 Días) & Protocolos EAP (`/pronostico`):** Matriz hidro-termodinámica a 7 días con filtros interactivos por día (`TODOS`, `Día 1` a `Día 7`, `PICO`) y umbrales de lluvia ($\ge 35\text{ mm}$, $\ge 18\text{ mm}$, $\ge 6\text{ mm}$) y crioclima altiplánico.
- **Modelamiento Crioclimático AMARU-CHIRI:** Algoritmo termodinámico de reducción de escala andina que computa $T_{\text{mín\_calibrada}}$, punto de rocío y acumulación de nieve ($S_{\text{nieve}}$) cruzado con el censo ganadero y demografía de alto riesgo (<5 años y >65 años).
- **Geovisor 3D Nacional:** Visualización espacial en tiempo real de precipitaciones ECMWF IFS 9km, aforos fluviales telemétricos de la ANA, susceptibilidad aluvial CENEPRED y albergues temporales.
- **Modo War Room:** Expansión visual que maximiza el mapa operativo a pantalla panorámica y colapsa paneles accesorios para videowalls de salas de crisis.
- **Estación Permanente de Radar Doppler Banda C:** Integrada directamente en la consola principal (`/`) con loops de nowcasting interactivos y reflectividad calibrada en dBZ.
- **Sandbox de Cuarentena Anti-Desinformación para Streams en Directo:** Ingesta aislada para transmisiones de YouTubers, TikTokers y corresponsales ciudadanos con verificación automática frente a sensores telemétricos antes de difusión pública para evitar histeria colectiva.
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

Herramientas concebidas para la ciudadanía, juntas vecinales, criadores altoandinos, ollas comunes y brigadas barriales de primera línea:
- **Consola de Reporte Ciudadano Blindado (`/reporte-ciudadano`):** Formulario estricto en tiempo real con selector ergonómico de tirante de agua (`🦶 Tobillo`, `🦵 Rodilla`, `🧍 Cintura`, `🏠 Techo`) y censo pecuario de emergencia.
- **Tríada de Códigos Opacos de Protección Social (Zero-PII):**
  - `CUP-DAMN`: Auxilio habitacional, vivienda colapsada e inyección al padrón del Bono BAE (S/ 500).
  - `CUP-MINSA`: Triaje médico NTS-105 MINSA, reserva asistencial e interconexión con COE-Salud.
  - `CUP-AGRO`: Protección del patrimonio pecuario (alpacas, ovinos, vacunos) y cultivos siniestrados para activación del Seguro Agrícola Catastrófico (SAC) y kits veterinarios.
- **AMARU-AYNI (`/ayni`):** Red comunitaria para ollas comunes (Ley N.º 31458), albergues temporales y canalización de necesidades logísticas y víveres.
- **YACHAY (`/yachay`):** Bioindicadores ancestrales y memoria histórica de resiliencia comunitaria.
- **Glosario Hidrometeorológico Oficial (`/glosario`):** Diccionario terminológico oficial para autoridades y ciudadanía.

---

## ⚖️ Subservicio 4: Gobernanza, Fe Pública, Auditoría & Legalidad (Anillo 3)

Diseñado para asesorías jurídicas, órganos de control institucional (OCI/CGR), fiscalías de prevención del delito y alcaldes que requieren blindaje administrativo y probatorio:

1. **AMARU-LEX (`/lex`):**
   - Radar e indexador analítico de las **51 Normas Legales Oficiales** del Fenómeno El Niño 2026-2027 publicadas en *El Peruano*.
   - **Pestaña Interactiva `⚖️ Matriz SINAGERD & Consolas C2`:** Visualizador interactivo de correspondencia entre el marco jurídico peruano, los procesos subyacentes de la GRD y las consolas C2 de AMARU-CLIMATE, con filtros por nivel normativo y búsqueda en tiempo real.
   - Generador automático de proyectos de **Resolución de Alcaldía para Contratación Directa** (Art. 27 lit. b Ley N.° 30225 y D.S. N.° 124-2026-PCM) y Copiloto IA con estricto principio *Human-in-the-Loop* (HITL).
2. **Ficha EDAN Perú v2 Oficial (`/edan`):**
   - Digitalización de la Ficha EDAN 2B con cálculo automático del **Índice de Consistencia Territorial ($I_{\text{CT}} \ge 0.70$)**.
   - Validación PIDE-RENIEC previa y precarga canónica hacia el SINPAD de INDECI.
3. **Bandeja de Control Concurrente CGR en Vivo (`/contraloria`):**
   - Monitoreo en tiempo real de 643 obras públicas de mitigación del FEN y obras fluviales de la Autoridad Nacional del Agua (ANA).
   - Generación de expedientes de contratación directa con sellado de tiempo RFC 3161 y hash SHA-256 para evitar observaciones de Contraloría.
4. **Consola de Auditoría Forense WORM (`/auditoria`):**
   - Supervisión de los 7 controles forenses automatizados con ledger inmutable de solo adición (*Write Once, Read Many*).
   - Validador interactivo de códigos opacos `CUP-DAMN`, `CUP-MINSA` y `CUP-AGRO`.
5. **Consola de Fiscalización Presupuestal PP 0068 & FONDES (`/fiscal`):**
   - Trazabilidad del gasto público, descalce PIM vs. Devengado en el SIAF del MEF y activación de alertas tempranas por inacción funcional (**Art. 377 del Código Penal**).
6. **Doctrina C2 de Emergencia y Tetra-Índices (`/doctrina`):**
   - Sustento axiomático de los índices IRCE, IPH, IPI e ISH y correspondencia directa con la Matriz SINAGERD en `/lex`.

---

## 📜 Matriz Integral SINAGERD: Marco Legal, Procesos Subyacentes y Consolas C2

AMARU-CLIMATE implementa una correspondencia biunívoca entre la pirámide jurídica del Estado peruano y la arquitectura de consolas operacionales:

| Nivel Normativo | Base Legal Peruana | Proceso SINAGERD / Proceso Subyacente | Consola AMARU-CLIMATE | Función Operativa y Blindaje Criptográfico en AMARU |
| :--- | :--- | :--- | :--- | :--- |
| **I. Constitucional & Ley Matriz** | **Constitución Política del Perú** (Art. 137, inc. 1)<br/>**D.S. N° 074-2014-PCM** | **Declaratoria de Estado de Emergencia por Catástrofe o Peligro Inminente:** Trámite de solicitud técnica al Ejecutivo. | **`AMARU-LEX`** (`/lex`)<br/>**`AMARU-REDACTOR`** (`/redactor`) | Verifica en tiempo real la vigencia del D.S. en el Ubigeo y redacta el informe técnico de sustento para solicitar prórrogas o ampliaciones ante la PCM. |
| **I. Ley Matriz SINAGERD** | **Ley N° 29664**<br/>**D.S. N° 048-2011-PCM** (Reglamento) | **Los 7 Procesos de la GRD:** Estimación, Prevención, Reducción, Preparación, Respuesta, Rehabilitación y Reconstrucción.<br/>**Roles CENEPRED / INDECI** y 5 Niveles de Emergencia. | **`SALA C2 NACIONAL`** (`/`)<br/>**`GEOVISOR C2 3D`** (`/geovisor`)<br/>**`DOCTRINA C2`** (`/doctrina`) | Clasifica los eventos del territorio según los Niveles 1 al 5 del SINAGERD. Integra la cartografía oficial de CENEPRED e INDECI en 7 capas geoespaciales inmutables. |
| **II. Financiero & Presupuestal** | **Programa Presupuestal 0068 (PP 0068)**<br/>MEF / DGPP | **Asignación, Modificación y Ejecución de Partidas de Emergencia:** Actividades de preparación, compra de combustible, motobombas y descolmatación. | **`AMARU-FISCAL`** (`/fiscal`)<br/>**`AMARU-MUNICIPAL`** (`/municipal/[ubigeo]`) | Conecta con la Consulta Amigable MEF. Monitorea el PIM, Devengado y Saldo del PP 0068 por municipalidad para detonar las acciones anticipatorias (EAP). |
| **II. Fondos Extraordinarios** | **Ley N° 30458 (FONDES)**<br/>**Directiva N° 008-2021-INDECI**<br/>Decretos de Urgencia FEN | **Seguimiento Físico y Financiero de Intervenciones:** Justificación de fondos concursables y transferencias extraordinarias de emergencia. | **`AMARU-FISCAL`** (`/fiscal`)<br/>**`AMARU-LOGISTICA`** (`/logistica`) | Genera la trazabilidad del avance físico de obras de contingencia y ruteo logístico de maquinaria financiada con el FONDES. |
| **II. Contratación Directa** | **Ley N° 30225 (Ley de Contrataciones)** (Art. 27 lit. b)<br/>**Ley N° 31433** / **Ley N° 31812** | **Contratación Directa por Situación de Emergencia:** Exoneración de licitación pública previa, con regularización posterior en 10 días hábiles. | **`AMARU-CONTRALORIA`** (`/contraloria`)<br/>**`AMARU-LEX`** (`/lex`) | Habilita el **Control Concurrente CGR en Vivo**: Genera el expediente de contratación directa con sello de tiempo RFC 3161 y hash SHA-256 para evitar observaciones de Contraloría. |
| **III. Operativo & Daños** | **Res. Jefatural N° 035-2020-INDECI** (Directiva EDAN Perú)<br/>Criterios 2H, 8H, 72H | **Evaluación de Daños y Análisis de Necesidades (EDAN):** Levantamiento preliminar y empadronamiento de familias damnificadas y afectadas. | **`AMARU-EDAN`** (`/edan`) | Digitaliza la **Ficha EDAN 2B**, calcula automáticamente el Índice de Consistencia $I_{\text{CT}} \ge 0.70$ y valida los datos con RENIEC antes del envío al SINPAD. |
| **III. Registro Oficial de Emergencias** | **SINPAD (INDECI)** (Sistema de Información Nacional para la Respuesta y Rehabilitación) | **Cierre del Bucle Oficial:** Registro formal de emergencias para habilitar la entrega de Bienes de Ayuda Humanitaria (BAH) y Bono BAE. | **`AMARU-EDAN`** (`/edan`)<br/>**`AMARU-AUDITORIA`** (`/auditoria`) | Exporta la data en el esquema canónico exigido por SINPAD, con bitácora inmutable WORM protegida contra alteraciones. |
| **III. Ayuda Humanitaria** | **Res. Ministerial N° 180-2016-PCM** (Lineamientos BAH)<br/>**Ley N° 31458** (Ollas Comunes) | **Adquisición, Almacenamiento y Distribución de Bienes de Ayuda Humanitaria:** Techo, abrigo, herramientas, raciones frías y agua. | **`AMARU-LOGISTICA`** (`/logistica`)<br/>**`AMARU-AYNI`** (`/ayni`) | Algoritmo de ruteo de vehículos (VRP) para abastecer almacenes de avanzada distritales y distribución a la red comunitaria de ollas comunes. |
| **III. Centros de Operaciones** | **Res. Ministerial N° 173-2015-PCM** (Lineamientos de COE) | **Organización y Funcionamiento de Salas de Crisis:** Articulación COEN (Nacional), COER (Regional) y COEL (Local). | **`SALA SITUACIÓN C2`** (`/`)<br/>**`HUB ALERTAS`** (`/alertas`)<br/>**`AMARU-MUNICIPAL`** (`/municipal/[ubigeo]`) | Implementa exactamente las pantallas de situación de crisis del COEN y provee al Alcalde la consola de comando COEL con despacho telemático. |
| **IV. Sectorial: El Niño / La Niña** | **D.S. N° 007-2017-MINAM** (Comisión ENFEN)<br/>Planes de Contingencia FEN | **Sustento Científico Oficial para Declaratorias de Emergencia:** Alertas de ENFEN (No Activo / Vigilancia / Alerta FEN Costero). | **`AMARU-ENFEN`** (`/enfen`)<br/>**`AMARU-IMARPE`** (`/imarpe`)<br/>**`AMARU-SIMULACION`** (`/simulacion`) | Ingesta automática de comunicados oficiales y boyas oceanográficas; correlaciona la anomalía de TSM con el gatillo científico que justifica el gasto de preparación. |
| **IV. Sectorial: Recursos Hídricos & Cuencas** | **Ley N° 29338** (Recursos Hídricos)<br/>**Res. Jefatural N° 136-2020-ANA** | **Monitoreo de Caudales, Fajas Marginales y Emergencias Hídricas:** Aforos en ríos norteños y control de bocatomas. | **`AMARU-RIOS`** (`/rios-norte`)<br/>**`AMARU-QUEBRADAS`** (`/quebradas`) | Monitorea los aforos de la ANA en tiempo real (Río Piura, Chira, Tumbes, Rímac) y dispara la evacuación al cruzar los umbrales de peligro hidrológico. |
| **IV. Sectorial: Déficit Hídrico & Heladas** | **Planes Multisectoriales de Heladas y Friajes (PCM)**<br/>Lineamientos MIDAGRI | **Protección Agropecuaria y Asistencia Alimentaria:** Kits veterinarios, antiparasitarios, pacas de heno y cobertizos de camélidos. | **`AMARU-CHIRI` (Reloj Polar)** (`/pronostico`)<br/>**`AMARU-CAJAMARCA`** (`/cajamarca`) | Predicción a 144 horas de descenso bajo cero; despacho de órdenes de entrega de forraje y dosificación ganadera antes de la helada. |
| **IV. Sectorial: Incendios Forestales & Satélites** | **Ley N° 29763** (Ley Forestal)<br/>**D.S. N° 018-2015-MINAGRI** (SERFOR SAMIR)<br/>**Ley N° 31297** (CGBVP) | **Detección Temprana de Focos de Calor:** Alerta temprana para guardaparques SERNANP y bomberos forestales. | **`AMARU-SATELITES`** (`/satelites`)<br/>**`AMARU-METEO`** (`/meteo`) | Ingesta de sensores MODIS y VIIRS (NASA AQUA/TERRA) para alertar puntos de calor anómalos y velocidad de viento que propaguen fuego de interfase. |
| **V. Auditoría & Prueba Digital** | **Norma Técnica Peruana ISO/IEC 27037**<br/>Art. 377 Código Penal | **Preservación Inmutable de Evidencia Digital:** Registro pericial de la alerta emitida, orden recibida y firma de autoridad. | **`AMARU-AUDITORIA`** (`/auditoria`) | Bitácora **WORM (Write Once, Read Many)** con árboles de Merkle. Demuestra judicialmente que la autoridad actuó con diligencia técnica oportuna. |
| **V. Transición de Mandato Edil** | **Ley N° 27972** (Orgánica de Municipalidades)<br/>**Directiva CGR N° 016-2022-CG**<br/>Art. 377 Código Penal | **Auditoría de Transición y Custodia Ininterrumpida (2023-2026):** Transferencia formal de almacenes BAH, saldos PP 0068 y tokens SINPAD al 31-Dic-2026 en 1,893 distritos. | **`AMARU-AUDITORIA`** (`/auditoria`)<br/>**`AMARU-FISCAL`** (`/fiscal`) | Acta de entrega-recepción sellada en blockchain/WORM que garantiza la continuidad operativa humanitaria durante el pico del Mega-FEN 2026-2027. |

---

## 🏛️ Protocolo Forense de Transición de Mandato Municipal (2023-2026)

Conforme al marco constitucional peruano (Art. 194 de la Constitución Política y Ley Orgánica de Municipalidades N.° 27972), el periodo constitucional de los **1,893 alcaldes distritales y provinciales de la República culmina el 31 de diciembre de 2026**.

Dado que el fenómeno climatológico Mega-FEN 2026-2027 alcanza su fase de máxima intensidad hidrometeorológica entre **diciembre de 2026 y abril de 2027**, AMARU-CLIMATE implementa un protocolo tecnológico ininterrumpido de custodia y transición:
1. **Acta de Corte de Almacén BAH Digital (WORM):** Generación automática del inventario físico y georreferenciado de bienes de ayuda humanitaria (carpas, calaminas, raciones y motobombas) con sellado SHA-256 al 31 de diciembre a las 23:59:59 UTC-5.
2. **Custodia de Saldos del Programa Presupuestal 0068:** Generación del balance conciliado de partidas presupuestarias de emergencia certificadas en el MEF/SIAF para evitar el congelamiento de cuentas o la desatención del gasto de respuesta inmediata.
3. **Traspaso de Credenciales y Tokens SINPAD:** Procedimiento automatizado de reasignación de tokens criptográficos de autorización SINPAD hacia los comités de transferencia entrantes, evitando vacíos administrativos o tipificación de abandono de funciones (**Art. 377 del Código Penal**).

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

## 🚨 Reporte Ciudadano Trimodal Blindado

En `/reporte-ciudadano`, el flujo de registro se estructura en una tríada estricta, desacoplada y transparente:
- **Flujo de Afectación en Hábitat / Vivienda (`CUP-DAMN`):** Conduce a la pre-calificación para la gestión inmediata del **Bono de Arrendamiento de Emergencia (BAE) de S/ 500** ante el Ministerio de Vivienda y formalización SINPAD.
- **Flujo de Afectación en Salud Vital (`CUP-MINSA`):** Banner y enlace directo hacia la consola médica **SALUD-AMARU (`/salud/triaje`)** para atención sindrómica bajo la **NTS N.° 105-MINSA** con triaje clínico Manchester.
- **Flujo de Afectación Pecuaria y Agraria (`CUP-AGRO`):** Censo rápido en borde de mortandad de camélidos sudamericanos (alpacas), ovinos y vacunos, más hectáreas de cultivo anegadas o heladas, canalizado al Seguro Agrícola Catastrófico (SAC) y kits veterinarios de emergencia MIDAGRI.

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
  - `backend/data/audit_cgr_worm_ledger.jsonl`

---

## 🚀 Suite de Respuesta Humanitaria E2E & Certificación Operacional (Fases 1 al 4)

AMARU-CLIMATE consolida una suite de validación de extremo a extremo (**42 pruebas automatizadas, 100% PASS, ejecución en 0.85s, $0.00 USD de facturación en APIs externas**) que certifica algorítmica y normativamente el ciclo de vida completo de la respuesta ante desastres:

```
[ 1. Sensor WhatsApp ] ➔ [ 2. Prellenado EDAN ] ➔ [ 3. Quórum Dual ] ➔ [ 4. Ruteo Dijkstra ] ➔ [ 5. Despacho Convoy ] ➔ [ 6. Blindaje WORM ]
     (NLP Comunitario)        (Síntesis 75%)        (Alcalde + PNP)       (Evitación Puentes)      (MRE + Hojas Ruta)      (Merkle Ley 31358)
```

### 1. Fase 1: Prellenado Inteligente EDAN Digital y Quórum Dual Criptográfico
- **Síntesis Dinámica Territorializada al 75%:** Cruza en milisegundos el censo INEI 2017-2026, 229 manzanas censales en fajas marginales ANA y medios de vida diferenciados (arroz/algodón en costa vs. papa/maíz y camélidos en sierra).
- **Cálculo de Suministros INDECI:** Determina automáticamente los requerimientos de Bienes de Ayuda Humanitaria (BAH) bajo el Anexo 06 (carpas, frazadas, raciones frías MRE y agua potable).
- **Quórum Asimétrico Dual Obligatorio:** Exige concurrentemente la **Firma 1 (Alcalde Distrital / COEL)** y la **Firma 2 (Comisario PNP de la jurisdicción)** bajo la **Ley N.º 27269 (Ley de Firmas y Certificados Digitales)** con timestamps UTC y hash SHA-256 conjunto.
- **Desbloqueo Inmediato de Almacenes:** Genera el dictamen vinculante de `DESBLOQUEO_TOTAL_ALMACEN_INDECI` en menos de 2 horas desde el evento, neutralizando la parálisis burocrática y el desvío político de víveres.
- **Interoperabilidad SINPAD v2.0:** Exporta el payload canónico para carga masiva oficial bajo la **R.S. N.º 002-2026-PCM/SGRD** y genera el documento PDF oficial con código QR pericial.

### 2. Fase 2: Geovisor Logístico VRP, Evitación Reactiva de Cortes Viales y Convoyes Asistidos
- **Topología Vial Ponderada GeoJSON:** Malla de grafos que conecta almacenes centrales (COEN/COER), puestos de avanzada y distritos vulnerables con aristas penalizadas por amenaza hidro-geomorfológica.
- **Detección Reactiva de Cortes de Vía:** Inyección instantánea de estados de colapso de puentes (ej. Puente Independencia en Piura o Puente Breña en Huancayo) ante alertas de campo verificadas.
- **Ruteo Dijkstra Adaptativo:** Recalcula de forma autónoma la ruta alternativa segura esquivando los tramos destruidos.
- **Dimensionamiento de Convoyes Humanitarios:** Asigna automáticamente camiones de 15 Tn y 30 Tn, calculando el peso neto de raciones y agua, y expide la **Hoja de Ruta Geocodificada con Sello de Despacho** y clave de rastreo.

### 3. Fase 3: Sensor Comunitario WhatsApp de Campo + Bitácora Inmutable WORM Merkle CGR
- **Sensor Humano de Campo vía WhatsApp:** Interfaz emuladora y webhook para reportes comunitarios de primera línea; procesa lenguaje natural (NLP multilingüe), extrae familias damnificadas y víveres requeridos, e inyecta alertas de colapso vial en la topología logística con soporte store-and-forward offline.
- **Bitácora Inmutable WORM de Solo Adición:** Arquitectura basada en árboles de Merkle (`backend/services/cgr_worm_service.py`) con encadenamiento SHA-256 ininterrumpido de cada acto administrativo, firma de quórum y despacho.
- **Resistencia Anti-Adulteración (Tamper-Evidence):** Validación criptográfica continua que detecta modificaciones retroactivas al nivel del byte y anula registros fraudulentos.
- **Certificado Pericial de Control Concurrente CGR:** Emisión automática del certificado oficial (`CERT-CGR-WORM-YYYYMMDD-XXXXX`) bajo la **Ley N.º 31358**, garantizando el blindaje de las autoridades ediles frente a investigaciones fiscales.

### 4. Fase 4: Certificación E2E de Ciclo de Vida Multi-Fenómeno
- **Escenario A • Mega-FEN Costero (Catacaos, Piura):** Alerta vecinal de rotura de dique ➔ prellenado EDAN ➔ quórum Alcalde + PNP ➔ bypass automático por colapso de Puente Independencia ➔ convoy despachado ➔ acuñación WORM y SINPAD v2.
- **Escenario B • FEN Andino / Heladas (Chupaca, Junín):** Solicitud comunitaria de abrigo y forraje ➔ EDAN andino con Seguro Agrícola SAC ➔ quórum dual ➔ desvío logístico por Puente Breña ➔ acuñación WORM y certificado CGR.
- **Métricas Certificadas:** 42 pruebas aprobadas al 100%, 0 fallos, latencia de ciclo completo de 14.6 ms, $0 USD de costo computacional en nubes comerciales.

---

## ⚡ Optimización Arquitectónica UI/UX, Navegación de Alta Velocidad & Experiencia C2

Diseñada para salas de crisis de misión crítica, la interfaz elimina la sobrecarga cognitiva (Ley de Hick) y optimiza la interacción del operador táctico:

1. **Command Palette Universal (`Ctrl + K` / `Cmd + K`):**
   - Consola flotante tipo Spotlight/Alfred (`CommandPaletteModal.tsx`) con búsqueda en memoria volátil (< 50 ms) sobre el catálogo de 1,874 distritos del Perú, puentes críticos y atajos de acción inmediata (`> Nuevo EDAN`, `> Simular Corte de Puente`, `> Enviar WhatsApp`, `> Verificar Ledger WORM`).
   - Cero peticiones de red: opera 100% con diccionarios cacheados en el navegador del cliente.
2. **Emergency Lifecycle Stepper:**
   - Barra concéntrica de estado (`EmergencyLifecycleStepper.tsx`) que sintetiza en una sola línea visual el ciclo de vida del desastre en 5 etapas reactivas: `Alerta` ➔ `EDAN` ➔ `Quórum Dual` ➔ `Ruteo Logístico` ➔ `Blindaje WORM`.
3. **HeaderNav Táctico Unificado (56px):**
   - Rediseño ergonómico que reduce la altura vertical de 120px a solo 56px, organizando el acceso al sistema en 4 Macro-Suites jerárquicas:
     - `COED Nacional C2` (Macro-Estratégico)
     - `COED Municipal` (Táctico 360°)
     - `COED Social` (Borde Comunitario)
     - `Gobernanza & CGR` (Fe Pública y Auditoría)
4. **Mecanismo de Cross-Linking Operativo Inter-Módulos:**
   - Transferencia automática de contexto mediante `URL Query Parameters` entre consolas:
     - `/simulacion` ➔ `/edan?ubigeo={ubigeo}` (carga inmediata de damnificados proyectados).
     - `/simulacion` ➔ `/logistica?puente_bloqueado={puente_id}` (inyección de corte de vía).
     - `/edan` ➔ `/logistica?edan_id={id}` (dimensionamiento de convoy de auxilio).
     - `/logistica` ➔ `/edan?tab=worm` (inspección del bloque acuñado en el ledger CGR).
5. **Design System Semántico para Salas Oscuras:**
   - Paleta de tokens de alto contraste antifatiga visual (Rose-500 Peligro Extremo, Amber-500 Alerta EAP, Emerald-500 Seguro/Quórum, Sky-600 Sensores Telemétricos, Violet-500 Criptografía WORM, Slate-950 Lienzo C2).

---

## 🛡️ Gran Escudo Costero FEN 2026: 7 Regiones, 513 Puntos Críticos Georreferenciados, S/ 748.5M en Obras Fluviales y Anclaje Polygon Blockchain

En cumplimiento estricto de los principios de ingeniería ética, soberanía de datos y fe pública territorial postulados por el Dr. Eduardo Ísmodes, **AMARU-CLIMATE** consolida la totalidad del litoral vulnerable y vertientes occidentales del Perú frente al FEN 2026 (7 departamentos: Arequipa, Ica, La Libertad, Lambayeque, Lima, Piura y Tumbes) integrando en una sola arquitectura unificada la cartografía técnica oficial del Estado peruano:
- **CENEPRED SIGRID:** Planes de Prevención y Reducción del Riesgo de Desastres (PPRRD distritales, puntos críticos de peligro y medidas estructurales georreferenciadas).
- **Autoridad Nacional del Agua (ANA FTR 2026):** 480 intervenciones de emergencia de descolmatación fluvial, encauzamiento y diques ribereños con metrados de cauce (km), volumen de sedimentos ($m^3$) e inversión presupuestal directa en 7 departamentos.
- **Proyectos Especiales Hidráulicos (PECHP, PEOT, PEJEZA, CHAVIMOCHIC, PSI & MVCS):** Infraestructura crítica de alto impacto (Diques de contención, presas de regulación Poechos, Los Ejidos, Gallito Ciego, Tinajones, quebradas activas y SAREs de drenaje pluvial).

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│             GRAN ESCUDO COSTERO FEN 2026 - CONSOLIDADOR OFICIAL C2 MULTI-DEPARTAMENTAL           │
│           513 Puntos Críticos • 138 Distritos • S/ 748,504,521.68 Inversión Fiscalizada          │
├──────────────┼──────────────┼──────────────┼────────────────────────┼────────────────────────────┤
│ DEPARTAMENTO │ PUNTOS CRÍT. │ DISTRITOS    │ INVERSIÓN TOTAL (S/)   │ CUENCAS / RÍOS PRINCIPALES │
├──────────────┼──────────────┼──────────────┼────────────────────────┼────────────────────────────┤
│ PIURA        │ 102          │ 28           │ S/ 310,347,748.32      │ Chira, Piura, Huancabamba  │
│ LIMA         │ 142          │ 42           │ S/ 152,934,964.88      │ Rímac, Chillón, Lurín, Cañete│
│ AREQUIPA     │ 95           │ 17           │ S/  75,320,092.62      │ Camaná, Majes, Chili, Ocoña│
│ ICA          │ 54           │ 15           │ S/  69,986,258.55      │ Ica, Pisco, Chincha, Grande│
│ LAMBAYEQUE   │ 44           │ 16           │ S/  69,017,078.76      │ La Leche, Chancay, Zaña    │
│ LA LIBERTAD  │ 61           │ 15           │ S/  49,504,167.24      │ Moche, Chicama, Virú       │
│ TUMBES       │ 15           │ 5            │ S/  21,394,211.31      │ Tumbes, Zarumilla          │
├──────────────┼──────────────┼──────────────┼────────────────────────┼────────────────────────────┤
│ TOTAL COSTA  │ 513          │ 138          │ S/ 748,504,521.68      │ 24 Cuencas Hidrográficas   │
└──────────────┴──────────────┴──────────────┴────────────────────────┴────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                         MACRO-ESCENARIOS HIDROLÓGICOS DE CUENCA POR REGIÓN                       │
│  • PIURA: Bajo Piura (Defensas/Diques), Medio Piura (Quebradas), Alto Piura, Chira y SAREs Metro │
│  • LIMA: Cuenca Rímac (Huaicos Chosica/Chaclacayo), Chillón, Lurín y Cañete-Yauyos                │
│  • AREQUIPA: Cuenca Majes-Camaná, Chili Urbano, Ocoña y Valles de Irrigación                     │
│  • ICA: Valle Río Ica (Compuertas/Diques), Cuenca Pisco, Río San Juan (Chincha) y Río Grande     │
│  • LA LIBERTAD: Valle Chicama, Quebradas San Idelfonso/León/San Carlos (Moche) y Virú            │
│  • LAMBAYEQUE: Río La Leche (Íllimo/Pacora), Chancay-Lambayeque y Zaña                            │
│  • TUMBES: Río Tumbes (Margen Derecha/Izquierda) y Quebradas El Bendito/Zarumilla                │
└────────────────────────────────────────────────┬─────────────────────────────────────────────────┘
                                                 │
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│             ARQUITECTURA DUAL DE SELLADO E INMUTABILIDAD CRIPTOGRÁFICA                           │
│  • Capa 2 (L2): Libro mayor WORM SHA-256 local encadenado en árboles de Merkle.                  │
│  • Capa 3 (L3): Anclaje descentralizado en Polygon Amoy Testnet (Chain ID: 80002).               │
│    Contrato Inteligente: ClimateRiskAnchor.sol (0x8a927e1f43403d151909787df0445d8b8e0a35db)     │
│    Función: anchorRiskState(bytes32 stateHash, string metadata) / anchorBatch(bytes32[] hashes)  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Concentrador de Métricas y Capacidades C2:
- **513 Puntos Críticos Georreferenciados:** Con coordenadas WGS84 Lat/Lon exactas, sector, cauce fluvial y descripción pericial.
- **138 Distritos con Cobertura Directa:** 100% integrados y validados contra los censos y cartografía del INEI.
- **S/ 748,504,521.68 en Inversión Fiscal de Mitigación:** Obras con código de intervención asignado para control concurrente CGR (Ley N.º 31358) y fiscalías especializadas.
- **Selector Dinámico Departamental:** Switch instantáneo en la consola C2 `/piura` (Pestaña 6) entre Piura, Lima, Arequipa, La Libertad, Ica, Lambayeque, Tumbes o el consolidado de la Costa Nacional.
- **Certificación 1-Click WORM + Polygon Blockchain:** Sellado instantáneo de estados de riesgo y emisión de transacciones en la red pública Polygon Amoy con enlace directo a PolygonScan Explorer.

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

### Hub de Alertas Tripartitas C2 (Pipeline EAP en Cascada)
- `GET /api/alertas/nacional/resumen`: Concentrador nacional de alertas activas, estadísticas por nivel y teatros.
- `POST /api/alertas/nacional/emitir`: Emisión de alerta C2 multi-modelo con firma digital SHA-256 y ruteo a municipios.
- `GET /api/alertas/municipal/{ubigeo}`: Bandeja de entrada del Alcalde con auditoría de infraestructura en riesgo.
- `POST /api/alertas/municipal/{ubigeo}/validar-detonar`: Ratificación municipal, detonación EAP (PP 0068 / Ley 30225) y generación de acta inmutable.
- `GET /api/alertas/social/{ubigeo}`: Semáforo cívico comunitario con instrucciones bilingües en Castellano, Quechua y Aymara.

### Consola Meteorológica Territorial Multi-Régimen & Predictivo 7 Días
- `GET /api/meteo/ds124-matrix`: Matriz meteorológica para los 6 Teatros Operacionales (`teatro=FEN|PIURA|CHIRI|PUNO|DOBLE_RIESGO|TODOS`).
- `GET /api/territorio/matriz-unificada`: Directorio nacional de los 1,813 distritos con cruce de riesgos y coordenadas.
- `GET /api/predictivo/matriz-7dias`: Matriz de pronóstico consolidado a 7 días y detonación de ventanas EAP (T-144h, T-72h, T-24h).
- `GET /api/crioclima/puno-7dias`: Matriz crioclimática calibrada a 7 días para los 106 distritos de Puno (CENEPRED ERHF).

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

### Módulo EDAN Digital, Quórum Dual & SINPAD v2.0
- `POST /api/v1/edan/plantilla/{ubigeo}`: Generación de plantilla EDAN con síntesis territorializada al 75% (Censo INEI, fajas ANA, cultivos).
- `POST /api/v1/edan/firmar-dual`: Suscripción obligatoria de Quórum Asimétrico Dual (Alcalde COEL + Comisario PNP / Ley N.° 27269).
- `GET /api/v1/edan/exportar-sinpad-v2/{edan_id}`: Payload canónico JSON para carga masiva SINPAD v2.0 (R.S. N.° 002-2026-PCM/SGRD).
- `GET /api/v1/edan/pdf-oficial/{edan_id}`: Generación de PDF oficial con código QR y certificación probatoria.

### Logística Humanitaria, Grafo Vial & Ruteo VRP Adaptativo
- `GET /api/v1/logistica/topologia-red`: Grafo vial GeoJSON de carreteras, almacenes centrales, puestos y puentes estratégicos.
- `POST /api/v1/logistica/rutar-con-evitacion`: Cálculo Dijkstra de rutas óptimas esquivando puentes colapsados y cortes viales activos.
- `POST /api/v1/logistica/despachar-convoy`: Emisión de orden de despacho con tonelaje MRE/agua, asignación de camiones y hoja de ruta geocodificada.
- `POST /api/v1/logistica/inyectar-bloqueo`: Bloqueo reactivo de puentes y tramos viales por reporte comunitario de campo.

### Sensor Comunitario WhatsApp & Bitácora Inmutable WORM CGR
- `POST /api/v1/comunidad/whatsapp/simular-envio`: Ingesta de testimonios ciudadanos con extracción NLP de familias damnificadas y víveres.
- `POST /api/v1/comunidad/whatsapp/webhook`: Receptor de mensajes de campo con soporte para contingencia offline (store-and-forward).
- `GET /api/v1/cgr/ledger-worm`: Consulta de la cadena inmutable de bloques Merkle SHA-256 de auditoría concurrente (Ley N.° 31358).
- `GET /api/v1/cgr/verificar-integridad`: Validación criptográfica continua contra fraudes y alteración de padrones (Tamper-Evidence).
- `GET /api/v1/cgr/certificado-auditoria`: Emisión del Certificado Pericial Oficial de Control Concurrente CGR (`CERT-CGR-WORM-YYYYMMDD-XXXXX`).

### Memoria Histórica FEN & Catálogo Maestro de Cuencas
- `GET /api/historico/catalogo-maestro`: Inventario de 24 cuencas estratégicas (CAF, SENAMHI, CENEPRED) e infraestructura crítica.
- `GET /api/historico/analog-match/{ubigeo}`: Motor predictivo de análogos históricos (1983, 1998, 2017) a 7 días.
- `GET /api/historico/radar-nacional-analogos`: Escaneo nacional de coincidencias análogas de eventos extremos.

### CENEPRED SIGRID, Gran Escudo Costero (7 Regiones) & Anclaje Blockchain Polygon
- `GET /api/v1/sigrid/costa/resumen`: Resumen ejecutivo del Gran Escudo Costero con desglose de las 7 regiones (Arequipa, Ica, La Libertad, Lambayeque, Lima, Piura, Tumbes), 513 puntos críticos, 138 distritos y S/ 748,504,521.68 en inversión.
- `GET /api/v1/sigrid/departamental/{departamento}`: Catálogo consolidado departamental ("PIURA", "LIMA", "AREQUIPA", "LA LIBERTAD", "ICA", "LAMBAYEQUE", "TUMBES", "COSTA_NACIONAL") con puntos críticos georreferenciados, metrados de cauce, presupuestos oficiales y macro-escenarios de cuenca.
- `GET /api/v1/sigrid/plan/{ubigeo}`: Retorna el plan distrital oficial de CENEPRED SIGRID (PPRRD) y puntos críticos asignados.
- `POST /api/v1/sigrid/validar-coordenada`: Validación espacial submétrica de un punto geográfico frente al inventario oficial del Estado.
- `POST /api/v1/sigrid/certificar-evento`: Sellado inmutable WORM y anclaje a Smart Contract en Polygon Amoy Testnet.
- `GET /api/v1/blockchain/estado`: Telemetría y estado de conexión a la red Polygon Amoy (RPC, Chain ID 80002, contrato desplegado y último tx hash).


---

## ☁️ Despliegue en Google Cloud Platform & Puesta en Marcha (Producción 200 OK)

### URLs Oficiales en Producción (Cloud Run `us-central1`):

#### 🔴 Nivel 1: COED Nacional AMARU (C2 Macro-Estratégico)
* **Sala de Situación C2:** [https://coen-frontend-289004262994.us-central1.run.app/](https://coen-frontend-289004262994.us-central1.run.app/)
* **Hub Alertas Tripartitas C2:** [https://coen-frontend-289004262994.us-central1.run.app/alertas](https://coen-frontend-289004262994.us-central1.run.app/alertas)
* **Geovisor 3D Multiescala:** [https://coen-frontend-289004262994.us-central1.run.app/geovisor](https://coen-frontend-289004262994.us-central1.run.app/geovisor)
* **Consola Meteorológica Multi-Régimen (6 Teatros):** [https://coen-frontend-289004262994.us-central1.run.app/meteo](https://coen-frontend-289004262994.us-central1.run.app/meteo)
* **Predictivo 7 Días & Ventanas EAP:** [https://coen-frontend-289004262994.us-central1.run.app/pronostico](https://coen-frontend-289004262994.us-central1.run.app/pronostico)
* **Simulación Mega-FEN & Ground Truth INDECI:** [https://coen-frontend-289004262994.us-central1.run.app/simulacion](https://coen-frontend-289004262994.us-central1.run.app/simulacion)
* **Consola Oceanográfica IMARPE (BDO SIOFEN):** [https://coen-frontend-289004262994.us-central1.run.app/imarpe](https://coen-frontend-289004262994.us-central1.run.app/imarpe)
* **Consola Táctica ENFEN Oficial:** [https://coen-frontend-289004262994.us-central1.run.app/enfen](https://coen-frontend-289004262994.us-central1.run.app/enfen)
* **Monitoreo Satelital NASA AQUA/TERRA:** [https://coen-frontend-289004262994.us-central1.run.app/satelites](https://coen-frontend-289004262994.us-central1.run.app/satelites)
* **Control Fluvial & Cuencas Norteñas ANA:** [https://coen-frontend-289004262994.us-central1.run.app/rios-norte](https://coen-frontend-289004262994.us-central1.run.app/rios-norte)
* **Monitor de Quebradas ISAAC / IGP:** [https://coen-frontend-289004262994.us-central1.run.app/quebradas](https://coen-frontend-289004262994.us-central1.run.app/quebradas)
* **Telemetría de 27 Fuentes Centrales KURAQ:** [https://coen-frontend-289004262994.us-central1.run.app/fuentes](https://coen-frontend-289004262994.us-central1.run.app/fuentes)

#### 🏛️ Nivel 2: COED Municipal AMARU (Táctico & Obras PP 0068)
* **Suite Municipal 360° (Ej. Piura):** [https://coen-frontend-289004262994.us-central1.run.app/municipal/200101](https://coen-frontend-289004262994.us-central1.run.app/municipal/200101)
* **Plan Piura 2026-27 (Epicentro FEN):** [https://coen-frontend-289004262994.us-central1.run.app/piura](https://coen-frontend-289004262994.us-central1.run.app/piura)
* **PPRRD Cajamarca (San Marcos):** [https://coen-frontend-289004262994.us-central1.run.app/cajamarca](https://coen-frontend-289004262994.us-central1.run.app/cajamarca)
* **Memoria Histórica Distrital (1983-2017):** [https://coen-frontend-289004262994.us-central1.run.app/historico](https://coen-frontend-289004262994.us-central1.run.app/historico)
* **Inspector Climático Distrital:** [https://coen-frontend-289004262994.us-central1.run.app/dashboard/200101](https://coen-frontend-289004262994.us-central1.run.app/dashboard/200101)
* **Logística Humanitaria y Ruteo VRP:** [https://coen-frontend-289004262994.us-central1.run.app/logistica](https://coen-frontend-289004262994.us-central1.run.app/logistica)

#### 👥 Nivel 3: COED Social AMARU (Borde Comunitario & Tríada CUP)
* **Reporte Ciudadano Blindado (Voz Oral & SHA-256):** [https://coen-frontend-289004262994.us-central1.run.app/reporte-ciudadano](https://coen-frontend-289004262994.us-central1.run.app/reporte-ciudadano)
* **Red Comunitaria AYNI (Ollas Comunes):** [https://coen-frontend-289004262994.us-central1.run.app/ayni](https://coen-frontend-289004262994.us-central1.run.app/ayni)
* **Triaje Preclínico Desacoplado NTS-105:** [https://coen-frontend-289004262994.us-central1.run.app/salud/triaje](https://coen-frontend-289004262994.us-central1.run.app/salud/triaje)
* **Consola Médica SALUD-AMARU (CMP):** [https://coen-frontend-289004262994.us-central1.run.app/salud/consola-medica](https://coen-frontend-289004262994.us-central1.run.app/salud/consola-medica)
* **YACHAY (Bioindicadores Ancestrales):** [https://coen-frontend-289004262994.us-central1.run.app/yachay](https://coen-frontend-289004262994.us-central1.run.app/yachay)
* **Glosario Hidrometeorológico Oficial:** [https://coen-frontend-289004262994.us-central1.run.app/glosario](https://coen-frontend-289004262994.us-central1.run.app/glosario)
* **Consola de Validación PIDE-RENIEC:** [https://coen-frontend-289004262994.us-central1.run.app/reniec](https://coen-frontend-289004262994.us-central1.run.app/reniec)

#### ⚖️ Nivel 4: Gobernanza, Fe Pública, Auditoría & Legalidad
* **AMARU-LEX (51 Normas & Matriz SINAGERD):** [https://coen-frontend-289004262994.us-central1.run.app/lex](https://coen-frontend-289004262994.us-central1.run.app/lex)
* **Ficha EDAN Perú v2 Oficial (SINPAD & Bono BAE):** [https://coen-frontend-289004262994.us-central1.run.app/edan](https://coen-frontend-289004262994.us-central1.run.app/edan)
* **Bandeja de Control Concurrente CGR & Obras ANA:** [https://coen-frontend-289004262994.us-central1.run.app/contraloria](https://coen-frontend-289004262994.us-central1.run.app/contraloria)
* **Consola de Auditoría Forense WORM:** [https://coen-frontend-289004262994.us-central1.run.app/auditoria](https://coen-frontend-289004262994.us-central1.run.app/auditoria)
* **Consola de Fiscalización Presupuestal PP 0068:** [https://coen-frontend-289004262994.us-central1.run.app/fiscal](https://coen-frontend-289004262994.us-central1.run.app/fiscal)
* **Doctrina C2 de Emergencia y Tetra-Índices:** [https://coen-frontend-289004262994.us-central1.run.app/doctrina](https://coen-frontend-289004262994.us-central1.run.app/doctrina)

#### ⚡ Backend API REST & Swagger OpenAPI
* **Swagger UI OpenAPI:** [https://coen-backend-289004262994.us-central1.run.app/docs](https://coen-backend-289004262994.us-central1.run.app/docs)
* **ReDoc Oficial:** [https://coen-backend-289004262994.us-central1.run.app/redoc](https://coen-backend-289004262994.us-central1.run.app/redoc)

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
