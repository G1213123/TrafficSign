// Library for Road Marking Line Styles
// This file maps the 'LINETYPE' attribute from the data to visual styles (dash patterns)
// Format based on Leaflet Path options: https://leafletjs.com/reference.html#path

const roadMarkingStyles = {
    // RM1178: Warning Line 
    "RM1178": [
        { 
            dashMeters: [1, 1], // 1m line, 1m gap
            weight: 2 
        }
    ],
    
    // RM1107: Lane Line 
    "RM1107": [
        {
            dashMeters: [4, 7], 
            weight: 2
        }
    ],

    // Example: Long Broken Line
    "RM1004": [
        {
            dashMeters: [4, 2], // Example: 4m line, 2m gap
            weight: 2
        }
    ],
    // Example: Long Broken Line
    "RM1104": [
        {
            dashMeters: [4, 2], // Example: 4m line, 2m gap
            weight: 2
        }
    ],

    // RM1001: Double White Lines
    "RM1001": [
        // Left line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: -0.1 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: 0.1 // Offset 0.5m to the right
        }
    ],

    // Example: Solid Line (Double White, etc.)
    "RM1112": [
        {
            dashMeters: null, // solid
            weight: 3
        }
    ],

    // Default Fallback
    "DEFAULT": [
        {
            dashMeters: null, // solid line
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ]
};

/**
 * Calculates meters per pixel at a specific latitude and zoom level.
 * Based on Web Mercator projection.
 */
function getMetersPerPixel(lat, zoom) {
    const earthCircumference = 40075016.686;
    return earthCircumference * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom + 8);
}

/**
 * Helper to offset lat/lngs by meters. 
 * Use a simple planar approximation suitable for high zoom visual adjustments.
 */
function getOffsetLatLngs(latlngs, offsetMeters, map) {
    if (!offsetMeters || offsetMeters === 0) return latlngs;
    if (!map) return latlngs;

    // Convert meters to pixels at current zoom
    const zoom = map.getZoom();
    const centerLat = map.getCenter().lat;
    const metersPerPx = getMetersPerPixel(centerLat, zoom);
    const offsetPx = offsetMeters / metersPerPx;

    // We need to operate on Points (pixels)
    const points = latlngs.map(ll => map.latLngToLayerPoint(ll));
    const newPoints = [];

    // Basic offset calculation for lines
    for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        let pNext = points[i+1];
        let pPrev = points[i-1];

        // Determine vector direction
        let angle;
        if (pNext && pPrev) {
            // Interior point
            const angle1 = Math.atan2(p1.y - pPrev.y, p1.x - pPrev.x);
            // Simplification: Use angle from previous segment
            angle = angle1; 
        } else if (pNext) {
            angle = Math.atan2(pNext.y - p1.y, pNext.x - p1.x);
        } else if (pPrev) {
             angle = Math.atan2(p1.y - pPrev.y, p1.x - pPrev.x);
        } else {
            newPoints.push(p1); continue;
        }

        // Add 90 degrees for normal
        const normal = angle + Math.PI / 2;
        
        newPoints.push(L.point(
            p1.x + Math.cos(normal) * offsetPx,
            p1.y + Math.sin(normal) * offsetPx
        ));
    }

    // Convert back to LatLng
    return newPoints.map(p => map.layerPointToLatLng(p));
}

/**
 * Retrieves the styles array.
 * Converts config format to Leaflet style options.
 */
function getLineStyles(lineType, map) {
    // Get config (array or single object fallback)
    let config = roadMarkingStyles[lineType] || roadMarkingStyles["DEFAULT"];
    
    // Ensure array
    if (!Array.isArray(config)) {
        config = [config];
    }

    // Process each component
    return config.map(styleDef => {
        // Enforce Black Color if not explicitly overridden
        let style = { 
            color: "#000000", 
            opacity: 0.8,
            weight: 2,
            ...styleDef 
        };
        
        // Handle Dashes
        if (style.dashMeters && map) {
            const zoom = map.getZoom();
            const lat = map.getCenter().lat;
            const metersPerPx = getMetersPerPixel(lat, zoom);
            const dashArrayPx = style.dashMeters.map(m => m / metersPerPx);
            style.dashArray = dashArrayPx.join(", ");
        } else {
            style.dashArray = null;
        }

        // Clean up internal property but keep offset
        delete style.dashMeters;

        return style;
    });
}

