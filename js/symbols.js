function calcSymbol(type, length) {

    const symbols = {
        'TestTriangle': [{
            'vertex': [ // TPDM Diagram 3.5.5.12
                { x: 0, y: 0, label: 'V1', radius: 50, start: 1 },
                { x: 300, y: 0, label: 'V2', radius: 50, start: 0 },
                { x: 300, y: 600, label: 'V3', radius: 50, start: 0 },
                { x: 0, y: 600, label: 'V3', radius: 50, start: 0 },
            ], 'arcs': []
        },],

        'StackArrow': [{
            'vertex': [ // TPDM Diagram 3.5.5.12
                { x: 0, y: 0, label: 'V1', start: 1 },
                { x: length * 4, y: length * 4, label: 'V2', start: 0 },
                { x: length * 4, y: length * 8, label: 'V3', start: 0 },
                { x: length * 4 / 3, y: length * 16 / 3, label: 'V4', start: 0 },
                { x: length * 4 / 3, y: length * 16, label: 'V5', start: 0 },
                { x: - length * 4 / 3, y: length * 16, label: 'V6', start: 0 },
                { x: - length * 4 / 3, y: length * 16 / 3, label: 'V7', start: 0 },
                { x: - length * 4, y: length * 8, label: 'V8', start: 0 },
                { x: - length * 4, y: length * 4, label: 'V9', start: 0 },
            ], 'arcs': []
        },],

        'GantryArrow': [{
            'vertex': [ // TPDM Diagram 3.5.6.4
                { x: 0, y: 0, label: 'V1', start: 1                         },
                { x: length * 3, y: 0, label: 'V2', start: 0                },
                { x: length * 3, y: length * 4, label: 'V3', start: 0       },
                { x: length * 9, y: length * 4, label: 'V4', start: 0       },
                { x: 0, y: length * 8, label: 'V5', start: 0                },
                { x: - length * 9, y: length * 4, label: 'V6', start: 0     },
                { x: - length * 3, y: length * 4, label: 'V7', start: 0     },
                { x: - length * 3, y: length * 0, label: 'V8', start: 0     },
            ], 'arcs': []
        },],

        'Tunnel': [{
            'vertex': [ // TPDM Diagram 3.5.7.7
                { x: 0, y: 0, label: 'V1' , start: 1 },
                { x: length * 4, y: 0, label: 'V2' , start: 0 },
                { x: length * 9, y: length * 5, label: 'V3' , start: 0 },
                { x: length * 9, y: length * 16, label: 'V4' , start: 0 },
                { x: - length * 9, y: length * 16, label: 'V5' , start: 0 },
                { x: - length * 9, y: length * 5, label: 'V6' , start: 0 },
                { x: - length * 4, y: 0, label: 'V7' , start: 0 },
            ], 'arcs': []
        },
        {
            'vertex': [ 
                { x: -length * 5.25, y: length * 13, label: 'V9' , start: 1 },
                { x: length * 5.25, y: length * 13, label: 'V8' , start: 0 },
                //{ x: length * 5.25, y: length * 13, label: 'V10' , start: 0 },
            ], 'arcs': [{start:'V9', end:'V8', radius: 6.5 * length, direction :0}]
        },
    ],
    }

    return symbols[type]
}