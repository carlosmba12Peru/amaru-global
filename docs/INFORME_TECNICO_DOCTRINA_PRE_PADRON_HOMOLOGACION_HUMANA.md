# INFORME TÉCNICO DE DOCTRINA: EL PARADIGMA DEL "PRE-PADRÓN DINÁMICO" Y HOMOLOGACIÓN HUMANA POSTERIOR EN AMARU-CLIMATE

**Documento:** IT-AMARU-2026-006  
**Clasificación:** Doctrina de Operaciones / Control Concurrente y Gestión Pública  
**Fecha:** 24 de Setiembre de 2026  
**Sistema:** AMARU-CLIMATE (Prototipo Privado de Resiliencia Climática)  
**Marco de Control:** Sistema Nacional de Control (Ley N.º 27785), Directiva de Control Concurrente de la Contraloría General de la República, Ley N.º 29664 (SINAGERD), Ley N.º 31526 (Bono BAE), Ley N.º 26842 (Salud) y Normativa SAC/MIDAGRI.

---

## 1. EL NÚCLEO CONCEPTUAL: "PRE-PADRÓN DE EMERGENCIA" VS. "PADRÓN DEFINITIVO"

La propuesta descrita resuelve el mayor cuello de botella de la gestión del riesgo de desastres en el Perú: **la parálisis por burocracia preventiva**.

Históricamente, el Estado exige que un funcionario o perito humano certifique en físico el 100% de los daños **antes** de entregar un solo sol o una carpa. En una catástrofe con 20,000 familias damnificadas y quebradas cortadas, esto condena al 80% o 90% de las víctimas reales al abandono durante 30 a 60 días.

**AMARU-CLIMATE invierte el paradigma mediante un Sistema de Dos Tiempos:**
1. **Tiempo T0 (Horas 0 a 24 - Alivio Vital de Emergencia):**  
   La IA y la telemetría multiescala generan un **PRE-PADRÓN CALIFICADO PROVISIONAL**. Con base en pruebas científicas irrefutables (sensores, radar satelital, fotos de tirante y telemetría de cuencas), el Estado desembolsa la primera ayuda (Bono BAE provisional, triaje médico o asistencia agrícola).
2. **Tiempo T1 (Días 15 a 45 - Certificación y Cierre Administrativo):**  
   El humano acreditado (médico, evaluador EDAN municipal o perito del SAC) llega a campo con el expediente digital precargado en su tablet. Su labor ya no es levantar todo desde cero en papel, sino **CONFIRMAR (homologar) o DESCARTAR (vetar)** lo que AMARU-CLIMATE ya documentó.

```
  TIEMPO T0: DESASTRE (0 - 24 Horas)                TIEMPO T1: CERTIFICACIÓN HUMANA (15 - 30 Días)
  
  ┌───────────────────────────────────────┐          ┌──────────────────────────────────────────────┐
  │         EVALUACIÓN AMARU-CLIMATE      │          │            HUMANO ACREDITADO (ESTADO)        │
  │ • Telemetría cuenca / Radar SAR       │          │ • Médico MINSA (Al momento de atención)      │
  │ • Mudline / Visión computacional      │          │ • Evaluador EDAN Municipal (Inspección casa) │
  │ • Prueba de vida Liveness + DNI       │          │ • Perito Ajustador Agrario (Agencia Agraria) │
  └──────────────────┬────────────────────┘          └──────────────────────┬───────────────────────┘
                     │                                                      │
                     ▼                                                      ▼
  ┌───────────────────────────────────────┐          ┌──────────────────────────────────────────────┐
  │       PRE-PADRÓN PROVISIONAL         │          │         PADRÓN DEFINITIVO CONSOLIDADO        │
  │   (CUP-DAMN / CUP-MINSA / CUP-AGRO)   │ ───────> │    • Homologación con Firma Digital          │
  │   Ayuda inmediata al 80% real         │          │    • Cierre legal ante Contraloría / WORM    │
  └───────────────────────────────────────┘          └──────────────────────────────────────────────┘
```

---

## 2. ANÁLISIS POR CADA UNA DE LAS 3 VÍAS OPERATIVAS

### VÍA 1: HÁBITAT Y VIVIENDA (Bono BAE S/ 500 y Albergue)

#### El Mecanismo Operativo:
* **En T0 (AMARU-CLIMATE):** El poblador sube la foto de la vivienda con geolocalización. El motor calcula el $I_{\text{CT}} \ge 0.70$ y tirante $\ge 2.0\text{ m}$ (Colapsada) o $\ge 0.50\text{ m}$ en adobe (Inhabitable). Se genera el **`PRE-CUP-DAMN`** y se autoriza el primer mes del Bono BAE (S/ 500) y la entrega de carpa/BAH.
* **En T1 (Evaluador Municipal / INDECI / VIVIENDA):** El brigadista acreditado llega a la zona 15 o 30 días después. No pierde tiempo llenando formularios en blanco: abre la app con el `PRE-CUP-DAMN` en pantalla, mira los cimientos y presiona **"CERTIFICAR"** con su DNI electrónico.
  * **Si confirma:** El expediente pasa a `VALIDADO_DEFINITIVO` y se asegura la continuidad del bono por los 24 meses de ley.
  * **Si detecta fraude o error (Descarte):** Marca `OBSERVADO_DISCREPANCIA`. El subsidio se detiene de inmediato para los siguientes meses y se inicia el recupero administrativo.

