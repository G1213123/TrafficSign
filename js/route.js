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
 * @param {number} xheight - X-height value
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcRootVertices(xheight, routeList) {
    const length = xheight / 4
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
 * Updates base route object when receiving new route additions
 * @param {Object} branchRouteList - Optional route object to add
 * @return {Promise<void>}
 */
async function receiveNewRoute(tempBranchRouteList = null) {
    let newBottom = this.top + (this.tipLength)* this.xHeight / 4
    if (tempBranchRouteList) {
        const vertexList = tempBranchRouteList.path ? tempBranchRouteList.path[0].vertex : tempBranchRouteList.basePolygon.vertex
        const newLeft = vertexList[3].x
        newBottom = newLeft < this.left ? vertexList[0].y : vertexList[6].y

    }
    this.routeList.forEach(route => {
        if (route.angle === 180) {
            route.y = Math.max(...[newBottom, ...this.branchRoute.map(b => b.top + b.height)]) + this.rootLength * this.xHeight / 4
        }
    })
    let newVertexList = calcRootVertices(this.xHeight, this.routeList)
    const newPolygon = new GlyphPath()
    await newPolygon.initialize(newVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })
    //const centerPoints = this.basePolygon.vertex.filter(v => v.label.includes('C'))
    this.replaceBasePolygon(newPolygon)
    //if (centerPoints != []) { this.basePolygon.vertex.push(...centerPoints) }
    this.drawVertex(false)
}

/**
 * Updates route positions when branch is moved
 * @param {Event} event - Move event
 * @return {void}
 */
async function branchRouteOnMove(event, updateRoot = true) {
    //this.updateAllCoord()
    const rootRoute = this.rootRoute
    const rootLeft = rootRoute.routeList[0].x - rootRoute.routeList[0].width * rootRoute.xHeight / 8
    const rootRight = rootRoute.routeList[0].x + rootRoute.routeList[0].width * rootRoute.xHeight / 8
    const minBranchXDelta = 13 * this.xHeight / 4
    if (this.routeList[0].x + minBranchXDelta > rootLeft && this.side) {
        this.routeList[0].x = rootLeft - minBranchXDelta
        this.left = this.routeList[0].x
        this.refTopLeft.left = this.routeList[0].x
    } else if (this.routeList[0].x - minBranchXDelta < rootRight && !this.side) {
        this.routeList[0].x = rootRight + minBranchXDelta
        this.left = rootRight
        this.refTopLeft.left = rootRight
    }

    tempVertexList = calcBranchVertices(rootRoute.xHeight, rootRoute.routeList, this.routeList)
    const polygon1 = new GlyphPath()
    await polygon1.initialize(tempVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })
    this.replaceBasePolygon(polygon1)

    if (updateRoot) {

        //rootRoute.basePolygon.vertex.find(o => o.label == `C${this.branchIndex}`).y = this.basePolygon.vertex[this.side?0:6].y
        //rootRoute.basePolygon.vertex[branchIndex+1].y = this.basePolygon.vertex[6].y
        rootRoute.receiveNewRoute(this)
        rootRoute.setCoords()
    }
}

/**
 * Updates route positions when root is moved
 * @param {Event} event - Move event
 * @return {void}
 */
