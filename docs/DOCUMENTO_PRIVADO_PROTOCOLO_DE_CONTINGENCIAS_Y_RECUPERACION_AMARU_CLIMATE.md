# DOCUMENTO PRIVADO: PROTOCOLO DE CONTINGENCIAS, RECUPERACIÓN Y CONTINUIDAD OPERATIVA
## SISTEMA AMARU-CLIMATE / COEN DIGITAL PERÚ
### MANUAL DE RESCATE ANTE FALLOS DE MODELAMIENTO, COLAPSOS DE ENTORNO O IMPREVISTOS CRÍTICOS

**Código Documental:** DOC-PRIV-CONTINGENCIAS-AMARU-2026-V1  
**Fecha de Emisión:** Septiembre 2026  
**Clasificación:** PRIVADO / CONFIDENCIAL / USO INTERNO DE OPERACIONES Y DESARROLLO  
**Punto de Restauración Base:** Tag Git `v1.0.0-stable` (Commit `f05ae3d`)  
**Snapshot Físico de Emergencia:** `backups/amaru_climate_snapshot_20260918_013300.zip` (47.8 MB)  

---

## 1. OBJETIVO DEL PROTOCOLO

Este documento establece las directivas técnicas de **recuperación ante desastres (Disaster Recovery)** y **gestión de imprevistos** para la plataforma AMARU-CLIMATE. Su propósito es garantizar que cualquier fallo en la formulación de nuevos modelos climáticos, refactorizaciones de software o corrupción de dependencias pueda ser neutralizado en **menos de 3 minutos**, restableciendo el sistema al 100% de su capacidad operativa (COEN Nacional, COEN Municipal y COEN Social).

---

## 2. INVENTARIO DE ESTADOS ESTABLES PROTEGIDOS

El sistema cuenta con una triple barrera de contención contra fallos:

| Nivel de Protección | Mecanismo | Ubicación / Identificador | Tiempo de Recuperación |
| :--- | :--- | :--- | :--- |
| **Nivel 1: Snapshot Git** | Tag inmutable en historial | `v1.0.0-stable` | < 3 segundos |
| **Nivel 2: Script Automatizado** | Ejecutable PowerShell | `.\scripts\restaurar_version_estable.ps1` | < 10 segundos |
| **Nivel 3: Respaldo ZIP Físico** | Paquete comprimido autocontenido | `backups/amaru_climate_snapshot_20260918_013300.zip` | < 1 minuto |
| **Nivel 4: Datos Históricos Base** | JSON Consolidado 1,891 Distritos | `data/distritos_memoria_historica_fen.json` | Respaldado en Git y ZIP |

---

## 3. PROTOCOLOS DE ACCIÓN RÁPIDA SEGÚN TIPO DE IMPREVISTO

### CASO A: Fallo en Modelamiento Matemático o Error de Código en Backend/Frontend
* **Síntoma:** Uvicorn arroja error `SyntaxError`, `ValueError`, o Next.js no compila debido a cambios experimentales en algoritmos o componentes.
* **Procedimiento de Rescate Inmediato:**
  ```powershell
  # Opción Directa (Git CLI):
  git reset --hard v1.0.0-stable
  git clean -fd

  # O mediante el script guiado:
  powershell -ExecutionPolicy Bypass -File .\scripts\restaurar_version_estable.ps1
  ```
* **Resultado:** Todo el código vuelve inmediatamente al estado funcional validado.

---

### CASO B: Error de Caché o Ruptura de Módulos Webpack en Next.js
* **Síntoma:** La consola del navegador muestra `Server Error: Cannot find module './vendor-chunks/...'` o la pantalla queda en blanco.
* **Causa Raíz:** Colisión en la caché interna de compilación de Next.js (`.next/`).
* **Procedimiento de Rescate:**
  ```powershell
  # 1. Detener el servidor frontend (Ctrl + C en la terminal)
  # 2. Purgar la caché de compilación:
  cd frontend
  Remove-Item -Recurse -Force .next
  
  # 3. Reiniciar en modo limpio:
  npm run dev
  ```
* **Tiempo estimado:** 20 segundos. No requiere reinstalar paquetes (`node_modules` permanece intacto).

---

### CASO C: Corrupción del Entorno Virtual de Python (`.venv`)
* **Síntoma:** Python no reconoce librerías instaladas (`fastapi`, `uvicorn`, `httpx`, `pandas`, `pydantic`).
* **Procedimiento de Reconstrucción Rápida:**
  ```powershell
  cd backend
  # Eliminar entorno dañado
  Remove-Item -Recurse -Force .venv
  
  # Crear nuevo entorno e instalar dependencias declaradas
  python -m venv .venv
  .\.venv\Scripts\Activate.ps1
  pip install --upgrade pip
  pip install -r requirements.txt
  
  # Arrancar backend
  python -m uvicorn main:app --reload --port 8000
  ```