#### Evidencias Objetivas que Aporta AMARU-CLIMATE:
1. **Fotogrametría Forense con Timestamp:** Foto original con metadatos incrustados inalterables (altura de agua, desplome de muro).
2. **Capa Hidrológica del Río:** Constancia digital telemétrica de que el río de la cuenca desbordó en esa fecha exacta.
3. **Prueba de Liveness del Solicitante:** Vector biométrico del jefe de hogar tomado en las coordenadas del predio.
4. **Mapeo de Clúster Vecinal:** Certificación de que los predios colindantes en un radio de 300 m también reportaron afectación simultánea.

---

### VÍA 2: SALUD VITAL (Triaje y Evacuación Médica)

#### El Mecanismo Operativo:
* **En T0 (AMARU-CLIMATE):** Un poblador o rescatista reporta por audio o texto a una persona con herida punzopenetrante en agua contaminada o shock anafiláctico/trauma. El Agente Centinela emite el **`PRE-CUP-MINSA`** con alerta roja (código Manchester / DSRSLCC), reservando cama y despachando ambulancia o lancha.
* **Al momento de la atención (El Médico o Enfermero MINSA):** El personal de salud atiende al paciente en el puesto de salud o carpa médica de campaña. Al momento de aplicar la vía o curación, escanea el QR del `PRE-CUP-MINSA` y valida el diagnóstico real en su sistema SIS/MINSA.
  * **Si confirma:** El caso queda `HOMOLOGADO_MEDICAMENTE`. Queda registrada la historia clínica de contingencia y la imputación de gasto en medicamentos del kit FEN.
  * **Si se descarta gravedad:** El médico ajusta la clasificación a triaje verde/ambulatorio.

#### Evidencias Objetivas que Aporta AMARU-CLIMATE:
1. **Registro Acústico del Síntoma:** Espectro de audio del reporte de auxilio (útil para peritaje de coherencia respiratoria o dolor agudo).
2. **Geolocalización del Rescate:** Coordenadas GNSS exactas donde se levantó al paciente (útil para mapeo epidemiológico de brotes de dengue o leptospirosis).
3. **Trazabilidad de Cadena de Custodia Médica:** Hora exacta de emisión de alerta vs. hora de respuesta del establecimiento de salud.

---

### VÍA 3: SECTOR AGRÍCOLA (Seguro Catastrófico SAC y FertiAbono)

#### El Mecanismo Operativo:
* **En T0 (AMARU-CLIMATE):** El agricultor registra su parcela siniestrada. El Agente Satelital cruza con la imagen SAR Sentinel-1 y el histórico de biomasa previa (NDVI). Si se confirma inundación sobre cultivo vivo anterior, se emite el **`PRE-CUP-AGRO`**, permitiendo al MIDAGRI programar el auxilio financiero provisional o kit de semillas.
* **En T1 (Ajustador de la Aseguradora / Agencia Agraria DRA):** El perito agrónomo visita el valle 20 días después. En lugar de recorrer a ciegas miles de hectáreas, la plataforma le traza la ruta georreferenciada de las parcelas con `PRE-CUP-AGRO`. El perito verifica la pérdida de cosecha en campo y firma el acta de ajuste definitiva.
  * **Si confirma:** Se desembolsa el saldo indemnizatorio del SAC (hasta S/ 1,000 por ha).
  * **Si era un cerro seco o cultivo abandonado pre-desastre:** El perito lo descarta basándose además en el reporte satelital previo que AMARU-CLIMATE le entrega en la mano.

#### Evidencias Objetivas que Aporta AMARU-CLIMATE:
1. **Historial de Biomasa NDVI Pre-Desastre:** Serie temporal de los 60 días previos que demuestra que el campo estaba cultivado y activo.
2. **Firma de Radar Sentinel-1 SAR:** Detección física por microondas del espejo de agua sobre la parcela durante la tormenta.
3. **Cerradura Geodésica H3:** Hexágono espacial no solapable que impide que dos personas cobren por la misma parcela comunal.
4. **Verificación de DNI en Padrón PPA:** Estado activo del productor en el padrón agrario del MIDAGRI.

---

## 3. VALOR ANTE LA CONTRALORÍA GENERAL DE LA REPÚBLICA (CONTROL CONCURRENTE)

Este modelo es el sueño de la **Contraloría General de la República** por tres razones de control gubernamental:

| Criterio Tradicional del Estado | Riesgo Tradicional | Innovación AMARU-CLIMATE (Pre $\rightarrow$ Validado) |
| :--- | :--- | :--- |
| **Decisión a ciegas del funcionario** | El alcalde incluye a sus partidarios políticos en la lista en papel. | **Evidencia Inalterable Previa:** El funcionario solo puede validar predios donde la IA y los sensores ya probaron que hubo daño. |
| **Tiempo de respuesta tardío** | La ayuda llega cuando la familia ya migró o enfermó (meses después). | **Asistencia Inmediata al 80%:** Los recursos de primera necesidad fluyen en 24 horas protegiendo la vida. |
| **Responsabilidad y Auditoría** | Nadie sabe quién autorizó a quién o los papeles se "extravían". | **Bitácora Criptográfica WORM:** Queda grabado el hash de la IA, el dato del satélite y la firma digital del humano que homologó. |

---

## 4. CONCLUSIÓN

El planteamiento es **absolutamente sólido, realista y viable jurídica y técnicamente**. 

AMARU-CLIMATE **no reemplaza al médico ni al perito del Estado**; lo que hace es **empoderarlos**: les entrega un expediente con peritaje científico satelital y físico ya construido en tiempo cero. 

De esta manera:
* El **80% de las víctimas reales** reciben ayuda y techo de inmediato sin ser rehenes de la lentitud burocrática.
* El **control posterior humano** descarta cualquier caso dudoso o fraudulento en los días siguientes, cerrando las brechas de corrupción con respaldo pericial incorruptible.
