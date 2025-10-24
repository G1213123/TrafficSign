import { BaseGroup, GlyphPath } from './draw.js';
import { calculateTransformedPoints, getInsertOffset } from './path.js';
import { roadMapTemplate, roundelTemplate } from './template.js';
import { calcSymbol } from './symbols.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { ShowHideSideBarEvent } from '../canvas/keyboardEvents.js';

const canvas = CanvasGlobals.canvas;
const canvasObject = CanvasGlobals.canvasObject;

const calcVertexType = {
    'Main Line': (xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) => calcMainRoadVertices(xHeight, routeList, innerCornerRadius, outerCornerRadius),
    'Conventional Roundabout': (xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) => calcRoundaboutVertices('Conventional', xHeight, routeList),
    'Spiral Roundabout': (xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) => calcRoundaboutVertices('Spiral', xHeight, routeList)
}

// Extract drawing functions from FormDrawMapComponent

/**
 * Calculates the correct bottom Y coordinate for a main road based on pivot points
 * @param {Object} RootTop - Top route object with angle, length, etc.
 * @param {Object} RootBottom - Bottom route object
 * @param {number} length - Calculated length (xHeight / 4)
 * @return {number} The calculated bottom Y coordinate
 */
function calculateMainRoadBottomY(RootTop, RootBottom, length) {
    // Get the angle in radians
    const angleRad = RootTop.angle === 0 ? 0 : RootTop.angle / Math.abs(RootTop.angle) * (90 - Math.abs(RootTop.angle)) * Math.PI / 180;

    // Get top vertices to calculate pivot points
    let RootTopVertex = getSideRoadCoords(RootTop, length);
    const topVertices = RootTopVertex.path[0].vertex;
    const topLeftVertex = topVertices[0];
    const topRightVertex = topVertices[topVertices.length - 1];
    const topVertex = topVertices.reduce((min, vertex) => vertex.y < min.y ? vertex : min, topVertices[0]);

    // Calculate pivot points
    const leftPivotX = RootBottom.x - RootBottom.width * length / 2;
    const rightPivotX = RootBottom.x + RootBottom.width * length / 2;
    let leftPivotY, rightPivotY;

    // Handle special cases for vertical angles (±90°)
    if (Math.abs(RootTop.angle) === 90) {
        leftPivotY = topLeftVertex.y;
        rightPivotY = topRightVertex.y;
    } else if (RootTop.angle == 0) {
        leftPivotY = topVertex.y + RootTop.length * length;
        rightPivotY = topVertex.y + RootTop.length * length;
    } else {
        // Normal case: calculate intersection using tangent
        leftPivotY = topLeftVertex.y + (leftPivotX - topLeftVertex.x) * Math.tan(-angleRad);
        rightPivotY = topRightVertex.y + (rightPivotX - topRightVertex.x) * Math.tan(-angleRad);
    }

    // Return the maximum of original bottom Y, and pivot points plus bottom length
    return Math.max(rightPivotY + RootBottom.length * length, leftPivotY + RootBottom.length * length);
}

/**
 * Calculates pivot points for a single arm
 * @param {Object} RootTop - Top route object
 * @param {Object} RootBottom - Bottom route object
 * @param {number} length - Calculated length (xHeight / 4)
 * @param {number} innerCornerRadius - Inner corner radius value
 * @param {number} outerCornerRadius - Outer corner radius value
 * @return {Object} Object containing left and right pivot points
 */
