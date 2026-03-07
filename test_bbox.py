# CartoDB Positron URL: https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png

import requests

base_url = "https://portal.csdi.gov.hk/server/services/common/td_rcd_1638928986276_39755/MapServer/WFSServer"

# Hong Kong approximately: 
# minx (west): 113.8, miny (south): 22.1
# maxx (east): 114.4, maxy (north): 22.6

# bbox format for WFS 2.0: minLat,minLong,maxLat,maxLong (EPSG:4326 usually follows axis order)
# Let's try standard bottom-left, top-right logic but check axis order.
# EPSG:4326 in OGC usually means Lat, Lon.
bbox = "22.2,114.1,22.3,114.2" # A small slice

params = {
    "service": "WFS",
    "version": "2.0.0",
    "request": "GetFeature",
    "typeNames": "csdi:DTAD_TS_POLE_PT",
    "outputFormat": "GEOJSON",
    "bbox": bbox,
    "count": 10
}

print(f"Testing BBOX={bbox}...")
try:
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        data = response.json()
        print(f"Features found: {len(data.get('features', []))}")
    else:
        print(f"HTTP Error: {response.status_code}")
        print(response.text[:200])
except Exception as e:
    print(f"Error: {e}")
