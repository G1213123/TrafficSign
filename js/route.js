const roadMapTemplate = {
    'Arrow': {
        path: [{
            'vertex': [
                { x: -1, y: 1, label: 'V1', start: 1 },
                { x: 0, y: 0, label: 'V2', start: 0 },
                { x: 1, y: 1, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Butt': {
        path: [{
            'vertex': [
                { x: -1, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: 1, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Root': {
        path: [{
            'vertex': [
                { x: 1, y: 24, label: 'V1', start: 1 },
                { x: -1, y: 24, label: 'V2', start: 0 },
            ], 'arcs': []
        }],
    },
    'ConvRoundabout': {
        path: [
            {
                'vertex': [
                    { x: 0, y: -12, label: 'V1', start: 1 }, // Center point
                    { x: 10.3923, y: 6, label: 'V2', start: 0 },
                    { x: 6.0622, y: 3.5, label: 'V3', start: 0 },
                    { x: 3.5, y: 6.0622, label: 'V4', start: 0 },
                    { x: 6, y: 10.3923, label: 'V5', start: 0 },
                    { x: -12, y: 0, label: 'V6', start: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 7, direction: 0, sweep: 1 },
                    { start: 'V5', end: 'V6', radius: 12, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                ]
            },
        ],
    },
}

const calcVertexType = { 'Main Line': calcMainRoadVertices, 'Conventional Roundabout': calcConvRoundaboutVertices }

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

    const vertexList = [...RootTopVertex, ...RootBottomVertex]
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
    const arrowTipVertex = getSideRoadCoords(routeList[0], length, RootLeft, RootRight)

    assignVertexLabel(arrowTipVertex)
    return { path: [{ 'vertex': arrowTipVertex, 'arcs': [] }] };
}

/**
 * Calculates vertices for a conventional roundabout
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes with the center point
 * @return {Object} Vertex list object for roundabout
 */
function calcConvRoundaboutVertices(xHeight, routeList) {
    const length = xHeight / 4
    const center = routeList[1] // use tip location
    let roundel = JSON.parse(JSON.stringify(roadMapTemplate['ConvRoundabout']))
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
    let arrowTipVertex = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]))
    arrowTipVertex.path[0].vertex.map((v) => { v.x *= route.width / 2; v.y *= route.width / 2 })
    arrowTipVertex = calcSymbol(arrowTipVertex, length)
    arrowTipVertex.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: route.x,
            y: route.y,
            angle: route.angle
        });
        p.vertex = transformed
    });
    arrowTipVertex = arrowTipVertex.path[0].vertex
    if (route.angle != 0 && route.angle != 180) {
        if (route.x < left) {
            const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(route.angle / 180 * Math.PI), radius: length }
            const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(route.angle / 180 * Math.PI), radius: length }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: left, y: i1.y + offsetDistance * length }
            const i3 = { x: left, y: i2.y - offsetDistance * length }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (route.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: right, y: i1.y - offsetDistance * length }
            const i3 = { x: right, y: i2.y + offsetDistance * length }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        }
    }
    return arrowTipVertex
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

        // Bind events
        this.on('selected', roadMapOnSelect);
        this.on('deselected', roadMapOnDeselect);
        this.on('moving', this.onMove.bind(this));
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
        this.basePolygon = arrow;
        this.add(arrow);

        // Since we're setting basePolygon after the constructor,
        // we need to manually call some of the initialization that
        // BaseGroup would have done with the basePolygon
        this.drawVertex();
        return this;
    }

    /**
     * Updates base route object when receiving new route additions
     * @param {Object} branchRouteList - Optional route object to add
     * @return {Promise<void>}
     */
    async receiveNewRoute(tempBranchRouteList = null) {
        let newBottom = this.top + (this.tipLength) * this.xHeight / 4;
        if (tempBranchRouteList) {
            const vertexList = tempBranchRouteList.path ? tempBranchRouteList.path[0].vertex : tempBranchRouteList.basePolygon.vertex;
            const newLeft = vertexList[3].x;
            newBottom = newLeft < this.left ? vertexList[0].y : vertexList[6].y;
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

        this.replaceBasePolygon(newPolygon);
        this.drawVertex(false);
    }

    /**
     * Updates route positions when root is moved
     * @param {Event} event - Move event
     * @return {void}
     */
    onMove(event) {
        this.sideRoad.forEach((side, index) => {
            side.SideRoadOnMove(null, true);
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
        this.on('moving', this.SideRoadOnMove.bind(this));
        this.on('modified', this.SideRoadOnMove.bind(this));
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
        this.basePolygon = branch;
        this.add(branch);

        // Manual initialization
        this.drawVertex();
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
        //this.left = this.side ? this.routeList[0].x : this.left;
        this.refTopLeft.left = this.side ? this.routeList[0].x : this.refTopLeft.left;
        //this.top = this.routeList[0].y;
        this.refTopLeft.top = this.routeList[0].y;

        return result.tempVertexList;
    }

    /**
     * Updates route positions when branch is moved
     * @param {Event} event - Move event
     * @param {boolean} updateRoot - Whether to update the main road
     * @return {Promise<void>}
     */
    async SideRoadOnMove(event, updateRoot = true) {
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

        this.replaceBasePolygon(polygon1);

        // Update root if needed
        if (updateRoot) {
            mainRoad.receiveNewRoute(this);
            mainRoad.setCoords();
        }
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

    // Horizontal constraint based on side
    const rootLeft = mainRoad.routeList[0].x - mainRoad.routeList[0].width * mainRoad.xHeight / 8;
    const rootRight = mainRoad.routeList[0].x + mainRoad.routeList[0].width * mainRoad.xHeight / 8;
    const minBranchShapeXDelta = routeList[0].shape == 'Butt' ? 4 : Math.abs(routeList[0].angle) == 90 ? 12 : 13;
    const minBranchXDelta = minBranchShapeXDelta * xHeight / 4;

    // Constrain movement based on side (left or right)
    if (routeList[0].x + minBranchXDelta > rootLeft && isSideLeft) {
        // Left side branch constraint
        routeList[0].x = rootLeft - minBranchXDelta;
        sideRoad.left = routeList[0].x;
    } else if (routeList[0].x - minBranchXDelta < rootRight && !isSideLeft) {
        // Right side branch constraint
        routeList[0].x = rootRight + minBranchXDelta;
        sideRoad.left = rootRight
    }

    // Vertical constraint based on main road top
    const rootTop = mainRoad.routeList[1].y;
    const tipLength = mainRoad.tipLength * mainRoad.xHeight / 4;

    // Calculate vertices with current position
    let tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);

    // Get the vertex that should touch the root (depends on side)
    const rootTopTouchY = tempVertexList.path[0].vertex[isSideLeft ? 5 : 1];

    // Ensure branch doesn't go above root + tip length
    if (rootTopTouchY.y < rootTop + tipLength) {
        // Push branch down if needed
        const adjustment = rootTop + tipLength - rootTopTouchY.y;
        routeList[0].y += adjustment;
        sideRoad.top += adjustment;

        // Recalculate vertices with new position
        tempVertexList = calcSideRoadVertices(mainRoad.xHeight, mainRoad.routeList, routeList);
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
    if (!event.target || !event.target || event.target.id !== 'button-DrawMap') {
        if (cursor._objects.length == 0) {
            return
        }
    }
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelDraw);


    // Remove existing event listeners first to avoid duplicates
    drawRoadsHandlerOff()

    // Now attach the event listeners
    canvas.on('mouse:move', FormDrawAddComponent.DrawOnMouseMove);
    canvas.on('mouse:down', finishDrawMainRoad);

    // Get parameters either from DOM elements or provided params
    let xHeight, rootLength, tipLength;

    if (params) {
        xHeight = params.xHeight || 100;
        rootLength = params.rootLength || 7;
        tipLength = params.tipLength || 12;
        color = params.color || 'white';
        width = params.width || 6;
        shape = params.shape || 'Arrow';
        roadType = params.roadType || 'Main Line';
    } else {
        xHeight = document.getElementById('input-xHeight').value;
        color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
        rootLength = parseInt(document.getElementById('root-length').value);
        tipLength = parseInt(document.getElementById('tip-length').value);
        width = parseInt(document.getElementById('main-width').value);
        shape = GeneralHandler.getToggleValue('Main Road Shape-container');
        roadType = GeneralHandler.getToggleValue('Main Road Type-container');
    }

    let routeList = [
        { x: 0, y: (rootLength + tipLength) * xHeight / 4, angle: 180, width: width, shape: 'Butt' },
        { x: 0, y: 0, angle: 0, width: width, shape: shape }
    ];

    let vertexList = calcVertexType[roadType](xHeight, routeList);

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.xHeight = xHeight;
    cursor.color = color
    cursor.routeList = routeList;
    cursor.tipLength = tipLength;
    cursor.rootLength = rootLength;
    cursor.roadType = roadType;

    const options = { left: 0, top: 0, angle: 0, fill: color, objectCaching: false, dirty: true, strokeWidth: 0 };
    Polygon1 = new GlyphPath();
    await Polygon1.initialize(vertexList, options);

    symbolOffset = getInsertOffset(vertexList);

    cursorOffset.x = symbolOffset.left;
    cursorOffset.y = symbolOffset.top;

    cursor.add(Polygon1);
}

/**
 * Handles mouse click to place route on canvas
 * @param {Event} event - Mouse event
 * @param {Object} options - Optional parameters
 * @return {Promise<void>}
 */
async function finishDrawMainRoad(event, options = null) {
    if (options) {
        cursor.set(
            { left: options.left, top: options.top }
        )
        var pointer = { x: options.left, y: options.top }
        textValue = 'Go'
        eventButton = 0
    } else {
        eventButton = event.e.button
        var pointer = canvas.getPointer(event.e);
    }
    if (eventButton === 0 && cursor._objects.length) {
        var posX = pointer.x;
        var posY = pointer.y;

        // Create a MainRoute with options
        const routeOptions = {
            routeList: calculateTransformedPoints(cursor.routeList, { x: posX, y: posY, angle: 0 }),
            xHeight: cursor.xHeight,
            color: cursor.color,
            rootLength: cursor.rootLength,
            tipLength: cursor.tipLength,
            roadType: cursor.roadType
        };

        let calcType = calcVertexType[roadType]

        // Create and initialize the MainRoute
        const routeMap = new MainRoadSymbol(routeOptions);
        await routeMap.initialize(calcType(routeOptions.xHeight, routeOptions.routeList), routeOptions.color);

        // Set active object
        canvas.discardActiveObject();
        setTimeout(() => {
            canvas.setActiveObject(routeMap);
        }, 300);

        // Clean up
        cursor.forEachObject(function (o) { cursor.remove(o) });
        drawRoadsHandlerOff();
        document.addEventListener('keydown', ShowHideSideBarEvent);
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
    const mainRoad = canvas.getActiveObject();
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
        if (pointer.x > mainRoad.getEffectiveCoords()[0].x && pointer.x < mainRoad.getEffectiveCoords()[1].x) {
            return;
        }

        var parent = document.getElementById("input-form");
        angle = parseInt(document.getElementById(`angle-display`).innerText);

        if (pointer.x < mainRoad.left + mainRoad.width / 2) {
            angle = -angle;
        }

        shape = GeneralHandler.getToggleValue('Side Road Shape-container');
        width = document.getElementById(`Side Road width`).value;
        routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width, });
        mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
    }

    // Determine which side the branch is on
    const isSideLeft = routeList[0].x < mainRoad.left + mainRoad.width / 2;

    // Apply the same constraints as when moving a side road
    const constrainedResult = applySideRoadConstraints(
        cursor,
        mainRoad,
        routeList,
        isSideLeft,
        mainRoad.xHeight
    );

    // Use constrained result instead of original
    routeList = constrainedResult.routeList;
    tempVertexList = constrainedResult.tempVertexList;

    cursor.forEachObject(function (o) { cursor.remove(o) });
    cursor.xHeight = mainRoad.xHeight;
    cursor.color = mainRoad.color;
    cursor.routeList = routeList;
    cursor.mainRoad = mainRoad;

    polygon1 = new GlyphPath();
    await polygon1.initialize(tempVertexList, { left: 0, top: 0, angle: 0, fill: mainRoad.color, objectCaching: false, dirty: true, strokeWidth: 0 });

    symbolOffset = getInsertOffset(tempVertexList);
    cursorOffset.x = symbolOffset.left;
    cursorOffset.y = symbolOffset.top;

    cursor.add(polygon1);
    cursor.shapeMeta = tempVertexList;

    mainRoad.receiveNewRoute(tempVertexList);
    mainRoad.setCoords();
    canvas.renderAll();

    // Remove existing listeners first to avoid duplicates
    canvas.off('mouse:down', finishDrawSideRoad);
    document.removeEventListener('keydown', cancelDraw);

    // Add new listeners
    canvas.on('mouse:down', finishDrawSideRoad);
    document.addEventListener('keydown', cancelDraw);
}

