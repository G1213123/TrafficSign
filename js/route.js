const routeMapTemplate = {
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
}

// Extract drawing functions from FormDrawMapComponent

/**
 * Calculates vertices for root route
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcRootVertices(xHeight, routeList) {
    const length = xHeight / 4
    let RootBottom = routeList.filter(item => item.angle === 180)[0]
    let RootTop = routeList.filter(item => item.angle === 0)[0]
    let RootBottomVertex = getBranchCoords(RootBottom, length)
    let RootTopVertex = getBranchCoords(RootTop, length)

    const vertexList = [...RootTopVertex, ...RootBottomVertex]
    assignRouteVertex(vertexList)
    return { path: [{ 'vertex': vertexList, 'arcs': [] }] };
}

/**
 * Calculates vertices for branch routes
 * @param {number} xHeight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcBranchVertices(xHeight, rootRouteList, routeList) {
    const length = xHeight / 4

    // Calculate the direction vector of the arrow
    let RootLeft = rootRouteList[0].x - rootRouteList[0].width * xHeight / 8
    let RootRight = rootRouteList[0].x + rootRouteList[0].width * xHeight / 8

    // Calculate the arrowhead vertices
    const arrowTipVertex = getBranchCoords(routeList[0], length, RootLeft, RootRight)

    assignRouteVertex(arrowTipVertex)
    return { path: [{ 'vertex': arrowTipVertex, 'arcs': [] }] };
}

/**
 * Gets coordinates for branch route endpoints
 * @param {Object} root - Root route object
 * @param {number} length - Route length
 * @param {number} left - Left boundary
 * @param {number} right - Right boundary
 * @return {Array} Array of vertex coordinates
 */
