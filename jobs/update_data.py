import os
import time
import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
WFS_BASE_URL = "https://portal.csdi.gov.hk/server/services/common/td_rcd_1638928986276_39755/MapServer/WFSServer"
MAX_AGE_DAYS = 7
LAYERS = [
    "csdi:DTAD_PS_ANNO",
    "csdi:DTAD_TS_ABV_ANNO",
    "csdi:DTAD_RD_MARK_ANNO",
    "csdi:DTAD_DS_POLE_PT",
    "csdi:DTAD_PS_POLE_PT",
    "csdi:DTAD_TRAFFIC_LIGHT_PT",
    "csdi:DTAD_RD_MARK_SYM_PT",
    "csdi:DTAD_TS_ABV_PT",
    "csdi:DTAD_TS_POLE_PT",
    "csdi:DTAD_GIPOLE_PT",
    "csdi:DTAD_MISC_PT",
    "csdi:DTAD_CYC_PT",
    "csdi:UNKNOWN_LINE",
    "csdi:DTAD_DS_POLE_LINE",
    "csdi:DTAD_LV38_LINE",
    "csdi:DTAD_DS_PLATE_LINE",
    "csdi:DTAD_DS_MISC_LINE",
    "csdi:DTAD_DS_POLE_LINE_C",
    "csdi:DTAD_PS_POLE_LINE",
    "csdi:DTAD_LV30_LINE",
    "csdi:DTAD_PS_PLATE_LINE",
    "csdi:DTAD_PS_MISC_LINE",
    "csdi:DTAD_LV24_LINE",
    "csdi:DTAD_RST_ZONE_LINE",
    "csdi:DTAD_LV23_LINE",
    "csdi:DTAD_TRAFFIC_LIGHT_LINE",
    "csdi:DTAD_LV22_LINE",
    "csdi:DTAD_RD_MARK_SYM_LINE",
    "csdi:DTAD_RD_MARK_LINE_C",
    "csdi:DTAD_RD_MARK_LINE",
    "csdi:DTAD_CROSSING_LINE",
    "csdi:DTAD_YL_BOX_LINE",
    "csdi:DTAD_RAILING_LINE",
    "csdi:DTAD_TG_PATH_LINE",
    "csdi:DTAD_TS_PLATE_LINE",
    "csdi:DTAD_TS_MISC_LINE",
    "csdi:DTAD_TS_ABV_LINE",
    "csdi:DTAD_TS_POLE_LINE",
    "csdi:DTAD_TW_STRIP_LINE",
    "csdi:DTAD_TY_BAR_LINE",
    "csdi:DTAD_LV21_LINE",
    "csdi:DTAD_PED_REFUGE_LINE",
    "csdi:DTAD_RUN_IN_OUT_LINE",
    "csdi:DTAD_DROP_KERB_LINE",
    "csdi:DTAD_RD_AL_LINE",
    "csdi:DTAD_DS_FILLED",
    "csdi:DTAD_PS_FILLED",
    "csdi:DTAD_TRAFFIC_LIGHT_FILLED",
    "csdi:DTAD_LV22_FILLED",
    "csdi:DTAD_YL_BOX_POLY",
    "csdi:DTAD_TS_FILLED"
]

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

def is_file_outdated(filepath):
    if not os.path.exists(filepath):
        return True
    
    file_time = os.path.getmtime(filepath)
    file_date = datetime.fromtimestamp(file_time)
    age = datetime.now() - file_date
    
    return age.days >= MAX_AGE_DAYS

def download_layer(layer_name):
    # Using a safe filename
    filename = layer_name.replace(":", "_") + ".json"
    filepath = os.path.join(DATA_DIR, filename)

    if not is_file_outdated(filepath):
        print(f"Skipping {layer_name}: Data is fresh (less than {MAX_AGE_DAYS} days old).")
        return

    print(f"Downloading {layer_name}...")
    
    params = {
        "service": "WFS",
        "version": "2.0.0",
        "request": "GetFeature",
        "typeNames": layer_name,
        "outputFormat": "GEOJSON",
        "count": 500  # Keeping limit for safety/performance
    }

    try:
        response = requests.get(WFS_BASE_URL, params=params, timeout=30)
        response.raise_for_status()
        
        # Verify it's valid JSON before saving
        data = response.json()
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {layer_name} to {filepath}")
        
    except Exception as e:
        print(f"Failed to download {layer_name}: {e}")

def main():
    ensure_data_dir()
    print(f"Checking {len(LAYERS)} layers...")
    for layer in LAYERS:
        download_layer(layer)
    print("Update complete.")

if __name__ == "__main__":
    main()
