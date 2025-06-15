function collectPathObjects(obj, pathObjects) {
  // Skip grid objects
  if (obj.id === 'grid') return;

  // Special handling for TextObjects - collect both frames and character paths
  if (obj.functionalType === 'Text') {
    // Process text frames if available
    if (obj.txtFrameList) {
      obj.txtFrameList.forEach(frame => {
        // Get proper frame position relative to text object
        const frameOffsetX = frame.left + obj.width / 2 + obj.left || 0;
        const frameOffsetY = frame.top + obj.height / 2 + obj.top || 0;

        // Create a path representing the text frame
        const framePoints = [
          { x: frameOffsetX - 1, y: frameOffsetY - 1 },
          { x: frameOffsetX + 1 + frame.width, y: frameOffsetY - 1 },
          { x: frameOffsetX + 1 + frame.width, y: frameOffsetY + frame.height + 1 },
          { x: frameOffsetX - 1, y: frameOffsetY + frame.height + 1 }
        ];

        // Create a synthetic path object from the frame
        const framePath = {
          type: 'path',
          path: [
            ['M', framePoints[0].x, framePoints[0].y],
            ['L', framePoints[1].x, framePoints[1].y],
            ['L', framePoints[2].x, framePoints[2].y],
            ['L', framePoints[3].x, framePoints[3].y],
            ['Z']
          ],
        };

        pathObjects.push(framePath);
      });
    }
    // Process text character paths if available
    if (obj.txtCharList && obj.txtCharList.length > 0) {
      // Collect all character paths for union calculation
      const characterPaths = [];

      obj.txtCharList.forEach(charObj => {
        if (charObj && charObj.type === 'path' && charObj.path) {
          // Create a copy of the path to preserve the original
          const pathCopy = {
            type: 'path',
            path: charObj.path.slice(),
            left: charObj.left,
            top: charObj.top,
            scaleX: charObj.scaleX || 1,
            scaleY: charObj.scaleY || 1,
            angle: charObj.angle || 0,
            objectType: 'text' // Tag character paths as text
          };

          // Apply transformations based on the character's position within the text object
          const transformedPath = transformPath(
            pathCopy,
            obj.left + obj.width / 2,
            obj.top + obj.height / 2
          );

          if (transformedPath.path && transformedPath.path.length > 0) {
            const unionedPath = calculatePathUnion([transformedPath]);
            unionedPath.objectType = 'text'; // Tag as text object
            pathObjects.push(unionedPath);
          }
        }
      });
    }
    return;
  }

  // Handle SVG paths with potential holes
  if (obj.basePolygon && obj.basePolygon.type === 'path' && obj.basePolygon.path) {
    // Add the complete path object from basePolygon
    const rawPath = obj.basePolygon;

    // Add as a regular path
    pathObjects.push({
      type: 'path',
      path: rawPath.path,
      isOuterPath: true, // Mark as potentially having holes
      left: rawPath.left || 0,
      top: rawPath.top || 0,
      scaleX: rawPath.scaleX || 1,
      scaleY: rawPath.scaleY || 1
    });
  }
  // If the object has a basePolygon with _objects
  else if (obj.basePolygon && obj.basePolygon._objects) {
    obj.basePolygon._objects.forEach(nestedObj => {
      collectNestedPathObjects(nestedObj, pathObjects, obj);
    });
  }
  // If it's a fabric Group object that might contain paths
  else if (obj.type === 'group' && obj._objects) {
    obj._objects.forEach(nestedObj => {
      collectNestedPathObjects(nestedObj, pathObjects, obj);
    });
  }
  // Direct path objects
  else if (obj.type === 'path') {
    // Add path direction info (clockwise/counterclockwise) for hole detection
    const pathWithDirection = {
      ...obj,
      isOuterPath: isClockwise(obj.path)
    };
    pathObjects.push(pathWithDirection);
  }
  // Direct rect objects
  else if (obj.type === 'rect') {
    const rectPathObj = convertRectToPath(obj);
    if (rectPathObj) {
      rectPathObj.isOuterPath = true; // Rectangles are always outer paths
      pathObjects.push(rectPathObj);
    }
  }
}

