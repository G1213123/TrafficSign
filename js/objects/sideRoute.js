import { BaseGroup, GlyphPath } from './draw.js';
import { calculateTransformedPoints, getInsertOffset } from './path.js';
import { roadMapTemplate } from './template.js';
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

    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]));
    if (route.shape !== 'UArrow Conventional') {
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
    const rootShape = route.shape == 'Spiral Arrow' ? 'Arrow' : route.shape; // legacy shape for spiral legs

    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[rootShape]));

    const width = route.width;
    // Scale vertices for all paths
    arrowTipPath.path.forEach(p => {
        p.vertex.forEach(v => { v.x *= width / 2; v.y *= width / 2; });
    });

    const rCenter = { x: 0, y: 24 };
    const rAngle = 5 * Math.PI / 180;

    arrowTipPath.path.forEach(p => {
        p.vertex.forEach(v => {
            const dx = v.x - rCenter.x;
            const dy = v.y - rCenter.y;
            v.x = rCenter.x + dx * Math.cos(rAngle) - dy * Math.sin(rAngle);
            v.y = rCenter.y + dx * Math.sin(rAngle) + dy * Math.cos(rAngle);
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
 * SideRoadSymbol class extends baseGroup for side roads
 */
export class SideRoadSymbol extends BaseGroup {
    constructor(options = {}) {
        // Initialize with null basePolygon, will set it later
        super(null, 'SideRoad', 'SideRoadSymbol', options);

        // Branch-specific properties
        this.routeList = options.routeList || [];
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
        const minBranchShapeXDelta = (routeList[0].shape == 'Arrow' ? radius : 4);
        const minBranchXDelta = (minBranchShapeXDelta + radius) * xHeight / 4;
        const center = mainRoad.routeList[1]
        const length = xHeight / 4

        const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
        // Convert to degrees, round to nearest 15 degrees, then back to radians
        const angleInDegrees = rawAngleToCenter * 180 / Math.PI
        const roundedDegrees = Math.round(angleInDegrees / 15) * 15
        const angleToCenter = roundedDegrees * Math.PI / 180
        const distToCenter = Math.max(minBranchXDelta, Math.sqrt((routeList[0].y - center.y) ** 2 + (routeList[0].x - center.x) ** 2))

        if (routeList[0].shape !== 'UArrow Conventional') {
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

        const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
        // Convert to degrees, round to nearest 15 degrees, then back to radians
        const angleInDegrees = rawAngleToCenter * 180 / Math.PI
        const roundedDegrees = Math.round(angleInDegrees / 15) * 15
        const angleToCenter = roundedDegrees * Math.PI / 180
        const distToCenter = 24 * length

        if (routeList[0].shape !== 'UArrow Spiral') {
            routeList[0].x = center.x + distToCenter * Math.cos(angleToCenter)
            routeList[0].y = center.y + distToCenter * Math.sin(angleToCenter)
        }

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
        const center = mainRoad.routeList[1]
        const length = xHeight / 4 // Use the parameter directly for temp objects without sideRoad object

        const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
        // Convert to degrees, round to nearest 15 degrees, then back to radians
        const angleInDegrees = rawAngleToCenter * 180 / Math.PI
        const roundedDegrees = Math.round(angleInDegrees / 15) * 15
        const angleToCenter = roundedDegrees * Math.PI / 180
        const distToCenter = 24 * length

        if (routeList[0].shape !== 'UArrow Spiral') {
            routeList[0].x = center.x + distToCenter * Math.cos(angleToCenter)
            routeList[0].y = center.y + distToCenter * Math.sin(angleToCenter)
        }

        const tempVertexList = getSpirRdAboutSideRoadCoords(routeList[0], length, angleToCenter, center);

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
