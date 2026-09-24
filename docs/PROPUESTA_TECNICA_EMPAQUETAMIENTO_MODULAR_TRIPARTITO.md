# PROPUESTA TÉCNICA DE ARQUITECTURA Y EMPAQUETAMIENTO MODULAR TRIPARTITO
## SISTEMA DE GESTIÓN DEL RIESGO DE DESASTRES: COEN DIGITAL PERÚ
### ESTRATEGIA DE DISTRIBUCIÓN: COEN NACIONAL DIGITAL, COEN MUNICIPAL DIGITAL Y COEN SOCIAL DIGITAL
### INCLUYE: GUÍA DE IMPLEMENTACIÓN SEGURA Y PREVENCIÓN DE COLAPSOS EN BACKEND Y FRONTEND (ZERO-DOWNTIME)

**Código Documental:** PROP-TEC-COEN-TRIPARTITO-2026-V3  
**Fecha de Actualización:** Septiembre 2026  
**Clasificación:** DOCUMENTO TÉCNICO DE ARQUITECTURA / USO OFICIAL Y PRIVADO  
**Entorno Tecnológico:** Monorepo Python FastAPI + Next.js 14 + Docker Multi-Stage + Google Cloud Run / Edge PWA  
**Marco Legal y Normativo:** Ley Nº 29664 (SINAGERD), D.S. Nº 124-2026-PCM (Declaratoria FEN/Lluvias), Ley Nº 29733 (Protección de Datos Personales) y Estándar ITU-T X.1303 / OASIS CAP v1.2.

---

## 1. RESUMEN EJECUTIVO Y JUSTIFICACIÓN ARQUITECTÓNICA

La experiencia operacional en la gestión del Fenómeno El Niño y eventos hidrometeorológicos extremos en el Perú demuestra que **un único software monolítico no puede satisfacer simultáneamente las necesidades del alto mando ministerial, del alcalde distrital y de la dirigenta vecinal de una olla común**.

Intentar cargar modelos numéricos 3D con Deck.gl en el teléfono de una coordinadora de ollas comunes en una ladera con cobertura celular 2G provoca el colapso de la aplicación. De igual forma, una interfaz limitada a chat vecinal resulta inútil en la sala de crisis del COEN Central en Lima.

Por ello, se establece la **Doctrina del Empaquetamiento Modular Tripartito**, estructurada en tres subsistemas especializados pero interoperables:

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

---

## 2. ANÁLISIS COMPARATIVO DE LOS TRES PILARES

| Dimensión Técnica | 1. COEN NACIONAL DIGITAL | 2. COEN MUNICIPAL DIGITAL | 3. COEN SOCIAL DIGITAL |
| :--- | :--- | :--- | :--- |
| **Rol Estratégico** | Comando y Control (C2) Macro-Estratégico Nacional | Gestión Operativa Táctica Distrital | Resiliencia y Autoprotección Comunitaria |
| **Público Objetivo** | Director COEN, INDECI Central, Ministerios, CCFFAA | Alcaldes, Defensa Civil Municipal, Serenazgo | Dirigentas de Ollas, Juntas Vecinales, Rondas |
| **Escala Geográfica** | 159 Cuencas Hidrográficas a nivel nacional | 1 Distrito específico según código UBIGEO | 1 Barrio, Quebrada o Asentamiento Humano |
| **Fuentes de Datos** | ENFEN, IMARPE (BDO), SENAMHI, DHN, ECMWF IFS 9km | Memoria Histórica FEN, Open-Meteo Local, ANA | Reportes de Vecinos, Nivel de Agua, Stock Víveres |
| **Interfaz de Usuario** | Videowall 3D, MapLibre, Relojes Polares, AMARU-LEX | Dashboard Táctico Distrital, Fichas EDAN, Histórico | PWA Móvil Ultra-Ligera (< 3.5 MB) y Bot Telegram |
| **Modo de Conectividad** | Nube GCP de Alta Disponibilidad (Fibra Óptica) | Banda ancha municipal con caché SQLite local | Red Celular 2G/3G y Soporte Offline (IndexedDB) |
| **Idioma / Accesibilidad**| Técnico-Militar y Administrativo Oficial | Funcional Operativo en Castellano | Castellano, Quechua Chanka/Collao y Aymara |
| **Protocolo de Emisión** | OASIS CAP v1.2 firmado hacia SISMATE / Prensa | Notificaciones a Serenazgo, Radio VHF y SINPAD | Silbato Comunitario, Megáfonos, Alerta Telegram |

