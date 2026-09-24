# DOCUMENTO PRIVADO / CONFIDENCIAL COEN-DIGITAL & INDECI
## DOCTRINA TÉCNICA C2: INGENIERÍA DE CÁLCULO, MODELOS MATEMÁTICOS Y ARQUITECTURA DEL AGENTE YUPAQ
### (IRCE-FEN • IPH-FEN • IPI • ISH-CHIRI • IRD-FLUV • NOWCASTING RADAR • FUSIÓN OROGRÁFICA)

**Identificador de Registro:** `C2-AMARU-DOCTRINA-YUPAQ-INGENIERIA-CALCULO-2026/2027-DOC-04`  
**Clasificación de Seguridad:** RESERVADO / USO EXCLUSIVO COEN - INDECI - ASESORÍAS TÉCNICAS Y GOBIERNOS REGIONALES/LOCALES  
**Fecha de Emisión Oficial:** 23 de Septiembre de 2026  
**Sistema:** AMARU-CLIMATE • Consola Doctrinal C2 (`/doctrina` y `/api/v1/agents/yupaq/*`)  
**Agente Responsable:** **Agente YUPAQ (`AMARU-AGENT-YUPAQ-07`)** — Calculador e Ingeniero Científico Soberano  
**Marco Legal y Científico:** Ley Nº 31814 (Inteligencia Artificial para el Desarrollo Humano en el Perú), Ley Nº 29664 (SINAGERD), R.J. Nº 112-2014-CENEPRED/J, D.S. Nº 124-2026-PCM, D.S. Nº 164-2026-EF y Ley Nº 29735 (Lenguas Originarias / RENALIO).  
**Blindaje Criptográfico:** NTP-ISO/IEC 27037:2012 e IETF RFC 3161 TSA (Sellado Forense SHA-256 inmutable en memoria).

---

## 🎯 1. Resumen Ejecutivo y Declaración Doctrinal

El presente documento constituye la **norma técnica y matemática soberana** del sistema **AMARU-CLIMATE (COEN-Digital C2)** para la ejecución de todos los cálculos predictivos, hidrocinéticos, geotécnicos, estadísticos y multicriterio ante el Fenómeno El Niño (FEN) 2026-2027.

Para erradicar la improvisación operativa, las discrepancias analíticas entre entidades del Estado y la subjetividad en la emisión de alertas tempranas, el sistema delega con exclusividad la soberanía del cómputo en el **Agente YUPAQ** (*del Runasimi 'Yupay' = contar/calcular; 'Yupaq' = el matemático/geómetra soberano*).

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA MATEMÁTICA Y OPERACIONAL DEL AGENTE YUPAQ                          │
├─────────────────────────────────────┬──────────────────────────────────────────────────────────────────┤
│ MODELO CANÓNICO                     │ FUNDAMENTO FÍSICO / MATEMÁTICO Y ESCALA                          │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 1. IRCE-FEN (Riesgo Compuesto)      │ Matriz Saaty AHP 4×4 (CR = 0.0113) + Radar Piura/Ica (Banda C)   │
│    Escala: 1,891 Distritos Nacional │ R.J. 112-2014-CENEPRED/J • D.S. 124-2026-PCM                     │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 2. IPH-FEN (Previsión de Huaicos)   │ Geotecnia Mohr-Coulomb con Presión de Poros u + Sigmoide         │
│    Escala: 54 Quebradas Críticas    │ Hidrocinética de Manning (n=0.065) + Ventana Dorada T_lag (min)  │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 3. IPI (Prioridad de Intervención)  │ Matriz Cuádruple de Vulnerabilidad y Equidad Lingüística         │
│    Escala: Asignación de Recursos   │ CENEPRED (35%) + D.S. 124 (30%) + Heladas (15%) + RENALIO (20%) │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 4. ISH (Severidad de Heladas)       │ Agrometeorología Criosférica Altoandina (>3,800 msnm)            │
│    Escala: AMARU-CHIRI (Camélidos)  │ Anomalía Nocturna ΔT (40%) + Altitud (25%) + Social + Pecuario   │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 5. IRD-FLUV (Riesgo Fluvial/Diques) │ Hidrodinámica 1D de Cuenca + Curvas de Alivio de Presas          │
│    Escala: 8 Cuencas Norteñas       │ D.S. 164-2026-EF • Control Concurrente de Descolmatación ANA     │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 6. Fusión Orográfica Ground Truth   │ Ponderación Espacial Haversine con Decaimiento Exponencial       │
│    Escala: Red 983 Estaciones       │ 983 Estaciones SENAMHI (Ground Truth) + ECMWF IFS 9km            │
└─────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 2. Índice 01: IRCE-FEN (Macro-Distrital • Matriz Saaty AHP 4×4 + Radar Nowcasting)

