# INFORME DE REVISIÓN E INTEGRACIÓN DE DATA HISTÓRICA TERRITORIAL (COEN-DIGITAL)
## FUENTES OFICIALES DE RIESGO, FENÓMENO EL NIÑO, LA NIÑA Y DOCTRINA OPERACIONAL

**Clasificación:** DOCUMENTO TÉCNICO OPERACIONAL / CONVERGENCIA HISTÓRICA  
**Fecha:** Septiembre 2026  
**Ubicación de los Datos:** `Lab4/data/` y `Lab4/backend/data/`  
**Servicio Backend Central:** `backend/services/historical_data_service.py`  
**Endpoints Activos:**
- `GET /api/data/historical/summary`
- `GET /api/data/distrito/{ubigeo}/profile`
- `GET /api/data/distrito/{ubigeo}/etnoterritorial`
- `GET /api/data/distrito/{ubigeo}/ipi`
- `GET /api/data/etnoterritorial/ranking-triple-vulnerabilidad`
- `GET /api/data/etnoterritorial/exportar-csv`
- `GET /api/data/etnoterritorial/formulas`
- `GET /api/data/quebradas/criticas`
- `GET /api/maps/layers/telemetry`

---

## 1. RESUMEN DE LA INTEGRACIÓN SOBERANA

Se ha indexado en memoria **la totalidad de las bases estructuradas y la cartografía histórica oficial** del Estado Peruano:
1. **1,891 Distritos Nacionales:** Catálogo completo CENEPRED / MEF con nivel de peligro SIGRID (*Muy Alto, Alto, Medio, Bajo*).
2. **893 Distritos en Estado de Emergencia FEN:** Declarados legalmente bajo el **Decreto Supremo N° 124-2026-PCM**.
3. **Catálogo Oficial RENALIO Tomos I y II:** Base de predominancia lingüística del Ministerio de Cultura (**Decreto Supremo N° 009-2021-MC**).
4. **46 Quebradas Críticas Nacionales:** Con umbrales pluviométricos de activación ($mm/h$), tiempos de concentración y **1,224,340 habitantes expuestos**.
5. **Corredor de Heladas y Friajes (AMARU-CHIRI):** Zonas altoandinas (>3,800 msnm) con censos agropecuarios de camélidos (Agro Rural / MIDAGRI).
6. **Red de Estaciones de Aforo Fluvial:** Caudales instantáneos comparados con el récord de El Niño 1998 (4,424 m³/s en Río Piura).
7. **Red de Boyas Oceanográficas DHN / IMARPE:** Detección in situ de Ondas Kelvin y termoclina en la Región Niño 1+2.

---

## 2. INVENTARIO Y ANÁLISIS DE DOCUMENTOS INTEGRADOS

### 2.1. Cartografía, Peligro y Mandato Legal (Bases Estructuradas JSON)

| Archivo JSON | Tamaño | Entidad Emisora | Aporte Táctico y Algorítmico al Proyecto |
| :--- | :--- | :--- | :--- |
| **`distritos_riesgo_nacional_1891_cenepred_mef.json`** | 566 KB | CENEPRED / MEF | Padrón de los **1,891 distritos del Perú** con su clasificación de riesgo SIGRID. Pondera el 35% del Índice IPI. |
| **`distritos_emergencia_ds_124_2026_pcm.json`** | 116 KB | PCM | Nómina oficial de los **893 distritos en Estado de Emergencia**. Pondera el 30% del Índice IPI. |
| **`catalogo_nacional_lenguas_renalio.json`** | 78 KB | MINCUL (D.S. 009-2021-MC) | Catálogo de predominancia dialectal por departamento, provincia y distrito. Pondera el 20% del IPI y fija el régimen bilingüe. |
| **`catalogo_distritos_heladas_nina.json`** | 36 KB | MIDAGRI / Agro Rural | Base de datos para el **Reloj AMARU-CHIRI** y ponderación del 15% en el IPI por heladas altoandinas. |
| **`catalogo_quebradas_criticas.json`** | 168 KB | ANA / INGEMMET / CENEPRED | Expediente de **46 quebradas críticas** con umbrales milimétricos ($mm/h$), tiempo de concentración y población amenazada. |
| **`estaciones_hidrologicas_aforo.json`** | 5.8 KB | SENAMHI / ANA | Estaciones limnimétricas y de aforo con caudales de alerta y récord histórico de 1998. |
| **`historico_fen_1998_2017.json`** | 47 KB | INDECI / SINPAD | Memoria histórica comparativa (1982-83, 1997-98, 2017, 2023) con daños, diques colapsados y lecciones tácticas. |
| **`geodatos_893_distritos_ubigeo.json`** | 251 KB | INEI / IGN | Coordenadas precisas (latitud, longitud, población estimada) de los distritos del D.S. 124. |
| **`contactos_defensa_civil/directorio_nacional_grd.json`** | 8.4 KB | INDECI | Directorio oficial de alcaldes y secretarios técnicos de Defensa Civil por UBIGEO. |

---

## 3. INTEGRACIÓN CON LOS AGENTES Y FÓRMULAS MATEMÁTICAS

### 3.1. Agente 2 (Evaluador Táctico Territorial)
Consulta `historical_service.get_district_full_profile(ubigeo)` y `get_etnoterritorial_profile(ubigeo)`:
- Identifica de forma inmediata si el distrito está en el D.S. 124-2026-PCM.
- Obtiene la población expuesta según INEI y las quebradas activas con nombre y umbral.
- Determina la variante dialectal según RENALIO.

### 3.2. Motor Algorítmico IPI (Triple Vulnerabilidad)
Implementado en `historical_data_service.py`:
$$\text{IPI} = (0.35 \times P_{\text{CENEPRED}}) + (0.30 \times E_{\text{DS124}}) + (0.15 \times H_{\text{AMARU}}) + (0.20 \times B_{\text{RENALIO}})$$
- Permite ordenar y filtrar distritos en tiempo real.
- Exporta la matriz a archivo CSV estructurado para salas de crisis mediante `export_triple_vulnerabilidad_csv()`.

---

## 4. CONSOLAS DE VISUALIZACIÓN INTEGRADAS

1. **Consola Geovisor Táctico C2 (`/geovisor`):** 7 capas cartográficas interactivas (NOAA SST, Boyas DHN, Doppler RainViewer, 46 Quebradas, Aforos vs 1998, Memoria FEN, Heladas AMARU-CHIRI y RENALIO IPI).
2. **Consola Doctrinal & Fórmulas (`/doctrina`):** Explicación matemática interactiva de IPI (activo), IPH (huaicos) e ISH (heladas).
3. **Consola de Glosario Técnico & Catálogo de Mapas (`/glosario`):** Diccionario terminológico completo y fichas técnicas de cada capa cartográfica.
