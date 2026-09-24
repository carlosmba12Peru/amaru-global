# 🗺️ PLAN TÉCNICO MAESTRO: EVOLUCIÓN TÁCTICA AMARU-CLIMATE (FEN 2026-2027)
## HOJA DE RUTA GRADUAL: DE LO MÁS FÁCIL A LO MÁS COMPLICADO DE IMPLEMENTAR

> **Documento Oficial del Proyecto AMARU-CLIMATE (COEN-Digital)**  
> **Destinatarios:** Equipo de Desarrollo, Analistas C2 COEN, INDECI, Gobiernos Regionales y Locales  
> **Fecha de Elaboración:** 22 de Septiembre de 2026  
> **Estado:** Aprobado para Planificación e Inicio de Ejecución  

---

## 🎯 1. Resumen Ejecutivo y Metodología Gradual

Para maximizar el impacto operativo y salvar vidas desde el primer despliegue, el plan se estructura en **6 fases estrictamente ordenadas por gradiente de complejidad**, desde **victorias rápidas de software puro sin dependencias externas** hasta **soluciones de física computacional en GPU y hardware de telecomunicaciones tácticas en campo**:

```
[MÁS FÁCIL] ───► FASE 1: Gemelo de Activos Críticos de Servicios Básicos (PTAP, Bocatomas, Subestaciones)
                 FASE 2: Logística Humanitaria Dinámica y Re-Ruteo Anti-Corte de Puentes (VRP)
                 FASE 3: Ficha EDAN Oficial SINPAD v2 Homologada con Firma Digital y XML
                 FASE 4: Radar Satelital SAR Sentinel-1 (Penetración de Nubes y Lámina de Agua 10m)
                 FASE 5: Modelación Hidráulica 2D en GPU a Nivel de Manzana Urbana (Shallow Water)
[MÁS COMPLEJO] ─► FASE 6: Redes Mesh Tácticas LoRaWAN / Meshtastic en Borde Desconectado Extremo
```

---

## 📊 2. Tabla Comparativa de Fases

| Fase | Nivel de Complejidad | Dificultad | Tiempo Estimado | Dependencias Externas | Retorno Táctico Inmediato |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | **Gemelo de Servicios Básicos (Agua / Luz)** | 🟢 Baja (Software puro) | **1 a 2 días** | Ninguna (Datos públicos SUNASS/COES) | **Inmediato:** Saber cuántas horas de agua potable quedan antes del cierre forzoso de PTAP. |
| **2** | **Logística Humanitaria y Re-Ruteo VRP** | 🟡 Media-Baja | **3 a 4 días** | Ninguna (Grafo vial MTC propio) | **Muy Alto:** Evitar que los convoyes queden varados en puentes caídos. |
| **3** | **Ficha EDAN SINPAD v2 con Firma Digital** | 🟡 Media | **4 a 5 días** | Estándar formal INDECI | **Alto:** Reducir de 72h a 5 minutos el trámite de auxilio estatal. |
| **4** | **Satélite Radar SAR Sentinel-1 Inundación** | 🟠 Media-Alta | **6 a 8 días** | API Copernicus / GEE | **Crítico:** Ver el agua real en el suelo día y noche bajo nubes densas. |
| **5** | **Simulación Hidráulica 2D en GPU (Manzanas)** | 🔴 Alta | **10 a 14 días** | DEM LiDAR / GPU Server | **Estratégico:** Saber qué calle se inunda a 40cm vs 1.5m con minutos de anticipación. |
| **6** | **Redes Mesh LoRaWAN en Cero Conectividad** | ⚫ Muy Alta (Hardware) | **15 a 20 días** | Dispositivos LoRa / RF 915MHz | **Supervivencia:** Operar cuando colapsen todas las torres celulares. |

---

## 🟢 3. FASE 1: Gemelo de Activos Críticos de Servicios Básicos
> **Dificultad:** 🟢 BAJA (1 a 2 días) • **Dependencias:** 0% (Software puro)

### 3.1. Justificación Táctica:
Durante crecidas aluviales, las Plantas de Tratamiento de Agua Potable (PTAP) colapsan por turbidez extrema ($> 10,000\text{ NTU}$), obligando a cerrar compuertas sin aviso y dejando a ciudades enteras desabastecidas durante días. De igual modo, las subestaciones eléctricas costeras sufren anegamiento de transformadores, con alto riesgo de electrocución masiva.