---

## 3. ESPECIFICACIÓN DETALLADA POR PILAR MODULAR

### 3.1. PILAR 1: COEN NACIONAL DIGITAL (Módulo C2 Macro-Estratégico)
* **Propósito:** Brindar al Estado Mayor de la Emergencia Nacional una visión holística e inmutable de la situación hidrometeorológica, oceanográfica e infraestructura crítica.
* **Componentes Backend Clave:**
  * `agents/sentinel_agent.py`: Escaneo batch cada 15 min de las 159 cuencas hidrográficas con telemetría Open-Meteo Pro.
  * `agents/kuraq/kuraq_agent.py`: **Agente KURAQ** (Curador & Centinela de Ingesta Multifuente Soberana) - Supervisión y sincronización de 27 fuentes oficiales (IMARPE SIOFEN BDO 24h, ENFEN quincenal, Radares SENAMHI) con sellado WORM SHA-256.
  * `services/national/senamhi_radar_service.py`: Integración telemétrica con radares meteorológicos Doppler Banda C (Piura e Ica) para Nowcasting (0 a 120 min).
  * `agents/tactical_agent.py`: Monitoreo de infraestructura crítica nacional (hospitales MINSA/EsSalud, puentes MTC, fajas marginales ANA).
  * `services/national/`: Integración directa de la Bitácora Diaria Oceanográfica (BDO) de IMARPE (isoterma 15°C, vientos alisios) y reportes de la Comisión Multisectorial ENFEN.
  * `services/legal_framework_service.py` (AMARU-LEX): Auditoría continua de decretos de emergencia (D.S. 124-2026-PCM) y cumplimiento de metas del presupuesto por resultados (PpR 068).
  * `agents/dispatcher_agent.py`: Generación y firma digital SHA-256 de mensajes en formato CAP v1.2 para interoperar con SISMATE (MTC) e INDECI.
* **Componentes Frontend Clave:**
  * Videowall 3D Nacional (`/` y `/dashboard`): Renderizado masivo acelerado por WebGL/Deck.gl.
  * Consola C2 de Telemetría Oficial & Gobernanza de Fuentes (`/fuentes`).
  * Visor de Radares Doppler Banda C y Nowcasting (`/piura`).
  * Geovisor Nacional Multicapa (`/geovisor`).
  * Relojes Polares Cinemáticos AMARU-FEN y AMARU-CHIRI (`/clocks`).
  * Centro Oceanográfico IMARPE/ENFEN (`/imarpe`, `/enfen`).
  * Consola Jurídico-Presupuestal AMARU-LEX (`/lex`).
* **Packaging e Infraestructura:**
  * **Contenedor:** `coen-nacional:v2.5` (~580 MB, basado en Debian Slim + Node.js 18 + Python 3.11).
  * **Despliegue:** Google Cloud Run con auto-scaling (mínimo 2 réplicas, pico de 50 vCPU).
  * **Base de Datos:** Google BigQuery para persistencia analítica inmutable + Google Cloud Storage para capas vectoriales GeoJSON masivas.

---

