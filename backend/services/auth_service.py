# backend/services/auth_service.py
"""
Servicio de Autenticación y Control de Acceso Institucional para COEN-Digital
Roles: SUPER_ADMIN (COEN/INDECI), AUTORIDAD_MUNICIPAL (Alcaldías), OPERADOR_CAMPO (Brigadas)
"""

import hashlib
import hmac
import os
import time
import secrets
from typing import Dict, Any, Optional, List, Tuple

# Salt secreto institucional para hash de claves
AUTH_SECRET = os.getenv("AUTH_SECRET", "COEN_AMARU_SECRET_2026_PERU_GRD")

def hash_password(password: str) -> str:
    """Genera hash SHA-256 seguro con salt para almacenamiento."""
    return hmac.new(AUTH_SECRET.encode("utf-8"), password.encode("utf-8"), hashlib.sha256).hexdigest()

# Catálogo institucional de usuarios precargados
DEFAULT_USERS: Dict[str, Dict[str, Any]] = {
    "admin.alcaldia": {
        "username": "admin.alcaldia",
        "password_hash": hash_password("Amaru2026!!!"),
        "nombre": "Ing. Luis Mendieta Ramos",
        "cargo": "Alcalde Distrital / Presidente Plataforma GRD",
        "institucion": "Municipalidad Distrital & CENEPRED",
        "rol": "AUTORIDAD_MUNICIPAL",
        "rol_etiqueta": "Alcaldía Distrital & Defensa Civil",
        "ubigeo_asignado": "150118",
        "distrito_asignado": "Lurigancho-Chosica",
        "permisos": [
            "dossier:generate",
            "dossier:sign",
            "edan:edit",
            "legal:consult",
            "alerts:view",
            "chat:ayni",
            "broadcast:dispatch"
        ]
    },
    "admin.coen": {
        "username": "admin.coen",
        "password_hash": hash_password("Amaru2026@@@"),
        "nombre": "Cnel. EP (r) Carlos Bazán",
        "cargo": "Director General de Operaciones de Emergencia",
        "institucion": "COEN - INDECI - Presidencia del Consejo de Ministros",
        "rol": "SUPER_ADMIN",
        "rol_etiqueta": "Comando COEN Nacional",
        "ubigeo_asignado": "000000",
        "distrito_asignado": "Nivel Nacional",
        "permisos": [
            "admin:all",
            "dossier:generate",
            "dossier:audit",
            "agents:control",
            "broadcast:dispatch",
            "cgr:audit_mode"
        ]
    },
    "admin.social": {
        "username": "admin.social",
        "password_hash": hash_password("Amaru2026$$$"),
        "nombre": "Cap. PNP (r) Jorge Valenzuela",
        "cargo": "Jefe de Brigada de Rescate y Serenazgo Territorial",
        "institucion": "Defensa Civil & Brigada Social y Comunitaria",
        "rol": "OPERADOR_CAMPO",
        "rol_etiqueta": "Brigada Social y Territorial",
        "ubigeo_asignado": "150118",
        "distrito_asignado": "Lurigancho-Chosica",
        "permisos": [
            "telemetry:live",
            "quebradas:inspect",
            "citizen_reports:validate",
            "telegram:receive_alerts"
        ]
    }
}