// Function to recursively collect path objects from nested structures
function collectNestedPathObjects(obj, collection, parentObj) {
  // Skip nulls or undefined
  if (!obj) return;

  if (obj.type === 'path') {
    // Add the complete path object from basePolygon
    const rawPath = {
      type: 'path',
      path: obj.path,
      isOuterPath: true, // Mark as potentially having holes
      left: obj.left || 0,
      top: obj.top || 0,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1
    };
    // Add as a regular path
    // Apply transformations based on the character's position within the text object
    const transformedPath = transformPath(
      rawPath,
      parentObj.left + parentObj.width / 2,
      parentObj.top + parentObj.height / 2
    );

    collection.push(transformedPath);


  }
  else if (obj.type === 'rect') {
    const rectPathObj = convertRectToPath(obj);
    if (rectPathObj) {
      rectPathObj.isOuterPath = true; // Rectangles are always outer paths
      rectPathObj.parentObj = parentObj;
      collection.push(rectPathObj);
    }
  }
  else if (obj.type === 'group' && obj._objects) {
    obj._objects.forEach(nestedObj => {
      collectNestedPathObjects(nestedObj, collection, parentObj || obj);
    });
  }
}

// Helper function to convert a rectangle to a path object
function convertRectToPath(rectObj) {
  if (!rectObj || !rectObj.width || !rectObj.height) return null;

  // Get the actual position of the rect considering its parent transformations
  let left = rectObj.left || 0;
  let top = rectObj.top || 0;
  let width = rectObj.width;
  let height = rectObj.height;

  // If the rect is part of a group, we need to apply the group's transformations
  if (rectObj.group) {
    const transformMatrix = rectObj.group.calcTransformMatrix();
    const tl = fabric.util.transformPoint({ x: left, y: top }, transformMatrix);
    const tr = fabric.util.transformPoint({ x: left + width, y: top }, transformMatrix);
    const br = fabric.util.transformPoint({ x: left + width, y: top + height }, transformMatrix);
    const bl = fabric.util.transformPoint({ x: left, y: top + height }, transformMatrix);

    // Create a pathData array using the transformed points
    return {
      type: 'path',
      path: [
        ['M', tl.x, tl.y],
        ['L', tr.x, tr.y],
        ['L', br.x, br.y],
        ['L', bl.x, bl.y],
        ['Z']
      ]
    };
  }

  // For standalone rects, create a simple path
  return {
    type: 'path',
    path: [
      ['M', left, top],
      ['L', left + width, top],
      ['L', left + width, top + height],
      ['L', left, top + height],
      ['Z']
    ]
  };
}

