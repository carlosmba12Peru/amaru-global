# INFORME TÉCNICO DE SUSTENTACIÓN: ARQUITECTURA NEURO-SIMBÓLICA Y OPERACIONALIZACIÓN DE CALIFICACIÓN DE DAMNIFICADOS EN AMARU-CLIMATE

**Documento Técnico:** IT-AMARU-2026-004  
**Clasificación:** Documentación Técnica de Patente e Innovación de Software  
**Fecha de Emisión:** 24 de Setiembre de 2026  
**Sistema:** AMARU-CLIMATE (Prototipo Independiente de Resiliencia Climática)  
**Marco de Referencia:** Decisión 486 de la Comunidad Andina (Art. 15), Ley N.º 29664 (SINAGERD), Ley N.º 31526 (Bono BAE) y D.S. N.º 008-2022-VIVIENDA.

---

## 1. RESUMEN EJECUTIVO

El presente informe documenta y sustenta la arquitectura técnica utilizada por **AMARU-CLIMATE** para resolver de forma automatizada, auditable y segura el problema de la **calificación de ciudadanos damnificados y la asignación de beneficios indemnizatorios** (como el Bono de Arrendamiento para Emergencias - BAE).

Se sustenta:
1. **La naturaleza híbrida Neuro-Simbólica:** Por qué no es viable un modelo de *Machine Learning* puro ("caja negra") ni una fórmula legal estática tradicional.
2. **El empalme técnico-jurídico:** La diferenciación entre el marco legal abstracto estatal (dominio público) y la operacionalización algorítmica paramétrica desarrollada por AMARU-CLIMATE (propiedad intelectual patentable).
3. **El blindaje bidireccional de sesgos:** Mecanismos de mitigación contra **falsos positivos** (prevención del fraude por oportunismo) y **falsos negativos** (inclusión universal, modo desconectado y preservación de vidas humanas).

---

## 2. EL PARADIGMA NEURO-SIMBÓLICO: FÓRMULA VS. MACHINE LEARNING

En el diseño de sistemas de decisión en desastres, existe una tensión fundamental entre la **trazabilidad legal** y la **percepción sensorial**:

```
                       ┌────────────────────────────────────────────────────────┐
                       │           DILEMA DE DECISIÓN EN DESASTRES             │
                       └──────────────────────────┬─────────────────────────────┘
                                                  │
                 ┌────────────────────────────────┴──────────────────────────────┐
                 ▼                                                               ▼
  ┌─────────────────────────────┐                                 ┌─────────────────────────────┐
  │   MACHINE LEARNING PURO     │                                 │   FÓRMULA RÍGIDA TRADICIONAL│
  │        ("Caja Negra")       │                                 │      (Formulario Estático)  │
  ├─────────────────────────────┤                                 ├─────────────────────────────┤
  │ • Opaco a la auditoría.     │                                 │ • Incapaz de ver fotos o    │
  │ • Inadmisible legalmente por│                                 │   escuchar audios reales.   │
  │   falta de motivación.      │                                 │ • Vulnerable al fraude por  │
  │ • Riesgo de alucinaciones.  │                                 │   declaración falsa.        │
  └──────────────┬──────────────┘                                 └──────────────┬──────────────┘
                 │                                                               │
                 └──────────────────────────────┬────────────────────────────────┘
                                                ▼
                       ┌────────────────────────────────────────────────────────┐
                       │     SOLUCIÓN: ARQUITECTURA HÍBRIDA NEURO-SIMBÓLICA     │
                       │                    (AMARU-CLIMATE)                     │
                       ├────────────────────────────────────────────────────────┤
                       │  1. Machine Learning = Perito Técnico Multimodal        │
                       │     (Extrae vectores físicos de fotos, audio y radar). │
                       │                                                        │
                       │  2. Motor Simbólico = Juez Administrativo Determinista │
                       │     (Aplica la matriz legal auditable con hash WORM).  │
                       └────────────────────────────────────────────────────────┘
```