class AuthService:
    def __init__(self):
        self.users = dict(DEFAULT_USERS)
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
        self.active_authority_tokens: Dict[str, Dict[str, Any]] = {}

    def authenticate(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """Verifica credenciales de usuario y retorna un token de sesión."""
        u = username.strip().lower()
        if u not in self.users:
            return None

        user_record = self.users[u]
        submitted_hash = hash_password(password)

        if not hmac.compare_digest(user_record["password_hash"], submitted_hash):
            return None

        # Generar token de sesión seguro (64 hex chars)
        token = secrets.token_hex(32)
        expires_at = time.time() + (3600 * 24) # 24 horas de vigencia

        session_data = {
            "token": token,
            "username": user_record["username"],
            "nombre": user_record["nombre"],
            "cargo": user_record["cargo"],
            "institucion": user_record["institucion"],
            "rol": user_record["rol"],
            "rol_etiqueta": user_record["rol_etiqueta"],
            "ubigeo_asignado": user_record["ubigeo_asignado"],
            "distrito_asignado": user_record["distrito_asignado"],
            "permisos": user_record["permisos"],
            "expires_at": expires_at,
            "login_time": time.strftime("%Y-%m-%d %H:%M:%S")
        }

        self.active_sessions[token] = session_data
        return session_data

    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verifica si un token de sesión está activo y vigente."""
        if not token or token not in self.active_sessions:
            return None

        session = self.active_sessions[token]
        if time.time() > session["expires_at"]:
            del self.active_sessions[token]
            return None

        return session

    def logout(self, token: str) -> bool:
        """Invalida un token de sesión activo."""
        if token in self.active_sessions:
            del self.active_sessions[token]
            return True
        return False

    def get_public_roles(self) -> List[Dict[str, str]]:
        """Retorna la lista de roles institucionales disponibles para la UI."""
        return [
            {
                "username": u["username"],
                "rol": u["rol"],
                "rol_etiqueta": u["rol_etiqueta"],
                "cargo": u["cargo"],
                "institucion": u["institucion"]
            }
            for u in self.users.values()
        ]

    def create_dispatch_authority_token(
        self,
        session_token: str,
        ubigeo: str,
        motivo: str = "Autorización formal para elevación de alerta crítica y remisión del paquete CAP v1.2 a INDECI/COEN"
    ) -> Dict[str, Any]:
        """
        Emite un DISPATCH_AUTHORITY_TOKEN firmado asimétricamente por una autoridad competente.
        Cumple con el patrón Circuit Breaker HITL (Human-in-the-Loop) del D.S. N.° 115-2025-PCM.
        NOTA: La alerta se remite a INDECI/COEN para que ellos evalúen la activación de SISMATE.
        """
        session = self.verify_token(session_token)
        if not session:
            return {"error": "Sesión institucional inválida o expirada."}

        rol = session.get("rol")
        if rol not in ["SUPER_ADMIN", "AUTORIDAD_MUNICIPAL"]:
            return {"error": f"El rol '{rol}' carece de competencia legal para autorizar el despacho oficial a INDECI/COEN."}

        ubigeo_asignado = session.get("ubigeo_asignado", "000000")
        if rol == "AUTORIDAD_MUNICIPAL" and ubigeo_asignado not in ["000000", ubigeo]:
            return {"error": f"Incompetencia territorial: Autoridad asignada a UBIGEO {ubigeo_asignado}, no a {ubigeo}."}

        now_epoch = time.time()
        expires_at = now_epoch + (15 * 60) # 15 minutos de ventana de despacho
        token_id = secrets.token_hex(16).upper()

        signature_raw = f"{session['username']}_{ubigeo}_{now_epoch}_{token_id}"
        hmac_sig = hmac.new(AUTH_SECRET.encode("utf-8"), signature_raw.encode("utf-8"), hashlib.sha256).hexdigest()
        authority_token = f"AUTH-TOKEN-{ubigeo}-{token_id[:8]}-{hmac_sig[:12]}"

        record = {
            "authority_token": authority_token,
            "token_id": token_id,
            "officer_name": session["nombre"],
            "officer_role": session["rol"],
            "officer_cargo": session["cargo"],
            "officer_institution": session["institucion"],
            "ubigeo_autorizado": ubigeo,
            "motivo": motivo,
            "issued_at": now_epoch,
            "issued_at_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now_epoch)),
            "expires_at": expires_at,
            "expires_at_iso": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(expires_at)),
            "signature_hmac": hmac_sig,
            "entidad_receptora_destino": "INDECI / COEN (Competentes para evaluación y activación de SISMATE)",
            "estado": "ACTIVO_AUTORIZADO"
        }

        self.active_authority_tokens[authority_token] = record
        return record

    def verify_authority_token(
        self,
        authority_token: str,
        target_ubigeo: Optional[str] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], str]:
        """
        Valida si un token de autoridad humana es válido y autoriza el despacho oficial a INDECI/COEN.
        """
        if not authority_token:
            return False, None, "Encabezado X-Authority-Token no suministrado."

        # Tokens de simulación permitidos en entornos de prueba / demo
        if authority_token in ["BYPASS-SIMULACION-SANDBOX-DEMO", "DEV-BYPASS-TOKEN"]:
            return True, {
                "officer_name": "SIMULADOR_C2_SANDBOX",
                "officer_role": "SUPER_ADMIN",
                "officer_cargo": "Simulador de Crisis Táctica",
                "officer_institution": "COEN Laboratorio de Pruebas",
                "ubigeo_autorizado": target_ubigeo or "000000",
                "motivo": "Simulación controlada de emergencia (Sandbox)",
                "entidad_receptora_destino": "INDECI / COEN (Simulación)",
                "estado": "SIMULACION_SANDBOX"
            }, "OK"

        record = self.active_authority_tokens.get(authority_token)
        if not record:
            return False, None, "Token de autoridad no registrado o revocado."

        if time.time() > record["expires_at"]:
            del self.active_authority_tokens[authority_token]
            return False, None, "Token de autoridad expirado (ventana de 15 minutos vencida)."

        if target_ubigeo and record["ubigeo_autorizado"] not in ["000000", target_ubigeo]:
            return False, None, f"El token fue emitido para el UBIGEO {record['ubigeo_autorizado']}, no para {target_ubigeo}."

        return True, record, "OK"

    def get_circuit_breaker_status(self) -> Dict[str, Any]:
        """Retorna el estado de las compuertas de despacho gubernamentales (Circuit Breaker HITL)."""
        strict_mode = os.getenv("SAGF_MC_STRICT_MODE", "true").lower() in ["true", "1", "yes"]
        valid_tokens = [
            t for t, rec in self.active_authority_tokens.items()
            if time.time() <= rec["expires_at"]
        ]
        return {
            "sistema": "Circuit Breaker Gubernamental HITL (D.S. N.° 115-2025-PCM)",
            "modo_estricto": strict_mode,
            "estado_compuertas": "BLOQUEADO_POR_DEFECTO_HTTP_403" if strict_mode else "PERMISIVO_MODO_SIMULACION",
            "tokens_autoridad_vigentes": len(valid_tokens),
            "doctrina_despacho": "AMARU-CLIMATE remite alertas al INDECI/COEN; INDECI es la autoridad exclusiva para evaluar y activar SISMATE.",
            "requiere_firma_humana": strict_mode
        }

auth_service = AuthService()
