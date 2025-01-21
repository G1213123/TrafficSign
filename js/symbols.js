const symbolsTemplate = {
  //'TestTriangle': [{
  //  'vertex': [
  //    { x: 0, y: 0, label: 'V1', radius: 50, start: 1 },
  //    { x: 300, y: 0, label: 'V2', radius: 50, start: 0 },
  //    { x: 300, y: 600, label: 'V3', radius: 50, start: 0 },
  //    { x: 0, y: 600, label: 'V3', radius: 50, start: 0 },
  //  ], 'arcs': []
  //}],

  'StackArrow': [{
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

  'GantryArrow': [{
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

  'Tunnel': [
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
};

function calcSymbol(type, length) {
  const symbols = JSON.parse(JSON.stringify(symbolsTemplate)); // Deep copy to avoid mutation

  symbols[type].forEach(path => {
    path.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.y *= length;
      if (vertex.radius) vertex.radius *= length;
    });
    path.arcs.forEach(arc => {
      arc.radius *= length;
    });
  });

  return symbols[type];
}

// Convert shapeMeta.vertex points to SVG path string with circular trims
function vertexToPath(shapeMeta) {
    let pathString = '';

    shapeMeta.forEach((path,pathindex) =>{

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
          if (pathindex != 0){
            pathString += ' Z'
          }
          pathString += ` ${current.start?'M':'L'} ${prevTangent.x} ${prevTangent.y}`;
  
          // Arc to the end of the arc
  
            pathString += ` A ${current.radius} ${current.radius} 0 0 ${1 - arcDirection} ${nextTangent.x} ${nextTangent.y}`
  
        } else if (prevArc && !current.start){
          let arcEnd = path.vertex.find(v => v.label = prevArc.start)
          pathString += `A ${prevArc.radius} ${prevArc.radius} 0 ${prevArc.sweep} ${prevArc.direction} ${arcEnd.x} ${arcEnd.y} `
        } else {
          // Line to the next point
          pathString += ` ${current.start?'M':'L'} ${current.x} ${current.y}`;
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
      } else if (finalArc){
        let arcEnd = path.vertex.find(v => v.label = finalArc.end)
        pathString += ` A ${finalArc.radius} ${finalArc.radius} 0 ${finalArc.sweep} ${finalArc.direction} ${arcEnd.x} ${arcEnd.y} `
      } else {
        // Line to the first point
        pathString += ` L ${first.x} ${first.y}`;
      }
  
      pathString += ' Z'; // Close the path
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
    const offsetX = Math.round(offsetDistance * Math.cos(angle) * 100)/100;
    const offsetY = Math.round(offsetDistance * Math.sin(angle) * 100)/100;
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