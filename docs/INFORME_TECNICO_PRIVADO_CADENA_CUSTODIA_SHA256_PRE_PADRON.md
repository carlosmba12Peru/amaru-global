# INFORME TÉCNICO PRIVADO Y CONFIDENCIAL: CADENA DE CUSTODIA FORENSE, SELLADO CRIPTOGRÁFICO SHA-256 Y SISTEMA DE PRE-PADRÓN TRIPARTITO (HÁBITAT, SALUD Y AGRO)

**Documento:** ITP-AMARU-2026-007  
**Clasificación:** PRIVADO / SECRETO EMPRESARIAL / AUDITORÍA FORENSE  
**Fecha:** 24 de Setiembre de 2026  
**Sistema:** AMARU-CLIMATE (Plataforma C4ISR Privada de Resiliencia Climática)  
**Marco de Referencia:** Decisión 486 de la CAN, Ley N.º 27785 (Control Gubernamental), Ley N.º 29664 (SINAGERD), Ley N.º 31526 (Bono BAE), Ley N.º 26842 (Salud General), Padrón PPA y Seguro Agrícola Catastrófico (MIDAGRI).

---

## 1. OBJETIVO DEL DOCUMENTO

Establecer el diseño y la fundamentación técnica del sistema de **Sellado Criptográfico Forense SHA-256** implementado en AMARU-CLIMATE, definiendo cómo este mecanismo transforma datos físicos y sensoriales desestructurados en **pruebas científicas irrefutables** para la emisión del **Pre-Padrón Dinámico de Emergencia** y su posterior **homologación por personal humano acreditado del Estado**.

---

## 2. EL SHA-256 COMO PRUEBA CIENTÍFICA EN GESTIÓN DE DESASTRES

En auditoría pública y peritaje forense, los datos digitales carecen de mérito probatorio si no se garantiza la preservación inalterable de la **Cadena de Custodia**.

AMARU-CLIMATE implementa una función criptográfica unidireccional de 256 bits estructurada bajo un esquema de **Árbol de Evidencia (Merkle Proof)** que vincula:
1. **$H_{\text{visión}}$ (Evidencia Fotogramétrica):** Hash de la imagen de fachada con vector de cálculo de tirante de agua (*mudline*) y ángulo de desplome de muros ($\theta$).
2. **$H_{\text{sat}}$ (Evidencia Teledetectada):** Hash de la reflectancia en microondas Sentinel-1 SAR (retrodispersión por anegamiento) y serie temporal de 60 días de biomasa previa (NDVI Sentinel-2).
3. **$H_{\text{hidro}}$ (Evidencia Fluvial):** Hash del registro telemétrico continuo de la estación de aforo (ANA/SENAMHI) certificando la crecida o desborde en tiempo real.
4. **$H_{\text{bio}}$ (Prueba de Vida en Borde):** Hash irreversible del vector de incrustación facial del solicitante generado mediante prueba activa de vida (*Liveness*) y coordenadas GNSS.

$$\text{Token Maestro CUP} = \text{SHA-256}(H_{\text{visión}} \parallel H_{\text{sat}} \parallel H_{\text{hidro}} \parallel H_{\text{bio}} \parallel \text{Timestamp}_{\text{GNSS}} \parallel \text{Ubigeo})$$

Cualquier intento posterior de modificar un milímetro del tirante de agua, mover las coordenadas o alterar los registros del aforo provoca una variación radical instantánea en el hash maestro (efecto avalancha), impidiendo el fraude o la manipulación post-evento.

---

## 3. ARQUITECTURA DEL PRE-PADRÓN TRIPARTITO EN DOS TIEMPOS (T0 vs. T1)

AMARU-CLIMATE opera bajo un modelo de **Dos Tiempos**, resolviendo la tensión entre la urgencia de salvar vidas y el rigor del control fiscal:

```
  TIEMPO T0: EMERGENCIA (0 - 24 Horas)              TIEMPO T1: HOMOLOGACIÓN HUMANA (15 - 30 Días)
  
  ┌──────────────────────────────────────┐          ┌──────────────────────────────────────────────┐
  │         EVALUACIÓN AMARU-CLIMATE     │          │            HUMANO ACREDITADO (ESTADO)        │
  │ • Telemetría cuenca / Radar SAR      │          │ • Evaluador EDAN Municipal (Vía Hábitat)     │
  │ • Fotogrametría Mudline / Liveness   │          │ • Médico / Cirujano MINSA (Vía Salud)        │
  │ • Histórico NDVI 60 días pre-huaico  │          │ • Perito Ajustador Agrario (Vía Agro/SAC)    │
  └──────────────────┬───────────────────┘          └──────────────────────┬───────────────────────┘
                     │                                                     │
                     ▼                                                     ▼
  ┌──────────────────────────────────────┐          ┌──────────────────────────────────────────────┐
  │        PRE-PADRÓN INMUTABLE          │          │         PADRÓN DEFINITIVO CONSOLIDADO        │
  │   (PRE-CUP-DAMN / MINSA / AGRO)      │ ───────> │    • Firma Digital y Validación de Campo     │
  │   Atención inmediata al 80% real     │          │    • Cierre probatorio ante Contraloría      │
  └──────────────────────────────────────┘          └──────────────────────────────────────────────┘
```

