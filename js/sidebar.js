var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;
var cursorOffset = { x: 0, y: 0 }
let tabNum = 2;

canvas.add(cursor);

canvas.snap_pts = [];

/* General Sidebar Panel */
let GeneralHandler = {
  panelOpened: true,
  ShowHideSideBar: function (event, force = null) {
    if (force === null) {
      if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
        GeneralHandler.HideSideBar()
      } else {
        GeneralHandler.ShowSideBar()
      }
    } else if (force === 'on') {
      GeneralHandler.ShowSideBar()
    } else {
      GeneralHandler.HideSideBar()
    }
  },
  ShowSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " open"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
    GeneralHandler.panelOpened = true
  },
  HideSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " close"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
    GeneralHandler.panelOpened = false
    GeneralHandler.PanelHandlerOff()
  },
  PanelHandlerOff: () => {
    FormTextAddComponent.TextHandlerOff()
    FormDrawAddComponent.DrawHandlerOff()
    if (tabNum != 5) {
      FormDebugComponent.DebugHandlerOff()
    }
  },
  PanelInit: () => {
    GeneralHandler.ShowHideSideBar(null, "on")
    GeneralHandler.PanelHandlerOff()
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      var parent = document.getElementById("input-form");
      parent.innerHTML = ''
    }
    CanvasObjectInspector.createObjectListPanelInit()
    return parent
  },
  createNode: function (type, attribute, parent, callback, event) {
    var node = document.createElement(type);
    for (const [key, value] of Object.entries(attribute)) {
      node.setAttribute(key, value)
    }
    parent.appendChild(node);
    if (callback) {
      node.addEventListener(event, callback)
    }
    return node
  },
  createbutton: function (name, labelTxt, parent, container = 'input', callback = null, event = null) {
    if (container) {
      var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    }
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)
    input.innerHTML = labelTxt
  },

  createinput: function (name, labelTxt, parent, defaultv = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    //var labelEdge = GeneralHandler.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = GeneralHandler.createNode("label", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("input", { 'type': 'text', 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    label.innerHTML = labelTxt
    defaultv ? input.value = defaultv : input.value = ''
  },

  createselect: function (name, labelTxt, options, parent, defaultv = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    var label = GeneralHandler.createNode("label", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("select", { 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    label.innerHTML = labelTxt
    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i];
      option.text = options[i];
      input.appendChild(option);
    }
    if (defaultv !== null) {
      input.value = defaultv;
    }
  }
}

