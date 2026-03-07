# HK Traffic Sign Map

A simple interactive map showing traffic sign pole locations in Hong Kong using data from the CSDI Portal.

## Setup

The project consists of:
- `index.html`: The main map page.
- `style.css`: Map styling.
- `script.js`: Logic to fetch data and render the map using Leaflet.js.

## Running the Map

Due to browser security restrictions (CORS), you may not be able to fetch the data if you open `index.html` directly from your file explorer. It is recommended to run a local web server.

### Using Python (easiest):
1. Open a terminal in this folder.
2. Run:
   ```bash
   python -m http.server
   ```
3. Open http://localhost:8000 in your browser.

## Data Source & Auto-Update
- **WFS Service**: [CSDI Portal](https://portal.csdi.gov.hk/)
- **Data Updates**: 
  The map reads data from the local `data/` folder to improve performance and avoid CORS issues.
  
  To fetch or update the data:
  1. Run the update script:
     ```bash
     python update_data.py
     ```
  2. This script implements a caching mechanism:
     - It downloads GeoJSON files for all 51 layers.
     - It only re-downloads if the local file is missing or older than **7 days**.
  
  **Scheduled Updates:**
  You can automate this by adding `python update_data.py` to your system's scheduler (e.g., Windows Task Scheduler or cron) to run once a day. The script itself handles the "7-day check", so it's safe to run frequent checks.

## Layer Info
- **Layer**: All 51 traffic sign related layers (DTAD series)

