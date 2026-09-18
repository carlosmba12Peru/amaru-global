# Test district search and weather forecast
import asyncio
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.historical_data_service import historical_service
from services.meteo_service_pro import MeteoServicePro

async def main():
    print("--- 1. Probando búsqueda de 'Tarma' ---")
    results = historical_service.search_districts("tarma", limit=5)
    for r in results:
        print(f"  UBIGEO: {r['ubigeo']} | {r['distrito']} - {r['provincia']} ({r['departamento']}) | Coords: {r['lat']}, {r['lng']}")

    print("\n--- 2. Probando búsqueda de 'Chosica' ---")
    results2 = historical_service.search_districts("chosica", limit=5)
    for r in results2:
        print(f"  UBIGEO: {r['ubigeo']} | {r['distrito']} - {r['provincia']} ({r['departamento']}) | Coords: {r['lat']}, {r['lng']}")

    if results:
        tarma_ubigeo = results[0]["ubigeo"]
        print(f"\n--- 3. Probando pronóstico detallado para Tarma ({tarma_ubigeo}) ---")
        forecast = await MeteoServicePro.fetch_district_detailed_forecast(tarma_ubigeo)
        curr = forecast["current"]
        print(f"  Condiciones Actuales: {curr['temperature']}°C (Sensación {curr['apparent_temperature']}°C), {curr['weather_desc']}")
        print(f"  Viento: {curr['wind_speed_kmh']} km/h ({curr['wind_direction']} deg:{curr['wind_direction_deg']})")
        print(f"  Nubes: {curr['cloud_cover_pct']}% | Humedad: {curr['relative_humidity_pct']}% | UV: {curr['uv_index']} ({curr['uv_level']}) | Presion: {curr['pressure_hpa']} hPa")
        print(f"  CAPE: {curr['cape_j_kg']} J/kg | Suelo: {curr['soil_moisture_pct']}%")
        print(f"  Total dias pronostico: {len(forecast['days'])}")
        d0 = forecast['days'][0]
        print(f"  Hoy ({d0['day_short']} {d0['date_formatted']}): Max {d0['temp_max']} / Min {d0['temp_min']} | Lluvia: {d0['rain_mm']} mm | Viento: {d0['wind_speed_kmh']} km/h")
        print(f"    08:00 -> {d0['slots']['slot_08']['temp']}° ({d0['slots']['slot_08']['icon_type']})")
        print(f"    14:00 -> {d0['slots']['slot_14']['temp']}° ({d0['slots']['slot_14']['icon_type']})")
        print(f"    20:00 -> {d0['slots']['slot_20']['temp']}° ({d0['slots']['slot_20']['icon_type']})")
        print(f"  Total horas: {len(forecast['hours_24'])} | Fin de semana días: {len(forecast['weekend'])}")
        print("\n¡Prueba completada con éxito!")

if __name__ == "__main__":
    asyncio.run(main())
