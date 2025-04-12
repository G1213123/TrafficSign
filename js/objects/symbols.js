function getFontPath(t) {
  // Use pre-parsed font objects instead of parsing the buffer each time
  let fontGlyphs;
  if (t.fontFamily === 'TransportMedium') {
    fontGlyphs = window.parsedFontMedium || opentype.parse(buffer1);
  } else if (t.fontFamily === 'TransportHeavy') {
    fontGlyphs = window.parsedFontHeavy || opentype.parse(buffer2);
  } else if (t.fontFamily === 'TW-MOE-Std-Kai') {
    fontGlyphs = window.parsedFontKai || opentype.parse(buffer4);
  } else {
    fontGlyphs = window.parsedFontChinese || opentype.parse(buffer3);
  }
  return fontGlyphs.getPath(t.character, t.x, t.y, t.fontSize);
}

function calcSymbol(type, length, color = 'white') {
  let symbol
  if (typeof type === 'string') {
    const symbolsT = JSON.parse(JSON.stringify((color == 'Black' && (type.includes('Hospital') || type.includes('Route'))) ? symbolsTemplateAlt : symbolsTemplate)); // Deep copy to avoid mutation
    const backup = JSON.parse(JSON.stringify(symbolsTemplate));
    symbol = symbolsT[type] || backup[type];
  } else {
    symbol = JSON.parse(JSON.stringify(type));
  }

  symbol.path.forEach(path => {
    path.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.y *= length;
      if (vertex.radius) vertex.radius *= length;
    });
    path.arcs.forEach(arc => {
      arc.radius *= length;
      if (arc.radius2) { arc.radius2 *= length; }
    });
  });

  if (symbol.text) {
    symbol.text.forEach(t => {
      t.x *= length;
      t.y *= length;
      t.fontSize *= length;
    }
    )
  }

  return symbol;
}

function getInsertOffset(shapeMeta, angle = 0) {
  const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
  const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));
  return { left: vertexleft, top: vertextop }
}

// draw segment in svg between vertex
function drawSegment(current, next, previous, prevArc, final = false) {
  let pathString = ''
  if (current.radius) {
    // Calculate the exterior angle θ
    const angle = calculateAngle(previous, current, next);

    // Calculate the offset distance d = r × tan(θ/2)
    const offsetDistance = current.radius * Math.tan(angle / 2);

    // Calculate the tangent points for the arc
    const prevTangent = calculateTangentPoint(previous, current, offsetDistance);
    const nextTangent = calculateTangentPoint(next, current, offsetDistance);

    // Determine the arc direction (clockwise or counterclockwise)
    const arcDirection = getArcDirection(previous, current, next);

    // Line to the start of the arc
    pathString += ` ${current.start ? 'M' : 'L'} ${prevTangent.x} ${prevTangent.y}`;

    // Arc to the end of the arc
    pathString += ` A ${current.radius} ${current.radius} 0 0 ${1 - arcDirection} ${nextTangent.x} ${nextTangent.y}`

  } else if (prevArc && (!current.start || final)) {
    pathString += ` A ${prevArc.radius} ${prevArc.radius2 ? prevArc.radius2 : prevArc.radius} 0 ${prevArc.sweep} ${prevArc.direction} ${current.x} ${current.y}`
  } else {
    // Line to the next point
    pathString += ` ${current.start ? 'M' : 'L'} ${current.x} ${current.y}`;
  }
  return pathString
}

// Convert shapeMeta.vertex points to SVG path string with circular trims
function vertexToPath(shapeMeta, color) {
  let svgContent = '<svg>';
  let pathString = '';
  let textPromises = [];

  shapeMeta.path.forEach((path) => {
    let fillColor = path.fill || color || 'white';
    let pathStart = path.vertex[0]
    let pathNext = path.vertex[1]
    for (let i = 0; i < path.vertex.length; i++) {
      const current = path.vertex[i];
      const next = path.vertex[(i + 1) % path.vertex.length];
      const previous = path.vertex.at(i - 1);
      const prevArc = path.arcs.find(arc => (arc.end == current.label))

      pathString += drawSegment(current, next, previous, prevArc)

      // at end of path
      if (next.start == 1) {
        // Handle the last corner (which is also the first corner)
        const finalArc = path.arcs.find(arc => (arc.start == current.label))
        if (finalArc){
          pathString += drawSegment(pathStart, pathNext, current, finalArc, true)
        }
        pathString += ' Z'
        pathStart = next
        pathNext = path.vertex[(i + 2) % path.vertex.length];
      }

    }

    svgContent += `<path d="${pathString}" fill="${fillColor}" />`;
    pathString = ''
  })

  // handle text objects in path
  if (shapeMeta.text && shapeMeta.text.length > 0) {
    shapeMeta.text.forEach(t => {
      let fillColor = t.fill || color || 'white';
      const origY = t.y;

      t.y = 0;
      let charPath = getFontPath(t);
      const minTop = Math.min(...charPath.commands.map(c => c.y));
      charPath.commands.forEach((command) => {
        command.y = command.y - origY- minTop;
        if (command.y1 !== undefined) {
          command.y1 = command.y1 - origY - minTop;
        }
      })
      const charSVG = charPath.toPathData({ flipY: false })
      svgContent += `<path d="${charSVG}" fill="${fillColor}" />`;


    })
  }


    // If no text promises, just return the SVG content immediately
    svgContent += '</svg>';
    return svgContent;
  
}

