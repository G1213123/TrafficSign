// Initialize map with EPSG:4326 projection to match HK Map Service WGS84 tiles
const map = L.map('map', {
}).setView([22.3193, 114.1694], 14); // Centered on Hong Kong, slightly zoomed in

// Dynamic Icon Scaling
function updateIconScale() {
    const zoom = map.getZoom();
    // Calculate scale factor relative to Zoom 20
    const scale = Math.pow(2, zoom - 21);
    // Update CSS variable on the map container
    map.getContainer().style.setProperty('--map-icon-scale', scale);
}

// Listen to zoom events
map.on('zoomend', updateIconScale);
// Initial call
updateIconScale();

// Use HK Map Service Label (English, WGS84)
L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/basemap/WGS84/{z}/{x}/{y}.png', {
    maxNativeZoom: 20,
    maxZoom: 22, 
    attribution: 'Map information from Lands Department'
}).addTo(map);
L.tileLayer('https://mapapi.geodata.gov.hk/gs/api/v1.0.0/xyz/label/hk/en/WGS84/{z}/{x}/{y}.png', {
    maxNativeZoom: 20,
    maxZoom: 22, 
    attribution: 'Map information from Lands Department'
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
                // Special handling to hide the bounding box polygon for annotations
                if (typeName === 'csdi:DTAD_RD_MARK_ANNO') {
                    return { opacity: 0, fillOpacity: 0, stroke: false, interactive: false };
                }

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
                // Custom SVG Icons for Traffic Lights, Traffic Sign Poles, and Road Markings
                if (typeName === "csdi:DTAD_TRAFFIC_LIGHT_PT" || typeName === "csdi:DTAD_TS_POLE_PT" || typeName === "csdi:DTAD_RD_MARK_SYM_PT") {
                    let iconUrl = null;
                    let angle = (feature.properties && feature.properties.ANGLE) ? feature.properties.ANGLE : 0;

                    if (typeName === "csdi:DTAD_TRAFFIC_LIGHT_PT" && feature.properties && feature.properties.REFNAME) {
                         iconUrl = `svg/t lights/${feature.properties.REFNAME}.svg`;
                    } else if (typeName === "csdi:DTAD_TS_POLE_PT") {
                         iconUrl = "svg/TrafficSign.svg";
                    } else if (typeName === "csdi:DTAD_RD_MARK_SYM_PT" && feature.properties && feature.properties.REFNAME) {
                         iconUrl = `svg/rd mark/${feature.properties.REFNAME}.svg`;
                    }

                    if (iconUrl) {
                        return L.marker(latlng, {
                            icon: L.divIcon({
                                className: 'custom-svg-icon-wrapper', 
                                html: `<div class="custom-svg-icon"><img src="${iconUrl}" style="transform: rotate(${-angle}deg);" /></div>`,
                                iconSize: [0, 0], // Let CSS handle sizing and centering from this point
                                iconAnchor: [0, 0] // Anchor the flex container center at the LatLng
                            })
                        });
                    }
                }

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
                // Special handling for Annotation Polygons - Add text label at center
                if (typeName === "csdi:DTAD_RD_MARK_ANNO") {
                    var center = featureLayer.getBounds().getCenter();
                    var marker = L.marker(center, { 
                        icon: createAnnotationIcon(feature, center), // Pass center for pixel size calc
                        interactive: false // Let clicks pass through
                    });
                    
                    // Critical: Add the marker to the PARENT layer group so it appears/hides with the group
                    layer.addLayer(marker);

                    // Disable interaction on the original invisible polygon
                     if (featureLayer.setStyle) {
                        featureLayer.setStyle({ stroke: false, fill: false });
                        if (featureLayer.getElement) {
                            featureLayer.getElement().style.pointerEvents = 'none';
                        }
                    }
                    return; // Skip default popup behavior for the invisible box
                }

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
var layerControl = L.control.groupedLayers(null, groupedOverlays, {
    collapsed: false,
    groupCheckboxes: true 
});
layerControl.addTo(map);

// Disable scroll propagation on the control container to prevent map zooming while scrolling the list
var controlDiv = layerControl.getContainer();
L.DomEvent.disableScrollPropagation(controlDiv);
L.DomEvent.disableClickPropagation(controlDiv);

// --- State Persistence ---

function saveMapState() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const activeLayers = [];
    
    // Identify active layers by their key in allLayersMap
    // Iterate through allLayersMap to find which ones are on the map
    for (const [key, layer] of Object.entries(allLayersMap)) {
        if (map.hasLayer(layer)) {
            activeLayers.push(key);
        }
    }
    
    const state = {
        center: { lat: center.lat, lng: center.lng },
        zoom: zoom,
        activeLayers: activeLayers
    };
    
    try {
        localStorage.setItem('mapState', JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save map state', e);
    }
}

// Restore State or Set Default
try {
    const savedState = localStorage.getItem('mapState');
    let stateRestored = false;

    if (savedState) {
        const state = JSON.parse(savedState);
        
        // Restore View
        if (state.center && state.zoom) {
            map.setView([state.center.lat, state.center.lng], state.zoom);
        }
        
        // Restore Layers
        if (state.activeLayers && Array.isArray(state.activeLayers)) {
            // Remove any existing layers first if necessary? 
            // Currently only default adds layers, but we are replacing that block.
            // So map should be clean of overlays at this point.
            
            state.activeLayers.forEach(layerKey => {
                const layer = allLayersMap[layerKey];
                if (layer) {
                    layer.addTo(map);
                    stateRestored = true;
                }
            });
        }
    }
    
    // Fallback to default if no layers restored (or no state)
    if (!stateRestored) {
        const defaultLayer = allLayersMap["csdi:DTAD_TS_POLE_PT"];
        if (defaultLayer) {
            defaultLayer.addTo(map);
        }
    }

} catch (e) {
    console.warn('Failed to restore map state', e);
    // Fallback on error
    const defaultLayer = allLayersMap["csdi:DTAD_TS_POLE_PT"];
    if (defaultLayer) {
        defaultLayer.addTo(map);
    }
}

// Add persistence listeners
map.on('moveend', saveMapState);
map.on('zoomend', saveMapState);
map.on('overlayadd', saveMapState);
map.on('overlayremove', saveMapState);


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
function metersToPixels(meters, latitude, zoom) {
    // Earth circumference in meters / 2^zoom / 256 pixels = meters/pixel at equator
    // Scale by cos(latitude)
    const metersPerPixel = (40075016.686 * Math.cos(latitude * Math.PI / 180)) / Math.pow(2, zoom + 8);
    return meters / metersPerPixel;
}

function updateStylesForZoom() {
    if (map.getZoom() < 16) return;

    // Update Annotation Labels Size
    document.querySelectorAll('.road-label').forEach(el => {
        const sizeMeters = parseFloat(el.getAttribute('data-size-meters'));
        const lat = parseFloat(el.getAttribute('data-lat'));
        if (!isNaN(sizeMeters) && !isNaN(lat)) {
            const pxSize = metersToPixels(sizeMeters, lat, map.getZoom());
            el.style.fontSize = pxSize + 'px';
        }
    });

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

// Helper for annotation styling
function createAnnotationIcon(feature, latlng) {
    const p = feature.properties || {};
    // Split text by space to create multi-line labels
    const text = (p.TextString || '').split(' ').join('<br>'); // Multi-row support
    
    // Rotation Logic:
    // CSDI Data (AutoCAD style): Angle is arithmetic or geographic degrees.
    // CSS `rotate(Xdeg)` is clockwise.Arithmetic is CCW.
    // If Angle = -100 (CCW), that is 100 degrees CW.
    // So CSS rotate(100deg).
    // Let's negate the input angle.
    // Also, handle FlipAngle? If it helps readability (upside down).
    const angle = p.Angle || 0; 
    const cssRotation = -angle; 

    // Font Sizing in Meters
    // Default assumption: specific font sizes like 8.99 are METERS on the ground.
    const sizeMeters = p.FontSize || 8; 
    
    // Calculate initial pixel size for current zoom
    let fontSizePx = '12px';
    if (latlng && map) {
        // We define the helper function metersToPixels in the scope above or ensure it handles it
        // Since createAnnotationIcon is called after map init, map is available in closure scope.
        // We need the helper function defined. It is inserted before updateStylesForZoom.
        // But since this function is at the bottom, we must hoist the helper or check order.
        // Function declarations are hoisted, so 'metersToPixels' is available.
        const px = metersToPixels(sizeMeters, latlng.lat, map.getZoom());
        fontSizePx = px + 'px';
    }

    // Handle 'chinese' font name mapping to system fonts
    let fontFamily = p.FontName;
    if (!fontFamily || fontFamily.toLowerCase().indexOf('chinese') !== -1) {
        fontFamily = '"Microsoft JhengHei", "Microsoft YaHei", sans-serif';
    }
    
    const isBold = p.Bold == 1;
    const isItalic = p.Italic == 1;
    const isUnderline = p.Underline == 1;

    // Scale X for Width Factor (CharacterWidth: 40 -> 40%?)
    // If CharacterWidth is 100 (normal), then 40 is 0.4.
    // Also flip angle? If FlipAngle is set, maybe it implies a mirror or just orientation limit.
    // Ignoring FlipAngle for now in favor of raw rotation.
    const scaleX = (p.CharacterWidth && p.CharacterWidth !== 100) ? (p.CharacterWidth / 100) : 1;
    
    // Alignment mapping
    // VerticalAlignment: 0-Top, 1-Center, 2-Baseline, 3-Bottom
    // HorizontalAlignment: 0-Left, 1-Center, 2-Right
    
    let translateX = '-50%'; // Default Center
    let translateY = '-50%'; // Default Center
    let textAlign = 'center';

    // Horizontal
    if (p.HorizontalAlignment == 0) { // Left
        translateX = '0%';
        textAlign = 'left'; 
    } else if (p.HorizontalAlignment == 1) { // Center
        translateX = '-50%';
        textAlign = 'center';
    } else if (p.HorizontalAlignment == 2) { // Right
        translateX = '-100%';
        textAlign = 'right';
    }

    // Vertical
    // For CSS transform translate:
    // 0% Y -> Top aligned with anchor
    // -50% Y -> Center aligned with anchor
    // -100% Y -> Bottom aligned with anchor
    if (p.VerticalAlignment == 0) { // Top
        translateY = '0%';
    } else if (p.VerticalAlignment == 1) { // Center
        translateY = '-50%';
    } else if (p.VerticalAlignment == 2 || p.VerticalAlignment == 3) { // Baseline / Bottom
        translateY = '-100%';
    }

    // Style construction
    // Added 'road-label' class and data attributes for dynamic resizing
    // Rotation: rotate first, then translate?
    // standard CSS transform order applies from right to left intuitively?
    // transform: rotate(A) translate(X, Y) scaleX(S)
    // Actually applying rotate first (leftmost in string) rotates the coordinate system.
    // Then translate moves along the rotated axes.
    // We want the text to anchor at point, then rotate.
    // So usually: translate(-50%, -50%) to center on point, THEN rotate, THEN scale.
    // Order matters! 
    // If we rotate first: The X/Y translation axes are rotated.
    // If we translate first: calculated from element center.
    // Let's do: translate (to align anchor) -> rotate (around anchor) -> scale
    // Syntax: transform: translate(tx, ty) rotate(deg) scale(sx)
    
    const style = `
        position: absolute;
        left: 0; top: 0;
        white-space: nowrap;
        font-family: ${fontFamily};
        /* font-size set via inline style on element but also here for init */
        font-weight: ${isBold ? 'bold' : 'normal'};
        font-style: ${isItalic ? 'italic' : 'normal'};
        text-decoration: ${isUnderline ? 'underline' : 'none'};
        color: black;
        text-align: ${textAlign};
        transform-origin: 0 0; /* Leaflet DivIcon anchor becomes the 0,0 of this inner div */
        transform: rotate(${cssRotation}deg) translate(${translateX}, ${translateY}) scaleX(${scaleX});
        pointer-events: none; 
        line-height: 1.2;
    `;

    return L.divIcon({
        className: '', 
        html: `<div class="road-label" data-size-meters="${sizeMeters}" data-lat="${latlng ? latlng.lat : 0}" style="${style} font-size: ${fontSizePx};">${text}</div>`,
        iconSize: [0, 0], 
        iconAnchor: [0, 0] 
    });
}
