# PROPUESTA TÉCNICA: INSPECTOR CLIMÁTICO Y METEOROLÓGICO DISTRITAL DE ALTA PRECISIÓN (OPEN-METEO PRO)
## SISTEMA COEN-DIGITAL & COEL MUNICIPAL
### INTEGRACIÓN DE PRONÓSTICO 7 DÍAS, HORARIO, CONVECTIVO CAPE Y BÚSQUEDA NACIONAL DE 1,891 DISTRITOS

**Código Documental:** PROP-TEC-METEO-INSPECTOR-2026-V1  
**Fecha:** Septiembre 2026  
**Sistema:** COEN-Digital C2 / Consola Open-Meteo Pro + COEL Municipal  
**Referencia Visual:** Portal Meteorológico Clima Perú / Meteored / Eltiempo.es + Radar SINAGERD  

---

## 1. VISIÓN GENERAL Y OBJETIVO

Dotar tanto al **COEN Nacional Digital** (en su consola técnica `/meteo`) como al **COEL Municipal** (`/dashboard/[ubigeo]` y `/municipal/[ubigeo]`) de un componente unificado de inspección meteorológica de alta resolución denominado **`DistrictWeatherInspector`**.

Este componente replica y supera la experiencia visual de los principales portales de predicción meteorológica ciudadana (como *Clima Perú*), integrando la suscripción **Open-Meteo Professional (ECMWF IFS 9km)** con variables tácticas de alerta temprana (CAPE, Humedad de Suelo en 4 capas, GloFAS) y un buscador omnicanal indexado con los **1,891 distritos del Perú** (INEI/CENEPRED).

---

## 2. ANÁLISIS DE LA EXPERIENCIA VISUAL Y DE DATOS (MAPPING DE LA IMAGEN)

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  [ 🔍 Clima en: Distrito, Provincia o Departamento...                                 ]     │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  Provincia de Tarma - Junín  [UBIGEO: 120701]  [D.S. 124-PCM]  [Semáforo: AMARILLO]         │
│                                                                                             │
│     🌧️     10°      ↙ Viento: 11 km/h    ☁️ NUBES: 80%         💧 HUMEDAD: 78%               │
│   LLUVIA            Sensación: 8°        ☀️ RAD. UV: Extrema   ⏲️ PRESIÓN: 1023 hPa          │
│                                          ⚡ CAPE: 420 J/kg     🌱 SUELO: 52% (4 capas)       │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  [ Días (7d) ]   [ Horas (24h/48h) ]   [ Fin de Semana ]                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  MATRIZ MULTIVARIABLE (7 DÍAS):                                                             │
│                                                                                             │
│  Métrica        Hoy 17       Mañ 18       Sáb 19       Dom 20       Lun 21       Mar 22     │
│  Temp Max/Min   ↑10° ↓2°     ↑9° ↓4°      ↑12° ↓3°     ↑13° ↓1°     ↑15° ↓3°     ↑12° ↓3°   │
│  08:00          🌧️ 5°        🌧️ 5°        🌦️ 7°        🌦️ 6°        🌦️ 7°        ⛈️ 6°      │
│  14:00          🌧️ 9°        🌧️ 9°        🌧️ 12°       🌦️ 13°       🌤️ 15°       🌧️ 12°     │
│  20:00          🌧️ 4°        🌧️ 4°        ⛅ 5°        ⛅ 5°        ⛅ 6°        ⛅ 6°      │
│  Lluvia (mm)    1.4 mm       15.4 mm      3.0 mm       1.6 mm       0.2 mm       6.1 mm     │
│  Nieve / Gran.  0 cm         0 cm         0 cm         0 cm         0 cm         0 cm       │
│  Viento (km/h)  ↙ 20 km/h    ↙ 15 km/h    ↖ 10 km/h    → 15 km/h    ↘ 17 km/h    ← 14 km/h  │
│  Amanecer       05:55        05:54        05:53        05:53        05:52        05:51      │
│  Atardecer      18:00        18:00        18:00        18:00        18:00        18:00      │
│  Riesgo Quebr.  BAJO         ALTO (Huaico) MEDIO       BAJO         NORMAL       VIGILANCIA │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. ARQUITECTURA DE DATOS: OPEN-METEO PRO ENDPOINTS

### 3.1. Endpoint Backend: `/api/meteo/district-full/{ubigeo}`
Aprovecha la suscripción Open-Meteo Pro con parámetros extendidos:

