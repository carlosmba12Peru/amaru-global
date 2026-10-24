# 🧭 GUÍA DE EVALUACIÓN Y MANUAL DE NAVEGACIÓN PASO A PASO (AMARU-CLIMATE)
## Guía Interactiva para Jurados y Evaluadores Externos • IEEE ClimateChain Global Hackathon 2026

> **Entorno de Producción Oficial:** [https://coen-frontend-289004262994.us-central1.run.app](https://coen-frontend-289004262994.us-central1.run.app)  
> **Blockchain Notary (Polygon Amoy):** [`0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0`](https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0)  
> **API REST OpenAPI:** [https://coen-backend-289004262994.us-central1.run.app/docs](https://coen-backend-289004262994.us-central1.run.app/docs)  
> **Idioma:** La plataforma cuenta con selector bimodal en el menú superior (**Castellano 🇵🇪 / English 🇺🇸**).

---

## 🗺️ Mapa de Rutas Clave de Evaluación

Para facilitar una evaluación exhaustiva y autónoma en menos de 10 minutos, recomendamos seguir esta secuencia de 5 estaciones:

| Estación | Ruta en Producción | Qué se demuestra al Evaluador / Jurado |
| :---: | :--- | :--- |
| **1** | [`/incendios`](https://coen-frontend-289004262994.us-central1.run.app/incendios) | **Motor C2 Satelital y 38 Incendios Ciegos:** Clusterización DBSCAN ($R=12\text{ km}$), persistencia térmica PTT 48h y conciliación INDECI. |
| **2** | [`/auditoria`](https://coen-frontend-289004262994.us-central1.run.app/auditoria) | **Notaría Blockchain Polygon y Bitácora WORM:** Verificación de árboles de Merkle, hashes SHA-256 inmutables y trazabilidad anti-corrupción. |
| **3** | [`/reporte-ciudadano`](https://coen-frontend-289004262994.us-central1.run.app/reporte-ciudadano) | **Borde Social Zero-PII y Seguro Agrario (SAC):** Generación del comprobante `CUP-AGRO` / `CUP-DAMN`, audio en RAM y cálculo Saaty. |
| **4** | [`/municipal/200105`](https://coen-frontend-289004262994.us-central1.run.app/municipal/200105) | **Gobernanza HITL y Candado Cognitivo:** Padrón ciego, inspección ocular obligatoria ($T \ge 30\text{ s}$) y protocolo Break-the-Glass. |
| **5** | [`/doctrina/matriz-sinagerd`](https://coen-frontend-289004262994.us-central1.run.app/doctrina/matriz-sinagerd) | **Arquitectura Global IEEE (EW4All):** Mapeo de los 6 eslabones OMM/UNDRR y correspondencia con el marco jurídico legal. |

---

## 👣 Recorrido Detallado Paso a Paso

### ESTACIÓN 1: Consola Táctica de Incendios Forestales (`/incendios`)
* **Enlace directo:** [https://coen-frontend-289004262994.us-central1.run.app/incendios](https://coen-frontend-289004262994.us-central1.run.app/incendios)
* **Pasos a seguir por el evaluador:**
  1. Observa el mapa nacional con los **86 clusters de incendios activos** agrupados mediante el algoritmo geodésico DBSCAN a partir de sensores NASA FIRMS (VIIRS 375m).
  2. Haz clic en el botón de filtro superior **"🔴 Solo Incendios Ciegos"**:
     * El sistema filtra instantáneamente los **38 incendios forestales** de alta severidad que tienen cero reporte administrativo en el COEN/INDECI.
  3. Haz clic sobre cualquier cluster en el mapa o en la lista lateral:
     * Verás la potencia radiativa (FRP en MW), el cálculo automatizado de cortafuegos mecanizados con tractor oruga D8 y la justificación técnica de contratación directa conforme a la Ley de Contrataciones del Estado (Art. 27).
  4. Observa el indicador de **Persistencia Térmica Temporal (PTT 48h)**: evita falsos negativos cuando hay cobertura nubosa o inversión térmica nocturna.

---

### ESTACIÓN 2: Consola de Fe Pública y Auditoría Forense (`/auditoria`)
* **Enlace directo:** [https://coen-frontend-289004262994.us-central1.run.app/auditoria](https://coen-frontend-289004262994.us-central1.run.app/auditoria)
* **Pasos a seguir por el evaluador:**
  1. Revisa la tabla de los **7 Controles Forenses Automatizados** en tiempo real.
  2. Inspecciona el panel de **Anclaje Blockchain Polygon Amoy (Capa L3)**:
     * Observa las raíces de Merkle (Merkle Roots) generadas para cada lote de incidentes.
     * Haz clic en el enlace al explorador de bloques: te redirige a [Polygonscan Amoy](https://amoy.polygonscan.com/address/0x5462C7F1aC5a0C58356A21e25F883d6aF92289c0) donde se constata la invocación del contrato `ClimateAuditAnchor.sol`.
  3. Prueba el **Validador de Códigos Opacos**:
     * Ingresa cualquier identificador (ejemplo: `CUP-DAMN-200105-A7F2` o `CUP-AGRO-200105-B3E1`).
     * Comprueba la verificación instantánea de integridad criptográfica contra el libro mayor WORM (*Write Once, Read Many*).

---

### ESTACIÓN 3: Consola Ciudadana y Borde Social Zero-PII (`/reporte-ciudadano`)
* **Enlace directo:** [https://coen-frontend-289004262994.us-central1.run.app/reporte-ciudadano](https://coen-frontend-289004262994.us-central1.run.app/reporte-ciudadano)
* **Pasos a seguir por el evaluador:**
  1. En la parte superior, observa la **Tríada de Borde**:
     * `🏠 Hábitat CUP-DAMN` (Vivienda colapsada / Bono BAE).
     * `🏥 Salud CUP-MINSA` (Triaje médico NTS-105 MINSA).
     * `🌾 Cultivos y Ganado CUP-AGRO` (Seguro Agrícola Catastrófico SAC / MIDAGRI).
  2. Selecciona un distrito (por ejemplo `[200105] Catacaos - Río Piura`).
  3. Selecciona la altura del agua con el selector ergonómico de un toque (`🦶 Tobillo`, `🦵 Rodilla`, `🧍 Cintura`, `🏠 Techo`).
  4. Completa la composición familiar (niños < 5 años, adultos mayores > 65 años).
  5. Pulsa el botón de micrófono para probar el testimonio oral en lengua originaria: el audio se procesa en memoria volátil RAM local (< 50 ms) y genera un hash SHA-256 sin enviar grabaciones privadas a la nube comercial (Ley N.º 29733 de Protección de Datos).
  6. Presiona **"Enviar Reporte Bajo Custodia Segura"**:
     * Se desplegará la credencial digital con el código opaco `CUP-DAMN-...`, el puntaje determinista IPAD Saaty y el semáforo de SLA urgente.

---

### ESTACIÓN 4: Consola Municipal y Enjaulamiento Cognitivo HITL (`/municipal/200105`)
* **Enlace directo:** [https://coen-frontend-289004262994.us-central1.run.app/municipal/200105](https://coen-frontend-289004262994.us-central1.run.app/municipal/200105)
* **Pasos a seguir por el evaluador:**
  1. Ingresa a la pestaña **"Damnificados (EDAN)"**.
  2. **Comprueba el Aislamiento Zero-PII:** En la lista de damnificados, los funcionarios ven únicamente códigos opacos (`CUP-DAMN-...`) y niveles de severidad; ningún DNI, nombre o teléfono personal está expuesto en texto plano.
  3. **Experimenta el Candado Cognitivo Anti-Complacencia ($T \ge 30\text{ s}$):**
     * Haz clic en *"Iniciar Inspección Ocular (HITL)"*.
     * Verás un temporizador de 30 segundos que bloquea las acciones de aprobación automática. Esto obliga a la revisión reflexiva de la evidencia técnica y erradica el sellado ciego de expedientes.
  4. **Prueba el Protocolo Break-the-Glass:**
     * Tras cumplirse los 30 segundos, presiona *"Romper Sello"*, ingresa un DNI ficticio de evaluador y motivo justificado.
     * El sistema genera una transacción auditada en la bitácora WORM con sello de tiempo RFC 3161 y hash SHA-256.

---

### ESTACIÓN 5: Matriz de Gobernanza y Arquitectura IEEE EW4All (`/doctrina/matriz-sinagerd`)
* **Enlace directo:** [https://coen-frontend-289004262994.us-central1.run.app/doctrina/matriz-sinagerd](https://coen-frontend-289004262994.us-central1.run.app/doctrina/matriz-sinagerd)
* **Pasos a seguir por el evaluador:**
  1. En el menú superior de la plataforma, pulsa el botón verde **`🌍 IEEE Global (EW4All)`**.
  2. Revisa la matriz relacional donde cada proceso de alerta temprana se vincula con los **6 Eslabones de Alertas Tempranas para Todos (UN-EW4All / OMM)**:
     - Eslabón 1: Observación Global.
     - Eslabón 2: Pronóstico Multiamenaza.
     - Eslabón 3: Predicción de Vulnerabilidad.
     - Eslabón 4: Alerta Autorizada y Enjaulamiento Cognitivo (Cognitive Caging).
     - Eslabón 5: Logística C2 Humanitaria.
     - Eslabón 6: Auditoría Forense y Notaría Blockchain.
  3. Comprueba cómo la plataforma resuelve la **"Tragedia de la Ventana Dorada"**, permitiendo a las autoridades locales actuar en la ventana crítica de 4 a 12 horas con respaldo jurídico-probatorio inalterable.

---

## 💡 Consejos de Navegación Adicionales
* **Buscador Universal C2:** Puedes presionar la combinación de teclas `Ctrl + K` (o pulsar el botón *"Buscador C2..."* en la barra superior) en cualquier pantalla para saltar directamente a cualquier consola, distrito o decreto de emergencia.
* **Modo Sala de Crisis (War Room):** En las consolas cartográficas puedes activar el botón de expansión panorámica para simular videowalls de centros de operaciones de emergencia.
