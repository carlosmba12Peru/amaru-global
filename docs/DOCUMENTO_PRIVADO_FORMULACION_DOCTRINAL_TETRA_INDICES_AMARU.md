# DOCUMENTO PRIVADO / CONFIDENCIAL COEN-DIGITAL & INDECI
## DOCTRINA TÉCNICA C2: FORMULACIÓN HIDROCINÉTICA, PROBABILÍSTICA Y MULTICRITERIO DE LOS CUATRO ÍNDICES OFICIALES AMARU-CLIMATE
### (IRCE-FEN • IPH-FEN • IPI-TRIPLE VULNERABILIDAD • ISH-AMARU-CHIRI)

**Identificador de Registro:** `C2-AMARU-DOCTRINA-TETRA-INDICES-2026/2027-DOC-03`  
**Clasificación de Seguridad:** RESERVADO / USO EXCLUSIVO COEN - INDECI - ASESORÍAS TÉCNICAS Y ALCALDÍAS  
**Fecha de Emisión Oficial:** 18 de Septiembre de 2026  
**Sistema:** AMARU-CLIMATE • Consola Doctrinal de Fórmulas & Modelos Matemáticos (`/doctrina`)  
**Marco Legal e Institucional:** Ley Nº 29664 (SINAGERD), R.J. Nº 112-2014-CENEPRED/J, D.S. Nº 124-2026-PCM y D.S. Nº 009-2021-MC (RENALIO).  
**Blindaje Criptográfico:** Protocolo SHA-256 inmutable en memoria para matrices y coeficientes canónicos.

---

## 1. RESUMEN EJECUTIVO Y DECLARACIÓN DOCTRINARIA

El presente documento establece el fundamento teórico, matemático, geotécnico, hidrocinético y operacional de la **arquitectura bi-escala y tetra-índice** de **AMARU-CLIMATE**.