### 3.2. PILAR 2: COEN MUNICIPAL DIGITAL (Módulo Táctico Territorial Distrital)
* **Propósito:** Empoderar a los 1,891 alcaldes y secretarios técnicos de defensa civil del Perú con herramientas automáticas para anticipar desastres, evaluar daños y gestionar la respuesta territorial.
* **Componentes Backend Clave:**
  * `services/historical_data_service.py`: **Consola de Memoria Histórica Distrital**. Ingesta y cruza los registros de desastres de 1983 a 2017:
    * *CAF:* Lecciones aprendidas y costos de reconstrucción del FEN 1997-1998.
    * *INDECI:* Compendio 1998 y Registro 2017 (fallecidos, damnificados, viviendas destruidas).
    * *OPS / OMS:* Vigilancia epidemiológica de brotes (Dengue, Malaria, Cólera, Leptospirosis).
    * *MINEDU / PUCP:* Impacto histórico en infraestructura educativa y suspensión de clases.
    * *MINAG-OIA:* Áreas agrícolas perdidas, canales de regadío colapsados y familias campesinas afectadas.
  * `services/meteo_service.py` (Modo Inspector Distrital): Monitoreo focalizado por coordenadas y UBIGEO con pronóstico horario a 7 días y variables de inestabilidad convectiva (CAPE).
  * `services/municipal_triage_service.py`: Asistente de pre-llenado de la **Ficha EDAN Digital** (Evaluación de Daños y Análisis de Necesidades) compatible con el sistema SINPAD de INDECI.
  * `agents/dispatcher_local.py`: Despacho de órdenes de despliegue a cuadrillas de serenazgo y operadores de maquinaria pesada.
* **Componentes Frontend Clave:**
  * Consola de Memoria Histórica Municipal (`/historico`): Búsqueda instantánea por código UBIGEO, análisis comparativo de eventos FEN (1982-83 vs 1997-98 vs 2017 vs 2023) y descargas ejecutivas en PDF.
  * Dashboard Distrital (`/dashboard/[ubigeo]`): Inspector climático en tiempo real, umbrales de activación de quebradas y mapa de zonas críticas.
  * Módulo de Gestión de Albergues y Recursos (`/municipal/recursos`): Capacidad y estado de abastecimiento de colegios y losas habilitadas.
* **Packaging e Infraestructura:**
  * **Modalidad A (Cloud SaaS Multi-Tenant - Recomendada):** Hospedado en la nube nacional con aislamiento de tenant por UBIGEO (`ubigeo.coen.gob.pe` o `/dashboard/{ubigeo}`).
  * **Modalidad B (Micro-Appliance On-Premise Local):** Contenedor Docker ultra-liviano `coen-municipal:v1.0` (~180 MB) ejecutable en un mini-servidor físico en la central de monitoreo municipal, con base de datos SQLite integrada para operar aún si la fibra óptica municipal se interrumpe por caída de postes.

---

### 3.3. PILAR 3: COEN SOCIAL DIGITAL (Módulo Comunitario y Resiliencia Vecinal)
* **Propósito:** Llevar el Sistema de Alerta Temprana a la primera línea comunitaria (ollas comunes, comités de vaso de leche, brigadistas barriales y rondas campesinas), habilitando la autoprotección y el levantamiento de información verificada (groundtruth).
* **Componentes Backend Clave:**
  * `services/ayni_service.py`: Gestión del inventario de ollas comunes (días de víveres secos, agua potable en tanques) y coordinación de faenas comunales (llenado de sacos terreros, limpieza de cunetas).
  * `services/telegram_bot_service.py`: Bot conversacional bilingüe que funciona en cualquier teléfono inteligente sin necesidad de instalar aplicaciones pesadas ni registrar tarjetas de crédito.
  * `agents/linguistic_agent.py`: Traducción automática contextual y generación de audios de advertencia en **Quechua Chanka, Quechua Collao y Aymara**, respetando variantes dialectales.
  * `services/citizen_report_service.py`: Filtro anti-spam y clustering espacial de reportes ciudadanos para evitar saturación de falsos positivos.
* **Componentes Frontend Clave:**
  * Aplicación Web Progresiva (PWA) `/ayni` y `/reporte-ciudadano`:
    * Botón de Pánico Comunitario ("Quebrada Activa").
    * Formulario de reporte de 3 toques: 1 fotografía georreferenciada, selector de cota de agua (tobillo / rodilla / cintura / techo) y estado de flujo de lodo.
    * Padrón Comunitario de Protección Vecinal: Registro cifrado local de adultos mayores solos, personas postradas y menores lactantes.
    * Módulo Yachay (`/yachay`): Registro de bioindicadores climáticos tradicionales y saberes locales.
