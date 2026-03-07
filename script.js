const map = L.map('map').setView([22.3193, 114.1694], 14); // Centered on Hong Kong, slightly zoomed in

// Use CartoDB Positron (White/Light tone) basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxNativeZoom: 19,
    maxZoom: 22, 
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>'
}).addTo(map);

// Add Scale Bar
L.control.scale({metric: true, imperial: false}).addTo(map);

// WFS URL Configuration
const wfsBaseUrl = 'https://portal.csdi.gov.hk/server/services/common/td_rcd_1638928986276_39755/MapServer/WFSServer';
const outputFormat = 'GEOJSON';

// Layer Configuration
// Structure: Group Name -> Array of { typeName, label (optional) }
// If label is missing, use typeName suffix
const layersConfig = {
    "Traffic Signs": [
        "csdi:DTAD_TS_POLE_PT", "csdi:DTAD_TS_PLATE_LINE", "csdi:DTAD_TS_MISC_LINE", 
        "csdi:DTAD_TS_ABV_LINE", "csdi:DTAD_TS_POLE_LINE", "csdi:DTAD_TS_FILLED", 
        "csdi:DTAD_TS_ABV_PT", "csdi:DTAD_TS_ABV_ANNO"
    ],
    "Directional Signs": [
        "csdi:DTAD_DS_POLE_PT", "csdi:DTAD_DS_POLE_LINE", "csdi:DTAD_DS_PLATE_LINE", 
        "csdi:DTAD_DS_MISC_LINE", "csdi:DTAD_DS_POLE_LINE_C", "csdi:DTAD_DS_FILLED"
    ],
    "Pedestrian Signs": [
        "csdi:DTAD_PS_POLE_PT", "csdi:DTAD_PS_POLE_LINE", "csdi:DTAD_PS_PLATE_LINE", 
        "csdi:DTAD_PS_MISC_LINE", "csdi:DTAD_PS_FILLED", "csdi:DTAD_PS_ANNO"
    ],
    "Traffic Lights": [
        "csdi:DTAD_TRAFFIC_LIGHT_PT", "csdi:DTAD_TRAFFIC_LIGHT_LINE", "csdi:DTAD_TRAFFIC_LIGHT_FILLED"
    ],
    "Road Markings": [
        "csdi:DTAD_RD_MARK_ANNO", "csdi:DTAD_RD_MARK_SYM_PT", "csdi:DTAD_RD_MARK_SYM_LINE",
        "csdi:DTAD_RD_MARK_LINE_C", "csdi:DTAD_RD_MARK_LINE", "csdi:DTAD_CROSSING_LINE",
        "csdi:DTAD_YL_BOX_LINE", "csdi:DTAD_YL_BOX_POLY", "csdi:DTAD_TW_STRIP_LINE",
        "csdi:DTAD_TY_BAR_LINE", "csdi:DTAD_RD_AL_LINE", "csdi:DTAD_RST_ZONE_LINE",
        "csdi:DTAD_LV38_LINE", "csdi:DTAD_LV30_LINE", "csdi:DTAD_LV24_LINE",
        "csdi:DTAD_LV23_LINE", "csdi:DTAD_LV22_LINE", "csdi:DTAD_LV21_LINE",
        "csdi:DTAD_LV22_FILLED"
    ],
    "Railings": [ "csdi:DTAD_RAILING_LINE" ],
    "Miscellaneous": [
        "csdi:DTAD_GIPOLE_PT", "csdi:DTAD_MISC_PT", "csdi:DTAD_CYC_PT",
        "csdi:UNKNOWN_LINE", "csdi:DTAD_TG_PATH_LINE", "csdi:DTAD_PED_REFUGE_LINE",
        "csdi:DTAD_RUN_IN_OUT_LINE", "csdi:DTAD_DROP_KERB_LINE"
    ]
};

// --- Initialization ---

// 1. Create individual L.geoJSON layers for every type
// 2. Prepare the object for L.control.groupedLayers
const groupedOverlays = {};
const allLayersMap = {}; // typeName -> L.geoJSON instance