/* Text panel */
let FormTextAddComponent = {
  textWidthMedium: [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 136, shortWidth: 0 }, { char: 'B', width: 147, shortWidth: 0 }, { char: 'C', width: 148, shortWidth: 0 }, { char: 'D', width: 154, shortWidth: 0 }, { char: 'E', width: 132, shortWidth: 0 }, { char: 'F', width: 119, shortWidth: 0 }, { char: 'G', width: 155, shortWidth: 0 }, { char: 'H', width: 160, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 93, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 107, shortWidth: 0 }, { char: 'M', width: 184, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 156, shortWidth: 0 }, { char: 'P', width: 130, shortWidth: 0 }, { char: 'Q', width: 158, shortWidth: 0 }, { char: 'R', width: 141, shortWidth: 0 }, { char: 'S', width: 137, shortWidth: 0 }, { char: 'T', width: 109, shortWidth: 105 }, { char: 'U', width: 154, shortWidth: 0 }, { char: 'V', width: 130, shortWidth: 120 }, { char: 'W', width: 183, shortWidth: 189 }, { char: 'X', width: 128, shortWidth: 0 }, { char: 'Y', width: 123, shortWidth: 118 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 103, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 109, shortWidth: 102 }, { char: 'f', width: 75, shortWidth: 0 }, { char: 'g', width: 114, shortWidth: 107 }, { char: 'h', width: 112, shortWidth: 0 }, { char: 'i', width: 54, shortWidth: 0 }, { char: 'j', width: 58, shortWidth: 0 }, { char: 'k', width: 108, shortWidth: 0 }, { char: 'l', width: 62, shortWidth: 0 }, { char: 'm', width: 164, shortWidth: 0 }, { char: 'n', width: 112, shortWidth: 0 }, { char: 'o', width: 118, shortWidth: 111 }, { char: 'p', width: 118, shortWidth: 0 }, { char: 'q', width: 118, shortWidth: 0 }, { char: 'r', width: 73, shortWidth: 59 }, { char: 's', width: 97, shortWidth: 95 }, { char: 't', width: 81, shortWidth: 0 }, { char: 'u', width: 115, shortWidth: 101 }, { char: 'v', width: 98, shortWidth: 0 }, { char: 'w', width: 147, shortWidth: 145 }, { char: 'x', width: 104, shortWidth: 0 }, { char: 'y', width: 98, shortWidth: 96 }, { char: 'z', width: 97, shortWidth: 0 }, { char: '1', width: 78, shortWidth: 0 }, { char: '2', width: 120, shortWidth: 0 }, { char: '3', width: 127, shortWidth: 0 }, { char: '4', width: 132, shortWidth: 0 }, { char: '5', width: 122, shortWidth: 0 }, { char: '6', width: 126, shortWidth: 0 }, { char: '7', width: 104, shortWidth: 0 }, { char: '8', width: 130, shortWidth: 0 }, { char: '9', width: 128, shortWidth: 0 }, { char: '0', width: 133, shortWidth: 0 }, { char: ',', width: 53, shortWidth: 0 }, { char: '.', width: 53, shortWidth: 0 }, { char: '’', width: 39, shortWidth: 0 }, { char: ':', width: 53, shortWidth: 0 }, { char: '•', width: 53, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 66, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 105, shortWidth: 0 }, { char: ')', width: 105, shortWidth: 0 }, { char: '/', width: 85, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '“', width: 92, shortWidth: 0 }, { char: '”', width: 92, shortWidth: 0 }],
  textWidthHeavy: [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 142, shortWidth: 0 }, { char: 'B', width: 146, shortWidth: 0 }, { char: 'C', width: 151, shortWidth: 0 }, { char: 'D', width: 150, shortWidth: 0 }, { char: 'E', width: 136, shortWidth: 0 }, { char: 'F', width: 121, shortWidth: 0 }, { char: 'G', width: 156, shortWidth: 0 }, { char: 'H', width: 159, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 95, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 118, shortWidth: 0 }, { char: 'M', width: 186, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 158, shortWidth: 0 }, { char: 'P', width: 134, shortWidth: 0 }, { char: 'Q', width: 161, shortWidth: 0 }, { char: 'R', width: 148, shortWidth: 0 }, { char: 'S', width: 146, shortWidth: 0 }, { char: 'T', width: 118, shortWidth: 113 }, { char: 'U', width: 157, shortWidth: 0 }, { char: 'V', width: 133, shortWidth: 127 }, { char: 'W', width: 193, shortWidth: 196 }, { char: 'X', width: 130, shortWidth: 0 }, { char: 'Y', width: 128, shortWidth: 125 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 107, shortWidth: 0 }, { char: 'c', width: 107, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 110, shortWidth: 103 }, { char: 'f', width: 79, shortWidth: 0 }, { char: 'g', width: 117, shortWidth: 110 }, { char: 'h', width: 119, shortWidth: 0 }, { char: 'i', width: 55, shortWidth: 0 }, { char: 'j', width: 71, shortWidth: 0 }, { char: 'k', width: 114, shortWidth: 0 }, { char: 'l', width: 63, shortWidth: 0 }, { char: 'm', width: 173, shortWidth: 0 }, { char: 'n', width: 119, shortWidth: 0 }, { char: 'o', width: 115, shortWidth: 107 }, { char: 'p', width: 120, shortWidth: 0 }, { char: 'q', width: 120, shortWidth: 0 }, { char: 'r', width: 80, shortWidth: 67 }, { char: 's', width: 100, shortWidth: 98 }, { char: 't', width: 84, shortWidth: 0 }, { char: 'u', width: 120, shortWidth: 107 }, { char: 'v', width: 107, shortWidth: 0 }, { char: 'w', width: 160, shortWidth: 154 }, { char: 'x', width: 110, shortWidth: 0 }, { char: 'y', width: 106, shortWidth: 104 }, { char: 'z', width: 93, shortWidth: 0 }, { char: '1', width: 84, shortWidth: 0 }, { char: '2', width: 125, shortWidth: 0 }, { char: '3', width: 136, shortWidth: 0 }, { char: '4', width: 138, shortWidth: 0 }, { char: '5', width: 130, shortWidth: 0 }, { char: '6', width: 129, shortWidth: 0 }, { char: '7', width: 107, shortWidth: 0 }, { char: '8', width: 138, shortWidth: 0 }, { char: '9', width: 129, shortWidth: 0 }, { char: '0', width: 145, shortWidth: 0 }, { char: ',', width: 56, shortWidth: 0 }, { char: '.', width: 56, shortWidth: 0 }, { char: '’', width: 41, shortWidth: 0 }, { char: ':', width: 56, shortWidth: 0 }, { char: '•', width: 56, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 71, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 115, shortWidth: 0 }, { char: ')', width: 115, shortWidth: 0 }, { char: '/', width: 88, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '“', width: 92, shortWidth: 0 }, { char: '”', width: 92, shortWidth: 0 }],
  textPanelInit: function () {
    tabNum = 2
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-text', 'Add Text', parent, '', FormTextAddComponent.TextinputHandler, 'input')
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100, FormTextAddComponent.TextinputHandler, 'input')
      canvas.on('mouse:move', FormTextAddComponent.TextonMouseMove)
      canvas.on('mouse:down', FormTextAddComponent.TextonMouseClick)
    }
  },

  TextHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormTextAddComponent.TextonMouseMove)
    canvas.off('mouse:down', FormTextAddComponent.TextonMouseClick)
    document.addEventListener('keydown', ShowHideSideBarEvent);
    document.removeEventListener('keydown', FormTextAddComponent.cancelInput)
    canvas.renderAll()
  },

  cancelInput: function (event) {
    if (event.key === 'Escape') {
      document.getElementById('input-text').value = ''
      cursor.forEachObject(function (o) { cursor.remove(o) })
    }
  },

  TextinputHandler: function (event, options = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormTextAddComponent.cancelInput)
    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.txtChar = []
    cursor.text = ''
    cursor.shapeMeta = null
    if (options) {
      var txt = options.text
      var xHeight = options.xHeight
    }
    else {
      var txt = document.getElementById('input-text').value
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
    }
    txtObjects = FormTextAddComponent.createTextObject(txt, xHeight)

    // Get cursor position
    //const cursorLeft = cursor.left || 0;
    //const cursorTop = cursor.top || 0;

    // Offset object positions relative to cursor position
    //txtObjects[0].forEach(obj => {
    //  obj.set({
    //    left: obj.left + cursorLeft,
    //    top: obj.top + cursorTop
    //  });
    //});
    //
    //txtObjects[1].forEach(obj => {
    //  obj.set({
    //    left: obj.left + cursorLeft,
    //    top: obj.top + cursorTop
    //  });
    //});
    //
    cursor.add(...txtObjects[0])
    cursor.add(...txtObjects[1])
    // Update the coordinates
    //txt_char.setCoords();
    //txt_frame.setCoords()
    //
    //cursor.txtChar.push(txt_char)
    cursor.text = txt
    cursor.xHeight = xHeight
    canvas.renderAll();

  },

  createTextObject: function (txt, xHeight) {
    txtCharList = []
    txtFrameList = []
    left_pos = 0
    for (var i = 0; i < txt.length; i++) {
      // Check if the character is a Chinese character
      if (!FormTextAddComponent.textWidthMedium.map(item => item.char).includes(txt.charAt(i))) {
        charWidth = 2.25 * xHeight / 100
        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: 'Noto Sans Hong Kong',
          fontWeight: 400,
          left: left_pos + 0.25 * xHeight,
          top: 0.1 * xHeight,
          fill: '#fff',
          fontSize: xHeight * 2.25,
          //origin: 'centerX',
        })
        txt_char.lockScalingX = txt_char.lockScalingY = true;
        txt_frame = new fabric.Rect({
          left: left_pos,
          top: 0,
          width: 2.75 * xHeight - 2, // Adjust the width border stroke
          height: 2.75 * xHeight - 2,
          fill: 'rgba(0,0,0,0)', // Transparent fill
          stroke: '#FFFFFF', // White stroke color to match the canvas style
          strokeWidth: 2, // Adjust stroke width for consistency
          strokeDashArray: [xHeight / 10, xHeight / 10],
        })

        left_pos += 2.75 * xHeight
      } else {
        charWidth = FormTextAddComponent.textWidthMedium.find(e => e.char == txt.charAt(i)).width

        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: 'TransportMedium',
          left: left_pos,
          top: 6,
          fill: '#fff',
          fontSize: xHeight * 1.88,
          //origin: 'centerX',
        })
        txt_char.lockScalingX = txt_char.lockScalingY = true;

        txt_frame = new fabric.Rect({
          left: left_pos,
          top: 0,
          width: charWidth * xHeight / 100 - 2, // Adjust the width border stroke
          height: xHeight * 2 - 2,
          fill: 'rgba(0,0,0,0)', // Transparent fill
          stroke: '#FFFFFF', // White stroke color to match the canvas style
          strokeWidth: 2, // Adjust stroke width for consistency
          strokeDashArray: [xHeight / 10, xHeight / 10],
        })

        //txt_char.clipPath = txt_frame;

        left_pos += charWidth * xHeight / 100
      }
      txtCharList.push(txt_char)
      txtFrameList.push(txt_frame)
    }
    return [txtCharList, txtFrameList]
  },

  TextonMouseMove: function (event) {
    var pointer = canvas.getPointer(event.e);
    var posx = pointer.x;
    var posy = pointer.y;
    cursor.set({
      left: posx,
      top: posy
    });
    canvas.renderAll();
  },

  TextonMouseClick: async function (event, options = null) {
    //permanent cursor object 
    if (options) {
      cursor.set(
        { left: options.left, top: options.top, text: options.text, xHeight: options.xHeight }
      )

      textValue = options.text
      xHeight = options.xHeight
      eventButton = 0
    } else {
      textValue = document.getElementById("input-text").value
      xHeight = parseInt(document.getElementById('input-xHeight').value)
      eventButton = event.e.button
    }
    if (textValue !== '' && eventButton === 0) {

      const group = new fabric.Group()
      txtObjects = FormTextAddComponent.createTextObject(cursor.text, cursor.xHeight)

      group.add(...txtObjects[0])
      group.add(...txtObjects[1])
      group.set({ left: cursor.left, top: cursor.top })
      group.getCombinedBoundingBoxOfRects = function () {
        let combinedBBox = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
        let points = [];
        this.forEachObject(obj => {
          if (obj.type === 'rect') {
            obj.setCoords();
            const aCoords = obj.aCoords;


            // Transform the coordinates to the canvas coordinate system
            Object.values(aCoords).forEach(point => {
              const absPoint = fabric.util.transformPoint(point, this.calcTransformMatrix());
              combinedBBox.left = Math.min(combinedBBox.left, absPoint.x);
              combinedBBox.top = Math.min(combinedBBox.top, absPoint.y);
              combinedBBox.right = Math.max(combinedBBox.right, absPoint.x);
              combinedBBox.bottom = Math.max(combinedBBox.bottom, absPoint.y);
            });
          }
        });

        // Calculate the 8 points (excluding the center point) from the combined bounding box
        const centerX = (combinedBBox.left + combinedBBox.right) / 2;
        const centerY = (combinedBBox.top + combinedBBox.bottom) / 2;

        points = [
          { x: combinedBBox.left, y: combinedBBox.top, label: 'E1' }, // Top-left corner
          { x: centerX, y: combinedBBox.top, label: 'E2' }, // Top-middle
          { x: combinedBBox.right, y: combinedBBox.top, label: 'E3' }, // Top-right corner
          { x: combinedBBox.right, y: centerY, label: 'E4' }, // Middle-right
          { x: combinedBBox.right, y: combinedBBox.bottom, label: 'E5' }, // Bottom-right corner
          { x: centerX, y: combinedBBox.bottom, label: 'E6' }, // Bottom-middle
          { x: combinedBBox.left, y: combinedBBox.bottom, label: 'E7' }, // Bottom-left corner
          { x: combinedBBox.left, y: centerY, label: 'E8' } // Middle-left
        ];

        return points;

      }
      group.setCoords()
      group.vertex = group.getCombinedBoundingBoxOfRects()
      group.text = textValue
      group.xHeight = xHeight

      drawBasePolygon(group, 'Text', false)

      FormTextAddComponent.TextinputHandler(null, { text: cursor.text, xHeight: cursor.xHeight })
      canvas.renderAll()
    }
  },

}

