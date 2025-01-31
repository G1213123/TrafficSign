const symbolsTemplate = {
  //'TestTriangle': [{
  //  'vertex': [
  //    { x: 0, y: 0, label: 'V1', radius: 50, start: 1 },
  //    { x: 300, y: 0, label: 'V2', radius: 50, start: 0 },
  //    { x: 300, y: 600, label: 'V3', radius: 50, start: 0 },
  //    { x: 0, y: 600, label: 'V3', radius: 50, start: 0 },
  //  ], 'arcs': []
  //}],

  'StackArrow': {
    path: [{
      'vertex': [
        { x: 0, y: 0, label: 'V1', start: 1 },
        { x: 4, y: 4, label: 'V2', start: 0 },
        { x: 4, y: 8, label: 'V3', start: 0 },
        { x: 4 / 3, y: 16 / 3, label: 'V4', start: 0 },
        { x: 4 / 3, y: 16, label: 'V5', start: 0 },
        { x: -4 / 3, y: 16, label: 'V6', start: 0 },
        { x: -4 / 3, y: 16 / 3, label: 'V7', start: 0 },
        { x: -4, y: 8, label: 'V8', start: 0 },
        { x: -4, y: 4, label: 'V9', start: 0 },
      ], 'arcs': []
    }],
  },

  'GantryArrow': {
    path: [{
      'vertex': [
        { x: 0, y: 0, label: 'V1', start: 1 },
        { x: 3, y: 0, label: 'V2', start: 0 },
        { x: 3, y: 4, label: 'V3', start: 0 },
        { x: 9, y: 4, label: 'V4', start: 0 },
        { x: 0, y: 8, label: 'V5', start: 0 },
        { x: -9, y: 4, label: 'V6', start: 0 },
        { x: -3, y: 4, label: 'V7', start: 0 },
        { x: -3, y: 0, label: 'V8', start: 0 },
      ], 'arcs': []
    }],
  },

  'Tunnel': {
    path: [ // 3.5.7.7
      {
        'vertex': [
          { x: 0, y: 0, label: 'V1', start: 1 },
          { x: 4, y: 0, label: 'V2', start: 0 },
          { x: 9, y: 5, label: 'V3', start: 0 },
          { x: 9, y: 16, label: 'V4', start: 0 },
          { x: -9, y: 16, label: 'V5', start: 0 },
          { x: -9, y: 5, label: 'V6', start: 0 },
          { x: -4, y: 0, label: 'V7', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -5.25, y: 13, label: 'V8', start: 1 },
          { x: 5.25, y: 13, label: 'V9', start: 0 },
        ], 'arcs': [{ start: 'V9', end: 'V8', radius: 6.5, direction: 0, sweep: 1 }]
      },
    ],
  },

  'Expressway': {
    path: [ // Diagram 3.5.7.11
      {
        'vertex': [
          { x: 0, y: 0, label: 'V1', start: 1 },
          { x: 4.5, y: 0, label: 'V2', radius: 0.75, start: 0 },
          { x: 4.5, y: 9, label: 'V3', radius: 0.75, start: 0 },
          { x: -4.5, y: 9, label: 'V4', radius: 0.75, start: 0 },
          { x: -4.5, y: 0, label: 'V5', radius: 0.75, start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0, y: 0.25, label: 'V6', start: 1 },
          { x: -4.25, y: 0.25, label: 'V7', radius: 0.5, start: 0 },
          { x: -4.25, y: 8.75, label: 'V8', radius: 0.5, start: 0 },
          { x: 4.25, y: 8.75, label: 'V9', radius: 0.5, start: 0 },
          { x: 4.25, y: 0.25, label: 'V10', radius: 0.5, start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0.25, y: 1.25, label: 'V11', start: 1 },
          { x: 0.75, y: 1.25, label: 'V12', start: 0 },
          { x: 0.972, y: 2.75, label: 'V13', start: 0 },
          { x: 0.25, y: 2.75, label: 'V14', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -0.25, y: 1.25, label: 'V15', start: 1 },
          { x: -0.25, y: 2.75, label: 'V16', start: 0 },
          { x: -0.972, y: 2.75, label: 'V17', start: 0 },
          { x: -0.75, y: 1.25, label: 'V18', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0, y: 3.25, label: 'V19', start: 1 },
          { x: 3.5, y: 3.25, label: 'V20', start: 0 },
          { x: 3.5, y: 3.75, label: 'V21', start: 0 },
          { x: 2.75, y: 3.75, label: 'V22', radius: 0.25, start: 0 },
          { x: 2.75, y: 4.75, label: 'V23', start: 0 },
          { x: 2.25, y: 4.75, label: 'V24', start: 0 },
          { x: 2, y: 3.75, label: 'V25', radius: 0.25, start: 0 },
          { x: -2, y: 3.75, label: 'V26', radius: 0.25, start: 0 },
          { x: -2.25, y: 4.75, label: 'V27', start: 0 },
          { x: -2.75, y: 4.75, label: 'V28', start: 0 },
          { x: -2.75, y: 3.75, label: 'V29', radius: 0.25, start: 0 },
          { x: -3.5, y: 3.75, label: 'V30', start: 0 },
          { x: -3.5, y: 3.25, label: 'V31', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0.25, y: 4.25, label: 'V32', start: 1 },
          { x: 1.194, y: 4.25, label: 'V33', start: 0 },
          { x: 1.5, y: 8, label: 'V34', start: 0 },
          { x: 0.25, y: 8, label: 'V35', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -0.25, y: 4.25, label: 'V36', start: 1 },
          { x: -0.25, y: 8, label: 'V371', start: 0 },
          { x: -1.5, y: 8, label: 'V38', start: 0 },
          { x: -1.194, y: 4.25, label: 'V39', start: 0 },
        ], 'arcs': []
      },
    ],
  },

  'Airport': {
    path: [ // 3.5.7.14
      {
        'vertex': [
          { x: 0, y: 0, label: 'V1', start: 1 },
          { x: 1.27, y: 2.924, label: 'V2', start: 0 },
          { x: 1.27, y: 6.5, label: 'V3', start: 0 },
          { x: 9, y: 11, label: 'V4', radius: 0.5, start: 0 },
          { x: 9, y: 13, label: 'V5', radius: 0.5, start: 0 },
          { x: 2.5, y: 11, label: 'V6', start: 0 },
          { x: 1.25, y: 11, label: 'V7', start: 0 },
          { x: 1.25, y: 11.5, label: 'V8', start: 0 },
          { x: 0.75, y: 15.5, label: 'V9', start: 0 },
          { x: 4, y: 16.5, label: 'V10', radius: 0.5, start: 0 },
          { x: 4, y: 18, label: 'V11', radius: 0.5, start: 0 },
          // mirror
          { x: -4, y: 18, label: 'V12', radius: 0.5, start: 0 },
          { x: -4, y: 16.5, label: 'V13', radius: 0.5, start: 0 },
          { x: -0.75, y: 15.5, label: 'V14', start: 0 },
          { x: -1.25, y: 11.5, label: 'V15', start: 0 },
          { x: -1.25, y: 11, label: 'V16', start: 0 },
          { x: -2.5, y: 11, label: 'V17', start: 0 },
          { x: -9, y: 13, label: 'V18', radius: 0.5, start: 0 },
          { x: -9, y: 11, label: 'V19', radius: 0.5, start: 0 },
          { x: -1.27, y: 6.5, label: 'V20', start: 0 },
          { x: -1.27, y: 2.924, label: 'V21', start: 0 },
        ], 'arcs': [
          { start: 'V1', end: 'V2', radius: 4, direction: 1, sweep: 0 },
          { start: 'V21', end: 'V1', radius: 4, direction: 1, sweep: 0 },
        ]
      },
    ],
  },

  'CHT': {
    path: [ // 3.5.7.7
      {
        'vertex': [
          { x: 0, y: 0, label: 'V1', radius: 1.5, start: 1 },
          { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0 },
          { x: 11, y: 16, label: 'V3', radius: 1.5, start: 0 },
          { x: -11, y: 16, label: 'V4', radius: 1.5, start: 0 },
          { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0, y: 1, label: 'V1', radius: 0.5, start: 1 },
          { x: -10, y: 1, label: 'V2', radius: 0.5, start: 0 },
          { x: -10, y: 15, label: 'V3', radius: 0.5, start: 0 },
          { x: 10, y: 15, label: 'V4', radius: 0.5, start: 0 },
          { x: 10, y: 1, label: 'V5', radius: 0.5, start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0, y: 6, label: 'V1', start: 1 },
          { x: 2, y: 6, label: 'V2', start: 0 },
          { x: 4.5, y: 8.5, label: 'V3', start: 0 },
          { x: 4.5, y: 14, label: 'V4', start: 0 },
          { x: -4.5, y: 14, label: 'V5', start: 0 },
          { x: -4.5, y: 8.5, label: 'V6', start: 0 },
          { x: -2, y: 6, label: 'V7', start: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -2.625, y: 12.5, label: 'V8', start: 1 },
          { x: 2.625, y: 12.5, label: 'V9', start: 0 },
        ], 'arcs': [{ start: 'V9', end: 'V8', radius: 3.25, direction: 0, sweep: 1 }]
      },
    ],
      },

};