// Helper method to process a path object for DXF export
function processPathForDXF(pathObj, dxf, offsetX, offsetY) {
  // Process SVG path data for DXF export
  const pathData = pathObj.path || [];

  // First, we'll analyze the path to find subpaths (segments starting with 'M')
  const subpaths = [];
  let currentSubpath = [];
  let firstPointInSubpath = null;

  // Group commands by subpaths
  pathData.forEach(cmd => {
    if (cmd[0] === 'M') {
      // Start a new subpath
      if (currentSubpath.length > 0) {
        subpaths.push({
          commands: currentSubpath,
          firstPoint: firstPointInSubpath,
          closed: false
        });
      }
      currentSubpath = [cmd];
      firstPointInSubpath = [
        cmd[1] + offsetX,
        -(cmd[2] + offsetY) // Flip Y coordinate for DXF
      ];
    } else {
      currentSubpath.push(cmd);
      // Mark if path is closed
      if (cmd[0] === 'Z') {
        subpaths.push({
          commands: currentSubpath,
          firstPoint: firstPointInSubpath,
          closed: false
        });
        currentSubpath = [];
        firstPointInSubpath = null;
      }
    }
  });

  // Add the last subpath if it exists and wasn't closed with Z
  if (currentSubpath.length > 0) {
    subpaths.push({
      commands: currentSubpath,
      firstPoint: firstPointInSubpath,
      closed: false
    });
  }

  // Now process each subpath
  subpaths.forEach(subpath => {
    // For each subpath, we'll build spline control points and polyline points
    let currentX, currentY;
    let polylinePoints = [];
    let currentCmd;

    // Process the commands in this subpath
    for (let i = 0; i < subpath.commands.length; i++) {
      currentCmd = subpath.commands[i];
      const command = currentCmd[0];
      const values = currentCmd.slice(1);

      switch (command) {
        case 'M': // moveTo
          currentX = values[0] + offsetX;
          currentY = -(values[1] + offsetY); // Flip Y coordinate for DXF
          polylinePoints = [[currentX, currentY]];
          break;

        case 'L': // lineTo
          currentX = values[0] + offsetX;
          currentY = -(values[1] + offsetY); // Flip Y coordinate for DXF
          polylinePoints.push([currentX, currentY]);
          break; case 'C': { // bezierCurveTo - convert to DXF arc for better representation (except for text)
            const cp1x = values[0] + offsetX;
            const cp1y = -(values[1] + offsetY); // Flip Y coordinate for DXF
            const cp2x = values[2] + offsetX;
            const cp2y = -(values[3] + offsetY); // Flip Y coordinate for DXF
            const endX = values[4] + offsetX;
            const endY = -(values[5] + offsetY); // Flip Y coordinate for DXF

            // If we have accumulated polyline points, draw them first
            if (polylinePoints.length > 1) {
              dxf.drawPolyline(polylinePoints, false);
              // Start new polyline with the endpoint of the existing one
              polylinePoints = [[polylinePoints[polylinePoints.length - 1][0], polylinePoints[polylinePoints.length - 1][1]]];
            }

            // For text objects, use splines directly without arc conversion
            if (pathObj.objectType === 'text') {
              const cubicControlPoints = [
                [currentX, currentY],   // Start point
                [cp1x, cp1y],          // First control point
                [cp2x, cp2y],          // Second control point
                [endX, endY]           // End point
              ];
              dxf.drawSpline(cubicControlPoints, 3);
            } else {
              // For non-text objects, try to convert cubic Bézier curve to arc parameters
              const arcParams = cubicBezierToArc(currentX, currentY, cp1x, cp1y, cp2x, cp2y, endX, endY);

              if (arcParams) {
                // Draw as arc if conversion is successful
                dxf.drawArc(arcParams.centerX, arcParams.centerY, arcParams.radius, arcParams.startAngle, arcParams.endAngle);
              } else {
                // Fallback to spline if curve cannot be approximated as arc
                const cubicControlPoints = [
                  [currentX, currentY],   // Start point
                  [cp1x, cp1y],          // First control point
                  [cp2x, cp2y],          // Second control point
                  [endX, endY]           // End point
                ];
                dxf.drawSpline(cubicControlPoints, 3);
              }
            }

            // Update current position
            currentX = endX;
            currentY = endY;

            // Continue the polyline from here
            polylinePoints = [[currentX, currentY]];
            break;
          }

        case 'Q': { // quadraticCurveTo - use spline for better representation
          const qCpx = values[0] + offsetX;
          const qCpy = -(values[1] + offsetY); // Flip Y coordinate for DXF
          const qEndX = values[2] + offsetX;
          const qEndY = -(values[3] + offsetY); // Flip Y coordinate for DXF

          // If we have accumulated polyline points, draw them first
          if (polylinePoints.length > 1) {
            dxf.drawPolyline(polylinePoints, false);
            // Start new polyline with the endpoint of the existing one
            polylinePoints = [[polylinePoints[polylinePoints.length - 1][0], polylinePoints[polylinePoints.length - 1][1]]];
          }

          // Create control points for a quadratic spline (degree 2)
          const quadraticControlPoints = [
            [currentX, currentY],  // Start point
            [qCpx, qCpy],          // Control point
            [qEndX, qEndY]         // End point
          ];

          // Draw the spline
          dxf.drawSpline(quadraticControlPoints, 2);

          // Update current position
          currentX = qEndX;
          currentY = qEndY;

          // Continue the polyline from here
          polylinePoints = [[currentX, currentY]];
          break;
        }

        case 'Z': // closePath
          // If we have a first point and it's different from current position,
          // add it to close the path
          if (subpath.firstPoint &&
            (subpath.firstPoint[0] !== currentX || subpath.firstPoint[1] !== currentY)) {
            polylinePoints.push([subpath.firstPoint[0], subpath.firstPoint[1]]);
          }
          break;
      }
    }

    // Draw any remaining polyline points
    if (polylinePoints.length > 1) {
      dxf.drawPolyline(polylinePoints, subpath.closed);
    }

    // Close the path if it was marked as closed
    if (polylinePoints && polylinePoints.length > 0) {

      if (polylinePoints[[polylinePoints.length - 1]][0] !== subpath.firstPoint[0] ||
        polylinePoints[[polylinePoints.length - 1]][1] !== subpath.firstPoint[1]) {
        dxf.drawPolyline([polylinePoints[polylinePoints.length - 1], subpath.firstPoint], false);
      }
    }
  });
}

