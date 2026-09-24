# 📡 DOCUMENTO PRIVADO: ARQUITECTURA DEL AGENTE KURAQ, PROTOCOLO DE INGESTA AUTÓNOMA Y GOBERNANZA DE TELEMETRÍA MULTIFUENTE SOBERANA

> **CONFIDENCIAL / RESERVADO — CENTRO DE OPERACIONES DE EMERGENCIA NACIONAL (COEN) | INDECI | PCM**  
> **SISTEMA AMARU-CLIMATE (COEN-DIGITAL LAB4) — TEATRO DE OPERACIONES FEN 2026-2027**  
> **Marco Doctrinal y Legal:** Ley Nº 31814 (Uso de Inteligencia Artificial para el Desarrollo Humano), D.S. Nº 115-2025-PCM (Gobernanza de IA de Alto Riesgo & Supervisión Humana HITL), Ley Nº 29664 (SINAGERD), D.S. Nº 124-2026-PCM (Emergencia FEN/Lluvias), NTP-ISO/IEC 27037:2012 (Manejo de Evidencia Digital) e IETF RFC 3161 (Protocolo de Sellado de Tiempo TSA).

---

## 1. Justificación Táctica y Diagnóstico Operativo

La gestión del **Fenómeno El Niño (FEN 2026-2027)** y los escenarios de heladas extremas (**AMARU-CHIRI**) demandan la convergencia armónica de múltiples fuentes de información emitidas por entidades científicas, técnicas y regulatorias del Estado Peruano.

Históricamente, los sistemas de comando y control han adolecido de tres fallas sistémicas:
1. **La Dispersión de Formatos:** Datos hidrometeorológicos dispersos entre servidores OGC WFS (SENAMHI), APIs de aforo (ANA GeoSNIRH), PDFs escaneados (boletines diarios de IMARPE y comunicados bimensuales de ENFEN) y directorios tabulares (INEI, MININTER, MINEDU).
2. **El "Fallo Silencioso" (*Silent Failure*):** La caída no advertida o el cambio de estructura en un portal estatal provocaba que los modelos predictivos (`IRCE-FEN`, `IPH-FEN`, `IPI`) trabajaran con datos obsoletos sin alertar a los analistas de guardia.
3. **La Ruptura de la Cadena de Custodia Legal:** La ausencia de un registro inmutable que certifique qué dato exacto (con estampa UTC y hash criptográfico) alteró una decisión de evacuación o justificó una Contratación Directa ante la Contraloría General de la República (CGR).

Para superar definitivamente estas vulnerabilidades se crea el **Agente KURAQ** (del runasimi *Kuraq*: mayor, sabio, curador y guardián del conocimiento), como el **6to Agente Autónomo del Swarm de AMARU-CLIMATE** (Plano de Gobernanza e Ingesta Continua Multifuente).

---

## 2. Identidad Doctrinal y Rol en el Swarm Multi-Agente

El Agente KURAQ opera en el nivel cero de la arquitectura, garantizando la pureza, frescura, legalidad y trazabilidad de los datos que consumen los agentes tácticos y estratégicos:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    SWARM MULTI-AGENTE AUTÓNOMO AMARU-CLIMATE                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ► AGENTE KURAQ (Data Curator & Telemetry Ingestion Agent) ◄                    │
│    • Ingesta, supervisión de salud, cálculo SHA-256 y sellado RFC 3161.         │
│                                                                                 │
│  1. AGENTE CENTINELA HIDROMETEOROLÓGICO (Data & Triage Agent)                   │
│     • Consume Open-Meteo Pro, Radares Banda C y Estaciones EMA SENAMHI.        │
│                                                                                 │
│  2. AGENTE DE EVALUACIÓN TÁCTICA Y LOGÍSTICA (Crisis Assessment Agent)          │
│     • Consume Padrones INEI 2026, Comisarías PNP y Red Vial MTC.                │
│                                                                                 │
│  3. AGENTE LINGÜÍSTICO TERRITORIAL E INCLUSIVO (Cultural & Dispatch Agent)     │
│     • Consume Matriz Étnica RENALIO (Quechua, Aymara, Asháninka, Awajún).       │
│                                                                                 │
│  4. AGENTE PERICIAL RENITLI (Forensic & Intercultural Certifier Agent)          │
│     • Emite fe pública conforme a Ley 29735 y Art. 220 CPP.                    │
│                                                                                 │
│  5. AGENTE DESPACHADOR Y AUDITOR DE CANALES (Notification & Feedback Agent)     │
│     • Genera paquetes OASIS CAP v1.2 para INDECI/SISMATE y despachos Telegram. │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Matriz de Conectores Polimórficos de Ingesta

El Agente KURAQ gobierna 27 fuentes estructuradas en 4 niveles de confianza (*Tiers*):

