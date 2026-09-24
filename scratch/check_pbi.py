import urllib.request
import json

tenant_id = "1b18d83b-d15f-416a-8586-68b70a1464ca"
resource_key = "31e8586b-f722-4019-aa38-00980375c872"

routing_url = f"https://api.powerbi.com/public/routing/cluster/{tenant_id}"
req = urllib.request.Request(
    routing_url,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "X-PowerBI-ResourceKey": resource_key
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Routing response:", res)
        cluster_uri = res.get("FixedClusterUri")
        
        # Now call modelsAndExploration
        exp_url = f"{cluster_uri}/public/reports/{resource_key}/modelsAndExploration?preferReadOnlySession=true"
        print("Calling:", exp_url)
        req2 = urllib.request.Request(
            exp_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "X-PowerBI-ResourceKey": resource_key,
                "Accept": "application/json"
            }
        )
        with urllib.request.urlopen(req2) as resp2:
            data = json.loads(resp2.read().decode('utf-8'))
            print("Exploration keys:", list(data.keys()))
            exploration = data.get("exploration", {})
            print("Report Name:", exploration.get("name"))
            print("Sections:", [s.get("displayName") for s in exploration.get("sections", [])])
except Exception as e:
    print("Error:", e)