// Helper method to transform a path based on parent position
function transformPath(pathObj, parentLeft, parentTop) {
  const path = pathObj.path.slice();

  // Calculate absolute position of the path in the canvas
  // Extract all x,y coordinates from all command types
  let coordinates = [];
  path.forEach(cmd => {
    if (cmd.length >= 3 && cmd[1] !== undefined && cmd[2] !== undefined) {
      // Handle M and L commands
      coordinates.push({ x: cmd[1], y: cmd[2] });
    }

    if (cmd[0] === 'C' && cmd.length >= 7) {
      // Handle Bézier curve control points
      coordinates.push({ x: cmd[1], y: cmd[2] }); // First control point
      coordinates.push({ x: cmd[3], y: cmd[4] }); // Second control point
      coordinates.push({ x: cmd[5], y: cmd[6] }); // End point
    }

    if (cmd[0] === 'Q' && cmd.length >= 5) {
      // Handle quadratic curve control points
      coordinates.push({ x: cmd[1], y: cmd[2] }); // Control point
      coordinates.push({ x: cmd[3], y: cmd[4] }); // End point
    }
  });

  // Find minimum x and y from all collected coordinates
  const minX = coordinates.length > 0 ? Math.min(...coordinates.map(p => p.x)) : 0;
  const minY = coordinates.length > 0 ? Math.min(...coordinates.map(p => p.y)) : 0;

  const absLeft = parentLeft + pathObj.left - minX;
  const absTop = parentTop + pathObj.top - minY;

  // Apply transformations directly to path commands
  const transformedPath = {
    type: 'path',
    path: []
  };

  for (let i = 0; i < path.length; i++) {
    const command = path[i][0];
    const values = path[i].slice(1);

    switch (command) {
      case 'M': // moveTo
        if (i !== 0) {
          transformedPath.path.push(['Z']);
        }
        transformedPath.path.push([
          command,
          absLeft + values[0],
          absTop + values[1]
        ]);
        break;
      case 'L': // lineTo
        transformedPath.path.push([
          command,
          absLeft + values[0],
          absTop + values[1]
        ]);
        break;

      case 'C': // bezierCurveTo
        transformedPath.path.push([
          command,
          absLeft + values[0],
          absTop + values[1],
          absLeft + values[2],
          absTop + values[3],
          absLeft + values[4],
          absTop + values[5]
        ]);
        break;

      case 'Q': // quadraticCurveTo
        transformedPath.path.push([
          command,
          absLeft + values[0],
          absTop + values[1],
          absLeft + values[2],
          absTop + values[3]
        ]);
        break;

      case 'Z': // closePath
        transformedPath.path.push([command]);
        break;

      default:
        transformedPath.path.push(path[i].slice());
        break;
    }
  }

  return transformedPath;
}