### A. Conector SIOFEN IMARPE BDO (Cadencia Diaria / 24 Horas)
* **Fuente Oficial:** `https://siofen.imarpe.gob.pe/boletines-e-informes/BDO`
* **CDN Oficial de Almacenamiento:** `https://siofen-admin.imarpe.gob.pe/img/productoArchivo/BDO/{YEAR}/BOL_IMARPE_BDO_{YYYY-MM-DD}.pdf`
* **Mecanismo:** Descarga autónoma mediante cabeceras estándar de navegador (sorteando políticas WAF). Si el boletín del día no está publicado, retrocede automáticamente hasta 5 días hábiles.
* **Extracción de Variables:**
  - Microescala costera en 12 estaciones fijas: Tumbes, Paita, San José, Chicama, Huanchaco, Chimbote, Huacho, Callao, Pisco, Chala, Matarani e Ilo.
  - Temperatura Superficial del Mar ($\text{TSM}$) y anomalías térmicas locales ($\Delta T$).
  - Isoterma de $15^\circ\text{C}$ (profundidad en metros) y régimen de vientos alisios para la alimentación del **Reloj Polar Táctico AMARU FEN** (`/imarpe`).

### B. Conector Comisión Multisectorial ENFEN (Cadencia Quincenal / 15-30 Días)
* **Fuente Oficial:** `https://enfen.imarpe.gob.pe/`
* **Mecanismo:** Escaneo periódico cada 12 horas detectando nuevas entradas con el patrón `Comunicado Oficial ENFEN N° [0-9]+-2026`.
* **Extracción de Variables:**
  - Nivel de alerta país: `"Alerta de El Niño Costero"`, `"Vigilancia"`, `"No Activo"`.
  - Matriz de probabilidades bimensuales de magnitud para el Verano 2026-2027 (Extraordinario, Fuerte, Moderado, Débil).
  - Recálculo en caliente del `factor_fen` (ej. $\times 1.38$) aplicado a caudales fluviales ANA y al modelo Saaty AHP distrital (`IRCE-FEN`).

### C. Conector Radares Meteorológicos SENAMHI Banda C (Cadencia 5 a 10 Minutos)
* **Fuente Oficial:** `https://www.senamhi.gob.pe/main.php?p=satelites-radares`
* **Mecanismo:** Consulta asíncrona a `ajax_radares_get_imagenes.php` para Piura (`PIU`) e Ica (`ICA`).
* **Extracción de Variables:**
  - Productos: `HRef_QC` (reflectividad filtrada libre de clutter), `HRef` (bruta), `RVel` (velocidad Doppler radial).
  - Ángulos PPI: $0.5^\circ$ (`E00p5`), $1.3^\circ$, $3.0^\circ$, etc.
  - Alimenta la ventana táctica de **Nowcasting Aluvial (0 a 120 minutos)** en quebradas críticas y cuencas ciegas SARE de Piura.

### D. Conector ANA GeoSNIRH (Cadencia 10 a 15 Minutos)
* **Fuente Oficial:** `https://snirh.ana.gob.pe/`
* **Mecanismo:** API REST de aforos fluviales.
* **Extracción de Variables:** Caudal instantáneo ($Q$ en $\text{m}^3/\text{s}$), cota de desborde y ratio de capacidad hidráulica en puentes neurálgicos (Sánchez Cerro, Independencia, Carrasquillo).

### E. Conectores Catastrales Soberanos (Cadencia Semanal / Mensual)
* **Directorio Municipal INEI 2026:** 1,893 municipalidades (Alcalde presidente de GT-GRD, teléfonos, correos y sedes COED).
* **Comisarías PNP 2026 (MININTER):** 1,026 distritos cubiertos con coordenadas GPS de dependencias policiales.
* **MINEDU SIGMED / ESCALE:** Padrón de instituciones educativas aptas como albergues temporales INDECI y semáforo de riesgo escolar.

### F. Conector Observatorio Nacional SENAMHI (Cadencia 30 Minutos - SRC-SENAMHI-OBSERVATORIO-ESTACIONES)
* **Fuente Oficial:** `https://observatorio.senamhi.gob.pe/investigadores/red-estaciones` / API: `https://servicios.senamhi.gob.pe/api/researchers/stations`
* **Tier:** `TIER_1_OFICIAL_ESTATAL`
* **Mecanismo:** Ingesta del catálogo nacional georreferenciado de **982 estaciones**, con extracción periódica de lecturas en tiempo real y series mensuales.
* **Extracción de Variables:**
  - 325 Estaciones Automáticas: Telemetría horaria (`00:00`, `01:00`, etc.) de temperatura del aire (`N_AIRTEMP`), precipitación (`N_LLUVIA`), humedad (`N_HUMEDAD`), velocidad (`N_VELVIENTO`) y dirección del viento.
  - 246 Estaciones Hidrológicas: Monitoreo de niveles de río (tirante en metros a las `06h`, `10h`, `14h`, `18h` y promedio diario).
  - Algoritmo de Haversine integrado para localización de estación representativa distrital y calibración de sesgo orográfico.

