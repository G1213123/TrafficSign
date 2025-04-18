/**
 * Path.js - Contains all vertex and path related functions for traffic sign drawing
 * This file centralizes path manipulation logic that was previously scattered across
 * draw.js and symbols.js files.
 */

/**
 * Calculate transformed points based on position and rotation
 * @param {Array|Object} pointsList - Array of points or object with path property
 * @param {Object} options - Transform options with x, y, and angle
 * @returns {Array} - Transformed points
 */
function calculateTransformedPoints(pointsList, options) {
  const { x, y, angle } = options;
  const radians = angle * (Math.PI / 180); // Convert angle to radians
  const points = pointsList.path ? pointsList.path[0].vertex : pointsList;

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

/**
 * Calculate the angle between three points
 * @param {Object} p1 - First point with x, y coordinates
 * @param {Object} p2 - Center point with x, y coordinates
 * @param {Object} p3 - Third point with x, y coordinates
 * @returns {number} - Angle in radians
 */
function calculateAngle(prev, current, next) {
    const v1 = { x: current.x - prev.x, y: current.y - prev.y };
    const v2 = { x: next.x - current.x, y: next.y - current.y };
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const magnitude1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const magnitude2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
    return Math.acos(dotProduct / (magnitude1 * magnitude2));
}

/**
 * Calculate tangent point for arc
 * @param {Object} p1 - Reference point with x, y coordinates
 * @param {Object} p2 - Center point with x, y coordinates
 * @param {number} offsetDistance - Distance to offset
 * @returns {Object} - Tangent point coordinates
 */
function calculateTangentPoint(point, center, offsetDistance) {
    const angle = Math.atan2(point.y - center.y, point.x - center.x);
    const offsetX = Math.round(offsetDistance * Math.cos(angle) * 100) / 100;
    const offsetY = Math.round(offsetDistance * Math.sin(angle) * 100) / 100;
    return {
      x: center.x + offsetX,
      y: center.y + offsetY
    };
  }

/**
 * Determine the arc direction (clockwise or counterclockwise)
 * @param {Object} p1 - First point with x, y coordinates
 * @param {Object} p2 - Center point with x, y coordinates
 * @param {Object} p3 - Third point with x, y coordinates
 * @returns {number} - 1 for clockwise, 0 for counterclockwise
 */
function getArcDirection(p1, p2, p3) {
  // Cross product to determine clockwise/counterclockwise direction
  const crossProduct = (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
  return crossProduct < 0 ? 1 : 0;
}

/**
 * Calculate the arc center by offsetting both edges by the radius
 * @param {Object} prev - Previous point
 * @param {Object} current - Current point (corner)
 * @param {Object} next - Next point
 * @param {number} radius - Arc radius
 * @returns {Object} - Arc center coordinates
 */
function calculateArcCenter(prev, current, next, radius) {
  // Calculate the perpendicular vectors
  const v1 = offsetPoint(prev, current, radius);
  const v2 = offsetPoint(next, current, radius);
  
  // Calculate the intersection
  return intersectLines(
    v1.p1.x, v1.p1.y, v1.p2.x, v1.p2.y,
    v2.p1.x, v2.p1.y, v2.p2.x, v2.p2.y
  );
}

/**
 * Offset a point by the radius
 * @param {Object} point - Point to offset
 * @param {Object} center - Center point
 * @param {number} radius - Offset radius
 * @returns {Object} - Object with p1 and p2 representing the offset line
 */
function offsetPoint(point, center, radius) {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const unitX = dx / distance;
  const unitY = dy / distance;
  
  // Rotate 90 degrees for perpendicular
  const perpX = -unitY;
  const perpY = unitX;
  
  return {
    p1: {
      x: center.x + perpX * radius,
      y: center.y + perpY * radius
    },
    p2: {
      x: point.x + perpX * radius,
      y: point.y + perpY * radius
    }
  };
}

/**
 * Calculate the intersection point of two lines
 * @param {number} x1 - First line, first point x
 * @param {number} y1 - First line, first point y
 * @param {number} x2 - First line, second point x
 * @param {number} y2 - First line, second point y
 * @param {number} x3 - Second line, first point x
 * @param {number} y3 - Second line, first point y
 * @param {number} x4 - Second line, second point x
 * @param {number} y4 - Second line, second point y
 * @returns {Object} - Intersection point coordinates
 */
function intersectLines(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if either of the lines are vertical
  const isLine1Vertical = Math.abs(x1 - x2) < 0.001;
  const isLine2Vertical = Math.abs(x3 - x4) < 0.001;
  
  // Handle vertical lines
  if (isLine1Vertical && isLine2Vertical) {
    return null; // Parallel vertical lines
  }
  
  if (isLine1Vertical) {
    const m2 = (y4 - y3) / (x4 - x3);
    const b2 = y3 - m2 * x3;
    return {
      x: x1,
      y: m2 * x1 + b2
    };
  }
  
  if (isLine2Vertical) {
    const m1 = (y2 - y1) / (x2 - x1);
    const b1 = y1 - m1 * x1;
    return {
      x: x3,
      y: m1 * x3 + b1
    };
  }
  
  // Calculate the slopes and y-intercepts
  const m1 = (y2 - y1) / (x2 - x1);
  const b1 = y1 - m1 * x1;
  
  const m2 = (y4 - y3) / (x4 - x3);
  const b2 = y3 - m2 * x3;
  
  // Check if the lines are parallel (same slope)
  if (Math.abs(m1 - m2) < 0.001) {
    return null; // Parallel lines
  }
  
  // Calculate the intersection point
  const x = (b2 - b1) / (m1 - m2);
  const y = m1 * x + b1;
  
  return { x, y };
}

/**
 * Draw a path segment between vertices, handling arcs and rounded corners
 * @param {Object} current - Current vertex
 * @param {Object} next - Next vertex
 * @param {Object} previous - Previous vertex
 * @param {Object} prevArc - Arc definition if it exists
 * @param {boolean} final - Whether this is the final segment
 * @returns {string} - SVG path string segment
 */
function drawSegment(current, next, previous, prevArc, final = false) {
  let pathString = '';
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
    pathString += ` A ${current.radius} ${current.radius} 0 0 ${1 - arcDirection} ${nextTangent.x} ${nextTangent.y}`;

  } else if (prevArc && (!current.start || final)) {
    pathString += ` A ${prevArc.radius} ${prevArc.radius2 ? prevArc.radius2 : prevArc.radius} 0 ${prevArc.sweep} ${prevArc.direction} ${current.x} ${current.y}`;
  } else {
    // Line to the next point
    pathString += ` ${current.start ? 'M' : 'L'} ${current.x} ${current.y}`;
  }
  return pathString;
}

/**
 * Convert vertex data to SVG path string
 * @param {Object} shapeMeta - Object with path and text data
 * @param {string} color - Fill color for paths
 * @returns {string} - Complete SVG path string
 */
function vertexToPath(shapeMeta, color) {
  let svgContent = '<svg>';
  let pathString = '';

  shapeMeta.path.forEach((path) => {
    let fillColor = path.fill || color || 'white';
    let pathStart = path.vertex[0];
    let pathNext = path.vertex[1];
    
    for (let i = 0; i < path.vertex.length; i++) {
      const current = path.vertex[i];
      const next = path.vertex[(i + 1) % path.vertex.length];
      const previous = path.vertex.at(i - 1);
      const prevArc = path.arcs && path.arcs.find(arc => (arc.end == current.label));

      pathString += drawSegment(current, next, previous, prevArc);

      // at end of path
      if (next.start == 1) {
        // Handle the last corner (which is also the first corner)
        const finalArc = path.arcs && path.arcs.find(arc => (arc.start == current.label));
        
        if (finalArc){
          pathString += drawSegment(pathStart, pathNext, current, finalArc, true);
        }
        pathString += ' Z';
        pathStart = next;
        pathNext = path.vertex[(i + 2) % path.vertex.length];
      }
    }

    svgContent += `<path d="${pathString}" fill="${fillColor}" />`;
    pathString = '';
  });

  // Handle text objects in path
  if (shapeMeta.text && shapeMeta.text.length > 0) {
    shapeMeta.text.forEach(t => {
      let fillColor = t.fill || color || 'white';
      const origY = t.y;

      t.y = 0;
      let charPath = getFontPath(t);
      const minTop = Math.min(...charPath.commands.map(c => c.y));
      
      charPath.commands.forEach((command) => {
        command.y = command.y - origY - minTop;
        if (command.y1 !== undefined) {
          command.y1 = command.y1 - origY - minTop;
        }
      });
      
      const charSVG = charPath.toPathData({ flipY: false });
      svgContent += `<path d="${charSVG}" fill="${fillColor}" />`;
    });
  }

  svgContent += '</svg>';
  return svgContent;
}

/**
 * Get the insertion offset for a shape
 * @param {Object} shapeMeta - Object containing path data
 * @param {number} angle - Rotation angle in degrees
 * @returns {Object} - Left and top offset values
 */
function getInsertOffset(shapeMeta, angle = 0) {
  const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
  const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));
  return { left: vertexleft, top: vertextop };
}