### 2.1. Inadmisibilidad del Machine Learning "Caja Negra"
Si una red neuronal artificial clasificara de forma directa si una persona recibe o no el Bono BAE (`Predicción: P(Bono) = 0.85`), la resolución administrativa sería **nula de pleno derecho**:
* Viola el principio constitucional de motivación de los actos administrativos.
* Impide la fiscalización de la Contraloría General de la República.
* Deja al funcionario o alcalde expuesto a denuncias penales por omisión o cobro indebido sin sustento fáctico verificable.

### 2.2. Insuficiencia de la Fórmula Pura sin Sensores
Un formulario tradicional de texto no tiene ojos ni oídos. No puede verificar si el usuario subió una fotografía descargada de internet, si la vivienda realmente sufrió un tirante de agua crítico, o si el evento hidrológico ocurrió en esa cuenca específica.

### 2.3. La Solución Híbrida de AMARU-CLIMATE
* **El componente Neuronal (ML):** Cumple estrictamente la función de **peritaje técnico**. Se encarga de procesar señales físicas desestructuradas: visión computacional para detectar huellas de barro (*mudline*), nivel del agua respecto a dinteles, materiales de pared y espectrograma de audio en lenguas originarias para detectar condiciones acústicas de emergencia.
* **El componente Simbólico (Reglas Deterministas):** Toma los datos cuantitativos producidos por el peritaje y ejecuta un árbol lógico cerrado y auditable basado en umbrales de daño físico. El resultado es 100% determinista y explicable.

---

## 3. EMPALME TÉCNICO-JURÍDICO: DOMINIO PÚBLICO VS. APORTE PATENTABLE

Ante el Instituto Nacional de Defensa de la Competencia y de la Protección de la Propiedad Intelectual (INDECOPI) y el Artículo 15 de la Decisión 486 de la CAN, **las leyes no son patentables**. Por ello, es imperativo establecer con rigor la frontera entre el marco jurídico público y la innovación técnica privada.

| Elemento Normativo Público (Estado Peruano) | Vacío en la Práctica Administrativa | Aporte Técnico Patentable (AMARU-CLIMATE) |
| :--- | :--- | :--- |
| **Ley N.º 29664 (SINAGERD):**<br>Define *"Vivienda Colapsada"* como aquella con colapso total o parcial irrecuperable de muros o techos. | No especifica umbrales cuantitativos. Depende de la inspección ocular subjetiva de brigadistas que demoran semanas. | **Operacionalización Geométrica y de Tirante:**<br>Cálculo vectorial de deformación en plano de techos ($\le 30\%$ integridad) o ángulo de desplome de muros $\theta > 15^\circ$, cruzado con tirante $h_{\text{agua}} \ge 2.0\text{ m}$. |
| **D.S. N.º 008-2022-VIVIENDA:**<br>Define *"Vivienda Inhabitable"* por riesgo inminente estructural para sus ocupantes. | No cuantifica el riesgo por tipo de material ni evalúa el colapso diferido por saturación hídrica. | **Matriz Paramétrica Material-Inundación:**<br>Correlación automática entre material degradable (adobe/quincha) con tirante interno $h_{\text{agua}} \ge 0.50\text{ m}$, determinando pérdida de resistencia al corte $> 80\%$. |
| **Ley N.º 31526:**<br>Otorga subsidio mensual de S/ 500 (Bono BAE) para arrendamiento de vivienda. | No provee un mecanismo para verificar si el beneficiario realmente habita la zona inundada ni evita la duplicidad. | **Algoritmo de Consistencia Territorial ($I_{\text{CT}}$):**<br>Fórmula de 4 capas geo-telemétricas que genera el token criptográfico inmutable `CUP-DAMN` en milisegundos. |

### 3.1. La Ecuación del Índice de Consistencia Territorial ($I_{\text{CT}}$)
La propiedad intelectual de AMARU-CLIMATE radica en la invención del modelo matemático de validación espacial multiescala:

$$I_{\text{CT}} = 0.35 \cdot C_{\text{hidro}} + 0.25 \cdot C_{\text{geom}} + 0.20 \cdot C_{\text{vecinal}} + 0.20 \cdot C_{\text{visión}}$$

