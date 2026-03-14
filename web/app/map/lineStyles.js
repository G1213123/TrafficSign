// Library for Road Marking Line Styles
// This file maps the 'LINETYPE' attribute from the data to visual styles (dash patterns)
// Format based on Leaflet Path options: https://leafletjs.com/reference.html#path

import L from 'leaflet';

const roadMarkingStyles = {

    // RM1107: Lane Line 
    "RM1107": [
        {
            dashMeters: [1, 1],
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
            offset: -0.175 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: 0.175 // Offset 0.5m to the right
        }
    ],

    // (CONTINUOUS)
    "(CONTINUOUS)": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // AMT
    "AMT": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // AMT1
    "AMT1": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // AMT1.5_1.0
    "AMT1.5_1.0": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // AMT2_1.5
    "AMT2_1.5": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // CBARRIER
    "CBARRIER": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // CONTINUOUS
    "CONTINUOUS": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // CRAIL1
    "CRAIL1": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // CRAIL2
    "CRAIL2": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // CRASHGATE
    "CRASHGATE": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // EAG 3
    "EAG 3": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // HCAIL2
    "HCAIL2": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // Leader Line
    "Leader Line": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1002
    "RM1002": [
        // Left line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: -0.175 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: [1, 5], // Solid
            weight: 2,
            offset: 0.175 // Offset 0.5m to the right
        }
    ],

    // RM1003
    "RM1003": [
        // Left line
        {
            dashMeters: [1, 5], // Solid
            weight: 2,
            offset: -0.175 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: 0.175 // Offset 0.5m to the right
        }
    ],

    // RM1007
    "RM1007": [
        {
            dashMeters: [1, 1],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1011
    "RM1011": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1012
    "RM1012": [
        // Left line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: -0.25 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: 0.25 // Offset 0.5m to the right
        }
    ],

    // RM1013
    "RM1013": [
        // Left line
        {
            dashMeters: [0.6, 0.3], // Solid
            weight: 2,
            offset: -0.2 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: [0.6, 0.3], // Solid
            weight: 2,
            offset: 0.2 // Offset 0.5m to the right
        }
    ],

    // RM1037
    "RM1037": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1040
    "RM1040": [
        // Left line
        {
            dashMeters: null, // Solid
            weight: 2,
            offset: -0.1, // Offset 0.5m to the left
            color: "#FFFF00",
        },
        // Right line
        {
            dashMeters: null, // Solid
            weight: 2,
            color: "#FFFF00",
            offset: 0.1 // Offset 0.5m to the right
        }
    ],

    // RM1041
    "RM1041": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1048
    "RM1048": [
        {
            dashMeters: [1, 1],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1049
    "RM1049": [
        // Left line
        {
            dashMeters: [1, 1], // Solid
            weight: 2,
            offset: 0 // Offset 0.5m to the left
        },
        // Right line
        {
            dashMeters: [1, 1], // Solid
            weight: 2,
            offset: 0, // Offset 0.5m to the right
            shift: 1,
            color: "#FFFF00",
        }
    ],

    // RM1101
    "RM1101": [
        {
            dashMeters: [1, 5],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1102
    "RM1102": [
        {
            dashMeters: [2, 7],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1103
    "RM1103": [
        {
            dashMeters: [3, 5],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1105
    "RM1105": [
        {
            dashMeters: [6, 3],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1106
    "RM1106": [
        {
            dashMeters: [0.6, 0.3],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1109
    "RM1109": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1134
    "RM1134": [
        {
            dashMeters: [4, 2],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1161
    "RM1161": [
        {
            dashMeters: [2, 1],
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1162
    "RM1162": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // RM1165
    "RM1165": [
        {
            dashMeters: [0.3, 0.15],
            weight: 2,
            color: "#000000",
            offset: 0.125,
            opacity: 0.8
        },
        {
            dashMeters: [0.3, 0.15],
            weight: 2,
            color: "#000000",
            offset: -0.125,
            opacity: 0.8
        },
    ],

    // SHORT-DASHED
    "SHORT-DASHED": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // SOLID
    "SOLID": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // Solid
    "Solid": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ULSTUD12
    "ULSTUD12": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ULSTUD18
    "ULSTUD18": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ULSTUD6
    "ULSTUD6": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ULSTUD9
    "ULSTUD9": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // URSTUD18
    "URSTUD18": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // URSTUD6
    "URSTUD6": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // URSTUD9
    "URSTUD9": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZEBRA1
    "ZEBRA1": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZEBRA3
    "ZEBRA3": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZEBRA4
    "ZEBRA4": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZEBRA5
    "ZEBRA5": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZEBRA9
    "ZEBRA9": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZIGZAGL
    "ZIGZAGL": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
        }
    ],

    // ZIGZAGR
    "ZIGZAGR": [
        {
            dashMeters: null,
            weight: 2,
            color: "#000000",
            opacity: 0.8
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
export function getMetersPerPixel(lat, zoom) {
    const earthCircumference = 40075016.686;
    return earthCircumference * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom + 8);
}

/**
 * Helper to offset lat/lngs by meters. 
 * Use a simple planar approximation suitable for high zoom visual adjustments.
 */
export function getOffsetLatLngs(latlngs, offsetMeters, map) {
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
        let pNext = points[i + 1];
        let pPrev = points[i - 1];

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
export function getLineStyles(lineType, map) {
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

            if (style.shift) {
                style.dashOffset = (style.shift / metersPerPx).toString();
            }
        } else {
            style.dashArray = null;
        }

        // Clean up internal property but keep offset
        delete style.dashMeters;

        return style;
    });
}