function getBranchCoords(root, length, left, right) {
    let arrowTipVertex = JSON.parse(JSON.stringify(routeMapTemplate[root.shape]))
    arrowTipVertex.path[0].vertex.map((v) => { v.x *= root.width / 2; v.y *= root.width / 2 })
    arrowTipVertex = calcSymbol(arrowTipVertex, length)
    arrowTipVertex.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: root.x,
            y: root.y,
            angle: root.angle
        });
        p.vertex = transformed
    });
    arrowTipVertex = arrowTipVertex.path[0].vertex
    if (root.angle != 0 && root.angle != 180) {
        if (root.x < left) {
            const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const offsetDistance = Math.tan(Math.abs(root.angle * Math.PI / 180) / 2);
            const i0 = { x: left, y: i1.y + offsetDistance * length }
            const i3 = { x: left, y: i2.y - offsetDistance * length }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (root.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const offsetDistance = Math.tan(Math.abs(root.angle * Math.PI / 180) / 2);
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
function assignRouteVertex(vertexList) {
    vertexList.map((vertex, index) => {
        vertex.label = `V${index + 1}`
        vertex.start = index == 0 ? 1 : 0
    })
}

/**
 * MainRoute class extends baseGroup to create route objects
 */
class MainRoute extends BaseGroup {
    constructor(options = {}) {
        // We need to pass null as basePolygon initially, as we'll set it after initialize()
        super(null, 'MainRoute', options);

        // Initialize route-specific properties
        this.routeList = options.routeList || [];
        this.routeCenter = options.routeCenter || [];
        this.xHeight = options.xHeight || 100;
        this.rootLength = options.rootLength || 7;
        this.tipLength = options.tipLength || 12;
        this.branchRoute = [];

        // Bind events
        this.on('selected', routeMapOnSelect);
        this.on('deselected', routeMapOnDeselect);
        this.on('moving', this.onMove.bind(this));
        this.on('modified', this.onMove.bind(this));
    }

    /**
     * Initialize the route with a GlyphPath
     * @param {Object} vertexList - Vertex data for the route
     * @return {Promise<MainRoute>} - The initialized route
     */
    async initialize(vertexList) {
        const arrow = new GlyphPath();
        await arrow.initialize(vertexList, {
            left: 0,
            top: 0,
            angle: 0,
            color: 'white',
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
                route.y = Math.max(...[newBottom, ...this.branchRoute.map(b => b.top + b.height)]) + this.rootLength * this.xHeight / 4;
            }
        });

        let newVertexList = calcRootVertices(this.xHeight, this.routeList);
        const newPolygon = new GlyphPath();
        await newPolygon.initialize(newVertexList, {
            left: 0,
            top: 0,
            angle: 0,
            color: 'white',
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
        this.branchRoute.forEach((branch, index) => {
            branch.branchRouteOnMove(null, true);
        });
        this.receiveNewRoute();
        this.setCoords();
    }
}

/**
 * BranchRoute class extends baseGroup for route branches
 */
class BranchRoute extends BaseGroup {
    constructor(options = {}) {
        // Initialize with null basePolygon, will set it later
        super(null, 'BranchRoute', options);

        // Branch-specific properties
        this.routeList = options.routeList || [];
        this.xHeight = options.xHeight || 100;
        this.rootRoute = options.rootRoute || null;
        this.side = options.side || false; // false = right, true = left
        this.branchIndex = options.branchIndex || 0;

        // Bind events
        this.on('moving', this.branchRouteOnMove.bind(this));
        this.on('modified', this.branchRouteOnMove.bind(this));
    }

    /**
     * Initialize the branch with a GlyphPath
     * @param {Object} vertexList - Vertex data for the branch
     * @return {Promise<BranchRoute>} - The initialized branch
     */
    async initialize(vertexList) {
        const branch = new GlyphPath();
        await branch.initialize(vertexList, {
            left: 0,
            top: 0,
            angle: 0,
            color: 'white',
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
     * Constrains branch positions based on root route
     * @param {Object} rootRoute - The parent route
     * @return {Object} tempVertexList - Updated vertex list
     */
    constrainBranchPosition(rootRoute) {
        // Use the common constraint function
        const result = applyBranchConstraints(
            this,
            rootRoute, 
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
     * @param {boolean} updateRoot - Whether to update the root route
     * @return {Promise<void>}
     */
    async branchRouteOnMove(event, updateRoot = true) {
        if (!this.rootRoute) return;
        
        const rootRoute = this.rootRoute;
        
        // Apply position constraints and get the updated vertex list
        const tempVertexList = this.constrainBranchPosition(rootRoute);
        
        // Create new polygon with constrained position
        const polygon1 = new GlyphPath();
        await polygon1.initialize(tempVertexList, { 
            left: 0, 
            top: 0, 
            angle: 0, 
            color: 'white', 
            objectCaching: false, 
            dirty: true, 
            strokeWidth: 0 
        });
        
        this.replaceBasePolygon(polygon1);
        
        // Update root if needed
        if (updateRoot) {
            rootRoute.receiveNewRoute(this);
            rootRoute.setCoords();
        }
    }
}

/**
 * Applies position constraints to branch route coordinates
 * @param {Object} rootRoute - The parent route object
 * @param {Array} branchRouteList - The branch route list to constrain
 * @param {boolean} isSideLeft - Whether branch is on left side
 * @param {number} xHeight - X-height value for measurements
 * @return {Object} - Updated branch route data and vertex list
 */
function applyBranchConstraints(branchRoute, rootRoute, branchRouteList, isSideLeft, xHeight) {
    // Make a copy to avoid modifying the original
    const routeList = JSON.parse(JSON.stringify(branchRouteList));
    
    // Horizontal constraint based on side
    const rootLeft = rootRoute.routeList[0].x - rootRoute.routeList[0].width * rootRoute.xHeight / 8;
    const rootRight = rootRoute.routeList[0].x + rootRoute.routeList[0].width * rootRoute.xHeight / 8;
    const minBranchXDelta = 13 * xHeight / 4;
    
    // Constrain movement based on side (left or right)
    if (routeList[0].x + minBranchXDelta > rootLeft && isSideLeft) {
        // Left side branch constraint
        routeList[0].x = rootLeft - minBranchXDelta;
        branchRoute.left = routeList[0].x;
    } else if (routeList[0].x - minBranchXDelta < rootRight && !isSideLeft) {
        // Right side branch constraint
        routeList[0].x = rootRight + minBranchXDelta;
        branchRoute.left = rootRight
    }

    // Vertical constraint based on root route top
    const rootTop = rootRoute.routeList[1].y;
    const tipLength = rootRoute.tipLength * rootRoute.xHeight / 4;
    
    // Calculate vertices with current position
    let tempVertexList = calcBranchVertices(rootRoute.xHeight, rootRoute.routeList, routeList);
    
    // Get the vertex that should touch the root (depends on side)
    const rootTopTouchY = tempVertexList.path[0].vertex[isSideLeft ? 5 : 1];
    
    // Ensure branch doesn't go above root + tip length
    if (rootTopTouchY.y < rootTop + tipLength) {
        // Push branch down if needed
        const adjustment = rootTop + tipLength - rootTopTouchY.y;
        routeList[0].y += adjustment;
        branchRoute.top += adjustment;
        
        // Recalculate vertices with new position
        tempVertexList = calcBranchVertices(rootRoute.xHeight, rootRoute.routeList, routeList);
    }
    
    return { routeList, tempVertexList };
}

/**
 * Draws new route cursor on canvas for initial placement
 * @param {Event} event - The triggering event object
 * @param {Object} params - Optional parameters for testing
 * @return {Promise<void>}
 */
async function drawRootRouteOnCursor(event, params = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelDraw);

    // Remove existing event listeners first to avoid duplicates
    drawBranchRouteHandlerOff()

    // Now attach the event listeners
    canvas.on('mouse:move', FormDrawAddComponent.DrawOnMouseMove);
    canvas.on('mouse:down', finishDrawRootRoute);

    // Get parameters either from DOM elements or provided params
    let xHeight, rootLength, tipLength;

    if (params) {
        xHeight = params.xHeight || 100;
        rootLength = params.rootLength || 7;
        tipLength = params.tipLength || 12;
    } else {
        xHeight = document.getElementById('input-xHeight').value;
        rootLength = parseInt(document.getElementById('root-length').value);
        tipLength = parseInt(document.getElementById('tip-length').value);
    }

    let routeList = [
        { x: 0, y: (rootLength + tipLength) * xHeight / 4, angle: 180, width: 6, shape: 'Butt' },
        { x: 0, y: 0, angle: 0, width: 6, shape: 'Arrow' }
    ];

    let vertexList = calcRootVertices(xHeight, routeList);

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.xHeight = xHeight;
    cursor.routeList = routeList;
    cursor.tipLength = tipLength;
    cursor.rootLength = rootLength;

    const options = { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0 };
    Polygon1 = new GlyphPath();
    await Polygon1.initialize(vertexList, options);

    symbolOffset = getInsertOffset(vertexList);
    cursorOffset.x = symbolOffset.left;
    cursorOffset.y = 0;

    cursor.add(Polygon1);
}

/**
 * Handles mouse click to place route on canvas
 * @param {Event} event - Mouse event
 * @param {Object} options - Optional parameters
 * @return {Promise<void>}
 */
async function finishDrawRootRoute(event, options = null) {
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
        const arrowOptions1 = { left: posX, top: posY, angle: 0, color: 'white', };

        // Create a MainRoute with options
        const routeOptions = {
            routeList: calculateTransformedPoints(cursor.routeList, { x: posX, y: posY, angle: 0 }),
            xHeight: cursor.xHeight,
            rootLength: cursor.rootLength,
            tipLength: cursor.tipLength
        };

        // Create and initialize the MainRoute
        const routeMap = new MainRoute(routeOptions);
        await routeMap.initialize(calcRootVertices(routeOptions.xHeight, routeOptions.routeList));

        // Set active object
        canvas.discardActiveObject();
        setTimeout(() => {
            canvas.setActiveObject(routeMap);
        }, 300);

        // Clean up
        cursor.forEachObject(function (o) { cursor.remove(o) });
        drawBranchRouteHandlerOff();
        document.addEventListener('keydown', ShowHideSideBarEvent);
    }
}

/**
 * Draws branch route cursor for adding routes to existing root
 * @param {Event} event - Mouse event
 * @param {Object} option - Optional parameters for testing
 * @return {Promise<void>}
 */
async function drawBranchRouteOnCursor(event, option = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    const rootRoute = canvas.getActiveObject();
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
            if (pointer.x < rootRoute.left + rootRoute.width / 2) {
                angle = -Math.abs(angle); // Make angle negative for left side
            } else {
                angle = Math.abs(angle);  // Make angle positive for right side
            }

            routeList.push({
                x: pointer.x,
                y: pointer.y,
                angle: angle,
                shape: shape,
                width: width
            });
            rootRoute.tempRootList = JSON.parse(JSON.stringify(routeList));
        }
    } else {
        // Normal DOM operation
        pointer = canvas.getPointer(event.e);
        if (pointer.x > rootRoute.getEffectiveCoords()[0].x && pointer.x < rootRoute.getEffectiveCoords()[1].x) {
            return;
        }

        var parent = document.getElementById("input-form");
        lastCount = parent.routeCount;
        angle = parseInt(document.getElementById(`angle-display-${lastCount}`).innerText);

        if (pointer.x < rootRoute.left + rootRoute.width / 2) {
            angle = -angle;
        }

        shape = document.getElementById(`route${lastCount}-shape`).value;
        width = document.getElementById(`route${lastCount}-width`).value;
        routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width });
        rootRoute.tempRootList = JSON.parse(JSON.stringify(routeList));
    }

    // Determine which side the branch is on
    const isSideLeft = routeList[0].x < rootRoute.left + rootRoute.width / 2;
    
    // Apply the same constraints as when moving a branch route
    const constrainedResult = applyBranchConstraints(
        cursor,
        rootRoute, 
        routeList, 
        isSideLeft, 
        rootRoute.xHeight
    );
    
    // Use constrained result instead of original
    routeList = constrainedResult.routeList;
    tempVertexList = constrainedResult.tempVertexList;

    cursor.forEachObject(function (o) { cursor.remove(o) });
    cursor.xHeight = rootRoute.xHeight;
    cursor.routeList = routeList;
    cursor.rootRoute = rootRoute;

    polygon1 = new GlyphPath();
    await polygon1.initialize(tempVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0 });

    symbolOffset = getInsertOffset(tempVertexList);
    cursorOffset.x = symbolOffset.left;
    cursorOffset.y = symbolOffset.top;

    cursor.add(polygon1);
    cursor.shapeMeta = tempVertexList;

    rootRoute.receiveNewRoute(tempVertexList);
    rootRoute.setCoords();
    canvas.renderAll();

    // Remove existing listeners first to avoid duplicates
    canvas.off('mouse:down', finishDrawBranchRoute);
    document.removeEventListener('keydown', cancelDraw);

    // Add new listeners
    canvas.on('mouse:down', finishDrawBranchRoute);
    document.addEventListener('keydown', cancelDraw);
}

/**
 * Completes branch route drawing and anchors to root
 * @param {Event} event - Mouse event
 * @return {Promise<void>}
 */
async function finishDrawBranchRoute(event) {
    if (event.e.button === 0) {
        const rootRoute = cursor.rootRoute;

        // Prepare the shape metadata
        const shapeMeta = JSON.parse(JSON.stringify(cursor.shapeMeta));
        const isSideLeft = cursor.left < rootRoute.left;
        const branchIndex = rootRoute.branchRoute.length + 1;

        // Create branch route options
        const branchOptions = {
            routeList: cursor.routeList,
            xHeight: cursor.xHeight,
            rootRoute: rootRoute,
            side: isSideLeft,
            branchIndex: branchIndex
        };

        // Create and initialize the branch
        const branchRoute = new BranchRoute(branchOptions);
        await branchRoute.initialize(shapeMeta);

        // Add to root route's branch collection
        rootRoute.branchRoute.push(branchRoute);

        // Add connection point for this branch to root route
        const connectPoint = cursor.shapeMeta.path[0].vertex[isSideLeft ? 0 : 6];
        rootRoute.basePolygon.vertex.push({
            x: connectPoint.x,
            y: connectPoint.y,
            label: `C${branchIndex}`
        });

        // Update coordinates
        rootRoute.setCoords();

        // Make the new branch active after a slight delay
        setTimeout(() => {
            canvas.setActiveObject(branchRoute);
        }, 300);

        drawBranchRouteHandlerOff();
    }
}

/**
 * Cleans up route drawing handlers
 * @param {Event} event - Optional event object
 * @return {void}
 */
function drawBranchRouteHandlerOff(event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', drawBranchRouteOnCursor)
    canvas.off('mouse:move', drawRootRouteOnCursor)
    canvas.off('mouse:down', finishDrawBranchRoute)
    canvas.off('mouse:down', finishDrawRootRoute)
    canvas.off('mouse:down', finishDrawRootRoute);
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
        drawBranchRouteHandlerOff()
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
function routeMapOnSelect(event) {
    const panel = document.getElementById("button-DrawMap");
    const parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObjects()
    if (panel && parent && existingRoute.length == 1 && existingRoute[0].functionalType === 'MainRoute') {
        GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', parent, 'input', FormDrawMapComponent.addRouteInput, 'click')
    }
}

/**
 * Handles route object deselection
 * @param {Event} event - Deselection event
 * @return {void}
 */
function routeMapOnDeselect(event) {
    const existingRoute = event.target
    const panel = document.getElementById("button-addRoute");
    if (panel) {
        panel.parentNode.parentNode.removeChild(panel.parentNode)
    }
    //canvas.off('mouse:move', drawBranchRouteOnCursor)
    //existingRoute.routeList = existingRoute.tempRootList || existingRoute.routeList
    parent.routeCount = 1
}