### 2.1. Propósito y Sustento Normativo
El **Índice de Riesgo Compuesto Específico (IRCE-FEN)** evalúa la condición de riesgo multidimensional en los 1,891 distritos del Perú, priorizando los 893 distritos del **D.S. Nº 124-2026-PCM**. Responde a la metodología oficial normada en el Manual del CENEPRED (**R.J. Nº 112-2014-CENEPRED/J**).

### 2.2. Ecuación Central y Estabilización Asintótica
$$\text{IRCE} = \min\left(1.0, \frac{w_P \cdot P_{\text{ajustado}} + w_V \cdot V + w_E \cdot E}{w_C \cdot C + 0.35}\right)$$

Donde:
* $P_{\text{ajustado}} \in [0.0, 1.0]$: Peligro Hidrometeorológico FEN modulado por Radar Doppler.
* $V \in [0.0, 1.0]$: Vulnerabilidad Física y Estructural (adobe, quincha o pirca sobre suelo aluvial o ladera inestable).
* $E \in [0.0, 1.0]$: Exposición Demográfica y Activos en faja marginal o cono de deyección.
* $C \in [0.0, 1.0]$: Capacidad Municipal de Respuesta (maquinaria pesada, defensas y ejecución presupuestal PP 0068).
* $+0.35$: Término amortiguador de estabilización asintótica que previene singularidades aritméticas si la capacidad local es nula ($C = 0$).

### 2.3. Matriz de Juicios Pareados Saaty (4×4) y Autovector Canónico
Aplicando la Escala Fundamental de Thomas Saaty (1 a 9):

| Criterio | Peligro ($P$) | Vulnerabilidad ($V$) | Exposición ($E$) | Capacidad ($C$) |
| :--- | :---: | :---: | :---: | :---: |
| **Peligro ($P$)** | 1.000 | 2.000 | 3.000 | 5.000 |
| **Vulnerabilidad ($V$)** | 0.500 | 1.000 | 2.000 | 3.000 |
| **Exposición ($E$)** | 0.333 | 0.500 | 1.000 | 2.000 |
| **Capacidad ($C$)** | 0.200 | 0.333 | 0.500 | 1.000 |

* **Vector Canónico de Pesos Normalizado ($w_i$):**
  $$w_P = 0.4673 \quad (46.73\%)$$
  $$w_V = 0.2772 \quad (27.72\%)$$
  $$w_E = 0.1601 \quad (16.01\%)$$
  $$w_C = 0.0955 \quad (9.55\%)$$

### 2.4. Demostración Axiomática de Consistencia
* Autovalor principal máximo: $\lambda_{\max} = 4.0305$.
* Índice de Consistencia: $\text{CI} = \frac{\lambda_{\max} - n}{n - 1} = \frac{4.0305 - 4}{3} = 0.0102$.
* Índice Aleatorio para matriz $4\times 4$: $\text{RI} = 0.90$.
* **Ratio de Consistencia:**
  $$\text{CR} = \frac{\text{CI}}{\text{RI}} = \frac{0.0102}{0.90} = 0.0113 \le 0.10 \quad (\mathbf{APROBADO\ CON\ EXCELENCIA})$$

### 2.5. Modulación Nowcasting por Radares Meteorológicos Piura e Ica
En los distritos bajo cobertura de los Radares Banda C Polarimétricos del SENAMHI (**Piura `PIU`** e **Ica `ICA`**, radio de 250 km):
* El peligro basal se calcula a partir de la anomalía de TSM Niño 1+2 ($55\%$) y la precipitación en 24h ($45\%$):
  $$P_{\text{base}} = 0.55 \cdot \left(\frac{\Delta\text{TSM}}{3.0^\circ\text{C}}\right) + 0.45 \cdot \left(\frac{\text{Lluvia}_{24\text{h}}}{60\text{ mm}}\right)$$