---

### CASO D: Corrupción Accidental del Catálogo de Datos Históricos
* **Síntoma:** El endpoint `/api/historical/distrito/{ubigeo}` devuelve `HTTP 500` o JSON malformado.
* **Procedimiento de Restauración:**
  ```powershell
  # Restaurar exclusivamente los archivos de datos sin tocar el código:
  git checkout v1.0.0-stable -- data/distritos_memoria_historica_fen.json
  git checkout v1.0.0-stable -- data/distritos_emergencia_ds_124_2026_pcm.json
  ```
* **Reconstrucción desde Fuentes Oficiales:** Si se requiere regenerar el JSON desde cero utilizando los compendios de CAF, INDECI, OPS, MINEDU y MINAG-OIA:
  ```powershell
  cd backend
  .\.venv\Scripts\python.exe scripts/build_historical_district_memory.py
  ```

---

### CASO E: Pérdida Catastrófica del Workspace o Daño en Disco
* **Síntoma:** La carpeta de trabajo fue eliminada por error o corrompida.
* **Procedimiento de Rescate:**
  1. Localizar el archivo más reciente en la carpeta `backups/`:
     `backups/amaru_climate_snapshot_20260918_013300.zip`.
  2. Descomprimir el contenido en una carpeta nueva:
     ```powershell
     Expand-Archive -Path .\backups\amaru_climate_snapshot_20260918_013300.zip -DestinationPath .\Lab4_Recuperado
     ```
  3. Reinstalar dependencias de frontend y backend en menos de 2 minutos.

---

## 4. METODOLOGÍA DE DESARROLLO SEGURO PARA NUEVOS MODELAMIENTOS (BRANCHING PATTERN)

Para evitar activar contingencias en el futuro, todo nuevo modelamiento debe desarrollarse bajo el siguiente ciclo cerrado:

```
[ Rama Principal: main (v1.0.0-stable) ] ── (Siempre operativa en puertos 8000 y 3000)
             │
             ├──► git checkout -b feature/modelamiento-convectivo
             │         │
             │         ├── Experimentos y pruebas matemáticas
             │         │
             │         ├── Si es EXITOSO  ──► git checkout main && git merge feature/...
             │         │
             │         └── Si FALLA / CAE ──► git checkout main && git branch -D feature/...
```

### Comandos Clave del Ciclo Seguro:
```powershell
# 1. Crear rama de experimentación aislada
git checkout -b feature/nuevo-modelo

# 2. Trabajar libremente en los algoritmos...

# 3A. Si el resultado es exitoso y estable:
git add .
git commit -m "feat: nuevo modelo climatico validado"
git checkout main
git merge feature/nuevo-modelo
powershell -ExecutionPolicy Bypass -File .\scripts\crear_backup_snapshot.ps1

# 3B. Si el modelo colapsa o produce anomalías irrecuperables:
git checkout main
git branch -D feature/nuevo-modelo
# El sistema vuelve a quedar intacto de inmediato.
```

---

## 5. LISTA DE VERIFICACIÓN (SANITY CHECK) TRAS UNA RECUPERACIÓN

Tras ejecutar cualquier procedimiento de recuperación, verificar que los siguientes servicios respondan con código `HTTP 200`:

1. **Backend Health:** `http://localhost:8000/` o `http://localhost:8000/docs`
2. **Memoria Histórica Distrital:**  
   `http://localhost:8000/api/historical/distrito/150118` (Lurigancho-Chosica)
3. **Inspector Climático Open-Meteo:**  
   `http://localhost:8000/api/meteo/distrito/150118`
4. **Frontend C2 Nacional:** `http://localhost:3000/`
5. **Frontend Consola Histórica:** `http://localhost:3000/historico`
6. **Frontend Dashboard Distrital:** `http://localhost:3000/dashboard/150118`

---

## 6. TELÉFONOS Y CONTACTOS CRÍTICOS DEL PROYECTO

En caso de incidente mayor en simulacro o despliegue oficial:
* **Repositorio de Seguridad:** `C:\Users\Usuario Libre\Documents\recuperacion de USB 14 de setiembre\curso-gcp-google-adk-01\Lab4`
* **Directorio de Respaldos:** `Lab4/backups/`
* **Scripts de Emergencia:** `Lab4/scripts/restaurar_version_estable.ps1`
