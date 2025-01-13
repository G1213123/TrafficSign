var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;


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
      } else  {
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
  PanelHandlerOff: (tabNum) => {
        FormTextAddComponent.TextHandlerOff()

  },
  PanelInit: () => {
    GeneralHandler.ShowHideSideBar(null, "on")
    GeneralHandler.PanelHandlerOff()
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      var parent = document.getElementById("input-form");
      parent.innerHTML = ''
    }
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
  createbutton: function (name, labelTxt, parent, defaultState = 0, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': 'button', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    input.innerHTML = labelTxt
  },

  createinput: function (name, labelTxt, parent, defaultv = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    var input = GeneralHandler.createNode("input", { 'type': 'text', 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    GeneralHandler.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = GeneralHandler.createNode("label", { 'class': 'placeholder', 'for': name }, inputContainer)
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
  textWidthMedium : [{char:'A',width:136,shortWidth:0},{char:'B',width:147,shortWidth:0},{char:'C',width:148,shortWidth:0},{char:'D',width:154,shortWidth:0},{char:'E',width:132,shortWidth:0},{char:'F',width:119,shortWidth:0},{char:'G',width:155,shortWidth:0},{char:'H',width:160,shortWidth:0},{char:'I',width:73,shortWidth:0},{char:'J',width:93,shortWidth:0},{char:'K',width:138,shortWidth:0},{char:'L',width:107,shortWidth:0},{char:'M',width:184,shortWidth:0},{char:'N',width:168,shortWidth:0},{char:'O',width:156,shortWidth:0},{char:'P',width:130,shortWidth:0},{char:'Q',width:158,shortWidth:0},{char:'R',width:141,shortWidth:0},{char:'S',width:137,shortWidth:0},{char:'T',width:109,shortWidth:105},{char:'U',width:154,shortWidth:0},{char:'V',width:130,shortWidth:120},{char:'W',width:183,shortWidth:189},{char:'X',width:128,shortWidth:0},{char:'Y',width:123,shortWidth:118},{char:'Z',width:119,shortWidth:0},{char:'a',width:111,shortWidth:104},{char:'b',width:117,shortWidth:0},{char:'c',width:103,shortWidth:0},{char:'d',width:119,shortWidth:0},{char:'e',width:109,shortWidth:102},{char:'f',width:75,shortWidth:0},{char:'g',width:114,shortWidth:107},{char:'h',width:112,shortWidth:0},{char:'i',width:54,shortWidth:0},{char:'j',width:58,shortWidth:0},{char:'k',width:108,shortWidth:0},{char:'l',width:62,shortWidth:0},{char:'m',width:164,shortWidth:0},{char:'n',width:112,shortWidth:0},{char:'o',width:118,shortWidth:111},{char:'p',width:118,shortWidth:0},{char:'q',width:118,shortWidth:0},{char:'r',width:73,shortWidth:59},{char:'s',width:97,shortWidth:95},{char:'t',width:81,shortWidth:0},{char:'u',width:115,shortWidth:101},{char:'v',width:98,shortWidth:0},{char:'w',width:147,shortWidth:145},{char:'x',width:104,shortWidth:0},{char:'y',width:98,shortWidth:96},{char:'z',width:97,shortWidth:0},{char:'1',width:78,shortWidth:0},{char:'2',width:120,shortWidth:0},{char:'3',width:127,shortWidth:0},{char:'4',width:132,shortWidth:0},{char:'5',width:122,shortWidth:0},{char:'6',width:126,shortWidth:0},{char:'7',width:104,shortWidth:0},{char:'8',width:130,shortWidth:0},{char:'9',width:128,shortWidth:0},{char:'0',width:133,shortWidth:0},{char:',',width:53,shortWidth:0},{char:'.',width:53,shortWidth:0},{char:'’',width:39,shortWidth:0},{char:':',width:53,shortWidth:0},{char:'•',width:53,shortWidth:0},{char:'、',width:53,shortWidth:0},{char:'-',width:66,shortWidth:0},{char:'&',width:126,shortWidth:0},{char:'(',width:105,shortWidth:0},{char:')',width:105,shortWidth:0},{char:'/',width:85,shortWidth:0},{char:'$',width:100,shortWidth:0},{char:'%',width:160,shortWidth:0},{char:'“',width:92,shortWidth:0},{char:'”',width:92,shortWidth:0}],
  textWidthHeavy : [{char:'A',width:142,shortWidth:0},{char:'B',width:146,shortWidth:0},{char:'C',width:151,shortWidth:0},{char:'D',width:150,shortWidth:0},{char:'E',width:136,shortWidth:0},{char:'F',width:121,shortWidth:0},{char:'G',width:156,shortWidth:0},{char:'H',width:159,shortWidth:0},{char:'I',width:73,shortWidth:0},{char:'J',width:95,shortWidth:0},{char:'K',width:138,shortWidth:0},{char:'L',width:118,shortWidth:0},{char:'M',width:186,shortWidth:0},{char:'N',width:168,shortWidth:0},{char:'O',width:158,shortWidth:0},{char:'P',width:134,shortWidth:0},{char:'Q',width:161,shortWidth:0},{char:'R',width:148,shortWidth:0},{char:'S',width:146,shortWidth:0},{char:'T',width:118,shortWidth:113},{char:'U',width:157,shortWidth:0},{char:'V',width:133,shortWidth:127},{char:'W',width:193,shortWidth:196},{char:'X',width:130,shortWidth:0},{char:'Y',width:128,shortWidth:125},{char:'Z',width:119,shortWidth:0},{char:'a',width:111,shortWidth:104},{char:'b',width:107,shortWidth:0},{char:'c',width:107,shortWidth:0},{char:'d',width:119,shortWidth:0},{char:'e',width:110,shortWidth:103},{char:'f',width:79,shortWidth:0},{char:'g',width:117,shortWidth:110},{char:'h',width:119,shortWidth:0},{char:'i',width:55,shortWidth:0},{char:'j',width:71,shortWidth:0},{char:'k',width:114,shortWidth:0},{char:'l',width:63,shortWidth:0},{char:'m',width:173,shortWidth:0},{char:'n',width:119,shortWidth:0},{char:'o',width:115,shortWidth:107},{char:'p',width:120,shortWidth:0},{char:'q',width:120,shortWidth:0},{char:'r',width:80,shortWidth:67},{char:'s',width:100,shortWidth:98},{char:'t',width:84,shortWidth:0},{char:'u',width:120,shortWidth:107},{char:'v',width:107,shortWidth:0},{char:'w',width:160,shortWidth:154},{char:'x',width:110,shortWidth:0},{char:'y',width:106,shortWidth:104},{char:'z',width:93,shortWidth:0},{char:'1',width:84,shortWidth:0},{char:'2',width:125,shortWidth:0},{char:'3',width:136,shortWidth:0},{char:'4',width:138,shortWidth:0},{char:'5',width:130,shortWidth:0},{char:'6',width:129,shortWidth:0},{char:'7',width:107,shortWidth:0},{char:'8',width:138,shortWidth:0},{char:'9',width:129,shortWidth:0},{char:'0',width:145,shortWidth:0},{char:',',width:56,shortWidth:0},{char:'.',width:56,shortWidth:0},{char:'’',width:41,shortWidth:0},{char:':',width:56,shortWidth:0},{char:'•',width:56,shortWidth:0},{char:'、',width:53,shortWidth:0},{char:'-',width:71,shortWidth:0},{char:'&',width:126,shortWidth:0},{char:'(',width:115,shortWidth:0},{char:')',width:115,shortWidth:0},{char:'/',width:88,shortWidth:0},{char:'$',width:100,shortWidth:0},{char:'%',width:160,shortWidth:0},{char:'“',width:92,shortWidth:0},{char:'”',width:92,shortWidth:0}],
  textPanelInit: function () {
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-text', 'Add Text', parent, '', FormTextAddComponent.TextinputHandler, 'input')
      GeneralHandler.createinput('input-xheight', 'x Height', parent, 100)
      canvas.on('mouse:move', FormTextAddComponent.TextonMouseMove)
      canvas.on('mouse:down', FormTextAddComponent.TextonMouseClick)
    }
  },

  TextHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormTextAddComponent.TextonMouseMove)
    canvas.off('mouse:down', FormTextAddComponent.TextonMouseClick)
    canvas.renderAll()
  },

  TextinputHandler: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    var txt = event.target.value
    var left_pos = 0
    var xHeight = parseInt(document.getElementById('input-xheight').value)
    for (var i = 0; i < txt.length; i++) {
      charWidth = FormTextAddComponent.textWidthMedium.find(e => e.char == txt.charAt(i)).width

      txt_char = new fabric.Text(txt.charAt(i), {
        fontFamily: 'TransportMedium',
        left: left_pos,
        top: 0.1*xheight,
        fill: '#fff',
        fontSize: xHeight * 1.8,
        origin: 'centerX'
      })
      txt_char.lockScalingX = txt_char.lockScalingY = true;

      txt_frame = new fabric.Rect({
        left: left_pos,
        top: 0,
        width: charWidth,
        height: xHeight * 2,
        fill: 'rgba(0,0,0,0)',
        stroke: 'red',
        strokeDashArray: [9, 2],
      })

      left_pos += charWidth
      cursor.addWithUpdate(txt_char)
      cursor.addWithUpdate(txt_frame)
    }
    canvas.renderAll();
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

  TextonMouseClick: function (event) {
    //permenent cursor object 
    if (document.getElementById("input-text").value !== '' && event.button === 1) {
      cursor.clone(function (clonedObj) {
        //clonedObj.vertex = Object.values(clonedObj.aCoords).map((point, i) => {
        //  return { x: point.x, y: point.y, label: `E${i + 1}` }
        //})
        //clonedObj.insertPoint = clonedObj.vertex[0]
        TextGroup = drawBasePolygon(clonedObj)
      })
    }
  },

}

