const routeMapTemplate = {
    'Arrow': {
        path: [{
            'vertex': [
                { x: -2, y: 2, label: 'V1', start: 1 },
                { x: 0, y: 0, label: 'V2', start: 0 },
                { x: 2, y: 2, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Butt': {
        path: [{
            'vertex': [
                { x: -2, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: 2, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Root': {
        path: [{
            'vertex': [
                { x: 2, y: 24, label: 'V1', start: 1 },
                { x: -2, y: 24, label: 'V2', start: 0 },
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
 * @param {number} xheight - X-height value
 * @param {Object} routeCenter - Center coordinates
 * @param {Array} routeList - List of routes
 * @return {Object} Vertex list object
 */
function calcBranchVertices(xheight, routeCenter, routeList) {
    const length = xheight / 4

    // Calculate the direction vector of the arrow
    //routeList = sortRootList(routeCenter, routeList);
    let vertexList = [];
    let RootTop = routeList.filter(item => item.angle === 0)[0]
    let RootTopVertex = getBranchCoords(RootTop, length)
    let RootLeft = RootTopVertex[0].x
    let RootRight = RootTopVertex[2].x
    let lastRoot = routeList[routeList.length - 1]

    // Calculate the arrowhead vertices
    const arrowTipVertex = getBranchCoords(lastRoot, length, RootLeft, RootRight)

    vertexList.push(...arrowTipVertex)

    assignRouteVertex(vertexList)
    return { path: [{ 'vertex': vertexList, 'arcs': [] }] };
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
    let arrowTipVertex = routeMapTemplate[root.shape]
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
            const offsetDistance =  Math.tan(Math.abs(root.angle) / 2);
            const next1 = {x: left, y: i1.y + length}
            const next2 = {x: left, y: i2.y - length}
            const i0 = { x: left, y: calculateTangentPoint(i1, next1, offsetDistance).y }
            const i3 = { x: left, y:calculateTangentPoint(i2, next2, offsetDistance).y}
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (root.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
            const offsetDistance =  Math.tan(Math.abs(root.angle) / 2);
            const next1 = {x: right, y: i1.y - length}
            const next2 = {x: right, y: i2.y + length}
            const i0 = { x: right, y: calculateTangentPoint(i1, next1, offsetDistance).y }
            const i3 = { x: right, y:calculateTangentPoint(i2, next2, offsetDistance).y}
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
 * Sorts route list points clockwise from south axis
 * @param {Object} center - Center point coordinates
 * @param {Array} points - Array of points to sort
 * @return {Array} Sorted points array
 */
function sortRootList(center, points) {
    // Sort the root list by angle from south axis (180 degrees), clockwise
    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(point => ({
        ...point,
        centerAngle: Math.atan2(point.y - center.y, point.x - center.x) >= Math.PI / 2 ? Math.atan2(point.y - center.y, point.x - center.x) - 2 * Math.PI : Math.atan2(point.y - center.y, point.x - center.x)
    }));

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.centerAngle - b.centerAngle);
    return pointsSorted;
}

/**
 * Updates base route object when receiving new route additions
 * @param {Object} route - Optional route object to add
 * @return {Promise<void>}
 */
async function receiveNewRoute(route=null) {
    if (route){
        const vertexList = route.path ? route.path[0].vertex : route.basePolygon.vertex
        const newLeft = vertexList[3].x
        const newTop = newLeft < this.left ? vertexList[6].y : vertexList[0].y
        const newBottom = newLeft < this.left ? vertexList[0].y : vertexList[6].y
        this.routeList.forEach(route => {
            if (route.angle === 180) {
                route.y = Math.max(...[newBottom,...this.routeCenter.map(v => v.y)]) + this.rootLength * this.xHeight / 4
            }
        })
    }
    let newVertexList = calcRootVertices(this.xHeight, this.routeList)
    const newPolygon = new GlyphPath()
    await newPolygon.initialize(newVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })
    const centerPoints = this.basePolygon.vertex.filter(v => v.label.includes('C'))
    this.basePolygon = newPolygon
    this.removeAll()
    this.add(newPolygon)
    if(centerPoints != []) {this.basePolygon.vertex.push(...centerPoints)}
    this.setCoords()
    this.drawVertex()
}

/**
 * Updates route positions when branch is moved
 * @param {Event} event - Move event
 * @return {void}
 */
function branchRouteOnMove(event) {
    //this.updateAllCoord()
    const rootRoute = this.rootRoute
    const branchIndex = rootRoute.branchRoute.indexOf(this)
    rootRoute.routeCenter[branchIndex*2].y = this.basePolygon.vertex[0].y
    rootRoute.routeCenter[branchIndex*2+1].y = this.basePolygon.vertex[6].y
    rootRoute.basePolygon.vertex.find(o => o.label==`C${branchIndex*2+1}`).y = this.basePolygon.vertex[0].y
    rootRoute.basePolygon.vertex.find(o => o.label==`C${branchIndex*2+2}`).y = this.basePolygon.vertex[6].y
    //rootRoute.basePolygon.vertex[branchIndex+1].y = this.basePolygon.vertex[6].y
    rootRoute.receiveNewRoute(this)
    rootRoute.setCoords()
}

/**
 * Updates route positions when root is moved
 * @param {Event} event - Move event
 * @return {void}
 */
function rootRouteOnMove(event) {
    this.receiveNewRoute(this)
    this.routeCenter.forEach ((item,index) => {
        this.basePolygon.vertex.find(o => o.label==`C${index+1}`).y = item.y
        //this.basePolygon.vertex[branchIndex+1].y = this.basePolygon.vertex[6].y
    })
    //this.updateAllCoord()
    this.setCoords()
}

/**
 * Draws new route cursor on canvas for initial placement
 * @param {Event} event - The triggering event object
 * @return {Promise<void>}
 */
async function drawRootRouteOnCursor(event) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelDraw)
    canvas.on('mouse:move', FormDrawAddComponent.DrawonMouseMove)
    canvas.on('mouse:down', cursorRouteOnMouseClick)

    const activeRoute = canvas.getActiveObject()
    var xHeight = document.getElementById('input-xHeight').value
    var rootLength = parseInt(document.getElementById('root-length').value)
    var tipLength = parseInt(document.getElementById('tip-length').value)
    let routeCenter
    if (!activeRoute || activeRoute.functionalType !== 'MainRoute') {
        routeCenter = [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    } else {
        routeCenter = activeRoute.routeCenter
    }
    routeList = [{ x: 0, y: (rootLength+tipLength) * xHeight / 4, angle: 180, width: 6, shape: 'Butt' },
    { x: 0, y: 0, angle: 0, width: 6, shape: 'Arrow' }
    ]

    let vertexList = calcRootVertices(xHeight, routeList)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.xHeight = xHeight
    cursor.routeCenter = routeCenter
    cursor.routeList = routeList
    cursor.tipLength = tipLength
    cursor.rootLength = rootLength

    const options = { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, }
    Polygon1 = new GlyphPath()
    await Polygon1.initialize(vertexList, options)

    symbolOffset = getInsertOffset(vertexList)
    cursorOffset.x = symbolOffset.left
    cursorOffset.y = 0

    cursor.add(Polygon1)
    cursor.shapeMeta = vertexList
}

/**
 * Handles mouse click to place route on canvas
 * @param {Event} event - Mouse event
 * @param {Object} options - Optional parameters
 * @return {Promise<void>}
 */
async function cursorRouteOnMouseClick(event, options = null) {
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
        const arrowOptions1 = { left: posx, top: posy , angle: 0, color: 'white', };
        const arrow = new GlyphPath();

        // Wait for the initialization to complete
        await arrow.initialize(cursor.shapeMeta, arrowOptions1)

        const routeMap = drawBasePolygon(arrow, 'MainRoute');
        routeMap.routeList = calculateTransformedPoints(cursor.routeList, { x: posx, y: posy, angle: 0 })
        routeMap.routeCenter = [{ x: posx, y: posy +cursor.tipLength * cursor.xHeight /4 }, { x: posx, y: posy +cursor.tipLength * cursor.xHeight /4 }]
        routeMap.xHeight = cursor.xHeight
        routeMap.rootLength = cursor.rootLength
        routeMap.tipLength = cursor.tipLength
        routeMap.branchRoute = []
        routeMap.tempExtend = { top: 0, bottom: 0 }

        routeMap.on('selected', routeMapOnSelect)
        routeMap.on('deselected', routeMapOnDeselect)
        routeMap.on('moving', rootRouteOnMove)
        routeMap.on('modified', rootRouteOnMove)
        routeMap.receiveNewRoute = receiveNewRoute
        canvas.discardActiveObject();
        setTimeout(() => {
            canvas.setActiveObject(routeMap);
        }, 100);
        cursor.forEachObject(function (o) { cursor.remove(o) })
        drawBranchRouteHandlerOff()
        document.addEventListener('keydown', ShowHideSideBarEvent);
    }
}

/**
 * Draws branch route cursor for adding routes to existing root
 * @param {Event} event - Mouse event
 * @param {Object} option - Optional parameters
 * @return {Promise<void>}
 */
async function drawBranchRouteOnCursor(event, option = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    const rootRoute = canvas.getActiveObject()
    let routeList
    if (option) {
        routeList = option.routeList
    } else {
        let pointer = canvas.getPointer(event.e)
        if (pointer.x > rootRoute.getEffectiveCoords()[0].x && pointer.x < rootRoute.getEffectiveCoords()[1].x) {
            return
        }
        var parent = document.getElementById("input-form");
        routeList = JSON.parse(JSON.stringify(rootRoute.routeList))
        lastCount = parent.routeCount
        let angle = parseInt(document.getElementById(`angle-display-${parent.routeCount}`).innerText)
        if (pointer.x < rootRoute.routeCenter[0].x) {
            angle = - angle
        }
        var shape = document.getElementById(`route${lastCount}-shape`).value
        var width = document.getElementById(`route${lastCount}-width`).value
        routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width })
        rootRoute.tempRootList = JSON.parse(JSON.stringify(routeList))
    }
    tempVertexList = calcBranchVertices(rootRoute.xHeight, rootRoute.routeCenter, routeList)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.xHeight = rootRoute.xHeight
    cursor.routeList = routeList
    cursor.rootRoute = rootRoute

    polygon1 = new GlyphPath()
    await polygon1.initialize(tempVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })

    symbolOffset = getInsertOffset(tempVertexList)
    cursorOffset.x = symbolOffset.left
    cursorOffset.y = symbolOffset.top

    cursor.add(polygon1)
    cursor.shapeMeta = tempVertexList

    rootRoute.receiveNewRoute(tempVertexList)
    rootRoute.setCoords()
    canvas.renderAll()

    // Remove existing listeners first to avoid duplicates
    canvas.off('mouse:up', finishDrawBranchRoute)
    document.removeEventListener('keydown', cancelDraw)

    // Add new listeners
    canvas.on('mouse:up', finishDrawBranchRoute)
    document.addEventListener('keydown', cancelDraw)
}

/**
 * Completes branch route drawing and anchors to root
 * @param {Event} event - Mouse event
 * @return {Promise<void>}
 */
async function finishDrawBranchRoute(event) {
    if (event.e.button === 0) {
        const rootRoute = cursor.rootRoute
        drawBranchRouteHandlerOff()

        const tempBranch = new GlyphPath()
        await tempBranch.initialize(cursor.shapeMeta, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })
        const tempBranchShape = drawBasePolygon(tempBranch, 'BranchRoute')

        tempBranchShape.side = cursor.left < rootRoute.left
        anchorShape(rootRoute, tempBranchShape, {
            vertexIndex1: tempBranchShape.side ? 'E3' : 'E1',
            vertexIndex2: tempBranchShape.side ? 'E1' : 'E3',
            spacingX: 0,
            spacingY: ''
        })
        if (rootRoute.branchRoute.length == 0){
            rootRoute.routeCenter = []
        }
        rootRoute.branchRoute.push(tempBranchShape)
        tempBranchShape.rootRoute = rootRoute

        rootRoute.routeCenter.push({ x: rootRoute.routeList[0].x, y: cursor.shapeMeta.path[0].vertex[0].y })
        rootRoute.routeCenter.push({ x: rootRoute.routeList[0].x, y: cursor.shapeMeta.path[0].vertex[6].y })

        const addIndex = rootRoute.basePolygon.vertex.filter(v => v.label.includes('C')).length
        rootRoute.basePolygon.vertex.push({ x: rootRoute.routeList[0].x, y: cursor.shapeMeta.path[0].vertex[0].y, label:`C${addIndex+1}` })
        rootRoute.basePolygon.vertex.push({ x: rootRoute.routeList[0].x, y: cursor.shapeMeta.path[0].vertex[6].y, label:`C${addIndex+2}` })
        
        rootRoute.setCoords()
        rootRoute.tempExtend = { top: 0, bottom: 0 }
        tempBranchShape.on('moving', branchRouteOnMove)
        tempBranchShape.on('modified', branchRouteOnMove)
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
    canvas.off('mouse:up', finishDrawBranchRoute)
    canvas.off('mouse:down', cursorRouteOnMouseClick)
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
    canvas.off('mouse:move', drawBranchRouteOnCursor)
    existingRoute.routeList = existingRoute.tempRootList || existingRoute.routeList
    parent.routeCount = 1
}

function routeButtTemplate(xHeight, width, angle, start_pt, endX = null, endY = null) {
    let Butt = {
        path: [{
            'vertex': [
                { x: -width/2, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: width/2, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }]
    }
    calculateTransformedPoints(Butt, { x:start_pt.x, y:start_pt.y, angle })
    calcSymbol(Butt, xHeight)
}