const routeMapTemplate = {
    'Arrow': {
        path: [{
            'vertex': [
                { x: -2, y: 2, label: 'V1', start: 1 },
                { x: 0, y: 0, label: 'V2', start: 0 },
                { x: 2, y: 2, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Butt': {
        path: [{
            'vertex': [
                { x: -2, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: 2, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }],
    },
    'Root': {
        path: [{
            'vertex': [
                { x: 2, y: 24, label: 'V1', start: 1 },
                { x: -2, y: 24, label: 'V2', start: 0 },
            ], 'arcs': []
        }],
    },
}

function routeButtTemplate(xHeight, width, angle, start_pt, endX = null, endY = null) {
    let Butt = {
        path: [{
            'vertex': [
                { x: -width/2, y: 0, label: 'V1', start: 0 },
                { x: 0, y: 0, label: 'V2', start: 1 },
                { x: width/2, y: 0, label: 'V3', start: 0 },
            ], 'arcs': []
        }]
    }
    calculateTransformedPoints(Butt, { x:start_pt.x, y:start_pt.y, angle })
    calcSymbol(Butt, xHeight)

}