function rootRouteOnMove(event) {
    this.branchRoute.forEach((branch, index) => {
        branch.branchRouteOnMove(null, true)
    })
    this.receiveNewRoute()
    //this.updateAllCoord()
    this.setCoords()
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
    canvas.on('mouse:move', FormDrawAddComponent.DrawonMouseMove);
    canvas.on('mouse:down', finishDrawRootRoute);

    const activeRoute = canvas.getActiveObject();

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
    cursor.shapeMeta = vertexList;
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
        var posx = pointer.x;
        var posy = pointer.y;
        const arrowOptions1 = { left: posx, top: posy, angle: 0, color: 'white', };
        const arrow = new GlyphPath();

        // Wait for the initialization to complete
        await arrow.initialize(cursor.shapeMeta, arrowOptions1)

        const routeMap = new BaseGroup(arrow, 'MainRoute');
        routeMap.routeList = calculateTransformedPoints(cursor.routeList, { x: posx, y: posy, angle: 0 })
        routeMap.xHeight = cursor.xHeight
        routeMap.rootLength = cursor.rootLength
        routeMap.tipLength = cursor.tipLength
        routeMap.branchRoute = []

        routeMap.on('selected', routeMapOnSelect)
        routeMap.on('deselected', routeMapOnDeselect)
        routeMap.on('moving', rootRouteOnMove)
        routeMap.on('modified', rootRouteOnMove)
        routeMap.receiveNewRoute = receiveNewRoute
        routeMap.rootRouteOnMove = rootRouteOnMove
        canvas.discardActiveObject();
        setTimeout(() => {
            canvas.setActiveObject(routeMap);
        }, 300);
        cursor.forEachObject(function (o) { cursor.remove(o) })
        drawBranchRouteHandlerOff()
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
            if (pointer.x < rootRoute.left + rootRoute.width /2 ) {
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

        if (pointer.x < rootRoute.left + rootRoute.width /2) {
            angle = -angle;
        }

        shape = document.getElementById(`route${lastCount}-shape`).value;
        width = document.getElementById(`route${lastCount}-width`).value;
        routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width });
        rootRoute.tempRootList = JSON.parse(JSON.stringify(routeList));
    }

    tempVertexList = calcBranchVertices(rootRoute.xHeight, rootRoute.routeList, routeList);

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
        const rootRoute = cursor.rootRoute
        // not sure why tempBracnch initialisation will remove rootRoute vertex
        let missingVertex = JSON.parse(JSON.stringify(rootRoute.basePolygon.vertex.filter(v => v.label.includes('C'))))

        const shapeMeta = JSON.parse(JSON.stringify(cursor.shapeMeta))
        const tempBranch = new GlyphPath()
        await tempBranch.initialize(shapeMeta, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: false, strokeWidth: 0, })
        const tempBranchShape = new BaseGroup(tempBranch, 'BranchRoute')
        

        tempBranchShape.side = cursor.left < rootRoute.left
        tempBranchShape.xHeight = cursor.xHeight
        tempBranchShape.routeList = cursor.routeList
        tempBranchShape.branchRouteOnMove = branchRouteOnMove
        tempBranchShape.branchIndex = rootRoute.branchRoute.length + 1
        
        rootRoute.branchRoute.push(tempBranchShape)
        tempBranchShape.rootRoute = rootRoute
        
        const connectPoint = cursor.shapeMeta.path[0].vertex[tempBranchShape.side ? 0 : 6]
        missingVertex.filter(v => !rootRoute.basePolygon.vertex.includes(v))
        rootRoute.basePolygon.vertex.push(...missingVertex)
        rootRoute.basePolygon.vertex.push({ x: connectPoint.x, y: connectPoint.y, label: `C${tempBranchShape.branchIndex}` })
        
        rootRoute.setCoords()
        tempBranchShape.on('moving', branchRouteOnMove)
        tempBranchShape.on('modified', branchRouteOnMove)
        setTimeout(() => {
            canvas.setActiveObject(tempBranchShape);
        }, 300);
        drawBranchRouteHandlerOff()
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
    canvas.off('mouse:down', finishDrawBranchRoute)
    canvas.off('mouse:down', finishDrawRootRoute)
    canvas.off('mouse:down', finishDrawRootRoute);
    canvas.off('mouse:move', FormDrawAddComponent.DrawonMouseMove);
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
        GeneralHandler.createbutton('button-addRoute', '+ Another Route Destination', parent, 'input', FormDrawMapComponent.addRouteInput, 'click')
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

function routeButtTemplate(xHeight, width, angle, start_pt, endX = null, endY = null) {
    let Butt = {
        path: [{
            'vertex': [
                { x: -width / 2, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: width / 2, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }]
    }
    calculateTransformedPoints(Butt, { x: start_pt.x, y: start_pt.y, angle })
    calcSymbol(Butt, xHeight)
}