/**
 * Completes side road drawing and anchors to root
 * @param {Event} event - Mouse event
 * @return {Promise<void>}
 */
async function finishDrawSideRoad(event) {
    if (event.e.button === 0) {
        const mainRoad = cursor.mainRoad;

        // Prepare the shape metadata
        const shapeMeta = JSON.parse(JSON.stringify(cursor.shapeMeta));
        const isSideLeft = cursor.left < mainRoad.left;
        const branchIndex = mainRoad.sideRoad.length + 1;

        // Create side road options
        const branchOptions = {
            routeList: cursor.routeList,
            xHeight: cursor.xHeight,
            color: cursor.color,
            mainRoad: mainRoad,
            side: isSideLeft,
            branchIndex: branchIndex
        };

        // Create and initialize the branch
        const sideRoad = new SideRoadSymbol(branchOptions);
        await sideRoad.initialize(shapeMeta);

        // Add to main road's branch collection
        mainRoad.sideRoad.push(sideRoad);

        // Add connection point for this branch to main road
        const connectPoint = cursor.shapeMeta.path[0].vertex[isSideLeft ? 0 : 6];
        mainRoad.basePolygon.vertex.push({
            x: connectPoint.x,
            y: connectPoint.y,
            label: `C${branchIndex}`
        });

        // Update coordinates
        mainRoad.setCoords();

        // Make the new branch active after a slight delay
        setTimeout(() => {
            canvas.setActiveObject(sideRoad);
        }, 300);

        drawRoadsHandlerOff();
    }
}

/**
 * Cleans up route drawing handlers
 * @param {Event} event - Optional event object
 * @return {void}
 */
function drawRoadsHandlerOff(event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', drawSideRoadOnCursor)
    canvas.off('mouse:move', drawMainRoadOnCursor)
    canvas.off('mouse:down', finishDrawSideRoad)
    canvas.off('mouse:down', finishDrawMainRoad)
    canvas.off('mouse:down', finishDrawMainRoad);
    canvas.off('mouse:move', FormDrawAddComponent.DrawOnMouseMove);
    document.removeEventListener('keydown', cancelDraw)
    document.addEventListener('keydown', ShowHideSideBarEvent);
}

/**
 * Cancels route drawing on escape key
 * @param {Event} event - Keyboard event
 * @param {boolean} force - Force cancel flag
 * @return {void}
 */
function cancelDraw(event, force = false) {
    if (event.key === 'Escape' || force) {
        drawRoadsHandlerOff()
        setTimeout(() => {
            document.addEventListener('keydown', ShowHideSideBarEvent);
        }, 1000)
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
