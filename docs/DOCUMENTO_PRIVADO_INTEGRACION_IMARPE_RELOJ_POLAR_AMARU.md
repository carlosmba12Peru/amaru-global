# DOCUMENTO TÉCNICO PRIVADO - DOCTRINA DE SEGURIDAD NACIONAL Y ALERTA TEMPRANA ETNOTERRITORIAL

---

**CLASIFICACIÓN DE SEGURIDAD:** `RESERVADO / USO OFICIAL EXCLUSIVO`  
**DESTINATARIOS:** COMANDO COEN • CCFFAA • INDECI • COMITÉ TÉCNICO ENFEN • GOBIERNOS REGIONALES DE CUENCA  
**ASUNTO:** Sincronización Telemetría IMARPE In-Situ, Cinemática Polar de Alerta Anticipatoria AMARU-FEN y Cartografía Térmica Satelital OSTIA-Copernicus  
**FECHA DE EMISIÓN:** 16 de Septiembre de 2026  
**ESTADO DE VIGENCIA:** VIGENTE / OPERACIONAL EN SISTEMA C2  

---

## 1. RESUMEN EJECUTIVO Y PROPÓSITO ESTRATÉGICO

El presente documento técnico confidencial establece las bases doctrinarias, físicas y computacionales de la integración de la telemetría oceanográfica oficial del **Instituto del Mar del Perú (IMARPE)** dentro de la consola táctica de comando y control (**C2**) y el **Reloj Polar Táctico AMARU-FEN**.

Históricamente, los Boletines Diarios Oceanográficos (BDO) del IMARPE —elaborados en el marco del **Programa Presupuestal PPR 068: "Reducción de Vulnerabilidad y Atención de Emergencias por Desastres"**— se han emitido como documentos PDF aislados. Esta fragmentación documental impedía que los centros de operaciones de emergencia, brigadas agrícolas y convoyes de maquinaria pesada contaran con alertas tempranas automatizadas y comparativas en tiempo real.

A través de esta implementación:
1. Se ha construido un **pipeline de ingesta y parseo automatizado** que extrae diariamente las variables físicas in-situ de las 12 estaciones costeras del litoral peruano.
2. Se ha sincronizado el **Reloj Polar AMARU-FEN**, erradicando los valores simulados o estáticos (*hardcoded*) y vinculando la cinemática de la aguja al comportamiento térmico real del mar peruano.
3. Se ha extraído e integrado la **cartografía satelital oficial de alta resolución** (Copernicus / OSTIA / NOAA) para dotar al mando operativo de visión espacial directa de las anomalías térmicas y la propagación de ondas Kelvin.

---

## 2. ANÁLISIS CIENTÍFICO DE MÉTRICAS HISTÓRICAS (RESOLUCIÓN DOCTRINAL)

### 2.1. ¿Qué métrica se utilizó en los análogos históricos?
En la oceanografía moderna y los protocolos de calificación de eventos El Niño (adoptados por la **NOAA**, la **Organización Meteorológica Mundial - OMM** y el **Comité Multisectorial ENFEN**), la métrica universalmente empleada para la comparación de eventos es la **Anomalía Térmica de la Temperatura Superficial del Mar ($\Delta\text{TSM}$ en $^\circ\text{C}$)** calculada respecto al promedio climatológico de 30 años (periodo 1991–2020).

Los análogos históricos de referencia incorporados en el sistema son:
* **Mega-Niño 1982–1983:** Anomalía máxima en Niño 1+2 de **$+4.1^\circ\text{C}$**. Impacto: Precipitaciones torrenciales superiores a 1,200 mm en cuencas de Piura y Tumbes, colapso de puentes y carreteras.
* **Mega-Niño 1997–1998:** Anomalía máxima en Niño 1+2 de **$+3.8^\circ\text{C}$**. Impacto: Inundaciones generalizadas simultáneas en costa norte y centro, activación de la quebrada San Ildefonso y ríos Rímac/Ica.
* **El Niño Costero 2017:** Anomalía máxima en Niño 1+2 de **$+3.2^\circ\text{C}$**. Impacto: Lluvias convectivas locales repentinas, colapso de defensas ribereñas y desbordes en Chicama, Virú y Piura.
* **Ciclón Yaku (Marzo 2023):** Anomalía localizada de **$+2.8^\circ\text{C}$**. Impacto: Ciclogénesis anómala de baja presión, huaicos simultáneos en 65 distritos de Lima y norte.