/**
 * Convert vertex data directly to Fabric.js path commands
 * @param {Object} path - Path object with vertices and arcs
 * @returns {string} - Fabric.js path command string
 */
function convertVertexToPathCommands(path) {
  let pathCommands = '';
  const vertices = path.vertex || [];
  
  if (vertices.length === 0) return '';
  
  // Start with the first vertex
  let pathStart = vertices[0];
  pathCommands += `M ${pathStart.x} ${pathStart.y} `;
  
  // Process each vertex and its connections
  for (let i = 0; i < vertices.length; i++) {
    const current = vertices[i];
    const next = vertices[(i + 1) % vertices.length];
    const previous = i > 0 ? vertices[i - 1] : vertices[vertices.length - 1];
    
    // Find if there's an arc that ends at the current vertex
    const prevArc = path.arcs ? path.arcs.find(arc => arc.end === current.label) : null;
    
    // If this is a start point (other than the first vertex), move to it
    if (current.start && i > 0) {
      pathCommands += `M ${current.x} ${current.y} `;
    } 
    // If there's a previous arc, draw an arc
    else if (prevArc && (!current.start || i === vertices.length - 1)) {
      // Find the vertices referenced by the arc
      const startVertex = vertices.find(v => v.label === prevArc.start);
      const endVertex = vertices.find(v => v.label === prevArc.end);
      
      if (startVertex && endVertex) {
        // Calculate arc parameters for fabric.Path
        const radius = prevArc.radius2 ? prevArc.radius2 : prevArc.radius;
        const largeArcFlag = prevArc.sweep ? 1 : 0;
        const sweepFlag = prevArc.direction ? 1 : 0;
        
        pathCommands += `A ${prevArc.radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${current.x} ${current.y} `;
      } else {
        // Fallback to line if vertices not found
        pathCommands += `L ${current.x} ${current.y} `;
      }
    } 
    // If this vertex has a radius property, create rounded corner
    else if (current.radius) {
      // Calculate the angle between previous-current and current-next
      const angle = calculateAngle(previous, current, next);
      
      // Calculate offset distance based on radius and angle
      const offsetDistance = Math.abs(current.radius * Math.tan(angle / 2));
      
      // Calculate tangent points for the arc
      const prevTangent = calculateTangentPoint(previous, current, offsetDistance);
      const nextTangent = calculateTangentPoint(next, current, offsetDistance);
      
      // Determine arc direction (0 = counterclockwise, 1 = clockwise)
      const arcDirection = getArcDirection(previous, current, next);
      
      // Line to start of arc
      pathCommands += `L ${prevTangent.x} ${prevTangent.y} `;
      
      // Arc to end of arc
      pathCommands += `A ${current.radius} ${current.radius} 0 0 ${1 - arcDirection} ${nextTangent.x} ${nextTangent.y} `;
    } 
    // Otherwise, draw a line to the next point
    else {
      pathCommands += `L ${current.x} ${current.y} `;
    }
    
    // If we've reached a vertex that starts a new subpath
    if (next.start) {
      // Find if there's an arc that starts at the current vertex
      const finalArc = path.arcs ? path.arcs.find(arc => arc.start === current.label) : null;
      
      if (finalArc) {
        // Similar arc calculation as above
        const endVertex = vertices.find(v => v.label === finalArc.end);
        if (endVertex && endVertex === pathStart) {
          const radius = finalArc.radius2 ? finalArc.radius2 : finalArc.radius;
          const largeArcFlag = finalArc.sweep ? 1 : 0;
          const sweepFlag = finalArc.direction ? 1 : 0;
          
          pathCommands += `A ${finalArc.radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${pathStart.x} ${pathStart.y} `;
        }
      }
      
      // Close the path
      pathCommands += 'Z ';
      
      // Reset path start for next subpath
      if (i < vertices.length - 1) {
        pathStart = next;
        pathCommands += `M ${pathStart.x} ${pathStart.y} `;
      }
    }
  }
  
  // Close the final subpath if needed
  if (!pathCommands.endsWith('Z ')) {
    pathCommands += 'Z';
  }
  
  return pathCommands;
}

