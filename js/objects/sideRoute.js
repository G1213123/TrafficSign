import { BaseGroup, GlyphPath } from './draw.js';
import { calculateTransformedPoints, getInsertOffset } from './path.js';
import { roadMapTemplate, baseSideRoadTemplate } from './template.js';
import { calcSymbol } from './symbols.js';
import { assignVertexLabel, getSideRoadCoords } from './routeBase.js';

/**
 * Calculates vertices for side road
 * @param {number} xHeight - X-height value
 * @param {Array} mainRouteList - List of main road routes
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcSideRoadVertices(xHeight, mainRouteList, routeList) {
    const length = xHeight / 4

    // Calculate the direction vector of the arrow
    let RootLeft = mainRouteList[1].x - mainRouteList[1].width * xHeight / 8
    let RootRight = mainRouteList[1].x + mainRouteList[1].width * xHeight / 8

    // Calculate the arrowhead vertices
    let arrowTipPath = getSideRoadCoords(routeList[0], length, RootLeft, RootRight)
    let arrowTipVertex = arrowTipPath.path[0].vertex
    for (var i = 0; i < 3; i++) {
        arrowTipVertex.push(arrowTipVertex.shift());
    }
    assignVertexLabel(arrowTipVertex)
    return arrowTipPath;
}

/**
 * Common transformation logic for roundabout side roads
 * @param {Object} arrowTipPath - The path object to transform
 * @param {Object} route - The route object
 * @param {number} length - Route length
 * @param {number} angle - Rotation angle
 * @param {Object} center - Center point
 * @param {string} excludeShape - Shape name to exclude from standard rotation
 * @return {Object} Transformed path
 */
function transformRoundaboutPath(arrowTipPath, route, length, angle, center, excludeShape) {
    arrowTipPath = calcSymbol(arrowTipPath, length);
    const transform = route.shape !== excludeShape ? {
        x: route.x,
        y: route.y,
        angle: angle / Math.PI * 180 + 90
    } : {
        x: center.x,
        y: center.y,
        angle: 0
    };
    // Apply transform to all paths
    arrowTipPath.path.forEach((p) => {
        p.vertex = calculateTransformedPoints(p.vertex, transform);
    });
    return arrowTipPath;
}

/**
 * Gets coordinates for side road endpoints
 * @param {Object} route - main road object
 * @param {number} length - Route length
 * @param {number} left - Left boundary
 * @param {number} right - Right boundary
 * @return {Array} Array of vertex coordinates
 */
function getConvRdAboutSideRoadCoords(route, length, arm, radius, angle, center) {

    let arrowTipPath;
    if (route.isBase) {
        arrowTipPath = baseSideRoadTemplate(route.shape, arm / length);
    }

    if (!arrowTipPath) {
        arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]));
    }
    if (!route.isBase) {
        const width = route.width;
        // Scale vertices for all paths
        arrowTipPath.path.forEach(p => {
            p.vertex.forEach(v => { v.x *= width / 2; v.y *= width / 2; });
        });

        // Compute trimming/extension points based on geometry
        const trimCenter = { x: width / 2 + 1, y: Math.sqrt((radius + 1) ** 2 - (width / 2 + 1) ** 2) };
        const tCenterAngle = Math.atan2(trimCenter.y, trimCenter.x);
        const i2 = { x: width / 2, y: arm / length - trimCenter.y, display: 0 };
        const i3 = { x: trimCenter.x - Math.cos(tCenterAngle), y: arm / length - trimCenter.y + Math.sin(tCenterAngle), display: 1 };
        const i0 = { x: -i3.x, y: i3.y, display: 1 };
        const i1 = { x: -i2.x, y: i2.y, display: 0 };

        // Modify the first path with additional vertices/arcs, keep others intact
        if (arrowTipPath.path.length > 0) {
            let vtx = arrowTipPath.path[0].vertex;
            vtx = [...vtx, i2, i3, i0, i1];
            vtx.push(vtx.shift()); // rotate start point
            assignVertexLabel(vtx);
            arrowTipPath.path[0].vertex = vtx;

            arrowTipPath.path[0].arcs.push(
                { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                { start: 'V5', end: 'V6', radius: 1, direction: 0, sweep: 0 },
            );
        }
    }

    return transformRoundaboutPath(arrowTipPath, route, length, angle, center, 'UArrow Conventional');
}
/**
 * Gets coordinates for side road endpoints
 * @param {Object} route - main road object
 * @param {number} length - Route length
 * @param {number} left - Left boundary
 * @param {number} right - Right boundary
 * @return {Array} Array of vertex coordinates
 */