### 2.2. ¿Por qué NO se utiliza la Temperatura Absoluta para la comparación histórica interanual?
El océano experimenta un **ciclo estacional natural** gobernado por la radiación solar incidente:
* En **septiembre** (invierno tardío austral), la temperatura normal climatológica del mar en Paita ronda los **$16.8^\circ\text{C}$**.
* En **marzo** (verano austral), la temperatura normal climatológica en Paita ronda los **$23.5^\circ\text{C}$**.

Si un operador evaluara la severidad basándose únicamente en la temperatura absoluta:
* Un registro de $24.8^\circ\text{C}$ en marzo parecería una condición apenas cálida normal ($\Delta T \approx +1.3^\circ\text{C}$).
* Sin embargo, un registro de **$24.8^\circ\text{C}$ en pleno mes de septiembre** representa una desviación astronómica de **$+8.0^\circ\text{C}$** sobre su valor climatológico.

> [!CAUTION]
> **SIGNIFICADO TÁCTICO DE LA ANOMALÍA DE PAITA ($+8.0^\circ\text{C}$):**
> Si esta masa de agua cálida conserva esta anomalía relativa al adentrarse en los meses de verano (enero-marzo), las temperaturas absolutas del mar alcanzarían los **$31.5^\circ\text{C}$ a $32.0^\circ\text{C}$**, superando holgadamente el umbral de convección atmosférica descontrolada ($26.0^\circ\text{C}$) y superando los registros máximos del evento 1982-1983.

### 2.3. Criterio de Presentación en el Centro del Reloj Polar AMARU-FEN
Para garantizar la máxima claridad cognitiva del operador en el COEN sin ambigüedades:
1. **Dato Primario Central (Fuente Grande / Rojo Alerta):**  
   **$\Delta\text{TSM} = +8.0^\circ\text{C}$** (Anomalía Térmica en Vivo).  
   *Justificación:* Permite contrastar de un solo vistazo contra los $+4.1^\circ\text{C}$ (1982-83) y $+3.8^\circ\text{C}$ (1997-98) mostrados en la tarjeta de análogos históricos adyacente.
2. **Dato Secundario Inferior (Fuente Mediana / Azul Océano):**  
   **$\text{TSM} = 24.8^\circ\text{C}$** (Temperatura Superficial Absoluta).  
   *Justificación:* Proporciona la lectura física real del termómetro in-situ registrado en la estación costera.
3. **Inscripción de Validación:**  
   `PAITA • IMARPE IN-SITU` (Región Niño 1+2).

---

## 3. ARQUITECTURA DE INGESTA OFICIAL VS BOYAS SINTÉTICAS

### 3.1. Supresión de Datos Simulados
Anteriormente, el subsistema de boyas oceanográficas operaba con lecturas estáticas fijas en el código (*hardcoded*), lo cual inducía a ceguera operativa. Dicha arquitectura ha sido reemplazada por el servicio de sincronización de IMARPE (`imarpe_service.py`), el cual extrae las observaciones directamente de la carpeta de repositorio:
`data/Reporte de Imarpe diario/meses/[mes]/`

### 3.2. Red Oficial de Microescala Ingestada
Se indexan las siguientes estaciones oceanográficas del litoral (Tabla 1 BDO):

| Estación IMARPE | Puerto / Localidad | Región | Latitud | TSM Obs (°C) | Anomalía ΔT (°C) | Condición Térmica |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Paita** | Paita | Piura | 05°05' S | **24.8** | **+8.0** | **Crítica (Extrema)** |
| **Chicama** | Puerto Malabrigo | La Libertad | 07°42' S | 17.6 | +2.4 | Niño Costero |
| **Huanchaco** | Huanchaco | La Libertad | 08°04' S | 17.6 | +1.9 | Moderada |
| **Chimbote** | Chimbote | Áncash | 09°04' S | 19.3 | +1.7 | Moderada |
| **Callao** | Callao | Callao | 12°04' S | 16.2 | +1.2 | Débil |
| **Pisco** | Paracas / Pisco | Ica | 13°42' S | 20.3 | +0.7 | Débil |
| **Ilo** | Ilo | Moquegua | 17°38' S | 14.5 | +0.6 | Neutra |
| **San Juan** | San Juan de Marcona | Ica | 15°21' S | 12.8 | -0.6 | Fría Ligera |