### 3.2. Arquitectura de Implementación:
1. **Catálogo de Activos (`data/infraestructura_servicios_basicos.json`):**
   - **PTAPs:** Curumuy (Piura), La Huaca (Chira), La Atarjea y Huachipa (Rímac), Santa Rosa (Trujillo). Capacidad de reservorios de agua cruda ($V_{\text{reserva}}$ en $\text{m}^3$) y caudal de captación normal.
   - **Subestaciones Eléctricas:** SE Piura Oeste, SE Chiclayo Oeste, SE San Juan (Lima), cotas críticas de piso de transformador.
2. **Servicio Backend (`backend/services/lifeline_infrastructure_service.py`):**
   - Correlación continua con caudal instantáneo de ANA GeoSNIRH y reflectividad de radar SENAMHI.
   - Cálculo del reloj de **Autonomía Hídrica Restante**:
     $$T_{\text{reserva}} (\text{horas}) = \frac{V_{\text{reserva}} (\text{m}^3)}{Q_{\text{distribución}} (\text{m}^3/\text{h})}$$
   - Regla de corte eléctrico preventivo cuando el tirante estimado supere la base del transformador.
3. **Endpoints REST:**
   - `GET /api/v1/lifelines/catalogo`: Inventario de infraestructuras y umbrales.
   - `GET /api/v1/lifelines/evaluar`: Monitoreo en tiempo real y cálculo de horas de reserva.
4. **Visualización Frontend:**
   - Panel en [`frontend/src/app/rios-norte/page.tsx`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/frontend/src/app/rios-norte/page.tsx) con semáforos de turbidez y reloj de autonomía de agua potable.

---

## 🟡 4. FASE 2: Logística Humanitaria Dinámica y Re-Ruteo Anti-Corte de Puentes (VRP)
> **Dificultad:** 🟡 MEDIA-BAJA (3 a 4 días) • **Dependencias:** 0% (Algorítmica interna)

### 4.1. Justificación Táctica:
Cuando el río corta un puente troncal (ej. Puente Independencia o Puente Virú), los camiones del Estado con víveres quedan atrapados o toman desvíos intransitables. Se requiere un cálculo dinámico de rutas seguras.

### 4.2. Arquitectura de Implementación:
1. **Grafo Vial Ponderado (`backend/services/routing/humanitarian_router.py`):**
   - Construcción del grafo vial con la Red Vial Nacional (SINAC/MTC) utilizando la librería `networkx`.
   - Modificación dinámica de pesos: si el servicio de infraestructura CAF/MTC reporta un puente como `COLAPSADO` o `CORTE_PREVENTIVO`, el peso de la arista se fija en $\infty$.
2. **Algoritmo de Ruteo A* / Dijkstra con Evitación de Riesgo Fluvial:**
   - Calcula la ruta más corta evitando zonas anegadas.
   - Estima el consumo de combustible diésel B5 y horas de tránsito.
3. **Frontend (`frontend/src/app/logistica/page.tsx`):**
   - Consola de Mando Logístico C2: Selector de almacén INDECI, selección de albergues destino y botón de simulación de puentes caídos con re-ruteo instantáneo en pantalla.

---

## 🟡 5. FASE 3: Generador de Ficha EDAN Oficial SINPAD v2 con Firma Digital
> **Dificultad:** 🟡 MEDIA (4 a 5 días) • **Dependencias:** Estándar normativo INDECI

### 5.1. Justificación Táctica:
La asistencia humanitaria del Estado se traba porque los secretarios técnicos municipales tardan días llenando a mano la Ficha EDAN en papel para transcribirla al SINPAD.

### 5.2. Arquitectura de Implementación:
1. **Motor EDAN Automático (`backend/services/edan_sinpad_service.py`):**
   - Pre-llenado de los **Formatos 2A y 2B de INDECI** cruzando los datos demográficos INEI 2026, los reportes ciudadanos verificados y los padrones escolares MINEDU.
2. **Doble Salida Oficial:**
   - **PDF idéntico al formato oficial de INDECI** mediante `reportlab`, con casilleros reglamentarios, QR de verificación y firma SHA-256.
   - **Payload XML/JSON homologado** para carga masiva directa al sistema SINPAD central de INDECI.
3. **Validación de Autoridad:**
   - Requiere el `X-Authority-Token` del Alcalde Distrital o Jefe de Defensa Civil para autorizar la emisión con valor legal.

---

## 🟠 6. FASE 4: Detección Satelital Radar de Mancha de Inundación (SAR Sentinel-1)
> **Dificultad:** 🟠 MEDIA-ALTA (6 a 8 días) • **Dependencias:** API Copernicus / GEE