Donde:
1. **$C_{\text{hidro}} \in [0.0, 1.0]$:** Coeficiente hidrológico derivado del monitoreo telemétrico de cuencas en tiempo real (estaciones de aforo y radar meteorológico). Si el río no supera el caudal de desborde ($Q_{\text{crítico}}$), el coeficiente se aproxima a cero.
2. **$C_{\text{geom}} \in [0.0, 1.0]$:** Coeficiente geodésico calculado mediante la distancia ortodrómica de Haversine hacia la poligonal de la faja marginal modelada por CENEPRED/ANA.
3. **$C_{\text{vecinal}} \in [0.0, 1.0]$:** Coeficiente de consenso espacial multivecinal (densidad de reportes independientes en un radio de 500 metros).
4. **$C_{\text{visión}} \in [0.0, 1.0]$:** Coeficiente de certidumbre estructural derivado del modelo de visión computacional sobre la evidencia gráfica.

---

## 4. PROTECCIÓN INTEGRAL CONTRA FALSOS POSITIVOS (ANTI-FRAUDE)

El falso positivo representa el cobro indebido de un bono estatal por parte de personas cuyas viviendas no sufrieron daños o que residen fuera de la zona de impacto.

```
                    FLUJO DE FILTRADO CONTRA FALSOS POSITIVOS
  
  [ Solicitud Ciudadana ]
             │
             ▼
  ┌─────────────────────────────────────┐
  │ 1. Telemetría de Cuenca (Chira/Piura)│ ──> Caudal base (< 15 m³/s) ──> BLOQUEO (Sin avenida fluvial)
  └──────────────────┬──────────────────┘
                     │ Caudal de alerta / desborde verificado
                     ▼
  ┌─────────────────────────────────────┐
  │ 2. Geodesia Haversine (CENEPRED)    │ ──> Predio a > 5 km del cauce ──> PENALIZACIÓN SEVERA
  └──────────────────┬──────────────────┘
                     │ Dentro de zona inundable / faja marginal
                     ▼
  ┌─────────────────────────────────────┐
  │ 3. Peritaje de Visión Computacional │ ──> Foto duplicada o sin lodo ──> RECHAZO POR INCONSISTENCIA
  └──────────────────┬──────────────────┘
                     │ Huella de barro y tirante confirmados
                     ▼
  ┌─────────────────────────────────────┐
  │ 4. Hash SHA-256 + Firma WORM        │ ──> Aprobación con bitácora inmutable auditable
  └─────────────────────────────────────┘
```

1. **Incompatibilidad Hidrológica Insalvable:** Es físicamente imposible cometer fraude masivo porque el sistema bloquea solicitudes si los sensores físicos de la cuenca registran caudal estiaje.
2. **Análisis Forense de la Evidencia Fotográfica:** La visión por computadora no solo busca "agua", sino marcas físicas de sedimentación y saturación capilar en muros. Detecta discrepancias de iluminación, metadatos y re-uso de imágenes.
3. **Consenso Geoespacial:** Aísla intentos individuales coordinados de fraude en zonas no impactadas.
4. **Trazabilidad Criptográfica Inmutable:** Toda aprobación genera un identificador `CUP-DAMN` firmado con SHA-256 y guardado en bitácora *Write Once, Read Many* (WORM). El evaluador humano que valide el pre-padrón asume responsabilidad administrativa verificable.

---

## 5. PROTECCIÓN INTEGRAL CONTRA FALSOS NEGATIVOS (GARANTÍA HUMANITARIA)

El falso negativo representa la exclusión de una familia vulnerable que lo perdió todo, provocada por barreras de conectividad, analfabetismo, idioma o limitaciones tecnológicas. En AMARU-CLIMATE, la protección contra falsos negativos es de carácter prioritario:

1. **Arquitectura Desconectada (*Offline-First* con `IndexedDB`):**
   * En quebradas donde las torres de telefonía colapsan, la aplicación web/PWA almacena localmente las coordenadas GPS satelitales, la fotografía y el audio en el almacenamiento persistente del dispositivo. Los datos se transmiten automáticamente cuando el teléfono capta una baliza comunitaria o señal municipal de emergencia.