let FormDrawMapComponent = {
  EndShape: ['Arrow', 'Butt'],
  permitAngle: [45, 60, 90],
  defaultRoute: [{ x: 0, y: 7, angle: 60, width: 4, shape: 'Arrow' },],
  drawMapPanelInit: function () {
    tabNum = 4
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      parent.routeCount = 0
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100, null, 'input')
      GeneralHandler.createbutton('button-DrawMap', 'Draw New Route Symbol', parent, 'input', FormDrawMapComponent.drawRootRouteOnCursor, 'click')
      GeneralHandler.createinput('root-length', 'root length', parent, 7, null, 'input')
      GeneralHandler.createinput('tip-length', 'tip length', parent, 12, null, 'input')
      //FormDrawMapComponent.addRouteInput()

      const existingRoute = canvas.getActiveObject()
      const routeList = existingRoute ? existingRoute.routeList : FormDrawMapComponent.defaultRoute

      routeList.forEach((route, index) => {
        var routeContainer = GeneralHandler.createNode("div", { 'class': 'inputr-container' }, parent);
        GeneralHandler.createselect(`route${index+1}-shape`, `Route ${index+1} Shape`, FormDrawMapComponent.EndShape, routeContainer, route.shape, null, 'change')
        GeneralHandler.createinput(`route${index+1}-width`, `Route ${index+1} Width`, routeContainer, index+1 == 1 ? 6 : 4, null, 'input')
  
        var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, parent);
        GeneralHandler.createbutton(`rotate-left-${index+1}`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawMapComponent.setAngle, 'click')
        var angleDisplay = GeneralHandler.createNode("div", { 'id': `angle-display-${index+1}`, 'class': 'angle-display' }, angleContainer);
        angleDisplay.innerText = route.angle + '°';
        parent.routeCount += 1
      })

    }
  },

  addRouteInput: function (event) {
    var parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObject()

    
    if (existingRoute && existingRoute.functionalType === 'MainRoute') {
      canvas.on('mouse:move', FormDrawMapComponent.drawBranchRouteOnCursor)
    }
    if (event && event.target) {
      // Move the event target button to the bottom of the parent container
      parent.appendChild(event.target.parentNode);
    }
    //canvas.getActiveObject().addEventListener('mouse:move', FormDrawMapComponent.drawSideRouteMap)
  },

  drawRootRouteOnCursor: async function (event) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormDrawMapComponent.cancelDraw)
    canvas.on('mouse:move', FormDrawAddComponent.DrawonMouseMove)
    canvas.on('mouse:down', FormDrawMapComponent.cursorRouteOnMouseClick)

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
    routeList = [{ x: 0, y: rootLength * xHeight / 4, angle: 180, width: 6, shape: 'Butt' },
    { x: 0, y: -tipLength * xHeight / 4, angle: 0, width: 6, shape: 'Arrow' }
    ]

    let vertexList = FormDrawMapComponent.calcRootVertices(xHeight, routeList)

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
    cursorOffset.y = symbolOffset.top

    cursor.add(Polygon1)
    cursor.shapeMeta = vertexList
  },

  cursorRouteOnMouseClick: async function (event, options = null) {
    //permanent cursor object 
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

      const routeMap = drawBasePolygon(arrow, 'MainRoute');
      routeMap.routeList = calculateTransformedPoints(cursor.routeList, { x: posx, y: posy, angle: 0 })
      //routeMap.basePolygon.vertex = cursor.shapeMeta.path[0].vertex
      routeMap.routeCenter = [{ x: posx, y: posy }, { x: posx, y: posy }]
      routeMap.xHeight = cursor.xHeight
      routeMap.rootLength = cursor.rootLength
      routeMap.tipLength = cursor.tipLength
      routeMap.branchRoute = []
      routeMap.tempExtend = { top: 0, bottom: 0 }

      routeMap.on('selected', FormDrawMapComponent.routeMapOnSelect)
      routeMap.on('deselected', FormDrawMapComponent.routeMapOnDeselect)
      routeMap.receiveNewRoute = FormDrawMapComponent.receiveNewRoute
      canvas.discardActiveObject();
      setTimeout(() => {
        canvas.setActiveObject(routeMap);
      }, 100);
      cursor.forEachObject(function (o) { cursor.remove(o) })
      FormDrawMapComponent.drawBranchRouteHandlerOff()
      document.addEventListener('keydown', ShowHideSideBarEvent);
    }
  },

  receiveNewRoute: async function (route=null) {
    if (route){

      const vertexList = route.path ? route.path[0].vertex : route.basePolygon.vertex
      const newLeft = vertexList[3].x
      const newTop = newLeft < this.left ? vertexList[6].y : vertexList[0].y
      const newBottom = newLeft < this.left ? vertexList[0].y : vertexList[6].y
      this.routeList.forEach(route => {
        if (route.angle === 0) {
  
            route.y = Math.min(...[newTop,...this.routeCenter.map(v => v.y)]) - this.tipLength * this.xHeight / 4
            //this.routeCenter[0].y = newTop 
          //}
          //    RootTopVertex[i].y -= (routeCenter.y - arrowTipVertex[4].y) > 0 ? (routeCenter.y - arrowTipVertex[4].y) : 0;
        } else if (route.angle === 180) {
  
          //if (newBottom - Math.max(...this.routeCenter.map(v => v.y)) > 0) {
            //this.tempExtend.bottom = Math.max(...[newBottom,...this.routeCenter.map(v => v.y)]) + this.rootLength * this.xHeight / 4
            route.y = Math.max(...[newBottom,...this.routeCenter.map(v => v.y)]) + this.rootLength * this.xHeight / 4
            //this.routeCenter[1].y = newBottom 
          //}
        }
      })
    }
    let newVertexList = FormDrawMapComponent.calcRootVertices(this.xHeight, this.routeList)
    const newPolygon = new GlyphPath()
    await newPolygon.initialize(newVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })
    const centerPoints = this.basePolygon.vertex.filter(v => v.label.includes('C'))
    this.basePolygon = newPolygon
    this.removeAll()
    this.add(newPolygon)
    if(centerPoints != []) {this.basePolygon.vertex.push(...centerPoints)}
    this.drawVertex()
  },

  drawBranchRouteOnCursor: async function (event, option = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    let rootRoute = canvas.getActiveObject()
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
    tempVertexList = FormDrawMapComponent.calcBranchVertices(rootRoute.xHeight, rootRoute.routeCenter, routeList)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.xHeight = rootRoute.xHeight
    cursor.routeList = routeList
    cursor.rootRoute = rootRoute

    //rootRoute.removeAll()
    polygon1 = new GlyphPath()
    await polygon1.initialize(tempVertexList, { left: 0, top: 0, angle: 0, color: 'white', objectCaching: false, dirty: true, strokeWidth: 0, })

    symbolOffset = getInsertOffset(tempVertexList)
    cursorOffset.x = symbolOffset.left
    cursorOffset.y = symbolOffset.top

    cursor.add(polygon1)
    cursor.shapeMeta = tempVertexList

    rootRoute.receiveNewRoute(tempVertexList)
    canvas.renderAll()

    // Remove existing listeners first to avoid duplicates
    canvas.off('mouse:up', FormDrawMapComponent.finishDrawBranchRoute)
    document.removeEventListener('keydown', FormDrawMapComponent.cancelDraw)


    // Add new listeners
    canvas.on('mouse:up', FormDrawMapComponent.finishDrawBranchRoute)
    document.addEventListener('keydown', FormDrawMapComponent.cancelDraw)

  },

  sortRootList: function (center, points) {
    // Sort the root list by angle from south axis (180 degrees), clockwise
    // Add an angle property to each point using tan(angle) = y/x
    const angles = points.map(point => ({
      ...point,
      centerAngle: Math.atan2(point.y - center.y, point.x - center.x) >= Math.PI / 2 ? Math.atan2(point.y - center.y, point.x - center.x) - 2 * Math.PI : Math.atan2(point.y - center.y, point.x - center.x)
    }));

    // Sort your points by angle
    const pointsSorted = angles.sort((a, b) => a.centerAngle - b.centerAngle);
    return pointsSorted;
  },

  getBranchCoords: function (root, length, left, right) {
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
        const i0 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(root.angle / 180 * Math.PI) + length * Math.tan((90 - Math.abs(root.angle)) / 360 * Math.PI), }
        const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(root.angle / 180 * Math.PI), radius: length }
        const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(root.angle / 180 * Math.PI), radius: length }
        const i3 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(root.angle / 180 * Math.PI) - length * Math.tan((90 - Math.abs(root.angle)) / 360 * Math.PI) }
        arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
      } else if (root.x > right) {
        const i0 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(root.angle / 180 * Math.PI) - length * Math.tan((90 - Math.abs(root.angle)) / 360 * Math.PI) }
        const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
        const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(root.angle / 180 * Math.PI), radius: length }
        const i3 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(root.angle / 180 * Math.PI) + length * Math.tan((90 - Math.abs(root.angle)) / 360 * Math.PI) }
        arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
      }
    }
    return arrowTipVertex
  },

  calcRootVertices: function (xheight, routeList) {
    const length = xheight / 4
    let RootBottom = routeList.filter(item => item.angle === 180)[0]
    let RootTop = routeList.filter(item => item.angle === 0)[0]
    let RootBottomVertex = FormDrawMapComponent.getBranchCoords(RootBottom, length)
    let RootTopVertex = FormDrawMapComponent.getBranchCoords(RootTop, length)

    const vertexList = [...RootTopVertex, ...RootBottomVertex]
    FormDrawMapComponent.assignRouteVertex(vertexList)
    return { path: [{ 'vertex': vertexList, 'arcs': [] }] };
  },

  calcBranchVertices: function (xheight, routeCenter, routeList) {

    const length = xheight / 4

    // Calculate the direction vector of the arrow
    //routeList = FormDrawMapComponent.sortRootList(routeCenter, routeList);
    let vertexList = [];
    let RootTop = routeList.filter(item => item.angle === 0)[0]
    let RootTopVertex = FormDrawMapComponent.getBranchCoords(RootTop, length)
    let RootLeft = RootTopVertex[0].x
    let RootRight = RootTopVertex[2].x
    let lastRoot = routeList[routeList.length - 1]

    // Calculate the arrowhead vertices
    const arrowTipVertex = FormDrawMapComponent.getBranchCoords(lastRoot, length, RootLeft, RootRight)

    vertexList.push(...arrowTipVertex)

    FormDrawMapComponent.assignRouteVertex(vertexList)
    return { path: [{ 'vertex': vertexList, 'arcs': [] }] };
  },

  setAngle: function (event) {
    const count = event.currentTarget.id.split('-')[2]
    const currentText = document.getElementById(`angle-display-${count}`).innerText.slice(0, -1);
    const angleIndex = FormDrawMapComponent.permitAngle.indexOf(parseInt(currentText))
    FormDrawMapComponent.routeAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length]

    document.getElementById(`angle-display-${count}`).innerText = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length] + '°';

  },


  assignRouteVertex: function (vertexList) {

    //const firstVertex = vertexList.shift();
    //vertexList.push(firstVertex);
    vertexList.map((vertex, index) => {
      vertex.label = `V${index + 1}`
      vertex.start = index == 0 ? 1 : 0
    })
  },

  finishDrawBranchRoute: async function (event) {
    if (event.e.button === 0) {
      const rootRoute = cursor.rootRoute
      FormDrawMapComponent.drawBranchRouteHandlerOff()

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
      //rootRoute.drawVertex()
      rootRoute.setCoords()
      rootRoute.tempExtend = { top: 0, bottom: 0 }
      tempBranchShape.on('moving', FormDrawMapComponent.branchRouteOnMove.bind(tempBranchShape))
      tempBranchShape.on('modified', FormDrawMapComponent.branchRouteOnMove.bind(tempBranchShape))
    }
  },

  branchRouteOnMove: function (event) {
    this.updateAllCoord()
    const rootRoute = this.rootRoute
    const branchIndex = rootRoute.branchRoute.indexOf(this)
    rootRoute.routeCenter[branchIndex].y = this.basePolygon.vertex[0].y
    rootRoute.routeCenter[branchIndex+1].y = this.basePolygon.vertex[6].y
    rootRoute.basePolygon.vertex.find(o => o.label==`C${branchIndex*2+1}`).y = this.basePolygon.vertex[0].y
    rootRoute.basePolygon.vertex.find(o => o.label==`C${branchIndex*2+2}`).y = this.basePolygon.vertex[6].y
    rootRoute.basePolygon.vertex[branchIndex+1].y = this.basePolygon.vertex[6].y
    rootRoute.receiveNewRoute(this)
    rootRoute.setCoords()
  },

  drawBranchRouteHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormDrawMapComponent.drawBranchRouteOnCursor)
    canvas.off('mouse:up', FormDrawMapComponent.finishDrawBranchRoute)
    canvas.off('mouse:down', FormDrawMapComponent.cursorRouteOnMouseClick)
    document.removeEventListener('keydown', FormDrawMapComponent.cancelDraw)
    document.addEventListener('keydown', ShowHideSideBarEvent);
  },

  cancelDraw: function (event, force = false) {
    if (event.key === 'Escape' || force) {
      FormDrawMapComponent.drawBranchRouteHandlerOff()
      setTimeout(() => {
        document.addEventListener('keydown', ShowHideSideBarEvent);
      }, 1000)
    }
  },

  routeMapOnSelect: function (event) {
    const panel = document.getElementById("button-DrawMap");
    const parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObject()
    if (panel && parent && existingRoute && existingRoute.functionalType === 'MainRoute') {

      //parent.routeCount = existingRoute.routeList.length
      GeneralHandler.createbutton('button-addRoute', '+ Another Route Destination', parent, 'input', FormDrawMapComponent.addRouteInput, 'click')

    }
  },

  routeMapOnDeselect: function (event) {
    const existingRoute = event.target


    const panel = document.getElementById("button-addRoute");
    if (panel) {
      panel.parentNode.parentNode.removeChild(panel.parentNode)
    }
    canvas.off('mouse:move', FormDrawMapComponent.drawBranchRouteOnCursor)
    existingRoute.routeList = existingRoute.tempRootList || existingRoute.routeList

    parent.routeCount = 1

  },

}