function getSpirRdAboutSideRoadCoords(route, length, angle, center) {
    if (route.isBase) {
        const distToCenter = Math.sqrt(Math.pow(route.x - center.x, 2) + Math.pow(route.y - center.y, 2));
        const arm = distToCenter;
        let arrowTipPath = baseSideRoadTemplate(route.shape, arm / length);
        if (!arrowTipPath) {
            arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]));
        }
        return transformRoundaboutPath(arrowTipPath, route, length, angle, center, 'UArrow Spiral');
    }

    const rootShape = route.shape == 'Spiral Arrow' ? 'Arrow' : route.shape; // legacy shape for spiral legs
    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[rootShape]));

    if (route.shape == 'UArrow Spiral') {
        return transformRoundaboutPath(arrowTipPath, route, length, angle, center, 'UArrow Spiral');
    }

    const width = route.width;
    // Scale vertices for all paths
    arrowTipPath.path.forEach(p => {
        p.vertex.forEach(v => { v.x *= width / 2; v.y *= width / 2; });
    });

    // for rotate 5 deg relative to roundabout center
    const polarVectors1 = {
        rCenter: { x: 0, y: 24 },
        rAngle: 5 * Math.PI / 180
    }
    // for rotate stub end along side road middle line
    const polarVectors2 = {
        rCenter: { x: -13.9035, y: -0.3 },
        rAngle: 19.8668 * Math.PI / 180
    }

    let polarVector

    switch (rootShape) {
        case 'Arrow':
            polarVector = [polarVectors1];
            break;
        case 'Stub':
            polarVector = [polarVectors1, polarVectors2];
            break;
        case 'RedBar':
            polarVector = [polarVectors1, polarVectors2];
            break;
        default:
            polarVector = [];
            break;
    }

    polarVector.forEach(({ rCenter, rAngle }) => {
        arrowTipPath.path.forEach(p => {
            p.vertex.forEach(v => {
                const dx = v.x - rCenter.x;
                const dy = v.y - rCenter.y;
                v.x = rCenter.x + dx * Math.cos(rAngle) - dy * Math.sin(rAngle);
                v.y = rCenter.y + dx * Math.sin(rAngle) + dy * Math.cos(rAngle);
            });
        });
    });

    const i0 = { x: 0.841, y: 10.025, label: 'V3', start: 0, display: 1 }
    const i1 = { x: -6.949, y: 11.846, label: 'V4', start: 0, display: 1 }

    // Modify the first path with additional vertices/arcs, keep others intact
    if (arrowTipPath.path.length > 0) {
        let vtx = arrowTipPath.path[0].vertex;
        vtx = [...vtx, i0, i1];
        vtx.push(vtx.shift()); // rotate start point
        assignVertexLabel(vtx);
        arrowTipPath.path[0].vertex = vtx;

        arrowTipPath.path[0].arcs.push(
            { start: 'V2', end: 'V3', radius: 18, direction: 1, sweep: 0 },
            { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
            { start: 'V4', end: 'V5', radius: 14, direction: 0, sweep: 0 },
        );
    }


    return transformRoundaboutPath(arrowTipPath, route, length, angle, center, 'UArrow Spiral');
}

/**
 * Gets coordinates for side road endpoints on straight section
 * @param {Object} route - main road object
 * @param {number} length - Route length
 * @param {number} arm - Arm length
 * @param {number} angle - Rotation angle
 * @param {Object} center - anchor point
 * @return {Array} Array of vertex coordinates
 */