Para erradicar la improvisación operativa y la dispersión analítica durante emergencias complejas por el Fenómeno El Niño (FEN) y eventos de bajas temperaturas altoandinas, el sistema articula cuatro modelos matemáticos estandarizados y complementarios:

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA MATEMÁTICA Y OPERACIONAL TETRA-ÍNDICE AMARU                        │
├─────────────────────────────────────┬──────────────────────────────────────────────────────────────────┤
│ ESCALA Y ÁMBITO                     │ MODELO MATEMÁTICO DOCTRINAL                                      │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 1. MACRO-DISTRITAL (1,891 Distritos)│ IRCE-FEN: Proceso Analítico Jerárquico Saaty AHP 4×4            │
│    Enfoque: Riesgo Compuesto FEN    │ Respaldo: R.J. 112-2014-CENEPRED/J • Consistencia CR = 0.0113   │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 2. MICRO-CUENCA (54 Quebradas)      │ IPH-FEN: Geotecnia Mohr-Coulomb + Sigmoide + Manning Modificado │
│    Enfoque: Previsión de Huaicos    │ Respaldo: Dinámica de Fluidos Hiperconcentrados + T_lag Minutos  │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 3. ASIGNACIÓN RECURSOS (1,891 Dist.)│ IPI: Matriz Cuádruple de Vulnerabilidad y Equidad Lingüística    │
│    Enfoque: Prioridad Intervención  │ Respaldo: CENEPRED (35%) + D.S. 124 (30%) + Heladas + RENALIO   │
├─────────────────────────────────────┼──────────────────────────────────────────────────────────────────┤
│ 4. AGROMETEOROLÓGICO (Altoandino)   │ ISH: Índice de Severidad de Helada (AMARU-CHIRI)                 │
│    Enfoque: Criósfera y Camélidos   │ Respaldo: Anomalía Térmica Nocturna (ΔT) + Altura > 3800 msnm   │
└─────────────────────────────────────┴──────────────────────────────────────────────────────────────────┘
```

---

## 2. ÍNDICE 01: IRCE-FEN (MACRO-DISTRITAL • MATRIZ SAATY AHP 4×4)

### 2.1. Propósito y Sustento Normativo
El **Índice de Riesgo Compuesto Específico (IRCE-FEN)** evalúa la condición de vulnerabilidad y peligro a nivel macro-distrital en los 1,891 distritos del Perú, priorizando los 893 distritos declarados bajo el **D.S. Nº 124-2026-PCM**. Su arquitectura responde a la metodología oficial de evaluación del riesgo normada en el Manual del CENEPRED (**R.J. Nº 112-2014-CENEPRED/J**).

### 2.2. Ecuación Central y Estabilización Asintótica
$$\text{IRCE} = \min\left(1.0, \frac{w_P \cdot P + w_V \cdot V + w_E \cdot E}{w_C \cdot C + 0.35}\right)$$

Donde:
* $P \in [0.0, 1.0]$: Peligro Hidrometeorológico FEN.
* $V \in [0.0, 1.0]$: Vulnerabilidad Física y Estructural (predominio de adobe, quincha o pirca en laderas).
* $E \in [0.0, 1.0]$: Exposición Demográfica y de Infraestructura en cono aluvial o faja marginal.
* $C \in [0.0, 1.0]$: Capacidad Municipal de Mitigación y Respuesta (presupuesto ejecutado, maquinaria pesada y brigadas).
* $+0.35$: Término amortiguador de estabilización asintótica que previene singularidades aritméticas cuando la capacidad local municipal es nula ($C = 0$).

### 2.3. Matriz de Juicios Pareados Saaty (4×4) y Autovector
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

### 2.4. Demostración de Consistencia Axiomática
* Autovalor principal máximo: $\lambda_{\max} = 4.0305$.
* Índice de Consistencia: $\text{CI} = \frac{\lambda_{\max} - n}{n - 1} = \frac{4.0305 - 4}{3} = 0.0102$.
* Índice Aleatorio para matriz $4\times 4$: $\text{RI} = 0.90$.
* **Ratio de Consistencia:**
  $$\text{CR} = \frac{\text{CI}}{\text{RI}} = \frac{0.0102}{0.90} = 0.0113 \le 0.10 \quad (\mathbf{APROBADO\ CON\ EXCELENCIA})$$
  Dado que $\text{CR} = 0.0113 \ll 0.10$, la matriz posee rigurosa coherencia transitiva sin sesgos contradictorios.

---

## 3. ÍNDICE 02: IPH-FEN (MICRO-QUEBRADA • MOHR-COULOMB, SIGMOIDE & MANNING)

### 3.1. Justificación Geotécnica: ¿Por qué un Modelo Lineal es Físicamente Inválido?
En hidráulica torrencial de montaña, un huaico o flujo de detritos **no es un proceso proporcional ni una regresión lineal**. El comportamiento del talud obedece a la ecuación fundamental de rotura al esfuerzo cortante de **Terzaghi y Mohr-Coulomb con Presión de Poros**:

$$\tau_f = c' + (\sigma - u) \cdot \tan(\phi')$$

Donde:
* $c'$: Cohesión efectiva del manto de detritos.
* $\sigma$: Tensión normal total ejercida por el peso del estrato geológico.
* $u$: Presión intersticial de poros de agua en el suelo.
* $\phi'$: Ángulo de fricción interna del material clástico.

**Dinámica del Colapso:**  
A medida que se acumula precipitación antecedente ($API_{72h}$), el agua satura los intersticios del suelo. Mientras la presión de poros $u$ es menor a la carga normal, el talud se mantiene estable. No obstante, al alcanzar el umbral crítico por lluvias torrenciales en cabecera, la presión $u$ iguala la tensión total ($\sigma - u \to 0$), eliminando la fricción interna. La resistencia al corte colapsa abruptamente a cero, transformando la masa sólida de ladera en un fluido plástico hiperconcentrado en pocos segundos.

### 3.2. Ecuación de Activación Sigmoidal
Para modelar matemáticamente este comportamiento de licuefacción abrupta, se formula:

$$\Phi = 0.30 \cdot C_{\text{METEO}} + 0.20 \cdot C_{\text{SUELO}} + 0.20 \cdot C_{\text{IRCE}} + 0.15 \cdot C_{\text{GEOMORF}} + 0.15 \cdot C_{\text{HIST}}$$

$$P_{\text{huaico}} = \frac{1}{1 + e^{-4.2 \cdot (\Phi - 0.68)}} \times 100\%$$

* **Punto de Inflexión Crítica ($\Phi_0 = 0.68$):** Umbral adimensional donde las fuerzas motrices superan la resistencia cortante del suelo.
* **Pendiente de Sensibilidad ($k = 4.2$):** Calibrada empíricamente con los 54 cauces críticos del país documentados en los eventos FEN 1983, 1998, 2017 y 2023.

### 3.3. Desglose Analítico de los 5 Criterios Ponderados

| Criterio | Peso | Ecuación Analítica | Fuente Telemétrica Primaria | Fundamento Físico |
| :--- | :---: | :--- | :--- | :--- |
| **$C_{\text{METEO}}$** | **30%** | $0.60 \cdot \min\left(1.5, \frac{I_{\text{hora}}}{U_{\text{hora}}}\right) + 0.40 \cdot \min\left(1.5, \frac{P_{24h}}{U_{24h}}\right)$ | Open-Meteo Pro / ECMWF IFS 9km / SENAMHI | Intensidad en cabecera frente al umbral crítico histórico de rotura de la quebrada. |
| **$C_{\text{SUELO}}$** | **20%** | $\min\left(1.0, \frac{\text{API}_{72h}}{50\text{ mm}}\right)$ | API antecedente & Humedad edáfica 28–100 cm | Saturación del perfil profundo. A capacidad de campo, el suelo no infiltra y la escorrentía es del 100%. |
| **$C_{\text{IRCE}}$** | **20%** | $\text{Score IRCE-FEN}_{\text{Distrital}} \in [0.0, 1.0]$ | Matriz Saaty AHP 4×4 / D.S. 124-2026-PCM | Acoplamiento macro-territorial. Transfiere vulnerabilidad física y capacidad del municipio receptor. |
| **$C_{\text{GEOMORF}}$** | **15%** | $\min\left(1.0, \frac{\text{Pendiente}\%}{22\%}\right)$ | DEM SRTM 30m / INGEMMET | Pendientes $> 22\%$ otorgan la energía cinética para arrastrar bloques de gran tonelaje. |
| **$C_{\text{HIST}}$** | **15%** | $\min\left(1.0, \frac{\text{Activaciones Históricas}}{4}\right)$ | Catálogo Pericial FEN (1983, 1998, 2017, 2023) | Memoria física de reactivación torrencial documentada en los 4 grandes episodios FEN del Perú. |

### 3.4. Hidrocinética de Manning & Retardo Aluvial ($T_{\text{lag}}$)
* **Velocidad de Flujo Hiperconcentrado (Chow 1959; Takahashi 2007):**
  $$V = \frac{1}{n} \cdot R_h^{2/3} \cdot S_0^{1/2}$$
  * Coeficiente de rugosidad $n = 0.065$: Calibrado para cauces montañosos escarpados con alta carga de detritos y bloques.
  * Radio hidráulico $R_h = 1.2\text{ m}$: Calado medio representativo de la onda aluvial frontal en los conos costeros y andinos.
  * Gradiente longitudinal $S_0 = \frac{\text{Pendiente}\%}{100}$.

* **Ventana Táctica Dorada de Evacuación ($T_{\text{lag}}$ en minutos):**
  $$T_{\text{lag}} = \left[ \frac{L_{\text{cauce}}}{V \cdot 3600} \right] \times 60\text{ minutos}$$
  Indica el lapso exacto entre el desprendimiento en cuenca alta y el impacto en las viviendas del cono de deyección. Permite a las brigadas de Defensa Civil evacuar a la población antes de que la onda destructiva alcance la faja marginal.

### 3.5. Semáforo Táctico Operacional COEN / INDECI (4 Niveles)
* **CRÍTICO ROJO ($IPH \ge 85.0\%$):** Evacuación táctica inmediata. Sirenas comunitarias, corte preventivo de energía eléctrica y cierre de badenes.
* **ALTO NARANJA ($65.0\% \le IPH < 85.0\%$):** Prealerta táctica. Evacuación preventiva de albergues y despliegue de brigadas de rescate.
* **MEDIO AMARILLO ($35.0\% \le IPH < 65.0\%$):** Vigilancia hidrometeorológica continua, seguimiento de satélite GOES-16 e inspección de diques y mallas dinámicas.
* **BAJO VERDE ($IPH < 35.0\%$):** Monitoreo basal ordinario sin requerimiento de intervención operativa.

### 3.6. Reglas Físicas Duras (Anti-Dilución) & Blindaje Criptográfico SHA-256
* **Disparo por Umbral Directo:** Si la lluvia horaria o de 24h excede el umbral crítico en cabecera, el sistema fuerza $IPH \ge 85.0\%$ de manera instantánea, impidiendo que otros factores diluyan el peligro.
* **Concurrencia Suelo Saturado:** Si hay lluvia sobre el umbral y suelo saturado ($API \ge 30\text{ mm}$), el sistema fija el piso en $IPH \ge 88.0\%$.
* **Condición Seca Absoluta:** Si no hay precipitación horaria ni acumulada en 24h, el sistema restringe el resultado a $IPH \le 12.0\%$.
* **Blindaje Criptográfico SHA-256:** Los pesos y coeficientes canónicos poseen hash SHA-256 auditado en memoria, garantizando que ninguna orden política o error altere los cálculos durante una crisis.

---

## 4. ÍNDICE 03: IPI (ÍNDICE DE PRIORIDAD DE INTERVENCIÓN • 1,891 DISTRITOS)

### 4.1. Propósito Doctrinal
El **IPI** resuelve el sesgo histórico centralista, asignando prioridad territorial objetiva para la distribución de maquinaria pesada, bonos de emergencia y combustible:

$$\text{IPI} = (0.35 \cdot P_{\text{CENEPRED}}) + (0.30 \cdot E_{\text{DS124}}) + (0.15 \cdot H_{\text{AMARU}}) + (0.20 \cdot B_{\text{RENALIO}})$$

* **Escala Normalizada:** $0.0$ a $100.0$ puntos para los 1,891 distritos del Perú.
* **$P_{\text{CENEPRED}}$ (35%):** Peligro certificado por CENEPRED (Muy Alto: 100 pts, Alto: 70 pts, Medio: 40 pts, Bajo: 10 pts).
* **$E_{\text{DS124}}$ (30%):** Habilitante legal oficial bajo el D.S. Nº 124-2026-PCM (En D.S. 124: 100 pts, No declarado: 0 pts).
* **$H_{\text{AMARU}}$ (15%):** Vulnerabilidad por heladas severas altoandinas (Zona Crítica: 100 pts, No Crítico: 0 pts).
* **$B_{\text{RENALIO}}$ (20%):** Brecha etnolingüística oficial (Lengua Originaria / Quechua / Aymara / Amazónica: 100 pts, Castellano urbano: 25 pts). Una alerta en castellano para una comunidad quechua-hablante incrementa exponencialmente su vulnerabilidad.

---

## 5. ÍNDICE 04: ISH (ÍNDICE DE SEVERIDAD DE HELADA • AMARU-CHIRI)

### 5.1. Formulación Agrometeorológica Altoandina
Destinado a la protección de comunidades pastoriles y camélidos sudamericanos en zonas sobre los 3,800 msnm:

$$\text{ISH} = (0.40 \cdot \Delta T) + (0.25 \cdot \text{Alt}) + (0.20 \cdot \text{Soc}) + (0.15 \cdot \text{Pec})$$

* **$\Delta T$ (40%):** Anomalía térmica nocturna proyectada respecto al umbral histórico bajo cero ($<-8^\circ\text{C}$).
* **$\text{Alt}$ (25%):** Factor altitudinal normalizado ($>3,800\text{ msnm}$).
* **$\text{Soc}$ (20%):** Índice de población rural vulnerable (niños menores de 5 años y adultos mayores de 65 años sin calefacción pasiva).
* **$\text{Pec}$ (15%):** Carga pecuaria de alpacas, llamas y ovinos dependientes de bofedales expuestos a congelamiento del forraje.

---

## 6. SÍNTESIS DE COHERENCIA SISTÉMICA

Los cuatro índices operan de manera sincronizada y complementaria:
1. **Macro-decisión Legal:** El **IRCE-FEN** fundamenta la declaratoria de emergencia y habilita la Contratación Directa ante la Contraloría.
2. **Priorización Presupuestal:** El **IPI** ordena los 1,891 distritos para destinar los fondos del FONDES y maquinaria del MTC/Vivienda.
3. **Alerta Táctica Local:** El **IPH-FEN** vigila en tiempo real las 54 quebradas críticas y calcula los minutos de evacuación con la física de Manning.
4. **Resiliencia Pecuaria:** El **ISH** salvaguarda la vida y economía del Altiplano y serranías del sur del país.

---

**REGISTRO OFICIAL:**  
Documento archivado en el Repositorio Doctrinal Clasificado de AMARU-CLIMATE.  
*COEN-DIGITAL • DIRECCIÓN DE DOCTRINA C2 Y GOBERNANZA CLIMÁTICA*