### 6.1. Justificación Táctica:
La nubosidad de El Niño ciega a los satélites ópticos. El radar de apertura sintética (SAR) Sentinel-1 opera en microondas banda C, atravesando las nubes para mostrar el espejo de agua real en superficie día y noche.

### 6.2. Arquitectura de Implementación:
1. **Pipeline de Ingesta SAR (`backend/services/satellite/sentinel1_flood_service.py`):**
   - Conexión con Copernicus Data Space Ecosystem (CDSE) para descargar escenas Sentinel-1 GRD.
   - Calibración radiométrica $\sigma^0$ (sigma naught) y filtrado de ruido speckle.
2. **Binarización de Agua por Umbralización de Otsu:**
   - Detección de superficies lisas de agua que reflejan las microondas especularmente ($<-20\text{ dB}$).
   - Sustracción de cuerpos de agua permanentes para aislar únicamente el agua de inundación reciente.
3. **Capa Vectorial GeoJSON en Geovisor 3D:**
   - Muestra el polígono de hectáreas inundadas y caseríos aislados sobre el mapa nacional.

---

## 🔴 7. FASE 5: Modelación Hidráulica Bidimensional (2D) en GPU a Nivel de Manzana
> **Dificultad:** 🔴 ALTA (10 a 14 días) • **Dependencias:** DEM LiDAR / ALOS PALSAR / GPU

### 7.1. Justificación Táctica:
Los alcaldes necesitan saber con minutos de anticipación qué calles tendrán 30 cm de agua y cuáles tendrán 1.5 metros para coordinar botes y motobombas.

### 7.2. Arquitectura de Implementación:
1. **Solver Numérico 2D (`backend/services/hydro/shallow_water_2d_solver.py`):**
   - Resolución de las Ecuaciones de Aguas Someras 2D (Saint-Venant 2D) discretizadas por volúmenes finitos sobre mallas topográficas de 5m a 12.5m.
   - Rugosidad urbana de Manning diferenciada ($n=0.015$ asfalto, $n=0.10$ edificaciones).
   - Aceleración por GPU (Numba CUDA o WebGL Compute Shaders).
2. **Visualizador Dinámico (`frontend/src/components/Hydraulic2DViewer.tsx`):**
   - Renderizado dinámico de la onda de inundación avanzando calle por calle en Catacaos, Piura, Trujillo y Chosica.

---

## ⚫ 8. FASE 6: Protocolo de Comunicaciones Mesh LoRaWAN en Borde Desconectado
> **Dificultad:** ⚫ MUY ALTA (15 a 20 días) • **Dependencias:** Hardware LoRa 915 MHz (SX1262)

### 8.1. Justificación Táctica:
En el peor escenario de destrucción de antenas celulares y fibra óptica, las comunidades no pueden quedar incomunicadas.

### 8.2. Arquitectura de Implementación:
1. **Red en Malla LoRaWAN (915 MHz ISM):**
   - Nodos de radio de bajo costo desplegados en ollas comunes y patrulleros, con alcance de 10-15 km y retransmisión multi-salto.
2. **Protocolo Binario `AMARU-Packet` (15 Bytes):**
   - Serialización de alta densidad para transmitir alertas críticas en paquetes mínimos:
     `[Tipo: 4b][UBIGEO: 24b][GPS: 48b][Agua: 8b][SHA: 32b]`.
3. **Mulas de Datos y Conexión Web Bluetooth:**
   - La PWA de [`/ayni`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/frontend/src/app/ayni/page.tsx) se comunica directamente con el chip LoRa vía Bluetooth desde el teléfono celular sin necesitar internet.
   - Las patrullas de serenazgo recolectan los mensajes y los suben al C2 al recuperar enlace satelital.

---

## 🚀 9. Plan de Acción Inmediato para Mañana

```
PASO 1: Iniciar FASE 1 (Gemelo de Servicios Básicos: PTAP Curumuy, La Atarjea y Subestaciones Eléctricas).
        -> Crear data/infraestructura_servicios_basicos.json
        -> Implementar backend/services/lifeline_infrastructure_service.py
        -> Exponer endpoints en main.py y conectar con los ríos del norte.

PASO 2: Iniciar FASE 2 (Optimizador Logístico de Convoyes y Re-Ruteo Anti-Corte de Puentes).
        -> Crear backend/services/routing/humanitarian_router.py con networkx
        -> Conectar con el catálogo de 20 puentes críticos CAF/MTC.
```

---
*COEN-DIGITAL • AMARU-CLIMATE • CENTRO DE MANDO Y CONTROL DE INTELIGENCIA CLIMÁTICA SOBERANA*