/* Draw Symbol Panel */
let FormDrawAddComponent = {
  symbolAngle: 0,
  drawPanelInit: function () {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100, null, 'input')

      // Replace slider with two rotate buttons:
      var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, parent);

      var btnRotateLeft = GeneralHandler.createbutton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var btnRotateRight = GeneralHandler.createbutton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var angleDisplay = GeneralHandler.createNode("div", { 'id': 'angle-display', 'class': 'angle-display' }, angleContainer);
      angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';

      //GeneralHandler.createbutton('button-approach-arm', 'Add Approach arm', parent, 0, FormDrawAddComponent.drawApproachClick, 'click')
      Object.keys(symbolsTemplate).forEach(symbol => {
        const button = FormDrawAddComponent.createButtonSVG(symbol, 5)
        GeneralHandler.createbutton(`button-${symbol}`, button, parent, 'symbol', FormDrawAddComponent.drawSymbolOnCursor, 'click')
      })
    }
  },

  setAngle: function (event) {
    if (event.currentTarget.id.search('left') > -1) {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle - 45
    } else {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle + 45
    }
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle > 90 ? -90 : FormDrawAddComponent.symbolAngle
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle < -90 ? +90 : FormDrawAddComponent.symbolAngle
    // Handle the angle selection
    document.getElementById('angle-display').innerText = FormDrawAddComponent.symbolAngle + '°';
    if (cursor._objects.length) {
      FormDrawAddComponent.drawSymbolOnCursor(null, { symbol: cursor.symbol, xHeight: cursor.xHeight })
    }
    // You can add your logic here to apply the angle to the shape
  },

  DrawHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormDrawAddComponent.DrawonMouseMove)
    canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
    canvas.renderAll()
  },

  DrawonMouseMove: function (event) {
    var pointer = canvas.getPointer(event.e);
    var posx = pointer.x;
    var posy = pointer.y;
    cursor.set({
      left: posx + cursorOffset.x,
      top: posy + cursorOffset.y,
    });
    canvas.renderAll();
  },

  SymbolonMouseClick: function (event, options = null) {
    //permanent cursor object 
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
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
      const arrowOptions1 = { x: posx, y: posy, length: xHeight / 4, angle: FormDrawAddComponent.symbolAngle, color: 'white', };
      drawLabeledSymbol(cursor.shapeMeta, cursor.symbol, arrowOptions1);
    }
  },

  createButtonSVG: (symbolType, length) => {
    const symbolData = calcSymbol(symbolType, length);
    let pathData = vertexToPath(symbolData);

    const svgWidth = 100;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const tempPath = new fabric.Path(pathData, { strokeWidth: 0 });
    let symbolSize = { width: tempPath.width, height: tempPath.height, left: tempPath.left, top: tempPath.top };
    // override the err width and height of symbol with circular border
    if (symbolType === 'MTR') {
      symbolSize.width = 130;
    }
    if (symbolType === 'Hospital') {
      symbolSize.width = 80;
    }
    const scaleX = svgWidth / symbolSize.width;
    const scaleY = svgHeight / symbolSize.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - symbolSize.width * scale) / 2 - symbolSize.left * scale;
    const translateY = (svgHeight - symbolSize.height * scale) / 2 - symbolSize.top * scale;

    pathData = pathData.replace(/<svg>/g, '<svg style="width:100;height:100;">')
    pathData = pathData.replace(/<path/g, `<path transform="translate(${translateX}, ${translateY}) scale(${scale})"`);
    const svg = pathData;


    return svg;
  },
  drawSymbolOnCursor: async (event, options = null) => {
    canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
    canvas.on('mouse:move', FormDrawAddComponent.DrawonMouseMove)
    canvas.on('mouse:down', FormDrawAddComponent.SymbolonMouseClick)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.txtChar = []
    cursor.text = ''

    if (options) {
      symbol = options.symbol
      var xHeight = options.xHeight
    }
    else {
      symbol = event.currentTarget.id.replace('button-', '')
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
    }


    let symbolObject = calcSymbol(symbol, xHeight / 4)

    const arrowOptions1 = {
      left: 0,
      top: 0,
      fill: '#FFF',
      angle: FormDrawAddComponent.symbolAngle,
      // originX: 'center',
      objectCaching: false,
      strokeWidth: 0
    }
    cursor.shapeMeta = symbolObject
    cursor.symbol = symbol

    Polygon1 = new GlyphPath()
    await Polygon1.initialize(symbolObject, arrowOptions1)



    Polygon1.symbol = symbol
    Polygon1.xHeight = xHeight

    symbolOffset = getInsertOffset(symbolObject)
    cursorOffset.x = symbolOffset.left
    cursorOffset.y = symbolOffset.top

    cursor.add(Polygon1)
    Polygon1.setCoords();

    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormDrawAddComponent.cancelDraw)

    canvas.renderAll();


  },

  cancelDraw: (event) => {
    if (event.key === 'Escape') {
      cursor.forEachObject(function (o) { cursor.remove(o) })
      canvas.off('mouse:move', FormTextAddComponent.TextonMouseMove)
      canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
      canvas.requestRenderAll()
      setTimeout(() => {
        document.addEventListener('keydown', ShowHideSideBarEvent);
      }, 1000); // Delay in milliseconds (e.g., 1000ms = 1 second)
    }
  },

}