function isClockwise(path) {
  // Calculate the area of the path to determine if it's clockwise or counterclockwise
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i].slice(1);
    const [x2, y2] = path[i + 1].slice(1);
    total += (x2 - x1) * (y2 + y1);
  }
  return total > 0;
}
// Helper function to convert cubic Bézier curve to arc parameters
function cubicBezierToArc(startX, startY, cp1x, cp1y, cp2x, cp2y, endX, endY) {
  // For a cubic Bézier to represent a circular arc, the control points must satisfy specific conditions
  // This function attempts to detect and convert such cases

  // Check if this could be a circular arc by examining control point relationships
  // For a circular arc, the control points should be tangent to the circle at start/end points

  // Calculate tangent vectors at start and end points
  const startTangentX = cp1x - startX;
  const startTangentY = cp1y - startY;
  const endTangentX = cp2x - endX;
  const endTangentY = cp2y - endY;

  // Normalize tangent vectors
  const startTangentLen = Math.sqrt(startTangentX * startTangentX + startTangentY * startTangentY);
  const endTangentLen = Math.sqrt(endTangentX * endTangentX + endTangentY * endTangentY);

  if (startTangentLen < 1e-6 || endTangentLen < 1e-6) return null;

  const startTangentNormX = startTangentX / startTangentLen;
  const startTangentNormY = startTangentY / startTangentLen;
  const endTangentNormX = endTangentX / endTangentLen;
  const endTangentNormY = endTangentY / endTangentLen;

  // For a circular arc, find center by intersecting perpendiculars to tangents
  // Perpendicular to start tangent (normal vector)
  const startNormalX = -startTangentNormY;
  const startNormalY = startTangentNormX;

  // Perpendicular to end tangent (normal vector)  
  const endNormalX = -endTangentNormY;
  const endNormalY = endTangentNormX;

  // Find intersection of two lines:
  // Line 1: start point + t1 * start_normal
  // Line 2: end point + t2 * end_normal

  // Solve: startX + t1 * startNormalX = endX + t2 * endNormalX
  //        startY + t1 * startNormalY = endY + t2 * endNormalY

  const det = startNormalX * endNormalY - startNormalY * endNormalX;

  // If lines are parallel, not a valid arc
  if (Math.abs(det) < 1e-6) return null;

  const dx = endX - startX;
  const dy = endY - startY;

  const t1 = (dx * endNormalY - dy * endNormalX) / det;

  // Calculate center point
  const centerX = startX + t1 * startNormalX;
  const centerY = startY + t1 * startNormalY;

  // Calculate radius from center to start point
  const radius = Math.sqrt((startX - centerX) * (startX - centerX) + (startY - centerY) * (startY - centerY));

  // Verify end point is at same distance (should be for a true arc)
  const endRadius = Math.sqrt((endX - centerX) * (endX - centerX) + (endY - centerY) * (endY - centerY));
  const radiusTolerance = radius * 0.05; // 5% tolerance

  if (Math.abs(radius - endRadius) > radiusTolerance) {
    return null; // Not a good arc approximation
  }

  // Additional validation: check if control points are roughly at the right distance
  // For a circular arc, control points should be at distance ≈ radius * k where k depends on arc angle
  const cp1Dist = Math.sqrt((cp1x - centerX) * (cp1x - centerX) + (cp1y - centerY) * (cp1y - centerY));
  const cp2Dist = Math.sqrt((cp2x - centerX) * (cp2x - centerX) + (cp2y - centerY) * (cp2y - centerY));

  // For small arcs (< 90°), control points should be close to the circle
  // For larger arcs, they can be further out
  const maxControlDist = radius * 2; // Allow some flexibility

  if (cp1Dist > maxControlDist || cp2Dist > maxControlDist) {
    return null; // Control points too far from expected positions
  }
  // Calculate start and end angles
  let startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
  let endAngle = Math.atan2(endY - centerY, endX - centerX) * 180 / Math.PI;

  // Determine arc direction by checking which way the curve bends
  // Sample the curve at multiple points to ensure correct direction
  const sampleT1 = 0.25;
  const sampleT2 = 0.75;

  const sampleX1 = Math.pow(1 - sampleT1, 3) * startX + 3 * Math.pow(1 - sampleT1, 2) * sampleT1 * cp1x +
    3 * (1 - sampleT1) * Math.pow(sampleT1, 2) * cp2x + Math.pow(sampleT1, 3) * endX;
  const sampleY1 = Math.pow(1 - sampleT1, 3) * startY + 3 * Math.pow(1 - sampleT1, 2) * sampleT1 * cp1y +
    3 * (1 - sampleT1) * Math.pow(sampleT1, 2) * cp2y + Math.pow(sampleT1, 3) * endY;

  const sampleX2 = Math.pow(1 - sampleT2, 3) * startX + 3 * Math.pow(1 - sampleT2, 2) * sampleT2 * cp1x +
    3 * (1 - sampleT2) * Math.pow(sampleT2, 2) * cp2x + Math.pow(sampleT2, 3) * endX;
  const sampleY2 = Math.pow(1 - sampleT2, 3) * startY + 3 * Math.pow(1 - sampleT2, 2) * sampleT2 * cp1y +
    3 * (1 - sampleT2) * Math.pow(sampleT2, 2) * cp2y + Math.pow(sampleT2, 3) * endY;

  const sampleAngle1 = Math.atan2(sampleY1 - centerY, sampleX1 - centerX) * 180 / Math.PI;
  const sampleAngle2 = Math.atan2(sampleY2 - centerY, sampleX2 - centerX) * 180 / Math.PI;

  // Helper function to normalize angle to [-180, 180]
  const normalizeAngle = (angle) => {
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    return angle;
  };

  // Calculate angular progression to determine direction
  const diff1 = normalizeAngle(sampleAngle1 - startAngle);
  const diff2 = normalizeAngle(sampleAngle2 - sampleAngle1);
  const diff3 = normalizeAngle(endAngle - sampleAngle2);

  // Check if angles progress consistently in one direction
  const clockwise = (diff1 < 0 && diff2 < 0 && diff3 < 0);
  const counterClockwise = (diff1 > 0 && diff2 > 0 && diff3 > 0);

  // DXF arcs are always drawn counter-clockwise
  // If the original curve is clockwise, we need to swap start and end angles
  let finalStartAngle = startAngle;
  let finalEndAngle = endAngle;

  if (clockwise) {
    // Swap angles for clockwise curves to make DXF draw them correctly
    finalStartAngle = endAngle;
    finalEndAngle = startAngle;
  } else if (!counterClockwise) {
    // If direction is ambiguous, check total angular span and choose shorter arc
    let totalSpan = normalizeAngle(endAngle - startAngle);

    if (totalSpan < 0) {
      // Original direction is clockwise, swap angles
      finalStartAngle = endAngle;
      finalEndAngle = startAngle;
    }
    // If totalSpan > 0, keep original order (counter-clockwise)
  }

  // Ensure final angles are in [0, 360) range for DXF
  if (finalStartAngle < 0) finalStartAngle += 360;
  if (finalEndAngle < 0) finalEndAngle += 360;

  // Helper function to round to 3 decimal places or integer if no meaningful decimals
  const smartRound = (value) => {
    const rounded = Math.round(value * 1000) / 1000;
    return rounded % 1 === 0 ? Math.round(rounded) : rounded;
  };

  return {
    centerX: smartRound(centerX),
    centerY: smartRound(centerY),
    radius: smartRound(radius),
    startAngle: finalStartAngle,
    endAngle: finalEndAngle
  };
}