*Nota:* Las estaciones de Tumbes, San José, Huacho y Matarani son reconocidas por el sistema con código `(1) s/d` (sin datos / mantenimiento), garantizando integridad estadística sin falsear información.

### 3.3. Algoritmo de Ordenamiento Dinámico de Microescala (Mayor a Menor Calentamiento)
Para optimizar el triaje rápido en la Sala de Crisis y Centro de Operaciones de Emergencia Nacional (COEN), la consola incorpora un selector de visualización en tres modos:
1. **🔥 Más Caliente por Anomalía ($\Delta\text{TSM}$ en $^\circ\text{C}$ - Predeterminado):** Prioriza las estaciones con mayor desviación sobre su promedio normal (`#1 Paita +8.0°C`, `#2 Chicama +2.4°C`, `#3 Huanchaco +1.9°C`...).
2. **🌡️ Mayor Temperatura Absoluta ($\text{TSM}$ en $^\circ\text{C}$):** Ordena de mayor valor térmico bruto registrado a menor (`#1 Paita 24.8°C`, `#2 Pisco 20.3°C`, `#3 Chimbote 19.3°C`...).
3. **🧭 Orden Geográfico Oficial (Norte a Sur):** Respeta la secuencia del litoral desde Tumbes (03°30' S) hasta Ilo (17°38' S).

Las estaciones activas reciben una insignia numerada de severidad (`#1`, `#2`, `#3`...), permitiendo identificar de forma instantánea el foco térmico principal de invasión marina.

---

## 4. CINEMÁTICA Y DEFLEXIÓN ANGULAR DEL RELOJ POLAR AMARU-FEN

El Reloj Polar Táctico no es un reloj de tiempo cronológico ordinario, sino un **reloj de tiempo de fase de riesgo anticipatorio**.

### 4.1. Ecuación Cinemática Polar
El ángulo horario de la aguja $\theta$ ($0^\circ$ en Diciembre, $90^\circ$ en Marzo, $180^\circ$ en Junio, $270^\circ$ en Septiembre, $330^\circ$ en Noviembre) se rige por:

$$\theta(t) = \theta_{\text{calendario}}(t) + \delta_{\text{anomalía}}(\Delta\text{TSM}) + \delta_{\text{kelvin}}$$

Donde:
* $\theta_{\text{calendario}}(14\text{ Sep}) \approx 254.0^\circ$ (Posición cronológica en septiembre).
* $\delta_{\text{anomalía}} = \min(60.0, \Delta\text{TSM} \times 8.5^\circ)$.  
  Para $\Delta\text{TSM} = +8.0^\circ\text{C}$, $\delta_{\text{anomalía}} = +60.0^\circ$ (saturación máxima de aceleración térmica).
* $\delta_{\text{kelvin}} = +20.5^\circ$ (deflexión por arribo inminente del paquete de ondas Kelvin cálidas).

### 4.2. Vector Resultante y Estado Táctico
$$\theta_{\text{operacional}} = 254.0^\circ + 60.0^\circ + 20.5^\circ = 334.52^\circ$$

* **Ubicación en el Dial:** La aguja salta cinemáticamente de septiembre a **fines de Noviembre / umbral de Diciembre ($334.5^\circ$)**.
* **Interpretación Operacional:** Aunque administrativamente el país se encuentre en septiembre, las condiciones hidrodinámicas y térmicas del mar corresponden a las que típicamente preceden una catástrofe de verano en diciembre.
* **Ventana Dorada:** Quedan exactamente **46 días de ventana logística** antes del cierre definitivo de obras en cauces de ríos antes de la temporada de avenidas torrenciales.

### 4.3. Dial Dual: Minutero Calendárico (Día Actual) vs. Aguja Cinética Táctica (Amenaza FEN)
Para evitar cualquier confusión operativa entre el "tiempo civil" y el "tiempo de riesgo hidroclimático", el Reloj Polar AMARU-FEN incorpora un dial de **dos agujas diferenciadas**:
1. **Minutero Delgado Azul (`#38bdf8`):**  
   Apunta directamente a la fecha real del calendario civil (hoy: **15 de Setiembre**, ángulo astronómico $254.52^\circ$). Representa el tiempo ordinario cronológico transcurrido.