function calcSymbol(type, length) {
  const symbols = JSON.parse(JSON.stringify(symbolsTemplate)); // Deep copy to avoid mutation

  symbols[type].path.forEach(path => {
    path.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.y *= length;
      if (vertex.radius) vertex.radius *= length;
    });
    path.arcs.forEach(arc => {
      arc.radius *= length;
    });
  });

  if (symbols[type].text){
    symbols[type].text.forEach(t =>{
      t.x *= length;
      t.y *= length;
      t.fontSize *= length;
    }
    )
  }

  return symbols[type];
}

function getInsertOffset(shapeMeta, angle = 0) {
  shapeMeta.path.map((p) => {
    let transformed = calculateTransformedPoints(p.vertex, {
      x: 0,
      y: 0,
      angle: angle
    });
    p.vertex = transformed
  });

  const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
  const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));
  return { left: vertexleft, top: vertextop }
}

// Convert shapeMeta.vertex points to SVG path string with circular trims
function vertexToPath(shapeMeta) {
  let pathString = '';

  shapeMeta.forEach((path, pathindex) => {
    if (pathindex != 0) {
      pathString += ' Z'
    }

    for (let i = 0; i < path.vertex.length; i++) {
      const current = path.vertex[i];
      const next = path.vertex[(i + 1) % path.vertex.length];
      const previous = path.vertex.at(i - 1);
      const prevArc = path.arcs.find(arc => (arc.end == current.label))

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

      } else if (prevArc && !current.start) {
        pathString += ` A ${prevArc.radius} ${prevArc.radius} 0 ${prevArc.sweep} ${prevArc.direction} ${current.x} ${current.y} `
      } else {
        // Line to the next point
        pathString += ` ${current.start ? 'M' : 'L'} ${current.x} ${current.y}`;
      }
      //if (next.start){
      //  pathString += ' Z'
      //}
    }

    // Handle the last corner (which is also the first corner)
    const first = path.vertex[0];
    const second = path.vertex[1];
    const last = path.vertex.at(-1);
    const finalArc = path.arcs.find(arc => (arc.start == last.label))
    if (first.radius) {
      // Calculate the exterior angle θ
      const angle = calculateAngle(last, first, second);

      // Calculate the offset distance d = r × tan(θ/2)
      const offsetDistance = first.radius * Math.tan(angle / 2);

      // Calculate the tangent points for the arc
      const prevTangent = calculateTangentPoint(last, first, offsetDistance);
      const nextTangent = calculateTangentPoint(second, first, offsetDistance);

      // Determine the arc direction (clockwise or counterclockwise)
      const arcDirection = getArcDirection(last, first, second);

      // Line to the start of the arc
      pathString += ` L ${prevTangent.x} ${prevTangent.y}`;
    } else if (finalArc) {
      let arcEnd = path.vertex.find(v => v.label = finalArc.end)
      pathString += ` A ${finalArc.radius} ${finalArc.radius} 0 ${finalArc.sweep} ${finalArc.direction} ${arcEnd.x} ${arcEnd.y} `
    } else {
      // Line to the first point
      pathString += ` L ${first.x} ${first.y}`;
    }

    //pathString += ' Z'; // Close the path
  })
  return pathString;
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