var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;

canvas.add(cursor);

/* General Sidebar Panel */
let GeneralHandler = {
  ShowHideSideBar: function (event, force = null) {
    if (document.getElementById("side-panel").className.indexOf("open") !== -1 || force === 'off') {
      document.getElementById("side-panel").className = "side-panel"
      document.getElementById("side-panel").className += " close"
      document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
      GeneralHandler.PanelHandlerOff()
      return
    }
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " open"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
  },
  PanelHandlerOff: () => {
    FormTextAddComponent.TextHandlerOff()
  },
  PanelInit: () => {
    GeneralHandler.ShowHideSideBar()
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
  createbutton: function (name, labelTxt, parent, defaultState = 0, callback = null, event = null){
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
}

/* Text panel */
let FormTextAddComponent = {
  textPanelInit: function () {
    parent= GeneralHandler.PanelInit()
    if (parent){
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
        fontSize: parseInt(document.getElementById('input-xheight').value),
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
        canvas.setActiveObject(clonedObj)
      })
    }
  },

}

/* Draw Panel */
let FormDrawAddComponent = {
  drawPanelInit: function () {
    parent= GeneralHandler.PanelInit()
    if (parent){
    GeneralHandler.createbutton('button-approach-arm', 'Add Approach arm', parent, 0, FormDrawAddComponent.drawApproachClick, 'click')
    }
  },
  drawApproachClick: (event) => {
    //$(event.target).toggleClass('active')
    draw_btn = document.getElementById('button-approach-arm')
    if (draw_btn.classList.contains('active')){
      draw_btn.classList.remove('active')
      canvas.off('mouse:down', FormDrawAddComponent.drawApprochMousedown)
      canvas.off('mouse:move', FormDrawAddComponent.drawApproachMousemove)
      canvas.off('mouse:up', FormDrawAddComponent.drawApproachMouseup)}
    else {
      draw_btn.classList.add('active')
      canvas.on('mouse:down', FormDrawAddComponent.drawApprochMousedown)
      canvas.on('mouse:move', FormDrawAddComponent.drawApproachMousemove)
      canvas.on('mouse:up', FormDrawAddComponent.drawApproachMouseup)
      canvas.approachConstrLline = new fabric.Line([0,0,100,100], {
        stroke: "red",
        strokeWidth: 3,
        lockScalingX: true,
        lockScalingY: true,
        
    });
    canvas.add(canvas.approachConstrLline)
    }
  },

  drawApprochMousedown: function(opt) {
    //cursor.forEachObject(function (o) { cursor.remove(o) })
      var evt = opt.e;
      var point = canvas.getPointer(evt)
      if (evt.button == 0) {
        this.isDrawing = true;
        this.selection = false;
        this.lastPosX =point.x;
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
    if (this.isDrawing) {
      var e = opt.e;
      var pointer = canvas.getPointer(e);
      // Initiate a line instance
      this.approachConstrLline.set({
        x2: pointer.x, 
        y2: pointer.y
      })
      canvas.setActiveObject(this.approachConstrLline)
      canvas.renderAll()
    }
  },

  drawApproachMouseup: function() {
      this.isDrawing=false
      this.selection = true;
      FormDrawAddComponent.drawApproachClick()
    },

  calcApproachPts: function() {
    st_pt = new fabric.point([this.approachConstrLline.x1,this.approachConstrLline.y1])
    ed_pt = new fabric.point([this.approachConstrLline.x2,this.approachConstrLline.y2])
  }
  

}

window.onload = () => {
  document.getElementById('show_hide').onclick = GeneralHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit
  document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit
  document.onkeydown = function(e) {
      switch (e.keyCode) {
        case 27: // esc
          GeneralHandler.ShowHideSideBar(e,'off')  
      }}}