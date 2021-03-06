var canvas = this.__canvas = new fabric.Canvas('canvas', { fireMiddleClick: true, });

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  canvasContainer = document.getElementById('canvas-container')
  canvas.setWidth(canvasContainer.clientWidth)
  canvas.setHeight(canvasContainer.clientHeight)
  canvas.absolutePan({x:-canvas.width/2, y:-canvas.height/2})
  canvas.renderAll();
  DrawGrid()
}

canvas.on('mouse:down', function (opt) {
  var evt = opt.e;
  if (evt.button == 1) {
    this.isDragging = true;
    this.selection = false;
    this.lastPosX = evt.clientX;
    this.lastPosY = evt.clientY;
  }
})

canvas.on('mouse:move', function (opt) {
  if (this.isDragging) {
    var e = opt.e;
    var vpt = this.viewportTransform;
    vpt[4] += e.clientX - this.lastPosX;
    vpt[5] += e.clientY - this.lastPosY;
    this.requestRenderAll();
    this.lastPosX = e.clientX;
    this.lastPosY = e.clientY;
    DrawGrid()
  }
});
canvas.on('mouse:up', function (opt) {
  // on mouse up we want to recalculate new interaction
  // for all objects, so we call setViewportTransform
  this.setViewportTransform(this.viewportTransform);
  this.isDragging = false;
  this.selection = true;

});

canvas.on('mouse:wheel', function (opt) {
  var delta = opt.e.deltaY;
  var zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint(new fabric.Point(opt.e.clientX, opt.e.clientY), zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
  DrawGrid()
})

function DrawGrid() {
  options = {
    distance: 10,
    param: {
      stroke: '#ebebeb',
      strokeWidth: 0.1,
      selectable: false
    }
  },

  corners = canvas.calcViewportBoundaries()
  xmin = Math.floor((corners.tl.x) / 50) * 50,
  xmax = Math.ceil((corners.br.x) / 50) * 50,
  ymin = Math.floor((corners.tl.y) / 50) * 50,
  ymax = Math.ceil((corners.br.y) / 50) * 50,
  width = xmax - xmin,
  height = ymax - ymin,
  gridLen = Math.max(width, height) / options.distance;
  grid_set = [];

  for (var i = 0; i < gridLen + 1; i++) {
    var distance = i * options.distance,
      vertical = new fabric.Line([distance + xmin, ymin, distance + xmin, gridLen * 10 + ymin], options.param)
    horizontal = new fabric.Line([xmin, distance + ymin, gridLen * 10 + xmin, distance + ymin], options.param);

    if (i % 5 === 0) {
      horizontal.set({ strokeWidth: 0.5 });
      vertical.set({ strokeWidth: 0.5 });
      vText = new fabric.Text(String(distance + xmin), { left: distance + xmin, top: 0, fill: options.param.stroke, fontSize: 10 })
      hText = new fabric.Text(String(distance + ymin), { left: 0, top: distance + ymin, fill: options.param.stroke, fontSize: 10 })
      grid_set.push(hText);
      grid_set.push(vText);
    };

    grid_set.push(horizontal);
    grid_set.push(vertical);
  };

  let obj = canvas.getObjects().find(obj => obj.id === 'grid');
  canvas.remove(obj);

  grid_group = new fabric.Group(grid_set, { id: 'grid', "selectable": false, "evented": false });
  canvas.add(grid_group);
  canvas.sendToBack(grid_group)
};


resizeCanvas();

