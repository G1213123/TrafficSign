

const calcVertexType = {
    'Main Line': calcMainRoadVertices,
    'Conventional Roundabout': (xHeight, routeList) => calcRoundaboutVertices('Conventional', xHeight, routeList),
    'Spiral Roundabout': (xHeight, routeList) => calcRoundaboutVertices('Spiral', xHeight, routeList)
}

// Extract drawing functions from FormDrawMapComponent

/**
 * Calculates vertices for Main Road
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcMainRoadVertices(xHeight, routeList) {
    const length = xHeight / 4
    let RootBottom = routeList.filter(item => item.angle === 180)[0]
    let RootTop = routeList.filter(item => item.angle === 0)[0]
    let RootBottomVertex = getSideRoadCoords(RootBottom, length)
    let RootTopVertex = getSideRoadCoords(RootTop, length)

    const vertexList = [...RootTopVertex.path[0].vertex, ...RootBottomVertex.path[0].vertex]
    // Move the first vertex to the end of the list
    if (vertexList.length > 0) {
        const firstVertex = vertexList.shift();
        vertexList.push(firstVertex);
    }
    assignVertexLabel(vertexList)
    return { path: [{ 'vertex': vertexList, 'arcs': [] }] };
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
    let RootLeft = mainRouteList[0].x - mainRouteList[0].width * xHeight / 8
    let RootRight = mainRouteList[0].x + mainRouteList[0].width * xHeight / 8

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
    let roundel = JSON.parse(JSON.stringify(roadMapTemplate[templateName]))
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
    arrowTipPath.path[0].vertex.map((v) => { v.x *= route.width / 2; v.y *= route.width / 2 })
    arrowTipPath = calcSymbol(arrowTipPath, length)
    arrowTipPath.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: route.x,
            y: route.y,
            angle: route.angle
        });
        p.vertex = transformed
    });
    arrowTipVertex = arrowTipPath.path[0].vertex
    if (route.angle != 0 && route.angle != 180) {
        if (route.x < left) {
            const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 0 }
            const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 0 }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: left, y: i1.y + offsetDistance * length, display: 0 }
            const i3 = { x: left, y: i2.y - offsetDistance * length, display: 0 }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (route.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 0 }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 0 }
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

    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]))
    if (route.shape !== 'UArrow Conventional') {
        const width = route.width
        arrowTipPath.path[0].vertex.map((v) => { v.x *= width / 2; v.y *= width / 2 })
        arrowTipVertex = arrowTipPath.path[0].vertex
    
        // for Stub
        //const ic = { x: width / 2, y: Math.sqrt(radius ** 2 - (width / 2) ** 2) }
        const trimCenter = { x: width / 2 + 1, y: Math.sqrt((radius + 1) ** 2 - (width / 2 + 1) ** 2) }
        const tCenterAngle = Math.atan2(trimCenter.y, trimCenter.x)
        const i2 = { x: width / 2, y: arm / length - trimCenter.y, display: 0 }
        const i3 = { x: trimCenter.x - Math.cos(tCenterAngle), y: arm / length - trimCenter.y + Math.sin(tCenterAngle), display: 0 }
        const i0 = { x: -i3.x, y: i3.y, display: 0 }
        const i1 = { x: -i2.x, y: i2.y, display: 0 }
        arrowTipVertex = [...arrowTipVertex, i2, i3, i0, i1,]
        arrowTipVertex.push(arrowTipVertex.shift())
        assignVertexLabel(arrowTipVertex)
    
    
        arrowTipPath.path[0].arcs.push(...[
            { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
            { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
            { start: 'V5', end: 'V6', radius: 1, direction: 0, sweep: 0 },
        ])
        arrowTipPath.path[0].vertex = arrowTipVertex
    } 

    arrowTipPath = calcSymbol(arrowTipPath, length)
    const transform = route.shape !== 'UArrow Conventional'?{
        x: route.x,
        y: route.y,
        angle: angle / Math.PI * 180 + 90
    } : {
        x: center.x,
        y: center.y,
        angle: 0
    }
    arrowTipPath.path[0].vertex = calculateTransformedPoints(arrowTipPath, transform)

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
function getSpirRdAboutSideRoadCoords(route, length, angle, center) {

    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]))
    //const width = route.width
    //arrowTipPath.path[0].vertex.map((v) => { v.x *= width / 2; v.y *= width / 2 })
    arrowTipVertex = arrowTipPath.path[0].vertex


    arrowTipPath = calcSymbol(arrowTipPath, length)
    const transform = route.shape !== 'UArrow Spiral'?{
        x: route.x,
        y: route.y,
        angle: angle / Math.PI * 180 + 90
    } : {
        x: center.x,
        y: center.y,
        angle: 0
    }
    arrowTipPath.path[0].vertex = calculateTransformedPoints(arrowTipPath, transform)
    return arrowTipPath
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
        super(null, 'MainRoad', options);

        // Initialize route-specific properties
        this.routeList = options.routeList || [];
        this.routeCenter = options.routeCenter || [];
        this.xHeight = options.xHeight || 100;
        this.rootLength = options.rootLength ?? 7;
        this.tipLength = options.tipLength ?? 12;
        this.color = options.color || 'white';
        this.roadType = options.roadType || 'Main Line';
        this.sideRoad = [];
        this.RAfeature = options.RAfeature || 'Conventional';

        // Bind events
        this.on('selected', roadMapOnSelect);
        this.on('deselected', roadMapOnDeselect);
        this.on('moving', this.onMove.bind(this));
        this.on('moved', this.onMove.bind(this));
        this.on('modified', this.onMove.bind(this));
    }

    /**
     * Initialize the route with a GlyphPath
     * @param {Object} vertexList - Vertex data for the route
     * @return {Promise<MainRoadSymbol>} - The initialized route
     */
    async initialize(vertexList) {
        const arrow = new GlyphPath();
        await arrow.initialize(vertexList, {
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


        return this;
    }

    /**
     * Updates base route object when receiving new route additions
     * @param {Object} branchRouteList - Optional route object to add
     * @return {Promise<void>}
     */
    async receiveNewRoute(tempBranchRouteList = null) {
        if (this.roadType !== 'Main Line') {
            const newPolygon = new GlyphPath();
            await newPolygon.initialize(calcVertexType[this.roadType](this.xHeight, this.routeList), {
                left: 0,
                top: 0,
                angle: 0,
                fill: this.color,
                objectCaching: false,
                dirty: true,
                strokeWidth: 0
            });
            this.replaceBasePolygon(newPolygon)
            return;
        }
        let newBottom = this.top + (this.tipLength) * this.xHeight / 4;
        if (tempBranchRouteList) {
            const vertexList = tempBranchRouteList.path ? tempBranchRouteList.path[0].vertex : tempBranchRouteList.basePolygon.vertex;

            let bottommostY = -Infinity;
            // Loop through all vertices to find the leftmost and bottommost points
            for (const vertex of vertexList) {
                if (vertex.y > bottommostY) { // Note: y increases downward in canvas
                    bottommostY = vertex.y;
                }
            }
            newBottom = bottommostY;
        }

        this.routeList.forEach(route => {
            if (route.angle === 180) {
                route.y = Math.max(...[newBottom, ...this.sideRoad.map(b => b.top + b.height)]) + this.rootLength * this.xHeight / 4;
            }
        });

        let newVertexList = calcVertexType[this.roadType](this.xHeight, this.routeList);
        const newPolygon = new GlyphPath();
        await newPolygon.initialize(newVertexList, {
            left: 0,
            top: 0,
            angle: 0,
            fill: this.color,
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
        });

        this.replaceBasePolygon(newPolygon, false);
        this.drawVertex(false);
        canvas.renderAll()
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
        super(null, 'SideRoad', options);

        // Branch-specific properties
        this.routeList = options.routeList || [];
        this.xHeight = options.xHeight || 100;
        this.color = options.color || 'white';
        this.mainRoad = options.mainRoad || null;
        this.side = options.side || false; // false = right, true = left
        this.branchIndex = options.branchIndex || 0;

        // Bind events
        this.on('moving', this.onMove.bind(this));
        this.on('moved', this.onMove.bind(this));
        this.on('modified', this.onMove.bind(this));
    }

    /**
     * Initialize the branch with a GlyphPath
     * @param {Object} vertexList - Vertex data for the branch
     * @return {Promise<SideRoadSymbol>} - The initialized branch
     */
    async initialize(vertexList) {
        const branch = new GlyphPath();
        await branch.initialize(vertexList, {
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

        return this;
    }

    /**
     * Constrains branch positions based on main road
     * @param {Object} mainRoad - The parent route
     * @return {Object} tempVertexList - Updated vertex list
     */
    constrainSideRoadPosition(mainRoad) {
        // Use the common constraint function
        const result = applySideRoadConstraints(
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
    }

    /**
     * Updates route positions when branch is moved
     * @param {Event} event - Move event
     * @param {boolean} updateRoot - Whether to update the main road
     * @return {Promise<void>}
     */
    async onMove(event, updateRoot = true) {
        if (!this.mainRoad) return;

        const mainRoad = this.mainRoad;

        // Apply position constraints and get the updated vertex list
        const tempVertexList = this.constrainSideRoadPosition(mainRoad);

        // Create new polygon with constrained position
        const polygon1 = new GlyphPath();
        await polygon1.initialize(tempVertexList, {
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
            mainRoad.receiveNewRoute(this);
            mainRoad.setCoords();
        }
        this.basePolygon.setCoords();
    }
}

/**
 * Applies position constraints to side road coordinates
 * @param {Object} sideRoad - The side road object
 * @param {Object} mainRoad - The parent road object
 * @param {Array} sideRouteList - The side road list to constrain
 * @param {boolean} isSideLeft - Whether branch is on left side
 * @param {number} xHeight - X-height value for measurements
 * @return {Object} - Updated side road data and vertex list
 */
function applySideRoadConstraints(sideRoad, mainRoad, sideRouteList, isSideLeft, xHeight) {
    // Make a copy to avoid modifying the original
    const routeList = JSON.parse(JSON.stringify(sideRouteList));

    switch (mainRoad.roadType) {
        case 'Main Line':
            return applyConstraintsMainLine(sideRoad, mainRoad, routeList, isSideLeft, xHeight)
        case 'Conventional Roundabout':
            return applySideRoadConstraintsRoundabout(sideRoad, mainRoad, routeList, xHeight)
        case 'Spiral Roundabout':
            return applySideRoadConstraintsSpiralRoundabout(sideRoad, mainRoad, routeList, xHeight)
    }

}

function applyConstraintsMainLine(sideRoad, mainRoad, routeList, isSideLeft, xHeight) {
    // Horizontal constraint based on side
    const rootLeft = mainRoad.routeList[0].x - mainRoad.routeList[0].width * mainRoad.xHeight / 8;
    const rootRight = mainRoad.routeList[0].x + mainRoad.routeList[0].width * mainRoad.xHeight / 8;
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
    const rootTop = mainRoad.routeList[1].y;
    const tipLength = mainRoad.tipLength * mainRoad.xHeight / 4;

    // Calculate vertices with current position
    let tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);

    // Get the vertex that should touch the root (depends on side)
    const rootTopTouchY = tempVertexList.path[0].vertex[isSideLeft ? 3 : 4];

    // Ensure branch doesn't go above root + tip length
    if (rootTopTouchY.y < rootTop + tipLength) {
        // Push branch down if needed
        const adjustment = rootTop + tipLength - rootTopTouchY.y;
        routeList[0].y += adjustment;

        // Recalculate vertices with new position
        tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);
        sideRoad.top = Math.min(...tempVertexList.path[0].vertex.map(v => v.y));
    }

    return { routeList, tempVertexList };
}

function applySideRoadConstraintsRoundabout(sideRoad, mainRoad, routeList, xHeight) {
    // Horizontal constraint based on side
    const radius = 12
    const minBranchShapeXDelta = radius + routeList[0].shape == 'Stub' ? 4 : radius;
    const minBranchXDelta = (minBranchShapeXDelta + radius) * xHeight / 4;
    const center = mainRoad.routeList[1]
    const length = xHeight / 4

    const rawAngleToCenter = Math.atan2(routeList[0].y - center.y, routeList[0].x - center.x)
    // Convert to degrees, round to nearest 15 degrees, then back to radians
    const angleInDegrees = rawAngleToCenter * 180 / Math.PI
    const roundedDegrees = Math.round(angleInDegrees / 15) * 15
    const angleToCenter = roundedDegrees * Math.PI / 180
    const distToCenter = Math.max(minBranchXDelta, Math.sqrt((routeList[0].y - center.y) ** 2 + (routeList[0].x - center.x) ** 2))

    if (routeList[0].shape !== 'UArrow Conventional' ) {
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

function applySideRoadConstraintsSpiralRoundabout(sideRoad, mainRoad, routeList, xHeight) {
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
 * Draws new route cursor on canvas for initial placement
 * @param {Event} event - The triggering event object
 * @param {Object} params - Optional parameters for testing
 * @return {Promise<void>}
 */
async function drawMainRoadOnCursor(event, params = null) {
    // In case only update parameters of cursor object
    //if (!event || !event.target || event.target.id !== 'button-DrawMap') {
    //    if (cursor._objects.length == 0) {
    //        return;
    //    }
    //}

    // Remove existing event listeners first to avoid duplicates
    drawRoadsHandlerOff();

    canvas.discardActiveObject();
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelDraw);

    // Get parameters either from DOM elements or provided params
    let xHeight, rootLength, tipLength, color, width, shape, roadType;

    if (params) {
        xHeight = params.xHeight || 100;
        rootLength = params.rootLength || 7;
        tipLength = params.tipLength || 12;
        color = params.color || 'white';
        width = params.width || 6;
        shape = params.shape || 'Arrow';
        roadType = params.roadType || 'Main Line';
        RAfeature = params.roundaboutFeatures || 'Normal';
    } else {
        return;
    }

    // Center the object on the canvas viewport
    const canvasCenter = CenterCoord()
    const centerX = canvasCenter.x;
    const centerY = canvasCenter.y;

    // Create route list centered on the canvas
    let routeList = [
        { x: centerX, y: centerY + (rootLength + tipLength) * xHeight / 4, angle: 180, width: width, shape: roadType == 'Main Line' ? 'Stub' : RAfeature },
        { x: centerX, y: centerY, angle: 0, width: width, shape: shape }
    ];

    // Create route options for the MainRoadSymbol
    const routeOptions = {
        routeList: routeList,
        xHeight: xHeight,
        color: color,
        rootLength: rootLength,
        tipLength: tipLength,
        roadType: roadType
    };

    // Create and initialize the MainRoadSymbol
    const routeMap = new MainRoadSymbol(routeOptions);
    await routeMap.initialize(calcVertexType[roadType](routeOptions.xHeight, routeOptions.routeList));

    // Add u turn route
    if (RAfeature == 'U-turn') {
        await addUTurnRoute(routeMap);
    }

    // Store reference to the new road object
    canvas.newSymbolObject = routeMap;

    // Add mouse event handlers for placement
    canvas.on('mouse:move', mainRoadOnMouseMove);
    canvas.on('mouse:down', finishDrawMainRoad);

    // Activate the vertex control immediately to enable dragging and snapping
    if (routeMap.controls && routeMap.controls.V1) {
        activeVertex = routeMap.controls.V1;
        activeVertex.isDown = true;
        activeVertex.originalPosition = {
            left: routeMap.left + routeMap.width / 2,
            top: routeMap.top
        };

        // Store vertex information
        const v1 = routeMap.getBasePolygonVertex('V1');
        if (v1) {
            activeVertex.vertexOriginalPosition = {
                x: v1.x,
                y: v1.y
            };
            activeVertex.vertexOffset = {
                x: v1.x - routeMap.left,
                y: v1.y - routeMap.top
            };

            // Create indicator for the active vertex
            if (activeVertex.createIndicator) {
                activeVertex.createIndicator(v1.x, v1.y);
            }
        }
    }

    canvas.renderAll();
}

async function addUTurnRoute(mainRoad) {

    // Create options for the arm
    const options = {
        x: 0,
        y: 0,
        routeList: [{
            x: 6, y: 33.4 + (mainRoad.roadType == 'Spiral Roundabout' ? 2 : 0),
            angle: 0,
            shape: 'UArrow ' + mainRoad.roadType.split(' ')[0],
            width: 4
        }]
    };

    // Declare variables outside the if-else blocks 
    let routeList = options.routeList;
    let arrow = JSON.parse(JSON.stringify(roadMapTemplate[routeList[0].shape]))
    arrow = calcSymbol(arrow, mainRoad.xHeight / 4)

    // Create and initialize the side road
    const sideRoad = new SideRoadSymbol(options);
    await sideRoad.initialize(arrow);


    // Update main road to show how it would look with the new side road
    //mainRoad.receiveNewRoute(tempVertexList);
    //mainRoad.setCoords();
    mainRoad.sideRoad.push(sideRoad);
    sideRoad.mainRoad = mainRoad;
}

/**
 * Handle mouse movement for road symbol placement
 * @param {Event} event - Mouse event
 */
function mainRoadOnMouseMove(event) {
    if (canvas.newSymbolObject && activeVertex) {
        const pointer = canvas.getPointer(event.e);

        // If we have an active vertex, let it handle the movement
        if (activeVertex.handleMouseMoveRef) {
            // Simulate a mouse move event with the current pointer
            const simulatedEvent = {
                e: event.e,
                pointer: pointer
            };
            activeVertex.handleMouseMoveRef(simulatedEvent);
        } else {
            // Fallback direct positioning if vertex control isn't active
            canvas.newSymbolObject.set({
                left: pointer.x,
                top: pointer.y
            });
            canvas.newSymbolObject.setCoords();
            canvas.renderAll();
        }
    }
}

/**
 * Handles mouse click to place route on canvas
 * @param {Event} event - Mouse event
 * @param {Object} options - Optional parameters
 * @return {Promise<void>}
 */
async function finishDrawMainRoad(event, options = null) {
    if (event.e.button !== 0) return;

    // Finalize main road placement on click
    if (canvas.newSymbolObject) {
        // Complete the placement
        if (activeVertex) {
            activeVertex.handleMouseDownRef(event);
        }

        // Set active object
        canvas.discardActiveObject();
        const placedRoad = canvas.newSymbolObject;

        // Reset state
        canvas.newSymbolObject = null;
        activeVertex = null;

        // Clean up
        drawRoadsHandlerOff();

        // Make the new road active after a slight delay
        setTimeout(() => {
            canvas.setActiveObject(placedRoad);
        }, 300);
    }
}

/**
 * Draws side road cursor for adding routes to existing root
 * @param {Event} event - Mouse event
 * @param {Object} option - Optional parameters for testing
 * @return {Promise<void>}
 */
async function drawSideRoadOnCursor(event, option = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelDraw);

    const mainRoad = canvas.getActiveObject();
    if (!mainRoad || mainRoad.functionalType !== 'MainRoad') return;

    // Clear any existing temp side road
    if (canvas.newSymbolObject) {
        // If there's already a temp side road, remove it
        const existingSideRoad = canvas.newSymbolObject;
        if (existingSideRoad.functionalType === 'SideRoad') {
            existingSideRoad.deleteObject && existingSideRoad.deleteObject();
            canvas.newSymbolObject = null;
        }
    }

    // Declare variables outside the if-else blocks 
    let routeList = [];
    let angle, shape, width, pointer;

    if (option) {
        // Handle direct parameter input for testing
        if (option.routeList) {
            // Direct route list provided
            routeList = option.routeList;
            angle = option.angle;
        } else {
            // Parameters for creating a route list
            pointer = { x: option.x, y: option.y };
            angle = option.routeParams?.angle || 60;
            shape = option.routeParams?.shape || 'Arrow';
            width = option.routeParams?.width || 4;

            // Create route list with parameters
            if (pointer.x < mainRoad.left + mainRoad.width / 2) {
                angle = -Math.abs(angle); // Make angle negative for left side
            } else {
                angle = Math.abs(angle);  // Make angle positive for right side
            }

            routeList.push({
                x: pointer.x,
                y: pointer.y,
                angle: angle,
                shape: shape,
                width: width,
            });
            mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
        }
    } else {
        // Normal DOM operation
        pointer = canvas.getPointer(event.e);
        if (mainRoad.roadType == 'Main Line') {
            if (pointer.x > mainRoad.getEffectiveCoords()[0].x && pointer.x < mainRoad.getEffectiveCoords()[1].x) {
                return;
            }
        } else if (mainRoad.roadType == 'Conventional Roundabout' || mainRoad.roadType == 'Spiral Roundabout') {
            const center = mainRoad.routeList[1];
            if ((pointer.x - center.x) ** 2 + (pointer.y - center.y) ** 2 < (mainRoad.xHeight * 3) ** 2) {
                //return;
            }
        }

        angle = parseInt(document.getElementById(`angle-display`).innerText);

        if (pointer.x < mainRoad.left + mainRoad.width / 2) {
            angle = -angle;
        }

        shape = mainRoad.roadType == 'Spiral Roundabout'?'Spiral Arrow':GeneralHandler.getToggleValue('Side Road Shape-container');
        width = document.getElementById(`Side Road width`).value;
        routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width, });
        mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
    }

    // Determine which side the branch is on
    const isSideLeft = routeList[0].x < mainRoad.left + mainRoad.width / 2;

    // Apply the same constraints as when moving a side road
    const constrainedResult = applySideRoadConstraints(
        {}, // Empty object instead of cursor
        mainRoad,
        routeList,
        isSideLeft,
        mainRoad.xHeight
    );

    // Use constrained result instead of original
    routeList = constrainedResult.routeList;
    tempVertexList = constrainedResult.tempVertexList;

    // Create the branch options
    const branchOptions = {
        routeList: routeList,
        xHeight: mainRoad.xHeight,
        color: mainRoad.color,
        mainRoad: mainRoad,
        side: isSideLeft,
        branchIndex: mainRoad.sideRoad.length + 1
    };

    // Create and initialize the side road
    const sideRoad = new SideRoadSymbol(branchOptions);
    await sideRoad.initialize(tempVertexList);

    // Store reference to the new side road object
    canvas.newSymbolObject = sideRoad;

    // Update main road to show how it would look with the new side road
    mainRoad.receiveNewRoute(sideRoad);
    mainRoad.setCoords();

    // Remove any existing event handlers first to avoid duplicates
    canvas.off('mouse:move', sideRoadOnMouseMove);
    canvas.off('mouse:down', finishDrawSideRoad);

    // Add mouse event handlers for placement
    canvas.on('mouse:move', sideRoadOnMouseMove);
    canvas.on('mouse:down', finishDrawSideRoad);

    if (activeVertex) {
        canvas.remove(activeVertex.indicator);
    }

    // Activate the vertex control immediately to enable dragging
    if (sideRoad.controls && sideRoad.controls.V1) {
        activeVertex = sideRoad.controls.V1;
        activeVertex.isDown = true;
        activeVertex.originalPosition = {
            left: sideRoad.left,
            top: sideRoad.top
        };

        // Store vertex information if available
        const v1 = sideRoad.getBasePolygonVertex('V1');
        if (v1) {
            activeVertex.vertexOriginalPosition = {
                x: v1.x,
                y: v1.y
            };
            activeVertex.vertexOffset = {
                x: v1.x - sideRoad.left,
                y: v1.y - sideRoad.top
            };

            // Create indicator for the active vertex
            if (activeVertex.createIndicator) {
                activeVertex.createIndicator(v1.x, v1.y);
            }
        }
    }

    canvas.renderAll();
}

/**
 * Handle mouse movement for side road placement
 * @param {Event} event - Mouse event
 */
function sideRoadOnMouseMove(event) {
    if (!canvas.newSymbolObject || !activeVertex) return;

    const sideRoad = canvas.newSymbolObject;
    if (sideRoad.functionalType !== 'SideRoad') return;

    const pointer = canvas.getPointer(event.e);

    // If we have an active vertex, let it handle the movement
    if (activeVertex.handleMouseMoveRef) {
        // Simulate a mouse move event with the current pointer
        const simulatedEvent = {
            e: event.e,
            pointer: pointer
        };
        activeVertex.handleMouseMoveRef(simulatedEvent);

        // Update main road preview with the new side road position
        const mainRoad = sideRoad.mainRoad;
        if (mainRoad) {
            mainRoad.receiveNewRoute(sideRoad.basePolygon);
            mainRoad.setCoords();
        }
    } else {
        // Fallback direct positioning if vertex control isn't active
        sideRoad.set({
            left: pointer.x,
            top: pointer.y
        });
        sideRoad.setCoords();

        // Update main road preview
        const mainRoad = sideRoad.mainRoad;
        if (mainRoad) {
            mainRoad.receiveNewRoute(sideRoad.basePolygon);
            mainRoad.setCoords();
        }

        canvas.renderAll();
    }
}

/**
 * Completes side road drawing and anchors to root
 * @param {Event} event - Mouse event
 * @return {Promise<void>}
 */
async function finishDrawSideRoad(event) {
    if (event.e.button !== 0) return;

    // Finalize side road placement on click
    if (!canvas.newSymbolObject) return;

    const sideRoad = canvas.newSymbolObject;
    if (sideRoad.functionalType !== 'SideRoad') return;

    const mainRoad = sideRoad.mainRoad;
    if (!mainRoad) return;

    // Complete the placement
    if (activeVertex) {
        activeVertex.handleMouseDownRef(event);
    }

    // Make sure the side road isn't already in the main road's collection
    if (!mainRoad.sideRoad.includes(sideRoad)) {
        // Add to main road's branch collection
        mainRoad.sideRoad.push(sideRoad);

        // Add connection point for this branch to main road if needed
        if (mainRoad.roadType == 'Main Line') {
            const isSideLeft = sideRoad.side;
            const connectPoint = sideRoad.basePolygon.vertex[isSideLeft ? 0 : 6];
            mainRoad.basePolygon.vertex.push({
                x: connectPoint.x,
                y: connectPoint.y,
                label: `C${sideRoad.branchIndex}`
            });
        }
    }

    // Update coordinates
    mainRoad.setCoords();

    // Reset state
    const placedSideRoad = canvas.newSymbolObject;
    canvas.newSymbolObject = null;
    activeVertex = null;

    // Clean up
    drawRoadsHandlerOff();

    // Make the new branch active after a slight delay
    setTimeout(() => {
        canvas.setActiveObject(placedSideRoad);
    }, 300);
}

/**
 * Cleans up route drawing handlers
 * @param {Event} event - Optional event object
 * @return {void}
 */
function drawRoadsHandlerOff(event) {
    // If there's a new road object being placed, remove it unless it's been added to canvas properly
    if (canvas.newSymbolObject) {
        const newRoad = canvas.newSymbolObject;

        // If it's a side road and not fully added to a main road, remove it
        if (newRoad.functionalType === 'SideRoad' && newRoad.mainRoad) {
            const mainRoad = newRoad.mainRoad;

            // Check if this side road is already part of the main road's side roads
            const isAdded = mainRoad.sideRoad.includes(newRoad);

            if (!isAdded) {
                // Update the main road as if the side road wasn't placed
                mainRoad.receiveNewRoute();
                mainRoad.setCoords();

                // Remove the temporary side road from canvas explicitly
                canvas.remove(newRoad);
                // Then delete the object
                newRoad.deleteObject && newRoad.deleteObject();
            }
        } else if (newRoad.functionalType === 'MainRoad' && !canvasObject.includes(newRoad)) {
            // If it's a main road that hasn't been properly added to canvas
            newRoad.deleteObject && newRoad.deleteObject();
        }

        canvas.newSymbolObject = null;
    }

    // Clean up active vertex if there is one
    if (activeVertex) {
        if (activeVertex.indicator) {
            canvas.remove(activeVertex.indicator);
        }
        activeVertex.cleanupDrag && activeVertex.cleanupDrag();
        activeVertex = null;
    }

    cursor.forEachObject(function (o) { cursor.remove(o) });
    canvas.off('mouse:move', mainRoadOnMouseMove);
    canvas.off('mouse:move', sideRoadOnMouseMove);
    canvas.off('mouse:down', finishDrawSideRoad);
    canvas.off('mouse:down', finishDrawMainRoad);
    canvas.off('mouse:move', drawSideRoadOnCursor);
    document.removeEventListener('keydown', cancelDraw);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    // Force a final render to clean up any visual artifacts
    canvas.renderAll();
}

/**
 * Cancels route drawing on escape key
 * @param {Event} event - Keyboard event
 * @param {boolean} force - Force cancel flag
 * @return {void}
 */
function cancelDraw(event, force = false) {
    if (event.key === 'Escape' || force) {
        drawRoadsHandlerOff();
        setTimeout(() => {
            document.addEventListener('keydown', ShowHideSideBarEvent);
        }, 1000);
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