function calculatePivotPoints(RootTop, RootBottom, length, innerCornerRadius = null, outerCornerRadius = null) {
    let RootTopVertex = getSideRoadCoords(RootTop, length);
    const topVertices = RootTopVertex.path[0].vertex;

    // Get the angle in radians
    const angleRad = RootTop.angle === 0 ? 0 : RootTop.angle / Math.abs(RootTop.angle) * (90 - Math.abs(RootTop.angle)) * Math.PI / 180;

    // Get key vertices
    const topLeftVertex = topVertices[0];
    const topRightVertex = topVertices[topVertices.length - 1];
    const topVertex = topVertices.reduce((min, vertex) => vertex.y < min.y ? vertex : min, topVertices[0]);

    // Calculate pivot X coordinates
    const leftPivotX = RootBottom.x - RootBottom.width * length / 2;
    const midPivotX = RootBottom.x;
    const rightPivotX = RootBottom.x + RootBottom.width * length / 2;
    let leftPivotY, midPivotY, rightPivotY;

    // Handle special cases for vertical angles (±90°)
    if (Math.abs(RootTop.angle) === 90) {
        leftPivotY = topLeftVertex.y;
        midPivotY = topVertex.y;
        rightPivotY = topRightVertex.y;
    } else if (RootTop.angle == 0) {
        leftPivotY = topVertex.y + RootTop.length * length;
        midPivotY = topVertex.y + RootTop.length * length;
        rightPivotY = topVertex.y + RootTop.length * length;
    } else {
        // Normal case: calculate intersection using tangent
        leftPivotY = topLeftVertex.y + (leftPivotX - topLeftVertex.x) * Math.tan(-angleRad);
        midPivotY = topRightVertex.y + (midPivotX - topRightVertex.x) * Math.tan(-angleRad);
        rightPivotY = topRightVertex.y + (rightPivotX - topRightVertex.x) * Math.tan(-angleRad);
    }

    // Calculate radii - use provided values if available, otherwise use default calculation
    let leftRadius = null;
    let rightRadius = null;

    if (innerCornerRadius !== null && outerCornerRadius !== null) {
        // Use provided radius values
        switch (Math.sign(RootTop.angle)) {
            case 0:
                leftRadius = null;
                rightRadius = null;
                break;
            case 1:
                leftRadius = outerCornerRadius * length;
                rightRadius = innerCornerRadius * length;
                break;
            case -1:
                leftRadius = innerCornerRadius * length;
                rightRadius = outerCornerRadius * length;
                break;
        }
    } else {
        // Use default calculation
        switch (Math.sign(RootTop.angle)) {
            case 0:
                leftRadius = null;
                rightRadius = null;
                break;
            case 1:
                leftRadius = 4 * length;
                rightRadius = length;
                break;
            case -1:
                leftRadius = length;
                rightRadius = 4 * length;
                break;
        }
    }

    return {
        leftPivot: { x: leftPivotX, y: leftPivotY, display: 0, radius: leftRadius },
        midPivot: { x: midPivotX, y: midPivotY, display: 0, radius: 2 * length },
        rightPivot: { x: rightPivotX, y: rightPivotY, display: 0, radius: rightRadius },
        topVertex: RootTopVertex,
        angleRad
    };
}

/**
 * Processes vertex list and arcs for final output
 * @param {Array} vertexList - List of vertices
 * @param {Array} arcList - List of arcs
 * @param {Array} remainingPath - Additional paths to include
 * @return {Object} Processed vertex list object
 */
function processVertexListAndArcs(vertexList, arcList, remainingPath = []) {
    // Move the first vertex to the end of the list
    if (vertexList.length > 0) {
        const firstVertex = vertexList.shift();
        vertexList.push(firstVertex);
    }
    assignVertexLabel(vertexList);

    // remap the arc vertex
    function shiftV(v, vertexList) {
        let id = v.match(/\d+/)[0];
        id = id - 1 == 0 ? vertexList.length : id - 1;
        return `V${id}`;
    }
    arcList.map(arc => {
        arc.start = shiftV(arc.start, vertexList);
        arc.end = shiftV(arc.end, vertexList);
    });

    return { path: [{ 'vertex': vertexList, 'arcs': [...arcList] }, ...remainingPath] };
}