* **Packaging e Infraestructura:**
  * **Despliegue PWA:** Compilación estática Next.js exportada (`output: 'export'`), distribuida globalmente por Cloudflare Pages / Firebase CDN gratuita.
  * **Consumo de Recursos:** Menor a 3.5 MB de descarga inicial.
  * **Arquitectura Offline-First:** Persistencia en `IndexedDB` y `ServiceWorker`. Si la red celular colapsa durante la lluvia, el reporte queda encolado localmente y se transmite automáticamente en cuanto el celular detecte señal 2G/3G.

---

## 4. GUÍA DE IMPLEMENTACIÓN SEGURA: CÓMO EVITAR EL COLAPSO DEL SISTEMA

### 4.1. Principio Fundamental: NO al "Big Bang Refactor"
El error más común en proyectos de modernización es mover todas las carpetas, quebrar las rutas de Next.js y renombrar imports de Python al mismo tiempo. Esto provoca:
1. Ruptura de resolución de paquetes en Webpack (`vendor-chunks/lucide-react.js`).
2. Errores de importación en cascada en Python (`ModuleNotFoundError`).
3. Interrupción de las APIs operativas mientras el sistema está en producción.

**Estrategia recomendada:** Aplicar el **Patrón Strangler Fig (Higo Estrangulador)** mediante **Feature Flags y Perfiles de Ejecución Suaves** sin mover archivos de su lugar físico actual hasta que el sistema esté probado.

---

### 4.2. Blindaje del Backend (FastAPI): Prevención de Colapso de Memoria y CPU

El backend actual corre de manera estable en el puerto `8000`. Para adaptarlo a los tres perfiles sin riesgo:

#### A. Activación Condicional por Variable de Entorno (`COEN_PERFIL`)
El archivo `backend/main.py` se mantiene como punto de entrada único, pero monta routers de forma selectiva según el entorno:

```python
# backend/main.py - Modelo de Activación Segura
import os
from fastapi import FastAPI

# Perfiles válidos: 'nacional' | 'municipal' | 'social' | 'full' (modo por defecto)
COEN_PERFIL = os.getenv("COEN_PERFIL", "full")

app = FastAPI(
    title=f"Sistema COEN Digital - Perfil: {COEN_PERFIL.upper()}",
    version="2.6.0"
)

# 1. CORE COMPARTIDO (Siempre activo: Healthcheck, CORS, Auth, Pydantic Schemas)
from routers.health import router as health_router
app.include_router(health_router, prefix="/api/health", tags=["Health"])

# 2. ACTIVACIÓN SEGÚN PERFIL
if COEN_PERFIL in ("nacional", "full"):
    from routers.national_c2 import router as c2_router
    from routers.oceanography import router as ocean_router
    app.include_router(c2_router, prefix="/api/national", tags=["COEN Nacional"])
    app.include_router(ocean_router, prefix="/api/ocean", tags=["IMARPE/ENFEN"])
    # NOTA: Tareas de fondo intensivas (escaneo de 159 cuencas) solo arrancan en perfil nacional

if COEN_PERFIL in ("municipal", "full"):
    from routers.historical import router as historical_router
    from routers.municipal_meteo import router as municipal_router
    app.include_router(historical_router, prefix="/api/historical", tags=["Memoria Histórica"])
    app.include_router(municipal_router, prefix="/api/municipal", tags=["Inspector Distrital"])

if COEN_PERFIL in ("social", "full"):
    from routers.citizen_report import router as citizen_router
    app.include_router(citizen_router, prefix="/api/ayni", tags=["COEN Social"])
```

#### B. Prevención de Bloqueo del Event Loop (CPU Starvation)
* **Caché con TTL en Memoria:** Consultas frecuentes (como el historial de desastres de Chosica o el pronóstico de lluvia) se respaldan en un caché con tiempo de expiración de 15 minutos (`TTLCache` o Redis).
* **Aislamiento de Tareas Pesadas:** Tareas analíticas masivas (cálculo de anomalías térmicas en el mar o procesamiento geoespacial) se ejecutan mediante `asyncio.to_thread` o workers dedicados, impidiendo que una consulta nacional ralentice la Ficha EDAN municipal.

