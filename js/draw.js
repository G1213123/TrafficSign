xHeight = 100

var TextBlock = fabric.util.createClass(fabric.Textbox, {
  initialize: function(x, y, color) {
    this.callSuper('initialize', x, y);
    this.color = color || '#000';
  },
  toString: function() {
    return this.callSuper('toString') + ' (color: ' + this.color + ')';
  }
});


function AddPlate() {
  var rect = new fabric.Rect({
    left: -100,
    top: -50,
    fill: '#225F7C',
    width: 70,
    height: 100,
    objectCaching: false,
    stroke: '#FFFFFF',
    strokeWidth: 2.5,
    strokeUniform: true,
    rx: 5,
    ry: 5,
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
}

function LoadShape(name, setoptions, group) {
  var setoptions = setoptions
  var group = group
  var loadedObjects = fabric.loadSVGFromURL("shapes/" + name + ".svg", function (objects, options) {
    loadedObjects = new fabric.Group(objects);
    loadedObjects.set(setoptions);
    group.addWithUpdate(loadedObjects);
    canvas.renderAll();
  })
}



function initShape() {
  routeMap = new fabric.Group()
  var base = LoadShape("base",{ scaleY:(31/2+21.92+2.828+12+10)/31, top: -(31/2+21.92+2.828+12+10)},routeMap)
  var arm = LoadShape("base",{ left: -21.92, top: -(31/2+21.92) , scaleX : 4/6, angle : -45},routeMap)
  canvas.add(routeMap)

  block = new fabric.Textbox("Central", {
    fontFamily: 'TransportMedium',
    fill: '#ffffff',
    fontSize: 10})
  canvas.add(block)

  block = new fabric.Textbox("Kowloon", {
    fontFamily: 'TransportMedium',
    fill: '#ffffff',
    fontSize: 10})
  canvas.add(block)
}
AddPlate()
initShape()