function getOvalStraightSideRoadCoords(route, length, arm, angle, center) {
    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]));
    if (!route.isBase) {
        const width = route.width;
        arrowTipPath.path.forEach(p => {
            p.vertex.forEach(v => { v.x *= width / 2; v.y *= width / 2; });
        });

        const i2 = { x: width / 2, y: arm / length - 1, display: 0 };
        const i3 = { x: width / 2 + 1, y: arm / length, display: 1 };
        const i0 = { x: -i3.x, y: i3.y, display: 1 };
        const i1 = { x: -i2.x, y: i2.y, display: 0 };

        if (arrowTipPath.path.length > 0) {
            let vtx = arrowTipPath.path[0].vertex;
            vtx = [...vtx, i2, i3, i0, i1];
            vtx.push(vtx.shift());
            assignVertexLabel(vtx);
            arrowTipPath.path[0].vertex = vtx;

            arrowTipPath.path[0].arcs.push(
                { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                { start: 'V5', end: 'V6', radius: 1, direction: 0, sweep: 0 },
            );
        }
    }
    return transformRoundaboutPath(arrowTipPath, route, length, angle, center, 'UArrow Conventional');
}

/**
 * SideRoadSymbol class extends baseGroup for side roads
 */
export class SideRoadSymbol extends BaseGroup {
    constructor(options = {}) {
        // Initialize with null basePolygon, will set it later
        super(null, 'SideRoad', 'SideRoadSymbol', options);

        // Branch-specific properties
        this.routeList = options.routeList || [];
        this.isBase = options.isBase || false;
        this.routeList.forEach((r) => {
            if (r.isBase === undefined) {
                r.isBase = this.isBase;
            }
        });
        this.xHeight = options.xHeight || 100;
        this.color = options.color || 'white';
        this.mainRoad = options.mainRoad || null;
        this.side = options.side || false; // false = right, true = left
        this.branchIndex = options.branchIndex || 0;

        this.initialize();

        // Bind events
        this.on('moving', this.onMove.bind(this));
        this.on('moved', this.onMove.bind(this));
        this.on('modified', this.onMove.bind(this));
    }    /**
     * Initialize the branch with a GlyphPath
     * @param {Object} vertexList - Vertex data for the branch
     * @return {SideRoadSymbol} - The initialized branch
     */
    initialize() {
        const { routeList, tempVertexList } = this.applySideRoadConstraints(
            this,
            this.mainRoad,
            this.routeList,
            this.side,
            this.xHeight
        );
        this.routeList = routeList;
        const branch = new GlyphPath();
        branch.initialize(tempVertexList, {
            left: 0,
            top: 0,
            angle: 0,
            fill: this.color,
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
        });

        // Set the basePolygon that was initially null in the constructor
        this.setBasePolygon(branch, false);

        this.mainRoad.receiveNewRoute(this);

        return this;
    }


    /**
     * Applies position constraints to side road coordinates
     * @param {Object} sideRoad - The side road object
     * @param {Object} mainRoad - The parent road object
     * @param {Array} sideRouteList - The side road list to constrain
     * @param {boolean} isSideLeft - Whether branch is on left side
     * @param {number} xHeight - X-height value for measurements
     * @return {Object} - Updated routeList and vertexList
     */
    applySideRoadConstraints(sideRoad, mainRoad, sideRouteList, isSideLeft, xHeight) {
        // Make a copy to avoid modifying the original
        const routeList = JSON.parse(JSON.stringify(sideRouteList));

        switch (mainRoad.roadType) {
            case 'Main Line':
                return this.applyConstraintsMainLine(sideRoad, mainRoad, routeList, isSideLeft, xHeight)
            case 'Conventional Roundabout':
                return this.applySideRoadConstraintsRoundabout(sideRoad, mainRoad, routeList, xHeight)
            case 'Spiral Roundabout':
                return this.applySideRoadConstraintsSpiralRoundabout(sideRoad, mainRoad, routeList, xHeight)
            case 'Oval Roundabout':
                return this.applySideRoadConstraintsOvalRoundabout(sideRoad, mainRoad, routeList, xHeight)
            case 'Double Roundabout':
                return this.applySideRoadConstraintsDoubleRoundabout(sideRoad, mainRoad, routeList, xHeight)
        }

    }