/* Border Panel */
let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100)
      GeneralHandler.createselect('input-type', 'Select Border Type', Object.keys(BorderTypeScheme), parent, null, '', '', 'select')
      GeneralHandler.createselect('input-color', 'Select Color Scheme', Object.keys(BorderColorScheme), parent, null, '', '', 'select')
      GeneralHandler.createbutton('input-text', 'Select Objects for border', parent, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
      GeneralHandler.createbutton('input-text', 'Add stack border divider', parent, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
    }
  },
  BorderCreateHandler: async function () {
    selectObjectHandler('Select shape to calculate border width', function (widthObjects) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects) {
        FormBorderWrapComponent.BorderGroupCreate(heightObjects, widthObjects)
      })
    })
  },

  StackDividerHandler: function () {
    selectObjectHandler('Select object above divider', function (aboveObject) {
      selectObjectHandler('Select object below divider', function (belowObject) {
        FormBorderWrapComponent.DividerCreate(aboveObject, belowObject)
      })
    })
  },

  DividerCreate: async function (aboveObjects, belowObjects, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const aboveObject = this.getBottomMostObject(aboveObjects)
    const belowObject = this.getTopMostObject(belowObjects)

    if (Object.keys(belowObject.lockYToPolygon).length != 0) {
      showTextBox('Unlock the object below divider in Y axis')
      return
    }
    const aboveObjectBBox = FormBorderWrapComponent.getBoundingBox(aboveObjects)
    const aboveBottom = aboveObjectBBox.bottom
    const width = aboveObjectBBox.right - aboveObjectBBox.left
    const BaseBorder = await drawDivider(xHeight, aboveBottom, width)
    const borderGroup = drawBasePolygon(BaseBorder, 'HDivider')
    borderGroup.xHeight = xHeight
    anchorShape(aboveObject, borderGroup, {
      vertexIndex1: 'E2',
      vertexIndex2: 'E6',
      spacingX: '',
      spacingY: 0
    })
    anchorShape(borderGroup, belowObject, {
      vertexIndex1: 'E2',
      vertexIndex2: 'E6',
      spacingX: '',
      spacingY: 1. * xHeight / 4
    })

  },

  getBottomMostObject: function (objects) {
    let bottomMostObject = null;
    let maxBottom = -Infinity;

    objects.forEach(obj => {
      const objBottom = obj.top + obj.height * obj.scaleY; // Calculate the bottom coordinate

      if (objBottom > maxBottom) {
        maxBottom = objBottom;
        bottomMostObject = obj;
      }
    });

    return bottomMostObject;
  },

  getTopMostObject: function (objects) {
    let topMostObject = null;
    let minTop = Infinity;

    objects.forEach(obj => {
      const objTop = obj.top; // Calculate the top coordinate

      if (objTop < minTop) {
        minTop = objTop;
        topMostObject = obj;
      }
    });

    return topMostObject;
  },

  // Function to get the bounding box of specific objects
  getBoundingBox: function (objects) {
    // Loop through each object and its basePolygon
    let combinedBBox = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    objects.forEach(obj => {



      coord = obj.getEffectiveCoords()
      // Update the combined bounding box
      combinedBBox.left = Math.min(combinedBBox.left, coord[0].x,);
      combinedBBox.top = Math.min(combinedBBox.top, coord[0].y,);
      combinedBBox.right = Math.max(combinedBBox.right, coord[2].x,);
      combinedBBox.bottom = Math.max(combinedBBox.bottom, coord[2].y,);
    })


    // Return the bounding box coordinates
    return combinedBBox
  },

  // Function to calculate padded coordinates 
  paddingCoords: function getPaddedCoords(coords, xHeight, padLeft, padRight, padTop, padBottom) {
    return {
      left: coords.left - padLeft * xHeight / 4,
      top: coords.top - padTop * xHeight / 4,
      right: coords.right + padRight * xHeight / 4,
      bottom: coords.bottom + padBottom * xHeight / 4
    }

  },

  calcBorder: function (heightObjects, widthObjects, xHeight, borderType) {
    // Get the bounding box of the active selection 
    const coordsWidth = FormBorderWrapComponent.getBoundingBox(widthObjects)
    const coordsHeight = FormBorderWrapComponent.getBoundingBox(heightObjects)
    const coords = { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }

    /*
      coords[0]: Top-left corner
      coords[1]: Top-right corner
      coords[2]: Bottom-right corner
      coords[3]: Bottom-left corner
    */

    innerBorderCoords = FormBorderWrapComponent.paddingCoords(coords, xHeight, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
    outerBorderCoords = FormBorderWrapComponent.paddingCoords(innerBorderCoords, xHeight, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)

    // Border Rounding
    borderWidth = outerBorderCoords.right - outerBorderCoords.left
    borderHeight = outerBorderCoords.bottom - outerBorderCoords.top
    if (borderWidth > 2000 || borderHeight > 2000) {
      roundingX = (50.0 * Math.round(borderWidth / 50.0) - borderWidth) / 2
      roundingY = (50.0 * Math.round(borderHeight / 50.0) - borderHeight) / 2
    } else {
      roundingX = (25.0 * Math.round(borderWidth / 25.0) - borderWidth) / 2
      roundingY = (25.0 * Math.round(borderHeight / 25.0) - borderHeight) / 2
      roundingX = roundingX < -2.5 ? roundingX = 25 / 2 + roundingX : roundingX
      roundingY = roundingY < -2.5 ? roundingY = 25 / 2 + roundingY : roundingY
    }

    outerBorderCoords = {
      left: outerBorderCoords.left - roundingX,
      top: outerBorderCoords.top - roundingY,
      right: outerBorderCoords.right + roundingX,
      bottom: outerBorderCoords.bottom + roundingY
    }

    innerBorderCoords = {
      left: innerBorderCoords.left - roundingX,
      top: innerBorderCoords.top - roundingY,
      right: innerBorderCoords.right + roundingX,
      bottom: innerBorderCoords.bottom + roundingY
    }
    console.log(outerBorderCoords.top - innerBorderCoords.top)
    return { in: innerBorderCoords, out: outerBorderCoords }
  },

  FilterDivider: function (heightObjects, widthObjects) {
    let HDividerObject = []
    let VDividerObject = []
    let fwidthObjects = widthObjects.filter(obj => {
      if (obj.functionalType == 'HDivider') {
        HDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      return true; // Keep the object in original array
    });

    let fheightObjects = heightObjects.filter(obj => {
      if (obj.functionalType == 'VDivider') {
        VDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      return true; // Keep the object in original array
    });
    return [fheightObjects, fwidthObjects, VDividerObject, HDividerObject]
  },

  RoundingToDivider: function (HDividers, VDividers, rounding, sourceList = []) {
    rounding.x /= (VDividers.length + 1) * 2
    rounding.y /= (HDividers.length + 1) * 2
    HDividers.forEach(h => {
      if (!sourceList.includes(h.lockYToPolygon.TargetObject)) {
        anchorShape(h.lockYToPolygon.TargetObject, h, {
          vertexIndex1: h.lockYToPolygon.sourcePoint,
          vertexIndex2: h.lockYToPolygon.targetPoint,
          spacingX: '',
          spacingY: h.lockYToPolygon.spacing + rounding.y
        }, sourceList)
      }
      const nextAnchor = h.anchoredPolygon[0]
      if (!sourceList.includes(nextAnchor)) {
        anchorShape(h, nextAnchor, {
          vertexIndex1: nextAnchor.lockYToPolygon.sourcePoint,
          vertexIndex2: nextAnchor.lockYToPolygon.targetPoint,
          spacingX: '',
          spacingY: nextAnchor.lockYToPolygon.spacing + rounding.y
        }, sourceList)
      }
    })
    VDividers.forEach(v => {
      if (!sourceList.includes(v.lockXToPolygon.TargetObject)) {
        anchorShape(v.lockXToPolygon.TargetObject, v, {
          vertexIndex1: v.lockXToPolygon.sourcePoint,
          vertexIndex2: v.lockXToPolygon.targetPoint,
          spacingX: v.lockXToPolygon.spacing + rounding.x,
          spacingY: ''
        }, sourceList)
      }
      const nextAnchor = v.anchoredPolygon[0]
      if (!sourceList.includes(nextAnchor)) {
        anchorShape(v, nextAnchor, {
          vertexIndex1: nextAnchor.lockXToPolygon.sourcePoint,
          vertexIndex2: nextAnchor.lockXToPolygon.targetPoint,
          spacingX: nextAnchor.lockXToPolygon.spacing + rounding.x,
          spacingY: ''
        }, sourceList)
      }
    })

  },

  addMidPointToDivider: function (borderGroup) {
    let top = borderGroup.getEffectiveCoords()[0].y
    let left = borderGroup.getEffectiveCoords()[0].x
    const width = borderGroup.getBoundingRect().width
    const height = borderGroup.getBoundingRect().height
    const frame = 1.5 * borderGroup.xHeight / 4
    let i = 0
    borderGroup.HDivider.forEach(d => {
      const midPt = (top + d.getEffectiveCoords()[0].y) / 2
      borderGroup.basePolygon.vertex.push({ x: left, y: midPt + frame, label: `C${i += 1}` })
      borderGroup.basePolygon.vertex.push({ x: left + width, y: midPt + frame, label: `C${i += 1}` })
      top = d.getEffectiveCoords()[0].y
    })
    if (borderGroup.HDivider.length > 0) {
      const midPt = (borderGroup.HDivider.at(-1).getEffectiveCoords()[2].y + borderGroup.getEffectiveCoords()[2].y) / 2
      borderGroup.basePolygon.vertex.push({ x: left, y: midPt - frame, label: `C${i += 1}` })
      borderGroup.basePolygon.vertex.push({ x: left + width, y: midPt - frame, label: `C${i += 1}` })
    }
    borderGroup.VDivider.forEach(d => {
      const midPt = (left + d.getEffectiveCoords()[0].x) / 2
      borderGroup.basePolygon.vertex.push({ x: midPt + frame, y: top, label: `C${i += 1}` })
      borderGroup.basePolygon.vertex.push({ x: midPt + frame, y: top + height, label: `C${i += 1}` })
      left = d.getEffectiveCoords()[0].x
    })
    if (borderGroup.VDivider.length > 0) {
      const midPt = (borderGroup.VDivider.at(-1).getEffectiveCoords()[2].x + borderGroup.getEffectiveCoords()[2].x) / 2
      borderGroup.basePolygon.vertex.push({ x: midPt - frame, y: top, label: `C${i += 1}` })
      borderGroup.basePolygon.vertex.push({ x: midPt - frame, y: top + height, label: `C${i += 1}` })
    }
  },

  getBorderObjectCoords: function (fheightObjects, fwidthObjects) {
    const coordsWidth = FormBorderWrapComponent.getBoundingBox(fwidthObjects)
    const coordsHeight = FormBorderWrapComponent.getBoundingBox(fheightObjects)
    return { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }

  },

  BorderGroupCreate: async function (heightObjects, widthObjects, options = null) {

    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const borderType = options ? options.borderType : document.getElementById("input-type").value
    const colorType = options ? options.colorType : document.getElementById("input-color").value

    const [fheightObjects, fwidthObjects, VDivider, HDivider] = FormBorderWrapComponent.FilterDivider(heightObjects, widthObjects)

    // Get the bounding box of the active selection 
    let coords = FormBorderWrapComponent.getBorderObjectCoords(fheightObjects, fwidthObjects)

    // handle roundings on borders and dividers
    const rounding = calcBorderRounding(borderType, xHeight, coords)
    FormBorderWrapComponent.RoundingToDivider(HDivider, VDivider, rounding)
    coords = FormBorderWrapComponent.getBorderObjectCoords(fheightObjects, fwidthObjects)

    BaseBorder = drawLabeledBorder(borderType, xHeight, coords, colorType)
    borderGroup = drawBasePolygon(BaseBorder, 'Border')
    borderGroup.widthObjects = [...fwidthObjects]
    borderGroup.heightObjects = [...fheightObjects]
    borderGroup.VDivider = VDivider
    borderGroup.HDivider = HDivider

    borderGroup.borderType = borderType
    borderGroup.xHeight = xHeight
    borderGroup.color = colorType
    FormBorderWrapComponent.addMidPointToDivider(borderGroup)
    FormBorderWrapComponent.assignWidthToDivider(borderGroup)
    borderGroup.addMidPointToDivider = FormBorderWrapComponent.addMidPointToDivider
    borderGroup.assignWidthToDivider = FormBorderWrapComponent.assignWidthToDivider

    borderGroup.lockMovementX = true
    borderGroup.lockMovementY = true

    // Combine the arrays and create a Set to remove duplicates
    canvas.sendObjectToBack(borderGroup)
    widthObjects.forEach(obj => {
      //canvas.bringObjectToFront(obj)
      obj.borderGroup = borderGroup
    })
    heightObjects.forEach(obj => {
      //canvas.bringObjectToFront(obj)
      obj.borderGroup = borderGroup
    })
    canvas.requestRenderAll();
    return borderGroup
  },

  assignWidthToDivider: async function (borderGroup, sourceList = []) {
    const borderSize = borderGroup.getBoundingRect()
    const frame = 1.5 * borderGroup.xHeight / 4
    const innerWidth = borderSize.width - frame * 2
    const innerHeight = borderSize.height - frame * 2
    const innerLeft = borderSize.left + frame
    borderGroup.HDivider.forEach(d => {
      // Store the group's initial top position
      const initialTop = d.getEffectiveCoords()[0].y
      drawDivider(d.xHeight, 0, innerWidth).then((res) => {
        d.removeAll()
        d.add(res)
        d.basePolygon = res
        d.set({ top: initialTop, left: innerLeft });
        d.setCoords()
        d.drawVertex()
        d.updateAllCoord(null, sourceList)
      })
    })

  }

}

/* Debug Panel */
let FormDebugComponent = {
  DebugPanelInit: function () {
    tabNum = 5
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      FormDebugComponent.createDebugInfoPanel(parent);
      // Update the sidebar when an object is selected
      canvas.on('selection:created', FormDebugComponent.selectionListener);
      canvas.on('selection:updated', FormDebugComponent.selectionListener);
      canvas.on('object:modified', FormDebugComponent.selectionListener);
      // Clear the sidebar when no object is selected
      canvas.on('selection:cleared', FormDebugComponent.clearSelectionListener);
      if (canvas.getActiveObject()) {
        FormDebugComponent.updateDebugInfo(canvas.getActiveObjects());
      }
    }
  },
  selectionListener: function (event) {
    let selectedObject = null
    if (event.target) {
      selectedObject = event.target;
    } else {
      selectedObject = event.selected[0];
    }
    FormDebugComponent.updateDebugInfo(selectedObject);
  },
  clearSelectionListener: function (event) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      debugInfoPanel.innerHTML = '';
      const div = document.createElement('div');
      div.innerText = 'Select Object for Info';
      debugInfoPanel.appendChild(div);
    }
  },
  createDebugInfoPanel: function (parent) {
    const debugInfoPanel = document.createElement('div');
    debugInfoPanel.id = 'debug-info-panel';
    parent.appendChild(debugInfoPanel);
    const div = document.createElement('div');
    div.innerText = 'Select Object for Info';
    debugInfoPanel.appendChild(div);
  },

  updateDebugInfo: function (objects) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      objects.length ? object = objects[0] : object = objects
      debugInfoPanel.innerHTML = ''; // Clear previous info
      point = object.getEffectiveCoords()
      const properties = [
        { label: 'Top', value: Math.round(object.top) },
        { label: 'Left', value: Math.round(object.left) },
        { label: 'Width', value: Math.round(object.width) },
        { label: 'Height', value: Math.round(object.height) },
        { label: 'Effective Position', value: `x: ${Math.round(point[0].x)}, y: ${Math.round(point[0].y)}` },
        { label: 'Effective Width', value: Math.round(point[1].x - point[0].x) },
        { label: 'Effective Height', value: Math.round(point[2].y - point[0].y) },

      ];

      properties.forEach(prop => {
        const div = document.createElement('div');
        div.innerText = `${prop.label}: ${prop.value}`;
        debugInfoPanel.appendChild(div);
      });
    }
  },

  DebugHandlerOff: function (event) {
    canvas.off('selection:created', this.selectionListener)
    canvas.off('selection:updated', this.selectionListener)
    canvas.off('selection:cleared', this.clearSelectionListener)
  },
};