### 3.1. Vía 1: Hábitat y Vivienda (`PRE-CUP-DAMN`)
* **En T0:** La IA valida consistencia física ($I_{\text{CT}} \ge 0.70$) y colapso/inhabitabilidad por tirante $\ge 2.0\text{ m}$ o $\ge 0.50\text{ m}$ en adobe. Se emite el `PRE-CUP-DAMN` con hash SHA-256, autorizando el primer desembolso provisional del Bono BAE (S/ 500) y carpas de refugio.
* **En T1:** El evaluador municipal acreditado visita la vivienda con la tablet. Revisa las marcas de lodo ya registradas y firma digitalmente la **Homologación**. Si se detecta un predio no afectado, se genera la observación y se frena la entrega para los siguientes meses.
* **Prueba Científica Aportada:** Imagen original inalterable con análisis forense de lodo, serie histórica de lluvia y confirmación de desborde del río de la cuenca.

### 3.2. Vía 2: Salud Vital (`PRE-CUP-MINSA`)
* **En T0:** Pobladores o rescatistas emiten reportes de personas atrapadas o heridas. El Agente Centinela clasifica la urgencia médica y genera el `PRE-CUP-MINSA`, despachando ambulancia, bote o brigada médica.
* **Al Momento de la Atención:** El médico o enfermero en el puesto de salud escanea el código QR del `PRE-CUP-MINSA`, certifica el diagnóstico clínico en el sistema de salud e imputa los insumos utilizados.
* **Prueba Científica Aportada:** Espectro de audio del reporte de auxilio, coordenadas GNSS del punto de extracción y hora exacta de rescate frente a hora de atención hospitalaria.

### 3.3. Vía 3: Sector Agrícola (`PRE-CUP-AGRO`)
* **En T0:** Agricultores declaran parcelas anegadas. El Agente Satelital cruza con radar SAR Sentinel-1 y audita que la coordenada haya tenido cultivo vivo fotosintéticamente activo ($NDVI \ge 0.45$) en los 60 días previos. Emite el `PRE-CUP-AGRO` con bloqueo espacial H3 (impidiendo duplicidad en tierras comunales).
* **En T1:** El perito agrónomo de la aseguradora del Seguro Agrícola Catastrófico (SAC) y la Agencia Agraria visita el valle guiado por las coordenadas pre-validadas. Inspecciona la merma foliar y rubrica el Acta de Ajuste definitiva.
* **Prueba Científica Aportada:** Curva espectral de vegetación previa, reflectancia de agua por radar satelital en la fecha exacta del desastre y sello de no-solapamiento de tierras.

---

## 4. BLINDAJE DE CONTROL CONCURRENTE ANTE LA CONTRALORÍA GENERAL

Ante las acciones de control de la Contraloría General de la República (Directiva de Control Concurrente en Emergencias):
1. **Inexistencia de Arbitrariedad Humana en T0:** La inclusión en el pre-padrón no obedece a decisiones discrecionales de alcaldes o dirigentes, sino a algoritmos deterministas alimentados por telemetría sensorial.
2. **Homologación Responsable en T1:** El funcionario público no inventa padrones; homologa o descarta expedientes precargados con evidencia matemática preexistente.
3. **Bitácora Inmutable WORM:** Todo evento, verificación y homologación queda almacenado en registros *Write Once, Read Many* respaldados por cadenas de hash, imposibilitando la alteración retroactiva de datos.

---

## 5. CONCLUSIÓN

El sellado criptográfico SHA-256 constituye la columna vertebral que une la ciencia de la teledetección con la seguridad jurídica del Estado. Garantiza que el **80% o 90% de las víctimas reales reciban techo, medicina y respaldo económico en menos de 24 horas**, manteniendo intacta la facultad fiscalizadora del médico, el evaluador municipal y el perito agrario para cerrar el padrón definitivo con cero margen de corrupción.