// Calculate the exterior angle between the edges
function calculateAngle(prev, current, next) {
  const v1 = { x: current.x - prev.x, y: current.y - prev.y };
  const v2 = { x: next.x - current.x, y: next.y - current.y };
  const dotProduct = v1.x * v2.x + v1.y * v2.y;
  const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  return Math.acos(dotProduct / (magnitude1 * magnitude2));
}

// Calculate the tangent point for the arc
function calculateTangentPoint(point, center, offsetDistance) {
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  const offsetX = Math.round(offsetDistance * Math.cos(angle) * 100) / 100;
  const offsetY = Math.round(offsetDistance * Math.sin(angle) * 100) / 100;
  return {
    x: center.x + offsetX,
    y: center.y + offsetY
  };
}

function calculateTransformedPoints(pointsList, options) {
  const { x, y, angle } = options;
  const radians = angle * (Math.PI / 180); // Convert angle to radians
  const points = pointsList.path ? pointsList.path[0].vertex : pointsList

  return points.map(point => {
    // Translate point to origin
    const translatedX = point.x;
    const translatedY = point.y;

    // Apply rotation
    const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

    // Translate point back to the specified position
    return {
      ...point,
      x: rotatedX + x,
      y: rotatedY + y,
      label: point.label
    };
  });
}

// Determine the arc direction (clockwise or counterclockwise)
function getArcDirection(prev, current, next) {
  const crossProduct = (current.x - prev.x) * (next.y - prev.y) - (current.y - prev.y) * (next.x - prev.x);
  return crossProduct > 0 ? 0 : 1; // 0 for counterclockwise, 1 for clockwise
}

// Calculate the intersection point of two lines
function intersectLines(p1, p2, p3, p4) {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (denom === 0) return null; // Lines are parallel

  const intersectX = ((p1.x * p2.y - p1.y * p2.x) * (p3.x - p4.x) - (p1.x - p2.x) * (p3.x * p4.y - p3.y * p4.x)) / denom;
  const intersectY = ((p1.x * p2.y - p1.y * p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x * p4.y - p3.y * p4.x)) / denom;

  return { x: intersectX, y: intersectY };
}

// Calculate the arc center by offsetting both edges by the radius
function calculateArcCenter(prev, current, next, radius) {
  const offsetPrev = offsetPoint(prev, current, radius);
  const offsetNext = offsetPoint(next, current, radius);

  return intersectLines(offsetPrev, current, offsetNext, current);
}

// Offset a point by the radius
function offsetPoint(point, center, radius) {
  const angle = Math.atan2(point.y - center.y, point.x - center.x);
  const offsetX = radius * Math.cos(angle);
  const offsetY = radius * Math.sin(angle);
  return {
    x: center.x - offsetX,
    y: center.y - offsetY
  };
}

/**
 * Combines multiple paths into one, reindexing vertex labels and updating arc references.
 * @param {Array<Object>} pathsArray - Array of path objects or objects containing path arrays
 * @returns {Object} - Object with combined paths array, properly reindexed vertices and updated arc references
 */
function combinePaths(pathsArray) {
  // Handle edge cases
  if (!pathsArray || pathsArray.length === 0) return null;
  if (pathsArray.length === 1) return JSON.parse(JSON.stringify(pathsArray[0]));

  // Initialize the result object that will hold all combined paths
  let result = {
    path: [],
    text: []
  };

  // Track the highest vertex number across all paths to properly reindex
  let highestVertexNumber = 0;

  // Process each path object and add it to the result
  pathsArray.forEach((pathObj) => {
    // Deep copy to avoid mutations
    const pathObjCopy = JSON.parse(JSON.stringify(pathObj));

    // Check if this is a symbol object with a path array or a direct path object
    const pathsToCombine = pathObjCopy.path || [pathObjCopy];

    // Process each individual path in the array
    pathsToCombine.forEach(path => {
      // Create a mapping from old labels to new labels
      const labelMap = {};

      // Reindex all vertex labels in this path
      if (path.vertex) {
        path.vertex.forEach(vertex => {
          if (vertex.label && vertex.label.startsWith('V')) {
            const oldLabel = vertex.label;
            const numericPart = parseInt(oldLabel.substring(1), 10) || 0;
            const newLabel = `V${numericPart + highestVertexNumber}`;
            labelMap[oldLabel] = newLabel;
            vertex.label = newLabel;
          }
        });

        // Update arc references in this path
        if (path.arcs) {
          path.arcs.forEach(arc => {
            if (arc.start && labelMap[arc.start]) {
              arc.start = labelMap[arc.start];
            }
            if (arc.end && labelMap[arc.end]) {
              arc.end = labelMap[arc.end];
            }
          });
        }

        // Set start flag for the first vertex in each path
        if (path.vertex.length > 0) {
          path.vertex[0].start = 1;
        }

        // Update the highest vertex number for the next path
        const pathMaxNumber = Math.max(...path.vertex
          .filter(v => v.label && v.label.startsWith('V'))
          .map(v => parseInt(v.label.substring(1), 10) || 0));

        highestVertexNumber = Math.max(highestVertexNumber, pathMaxNumber);
      }

      // Add the processed path to the result
      result.path.push(path);
    });

    // If there are text elements, add them to the result
    if (pathObjCopy.text) {
      result.text = result.text.concat(pathObjCopy.text);
    }
  });

  return result;
}