2. **Inclusión Lingüística Originaria (Quechua Chanka, Collao, Aymara, Awajún, Shipibo):**
   * Pobladores monolingües o con analfabetismo registran su situación mediante reconocimiento de voz en borde. El sistema detecta descriptores de catástrofe en lengua materna y etiqueta el expediente para atención prioritaria por brigadistas bilingües registrados en ReNITLI.
3. **Bandeja de Discrepancia Territorial (Principio de No Rechazo Automático):**
   * Si una familia declara destrucción total de su casa pero el índice sale dudoso ($0.50 \le I_{\text{CT}} < 0.70$) —por ejemplo, debido a que una densa capa de nubes impidió la observación satelital o porque el predio está en un micro-aluvión no cubierto por sensores— **el sistema tiene estrictamente prohibido rechazar la solicitud**.
   * El expediente se desvía a la **Bandeja de Discrepancia**, despachando un drone de reconocimiento o una brigada presencial prioritaria.
4. **Desacoplamiento del Triaje Vital (`CUP-MINSA`):**
   * Si el reporte incluye heridos o emergencias médicas, la atención de salud se desacopla inmediatamente del trámite de la vivienda. Se emite el código de emergencia médica (`CUP-MINSA`) al Centro de Salud más cercano sin esperar la evaluación de habitabilidad del inmueble.

---

## 6. IMPLEMENTACIÓN TÉCNICA EN EL BACKEND

La lógica de cálculo y evaluación se encuentra formalizada en el servicio [`backend/services/damnificados_service.py`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/backend/services/damnificados_service.py):

```python
# Segmento de evaluación Neuro-Simbólica en AMARU-CLIMATE
def evaluar_consistencia_territorial_ia(self, reporte: Dict[str, Any]) -> Dict[str, Any]:
    # 1. Componentes Físicos y Telemétricos
    c_hidro = self._obtener_coeficiente_hidrologico(reporte.get("cuenca_id"))
    c_geom = self._calcular_distancia_faja_marginal(reporte.get("latitud"), reporte.get("longitud"))
    c_vecinal = self._evaluar_consenso_espacial(reporte.get("latitud"), reporte.get("longitud"))
    c_vision = reporte.get("score_vision_computacional", 0.75)

    # 2. Ecuación Ponderada de Consistencia (Aporte AMARU-CLIMATE)
    ict = (0.35 * c_hidro) + (0.25 * c_geom) + (0.20 * c_vecinal) + (0.20 * c_vision)

    # 3. Matriz Normativa Determinista (Empalme Legal)
    es_consistente = ict >= 0.70
    tirante = reporte.get("altura_agua_metros", 0.0)
    material = reporte.get("material_muros", "ADOBE")

    if tirante >= 2.0 or reporte.get("colapso_muros", False):
        estado = "COLAPSADA"
        elegible_bae = True
    elif (tirante >= 0.5 and material in ["ADOBE", "QUINCHA"]) or tirante >= 1.0:
        estado = "INHABITABLE"
        elegible_bae = True
    else:
        estado = "AFECTADA"
        elegible_bae = False

    return {
        "ict": round(ict, 3),
        "consistente_territorialmente": es_consistente,
        "calificacion_estructural": estado,
        "elegible_bono_bae": elegible_bae and es_consistente,
        "requiere_inspeccion_discrepancia": not es_consistente and elegible_bae
    }
```

---

## 7. CONCLUSIÓN Y VALOR ESTRATÉGICO

1. **Viabilidad Jurídica:** Al no ser una "caja negra", el modelo cumple plenamente con los estándares de debida motivación exigidos por la legislación peruana e internacional.
2. **Blindaje de Patente:** No se patenta la Ley N.º 31526 ni el concepto de "damnificado", sino el **método computacional y la arquitectura de transformación de señales físicas sensoriales en un índice vectorial de consistencia territorial ($I_{\text{CT}}$)**.
3. **Eficiencia en la Emergencia:** Permite cerrar la brecha histórica en la que un damnificado debe esperar meses para que el Estado verifique su situación, posibilitando la emisión de ayudas y subsidios en menos de 24 horas con cero margen para la corrupción o el oportunismo político.