/**
 * Calculates vertices for Main Road with single arm (current implementation)
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcMainRoadVerticesSingleArm(xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) {
    const length = xHeight / 4;
    let RootBottom = routeList.filter(item => item.angle === 180)[0];
    let RootTop = routeList.filter(item => item.angle !== 180)[0];

    // Use common function to calculate pivot points
    const { leftPivot, rightPivot, topVertex: RootTopVertex } = calculatePivotPoints(RootTop, RootBottom, length, innerCornerRadius, outerCornerRadius);

    let RootBottomVertex = getSideRoadCoords(RootBottom, length);

    const vertexList = [...RootTopVertex.path[0].vertex, rightPivot, ...RootBottomVertex.path[0].vertex, leftPivot];
    const arcList = RootTopVertex.path[0].arcs;

    const remainingPath = [];
    if (RootTopVertex.path.length > 1) {
        remainingPath.push(...RootTopVertex.path.slice(-RootTopVertex.path.length + 1));
    }

    return processVertexListAndArcs(vertexList, arcList, remainingPath);
}

/**
 * Calculates vertices for Main Road with multiple arms
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcMainRoadVerticesMultipleArms(xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) {
    const length = xHeight / 4;
    let RootBottom = routeList.filter(item => item.angle === 180)[0];
    let RootTops = routeList.filter(item => item.angle !== 180);

    // For multiple arms, we need to calculate vertices for each arm and combine them
    let allVertices = [];
    let allArcs = [];
    let lastRightPivot = null;

    // Process each arm using the common pivot calculation function
    RootTops.forEach((RootTop, index) => {
        const { leftPivot, midPivot, rightPivot, topVertex: RootTopVertex } = calculatePivotPoints(RootTop, RootBottom, length, innerCornerRadius, outerCornerRadius);

        // Add vertices for this arm
        allVertices.push(...RootTopVertex.path[0].vertex);
        if (index === RootTops.length - 1) {
            // Only add right pivot after the last arm
            allVertices.push(rightPivot);
            lastRightPivot = rightPivot;
        } else {
            // Add mid pivot for all but the last arm
            allVertices.push(midPivot);
        }

        // Collect arcs from this arm
        allArcs.push(...RootTopVertex.path[0].arcs);
    });

    // Add bottom vertices
    let RootBottomVertex = getSideRoadCoords(RootBottom, length);
    allVertices.push(...RootBottomVertex.path[0].vertex);

    // Add left pivot at the end (calculate based on first arm)
    if (RootTops.length > 0) {
        const { leftPivot } = calculatePivotPoints(RootTops[0], RootBottom, length, innerCornerRadius, outerCornerRadius);
        allVertices.push(leftPivot);
    }

    return processVertexListAndArcs(allVertices, allArcs);
}

/**
 * Calculates vertices for Main Road
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcMainRoadVertices(xHeight, routeList, innerCornerRadius = null, outerCornerRadius = null) {
    const topRoutes = routeList.filter(item => item.angle !== 180);

    if (topRoutes.length === 1) {
        // Single arm - use existing implementation
        return calcMainRoadVerticesSingleArm(xHeight, routeList, innerCornerRadius, outerCornerRadius);
    } else {
        // Multiple arms - use new implementation
        return calcMainRoadVerticesMultipleArms(xHeight, routeList, innerCornerRadius, outerCornerRadius);
    }
}

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
 * Calculates vertices for a conventional roundabout
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes with the center point
 * @return {Object} Vertex list object for roundabout
 */
function calcRoundaboutVertices(type, xHeight, routeList) {
    const length = xHeight / 4
    const center = routeList[1] // use tip location
    const templateName = routeList[0].shape + ' ' + type
    let roundel = roundelTemplate(templateName, routeList[1].length)
    roundel = calcSymbol(roundel, length)
    roundel.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: center.x,
            y: center.y,
            angle: 0
        });
        p.vertex = transformed
    });

    return roundel;
}


/**
 * Gets coordinates for side road endpoints
 * @param {Object} route - main road object
 * @param {number} length - Route length
 * @param {number} left - Left boundary
 * @param {number} right - Right boundary
 * @return {Array} Array of vertex coordinates
 */