/* Draw Panel */
let FormDrawAddComponent = {
  drawPanelInit: function () {
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createbutton('button-approach-arm', 'Add Approach arm', parent, 0, FormDrawAddComponent.drawApproachClick, 'click')
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
      InnerCornerRadius: 1.5,
      OuterCornerRadius: 1.5
    },
  },
  BorderPanelInit: function () {
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      GeneralHandler.createinput('input-xheight', 'x Height', parent, 100)
      GeneralHandler.createselect('input-type', 'Select Border Type', Object.keys(FormBorderWrapComponent.BorderType), parent, '', '', 'select')
      GeneralHandler.createbutton('input-text', 'Select Objects for border', parent, '', FormBorderWrapComponent.BorderCreateHandler, 'click')
    }
  },
  BorderCreateHandler: async function () {
    xheight = parseInt(document.getElementById("input-xheight").value)
    borderType = FormBorderWrapComponent.BorderType[document.getElementById("input-type").value]

    selectObjectHandler('Select shape to calculate border width', function (widthObjects) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects) {
        borderObject = FormBorderWrapComponent.BorderCreate(heightObjects, widthObjects, xheight, borderType)
        borderGroup = drawBasePolygon(borderObject)
        borderGroup.widthObjects = [...widthObjects]
        borderGroup.heightObjects = [...heightObjects]

        // Combine the arrays and create a Set to remove duplicates
        canvas.sendToBack(borderGroup)
        widthObjects.forEach(obj => { canvas.bringToFront(obj) })
        heightObjects.forEach(obj => { canvas.bringToFront(obj) })
        canvas.renderAll()
      })
    })

    /*
    const borderWidthtObjects = showTextBox('Select shape to calculate border width')
    if (borderWidthtObjects) {
      borderWidthtObjects = canvas.activeObject()
      
    }*/
  },


  BorderCreate: function (heightObjects, widthObjects, xheight, borderType) {
    if (xheight > 0) {

      // Function to get the bounding box of specific objects
      function getBoundingBox(objects) {
        // Clone each object and add them to a temporary group
        const clones = fabric.util.object.clone(objects)
        loopAnchoredObjects(clones, function (obj) {
          obj.subobjects.forEach(function (subobj) {
            canvas.remove(subobj)
          })
        }
        )
        // Update the coordinates of the temporary group
        clones.setCoords();
        const aCoords = clones.aCoords;

        // Return the bounding box coordinates
        return [
          { x: aCoords.tl.x, y: aCoords.tl.y }, // Top-left corner
          { x: aCoords.tr.x, y: aCoords.tr.y }, // Top-right corner
          { x: aCoords.br.x, y: aCoords.br.y }, // Bottom-right corner
          { x: aCoords.bl.x, y: aCoords.bl.y }  // Bottom-left corner
        ];
      }

      // Get the bounding box of the active selection 
      widthObjectsGroup = new fabric.Group(widthObjects)
      heightObjectsGroup = new fabric.Group(heightObjects)
      //canvas.add(widthObjectsGroup)
      //canvas.add(heightObjectsGroup)
      const coordsWidth = getBoundingBox(new fabric.Group(widthObjects))
      const coordsHeight = getBoundingBox(new fabric.Group(widthObjects))
      const coords = coordsWidth.map((point, i) => {
        return {
          x: (point.x),
          y: (coordsHeight[i].y)
        }
      })
      /*
        coords[0]: Top-left corner
        coords[1]: Top-right corner
        coords[2]: Bottom-right corner
        coords[3]: Bottom-left corner
      */
      // Function to calculate padded coordinates 
      paddingCoords = function getPaddedCoords(coords, padLeft, padRight, padTop, padBottom) {
        return [
          { x: coords[0].x - padLeft * xheight / 4, y: coords[0].y - padTop * xheight / 4 }, // Top-left 
          { x: coords[1].x + padRight * xheight / 4, y: coords[1].y - padTop * xheight / 4 }, // Top-right 
          { x: coords[2].x + padRight * xheight / 4, y: coords[2].y + padBottom * xheight / 4 }, // Bottom-right 
          { x: coords[3].x - padLeft * xheight / 4, y: coords[3].y + padBottom * xheight / 4 } // Bottom-left 
        ];
      }
      innerBorderCoords = paddingCoords(coords, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
      outerBorderCoords = paddingCoords(innerBorderCoords, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)

      // draw rounded shape
      drawBorder = function (BorderCoord, fill, radius) {
        var Rect = new fabric.Rect({
          left: BorderCoord[0].x,
          top: BorderCoord[0].y,
          fill: fill,
          width: BorderCoord[1].x - BorderCoord[0].x,
          height: BorderCoord[2].y - BorderCoord[0].y,
          objectCaching: false,
          rx: radius * xheight / 4,
          ry: radius * xheight / 4,
          objectCaching: false
        });
        return Rect
      }

      innerBorderObject = drawBorder(innerBorderCoords, borderType.Fill, borderType.InnerCornerRadius)
      outerBorderObject = drawBorder(outerBorderCoords, borderType.FrameFill, borderType.OuterCornerRadius)
      GroupedBorder = new fabric.Group([outerBorderObject, innerBorderObject], {
        objectCaching: false,
      });
      GroupedBorder.vertex = innerBorderCoords
      GroupedBorder.vertex = GroupedBorder.vertex.map((point, i) => {
        return { x: point.x, y: point.y, label: `E${i + 1}` }
      })
      //GroupedBorder.insertPoint = GroupedBorder.vertex[0]
      GroupedBorder.setCoords()
      return GroupedBorder;
    } else {
      showTextBox('x-height is incorrect', 1)
    }
  }
}




window.onload = () => {
  document.getElementById('show_hide').onclick = GeneralHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit
  document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit
  document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit
  FormTextAddComponent.textPanelInit()
  document.onkeydown = function (e) {
    switch (e.keyCode) {
      case 27: // esc
        GeneralHandler.ShowHideSideBar(e)
    }
  }
}