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
      }
      if (document.getElementById("side-panel").className.indexOf("close") !== -1) {
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
    switch (tabNum) {
      case 1:
        FormTextAddComponent.TextHandlerOff()
        FormTextAddComponent.textPanelInit()
      case 2:
        FormDrawAddComponent.drawPanelInit()
    }

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
    for (var i = 0; i < txt.length; i++) {
      txt_char = new fabric.Text(txt.charAt(i), {
        fontFamily: 'TransportMedium',
        left: left_pos,
        top: -5,
        fill: '#fff',
        fontSize: parseInt(document.getElementById('input-xheight').value * 2),
      })
      txt_char.lockScalingX = txt_char.lockScalingY = true;
      left_pos += txt_char.width
      cursor.addWithUpdate(txt_char)
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
        canvas.add(clonedObj)
        canvasObject.push(clonedObj)
        canvas.setActiveObject(clonedObj)
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
      FrameFill : 'white',
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
  BorderCreateHandler: function () {
    let xheight = parseInt(document.getElementById("input-xheight").value)
    let borderType = FormBorderWrapComponent.BorderType[document.getElementById("input-type").value]
    if (xheight > 0) {
      let activeObject = canvas.getActiveObject()
      if (activeObject.basePolygon) {
        let borderinginObjects = activeObject.anchoredPolygon
        borderinginObjects.push(activeObject.basePolygon)

        // Function to get the bounding box of specific objects
        function getBoundingBox(objects, group) {
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

          objects.forEach(obj => {
            obj.setCoords(); // Update the coordinates
            const aCoords = obj.aCoords;
            minX = Math.min(minX, aCoords.tl.x + group.left + group.width / 2);
            minY = Math.min(minY, aCoords.tl.y + group.top + group.height / 2); // https://stackoverflow.com/questions/29829475/how-to-get-the-canvas-relative-position-of-an-object-that-is-in-a-group
            maxX = Math.max(maxX, aCoords.br.x+ group.left + group.width / 2);
            maxY = Math.max(maxY, aCoords.br.y+ group.top + group.height / 2);
          });

          return [
            { x: minX, y: minY }, // Top-left corner
            { x: maxX, y: minY }, // Top-right corner
            { x: maxX, y: maxY }, // Bottom-right corner
            { x: minX, y: maxY }  // Bottom-left corner
          ];
        }
        // Get the bounding box of the active selection 
        const coords = getBoundingBox(borderinginObjects, activeObject)
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
            { x: coords[1].x + padRight* xheight / 4, y: coords[1].y - padTop * xheight / 4 }, // Top-right 
            { x: coords[2].x + padRight* xheight / 4, y: coords[2].y + padBottom * xheight / 4 }, // Bottom-right 
            { x: coords[3].x - padLeft * xheight / 4, y: coords[3].y + padBottom * xheight / 4 } // Bottom-left 
          ];
        }
        innerBorder = paddingCoords(coords, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
        outerBorder = paddingCoords(innerBorder, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)
        
        // draw rounded shape
        drawBorder = function (BorderCoord, fill, radius, addToGroup){
          var Rect =  new fabric.Rect({
            left: BorderCoord[0].x,
            top: BorderCoord[0].y,
            fill: fill,
            width: BorderCoord[1].x - BorderCoord[0].x,
            height: BorderCoord[2].y - BorderCoord[0].y,
            objectCaching: false,
            rx: radius * xheight / 4,
            ry: radius * xheight / 4,
          });
          canvas.add(Rect);
          canvas.sendToBack(Rect)
        }

        drawBorder(innerBorder, borderType.Fill, borderType.InnerCornerRadius)
        drawBorder(outerBorder, borderType.FrameFill, borderType.OuterCornerRadius)
        canvas.renderAll()
      } else {
        showTextBox('no or more than one shapes are being selected on canvas', 1)
      }
    } else {
      showTextBox('x-height is incorrect', 1)
    }
  },

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