function calculatePathUnion(pathObjects) {
  if (!pathObjects || !Array.isArray(pathObjects) || pathObjects.length === 0) {
    return null;
  }

  try {
    let pathObjUnion = null;

    for (let pathObj of pathObjects) {
      if (!pathObj || !pathObj.path || !Array.isArray(pathObj.path)) {
        continue;
      }

      // Split the path array by 'Z' to get individual chunks for this path object
      const chunks = [];
      let subtractChunks = [];
      let currentChunk = [];

      for (let i = 0; i < pathObj.path.length; i++) {
        const command = pathObj.path[i];
        currentChunk.push(command);

        if (command[0] === 'Z' || command === 'Z') {
          if (currentChunk.length > 1) { // Only add non-empty chunks
            chunks.push(currentChunk);
          }
          currentChunk = [];
        }
      }

      // Add any remaining chunk
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      // Convert each chunk to a Paper.js path and unite them within this path object
      for (let chunk of chunks) {
        // Convert chunk to path string
        const pathString = chunk.map(cmd => {
          if (Array.isArray(cmd)) {
            return cmd.join(' ');
          }
          return cmd;
        }).join(' ');

        // Create Paper.js path
        const paperPath = new paper.Path(pathString);
        if (!paperPath.closed) {
          paperPath.closed = true; // Ensure the path is closed for union operations
        }

        if (!pathObjUnion) {
          pathObjUnion = paperPath;
        } else if (paperPath.clockwise) {
          pathObjUnion = pathObjUnion.unite(paperPath);
        } else {
          subtractChunks.push(paperPath);
        }
      }

      if (subtractChunks.length > 0) {
        // If there are subtract chunks, subtract them from the union path
        for (let subPath of subtractChunks) {
          pathObjUnion = pathObjUnion.subtract(subPath);
        }
      }

    }

    if (!pathObjUnion) {
      return null;
    }      
    // Convert back to path array format
    const resultPath = [];
    const pathData = pathObjUnion.pathData;

    if (pathData) {
      // Parse SVG path data string into array format
      const commands = pathData.match(/[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g);
      let currentX = 0, currentY = 0;
      for (let command of commands) {
        const type = command[0];
        const coords = command.slice(1).trim().split(/[\s,]+/).filter(n => n !== '').map(parseFloat);

        switch (type) {
          case 'M':
            currentX = coords[0];
            currentY = coords[1];
            resultPath.push(['M', currentX, currentY]);
            break;
          case 'm':
            currentX += coords[0];
            currentY += coords[1];
            resultPath.push(['M', currentX, currentY]);
            break;
          case 'L':
            currentX = coords[0];
            currentY = coords[1];
            resultPath.push(['L', currentX, currentY]);
            break;
          case 'l':
            const newX = currentX + coords[0];
            const newY = currentY + coords[1];
            resultPath.push(['L', newX, newY]);
            currentX = newX;
            currentY = newY;
            break;
          case 'H':
            currentX = coords[0];
            resultPath.push(['L', currentX, currentY]);
            break;
          case 'h':
            currentX += coords[0];
            resultPath.push(['L', currentX, currentY]);
            break;
          case 'V':
            currentY = coords[0];
            resultPath.push(['L', currentX, currentY]);
            break;
          case 'v':
            currentY += coords[0];
            resultPath.push(['L', currentX, currentY]);
            break;
          case 'C':
            currentX = coords[4];
            currentY = coords[5];
            resultPath.push(['C', coords[0], coords[1], coords[2], coords[3], coords[4], coords[5]]);
            break;
          case 'c':
            const cp1X = currentX + coords[0];
            const cp1Y = currentY + coords[1];
            const cp2X = currentX + coords[2];
            const cp2Y = currentY + coords[3];
            const endX = currentX + coords[4];
            const endY = currentY + coords[5];
            resultPath.push(['C', cp1X, cp1Y, cp2X, cp2Y, endX, endY]);
            currentX = endX;
            currentY = endY;
            break;
          case 'Z':
          case 'z':
            resultPath.push(['Z']);
            break;
        }
      }
    }
    return {
      type: 'path',
      path: resultPath,
      objectType: pathObjects[0]?.objectType // Preserve objectType from input paths
    };

  } catch (error) {
    return null;
  }
}

export {
  collectPathObjects,
  collectNestedPathObjects,
  convertRectToPath,
  processPathForDXF,
  transformPath,
  isClockwise,
  cubicBezierToArc,
  calculatePathUnion,
};