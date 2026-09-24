# backend/agents/kuraq/connectors/__init__.py
from agents.kuraq.connectors.base_connector import BaseSourceConnector
from agents.kuraq.connectors.imarpe_bdo_connector import imarpe_bdo_connector, ImarpeBdoConnector
from agents.kuraq.connectors.enfen_connector import enfen_connector, EnfenConnector
from agents.kuraq.connectors.senamhi_radar_connector import (
    senamhi_radar_piura_connector,
    senamhi_radar_ica_connector,
    SenamhiRadarConnector
)
from agents.kuraq.connectors.elperuano_normas_connector import elperuano_connector, ElPeruanoNormasConnector
from agents.kuraq.connectors.mef_gasto_connector import mef_gasto_connector, MefGastoConnector
from agents.kuraq.connectors.minsa_dengue_connector import minsa_dengue_connector, MinsaDengueConnector
from agents.kuraq.connectors.inei_fen_connector import inei_fen_connector, IneiFenConnector
from agents.kuraq.connectors.gobpe_planes_connector import gobpe_planes_connector, GobPePlanesConnector
from agents.kuraq.connectors.senamhi_observatorio_connector import (
    senamhi_observatorio_connector,
    SenamhiObservatorioConnector
)
from agents.kuraq.connectors.open_meteo_connector import (
    open_meteo_connector,
    OpenMeteoConnector
)
