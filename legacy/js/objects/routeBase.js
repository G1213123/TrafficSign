import { roadMapTemplate } from './template.js';
import { calcSymbol } from './symbols.js';
import { calculateTransformedPoints } from './path.js';

/**
 * Assigns labels to route vertices
 * @param {Array} vertexList - List of vertices to label
 * @return {void}
 */
export function assignVertexLabel(vertexList) {
    vertexList.map((vertex, index) => {
        vertex.label = `V${index + 1}`
        vertex.start = index == 0 ? 1 : 0
    })
}

/**
 * Gets coordinates for side road endpoints
 * @param {Object} route - main road object
 * @param {number} length - Route length
 * @param {number} left - Left boundary
 * @param {number} right - Right boundary
 * @return {Array} Array of vertex coordinates
 */
export function getSideRoadCoords(route, length, left, right) {
    let arrowTipPath = JSON.parse(JSON.stringify(roadMapTemplate[route.shape]))
    // Apply vertex and arc scaling to each path
    arrowTipPath.path.forEach((path) => {
        path.vertex.map((v) => { v.x *= route.width / 2; v.y *= route.width / 2; v.radius *= route.width / 2 })
        if (path.arcs) {
            path.arcs.map((a) => { a.radius *= route.width / 2 })
        }
    })
    arrowTipPath = calcSymbol(arrowTipPath, length)
    arrowTipPath.path.map((p) => {
        let transformed = calculateTransformedPoints(p.vertex, {
            x: route.x,
            y: route.y,
            angle: route.angle
        });
        p.vertex = transformed
    });
    let arrowTipVertex = arrowTipPath.path[0].vertex
    if (route.angle != 0 && route.angle != 180) {
        if (route.x < left) {
            const i1 = { x: left, y: arrowTipVertex[0].y - (left - arrowTipVertex[0].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const i2 = { x: left, y: arrowTipVertex[2].y - (left - arrowTipVertex[2].x) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: left, y: i1.y + offsetDistance * length, display: 0 }
            const i3 = { x: left, y: i2.y - offsetDistance * length, display: 0 }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        } else if (route.x > right) {
            const i1 = { x: right, y: arrowTipVertex[0].y + (arrowTipVertex[0].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const i2 = { x: right, y: arrowTipVertex[2].y + (arrowTipVertex[2].x - right) / Math.tan(route.angle / 180 * Math.PI), radius: length, display: 1 }
            const offsetDistance = Math.tan(Math.abs(route.angle * Math.PI / 180) / 2);
            const i0 = { x: right, y: i1.y - offsetDistance * length, display: 0 }
            const i3 = { x: right, y: i2.y + offsetDistance * length, display: 0 }
            arrowTipVertex = [i0, i1, ...arrowTipVertex, i2, i3]
        }
    }

    //assignVertexLabel(arrowTipVertex)
    arrowTipPath.path[0].vertex = arrowTipVertex
    return arrowTipPath
}
