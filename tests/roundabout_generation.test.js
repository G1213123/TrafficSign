
import { calcRoundaboutVertices } from '../js/objects/mainRoute.js';

// Mock dependencies
jest.mock('../js/objects/routeBase.js', () => ({
    assignVertexLabel: jest.fn((vertexList) => {
        vertexList.forEach((v, i) => v.label = `V${i}`);
    }),
    getSideRoadCoords: jest.fn()
}));

jest.mock('../js/objects/path.js', () => ({
    calculateTransformedPoints: jest.fn((points, transform) => {
        // Simple identity transform for testing, or basic translation
        if (Array.isArray(points)) {
            return points.map(p => ({ ...p, x: p.x + transform.x, y: p.y + transform.y }));
        }
        return points;
    })
}));

jest.mock('../js/objects/symbols.js', () => ({
    calcSymbol: jest.fn((template, length) => {
        // Mock scaling behavior
        const result = JSON.parse(JSON.stringify(template));
        result.path.forEach(p => {
            if (p.centerLine) {
                p.centerLine.forEach(v => {
                    v.x *= length;
                    v.y *= length;
                    if (v.width) v.width *= length;
                });
            }
            if (p.centerArc) {
                p.centerArc.forEach(a => {
                    a.radius *= length;
                });
            }
        });
        return result;
    })
}));

jest.mock('../js/objects/template.js', () => ({
    roundelTemplate: jest.fn((name, length) => {
        if (name.includes('Conventional')) {
            return {
                path: [{
                    vertex: [], // Will be replaced
                    centerLine: [
                        { x: 0, y: 0, label: 'C1', width: 4 },
                        { x: 10, y: 0, label: 'C2', width: 4 }
                    ],
                    centerArc: []
                }]
            };
        }
        return { path: [] };
    })
}));

describe('Roundabout Generation', () => {
    test('should generate vertices from centerline for Conventional Roundabout', () => {
        const xHeight = 4; // length = 1
        const routeList = [
            { shape: 'Normal', roadType: 'Conventional Roundabout' },
            { x: 100, y: 100, length: 1 }
        ];

        const result = calcRoundaboutVertices('Conventional', xHeight, routeList);

        expect(result.path[0].vertex.length).toBeGreaterThan(0);
        
        // Check if vertices are generated around the centerline
        // Centerline is (0,0) to (10,0) scaled by length=1, translated by (100,100)
        // So (100,100) to (110,100). Width is 4.
        // Offset is 2.
        // Expected points:
        // (100, 100+2) = (100, 102)
        // (100, 100-2) = (100, 98)
        // (110, 100+2) = (110, 102)
        // (110, 100-2) = (110, 98)
        
        const vertices = result.path[0].vertex;
        const hasPoint = (x, y) => vertices.some(v => Math.abs(v.x - x) < 0.01 && Math.abs(v.y - y) < 0.01);

        expect(hasPoint(100, 102)).toBe(true); // Left/Right depending on direction
        expect(hasPoint(100, 98)).toBe(true);
        expect(hasPoint(110, 102)).toBe(true);
        expect(hasPoint(110, 98)).toBe(true);
    });
});