/**
 * SymbolObject extends BaseGroup to create symbols with editing functionality
 */
class SymbolObject extends BaseGroup {
  constructor(symbolType, options = {}) {
    // Store symbol properties before creating the base group
    const symbolProperties = {
      symbol: symbolType,
      xHeight: options.length || (options.xHeight || 100),
      color: options.color || 'White',
      symbolAngle: options.angle || 0,
    };

    // Call the BaseGroup constructor with the symbol path
    super(null, 'Symbol');
    
    // Apply stored symbol properties
    Object.assign(this, symbolProperties);

    // Add double-click event handler
    this.on('mousedblclick', this.onDoubleClick.bind(this));
  }

  async initialize(symbolPath) {
    symbolPath.symbol = this.symbol
    // Set the basePolygon that was initially null in the constructor
    this.setBasePolygon(symbolPath)


    return this;
}

  /**
   * Handle double-click on the symbol object
   */
  onDoubleClick() {
    // Check if FormDrawAddComponent is defined
    if (typeof FormDrawAddComponent === 'undefined') {
      // If not defined, load the draw module first
      if (typeof SidebarHelpers !== 'undefined' && SidebarHelpers.loadDrawModule) {
        SidebarHelpers.loadDrawModule().then(() => {
          // Once the module is loaded, initialize the panel for editing this symbol
          FormDrawAddComponent.drawPanelInit(null, this);
        });
      } else {
        console.error('SidebarHelpers not defined or loadDrawModule not available');
      }
    } else {
      // If already defined, initialize directly
      FormDrawAddComponent.drawPanelInit(null, this);
    }
  }
  
  /**
   * Update symbol properties and visuals
   */
  updateSymbol(symbolType, length, color, angle) {
    // Create new symbol data
    const symbolData = calcSymbol(symbolType, length / 4, color);
    
    // Store the new properties
    this.symbol = symbolType;
    this.xHeight = length; // Convert back to xHeight
    this.color = color;
    this.symbolAngle = angle;
    
    // Create symbol options - keep angle at 0 for the actual path object
    const symbolOptions = {
      left: this.left,
      top: this.top,
      fill: color,
      objectCaching: false,
      strokeWidth: 0,
      angle : 0
    };

    // Create a new GlyphPath for the symbol
    const symbolPath = new GlyphPath();
    symbolPath.initialize(symbolData, symbolOptions);
    
    // Apply the rotation transform to vertex coordinates before creating the path
    symbolData.path.forEach(p => {
      p.vertex = calculateTransformedPoints(p.vertex, {
        x: 0, 
        y: 0, 
        angle: angle
      });
    });
    
    // Initialize the new path with transformed coordinates and replace the current one
    this.replaceBasePolygon(symbolPath);

    this.showDimensions()
  }
}

// Update the existing functions to use the new SymbolObject class

/**
 * Creates a symbol directly on the canvas without using cursor intermediary
 * @param {string} symbolType - Type of symbol to create
 * @param {Object} options - Configuration options: x, y, xHeight, angle, color
 * @return {Object} The created symbol object
 */
async function drawSymbolDirectly(symbolType, options) {
  // Calculate symbol data
  const symbolData = calcSymbol(symbolType, options.xHeight / 4, options.color);

  // Create symbol options
  const symbolOptions = {
    left: options.x || 0,
    top: options.y || 0,
    fill: options.color.toLowerCase() === 'white' ? '#ffffff' : '#000000',
    angle: 0,
    objectCaching: false,
    strokeWidth: 0
  };

  // separate the angle handling from the symbol path creation
  symbolData.path.forEach(p => {
    p.vertex = calculateTransformedPoints(p.vertex, {
      x: 0,
      y: 0,
      angle: options.angle || 0
    });
  });

  // Create the GlyphPath for the symbol
  const symbolPath = new GlyphPath(symbolOptions);
  await symbolPath.initialize(symbolData, symbolOptions);

  // Create the SymbolObject with all original parameters, but the actual path
  // has pre-rotated vertices instead of a rotation transform
  const symbolGroup = new SymbolObject(symbolType, options);
  await symbolGroup.initialize(symbolPath);

  symbolGroup.set({
    symbolAngle: options.angle || 0,
    strokeWidth: 0,
  })

  return symbolGroup;
}

// Update the drawLabeledSymbol function to use drawSymbolDirectly
async function drawLabeledSymbol(symbolType, options) {
  return await drawSymbolDirectly(symbolType, options);
}