    applyConstraintsMainLine(sideRoad, mainRoad, routeList, isSideLeft, xHeight) {
        // Horizontal constraint based on side
        const rootLeft = mainRoad.routeList[1].x - mainRoad.routeList[1].width * mainRoad.xHeight / 8;
        const rootRight = mainRoad.routeList[1].x + mainRoad.routeList[1].width * mainRoad.xHeight / 8;
        const minBranchShapeXDelta = routeList[0].shape == 'Stub' ? 4 : Math.abs(routeList[0].angle) == 90 ? 12 : 13;
        const minBranchXDelta = minBranchShapeXDelta * xHeight / 4;

        // Constrain movement based on side (left or right)
        if (routeList[0].x + minBranchXDelta > rootLeft && isSideLeft) {
            // Left side branch constraint
            routeList[0].x = rootLeft - minBranchXDelta;
            //sideRoad.left = routeList[0].x;
        } else if (routeList[0].x - minBranchXDelta < rootRight && !isSideLeft) {
            // Right side branch constraint
            routeList[0].x = rootRight + minBranchXDelta;
            //sideRoad.left = rootRight
        }

        // Vertical constraint based on main road top
        const mainVertex = mainRoad.basePolygon.vertex
        const leftPivot = mainVertex[mainVertex.length - 2].y
        const rightPivot = mainVertex[mainVertex.length - 6].y
        const bottomPivotY = Math.max(leftPivot, rightPivot)

        // Calculate vertices with current position
        let tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);

        // Get the vertex that should touch the root (depends on side)
        const rootTopTouchY = tempVertexList.path[0].vertex[isSideLeft ? 3 : 4];

        // Ensure branch doesn't go above root + tip length
        if (rootTopTouchY.y < bottomPivotY) {
            // Push branch down if needed
            const adjustment = bottomPivotY - rootTopTouchY.y;
            routeList[0].y += adjustment;

            // Recalculate vertices with new position
            tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);

