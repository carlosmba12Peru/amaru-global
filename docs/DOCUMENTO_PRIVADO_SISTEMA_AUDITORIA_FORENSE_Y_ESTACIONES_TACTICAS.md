# 🛡️ DOCUMENTO PRIVADO: SISTEMA DE AUDITORÍA FORENSE, CALIDAD DE GOBERNANZA Y ESTACIONES TÁCTICAS OPERACIONALES
## AMARU-CLIMATE • Suite Tripartita Soberana de Misión Crítica
### Fenómeno El Niño 2026-2027 • Clasificación: RESERVADO / GOBERNANZA ANTICIPATORIA

---

## 1. Declaración de Principios de Auditoría y Calidad Institucional

La implementación de inteligencia artificial en la gestión del riesgo de desastres y la respuesta humanitaria en el Perú enfrenta dos riesgos catastróficos simétricos:
1. **El Riesgo de Inacción o Parálisis Burocrática:** Exigir que cada afectado cuente con validación presencial previa antes de recibir cualquier subsidio o ayuda inmediata, condenando al 80% de las víctimas vulnerables al desamparo en los primeros días críticos del desastre.
2. **El Riesgo de Fraude, Filtraciones y Falsos Damnificados:** "Agricultores de escritorio" que declaran parcelas inexistentes para cobrar el Seguro Agrícola Catastrófico (SAC) de S/ 800 o el FertiAbono, duplicidad de polígonos comunales, y reportes maliciosos con imágenes descargadas de desastres antiguos.

Para resolver este dilema de política pública, **AMARU-CLIMATE** implementa la **Doctrina del Pre-Padrón Descentralizado con Homologación Humana T1**, respaldada por una **Consola de Auditoría Forense y Calidad de Gobernanza (`/auditoria`)** que ejecuta **7 controles criptográficos, periciales y de gobernanza automatizada**.

---