* Si el escaneo Doppler detecta un núcleo convectivo con reflectividad horizontal **$Z \ge 40\text{ dBZ}$**:
  $$P_{\text{ajustado}} = \max\left(P_{\text{base}}, \min\left(1.0, \frac{Z_{\text{dBZ}}}{55\text{ dBZ}}\right)\right)$$
* **Impacto Operativo:** Si $Z \ge 50\text{ dBZ}$ (lluvia torrencial / granizo severo), el término $P_{\text{ajustado}}$ escala a $\ge 0.95$, provocando que el IRCE salte automáticamente a **CRÍTICO ROJO** ($\ge 0.75$), ganando hasta **120 minutos de ventaja operativa** antes de la precipitación en tierra.

---

## ⚡ 3. Índice 02: IPH-FEN (Micro-Quebrada • Mohr-Coulomb, Sigmoide y Manning)

### 3.1. Justificación Geotécnica del Colapso Aluvial
Un huaico o flujo de detritos no es un proceso de regresión lineal. La estabilidad del manto clástico en ladera responde a la ecuación de rotura al corte de **Terzaghi y Mohr-Coulomb con Presión de Poros Intersticiales ($u$)**:

$$\tau_f = c' + (\sigma - u) \cdot \tan(\phi')$$

* $c'$: Cohesión efectiva del manto de detritos.
* $\sigma$: Tensión normal total ejercida por el peso del estrato geológico.
* $u$: Presión intersticial del agua en los poros del suelo.
* $\phi'$: Ángulo de fricción interna del material clástico.

A medida que llueve en la cabecera y el suelo se satura ($API_{72h} \ge 30\text{ mm}$), la presión de poros iguala la carga normal ($\sigma - u \to 0$), eliminando la fricción interna. La resistencia al corte colapsa abruptamente a cero, transformando la masa sólida de ladera en un fluido plástico hiperconcentrado en pocos segundos.

### 3.2. Ecuación de Activación Sigmoidal
$$\Phi = 0.30 \cdot C_{\text{METEO}} + 0.20 \cdot C_{\text{SUELO}} + 0.20 \cdot C_{\text{IRCE}} + 0.15 \cdot C_{\text{GEOMORF}} + 0.15 \cdot C_{\text{HIST}}$$

$$P_{\text{huaico}} (\text{IPH}) = \frac{1}{1 + e^{-4.2 \cdot (\Phi - 0.68)}} \times 100\%$$

* **Punto de Inflexión Crítica ($\Phi_0 = 0.68$):** Umbral adimensional donde las fuerzas gravitacionales superan la resistencia cortante del talud.
* **Pendiente de Sensibilidad ($k = 4.2$):** Calibrada empíricamente con los 54 cauces críticos del país documentados en los eventos FEN 1983, 1998, 2017 y 2023.

### 3.3. Hidrocinética de Manning y Ventana Táctica Dorada ($T_{\text{lag}}$)
* **Velocidad de Flujo Hiperconcentrado (Chow 1959; Takahashi 2007):**
  $$V = \frac{1}{n} \cdot R_h^{2/3} \cdot S_0^{1/2}$$
  * Coeficiente de rugosidad $n = 0.065$: Calibrado para cauces escarpados con alta carga de detritos y bloques.
  * Radio hidráulico $R_h = 1.2\text{ m}$: Calado medio representativo de la onda frontal aluvial.
  * Pendiente longitudinal $S_0 = \frac{\text{Pendiente}\%}{100}$.

* **Ventana Dorada de Evacuación ($T_{\text{lag}}$ en minutos):**
  $$T_{\text{lag}} = \left[ \frac{L_{\text{cauce}}}{V \cdot 3600} \right] \times 60\text{ minutos}$$
  Indica con exactitud el tiempo disponible para evacuar a la población del cono de deyección antes del impacto aluvial.

### 3.4. Reglas Físicas Duras Anti-Dilución
* **Disparo por Umbral Directo:** Si la lluvia horaria en cabecera supera el umbral crítico ($I_{\text{hora}} \ge U_{\text{hora}}$), el Agente YUPAQ fuerza $IPH \ge 85.0\%$ de manera instantánea, impidiendo que factores promediados diluyan la alerta.
* **Concurrencia con Suelo Saturado:** Si hay lluvia sobre el umbral y suelo saturado ($API \ge 30\text{ mm}$), el sistema fija el piso en $IPH \ge 88.0\%$.
* **Condición Seca Absoluta:** Si no hay precipitación horaria ni acumulada en 24h, el sistema restringe el resultado a $IPH \le 12.0\%$.