* **URL base:** `https://customer-api.open-meteo.com/v1/forecast` (con fallback a `api.open-meteo.com`).
* **Modelo:** `models=ecmwf_ifs025` (Europeo de 9 km, referencia de oro para los Andes).
* **Variables Current:**
  `temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m`
* **Variables Hourly (para vista por horas y franjas 08:00, 14:00, 20:00):**
  `temperature_2m,precipitation_probability,precipitation,weather_code,surface_pressure,cloud_cover,relative_humidity_2m,wind_speed_10m,wind_direction_10m,cape,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm,soil_moisture_28_to_100cm,soil_moisture_100_to_255cm,uv_index`
* **Variables Daily (para vista de 7 días y fin de semana):**
  `weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,snowfall_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant`
* **Zona Horaria:** `timezone=America/Lima`.
* **Días de pronóstico:** `forecast_days=7`.

### 3.2. Endpoint de Búsqueda Autocomplete: `/api/data/districts/search?q={query}`
* Busca en memoria en el catálogo de **1,891 distritos** (`historical_service.distritos_1891`).
* Indexación por:
  1. Nombre del distrito (ej. "Tarma", "Chosica", "Huaraz", "Moche", "Yura").
  2. Nombre de provincia o departamento.
  3. Código UBIGEO (ej. "120701", "150118").
* Retorna lista rápida (< 15 ms) de resultados con `{ ubigeo, distrito, provincia, departamento, lat, lng, declarado_ds124 }`.

---

## 4. ESPECIFICACIÓN DEL COMPONENTE FRONTEND (`DistrictWeatherInspector.tsx`)

### 4.1. Características Técnicas
1. **Buscador Dinámico Autocomplete:** Barra superior flotante con debounce (200ms) y menú desplegable estilizado. Permite seleccionar cualquier distrito del Perú.
2. **Hero Header de Condiciones Actuales:**
   - Ícono del clima dinámico mapeado según los códigos WMO estándar (despejado, niebla, lluvia ligera, chubascos, tormenta convectiva, nieve/granizo).
   - Tipografía grande de temperatura (estilo *Clima Perú*).
   - Badges rápidos de Viento, Sensación térmica, Cobertura nubosa, Humedad relativa, Índice UV y Presión atmosférica (hPa).
   - Badges tácticos COEN: Nivel CAPE (J/kg) y Humedad del suelo (alerta temprana de huaicos).
3. **Pestañas de Navegación:**
   - **`[ Días ]`**: Vista tabular de 7 días (como en la imagen). Muestra franjas horarias clave (08:00, 14:00, 20:00), lluvia total acumulada en mm, nieve/granizo en cm, viento en km/h con flechas de dirección vectorial, horas de amanecer/atardecer y semáforo de riesgo C2.
   - **`[ Horas ]`**: Carrito/grilla deslizable horizontal con las próximas 24 a 48 horas paso a paso.
   - **`[ Fin de Semana ]`**: Filtro enfocado en Sábado y Domingo para planificación de cuadrillas municipales y evacuación de ferias/mercados de ribera.
4. **Integración Bi-Consola:**
   - **En `/meteo` (Consola Open-Meteo Pro):** Se ubica como vista modal expandible o pestaña principal "Inspector Distrital", permitiendo a los analistas del COEN saltar de la matriz de 893 distritos a la radiografía completa del distrito seleccionado.
   - **En `/dashboard/[ubigeo]` y `/municipal/[ubigeo]` (Consola COEL):** Se ubica directamente en el cuerpo del panel municipal, precargando el Ubigeo correspondiente a la municipalidad activa y permitiendo consultar distritos vecinos de la misma cuenca hidrográfica.

---

## 5. BENEFICIOS TÁCTICOS Y OPERATIVOS

1. **Unificación de Criterios:** El alcalde distrital y el comandante del COEN ven exactamente la misma telemetría calibrada de Open-Meteo Pro y ECMWF IFS 9km.
2. **Anticipación a Huaicos:** La combinación de la tabla de lluvia horaria con los picos de CAPE a las 14:00 permite evacuar quebradas antes de que empiece la lluvia en la cabecera.
3. **Usabilidad Familiar:** Al mantener la estética familiar y clara de los servicios populares de clima (íconos grandes, métricas de humedad/nubes/presión y amanecer/atardecer), el personal municipal y los brigadistas asimilan los datos sin necesidad de entrenamiento complejo.