2. **Aguja Gruesa Roja de Alerta (`#ef4444`):**  
   Representa la fase física del peligro acoplado océano-atmósfera. Debido a la anomalía récord de **$+8.0^\circ\text{C}$** registrada por IMARPE en Paita y el arribo de la onda Kelvin cálida, la aguja se encuentra flectada a **$334.52^\circ$ (Fines de Noviembre)**.
3. **Campo Explicatorio Integrado (Widget y Modal C2):**  
   Se ha integrado en la base del reloj un panel doctrinal permanente que sintetiza para los decisores del COEN el significado táctico de la brecha angular entre ambas agujas: *el desfase de $80^\circ$ revela que el mar peruano ya está operando bajo condiciones de inicio de temporada de lluvias extremas, haciendo que cada día de la Ventana Dorada restante sea crítico e irrecuperable.*

### 4.4. Gradiente Cromático de Severidad Histórica en el Arco de Amenaza (330° a 90°)
El arco de peligro que abarca desde Diciembre hasta Marzo no es monocromático, sino que incorpora una rampa cromática calibrada según los umbrales de severidad de los análogos históricos del ENFEN y la NOAA:
1. **Diciembre (330° a 0° / 360°) - Rojo Coral Suave (`#f87171`):**  
   Fase de transición e inicio de temporada de lluvias. Corresponde a condiciones de Niño Débil a Moderado ($\Delta\text{TSM} \approx +1.0^\circ\text{C}$ a $+1.8^\circ\text{C}$).
2. **Enero (0° a 30°) - Rojo Vivo de Alerta (`#ef4444`):**  
   Intensificación de caudales y desbordes ribereños tempranos. Corresponde a Niño Moderado a Fuerte ($\Delta\text{TSM} \approx +2.0^\circ\text{C}$ a $+2.5^\circ\text{C}$).
3. **Febrero (30° a 60°) - Rojo Carmesí Severo (`#dc2626` a `#b91c1c`):**  
   Frecuencia masiva de huaicos. Contiene las balizas de los eventos **Ciclón Yaku 2023 (+2.8°C)** y **El Niño Costero 2017 (+3.2°C)**.
4. **Marzo (60° a 90°) - Rojo Sangre / Carmesí Profundo (`#7f1d1d` a `#450a0a`):**  
   Clímax histórico de precipitación torrencial y saturación de cuencas. Contiene las balizas de los **Mega-Niños 1997–1998 (+3.8°C)** y **1982–1983 (+4.1°C)**.

Esta calibración permite que el operador reconozca de manera visual no solo en qué mes de peligro se encuentra la aguja, sino la **fuerza destructiva histórica análoga** asociada a ese sector del dial.

---

## 5. PIPELINE DE CARTOGRAFÍA SATELITAL OFICIAL (OSTIA / COPERNICUS / PPR 068)

El sistema integra un módulo de extracción automatizada de cartografía satelital utilizando las librerías `pypdf` y `Pillow`:

1. **Figura 1: TSM y Anomalías en la Cuenca del Pacífico Tropical (Niño 1+2 / 3.4 / 4)**
   * **Producto Satelital:** OSTIA-UKMO-L4-GLOB-v2.0 (UK Met Office / Copernicus Marine Service).
   * **Resolución Espacial:** 0.05° (~5 km).
   * **Visualización:** Muestra la onda Kelvin ecuatorial y la concentración de agua cálida acoplada al borde costero del Perú.
   * **Ubicación en el Sistema:** `/imarpe_images/figura_1_pacifico_tropical.png` (1920 x 894 px).

2. **Figura 3: Carta de Anomalías Térmicas de Alta Resolución del Mar Peruano**
   * **Entidad Emisora:** Laboratorio de Hidroquímica y Física Marina (LHFM) / Área Funcional de Investigaciones en Oceanografía Física (AFIOF) - IMARPE.
   * **Dominio:** 200 millas náuticas del mar de Grau.
   * **Visualización:** Ilustra el replegamiento del afloramiento costero de la Corriente de Humboldt hacia el sur y la invasión masiva de Aguas Ecuatoriales Superficiales (AES) frente a Piura y Lambayeque.
   * **Ubicación en el Sistema:** `/imarpe_images/figura_3_anomalias_costa_peru.png` (893 x 864 px).