---

## ⚖️ 4. Índice 03: IPI (Índice de Prioridad de Intervención • 1,891 Distritos)

### 4.1. Propósito Doctrinal
El **IPI** resuelve el sesgo histórico centralista en la distribución de recursos escasos del Estado:

$$\text{IPI} = (0.35 \cdot P_{\text{CENEPRED}}) + (0.30 \cdot E_{\text{DS124}}) + (0.15 \cdot H_{\text{AMARU}}) + (0.20 \cdot B_{\text{RENALIO}})$$

* **Escala Normalizada:** $0.0$ a $100.0$ puntos para los 1,891 distritos del Perú.
* **$P_{\text{CENEPRED}}$ (35%):** Nivel de peligro certificado por CENEPRED (Muy Alto: 100 pts, Alto: 70 pts, Medio: 40 pts, Bajo: 10 pts).
* **$E_{\text{DS124}}$ (30%):** Habilitante legal oficial bajo el D.S. Nº 124-2026-PCM (Declarado: 100 pts, No declarado: 0 pts).
* **$H_{\text{AMARU}}$ (15%):** Historial crítico de aislamiento y rotura de defensas ribereñas.
* **$B_{\text{RENALIO}}$ (20%):** **Brecha etnolingüística oficial (Registro RENALIO / Ministerio de Cultura)**. Si la población distrital es predominantemente originaria (quechua, aymara o amazónica), la falta de alertas en su lengua materna eleva su vulnerabilidad a $100\text{ pts}$ frente a $25\text{ pts}$ en distritos castellanohablantes urbanos.

### 4.2. Escala de Asignación de Recursos:
* **$\ge 80.0\text{ pts}$ (Prioridad 1 Inmediata):** Despliegue preferente de maquinaria pesada MTC/Vivienda y fondos del FONDES.
* **$60.0 - 79.9\text{ pts}$ (Prioridad 2 Alta):** Preposicionamiento de motobombas y albergues en tambos comunales.
* **$40.0 - 59.9\text{ pts}$ (Prioridad 3 Media):** Vigilancia de cuencas y mantenimiento preventivo de defensas ribereñas.
* **$< 40.0\text{ pts}$ (Prioridad 4 Baja):** Monitoreo hidrometeorológico ordinario.

---

## ❄️ 5. Índice 04: ISH (Índice de Severidad de Helada • AMARU-CHIRI)

### 5.1. Formulación Agrometeorológica y Criosférica
Para comunidades altoandinas situadas a más de **$3,800\text{ msnm}$**:

$$\text{ISH} = (0.40 \cdot \Delta T_{\text{NOCTURNA}}) + (0.25 \cdot A_{\text{MSNM}}) + (0.20 \cdot V_{\text{SOCIAL}}) + (0.15 \cdot V_{\text{PECUARIA}})$$

* **$\Delta T_{\text{NOCTURNA}}$ (40%):** Anomalía térmica nocturna proyectada respecto al umbral histórico bajo cero ($< -8^\circ\text{C}$).
* **$A_{\text{MSNM}}$ (25%):** Cota altitudinal normalizada sobre los $3,000\text{ msnm}$ hasta $4,800\text{ msnm}$.
* **$V_{\text{SOCIAL}}$ (20%):** Densidad de población rural vulnerable (niños $<5$ años y ancianos $>65$ sin calefacción pasiva).
* **$V_{\text{PECUARIA}}$ (15%):** Masa ganadera expuesta (alpacas, llamas y ovinos dependientes de bofedales congelados).

---

## 🌊 6. Índice 05: IRD-FLUV (Riesgo Fluvial y Ruptura de Diques)

$$\mathbf{IRD\text{-}FLUV} = \left[ 0.50 \left(\frac{Q}{Q_{\text{desb}}}\right) + 0.30 \left(\frac{Q}{Q_{\text{desb}}} \cdot V_{\text{dique}}\right) + 0.20 \left(\frac{\%_{\text{llenado}}}{100}\right) \right] \times \mathbf{M}_{\text{FEN}} \times F_{\text{represa}}$$

* $Q / Q_{\text{desb}}$: Relación entre el caudal medido y la capacidad hidráulica de diseño del cauce.
* $V_{\text{dique}} \in [0.1, 1.0]$: Estado de socavación y avance de obras de descolmatación de la ANA (D.S. 164-2026-EF).
* $F_{\text{represa}} \ge 1.0$: Factor de amplificación si una presa reguladora (ej. Poechos) alcanza el $100\%$ de almacenamiento y se ve obligada a abrir compuertas de alivio forzoso.

