let EventHandler = {
  ShowHideSideBar: function (event) {
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      document.getElementById("side-panel").className = "side-panel"
      document.getElementById("side-panel").className += " close"
      document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
      EventHandler.TextHandlerOff()
      return
    }
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " open"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
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
    if (document.getElementById("input-text").value !== '') {
      cursor.clone(function (clonedObj) {
        canvas.add(clonedObj)
        canvas.setActiveObject(clonedObj)
        //EventHandler.TextHandlerOff()

      })
    }
  },

  TextHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', EventHandler.TextonMouseMove)
    canvas.off('mouse:down', EventHandler.TextonMouseClick)
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
        top: 1.5,
        fill: '#fff',
        fontSize:parseInt(document.getElementById('input-xheight').value)
      })
      left_pos += txt_char.width
      cursor.addWithUpdate(txt_char)
    }
    canvas.renderAll();
  }
}

var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;

canvas.add(cursor);

let FormAddComponent = {
  textPanel: function () {
    EventHandler.ShowHideSideBar()
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      var parent = document.getElementById("input-form");
      parent.innerHTML = ''
      FormAddComponent.createinput('input-text','Add Text',parent, '',EventHandler.TextinputHandler, 'input')
      FormAddComponent.createinput('input-xheight','x Height',parent,100)
      canvas.on('mouse:move', EventHandler.TextonMouseMove)
      canvas.on('mouse:down', EventHandler.TextonMouseClick)
    }
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
  createinput: function (name, labelTxt, parent, defaultv=null, callback=null, event =null) {
    var inputContainer = FormAddComponent.createNode("div",{'class':'input-container'},parent)
    var input = FormAddComponent.createNode("input", { 'type': 'text', 'class': 'input', 'id': name, 'placeholder':' ' }, inputContainer, callback,event)
    FormAddComponent.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = FormAddComponent.createNode("label", { 'class': 'placeholder', 'for': name }, inputContainer)
    label.innerHTML = labelTxt
    defaultv? input.value=defaultv:input.value=''
  }
}

window.onload = () => {
  document.getElementById('show_hide').onclick = EventHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = EventHandler.ShowHideSideBar
  document.getElementById('btn_text').onclick = FormAddComponent.textPanel
}