### G. Conector Modelos Numéricos Globales Open-Meteo (Cadencia 60 Minutos - SRC-OPEN-METEO-GLOBAL-CORE)
* **Fuente Oficial:** `https://api.open-meteo.com/v1/forecast` & `https://flood-api.open-meteo.com/v1/flood`
* **Tier:** `TIER_2_INSTITUCIONAL_INTERNACIONAL`
* **Mecanismo:** Ingesta de mallas numéricas ECMWF IFS (9 km), GFS y simulación de caudales fluviales GloFAS Copernicus.
* **Extracción de Variables:**
  - Malla horaria de precipitación, temperatura a 2m y energía potencial convectiva disponible (CAPE en J/kg).
  - Caudal de río proyectado a 7-16 días ($Q$ en $\text{m}^3/\text{s}$) para todas las cuencas del Perú.
  - Reanálisis climático horario ERA5 (1940 a la fecha) para cálculo de anomalías y percentiles extremos ($P_{95}/P_{99}$).
  - Variables marinas (SST, altura y dirección de oleaje) en la franja costera Niño 1+2.


---

## 4. Protocolo Criptográfico de Ingesta & Cadena de Custodia (SAGF-MC)

Cada evento de ingesta ejecutado por el Agente KURAQ genera una estructura inmutable de auditoría forense:

```json
{
  "source_id": "SRC-IMARPE-BDO",
  "estado": "SINCRONIZADO_OK",
  "boletin_fecha": "2026-09-22",
  "archivo_descargado": "BOL_IMARPE_BDO_2026-09-22.pdf",
  "bytes_tamano": 1053820,
  "hash_sha256": "8f3b2a1c9e4d5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
  "origen_url": "https://siofen-admin.imarpe.gob.pe/img/productoArchivo/BDO/2026/BOL_IMARPE_BDO_2026-09-22.pdf",
  "timestamp_utc": "2026-09-23T03:51:30.124560+00:00",
  "normativa": "NTP-ISO/IEC 27037:2012 Evidencia Digital / SAGF-MC Módulo 4"
}
```

Este certificado garantiza:
1. **No-Repudio Institucional:** Demuestra que la decisión de despacho se basó en el documento exacto publicado por la entidad técnica.
2. **Defendibilidad Legal:** Válido como prueba pericial documental ante la Contraloría General de la República (Ley 29664 / D.S. 115-2025-PCM) y procesos del Código Procesal Penal (Art. 220 CPP).

---

## 5. Catálogo de Endpoints REST en FastAPI

| Método | Endpoint | Descripción | Perfil de Acceso |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/kuraq/fuentes` | Inventario consolidado de 27 fuentes, Tiers y estados de salud. | C2 / Analistas |
| `GET` | `/api/v1/kuraq/fuentes/health` | Sondeo paralelo de latencia (ms) y disponibilidad de conectores. | C2 / Operadores |
| `POST` | `/api/v1/kuraq/sincronizar` | Disparo forzado o programado de sincronización con retorno de hash SHA-256. | C2 / Automatismo |
| `GET` | `/api/v1/kuraq/auditoria` | Historial inmutable de ingestas y firmas forenses. | OCI / Contraloría |
| `GET` | `/api/v1/climate/stations` | Catálogo de las 982 estaciones del Observatorio SENAMHI con filtros. | C2 / Analistas |
| `GET` | `/api/v1/climate/stations/nearest` | Localización de estación más cercana por Haversine para lat/lon. | C2 / Operadores |
| `GET` | `/api/v1/climate/hybrid-forecast` | Pronóstico continuo 7-16 días (ECMWF calibrado con Ground Truth local). | C2 / Alcaldes |
| `GET` | `/api/v1/climate/flood-monitoring` | Monitoreo dual de cuenca (nivel río SENAMHI + caudal GloFAS). | C2 / Defensa Civil |


---

## 6. Consola Web C2 de Telemetría (`/fuentes`)

Ubicada en **`/fuentes`** e integrada en la barra de navegación superior ([`HeaderNav.tsx`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/frontend/src/components/HeaderNav.tsx)):
- **4 KPIs Ejecutivos:** Total de Fuentes, Conectores Vivos, Cobertura Tier 1 y Estado Criptográfico SHA-256.
- **Filtros por Nivel de Confianza (Tiers):** Exploración por fuentes estatales, internacionales o comunitarias.
- **Sincronización Interactiva:** Botón individual para re-ingestar cualquier fuente y certificar el hash en pantalla.
- **Modal de Cadena de Custodia:** Visualización de metadatos forenses listos para exportación pericial.