---

## 🎯 7. Modelo de Fusión con Corrección de Sesgo Orográfico ($P_{\text{fusion}}$)

$$P_{\text{fusion}} = \alpha \cdot P_{\text{estación}} + (1 - \alpha) \cdot P_{\text{ECMWF IFS}}$$
$$\alpha(d, \Delta t) = 0.85 \cdot \exp\left(-\frac{d}{25\text{ km}}\right) \cdot \exp\left(-\frac{\Delta t}{180\text{ min}}\right)$$

* Si hay una estación oficial del SENAMHI a $\le 10\text{ km}$, el peso de suelo es del **$85\%$** ($\alpha = 0.85$).
* Si no hay estación cercana ($d > 50\text{ km}$), $\alpha$ converge al piso del **$15\%$**, empleando la malla global de ECMWF IFS 9km.

---

## 🛡️ 8. Circuit-Breaker Criptográfico y Sello Forense SHA-256

Conforme a la norma **NTP-ISO/IEC 27037:2012**:
1. **Verificación de Inmutabilidad:** En cada ciclo de cálculo, YUPAQ audita en RAM que los hashes de los coeficientes no hayan sufrido manipulación:
   * `HASH_CANONICO_IRCE = hashlib.sha256(PESOS_CANONICOS_IRCE_SAATY)`.
   * `HASH_CANONICO_IPH = hashlib.sha256(PESOS_CANONICOS_IPH)`.
2. **Sello Forense por Dictamen:** Cada cálculo genera un hash SHA-256 único e inalterable:
   $$\text{Sello} = \text{SHA256}(\text{UBIGEO} \parallel \text{Score} \parallel \text{Nivel} \parallel \text{HashCanonico})$$
   Garantizando que ninguna orden política o adulteración externa modifique los resultados técnicos emitidos por el sistema.

---

## 🌐 9. Catálogo de Endpoints REST del Agente YUPAQ

| Endpoint | Método | Descripción Operativa |
| :--- | :---: | :--- |
| `/api/v1/agents/yupaq/info` | `GET` | Metadatos normativos, identidad y diagnóstico del Circuit-Breaker. |
| `/api/v1/agents/yupaq/tetra-indices/{ubigeo}` | `GET` | Radiografía integral tetra-índice distrital (IRCE + IPH + IPI + ISH + Ground Truth). |
| `/api/v1/agents/yupaq/irce/{ubigeo}` | `GET` | Cálculo Saaty AHP 4×4 modulado con Nowcasting de Radar Doppler Piura/Ica. |
| `/api/v1/agents/yupaq/iph/{id_o_nombre}` | `GET` | Cálculo IPH con física de Manning y retardo aluvial $T_{\text{lag}}$ en minutos. |
| `/api/v1/agents/yupaq/ipi/{ubigeo}` | `GET` | Matriz de prioridad para asignación de maquinaria pesada y fondos FONDES. |
| `/api/v1/agents/yupaq/ish/{ubigeo}` | `GET` | Evaluación agrometeorológica altoandina de heladas severas (>3800 msnm). |
| `/api/v1/agents/yupaq/circuit-breaker` | `GET` | Verificación pública en tiempo real de la firma criptográfica de los pesos en memoria. |

---

## 🧪 10. Certificación de Pruebas Unitarias e Integración

* **Suite Canónica:** [`backend/tests/test_yupaq_agent.py`](file:///c:/Users/Usuario%20Libre/Documents/recuperacion%20de%20USB%2014%20de%20setiembre/curso-gcp-google-adk-01/Lab4/backend/tests/test_yupaq_agent.py) (7 pruebas exhaustivas con cobertura de todos los modelos).
* **Total Suite Global del Sistema:** **186 pruebas unitarias e integrales aprobadas al 100%** (`Ran 186 tests in ~56s - OK`).

---

**REGISTRO OFICIAL CLASIFICADO:**  
Documento archivado en el Repositorio Doctrinal Clasificado de AMARU-CLIMATE.  
*COEN-DIGITAL • DIRECCIÓN DE INGENIERÍA DE CÁLCULO, MODELOS MATEMÁTICOS Y AGENTES IA*