            // Only set top if sideRoad is not null
            if (sideRoad) {
                sideRoad.top = Math.min(...tempVertexList.path[0].vertex.map(v => v.y));
            }
        }

        return { routeList, tempVertexList };
    }

    applySideRoadConstraintsRoundabout(sideRoad, mainRoad, routeList, xHeight) {
        // Horizontal constraint based on side
        const radius = 12
        const length = xHeight / 4
        const minBranchShapeXDelta = (routeList[0].shape == 'Arrow' ? radius : 4);
        const minBranchXDelta = (minBranchShapeXDelta + radius);
        const center = mainRoad.routeList[1]

        let angleToCenter, distToCenter;

        if (routeList[0].isBase) {
            angleToCenter = 90 * Math.PI / 180;
            const rootLength = mainRoad.routeList[1].length || 7;
        } else {
            const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
            // Convert to degrees, round to nearest 15 degrees, then back to radians
            const angleInDegrees = rawAngleToCenter * 180 / Math.PI
            const roundedDegrees = Math.round(angleInDegrees / 15) * 15
            angleToCenter = roundedDegrees * Math.PI / 180

        }

        distToCenter = Math.max(minBranchXDelta * length, Math.sqrt((routeList[0].y - center.y) ** 2 + (routeList[0].x - center.x) ** 2))

        if (!routeList[0].isBase) {
            routeList[0].x = center.x + distToCenter * Math.cos(angleToCenter)
            routeList[0].y = center.y + distToCenter * Math.sin(angleToCenter)
        } else {
            routeList[0].x = center.x + distToCenter * Math.cos(angleToCenter)
            routeList[0].y = center.y + distToCenter * Math.sin(angleToCenter)
        }
        const tempVertexList = getConvRdAboutSideRoadCoords(routeList[0], length, distToCenter, radius, angleToCenter, center);

        // Only set left/top if sideRoad is a real object with those properties
        if (sideRoad && sideRoad.left !== undefined) {
            const offset = getInsertOffset(tempVertexList);
            sideRoad.left = offset.left;
            sideRoad.top = offset.top;
        }

        return { routeList, tempVertexList };
    }

    applySideRoadConstraintsSpiralRoundabout(sideRoad, mainRoad, routeList, xHeight) {
        const center = mainRoad.routeList[1]
        const length = xHeight / 4 // Use the parameter directly for temp objects without sideRoad object
        const radius = 12;
        const minBranchXDelta = { 'Arrow': 24, 'Base Spiral Normal': 24, 'Base Spiral Auxiliary': 30, 'Base Spiral U-turn': 45 }[routeList[0].shape] || 24;

        let angleToCenter, distToCenter;

        if (routeList[0].isBase) {
            angleToCenter = 90 * Math.PI / 180;
            const rootLength = mainRoad.routeList[1].length || 7;
            distToCenter = Math.max(minBranchXDelta * length, Math.sqrt((routeList[0].y - center.y) ** 2 + (routeList[0].x - center.x) ** 2))
        } else {
            const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
            // Convert to degrees, round to nearest 15 degrees, then back to radians
            const angleInDegrees = rawAngleToCenter * 180 / Math.PI
            const roundedDegrees = Math.round(angleInDegrees / 15) * 15
            angleToCenter = roundedDegrees * Math.PI / 180
            distToCenter = minBranchXDelta * length
        }


        routeList[0].x = center.x + distToCenter * Math.cos(angleToCenter)
        routeList[0].y = center.y + distToCenter * Math.sin(angleToCenter)


        const tempVertexList = getSpirRdAboutSideRoadCoords(routeList[0], length, angleToCenter, center);

        // Only set left/top if sideRoad is a real object with those properties
        if (sideRoad && sideRoad.left !== undefined) {
            const offset = getInsertOffset(tempVertexList);
            sideRoad.left = offset.left;
            sideRoad.top = offset.top;
        }

        return { routeList, tempVertexList };
    }

    applySideRoadConstraintsOvalRoundabout(sideRoad, mainRoad, routeList, xHeight) {
        const center = mainRoad.routeList[1];
        const length = xHeight / 4;
        const radius = 12; // 12 units radius

        // Main road rotation
        const mainAngle = (mainRoad.mainAngle || 0) * Math.PI / 180;

        if (routeList[0].isBase) {
            const rootLength = mainRoad.routeList[1].length || 7;
            const distToCenter = (radius + rootLength) * length;
            // Angle should be Down (90 deg relative to Bottom Center).
            // Bottom Center is (0,0) in Local.
            const localNormalAngle = Math.PI / 2;
            const localVirtualCenter = { x: 0, y: 0 }; // Bottom center

            // Global Normal Angle (for drawing direction)
            const globalNormalAngle = localNormalAngle + mainAngle;

            // Calculate Constrained Position in LOCAL space
            const constrainedLocalX = localVirtualCenter.x + (radius + rootLength) * Math.cos(localNormalAngle);
            const constrainedLocalY = localVirtualCenter.y + (radius + rootLength) * Math.sin(localNormalAngle);

            // Transform back to GLOBAL space
            const finalGlobalX = constrainedLocalX * Math.cos(mainAngle) - constrainedLocalY * Math.sin(mainAngle);
            const finalGlobalY = constrainedLocalX * Math.sin(mainAngle) + constrainedLocalY * Math.cos(mainAngle);

            routeList[0].x = center.x + finalGlobalX * length;
            routeList[0].y = center.y + finalGlobalY * length;

            // Generate Vertices (use getConvRdAboutSideRoadCoords since it supports Base Roundabout)
            const vcGlobalX = localVirtualCenter.x * Math.cos(mainAngle) - localVirtualCenter.y * Math.sin(mainAngle);
            const vcGlobalY = localVirtualCenter.x * Math.sin(mainAngle) + localVirtualCenter.y * Math.cos(mainAngle);
            const globalVirtualCenter = {
                x: center.x + vcGlobalX * length,
                y: center.y + vcGlobalY * length
            };

            const totalArm = (radius + rootLength) * length;
            const tempVertexList = getConvRdAboutSideRoadCoords(routeList[0], length, totalArm, 12, globalNormalAngle, globalVirtualCenter);

            if (sideRoad && sideRoad.left !== undefined) {
                const offset = getInsertOffset(tempVertexList);
                sideRoad.left = offset.left;
                sideRoad.top = offset.top;
            }
            return { routeList, tempVertexList };
        }

        // Global to Local (Rotate by -mainAngle) relative to Bottom Center (routeList[1])
        const dxGlobal = (routeList[0].x - center.x) / length;
        const dyGlobal = (routeList[0].y - center.y) / length;

        const dx = dxGlobal * Math.cos(-mainAngle) - dyGlobal * Math.sin(-mainAngle);
        const dy = dxGlobal * Math.sin(-mainAngle) + dyGlobal * Math.cos(-mainAngle);

        // Define Zones in Local Space
        // Bottom Center is (0,0). Top Center is (0, -24).
        // Straight is between Y=0 and Y=-24.

        let localNormalAngle; // Direction of arm in Local Space
        let localVirtualCenter; // Pivot point for arm in Local Space
        let isStraight = false;
        let sideSign = 1; // 1 for right, -1 for left

        if (dy < -24) {
            // TOP CIRCLE ZONE (Center at 0, -24)
            const vY = dy - (-24);
            const vX = dx;
            const rawAngle = Math.atan2(vY, vX); // Angle from (0, -24)
            // Round to 15 deg
            const deg = rawAngle * 180 / Math.PI;
            const roundedDeg = Math.round(deg / 15) * 15;
            localNormalAngle = roundedDeg * Math.PI / 180;
            localVirtualCenter = { x: 0, y: -24 };

        } else if (dy > 0) {
            // BOTTOM CIRCLE ZONE (Center at 0, 0)
            const vY = dy;
            const vX = dx;
            const rawAngle = Math.atan2(vY, vX); // Angle from (0,0)
            // Round to 15 deg
            const deg = rawAngle * 180 / Math.PI;
            const roundedDeg = Math.round(deg / 15) * 15;
            localNormalAngle = roundedDeg * Math.PI / 180;
            localVirtualCenter = { x: 0, y: 0 };

        } else {
            // STRAIGHT ZONE (between 0 and -24)
            isStraight = true;
            if (dx >= 0) {
                // Right Side
                localNormalAngle = 0;
                sideSign = 1;
            } else {
                // Left Side
                localNormalAngle = Math.PI;
                sideSign = -1;
            }
            // For straight, virtualCenter acts as the anchor on the hull
            localVirtualCenter = { x: sideSign * 12, y: dy };
        }

        // Calculate Arm Length
        let distFromAnchor = 0;
        if (isStraight) {
            // Projected distance from the hull line (X = 12 or -12)
            distFromAnchor = (sideSign === 1) ? (dx - 12) : (-12 - dx);
        } else {
            // Radial distance from virtual center minus radius
            const distToVC = Math.sqrt((dx - localVirtualCenter.x) ** 2 + (dy - localVirtualCenter.y) ** 2);
            distFromAnchor = distToVC - radius;
        }

        // Min length constraint
        const minBranchShapeXDelta = (routeList[0].shape == 'Arrow' ? 12 : 4);
        if (distFromAnchor < minBranchShapeXDelta) distFromAnchor = minBranchShapeXDelta;

        // Calculate Constrained Position in LOCAL space
        let constrainedLocalX, constrainedLocalY;
        if (isStraight) {
            constrainedLocalX = (sideSign * 12) + (sideSign * distFromAnchor);
            constrainedLocalY = dy; // Y is preserved (sliding)
        } else {
            constrainedLocalX = localVirtualCenter.x + (radius + distFromAnchor) * Math.cos(localNormalAngle);
            constrainedLocalY = localVirtualCenter.y + (radius + distFromAnchor) * Math.sin(localNormalAngle);
        }

        // Transform back to GLOBAL space
        // 1. Constrained Point
        const finalGlobalX = constrainedLocalX * Math.cos(mainAngle) - constrainedLocalY * Math.sin(mainAngle);
        const finalGlobalY = constrainedLocalX * Math.sin(mainAngle) + constrainedLocalY * Math.cos(mainAngle);

        if (routeList[0].shape !== 'UArrow Conventional') {
            routeList[0].x = center.x + finalGlobalX * length;
            routeList[0].y = center.y + finalGlobalY * length;
        }

        // 2. Helper Virtual Center (for drawing)
        // Note: For straight, we used sliding VCenter (x, dy).
        // For curved, we used static VCenter (x, y).
        const vcGlobalX = localVirtualCenter.x * Math.cos(mainAngle) - localVirtualCenter.y * Math.sin(mainAngle);
        const vcGlobalY = localVirtualCenter.x * Math.sin(mainAngle) + localVirtualCenter.y * Math.cos(mainAngle);
        const globalVirtualCenter = {
            x: center.x + vcGlobalX * length,
            y: center.y + vcGlobalY * length
        };

        // 3. Global Normal Angle (for drawing direction)
        const globalNormalAngle = localNormalAngle + mainAngle;

        // Generate Vertices
        let tempVertexList;
        if (isStraight) {
            tempVertexList = getOvalStraightSideRoadCoords(routeList[0], length, distFromAnchor * length, globalNormalAngle, globalVirtualCenter);
        } else {
            const totalArm = (radius + distFromAnchor) * length;
            tempVertexList = getConvRdAboutSideRoadCoords(routeList[0], length, totalArm, 12, globalNormalAngle, globalVirtualCenter);
        }

        // Only set left/top if sideRoad is a real object with those properties
        if (sideRoad && sideRoad.left !== undefined) {
            const offset = getInsertOffset(tempVertexList);
            sideRoad.left = offset.left;
            sideRoad.top = offset.top;
        }

        return { routeList, tempVertexList };
    }

    applySideRoadConstraintsDoubleRoundabout(sideRoad, mainRoad, routeList, xHeight) {
        const center = mainRoad.routeList[1];
        const length = xHeight / 4;
        const radius = 12; // 12 units radius

        // Check for Spiral feature
        const isSpiral = mainRoad.RAfeature && mainRoad.RAfeature.includes('Spiral');
        const spacing = isSpiral ? 38 : 28;

        // Main road rotation
        const mainAngle = (mainRoad.mainAngle || 0) * Math.PI / 180;

        // Global to Local (Rotate by -mainAngle) relative to Bottom Center (routeList[1])
        const dxGlobal = (routeList[0].x - center.x) / length;
        const dyGlobal = (routeList[0].y - center.y) / length;

        const dx = dxGlobal * Math.cos(-mainAngle) - dyGlobal * Math.sin(-mainAngle);
        const dy = dxGlobal * Math.sin(-mainAngle) + dyGlobal * Math.cos(-mainAngle);

        let localNormalAngle; // Direction of arm in Local Space
        let localVirtualCenter; // Pivot point for arm in Local Space

        // Two centers at (0,0) and (0, -spacing).
        const dist1 = dx * dx + dy * dy; // Distance squared to (0,0)
        const dist2 = dx * dx + (dy + spacing) * (dy + spacing); // Distance squared to (0, -spacing)

        if (dist1 < dist2) {
            // Closer to bottom center (0,0)
            localVirtualCenter = { x: 0, y: 0 };
        } else {
            // Closer to top center (0, -spacing)
            localVirtualCenter = { x: 0, y: -spacing };
        }

        const vY = dy - localVirtualCenter.y;
        const vX = dx - localVirtualCenter.x;
        const rawAngle = Math.atan2(vY, vX); // Angle from Virtual Center
        // Round to 15 deg
        const deg = rawAngle * 180 / Math.PI;
        let roundedDeg = Math.round(deg / 15) * 15;

        // Apply directional constraints (Double Roundabout splay)
        if (localVirtualCenter.y === -spacing) {
            // Top Center: Exclude downward cone (45 to 135)
            if (roundedDeg > 45 && roundedDeg < 135) {
                roundedDeg = (roundedDeg <= 90) ? 45 : 135;
            }
        } else {
            // Bottom Center: Exclude upward cone (-135 to -45)
            if (roundedDeg > -135 && roundedDeg < -45) {
                roundedDeg = (roundedDeg <= -90) ? -135 : -45;
            }
        }

        localNormalAngle = roundedDeg * Math.PI / 180;

        // Helper Virtual Center (for drawing)
        const vcGlobalX = localVirtualCenter.x * Math.cos(mainAngle) - localVirtualCenter.y * Math.sin(mainAngle);
        const vcGlobalY = localVirtualCenter.x * Math.sin(mainAngle) + localVirtualCenter.y * Math.cos(mainAngle);
        const globalVirtualCenter = {
            x: center.x + vcGlobalX * length,
            y: center.y + vcGlobalY * length
        };

        // Global Normal Angle (for drawing direction)
        const globalNormalAngle = localNormalAngle + mainAngle;

        let tempVertexList;

        if (isSpiral) {
            // Calculate Constrained Position in LOCAL space for Spiral (fixed radius 24)
            const constrainedLocalX = localVirtualCenter.x + 24 * Math.cos(localNormalAngle);
            const constrainedLocalY = localVirtualCenter.y + 24 * Math.sin(localNormalAngle);

            // Transform back to GLOBAL space
            const finalGlobalX = constrainedLocalX * Math.cos(mainAngle) - constrainedLocalY * Math.sin(mainAngle);
            const finalGlobalY = constrainedLocalX * Math.sin(mainAngle) + constrainedLocalY * Math.cos(mainAngle);

            if (!routeList[0].isBase) {
                routeList[0].x = center.x + finalGlobalX * length;
                routeList[0].y = center.y + finalGlobalY * length;
            }
            tempVertexList = getSpirRdAboutSideRoadCoords(routeList[0], length, globalNormalAngle, globalVirtualCenter);

        } else {
            // Calculate Arm Length
            // Radial distance from virtual center minus radius
            const distToVC = Math.sqrt((dx - localVirtualCenter.x) ** 2 + (dy - localVirtualCenter.y) ** 2);
            let distFromAnchor = distToVC - radius;

            // Min length constraint
            const minBranchShapeXDelta = (routeList[0].shape == 'Arrow' ? 12 : 4);
            if (distFromAnchor < minBranchShapeXDelta) distFromAnchor = minBranchShapeXDelta;

            // Calculate Constrained Position in LOCAL space
            const constrainedLocalX = localVirtualCenter.x + (radius + distFromAnchor) * Math.cos(localNormalAngle);
            const constrainedLocalY = localVirtualCenter.y + (radius + distFromAnchor) * Math.sin(localNormalAngle);

            // Transform back to GLOBAL space
            // 1. Constrained Point
            const finalGlobalX = constrainedLocalX * Math.cos(mainAngle) - constrainedLocalY * Math.sin(mainAngle);
            const finalGlobalY = constrainedLocalX * Math.sin(mainAngle) + constrainedLocalY * Math.cos(mainAngle);

            if (!routeList[0].isBase) {
                routeList[0].x = center.x + finalGlobalX * length;
                routeList[0].y = center.y + finalGlobalY * length;
            }

            const totalArm = (radius + distFromAnchor) * length;
            tempVertexList = getConvRdAboutSideRoadCoords(routeList[0], length, totalArm, 12, globalNormalAngle, globalVirtualCenter);
        }

        // Only set left/top if sideRoad is a real object with those properties
        if (sideRoad && sideRoad.left !== undefined) {
            const offset = getInsertOffset(tempVertexList);
            sideRoad.left = offset.left;
            sideRoad.top = offset.top;
        }

        return { routeList, tempVertexList };
    }

    /**
     * Constrains branch positions based on main road
     * @param {Object} mainRoad - The parent route
     * @return {Object} tempVertexList - Updated vertex list
     */
    constrainSideRoadPosition(mainRoad) {
        // Use the common constraint function
        const result = this.applySideRoadConstraints(
            this,
            mainRoad,
            this.routeList,
            this.side,
            this.xHeight
        );

        // Update instance properties with constrained values
        this.routeList = result.routeList;
        if (mainRoad.roadType == 'Main Line') {
            this.left = this.side ? this.routeList[0].x : mainRoad.left + mainRoad.width;
        }
        this.refTopLeft.left = this.left;
        //this.top = this.routeList[0].y;
        this.refTopLeft.top = this.top;

        return result.tempVertexList;
    }    /**
     * Updates route positions when branch is moved
     * @param {Event} event - Move event
     * @param {boolean} updateRoot - Whether to update the main road
     * @return {void}
     */
    onMove(event, updateRoot = true) {
        if (!this.mainRoad) return;

        const mainRoad = this.mainRoad;

        // Apply position constraints and get the updated vertex list
        const tempVertexList = this.constrainSideRoadPosition(mainRoad);

        // Create new polygon with constrained position
        const polygon1 = new GlyphPath();
        polygon1.initialize(tempVertexList, {
            left: 0,
            top: 0,
            angle: 0,
            fill: this.color,
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
        });

        this.replaceBasePolygon(polygon1, false);

        // Update root if needed
        if (updateRoot) {
            mainRoad.receiveNewRoute();
            mainRoad.setCoords();
        }
        this.basePolygon.setCoords();
        this.drawVertex()
    }
}