function getSideRoadCoords(route, length, left, right) {
    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]))
    // Apply vertex and arc scaling to each path
    arrowTipPath.path.forEach((path) => {
        path.vertex.map((v) => { v.x *= route.width / 2; v.y *= route.width / 2; v.radius *= route.width / 2 })
        if (path.arcs) {
            path.arcs.map((a) => { a.radius *= route.width / 2 })
        }
    })
    arrowTipPath = calcSymbol(arrowTipPath, length)
    arrowTipPath.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: route.x,
            y: route.y,
            angle: route.angle
        });
        p.vertex = transformed
    });
    let arrowTipVertex = arrowTipPath.path[0].vertex
    if (route.angle != 0 && route.angle != 180) {
        if (route.x < left) {
            const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: left, y: i1.y + offsetDistance * length, display: 0 }
            const i3 = { x: left, y: i2.y - offsetDistance * length, display: 0 }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (route.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: right, y: i1.y - offsetDistance * length, display: 0 }
            const i3 = { x: right, y: i2.y + offsetDistance * length, display: 0 }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        }
    }

    //assignVertexLabel(arrowTipVertex)
    arrowTipPath.path[0].vertex = arrowTipVertex
    return arrowTipPath
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

    arrowTipPath = calcSymbol(arrowTipPath, length);
    const transform = route.shape !== 'UArrow Conventional' ? {
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
function getSpirRdAboutSideRoadCoords(route, length, angle, center) {

    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]));
    arrowTipPath = calcSymbol(arrowTipPath, length);
    const transform = route.shape !== 'UArrow Spiral' ? {
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

function addUTurnToMainRoad(mainRoad) {
    const center = mainRoad.routeList[1] // use tip location

    // Create options for the arm
    const options = {
        mainRoad: mainRoad,
        color: mainRoad.color,
        x: center.x,
        y: center.y,
        routeList: [{
            x: 6 + center.x, y: 33.4 + (mainRoad.roadType == 'Spiral Roundabout' ? 2 : 0) + center.y,
            angle: 0,
            shape: 'UArrow ' + mainRoad.roadType.split(' ')[0],
            width: 4
        }],
        xHeight: mainRoad.xHeight,
    };

    // Declare variables outside the if-else blocks 
    let routeList = options.routeList;
    let arrow = JSON.parse(JSON.stringify(roadMapTemplate[routeList[0].shape]))
    arrow = calcSymbol(arrow, mainRoad.xHeight / 4)

    // Create and initialize the side road
    const sideRoad = new SideRoadSymbol(options);
    //sideRoad.initialize(arrow);


    // Update main road to show how it would look with the new side road
    //mainRoad.receiveNewRoute(tempVertexList);
    //mainRoad.setCoords();
    mainRoad.sideRoad.push(sideRoad);
    sideRoad.mainRoad = mainRoad;
}


/**
 * Assigns labels to route vertices
 * @param {Array} vertexList - List of vertices to label
 * @return {void}
 */
function assignVertexLabel(vertexList) {
    vertexList.map((vertex, index) => {
        vertex.label = `V${index + 1}`
        vertex.start = index == 0 ? 1 : 0
    })
}

/**
 * MainRoute class extends baseGroup to create route objects
 */
class MainRoadSymbol extends BaseGroup {
    constructor(options = {}) {
        // We need to pass null as basePolygon initially, as we'll set it after initialize()
        super(null, 'MainRoad', 'MainRoadSymbol', options);

        // Initialize route-specific properties
        this.routeList = options.routeList || [];
        this.routeCenter = options.routeCenter || [];
        this.xHeight = options.xHeight || 100;
        this.rootLength = options.rootLength ?? 7;
        this.tipLength = options.tipLength ?? 12;
        this.routeWidth = options.routeWidth ?? 6;
        this.color = options.color || 'white';
        this.roadType = options.roadType || 'Main Line';
        this.sideRoad = [];
        this.RAfeature = options.RAfeature || 'Conventional';
        this.innerCornerRadius = options.innerCornerRadius || null;
        this.outerCornerRadius = options.outerCornerRadius || null;

        this.initialize();

        // Bind events
        this.on('selected', roadMapOnSelect);
        this.on('deselected', roadMapOnDeselect);
        this.on('moving', this.onMove.bind(this));
        this.on('moved', this.onMove.bind(this));
        this.on('modified', this.onMove.bind(this));
    }    /**
     * Initialize the route with a GlyphPath
     * @param {Object} vertexList - Vertex data for the route
     * @return {MainRoadSymbol} - The initialized route
     */
    initialize() {
        const vertexList = calcVertexType[this.roadType](this.xHeight, this.routeList, this.innerCornerRadius, this.outerCornerRadius)
        const arrow = new GlyphPath();
        arrow.initialize(vertexList, {
            left: 0,
            top: 0,
            angle: 0,
            fill: this.color,
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
        });

        // Set the basePolygon that was initially null in the constructor
        this.setBasePolygon(arrow, false)

        // Add special features based on RAfeature
        if (this.RAfeature === 'U-turn') {
            addUTurnToMainRoad(this);
        }

        return this;
    }


    /**
     * Updates base route object when receiving new route additions
     * @param {Object} branchRouteList - Optional route object to add (legacy)
     * @return {void}
     */
    receiveNewRoute(newSideRoad = null) {
        if (this.roadType !== 'Main Line') {
            if (newSideRoad) {
                this.sideRoad.push(newSideRoad);
            }
            return;
        }
        const topList = this.routeList.filter(route => route.angle !== 180)[0];
        const bottomList = this.routeList.filter(route => route.angle === 180)[0];
        const length = this.xHeight / 4;

        if (newSideRoad) {
            this.sideRoad.push(newSideRoad);
        }

        // Use the extracted function to calculate the proper bottom Y coordinate
        let newBottom = calculateMainRoadBottomY(topList, bottomList, length);

        // Also consider side roads when calculating bottom position
        this.sideRoad.forEach(side => {
            const sideBottom = side.side ? side.basePolygon.vertex[5].y : side.basePolygon.vertex[2].y;
            if (sideBottom + bottomList.length * length > newBottom) {
                newBottom = sideBottom + bottomList.length * length;
            }
        });

        this.routeList.forEach(route => {
            if (route.angle === 180) {
                route.y = newBottom;
            }
        });
        let newVertexList = calcVertexType[this.roadType](this.xHeight, this.routeList, this.innerCornerRadius, this.outerCornerRadius);
        const newPolygon = new GlyphPath();
        newPolygon.initialize(newVertexList, {
            left: 0,
            top: 0,
            angle: 0,
            fill: this.color,
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
        });

        this.replaceBasePolygon(newPolygon, false);
        this.setCoords();
        //this.drawVertex(false);
        CanvasGlobals.scheduleRender()
    }

    /**
     * Updates route positions when root is moved
     * @param {Event} event - Move event
     * @return {void}
     */
    onMove(event) {
        this.sideRoad.forEach((side, index) => {
            side.onMove(null, true);
        });
        this.receiveNewRoute();
        this.setCoords();
    }
}

/**
 * SideRoadSymbol class extends baseGroup for side roads
 */
class SideRoadSymbol extends BaseGroup {
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


/**
 * Handles route object selection
 * @param {Event} event - Selection event
 * @return {void}
 */
function roadMapOnSelect(event) {
    const panel = document.getElementById("button-DrawMap");
    const parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObjects()
    if (panel && parent && existingRoute.length == 1 && existingRoute[0].functionalType === 'MainRoad') {
        //GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', parent, 'input', FormDrawMapComponent.addRouteInput, 'click')
    }

    // Enable side road button and make it active
    toggleButtonState('button-addRoute', true);
}

/**
 * Handles route object deselection
 * @param {Event} event - Deselection event
 * @return {void}
 */
function roadMapOnDeselect(event) {
    const panel = document.getElementById("button-addRoute");
    if (panel) {
        //panel.parentNode.parentNode.removeChild(panel.parentNode)
    }
    //canvas.off('mouse:move', drawBranchRouteOnCursor)
    //existingRoute.routeList = existingRoute.tempRootList || existingRoute.routeList

    // Disable side road button
    toggleButtonState('button-addRoute', false);
}

/**
 * Toggles the state of a button to either active or deactive
 * @param {string} buttonId - The ID of the button to toggle
 * @param {boolean} isActive - Whether to make the button active (true) or deactive (false)
 */
function toggleButtonState(buttonId, isActive) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    if (isActive) {
        button.classList.remove('deactive');
        button.disabled = false;
    } else {
        button.classList.add('deactive');
        button.disabled = true;
    }
}

export {
    MainRoadSymbol,
    SideRoadSymbol,
    calcMainRoadVertices,
    calcMainRoadVerticesSingleArm,
    calcMainRoadVerticesMultipleArms,
    calcRoundaboutVertices,
    calcVertexType,
    roadMapOnSelect,
    roadMapOnDeselect,
    calculateMainRoadBottomY,
};