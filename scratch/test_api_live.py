import urllib.request
import json

base_api = "https://servicios.senamhi.gob.pe/api"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json, text/plain, */*',
    'Origin': 'https://observatorio.senamhi.gob.pe',
    'Referer': 'https://observatorio.senamhi.gob.pe/'
}

def test_endpoint(path, params=None):
    url = f"{base_api}/{path}"
    if params:
        url += "?" + urllib.parse.urlencode(params)
    print(f"\n==========================================")
    print(f"Testing: {url}")
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read().decode('utf-8')
            parsed = json.loads(data)
            return parsed
    except Exception as e:
        print("Error:", e)
        return None

res = test_endpoint("researchers/stations")
if res and res.get("status"):
    stations = res.get("data", [])
    print(f"Total Stations available: {len(stations)}")
    print("\nSample Station Record:")
    print(json.dumps(stations[0], indent=2, ensure_ascii=False))

    # Let's find an automatic meteorological station with lots of recent data
    auto_met_stations = [s for s in stations if s.get("typeId") == "M" and "AUTOMATICA" in str(s.get("typeDescription", ""))]
    print(f"Total Automatic Meteorological Stations: {len(auto_met_stations)}")
    
    target_station = auto_met_stations[0] if auto_met_stations else stations[0]
    st_id = target_station.get("id")
    print(f"\nTesting with Station ID: {st_id} ({target_station.get('name')})")

    # 1. Metadata
    meta = test_endpoint(f"researchers/stations/{st_id}/metadata")
    if meta:
        print("Metadata keys/summary:", json.dumps(meta.get("data", meta), indent=2, ensure_ascii=False)[:600])

    # 2. Periods
    periods = test_endpoint(f"researchers/stations/{st_id}/periods")
    if periods:
        p_data = periods.get("data", [])
        print(f"Available Periods: {len(p_data)} periods.")
        if len(p_data) > 0:
            print("Latest 3 periods:", p_data[:3])
            latest_period = p_data[0].get("id") or p_data[0].get("yearMonth")
            
            # 3. Data for latest period
            data_res = test_endpoint(f"researchers/stations/{st_id}/data", {"yearMonth": latest_period})
            if data_res:
                readings = data_res.get("data", [])
                print(f"Readings returned for period {latest_period}: {len(readings)} records.")
                if len(readings) > 0:
                    print("Sample Reading:", json.dumps(readings[0], indent=2, ensure_ascii=False))

    # 4. Time series
    ts = test_endpoint(f"researchers/stations/{st_id}/time-series")
    if ts:
        ts_data = ts.get("data", {})
        print("Time series keys:", list(ts_data.keys()) if isinstance(ts_data, dict) else len(ts_data))
        print("Time series sample:", json.dumps(ts_data, indent=2, ensure_ascii=False)[:500])