---

### 4.3. Blindaje del Frontend (Next.js): Prevención de Colapsos de Render y Webpack

El frontend actual corre en el puerto `3000`. Para que coexistan las 3 interfaces sin colapsos:

#### A. Carga Perezosa Aislada (`next/dynamic` con `ssr: false`)
Las dependencias gráficas pesadas (Deck.gl, MapLibre, ECharts, Lucide) solo deben cargarse en el navegador del usuario cuando éste navega a su página respectiva:

```typescript
// En componentes con gráficos pesados:
import dynamic from 'next/dynamic';

export const DeckGlMacroMap = dynamic(
  () => import('@/components/national/DeckGlMacroMap'),
  { 
    ssr: false, 
    loading: () => <div className="h-96 flex items-center justify-center text-slate-400">Cargando visualización 3D...</div> 
  }
);
```
* **Efecto protector:** Si un brigadista entra al `/historico` o al `/ayni`, su navegador **nunca descarga la librería Deck.gl 3D**, ahorrando 1.8 MB de JavaScript y evitando fugas de memoria en Webpack.

#### B. Adaptación Declarativa de la Navegación (`HeaderNav.tsx`)
En lugar de crear 3 aplicaciones de Next.js separadas, la barra superior lee la variable de entorno `NEXT_PUBLIC_COEN_PERFIL` (o un selector de perfil para demostraciones):

```typescript
// frontend/src/components/HeaderNav.tsx
const perfilActual = process.env.NEXT_PUBLIC_COEN_PERFIL || 'full';

const navigationLinks = [
  { href: "/", label: "COEN Nacional (C2)", icon: Shield, profile: "nacional" },
  { href: "/historico", label: "Memoria Histórica", icon: BookOpen, profile: "municipal" },
  { href: "/dashboard/150118", label: "Inspector Distrital", icon: CloudRain, profile: "municipal" },
  { href: "/ayni", label: "COEN Social (Ollas/Comunidad)", icon: Users, profile: "social" },
];

const visibleLinks = navigationLinks.filter(
  link => perfilActual === 'full' || link.profile === perfilActual
);
```

---

## 5. DOCKER COMPOSE DECLARATIVO CON PERFILES

Un solo archivo `docker-compose.yml` gestiona los despliegues sin necesidad de duplicar contenedores:

```yaml
# backend/docker-compose.yml
version: '3.8'

services:
  # ==========================================================
  # PERFIL 1: COEN NACIONAL DIGITAL (C2 ESTRATÉGICO)
  # Uso: docker compose --profile nacional up -d
  # ==========================================================
  backend-nacional:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: coen-nacional-backend
    environment:
      - COEN_PERFIL=nacional
      - ENABLE_BIGQUERY=true
      - ENABLE_VERTEX_AI=true
    ports:
      - "8000:8000"
    profiles: ["nacional"]

  frontend-nacional:
    build:
      context: ../frontend
      args:
        - NEXT_PUBLIC_COEN_PERFIL=nacional
    container_name: coen-nacional-frontend
    ports:
      - "3000:3000"
    profiles: ["nacional"]

  # ==========================================================
  # PERFIL 2: COEN MUNICIPAL DIGITAL (TÁCTICO DISTRITAL)
  # Uso: docker compose --profile municipal up -d
  # ==========================================================
  backend-municipal:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: coen-municipal-backend
    environment:
      - COEN_PERFIL=municipal
      - MUNICIPAL_UBIGEO=${MUNICIPAL_UBIGEO:-150118}
      - SQLITE_PATH=/data/coen_municipal.db
    volumes:
      - municipal-db-data:/data
    ports:
      - "8080:8080"
    profiles: ["municipal"]

  frontend-municipal:
    build:
      context: ../frontend
      args:
        - NEXT_PUBLIC_COEN_PERFIL=municipal
    container_name: coen-municipal-frontend
    ports:
      - "3001:3000"
    profiles: ["municipal"]

  # ==========================================================
  # PERFIL 3: COEN SOCIAL DIGITAL (COMUNITARIO & TELEGRAM)
  # Uso: docker compose --profile social up -d
  # ==========================================================
  backend-social:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: coen-social-bot
    environment:
      - COEN_PERFIL=social
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - COEN_API_CENTRAL=https://api.coen.gob.pe
    profiles: ["social"]

volumes:
  municipal-db-data:
```