Ambas figuras cuentan con:
* Barra cromática interactiva con rangos térmicos calibrados de $-3^\circ\text{C}$ a $+8^\circ\text{C}$.
* Visor modal C2 en alta resolución con zoom y metadata de fecha/hora de observación.

---

## 6. TELEMETRÍA OFICIAL DEL BDO N° 268 (25 DE SEPTIEMBRE DE 2026)

Con la ingesta del **Boletín Diario Oceanográfico N° 268** emitido por el IMARPE el 25 de septiembre de 2026:
1. **Foco Térmico en Chicama:** Registra una anomalía térmica extrema de **$+7.6^\circ\text{C}$**, confirmando el acoplamiento oceánico de gran magnitud en La Libertad.
2. **Estación Paita:** Mantiene niveles anómalos de hasta **$+8.0^\circ\text{C}$** en el núcleo de la masa cálida Niño 1+2.
3. **Cartas Satelitales Oficiales Extraídas:**
   - **Figura 1:** Extensión macroescala en el Pacífico Tropical (Niño 1+2 / Niño 3.4) de $180^\circ - 70^\circ\text{W}$ / $30^\circ\text{N} - 30^\circ\text{S}$, mostrando la lengua cálida anómala acoplada a la costa peruana.
   - **Figura 3:** Anomalías térmicas de alta resolución en el dominio costero de las 200 millas, evidenciando el repliegue del afloramiento costero de Humboldt.
4. **Almacenamiento y Entrega CDN en la Nube:**
   - Ambas figuras se procesan automáticamente mediante `pypdf` + `Pillow` y se exponen en la ruta `/imarpe_images/` del frontend para el visor C2 en pantalla completa.

---

## 7. PROTOCOLO OPERATIVO ESTÁNDAR (SOP) PARA LA ACTUALIZACIÓN DIARIA

Para mantener la vigencia del sistema cuando el IMARPE publique los nuevos boletines diarios:

1. **Depósito de Archivo:**
   Guardar el archivo PDF oficial (ejemplo: `bdo-2026-09-25.pdf`) en la carpeta correspondiente:
   `Lab4/data/Reporte de Imarpe diario/Set-2026/` (o en `Lab4/backend/data/Reporte de Imarpe diario/Set-2026/`)

2. **Disparo de Sincronización:**
   * **Vía Interfaz Gráfica:** En `/imarpe`, pulsar el botón interactivo **"Sincronizar Boletines"**.
   * **Vía API REST Local:** `POST http://localhost:8000/api/imarpe/sync`
   * **Vía API REST Cloud Run:** `POST https://coen-backend-289004262994.us-central1.run.app/api/imarpe/sync`

3. **Efectos Automáticos del Pipeline:**
   * Parseo de la Tabla 1 del nuevo boletín con telemetría de las 12 estaciones costeras fijas.
   * Extracción de las Figuras Satelitales 1 y 3 hacia la carpeta pública del frontend.
   * Actualización del histórico multitemporal en `imarpe_boletines_cache.json`.
   * Recálculo instantáneo de la cinemática de la aguja del reloj AMARU-FEN.
   * Transmisión al componente `TacticalPolarClock.tsx` mediante el ciclo reactivo de polling.

---

## 8. CONTROL DE VERSIONES Y DESPLIEGUE EN PRODUCCIÓN

* **Código de Documento:** `DOC-PRIV-C2-IMARPE-2026-002`
* **Versión de Software:** Antigravity C2 Lab4 v3.6 (IMARPE-Synced & Multi-Region Cloud)
* **Entorno de Producción Cloud Run:**
  - **Consola Oceanográfica en Vivo:** [https://coen-frontend-289004262994.us-central1.run.app/imarpe](https://coen-frontend-289004262994.us-central1.run.app/imarpe)
  - **Backend API Telemetría:** [https://coen-backend-289004262994.us-central1.run.app/api/imarpe/resumen](https://coen-backend-289004262994.us-central1.run.app/api/imarpe/resumen)
* **Arquitectura:** FastAPI Backend (Puerto 8080 en Cloud Run) • Next.js 14 Frontend (Puerto 8080 en Cloud Run) • Copernicus OSTIA / NOAA
* **Auditoría:** Conforme a las directivas del Sistema Nacional de Gestión del Riesgo de Desastres (SINAGERD - Ley N° 29664) y normas CGR.

---
*Fin del Documento Privado.*