// Loop through config to build layers
for (const [groupName, layerList] of Object.entries(layersConfig)) {
    groupedOverlays[groupName] = {};
    
    layerList.forEach(typeName => {
        // Create a human-readable label
        // Remove 'csdi:' prefix and 'DTAD_' prefix, replace underscores with spaces
        let label = typeName.replace('csdi:', '').replace('DTAD_', '').replace(/_/g, ' ');
        
        // Setup empty GeoJSON layer with style
        // We use a factory function to capture the scoped variable 'layerConfig' 
        // But here we rely on the internal logic.
        
        const layer = L.geoJSON(null, {
            style: function (feature) {
                // Default global style
                let style = {color: "#000000", weight: 2, opacity: 0.8}; 
                
                // Use lineStyles.js logic if LINETYPE is present
                if (feature && feature.properties && feature.properties.LINETYPE) {
                    const styles = getLineStyles(feature.properties.LINETYPE, map);
                    // Use the FIRST style for the base layer
                    // We assume valid response array
                    if (styles.length > 0) {
                        style = { ...style, ...styles[0] };
                        
                        // Wait! If the first style has an offset, we can't apply it via 'style' option
                        // because L.GeoJSON uses the original geometry.
                        // However, we can't modify geometry inside 'style' function.
                        // Visual offset via transparent border? No.
                        
                        // HACK: If offset is needed on the primary layer (index 0), 
                        // we might need to handle it in onEachFeature by making this base layer transparent?
                        // For now, assume Primary Layer (Index 0) is Center or Base.
                        
                        // If style[0] has 'offset', we should probably hide this layer 
                        // and render EVERYTHING in onEachFeature as "extra" layers?
                        
                        if (styles[0].offset) {
                            style.opacity = 0; // Hide the base geometry
                        }
                    }
                }
                return style;
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: 3,
                    fillColor: "#000000",
                    color: "#ffffff",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            onEachFeature: function (feature, featureLayer) {
                // Basic Popup
                if (feature.properties) {
                    let popupContent = `<b>${label}</b><br><div class="popup-content">`;
                    for (const key in feature.properties) {
                         if(feature.properties[key] !== null) {
                            popupContent += `<b>${key}:</b> ${feature.properties[key]}<br>`;
                         }
                    }
                    popupContent += '</div>';
                    featureLayer.bindPopup(popupContent);
                }

                // Handle Complex Styles (Multi-line, Offsets)
                if (feature.properties && feature.properties.LINETYPE) {
                    const styles = getLineStyles(feature.properties.LINETYPE, map);
                    
                    // Iterate through styles
                    styles.forEach((style, index) => {
                        // Skip index 0 IF it has no offset (it's already handled by 'style' function)
                        // defined above.
                        // BUT: If index 0 HAS offset, we hid the base layer, so we must render it here as a new polyline.
                        
                        if (index === 0 && !style.offset) return; 

                        // For index > 0 OR index 0 with offset:
                        // Create a new Polyline
                        if (feature.geometry.type === "MultiLineString" || feature.geometry.type === "LineString") {
                            // Get geometry (LatLngs)
                            let latlngs = featureLayer.getLatLngs();
                            
                            // Handle MultiLineString structure (Array of Arrays) vs LineString (Array)
                            // L.GeoJSON normalizes this? getLatLngs() returns:
                            // LineString: [LatLng, LatLng...]
                            // MultiLineString: [[LatLng...], [LatLng...]]
                            
                            const flatten = (arr) => arr[0] instanceof L.LatLng ? [arr] : arr;
                            const segments = flatten(latlngs);

                            segments.forEach(segment => {
                                // Apply Offset
                                let finalLatLngs = segment;
                                if (style.offset) {
                                    finalLatLngs = getOffsetLatLngs(segment, style.offset, map);
                                }
                                
                                const multiLine = L.polyline(finalLatLngs, style);
                                
                                // Tag it so we can update it later
                                multiLine.options.isCustomPart = true;
                                multiLine.options.linetype = feature.properties.LINETYPE;
                                multiLine.options.styleIndex = index;
                                multiLine.options.origFeature = feature; // Reference for updates
                                
                                // Add to the PARENT group (so it clears/updates with the group)
                                layer.addLayer(multiLine);
                            });
                        }
                    });
                }
            }
        });

        // Store references
        allLayersMap[typeName] = layer;
        
        // Add to grouped structure
        groupedOverlays[groupName][label] = layer;
    });
}

// Initialize the Grouped Layer Control
L.control.groupedLayers(null, groupedOverlays, {
    collapsed: false,
    groupCheckboxes: true 
}).addTo(map);

// Pre-select some common layers
const defaultLayer = allLayersMap["csdi:DTAD_TS_POLE_PT"];
if (defaultLayer) {
    defaultLayer.addTo(map);
}


// --- Data Loading Logic ---

const abortControllers = {}; 

function loadLayer(typeName, bounds, layerInstance) {
    // Abort previous request for this specific layer
    if (abortControllers[typeName]) {
        abortControllers[typeName].abort();
    }
    const controller = new AbortController();
    abortControllers[typeName] = controller;

    const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
    const wfsUrl = `${wfsBaseUrl}?service=WFS&version=2.0.0&request=GetFeature&typeNames=${typeName}&outputFormat=${outputFormat}&bbox=${bbox},urn:ogc:def:crs:EPSG::4326&count=1000`; 

    fetch(wfsUrl, { signal: controller.signal })
        .then(response => {
            if (!response.ok) return null;
            return response.json();
        })
        .then(data => {
            // Clear old data for this layer (for the previous view)
            layerInstance.clearLayers();

            if (!data || !data.features || data.features.length === 0) return;

            // Add new data
            layerInstance.addData(data);
        })
        .catch(error => {
            if (error.name === 'AbortError') return;
            console.error(`Error loading ${typeName}:`, error);
        });
}

function refreshMap() {
    if (map.getZoom() < 16) return;

    const bounds = map.getBounds();
    
    // Check which layers are currently active on the map
    for (const [typeName, layerInstance] of Object.entries(allLayersMap)) {
        if (map.hasLayer(layerInstance)) {
            loadLayer(typeName, bounds, layerInstance);
        }
    }
}

// --- Event Listeners ---

// Update dash styles on zoom end to maintain meter-based sizing
function updateStylesForZoom() {
    if (map.getZoom() < 16) return;

    for (const layerInstance of Object.values(allLayersMap)) {
         layerInstance.eachLayer(function(layer) {
             // 1. Handle Standard GeoJSON layers (Base)
             if (layer.feature && layer.setStyle && !layer.options.isCustomPart) {
                 layer.setStyle(function(feature) {
                     let style = {color: "#000000", weight: 2, opacity: 0.8}; 
                     if (feature && feature.properties && feature.properties.LINETYPE) {
                         const styles = getLineStyles(feature.properties.LINETYPE, map);
                         if (styles.length > 0) {
                             style = { ...style, ...styles[0] };
                             // Hide base if offset exists
                             if (styles[0].offset) style.opacity = 0;
                         }
                     }
                     return style;
                 });
             }

             // 2. Handle Custom Parts (Offsets / Clones)
             if (layer.options && layer.options.isCustomPart) {
                 const linetype = layer.options.linetype;
                 const idx = layer.options.styleIndex;
                 const feature = layer.options.origFeature; // This might be undefined unless we attached it properly
                 
                 const styles = getLineStyles(linetype, map);
                 if (styles[idx]) {
                     const style = styles[idx];
                     
                     // Update Pattern
                     layer.setStyle(style);
                     
                     // NOTE: We are NOT recalculating offset geometry here (expensive/complex). 
                     // Dash patterns will update, but line width/separation might drift slightly until reload.
                 }
             }
         });
    }
}

// Initial Load
map.on('load', refreshMap);
map.on('moveend', refreshMap);
map.on('zoomend', updateStylesForZoom); // Re-calculate dashes

// When a user toggles a layer ON, load data for it immediately
map.on('overlayadd', function(e) {
    refreshMap(); // Simplest approach: just re-check active layers
});

// Initial trigger
if (map.hasLayer) { 
    refreshMap();
}

// Zoom Warning Control
const zoomInfo = L.control({position: 'bottomleft'});
zoomInfo.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    div.style.background = 'white';
    div.style.padding = '5px';
    div.style.border = '1px solid #ccc';
    div.innerHTML = 'Zoom in to level 16+ to load data';
    return div;
};
zoomInfo.addTo(map);

map.on('zoomend', function() {
    const div = document.querySelector('.info.legend');
    if (map.getZoom() < 16) {
        div.innerHTML = 'Zoom in to level 16+ to load data';
        div.style.color = 'red';
        
        // Option: Clear layers when zoomed out to reduce confusion?
        // for (const layer of Object.values(allLayersMap)) {
        //     layer.clearLayers();
        // }
    } else {
        div.innerHTML = 'Data loading active';
        div.style.color = 'green';
        refreshMap();
    }
});