---

## 6. SEGURIDAD, PRIVACIDAD Y GOBERNANZA DE DATOS (LEY Nº 29733)

1. **Cifrado Local del Padrón de Población Vulnerable:**  
   Los padrones vecinales de ancianos postrados, personas con discapacidad severa y madres lactantes **permanecen cifrados localmente (AES-256) en el dispositivo del dirigente**. Nunca se publican en internet ni se transfieren a bases de datos abiertas; solo se sincronizan con la brigada de rescate del COEN Municipal durante una evacuación activa.
2. **Firma Criptográfica SHA-256 de Alertas CAP v1.2:**  
   Toda alerta oficial emitida por el COEN Nacional o Municipal se firma digitalmente para neutralizar noticias falsas y evitar pánico en redes sociales.
3. **Filtro Espacial y Validación Cruzada:**  
   Los reportes de vecinos requieren validación cruzada (al menos 2 reportes en un radio de 200 metros) antes de disparar una alarma de nivel rojo en el centro de operaciones municipal.

---

## 7. MATRIZ DE EFICIENCIA OPERACIONAL Y COSTOS

| Métrica | COEN NACIONAL DIGITAL | COEN MUNICIPAL DIGITAL | COEN SOCIAL DIGITAL |
| :--- | :--- | :--- | :--- |
| **Peso de Distribución** | ~580 MB (Imagen Docker completa) | ~180 MB (Docker Alpine optimizado) | < 3.5 MB (PWA móvil) |
| **RAM en Ejecución** | 2.0 a 8.0 GB RAM (Cloud Run) | 512 MB a 1.0 GB RAM | 35 MB en navegador de smartphone |
| **Velocidad de Arranque** | 1.8 segundos en Cold Start | 0.6 segundos | Instantáneo (PWA cacheada en Service Worker) |
| **Requerimiento de Ancho de Banda** | 100+ Mbps (Videowall C2) | 10 a 20 Mbps (o modo desconectado) | 32 kbps (Optimizado para redes 2G/3G) |
| **Persistencia Primaria** | BigQuery + Cloud Storage | PostgreSQL / SQLite local | IndexedDB + Webhook Cloud |
| **Costo Estimado de Infraestructura**| $40 - $70 USD/mes (Cloud Run) | $5 - $10 USD/mes (o $0 si corre on-prem) | $0 USD/mes (Cloudflare Pages gratuita) |

---

## 8. HOJA DE RUTA DE TRANSICIÓN SEGURA (ZERO-DOWNTIME)

| Hito | Acción Concreta | Estado | Impacto Operativo |
| :---: | :--- | :---: | :--- |
| **Hito 1** | **Consola de Memoria Histórica Municipal:** Implementada con 5 fuentes oficiales (CAF, INDECI, OPS, MINEDU, MINAG-OIA) en `/historico`. | **Completado** | 1,891 distritos cubiertos. Cero impacto negativo. |
| **Hito 2** | **Activación Suave de Perfiles en Backend:** Integrar `COEN_PERFIL` en `backend/main.py` manteniendo el valor por defecto `full`. | **En Curso** | Mantiene 100% de retrocompatibilidad. |
| **Hito 3** | **Selector Dinámico en Frontend:** Permitir alternar vistas de COEN Nacional, Municipal y Social en `HeaderNav.tsx`. | **Inmediato** | Mejora la experiencia sin duplicar código. |
| **Hito 4** | **Certificación PWA Offline-First:** Registrar el `service-worker.js` en `/ayni` para garantizar funcionamiento vecinal en zonas sin cobertura. | **Siguiente** | Cero costo de infraestructura adicional. |