## 2. Los 7 Controles y Auditorías Forenses de AMARU-CLIMATE

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             MATRIZ DE LOS 7 CONTROLES FORENSES Y DE CALIDAD DE GOBERNANZA              │
├────┬──────────────────────────────┬───────────────────────────┬────────────────────────┤
│ N° │ CONTROL FORENSE              │ TECNOLOGÍA / SENSOR       │ IMPACTO DE AUDITORÍA   │
├────┼──────────────────────────────┼───────────────────────────┼────────────────────────┤
│ 1  │ Sellado Inmutable SHA-256    │ Merkle Tree Ledger        │ Trazabilidad Cero-Fuga │
│ 2  │ Radar SAR C-band Sentinel-1  │ Backscatter + NDVI 60d    │ Anti-Fraude Agrícola   │
│ 3  │ Auditoría PP 0068 Inacción   │ MEF SIAF / CGR Concurrente│ Descalce Financiero    │
│ 4  │ Triaje Médico NTS-105 MINSA  │ Protocolo Break-the-Glass │ Soberanía Galénica CMP │
│ 5  │ Homologación Humana T1       │ Ventana T+15 / T+30 días  │ Bono BAE S/ 500 Ágil   │
│ 6  │ Circuit Breaker HITL         │ Parada Automática >15%    │ Blindaje Sistémico C2  │
│ 7  │ Anti-Fakenews & EXIF Forense │ Magic Bytes + ISO 27037   │ Descarte de Bulos      │
└────┴──────────────────────────────┴───────────────────────────┴────────────────────────┘
```

### Control 1: Sellado Inmutable SHA-256 & Bóveda Zero-PII (Ley 29733)
* **Objetivo:** Garantizar que ninguna autoridad distrital, regional o usuario malicioso pueda alterar, duplicar o insertar fichas EDAN a posteriori.
* **Mecanismo:** Cada declaración genera en el cliente un hash criptográfico SHA-256 inmutable de la tupla:
  $$\text{Hash}_{\text{ficha}} = \text{SHA256}(\text{DNI} \parallel \text{UBIGEO} \parallel \text{Timestamp} \parallel \text{Geoloc} \parallel \text{TiranteAgua})$$
* **Desacoplamiento:** Los datos sensibles de identidad se encriptan con clave simétrica AES-256-GCM dentro de una bóveda sellada. En la red pública y en las consolas operativas solo circula el **Código Único de Paciente/Damnificado (`CUP-DAMN` o `CUP-MINSA`)**, cumpliendo el Art. 14 inc. 4 de la Ley de Protección de Datos Personales N.° 29733.

### Control 2: Detección Satelital SAR Sentinel-1 y NDVI Histórico (Filtro Anti-Agricultores de Escritorio)
* **Objetivo:** Neutralizar el fraude de "agricultores de escritorio" que declaran cerros secos o fajas sin sembrío para cobrar bonos y subsidios agrarios.
* **Mecanismo:**
  1. El sistema cruza la coordenada catastral de la parcela con el histórico satelital **Sentinel-2 (NDVI)** de los 60 días previos a la inundación. Si $\text{NDVI}_{\text{pre}} < 0.20$, el predio se clasifica como *Terreno Árido / Sin Cultivo*, bloqueando la pre-calificación.
  2. En condiciones de nubosidad severa, el radar de apertura sintética **Copernicus Sentinel-1 (Banda C 5.405 GHz)** penetra la cobertura nubosa y calcula el coeficiente de retrodispersión ($\sigma^0$). Las zonas anegadas generan reflexión especular ($\sigma^0 < -18\text{ dB}$), corroborando científicamente la lámina de agua sobre el cultivo registrado.
  3. Detección espacial de duplicidad: Si dos reclamantes registran la misma parcela comunal con distancia euclidiana $< 30\text{ m}$, el sistema congela la asignación automática y deriva el expediente a dirimencia comunal presencial.

### Control 3: Auditoría de Inacción Financiera PP 0068 (MEF SIAF y Control Concurrente CGR)
* **Objetivo:** Monitorear el descalce entre el Presupuesto Institucional Modificado (PIM) y la ejecución real (Devengado) en los 643 proyectos de descolmatación, enrocado riprap y defensas ribereñas del país.
* **Mecanismo:**
  * Alarma automática de inacción funcional si $\text{Avance Devengado} < 35\%$ habiendo transcurrido más del 60% del año fiscal previo a las lluvias.
  * Disparo de cédulas de notificación digital preventiva bajo el **Art. 377 del Código Penal (Omisión, Rehusamiento o Demora de Actos Funcionales)** y articulación con la Directiva N.° 013-2022-CG de la Contraloría General de la República.

### Control 4: Custodia Forense NTS-105 MINSA y Bóveda Médica Break-the-Glass
* **Objetivo:** Preservar el acto médico reservado y evitar el ejercicio ilegal de la medicina (Art. 290 del Código Penal) por parte de modelos de IA.
* **Mecanismo:**
  * La IA únicamente efectúa una estratificación sindrómica preliminar conforme a la Norma Técnica de Salud NTS N.° 105-MINSA/DGSP-V.01 (Prioridad I a IV).
  * Ningún fármaco ni orden de evacuación se emite de forma autónoma.
  * Todo acceso a la identidad médica del paciente incomunicado exige el protocolo **Break-the-Glass**: el médico de turno debe ingresar su número de colegiatura (CMP) y motivo clínico, registrándose en una bitácora inmutable tipo WORM (*Write Once, Read Many*) en `backend/data/audit_salud_break_glass.jsonl`.

### Control 5: Doctrina de Homologación Humana T1 (Ventana T+15 / T+30 Días)
* **Objetivo:** Auxiliar a la población damnificada de inmediato sin comprometer el rigor fiscal.
* **Mecanismo:**
  * **Fase T0 (Día 0):** Asignación inmediata del estado "Pre-Damnificado Calificado" y reserva del Bono de Arrendamiento de Emergencia (BAE) de S/ 500 conforme al D.S. N.° 008-2022-VIVIENDA.
  * **Fase T1 (Días 15 a 30):** La brigada técnica municipal de Defensa Civil y los empadronadores del Ministerio de Vivienda realizan la inspección in-situ con el aplicativo móvil sin conexión, cotejan el tirante de agua con las marcas en las paredes y rubrican con firma digital el padrón SINPAD.
  * **Tolerancia Cero-Perjuicio:** El 80% de damnificados reales recibe atención oportuna. Si la validación en T1 revela falsedad testimonial, el código se revoca antes del segundo giro bancario en el Banco de la Nación y se traslada al Procurador Público Municipal.

### Control 6: Circuit Breaker Humano en el Bucle (HITL)
* **Objetivo:** Evitar fallas algorítmicas masivas o alucinaciones de modelos de lenguaje en situaciones de desastre.
* **Mecanismo:**
  * Umbral de Tolerancia: Si la tasa de discrepancia entre los pre-reportes de la IA y las actas físicas municipales supera el **15% en un mismo UBIGEO**, se activa el **Circuit Breaker HITL**.
  * Se congela el procesamiento autónomo y el sistema pasa a *Modo Manual Asistido*, requiriendo doble confirmación del Oficial de Enlace COEN/INDECI.

### Control 7: Anti-Fakenews y Validación EXIF Forense (ISO/IEC 27037)
* **Objetivo:** Prevenir la contaminación del mapa táctico con imágenes descargadas de Google Images, Facebook o WhatsApp correspondientes al Niño Costero 2017 o Ciclón Yaku 2023.
* **Mecanismo:**
  * Inspección de cabeceras binarias (Magic Bytes `0xFFD8FFE0` para JPEG y `0x89504E47` para PNG).
  * Validación de metadatos EXIF: fecha y hora de captura original del sensor óptico, modelo de cámara y consistencia con las coordenadas GPS del reporte ciudadano.
  * Detección de imágenes sintéticas o reutilizadas mediante análisis de compresión y Gemini 1.5 Vision.

---

## 3. Arquitectura del Pipeline Dual Soberano: IMARPE y ENFEN

### 3.1. Por qué Falla el Scraping Web Exclusivo
Los portales gubernamentales peruanos (`imarpe.gob.pe`, `enfen.gob.pe`, `senamhi.gob.pe`) cuentan con políticas de seguridad perimetral que generan:
1. **Geo-bloqueo y WAF:** Bloqueo de subredes IP de datacenters internacionales (Google Cloud Run en `us-central1`, AWS `us-east-1`).
2. **Inestabilidad de Formato:** Cambios recurrentes en la estructura de plantillas CMS que invalidan selectores CSS y scripts de automatización.
3. **Carencia de Validez Jurídica:** Un valor extraído de una tabla HTML no constituye peritaje documental formal ante la Contraloría o Fiscalía.

### 3.2. Solución: El Pipeline Dual Soberano
AMARU-CLIMATE implementa una estrategia híbrida:
* **Canal A (Automático):** Polling web periódico que actualiza la telemetría cuando el servicio público responde adecuadamente.
* **Canal B (Depósito Forense Manual):** Bandeja permanente en la interfaz web de IMARPE (`/imarpe`) y ENFEN (`/enfen`):
  * El operador del COEN o analista científico deposita el Boletín Diario Oceanográfico (BDO) o Comunicado Oficial en PDF con firma institucional.
  * El backend (`POST /api/imarpe/upload-pdf` y `POST /api/enfen/upload-pdf`) procesa el documento en **< 1.5 segundos**, calcula el hash SHA-256 del archivo físico, indexa las 12 estaciones de TSM o las probabilidades de El Niño Costero, y actualiza toda la suite sin necesidad de internet hacia los servidores de origen.

---

## 4. Estación de Monitoreo de Radar Doppler Banda C en el COED Nacional

* **Ubicación Táctica:** Emplazada como estación fija en el centro de mando del COED Nacional (`/`).
* **Sensores Integrados:**
  * **Radar Meteorológico WRM200 de Piura (`PIU`):** Banda C (5.60 a 5.65 GHz), longitud de onda ~5.3 cm, ubicado en coordenadas `-5.17° S, -80.63° W`. Cobertura de las cuencas Piura, Chira y Tumbes.
  * **Radar Meteorológico de Ica (`ICA`):** Ubicado en Cerro Colorado (`-14.07° S, -75.73° W`), monitorea el frente de nubosidad convectiva de la Cordillera Occidental hacia las cuencas de Pisco, Ica y Palpa.
* **Doble Motor de Visualización:**
  * Modo SENAMHI WRM200 nativo.
  * Modo Failover RainViewer Doppler: compuesto global de reflectividad para el litoral peruano, garantizando disponibilidad 24/7 sin pantallas en negro.
* **Capacidades Operativas:**
  * Bucle de Nowcasting animado de 0 a 120 minutos.
  * Selección de ángulo de inclinación de haz (0.5°, 1.5°, 3.0°, 4.5°).
  * Escala calibrada en dBZ con identificación inmediata de núcleos de precipitación torrencial (>45 dBZ) y riesgo aluvial inminente.

---

## 5. Resumen de Disponibilidad en Google Cloud Platform

| Componente | Servicio | URL de Producción | Estado |
|---|---|---|---|
| **Consola de Auditoría Forense** | Cloud Run Frontend | `https://coen-frontend-289004262994.us-central1.run.app/auditoria` | `200 OK` |
| **COED Nacional & Radar Doppler** | Cloud Run Frontend | `https://coen-frontend-289004262994.us-central1.run.app/` | `200 OK` |
| **Consola IMARPE (36 Boletines)** | Cloud Run Frontend | `https://coen-frontend-289004262994.us-central1.run.app/imarpe` | `200 OK` (Al 24-Set-2026) |
| **Consola ENFEN Dual PDF** | Cloud Run Frontend | `https://coen-frontend-289004262994.us-central1.run.app/enfen` | `200 OK` (7 Comunicados) |
| **Suite Municipal 360° (MEF)** | Cloud Run Frontend | `https://coen-frontend-289004262994.us-central1.run.app/municipal/200101` | `200 OK` (PP 0068 en vivo) |
| **Ingesta SENAMHI Telemetría** | Cloud Run Backend | `https://coen-backend-289004262994.us-central1.run.app/api/v1/jobs/ingest-senamhi` | `200 OK` (973 Estaciones) |
| **Cloud Scheduler Telemetría** | GCP Scheduler | `senamhi-telemetry-hourly-sync` (crontab `0 * * * *`) | `ENABLED` |
| **API REST & Métricas Forenses** | Cloud Run Backend | `https://coen-backend-289004262994.us-central1.run.app/api/v1/auditoria/metricas-forenses` | `200 OK` |
