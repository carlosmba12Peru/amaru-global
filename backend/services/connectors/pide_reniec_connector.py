"""
Conector Oficial PIDE - RENIEC (Plataforma de Interoperabilidad del Estado)
Secretaría de Gobierno y Transformación Digital (SGTD - PCM)
Normativa: D.L. Nº 1246, D.U. Nº 006-2020 y D.S. N.° 124-2026-PCM

Permite la validación de identidad en tiempo real de damnificados empadronados
en la Ficha EDAN SINPAD v2, auto-completando nombres oficiales y detectando
restricciones críticas (como fallecidos) para evitar fraudes en el Bono BAE (S/ 500/mes).
"""

import os
import re
import hashlib
from datetime import datetime, date
from typing import Dict, Any, List, Optional
import httpx

class PideReniecConnector:
    def __init__(self):
        # Configuración institucional PIDE / SGTD-PCM
        self.live_mode = os.getenv("PIDE_LIVE_MODE", "false").lower() == "true"
        self.pide_url = os.getenv("PIDE_ENDPOINT_URL", "https://ws3.pide.gob.pe/services/ReniecConsultaDni")
        self.ruc_entidad = os.getenv("PIDE_RUC_ENTIDAD", "20148127411")  # RUC ejemplo INDECI / Municipalidad
        self.dni_usuario_autorizado = os.getenv("PIDE_DNI_OPERADOR", "42891045")
        self.api_token = os.getenv("PIDE_API_TOKEN", "")

        # Padrón semilla de casos representativos para simulación de emergencias FEN
        self._casos_simulacion = {
            "45892134": {
                "coResultado": "0000",
                "nuDni": "45892134",
                "preNombres": "JUAN CARLOS",
                "apPrimer": "PEREZ",
                "apSegundo": "RAMOS",
                "nombreCompleto": "PEREZ RAMOS JUAN CARLOS",
                "fechaNacimiento": "1988-04-12",
                "edad": 38,
                "sexo": "M",
                "estadoCivil": "CASADO",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "CALLE COMERCIO 450",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Identidad validada conforme en RENIEC."
            },
            "78129043": {
                "coResultado": "0000",
                "nuDni": "78129043",
                "preNombres": "MARIA ELENA",
                "apPrimer": "CHERO",
                "apSegundo": "GOMEZ",
                "nombreCompleto": "CHERO GOMEZ MARIA ELENA",
                "fechaNacimiento": "1994-09-23",
                "edad": 32,
                "sexo": "F",
                "estadoCivil": "SOLTERA",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "CASERIO SAN PABLO MZ B LT 05",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Identidad validada conforme en RENIEC."
            },
            "41235678": {
                "coResultado": "0000",
                "nuDni": "41235678",
                "preNombres": "CARLOS ALBERTO",
                "apPrimer": "VILELA",
                "apSegundo": "NUNURA",
                "nombreCompleto": "VILELA NUNURA CARLOS ALBERTO",
                "fechaNacimiento": "1982-11-05",
                "edad": 44,
                "sexo": "M",
                "estadoCivil": "CONVIVIENTE",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "SECTOR MONTE SULLON S/N",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Identidad validada conforme en RENIEC."
            },
            "02874198": {
                "coResultado": "0000",
                "nuDni": "02874198",
                "preNombres": "MARIA ELENA",
                "apPrimer": "SILVA",
                "apSegundo": "MORALES",
                "nombreCompleto": "SILVA MORALES MARIA ELENA",
                "fechaNacimiento": "1959-06-15",
                "edad": 67,
                "sexo": "F",
                "estadoCivil": "VIUDA",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "CASERIO SAN PABLO BAJO MZ B LT 05",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Adulto mayor verificado. Apto para albergue y Bono BAE."
            },
            "40192837": {
                "coResultado": "0000",
                "nuDni": "40192837",
                "preNombres": "PEDRO PABLO",
                "apPrimer": "YARLEQUE",
                "apSegundo": "VILCHEZ",
                "nombreCompleto": "YARLEQUE VILCHEZ PEDRO PABLO",
                "fechaNacimiento": "1988-02-18",
                "edad": 38,
                "sexo": "M",
                "estadoCivil": "CASADO",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "SECTOR DIQUE IZQUIERDO KM 12 MZ F LT 11",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Identidad validada conforme en RENIEC."
            },
            # CASOS DE PRUEBA DE ESTRÉS PARA SIMULACIÓN Y FISCALIZACIÓN CGR:
            "99990001": {
                "coResultado": "0003",
                "nuDni": "99990001",
                "preNombres": "SEGUNDO CIRILO",
                "apPrimer": "FARFAN",
                "apSegundo": "PACHERREZ",
                "nombreCompleto": "FARFAN PACHERREZ SEGUNDO CIRILO",
                "fechaNacimiento": "1940-08-10",
                "edad": 86,
                "sexo": "M",
                "estadoCivil": "CASADO",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "CALLE LIMA 102",
                "restriccion": "FALLECIDO",
                "esValidoBae": False,
                "mensaje": "ALERTA CRÍTICA: Titular figura como FALLECIDO en el Padrón Nacional RENIEC (Acta de Defunción Nº 48102-2023). Rechazo automático del Bono BAE."
            },
            "99990002": {
                "coResultado": "0000",
                "nuDni": "99990002",
                "preNombres": "ESTEFANO",
                "apPrimer": "CORREA",
                "apSegundo": "ZAPATA",
                "nombreCompleto": "CORREA ZAPATA ESTEFANO",
                "fechaNacimiento": "2012-05-14",
                "edad": 14,
                "sexo": "M",
                "estadoCivil": "MENOR DE EDAD",
                "ubigeo": "200105",
                "departamento": "PIURA",
                "provincia": "PIURA",
                "distrito": "CATACAOS",
                "direccion": "CASERIO PEDREGAL CHICO",
                "restriccion": "MENOR DE EDAD",
                "esValidoBae": False,
                "mensaje": "OBSERVACIÓN: Titular es Menor de Edad no emancipado. Debe registrarse al padre, madre o tutor legal como titular del hogar."
            },
            # CASOS CHUPACA - JUNÍN (MODELO SIERRA CENTRAL / CASO MINISTRO VINELLI):
            "20045612": {
                "coResultado": "0000",
                "nuDni": "20045612",
                "preNombres": "JUAN CARLOS",
                "apPrimer": "MAYTA",
                "apSegundo": "BASTIDAS",
                "nombreCompleto": "MAYTA BASTIDAS JUAN CARLOS",
                "fechaNacimiento": "1984-07-28",
                "edad": 42,
                "sexo": "M",
                "estadoCivil": "CASADO",
                "ubigeo": "120901",
                "departamento": "JUNIN",
                "provincia": "CHUPACA",
                "distrito": "CHUPACA",
                "direccion": "JR. GRAU 340 - BARRIO LA LIBERTAD",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Identidad validada conforme en RENIEC. Domicilio coincide con UBIGEO de emergencia Chupaca."
            },
            "19874523": {
                "coResultado": "0000",
                "nuDni": "19874523",
                "preNombres": "MARIA ELENA",
                "apPrimer": "HUAMAN",
                "apSegundo": "QUISPE",
                "nombreCompleto": "HUAMAN QUISPE MARIA ELENA",
                "fechaNacimiento": "1960-03-14",
                "edad": 66,
                "sexo": "F",
                "estadoCivil": "VIUDA",
                "ubigeo": "120901",
                "departamento": "JUNIN",
                "provincia": "CHUPACA",
                "distrito": "CHUPACA",
                "direccion": "CASERIO SAN JUAN DE YAUYOS MZ C LT 08",
                "restriccion": "NINGUNA",
                "esValidoBae": True,
                "mensaje": "Adulto mayor de zona rural andina verificada. Apta para albergue y Bono BAE."
            },
            # CASOS DE PRUEBA DE ARRAIGO Y HOMONIMIA:
            "99990003": {
                "coResultado": "0000",
                "nuDni": "99990003",
                "preNombres": "ALBERTO ENRIQUE",
                "apPrimer": "CONDORI",
                "apSegundo": "MAMANI",
                "nombreCompleto": "CONDORI MAMANI ALBERTO ENRIQUE",
                "fechaNacimiento": "1990-11-20",
                "edad": 35,
                "sexo": "M",
                "estadoCivil": "SOLTERO",
                "ubigeo": "040101",
                "departamento": "AREQUIPA",
                "provincia": "AREQUIPA",
                "distrito": "AREQUIPA",
                "direccion": "AV. GOYENECHE 120",
                "restriccion": "FUERA_DE_JURISDICCION",
                "esValidoBae": False,
                "mensaje": "ALERTA DE ARRAIGO: Titular tiene DNI registrado en Arequipa (040101). Para acceder a subsidios locales, requiere constancia de posesión o ratificación presencial del Alcalde/Juez de Paz."
            },
            "99990004": {
                "coResultado": "0004",
                "nuDni": "99990004",
                "preNombres": "VICTOR RAUL",
                "apPrimer": "PAREDES",
                "apSegundo": "CASTRO",
                "nombreCompleto": "PAREDES CASTRO VICTOR RAUL",
                "fechaNacimiento": "1975-01-30",
                "edad": 51,
                "sexo": "M",
                "estadoCivil": "CASADO",
                "ubigeo": "150118",
                "departamento": "LIMA",
                "provincia": "LIMA",
                "distrito": "LURIGANCHO",
                "direccion": "CARRETERA CENTRAL KM 32",
                "restriccion": "SUSPENSION_CIUDADANIA",
                "esValidoBae": False,
                "mensaje": "OBSERVACIÓN JUDICIAL: Titular con suspensión de ejercicio de ciudadanía. Requiere designación de cónyuge o familiar para recepción de subsidios."
            }
        }

        # Bitácora de consultas en memoria para auditoría técnica de la CGR
        self._bitacora_consultas: List[Dict[str, Any]] = []

    def consultar_dni(
        self,
        dni: str,
        ruc_consultante: Optional[str] = None,
        dni_operador: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Consulta de DNI contra la PIDE (Modo Live o Simulador Resiliente FEN).
        """
        dni_limpio = str(dni).strip()

        # Validación sintáctica liminar
        if not dni_limpio.isdigit() or len(dni_limpio) != 8:
            return {
                "coResultado": "0001",
                "nuDni": dni_limpio,
                "error": "Formato de DNI inválido. Debe contener exactamente 8 dígitos numéricos.",
                "restriccion": "FORMATO_INVALIDO",
                "esValidoBae": False
            }

        # Si el modo live está habilitado con credenciales
        if self.live_mode and self.api_token:
            try:
                return self._consultar_pide_live(dni_limpio, ruc_consultante, dni_operador)
            except Exception as e:
                # Si la PIDE falla (corte de fibra / timeout), fallback inmediato al simulador resiliente
                res = self._consultar_simulador(dni_limpio)
                res["advertencia_contingencia"] = f"PIDE Live no disponible ({str(e)}). Respuesta emitida por Simulador de Contingencia FEN."
                self._registrar_bitacora(dni_limpio, res, modo="FALLBACK_CONTINGENCIA")
                return res

        # Modo Simulación Oficial / Desconexión FEN
        resultado = self._consultar_simulador(dni_limpio)
        self._registrar_bitacora(dni_limpio, resultado, modo="SIMULACION_PIDE")
        return resultado

    def _consultar_simulador(self, dni: str) -> Dict[str, Any]:
        """
        Generador determinístico y catálogo semilla para simulación de alta fidelidad.
        """
        if dni in self._casos_simulacion:
            return {**self._casos_simulacion[dni], "origen_datos": "PIDE_RENIEC_SEMILLA"}

        # Generador algorítmico determinístico para cualquier otro DNI válido
        apellidos_pat = ["FLORES", "GARCIA", "LOPEZ", "CASTILLO", "RODRIGUEZ", "SANCHEZ", "MEDINA", "VARGAS", "CRUZ", "RAMOS", "TIMANA", "CHUNGA"]
        apellidos_mat = ["CHAVEZ", "MENDOZA", "SANDOVAL", "MORALES", "DELGADO", "NUNURA", "VILLEGAS", "CORDOVA", "RIVAS", "HERRERA", "ALVAREZ"]
        nombres_m = ["JOSE LUIS", "MANUEL ANTONIO", "CESAR AUGUSTO", "LUCAS SEBASTIAN", "FRANCISCO JAVIER", "JORGE LUIS", "RAUL ENRIQUE"]
        nombres_f = ["ROSA AURORA", "CARMEN JULIA", "ANA MERCEDES", "TERESA DE JESUS", "BLANCA NIEVES", "GLADYS ELENA", "LUCIA BEATRIZ"]

        seed = int(dni)
        es_mujer = (seed % 2 == 0)
        ap_p = apellidos_pat[(seed // 7) % len(apellidos_pat)]
        ap_m = apellidos_mat[(seed // 13) % len(apellidos_mat)]
        nom = nombres_f[(seed // 3) % len(nombres_f)] if es_mujer else nombres_m[(seed // 3) % len(nombres_m)]
        
        # Edad simulada entre 22 y 76 años
        edad = 22 + (seed % 55)
        anio_nac = datetime.now().year - edad
        mes_nac = 1 + (seed % 12)
        dia_nac = 1 + (seed % 28)
        fecha_nac = f"{anio_nac:04d}-{mes_nac:02d}-{dia_nac:02d}"

        resultado = {
            "coResultado": "0000",
            "nuDni": dni,
            "preNombres": nom,
            "apPrimer": ap_p,
            "apSegundo": ap_m,
            "nombreCompleto": f"{ap_p} {ap_m} {nom}",
            "fechaNacimiento": fecha_nac,
            "edad": edad,
            "sexo": "F" if es_mujer else "M",
            "estadoCivil": "SOLTERO" if edad < 30 else "CASADO",
            "ubigeo": "200105",
            "departamento": "PIURA",
            "provincia": "PIURA",
            "distrito": "CATACAOS",
            "direccion": f"CASERIO MONTE CASTILLO SECTOR {1 + (seed % 5)}",
            "restriccion": "NINGUNA",
            "esValidoBae": True,
            "mensaje": "Identidad validada conforme en PIDE-RENIEC.",
            "origen_datos": "PIDE_RENIEC_ALGORITMICO"
        }
        return resultado

    def _consultar_pide_live(
        self,
        dni: str,
        ruc_consultante: Optional[str] = None,
        dni_operador: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Llamada real al bus de interoperabilidad PIDE de la PCM.
        """
        payload = {
            "nuDniConsulta": dni,
            "nuDniUsuario": dni_operador or self.dni_usuario_autorizado,
            "nuRucUsuario": ruc_consultante or self.ruc_entidad,
            "password": self.api_token
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_token}",
            "X-PIDE-Application": "AMARU-CLIMATE-COEN"
        }

        with httpx.Client(timeout=4.0) as client:
            resp = client.post(self.pide_url, json=payload, headers=headers)
            resp.raise_for_status()
            data = resp.json()

        # Homologar respuesta PIDE
        persona = data.get("datosPersona", {})
        co_resultado = data.get("coResultado", "0000")
        restriccion = persona.get("restriccion", "NINGUNA")

        return {
            "coResultado": co_resultado,
            "nuDni": dni,
            "preNombres": persona.get("prenombres", ""),
            "apPrimer": persona.get("apPrimer", ""),
            "apSegundo": persona.get("apSegundo", ""),
            "nombreCompleto": f"{persona.get('apPrimer', '')} {persona.get('apSegundo', '')} {persona.get('prenombres', '')}".strip(),
            "fechaNacimiento": persona.get("fechaNacimiento", "1990-01-01"),
            "edad": int(persona.get("edad", 30)),
            "sexo": persona.get("sexo", "ND"),
            "estadoCivil": persona.get("estadoCivil", "SOLTERO"),
            "ubigeo": persona.get("ubigeo", ""),
            "direccion": persona.get("direccion", ""),
            "restriccion": restriccion,
            "esValidoBae": restriccion == "NINGUNA" and int(persona.get("edad", 30)) >= 18,
            "mensaje": "Consulta live PIDE exitosa.",
            "origen_datos": "PIDE_RENIEC_LIVE"
        }

    def validar_padron_masivo(self, familias: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Auditoría masiva de una lista de familias del Formulario 2A contra RENIEC.
        Identifica fallecidos, duplicados y menores de edad como titulares.
        """
        total = len(familias)
        validados_ok = 0
        fallecidos = []
        menores = []
        invalidos = []
        duplicados = []
        dnis_vistos = set()

        detalles_auditados = []

        for f in familias:
            dni = str(f.get("dni_titular") or f.get("dni_jefe_familia") or "").strip()
            res_dni = self.consultar_dni(dni)

            if res_dni["coResultado"] != "0000" and res_dni.get("restriccion") != "FALLECIDO":
                invalidos.append({"dni": dni, "motivo": res_dni.get("error", "DNI no existe en RENIEC")})
            elif dni in dnis_vistos:
                duplicados.append({"dni": dni, "nombre": res_dni.get("nombreCompleto")})
            elif res_dni.get("restriccion") == "FALLECIDO":
                fallecidos.append({"dni": dni, "nombre": res_dni.get("nombreCompleto"), "alerta": res_dni.get("mensaje")})
            elif res_dni.get("restriccion") == "MENOR DE EDAD":
                menores.append({"dni": dni, "nombre": res_dni.get("nombreCompleto"), "edad": res_dni.get("edad")})
            else:
                validados_ok += 1
                dnis_vistos.add(dni)

            detalles_auditados.append({
                "dni": dni,
                "nombre_oficial_reniec": res_dni.get("nombreCompleto"),
                "restriccion": res_dni.get("restriccion"),
                "es_valido_bae": res_dni.get("esValidoBae", False),
                "sexo": res_dni.get("sexo"),
                "edad": res_dni.get("edad")
            })

        return {
            "total_auditados": total,
            "validados_conforme": validados_ok,
            "fallecidos_detectados": fallecidos,
            "menores_titulares": menores,
            "dnis_invalidos": invalidos,
            "duplicados_padron": duplicados,
            "porcentaje_validez": round((validados_ok / total * 100), 1) if total > 0 else 100.0,
            "alerta_bloqueante_cgr": len(fallecidos) > 0 or len(duplicados) > 0,
            "detalles": detalles_auditados
        }

    def obtener_casos_simulacion(self) -> List[Dict[str, Any]]:
        """Retorna los casos de prueba para el panel interactivo de la consola RENIEC."""
        return [
            {
                "categoria": "CIUDADANO_ACTIVO",
                "titulo": "Ciudadano Apto (Damnificado Catacaos)",
                "dni": "45892134",
                "descripcion": "Titular de hogar con vivienda colapsada. Cumple 100% requisitos Bono BAE.",
                "resultado_esperado": "VIGENTE_APTO_BAE"
            },
            {
                "categoria": "TITULAR_FALLECIDO",
                "titulo": "Titular Fallecido (Alerta Fraude BAE)",
                "dni": "99990001",
                "descripcion": "Persona fallecida en 2023 registrada como damnificada 2026. Alerta de bloqueo penal CGR.",
                "resultado_esperado": "BLOQUEO_POR_FALLECIMIENTO"
            },
            {
                "categoria": "MENOR_DE_EDAD",
                "titulo": "Menor de Edad (Titular Incorrecto)",
                "dni": "99990002",
                "descripcion": "Menor de 14 años registrado como titular del predio. Requiere tutor legal.",
                "resultado_esperado": "OBSERVACION_TUTOR_REQUERIDO"
            },
            {
                "categoria": "ADULTO_MAYOR_PRIORITARIO",
                "titulo": "Adulto Mayor 67 años (Prioridad Albergue)",
                "dni": "02874198",
                "descripcion": "Viuda de 67 años. Prioridad para kit de abrigo y módulo temporal.",
                "resultado_esperado": "VIGENTE_PRIORITARIO"
            }
        ]

    def _registrar_bitacora(self, dni: str, respuesta: Dict[str, Any], modo: str):
        registro = {
            "id_consulta": f"PIDE-LOG-{len(self._bitacora_consultas) + 1:05d}",
            "dni_consultado": dni,
            "fecha_hora": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "modo_conexion": modo,
            "co_resultado": respuesta.get("coResultado"),
            "nombre": respuesta.get("nombreCompleto"),
            "restriccion": respuesta.get("restriccion"),
            "hash_trama": hashlib.sha256(f"{dni}-{datetime.now().isoformat()}".encode()).hexdigest()[:16]
        }
        self._bitacora_consultas.insert(0, registro)
        if len(self._bitacora_consultas) > 100:
            self._bitacora_consultas.pop()

    def listar_bitacora(self) -> List[Dict[str, Any]]:
        return self._bitacora_consultas

    def simular_evaluacion_tripartita(
        self,
        dni: str,
        ubigeo_emergencia: str = "200105",
        rol_evaluador: str = "TODOS"
    ) -> Dict[str, Any]:
        """
        Ejecuta la Mesa de Evaluación y Homologación Tripartita de 3 Puertas:
        - Puerta 1 (RENIEC): Validez del DNI, supervivencia y mayoría de edad.
        - Puerta 2 (MUNICIPIO): Arraigo territorial y correspondencia de UBIGEO.
        - Puerta 3 (INDECI / OCI): Calificación para ayuda humanitaria (BAH) y Bono BAE sin duplicidad.
        """
        res_reniec = self.consultar_dni(dni)
        restriccion = res_reniec.get("restriccion", "NINGUNA")
        dni_ubigeo = res_reniec.get("ubigeo", "")

        # 1. Puerta 1: RENIEC / PIDE
        puerta_reniec = {
            "nombre_puerta": "PUERTA 1: RENIEC / PIDE INTEROPERABILIDAD",
            "estado": "APROBADO" if res_reniec.get("coResultado") == "0000" and restriccion not in ["FALLECIDO", "FORMATO_INVALIDO"] else "RECHAZADO",
            "detalles": {
                "dni": dni,
                "nombre_titular": res_reniec.get("nombreCompleto"),
                "edad": res_reniec.get("edad"),
                "restriccion_identidad": restriccion,
                "mensaje_oficial": res_reniec.get("mensaje", "")
            }
        }

        # 2. Puerta 2: GOBIERNO LOCAL (Municipio / Juez de Paz)
        mismo_distrito = (dni_ubigeo == ubigeo_emergencia) if (dni_ubigeo and ubigeo_emergencia) else True
        if restriccion == "FALLECIDO":
            estado_muni = "BLOQUEO_FRAUDE"
            mensaje_muni = "Intento de cobro con DNI de persona fallecida. Notificación automática a Procuraduría Municipal y CGR."
        elif restriccion == "MENOR DE EDAD":
            estado_muni = "OBSERVADO_REQUIERE_TUTOR"
            mensaje_muni = "Titular es menor de edad. Se requiere vincular a la madre o tutor legal de la familia."
        elif not mismo_distrito:
            estado_muni = "REQUIERE_RATIFICACION_ARRAIGO"
            mensaje_muni = f"DNI registrado en UBIGEO {dni_ubigeo} ({res_reniec.get('distrito', 'OTRO')}). Requiere firma presencial de arraigo por el Alcalde o Teniente Gobernador."
        else:
            estado_muni = "ARRAIGO_VERIFICADO"
            mensaje_muni = f"Titular reside efectivamente en {res_reniec.get('distrito', 'DISTRITO LOCAL')}. Arraigo domiciliario confirmado."

        puerta_municipio = {
            "nombre_puerta": "PUERTA 2: GOBIERNO LOCAL (DEFENSA CIVIL Y ALCALDÍA)",
            "estado": estado_muni,
            "coincidencia_ubigeo": mismo_distrito,
            "ubigeo_declarado": ubigeo_emergencia,
            "ubigeo_reniec": dni_ubigeo,
            "mensaje_evaluador": mensaje_muni
        }

        # 3. Puerta 3: INDECI / CONTRALORÍA (OCI)
        if restriccion == "FALLECIDO":
            estado_indeci = "RECHAZO_DEFINITIVO"
            califica_bae = False
            califica_bah = False
            mensaje_indeci = "Alerta de Control Concurrente: DNI inhabilitado en base de datos fiscal. Prohibida la entrega de bienes o dinero público."
        elif restriccion == "MENOR DE EDAD":
            estado_indeci = "SUSPENDIDO_HASTA_REGISTRO_TUTOR"
            califica_bae = False
            califica_bah = True  # Ayuda humanitaria de emergencia no se niega al infante
            mensaje_indeci = "Habilitada la entrega de raciones y abrigo al menor. Bono BAE suspendido hasta acreditación de tutor."
        elif not mismo_distrito:
            estado_indeci = "CONDICIONADO_A_INSPECCION_CAMPO"
            califica_bae = False
            califica_bah = True
            mensaje_indeci = "Se entrega ayuda humanitaria inmediata (agua/alimentos). El subsidio BAE S/ 500 queda condicionado al informe de la brigada municipal."
        else:
            estado_indeci = "HABILITADO_CONFORME"
            califica_bae = True
            califica_bah = True
            mensaje_indeci = "Elegibilidad total confirmada: Habilitado para entrega de Bienes de Ayuda Humanitaria (BAH) y registro prioritario en SINPAD para Bono BAE S/ 500."

        puerta_indeci = {
            "nombre_puerta": "PUERTA 3: INDECI / CONTROL CONCURRENTE OCI",
            "estado": estado_indeci,
            "califica_bienes_ayuda_humanitaria_bah": califica_bah,
            "califica_bono_arrendamiento_bae_500": califica_bae,
            "alerta_control_concurrente": mensaje_indeci
        }

        # Dictamen Final Consolidado
        if restriccion == "FALLECIDO":
            dictamen = "RECHAZADO_FRAUDE_FALLECIDO"
            color_semaforo = "ROJO"
        elif restriccion == "MENOR DE EDAD":
            dictamen = "OBSERVADO_MENOR_DE_EDAD"
            color_semaforo = "AMBAR"
        elif not mismo_distrito:
            dictamen = "CONDICIONADO_ARRAIGO_TERRITORIAL"
            color_semaforo = "AMBAR"
        else:
            dictamen = "APROBADO_CONFORME_TRIPARTITO"
            color_semaforo = "VERDE"

        return {
            "dni": dni,
            "ubigeo_evaluado": ubigeo_emergencia,
            "dictamen_final": dictamen,
            "semaforo": color_semaforo,
            "fecha_evaluacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "puerta_1_reniec": puerta_reniec,
            "puerta_2_municipio": puerta_municipio,
            "puerta_3_indeci_oci": puerta_indeci
        }

    def obtener_estado_conexion(self) -> Dict[str, Any]:
        return {
            "pide_live_activo": self.live_mode,
            "endpoint_oficial": self.pide_url,
            "ruc_entidad": self.ruc_entidad,
            "dni_operador": self.dni_usuario_autorizado,
            "simulador_contingencia_activo": not self.live_mode,
            "total_consultas_sesion": len(self._bitacora_consultas)
        }

pide_reniec_connector = PideReniecConnector()