let CanvasObjectInspector = {
  createObjectListPanelInit: function () {
    const objectListPanel = document.getElementById('objectListPanel');

    // Clear the existing content
    objectListPanel.innerHTML = '';

    // Loop through the CanvasObject array and append object names to the list
    canvasObject.forEach((obj, index) => {
      const div = document.createElement('div');
      div.className = 'object-list-item';
      div.innerText = `Group (${index}) : ${obj.functionalType}`;
      div.id = `Group (${index})`;
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        canvas.setActiveObject(obj);
        canvas.renderAll();
        // Scroll the parent container to the clicked item
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = canvasObject.indexOf(setActive);
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if (item.id == `Group (${index})`) {
        item.classList.add('selected');
        // Scroll the parent container to the active item
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

// Define the event handler function
function ShowHideSideBarEvent(e) {
  switch (e.keyCode) {
    case 27: // esc
      GeneralHandler.ShowHideSideBar(e);
      break;
  }
}

window.onload = () => {
  document.getElementById('show_hide').onclick = GeneralHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit
  document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit
  document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit
  document.getElementById('btn_map').onclick = FormDrawMapComponent.drawMapPanelInit
  document.getElementById('btn_debug').onclick = FormDebugComponent.DebugPanelInit
  //canvas.on('object:added', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:removed', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:modified', CanvasObjectInspector.createObjectListPanel);
  FormDrawMapComponent.drawMapPanelInit()
  document.addEventListener('keydown', ShowHideSideBarEvent);
}