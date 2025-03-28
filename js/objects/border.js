// Check CIE standard for color contrast, color reference in EN 12899-1:2007 Table 2 and Table 4
const BorderColorScheme = {
  "Blue Background": {
    'background': 'rgb(0, 121, 193)',
    'symbol': 'white',
    'border': 'white',
  },
  "Green Background": {
    'background': 'rgb(0, 112, 60)',
    'symbol': '#ffffff',
    'border': '#ffffff',
  },
  "White Background": {
    'background': '#ffffff',
    'symbol': '#000000',
    'border': '#000000',
  },
  "White Background - Parking": {
    'background': '#ffffff',
    'symbol': '#000000',
    'border': 'rgb(0, 121, 193)',
  },
  "Yellow Background": {
    'background': '#ffc614',
    'symbol': '#000000',
    'border': '#000000',
  },
  "Brown Background": {
    'background': 'rgb(116,48,1)',
    'symbol': '#ffffff',
    'border': '#ffffff',
  },
}

const BorderTypeScheme = {
  'stack': StackBorderTemplate,
  'flagLeft': FlagLeftBorderTemplate,
  'flagRight': FlagRightBorderTemplate,
  'exit': ExitBorderTemplate,
  'panel': PanelTemplate,
  'greenPanel': GreenPanelTemplate,
  'rectangle': RectTemplate,
}

function applyLengthAndRounding(path, length) {
  path.vertex.forEach(vertex => {
    vertex.x *= length;
    vertex.y *= length;
    if (vertex.radius) vertex.radius *= length;
  });
  path.arcs.forEach(arc => {
    arc.radius *= length;
  });
}

function RectTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;

  const padding = {
    left: 1,
    top: 1,
    right: 1,
    bottom: 1,
  };

  const returnBorder = [{
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, label: 'V1', start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V2', start: 0 },
      { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V3', start: 0 },
      { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V4', start: 0 },
    ], 'arcs': [], 'fill': 'background'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function PanelTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;

  const padding = {
    left: 2.5,
    top: 2.5,
    right: 2.5,
    bottom: 1.5,
  };

  const returnBorder = [{
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, label: 'V1', radius: 1, start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V2', radius: 1, start: 0 },
      { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V3', radius: 1, start: 0 },
      { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V4', radius: 1, start: 0 },
    ], 'arcs': [], 'fill': 'background'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function GreenPanelTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;

  const padding = {
    left: 2.5,
    top: 2.5,
    right: 2.5,
    bottom: 1.5,
  };

  const border = 0.5;
  const returnBorder = [{
    'vertex': [
      { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', radius: 1.5, start: 1 },
      { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius: 1.5, start: 0 },
      { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, label: 'V3', radius: 1.5, start: 0 },
      { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, label: 'V4', radius: 1.5, start: 0 },
    ], 'arcs': [], 'fill': '#ffffff'
  }, {
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', radius: 1, start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', radius: 1, start: 0 },
      { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V7', radius: 1, start: 0 },
      { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V8', radius: 1, start: 0 },
    ], 'arcs': [], 'fill': 'rgb(0, 112, 60)'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function StackBorderTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;
  rounding.x /= length;
  rounding.y /= length;
  const padding = {
    left: 2.5 + rounding.x,
    top: 2.5 + rounding.y,
    right: 2.5 + rounding.x,
    bottom: 1.5 + rounding.y,
  };

  const border = 1.5;
  const returnBorder = [{
    'vertex': [
      { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', radius: 3, start: 1 },
      { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius: 3, start: 0 },
      { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, label: 'V3', radius: 3, start: 0 },
      { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, label: 'V4', radius: 3, start: 0 },
    ], 'arcs': [], 'fill': 'border'
  }, {
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', radius: 1.5, start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', radius: 1.5, start: 0 },
      { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V7', radius: 1.5, start: 0 },
      { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V8', radius: 1.5, start: 0 },
    ], 'arcs': [], 'fill': 'background'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function ExitBorderTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;
  const padding = {
    left: 0.5,
    top: 0.3,
    right: 0.5,
    bottom: 0,
  };

  const border = 0.5;
  const returnBorder = [{
    'vertex': [
      { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', start: 1 },
      { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', start: 0 },
      { x: block.width / length + padding.right + border, y: 7.2, label: 'V3', start: 0 },
      { x: 0 - padding.left - border, y: 7.2, label: 'V4', start: 0 },
    ], 'arcs': [], 'fill': '#ffffff'
  }, {
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', start: 0 },
      { x: block.width / length + padding.right, y: 6.7, label: 'V7', start: 0 },
      { x: 0 - padding.right, y: 6.7, label: 'V8', start: 0 },
    ], 'arcs': [], 'fill': '#000000'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function FlagLeftBorderTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;
  rounding.x /= length;
  rounding.y /= length;
  const variables = {
    '2Lines': {
      'A': 1.5,
      'B': 2.5,
      'C': 4.5,
      'D': 1.5,
      'E': 2.5,
      'F': 1.5,
      'G': 1.5,
      'H': 3,
    },
    '4Lines': {
      'A': 1.5,
      'B': 3.5,
      'C': 6,
      'D': 1.5,
      'E': 2.5,
      'F': 1.5,
      'G': 1.5,
      'H': 3,
    }
  };
  const v = block.height > 4.85 * xHeight ? variables['4Lines'] : variables['2Lines'];

  const padding = {
    left: v.D + (block.height / length + v.E + rounding.y / 2 - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
    top: v.E + rounding.y,
    right: v.E,
    bottom: v.D + rounding.y,
  };

  const border = v.A;
  const panel = {
    height: (block.height / length + v.E + rounding.y * 2 + v.D + v.A * 2)
  };

  const returnBorder = [{
    'vertex': [{ x: 0, y: 0, label: 'V0', start: 1 }], 'arcs': [], 'fill': 'symbol'
  }, {
    'vertex': [
      { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
      { x: block.width / length + padding.right + border, y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 },
      { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V3', start: 0 },
      { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0 },
      { x: 0 - padding.left, y: 0 - v.E - rounding.y - border + panel.height / 2, radius: v.F, label: 'V5', start: 0 }
    ], 'arcs': [], 'fill': 'border'
  }, {
    'vertex': [
      { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V6', start: 1 },
      { x: block.width / length + padding.right, y: 0 - padding.top, radius: v.G, label: 'V7', start: 0 },
      { x: block.width / length + padding.right, y: block.height / length + padding.bottom, radius: v.G, label: 'V8', start: 0 },
      { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0 },
      { x: 0 - padding.left + v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V10', start: 0 }
    ], 'arcs': [], 'fill': 'background'
  }, {
    'vertex': [
      { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1 },
      { x: 0 - v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0 },
      { x: -padding.left + v.A + (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0 },
      { x: 0 - v.D, y: 0 + block.height / length, label: 'V14', start: 0 },
      { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0 },
      { x: -padding.left + v.A + v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0 },
    ], 'arcs': [], 'fill': 'symbol'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function FlagRightBorderTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
  const length = xHeight / 4;
  rounding.x /= length;
  rounding.y /= length;
  const variables = {
    '2Lines': {
      'A': 1.5,
      'B': 2.5,
      'C': 4.5,
      'D': 1.5,
      'E': 2.5,
      'F': 1.5,
      'G': 1.5,
      'H': 3,
    },
    '4Lines': {
      'A': 1.5,
      'B': 3.5,
      'C': 6,
      'D': 1.5,
      'E': 2.5,
      'F': 1.5,
      'G': 1.5,
      'H': 3,
    }
  };
  const v = block.height > 4.85 * xHeight ? variables['4Lines'] : variables['2Lines'];

  const padding = {
    left: v.E,
    top: v.E + rounding.y,
    right: v.D + (block.height / length + v.E + rounding.y / 2 - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
    bottom: v.D + rounding.y,
  };

  const border = v.A;
  const panel = {
    height: (block.height / length + v.E + rounding.y * 2 + v.D + v.A * 2)
  };

  const returnBorder = [{
    'vertex': [{ x: 0, y: 0, label: 'V0', start: 1 }], 'arcs': [], 'fill': 'symbol'
  }, {
    'vertex': [
      { x: 0 - padding.left - border, y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
      { x: block.width / length + padding.right - panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 },
      { x: block.width / length + padding.right, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, radius: v.F, label: 'V3', start: 0 },
      { x: block.width / length + padding.right - panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0 },
      { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V5', start: 0 },
    ], 'arcs': [], 'fill': 'border'
  }, {
    'vertex': [
      { x: 0 - padding.left, y: 0 - padding.top, radius: v.G, label: 'V8', start: 1 },
      { x: block.width / length + padding.right - v.A - (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V7', start: 0 },
      { x: block.width / length + padding.right - v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V8', start: 0 },
      { x: block.width / length + padding.right - v.A - (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0 },
      { x: 0 - padding.left, y: block.height / length + padding.bottom, radius: v.G, label: 'V10', start: 0 },
    ], 'arcs': [], 'fill': 'background'
  }, {
    'vertex': [
      { x: block.width / length + v.D + v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1 },
      { x: block.width / length + v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0 },
      { x: block.width / length + padding.right - v.A - (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0 },
      { x: block.width / length + v.D, y: 0 + block.height / length, label: 'V14', start: 0 },
      { x: block.width / length + v.D + v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0 },
      { x: block.width / length + padding.right - v.A - v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0 },
    ], 'arcs': [], 'fill': 'symbol'
  }];

  returnBorder.forEach(path => applyLengthAndRounding(path, length));
  return { path: returnBorder };
}

function drawLabeledBorder(borderType, xHeight, bbox, color) {
  const block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top };
  const rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, bbox);
  const shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding);
  const baseGroup = [];

  // Create polygon with labeled vertices
  shapeMeta.path.forEach(async (p) => {
    const vertexleft = -Math.min(...p.vertex.map(v => v.x));
    const vertextop = -Math.min(...p.vertex.map(v => v.y));

    p.vertex.forEach((vertex) => {
      vertex.x = vertex.x + bbox.left;
      vertex.y = vertex.y + bbox.top;
    });

    const pathData = vertexToPath({ path: [p] });
    baseGroup.push(
      new fabric.Path(pathData, {
        left: bbox.left - vertexleft,
        top: bbox.top - vertextop,
        fill: (p['fill'] == 'background')||(p['fill'] == 'symbol')||(p['fill'] == 'border') ?  BorderColorScheme[color][p['fill']]:p['fill'] ,
        objectCaching: false,
        strokeWidth: 0,
      })
    );
  });

  const GroupedBorder = new fabric.Group(baseGroup);
  GroupedBorder.vertex = shapeMeta.path.map(p => p.vertex).flat();
  GroupedBorder.rounding = rounding;

  return GroupedBorder;
}

drawDivider = async function (xHeight, color, top, left, width, vertical = false) {
  const length = xHeight / 4
  const Xwidth = width / length

  // Vertical divider template
  let horizontalTemplate = [{
    'vertex': [
      { x: 0, y: 0, label: 'V1', start: 1 },
      { x: Xwidth / 2, y: 0, label: 'V2', radius: 1.5, start: 0 },
      { x: Xwidth / 2, y: -1.5, label: 'V3', start: 0 },
      { x: Xwidth / 2, y: 2.5, label: 'V4', start: 0 },
      { x: Xwidth / 2, y: 1, label: 'V5', radius: 1.5, start: 0 },
      { x: -Xwidth / 2, y: 1, label: 'V6', radius: 1.5, start: 0 },
      { x: -Xwidth / 2, y: 2.5, label: 'V7', start: 0 },
      { x: -Xwidth / 2, y: -1.5, label: 'V8', start: 0 },
      { x: -Xwidth / 2, y: 0, label: 'V9', radius: 1.5, start: 0 },
    ], 'arcs': [],
  }];

  // Horizontal divider template
  let verticalTemplate = [{
    'vertex': [
      { x: 0, y: 0, label: 'V1', start: 1 },
      { x: 0, y: Xwidth / 2, label: 'V2', radius: 1.5, start: 0 },
      { x: -1.5, y: Xwidth / 2, label: 'V3', start: 0 },
      { x: 2.5, y: Xwidth / 2, label: 'V4', start: 0 },
      { x: 1, y: Xwidth / 2, label: 'V5', radius: 1.5, start: 0 },
      { x: 1, y: -Xwidth / 2, label: 'V6', radius: 1.5, start: 0 },
      { x: 2.5, y: -Xwidth / 2, label: 'V7', start: 0 },
      { x: -1.5, y: -Xwidth / 2, label: 'V8', start: 0 },
      { x: 0, y: -Xwidth / 2, label: 'V9', radius: 1.5, start: 0 },
    ], 'arcs': [],
  }];

  // Choose the template based on the horizontal parameter
  let dividerTemplate = vertical ? verticalTemplate : horizontalTemplate;

  dividerTemplate.forEach(p => {
    p.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.x += left + (vertical ? 2.5 : Xwidth / 2) * length;
      vertex.y *= length;
      vertex.y += top + (vertical ? Xwidth / 2 : 1.5) * length;
      if (vertex.radius) vertex.radius *= length;
    });
  });

  const arrowOptions1 = {
    left: 0,
    top: 0,
    fill: color,
    angle: 0,
    objectCaching: false,
    strokeWidth: 0
  };

  const dividerShape = new GlyphPath();
  await dividerShape.initialize({ path: dividerTemplate }, arrowOptions1);
  return dividerShape;
}

// Add BorderUtilities object to hold functions moved from FormBorderWrapComponent
const BorderUtilities = {
  VDividerCreate: async function (leftObjects, rightObjects, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']
    const leftObject = this.getExtremeObject(leftObjects, 'left')
    const rightObject = this.getTopMostObject(rightObjects, 'right')

    if (Object.keys(leftObject.lockXToPolygon).length != 0) {
      showTextBox('Unlock the object below divider in X axis', '')
      return
    }
    const leftObjectBBox = BorderUtilities.getBoundingBox(leftObjects)
    const leftRight = leftObjectBBox.right
    const height = leftObjectBBox.bottom - leftObjectBBox.top
    const BaseBorder = await drawDivider(xHeight, color, leftObjectBBox.top, leftRight, height, true) // Added true param to indicate vertical divider
    const borderGroup = new BaseGroup(BaseBorder, 'VDivider')
    borderGroup.xHeight = xHeight
    borderGroup.color = color
    anchorShape(leftObject, borderGroup, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: 2.5 * xHeight / 4,
      spacingY: ''
    })
    anchorShape(borderGroup, rightObject, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: 2.5 * xHeight / 4,
      spacingY: ''
    })
    borderGroup.setCoords()
    borderGroup.updateAllCoord()
  },

  HDividerCreate: async function (aboveObjects, belowObjects, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']
    const aboveObject = this.getBottomMostObject(aboveObjects)
    const belowObject = this.getTopMostObject(belowObjects)

    if (Object.keys(belowObject.lockYToPolygon).length != 0) {
      showTextBox('Unlock the object below divider in Y axis', '')
      return
    }
    const aboveObjectBBox = BorderUtilities.getBoundingBox(aboveObjects)
    const aboveBottom = aboveObjectBBox.bottom
    const width = aboveObjectBBox.right - aboveObjectBBox.left
    const BaseBorder = await drawDivider(xHeight, color, aboveBottom, aboveObjectBBox.left, width)
    const borderGroup = new BaseGroup(BaseBorder, 'HDivider')
    borderGroup.xHeight = xHeight
    borderGroup.color = color
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
    borderGroup.setCoords()
    borderGroup.updateAllCoord()
  },

  getExtremeObject: function (objects, direction) {
    let extremeObject = null;
    let extremeValue = direction === 'bottom' || direction === 'right' ? -Infinity : Infinity;

    objects.forEach(obj => {
      let value;

      switch (direction) {
        case 'bottom':
          value = obj.top + obj.height * obj.scaleY;
          if (value > extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'top':
          value = obj.top;
          if (value < extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'right':
          value = obj.left + obj.width * obj.scaleX;
          if (value > extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'left':
          value = obj.left;
          if (value < extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
      }
    });

    return extremeObject;
  },

  // For backward compatibility
  getBottomMostObject: function (objects) {
    return this.getExtremeObject(objects, 'bottom');
  },

  getTopMostObject: function (objects) {
    return this.getExtremeObject(objects, 'top');
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
    const coordsWidth = BorderUtilities.getBoundingBox(widthObjects)
    const coordsHeight = BorderUtilities.getBoundingBox(heightObjects)
    const coords = { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }

    /*
      coords[0]: Top-left corner
      coords[1]: Top-right corner
      coords[2]: Bottom-right corner
      coords[3]: Bottom-left corner
    */

    innerBorderCoords = BorderUtilities.paddingCoords(coords, xHeight, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
    outerBorderCoords = BorderUtilities.paddingCoords(innerBorderCoords, xHeight, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)

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

  calcBorderRounding: function (borderType, xHeight, bbox) {
    const block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top }
    const rounding = { x: 0, y: 0 }
    const shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // Create polygon with labeled vertices
    shapeMeta.path.forEach(p => {
      p.vertex.forEach((vertex) => {
        vertex.x += bbox.left;
        vertex.y += bbox.top;
        minX = Math.min(minX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxX = Math.max(maxX, vertex.x);
        maxY = Math.max(maxY, vertex.y);
      });
    });
    let borderWidth = maxX - minX;
    let borderHeight = maxY - minY;

    if (borderWidth > 2000 || borderHeight > 2000) {
      roundingX = (50.0 * Math.round(borderWidth / 50.0) - borderWidth) / 2
      roundingY = (50.0 * Math.round(borderHeight / 50.0) - borderHeight) / 2
    } else {
      roundingX = (25.0 * Math.round(borderWidth / 25.0) - borderWidth) / 2
      roundingY = (25.0 * Math.round(borderHeight / 25.0) - borderHeight) / 2
      roundingX = roundingX < -2.5 ? roundingX = 25 / 2 + roundingX : roundingX
      roundingY = roundingY < -2.5 ? roundingY = 25 / 2 + roundingY : roundingY
    }
    return { x: roundingX, y: roundingY }
  },

  FilterDivider: function (heightObjects, widthObjects) {
    let HDividerObject = []
    let VDividerObject = []
    let borderedObjects = []
    let fwidthObjects = widthObjects.filter(obj => {
      if (obj.functionalType == 'HDivider') {
        HDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      else if (obj.borderGroup) {
        borderedObjects.push(obj);
        return false; // Prevent nested border update
      }
      return true; // Keep the object in original array
    });

    let fheightObjects = heightObjects.filter(obj => {
      if (obj.functionalType == 'VDivider') {
        VDividerObject.push(obj);
        return false; // Remove the object from original array
      } else if (obj.borderGroup) {
        borderedObjects.push(obj);
        return false; // Prevent nested border update
      }
      return true; // Keep the object in original array
    });
    return [fheightObjects, fwidthObjects, VDividerObject, HDividerObject, borderedObjects]
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
          spacingX: v.lockXToPolygon.spacing,
          spacingY: ''
        }, sourceList)
      }
      const nextAnchor = v.anchoredPolygon[0]
      if (!sourceList.includes(nextAnchor)) {
        anchorShape(v, nextAnchor, {
          vertexIndex1: nextAnchor.lockXToPolygon.sourcePoint,
          vertexIndex2: nextAnchor.lockXToPolygon.targetPoint,
          spacingX: nextAnchor.lockXToPolygon.spacing,
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
    const coordsWidth = BorderUtilities.getBoundingBox(fwidthObjects)
    const coordsHeight = BorderUtilities.getBoundingBox(fheightObjects)
    return { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }
  },

  BorderGroupCreate: async function (borderType, heightObjects, widthObjects, widthText, heightText, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    //const borderType = options ? options.borderType : document.getElementById("input-type").value
    const colorType = options ? options.colorType : document.getElementById("input-color").value

    const [fheightObjects, fwidthObjects, VDivider, HDivider, bordered] = BorderUtilities.FilterDivider(heightObjects, widthObjects)

    // Get the bounding box of the active selection 
    let coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)

    // handle roundings on borders and dividers
    const rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, coords)
    BorderUtilities.RoundingToDivider(HDivider, VDivider, rounding)
    coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)
    if (!isNaN(parseInt(widthText))) {
      const padding = parseInt(widthText) - coords.right + coords.left
      coords.left -= padding / 2
      coords.right += padding / 2
    }
    if (!isNaN(parseInt(heightText))) {
      const padding = parseInt(heightText) - coords.bottom + coords.top
      coords.top -= padding / 2
      coords.bottom += padding / 2
    }

    const BaseBorder = await drawLabeledBorder(borderType, xHeight, coords, colorType)
    borderGroup = new BaseGroup(BaseBorder, 'Border')
    borderGroup.widthObjects = [...fwidthObjects]
    borderGroup.heightObjects = [...fheightObjects]
    borderGroup.fixedWidth = widthText
    borderGroup.fixedHeight = heightText
    borderGroup.VDivider = VDivider
    borderGroup.HDivider = HDivider

    borderGroup.borderType = borderType
    borderGroup.xHeight = xHeight
    borderGroup.color = colorType
    BorderUtilities.addMidPointToDivider(borderGroup)
    BorderUtilities.assignWidthToDivider(borderGroup)
    borderGroup.addMidPointToDivider = BorderUtilities.addMidPointToDivider
    borderGroup.assignWidthToDivider = BorderUtilities.assignWidthToDivider

    borderGroup.lockMovementX = true
    borderGroup.lockMovementY = true

    // Combine the arrays and create a Set to remove duplicates
    canvas.sendObjectToBack(borderGroup)
    fwidthObjects.forEach(obj => {
      //canvas.bringObjectToFront(obj)
      obj.borderGroup = borderGroup
    })
    fheightObjects.forEach(obj => {
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
    const innerTop = borderSize.top + frame
    for (const d of borderGroup.HDivider) {
      // Store the group's initial top position
      const initialTop = d.getEffectiveCoords()[0].y
      const res = await drawDivider(d.xHeight, d.color, d.top, d.left, innerWidth)
      d.replaceBasePolygon(res)
      d.set({ top: initialTop, left: innerLeft });
      d.updateAllCoord(null, sourceList)
    }

    for (const d of borderGroup.VDivider) {
      // Store the group's initial top position
      const initialLeft = d.getEffectiveCoords()[0].x
      const res = await drawDivider(d.xHeight, d.color, d.top, d.left, innerHeight, true)
      d.replaceBasePolygon(res)
      d.set({ top: innerTop, left: initialLeft });
      d.updateAllCoord(null, sourceList)
    }
  },
}
