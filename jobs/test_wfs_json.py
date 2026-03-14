import requests
import json

base_url = "https://portal.csdi.gov.hk/server/services/common/td_rcd_1638928986276_39755/MapServer/WFSServer"
params = {
    "service": "WFS",
    "version": "2.0.0",
    "request": "GetFeature",
    "typeNames": "csdi:DTAD_TS_POLE_PT",
    "count": 1,
    "outputFormat": "GEOJSON" 
}

# Try GEOJSON first
print(f"Testing outputFormat={params['outputFormat']}...")
try:
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        try:
            data = response.json()
            if 'type' in data and data['type'] == 'FeatureCollection':
                print("Success! outputFormat=GEOJSON works.")
            else:
                 print("Response is JSON but not FeatureCollection.")
        except json.JSONDecodeError:
            print("Response is not JSON.")
            print(response.text[:200])
    else:
        print(f"HTTP Error: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

# Try application/json if specific test needed, but let's see.
