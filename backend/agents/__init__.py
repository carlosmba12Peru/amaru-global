# backend/agents/__init__.py
"""
Enjambre de Agentes de Inteligencia Artificial Soberana AMARU-CLIMATE:
1. SENTINEL: Vigilancia 24/7 y Nowcasting Radar
2. TACTICAL: Comando y Control C2, Maquinaria y Logística Humanitaria
3. HISTORICAL (YACHAY): Memoria Doctrinal FEN (1983, 1998, 2017)
4. LINGUISTIC: Traducción y Despacho en Lenguas Originarias (Runasimi)
5. RENITLI: Fe Pública Pericial (Ley 29735 / MINCUL)
6. DISPATCHER: Notificaciones de Emergencia CAP v1.2 / Telegram
7. KURAQ: Gobernanza de Fuentes y Verdad de Terreno Multifuente
8. YUPAQ: Calculador e Ingeniero Científico Soberano (Tetra-Índices, Saaty AHP, Manning, Sigmoide y Radar)
"""
from agents.sentinel_agent import SentinelAgent
from agents.tactical_agent import TacticalAgent
from agents.historical_agent import HistoricalAgent, historical_agent
from agents.linguistic_agent import LinguisticAgent
from agents.renitli_agent import ReNITLIAgent
from agents.dispatcher_agent import DispatcherAgent
from agents.kuraq.kuraq_agent import KuraqAgent, kuraq_agent, CuradorAgent, agente_curador
from agents.yupaq_agent import YupaqAgent, yupaq_agent, CalculadorAgent, agente_calculador
from agents.qilqay_agent import QilqayAgent, qilqay_agent, RedactorAgent, agente_redactor
from agents.fiscalizador_agent import FiscalizadorAgent, agente_fiscalizador
from agents.comunitario_agent import ComunitarioAgent, agente_comunitario
from agents.satelital_agent import SatelitalAgent, agente_satelital

__all__ = [
    "SentinelAgent",
    "TacticalAgent",
    "HistoricalAgent",
    "historical_agent",
    "LinguisticAgent",
    "ReNITLIAgent",
    "DispatcherAgent",
    "KuraqAgent",
    "kuraq_agent",
    "CuradorAgent",
    "agente_curador",
    "YupaqAgent",
    "yupaq_agent",
    "CalculadorAgent",
    "agente_calculador",
    "QilqayAgent",
    "qilqay_agent",
    "RedactorAgent",
    "agente_redactor",
    "FiscalizadorAgent",
    "agente_fiscalizador",
    "ComunitarioAgent",
    "agente_comunitario",
    "SatelitalAgent",
    "agente_satelital",
]
