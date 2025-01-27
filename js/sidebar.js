var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;
tabNum = 2;

canvas.add(cursor);

canvas.snap_pts = [];

/* General Sidebar Panel */
let GeneralHandler = {
  panelOpened: true,
  currentTab: 2,
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
    var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container}-button`, 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
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
    var input = GeneralHandler.createNode("select", { 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    var label = GeneralHandler.createNode("label", { 'class': 'placeholder', 'for': name }, inputContainer)
    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i];
      option.text = options[i];
      input.appendChild(option);
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

  cancelInput: function(event){
    if(event.key === 'Escape'){
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
    if (options) {
      var txt = options.text
      var xHeight = options.xHeight
    }
    else {
      var txt = document.getElementById('input-text').value
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
    }
      txtObjects = FormTextAddComponent.createTextObject(txt,xHeight)

      // Get cursor position
  const cursorLeft = cursor.left || 0;
  const cursorTop = cursor.top || 0;

  // Offset object positions relative to cursor position
  txtObjects[0].forEach(obj => {
    obj.set({
      left: obj.left + cursorLeft,
      top: obj.top + cursorTop
    });
  });

  txtObjects[1].forEach(obj => {
    obj.set({
      left: obj.left + cursorLeft,
      top: obj.top + cursorTop
    });
  });

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

  createTextObject: function(txt, xHeight) {
    txtCharList = []
    txtFrameList = []
    left_pos = 0
    for (var i = 0; i < txt.length; i++) {
      // Check if the character is a Chinese character
      if (!FormTextAddComponent.textWidthMedium.map(item => item.char).includes(txt.charAt(i))) {
        charWidth = 2.25 * xHeight / 100
        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: 'Noto Sans Hong Kong',
          fontWeight: 700,
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
        { left: options.left, top: options.top }
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
      txtObjects = FormTextAddComponent.createTextObject(cursor.text,cursor.xHeight)
    
      group.add(...txtObjects[0])
      group.add(...txtObjects[1])
      group.set({left:cursor.left, top:cursor.top})
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
      //Object.values(clonedObj.aCoords).map((point, i) => {
      //  return { x: point.x, y: point.y, label: `E${i + 1}` }
      //})
      //clonedObj.insertPoint = clonedObj.vertex[0]
      //TextGroup = drawBasePolygon(clonedObj, 'Text', false)

    }
  },

}

/* Draw Panel */
let FormDrawAddComponent = {
  drawPanelInit: function () {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100, null, 'input')
      //GeneralHandler.createbutton('button-approach-arm', 'Add Approach arm', parent, 0, FormDrawAddComponent.drawApproachClick, 'click')
      Object.keys(symbolsTemplate).forEach(symbol => {
        const button = FormDrawAddComponent.createButtonSVG(symbol, 10)
        GeneralHandler.createbutton(`button-${symbol}`, button, parent, 'symbol', FormDrawAddComponent.drawSymbol, 'click')
      })
    }
  },

  DrawHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormTextAddComponent.TextonMouseMove)
    canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
    canvas.renderAll()
  },

  SymbolonMouseClick: function (event, options = null) {
    //permanent cursor object 
    if (options) {
      cursor.set(
        { left: options.left, top: options.top }
      )

      textValue = 'Go'
      eventButton = 0
    } else {
      eventButton = event.e.button
    }
    if (eventButton === 0 && cursor._objects.length) {
      cursor.clone().then(function (clonedObj) {
        canvas.remove(clonedObj)
        var symbolitem = clonedObj.removeAll()[0];
        offset = getInsertOffset(calcSymbol(symbolitem.symbol, symbolitem.xHeight / 4))
        coords = symbolitem.getCoords()
        symbolitem.vertex = symbolitem.vertex.map(v => { return { x: v.x + offset.left + coords[0].x, y: v.y + offset.top + coords[0].y, label: v.label } })
        SymbolGroup = drawBasePolygon(symbolitem, 'Symbol')
      })
    }
  },

  createButtonSVG: (symbolType, length) => {
    const symbolData = calcSymbol(symbolType, length);
    const pathData = vertexToPath(symbolData);

    const svgWidth = 100;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const bbox = new fabric.Path(pathData).getBoundingRect();
    const scaleX = svgWidth / bbox.width;
    const scaleY = svgHeight / bbox.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - bbox.width * scale) / 2 - bbox.left * scale;
    const translateY = (svgHeight - bbox.height * scale) / 2 - bbox.top * scale;

    const svg = `<svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
               <path d="${pathData}" fill="none" stroke="black" stroke-width="2" transform="translate(${translateX}, ${translateY}) scale(${scale})"/>
             </svg>`;


    return svg;
  },
  drawSymbol: (event, options = null) => {
    let symbol = event.currentTarget.id.replace('button-', '')
    canvas.on('mouse:move', FormTextAddComponent.TextonMouseMove)
    canvas.on('mouse:down', FormDrawAddComponent.SymbolonMouseClick)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.txtChar = []
    cursor.text = ''
    if (options) {
      symbol = option.symbol
      var xHeight = options.xHeight
    }
    else {
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
    }

    let symbolObject = calcSymbol(symbol, xHeight / 4)
    symbolOffset = getInsertOffset(symbolObject)
    const arrowOptions1 = {
      left: symbolOffset.left,
      top: symbolOffset.top,
      fill: '#FFF',
      angle: 0,
      // originX: 'center',
      objectCaching: false,
      strokeWidth: 0
    },
      Polygon1 = new GlyphPath(symbolObject, arrowOptions1);
    Polygon1.symbol = symbol
    Polygon1.xHeight = xHeight

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

  drawApproachClick: (event) => {
    //$(event.target).toggleClass('active')
    draw_btn = document.getElementById('button-approach-arm')
    if (draw_btn.classList.contains('active')) {
      draw_btn.classList.remove('active')
      canvas.off('mouse:down', FormDrawAddComponent.drawApproachMousedown)
      canvas.off('mouse:move', FormDrawAddComponent.drawApproachMousemove)
      canvas.off('mouse:up', FormDrawAddComponent.drawApproachMouseup)
    }
    else {
      draw_btn.classList.add('active')
      canvas.on('mouse:down', FormDrawAddComponent.drawApproachMousedown)
      canvas.on('mouse:move', FormDrawAddComponent.drawApproachMousemove)
      canvas.on('mouse:up', FormDrawAddComponent.drawApproachMouseup)
      canvas.approachConstrLline = new fabric.Line([0, 0, 100, 100], {
        stroke: "red",
        strokeWidth: 3,
        lockScalingX: true,
        lockScalingY: true,

      });
      canvas.approach_grp = new fabric.Group()
    }
  },

  drawApproachMousedown: (opt) => {
    var evt = opt.e;
    var point = canvas.getPointer(evt);
    if (evt.button == 0) {
      this.isDrawing = true;
      this.selection = false;
      this.lastPosX = point.x;
      this.lastPosY = point.y;
      this.approachConstrLline.set({
        x1: this.lastPosX,
        y1: this.lastPosY,
        x2: this.lastPosX,
        y1: this.lastPosY,
      })
    }
  },

  drawApproachMousemove: function (opt) {
    this.selection = false;
    if (this.isDrawing) {
      var e = opt.e;
      var pointer = canvas.getPointer(e);
      // Initiate a line instance
      this.approachConstrLline.set({
        x2: pointer.x,
        y2: pointer.y
      })

      this.approach_grp.forEachObject(function (o) { if (o) { canvas.approach_grp.remove(o) } })
      FormDrawAddComponent.calcApproachPts(this.approach_grp)
      this.add(this.approachConstrLline)
      this.add(this.approach_grp)
      //this.setActiveObject(this.approach_grp)
      this.renderAll()
    }
  },

  drawApproachMouseup: function () {
    this.isDrawing = false
    this.selection = true;
    this.snap_pts.push(this.approachConstrLline.st, this.approachConstrLline.ed)
    FormDrawAddComponent.drawApproachClick()
  },

  calcApproachPts: function (group) {
    var line = canvas.approachConstrLline
    var w = line.width
    var h = line.height
    var d = Math.sqrt(w ** 2 + h ** 2)
    var r = Math.atan2((line.y2 - line.y1), (line.x2 - line.x1))
    var st = new fabric.Point(line.x1, line.y1)
    st.snap_type = 'end'
    if (d < 600) {
      new_end = st.add(PolarPoint(600, r))
      line.x2 = new_end.x
      line.y2 = new_end.y
    }
    var ed = new fabric.Point(line.x2, line.y2)
    ed.snap_type = 'end'
    line.st = st
    line.ed = ed
    var approach_pts = [
      ed.add(PolarPoint(Math.sqrt(2 * 150 ** 2), r - 0.75 * Math.PI)),
      ed,
      ed.add(PolarPoint(Math.sqrt(2 * 150 ** 2), r + 0.75 * Math.PI)),
      st.add(PolarPoint(300 / 2, r + 0.5 * Math.PI)),
      st.add(PolarPoint(300 / 2, r - 0.5 * Math.PI)),
    ]
    console.log(approach_pts)
    var arm = new fabric.Polygon(approach_pts, {
      fill: 'white'
    });
    group.addWithUpdate(arm)

  }


}

/* Border Panel */
let FormBorderWrapComponent = {
  BorderType: {
    "Blue Background": {
      Fill: '#0000FE',
      PaddingLeft: 2.5,
      PaddingRight: 2.5,
      PaddingTop: 2.5,
      PaddingNBottom: 1.5,
      FrameWidth: 1.5,
      FrameFill: 'white',
      InnerCornerRadius: 1.5,
      OuterCornerRadius: 3
    },
    "Green Background": {
      Fill: '#00B95F',
      PaddingLeft: 2.5,
      PaddingRight: 2.5,
      PaddingTop: 2.5,
      PaddingNBottom: 1.5,
      FrameWidth: 1.5,
      FrameFill: 'white',
      InnerCornerRadius: 1.5,
      OuterCornerRadius: 3
    },
  },
  BorderPanelInit: function () {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-xHeight', 'x Height', parent, 100)
      GeneralHandler.createselect('input-type', 'Select Border Type', Object.keys(FormBorderWrapComponent.BorderType), parent, '', '', 'select')
      GeneralHandler.createbutton('input-text', 'Select Objects for border', parent, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
    }
  },
  BorderCreateHandler: async function () {
    xHeight = parseInt(document.getElementById("input-xHeight").value)
    borderType = FormBorderWrapComponent.BorderType[document.getElementById("input-type").value]

    selectObjectHandler('Select shape to calculate border width', function (widthObjects) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects) {
        FormBorderWrapComponent.BorderGroupCreate(heightObjects, widthObjects, xHeight, borderType)
      })
    })
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
  paddingCoords: function getPaddedCoords(coords, padLeft, padRight, padTop, padBottom) {
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

    innerBorderCoords = FormBorderWrapComponent.paddingCoords(coords, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
    outerBorderCoords = FormBorderWrapComponent.paddingCoords(innerBorderCoords, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)

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


  // draw rounded shape
  drawBorder: function (BorderCoord, fill, radius) {
    var Rect = new fabric.Rect({
      left: BorderCoord.left,
      top: BorderCoord.top,
      fill: fill,
      width: BorderCoord.right - BorderCoord.left,
      height: BorderCoord.bottom - BorderCoord.top,
      objectCaching: false,
      rx: radius * xHeight / 4,
      ry: radius * xHeight / 4,
      objectCaching: false
    });
    return Rect
  },

  BorderCreate: function (heightObjects, widthObjects, xHeight, borderType) {
    if (xHeight > 0) {

      bordersCoords = FormBorderWrapComponent.calcBorder(heightObjects, widthObjects, xHeight, borderType)

      innerBorderObject = FormBorderWrapComponent.drawBorder(bordersCoords.in, borderType.Fill, borderType.InnerCornerRadius)
      outerBorderObject = FormBorderWrapComponent.drawBorder(bordersCoords.out, borderType.FrameFill, borderType.OuterCornerRadius)
      GroupedBorder = new fabric.Group([outerBorderObject, innerBorderObject], {
        objectCaching: false,
      });

      const cornerPoints = [
        { x: innerBorderCoords.left, y: innerBorderCoords.top }, // Top-left
        { x: innerBorderCoords.right, y: innerBorderCoords.top }, // Top-right
        { x: innerBorderCoords.right, y: innerBorderCoords.bottom }, // Bottom-right
        { x: innerBorderCoords.left, y: innerBorderCoords.bottom } // Bottom-left
      ];

      // Generate the corner point list with labels
      const labeledCornerPoints = cornerPoints.map((point, i) => {
        return { x: point.x, y: point.y, label: `V${i + 1}` };
      });
      GroupedBorder.vertex = labeledCornerPoints
      GroupedBorder.inner = innerBorderObject
      GroupedBorder.outer = outerBorderObject

      //GroupedBorder.insertPoint = GroupedBorder.vertex[0]
      GroupedBorder.setCoords()
      return GroupedBorder;
    } else {
      showTextBox('x-height is incorrect', 1)
    }
  },

  BorderGroupCreate: function (heightObjects, widthObjects, xHeight, borderType) {
    borderObject = FormBorderWrapComponent.BorderCreate(heightObjects, widthObjects, xHeight, borderType)
    borderGroup = drawBasePolygon(borderObject, 'Border')
    borderGroup.widthObjects = [...widthObjects]
    borderGroup.heightObjects = [...heightObjects]
    borderGroup.borderType = borderType
    borderGroup.xHeight = xHeight
    borderGroup.BorderResize = FormBorderWrapComponent.BorderResize

    borderGroup.lockMovementX = true
    borderGroup.lockMovementY = true

    // Combine the arrays and create a Set to remove duplicates
    canvas.sendObjectToBack(borderGroup)
    widthObjects.forEach(obj => {
      canvas.bringObjectToFront(obj)
      obj.borderGroup = borderGroup
    })
    heightObjects.forEach(obj => {
      canvas.bringObjectToFront(obj)
      obj.borderGroup = borderGroup
    })
    canvas.requestRenderAll();
    return borderGroup
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
    }
  },
  createDebugInfoPanel: function (parent) {
    const debugInfoPanel = document.createElement('div');
    debugInfoPanel.id = 'debug-info-panel';
    parent.appendChild(debugInfoPanel);
  },

  updateDebugInfo: function (objects) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      objects.length?        object = objects[0]:object= objects
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
      div.id = `Group (${index})`
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        canvas.setActiveObject(obj);
        canvas.renderAll();
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = canvasObject.indexOf(setActive)
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if(item.id == `Group (${index})`){
        item.classList.add('selected');
      } else {
        item.classList.remove('selected')}
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
  document.getElementById('btn_debug').onclick = FormDebugComponent.DebugPanelInit
 //canvas.on('object:added', CanvasObjectInspector.createObjectListPanel);
 //canvas.on('object:removed', CanvasObjectInspector.createObjectListPanel);
 //canvas.on('object:modified', CanvasObjectInspector.createObjectListPanel);
  FormTextAddComponent.textPanelInit()
  document.addEventListener('keydown', ShowHideSideBarEvent);
}