/**
 * Convert font path commands to Fabric.js path command string
 * @param {Array} commands - Array of font path commands
 * @param {Object} textElem - Text element with position data
 * @returns {string} - Fabric.js path command string
 */
function convertFontPathToFabricPath(commands, textElem) {
  let pathCommands = '';
  const offsetY = textElem.y;
  
  // Find minimum Y value for proper positioning
  const minY = Math.min(...commands
    .filter(cmd => cmd.y !== undefined)
    .map(cmd => cmd.y));
  
  commands.forEach(cmd => {
    switch (cmd.type) {
      case 'M':
        pathCommands += `M ${cmd.x} ${cmd.y - offsetY - minY} `;
        break;
      case 'L':
        pathCommands += `L ${cmd.x} ${cmd.y - offsetY - minY} `;
        break;
      case 'C':
        pathCommands += `C ${cmd.x1} ${cmd.y1 - offsetY - minY} ${cmd.x2} ${cmd.y2 - offsetY - minY} ${cmd.x} ${cmd.y - offsetY - minY} `;
        break;
      case 'Q':
        pathCommands += `Q ${cmd.x1} ${cmd.y1 - offsetY - minY} ${cmd.x} ${cmd.y - offsetY - minY} `;
        break;
      case 'Z':
        pathCommands += 'Z ';
        break;
    }
  });
  
  return pathCommands;
}

/**
 * Assigns labels to vertices
 * @param {Array} vertexList - List of vertices to label
 * @return {void}
 */
function assignVertexLabel(vertexList) {
  vertexList.map((vertex, index) => {
    vertex.label = `V${index + 1}`;
    vertex.start = index === 0 ? 1 : 0;
  });
}

/**
 * Combines multiple paths into one, reindexing vertex labels and updating arc references
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

// Export the functions so they can be imported elsewhere
export {
  calculateTransformedPoints,
  calculateAngle,
  calculateTangentPoint,
  getArcDirection,
  calculateArcCenter,
  offsetPoint,
  intersectLines,
  drawSegment,
  vertexToPath,
  getInsertOffset,
  convertVertexToPathCommands,
  convertFontPathToFabricPath,
  assignVertexLabel,
  combinePaths
};
