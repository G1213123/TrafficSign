const roadMapTemplate = {
    'Arrow': {
        path: [{
            'vertex': [
                { x: -1, y: 1, label: 'V1', start: 1, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 0, display: 1 },
                { x: 1, y: 1, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }],
    },
    'Stub': {
        path: [{
            'vertex': [
                { x: -1, y: 0, label: 'V1', start: 0, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 1, display: 1 },
                { x: 1, y: 0, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }],
    },
    'Round': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1 }, // to be calculated by function
            ], 'arcs': []
        }],
    },
    'Root': {
        path: [{
            'vertex': [
                { x: 1, y: 24, label: 'V1', start: 1, display: 0 },
                { x: -1, y: 24, label: 'V2', start: 0, display: 0 },
            ], 'arcs': []
        }],
    },
    'UArrow Conventional': {
        path: [{
            'vertex': [
                { x: 6, y: 33.4, label: 'V31', start: 1, display: 1 },
                { x: 8, y: 31.4, label: 'V32', start: 0, display: 0 },
                { x: 8, y: 9.3808, label: 'V33', start: 0, display: 0 },
                { x: 8.3077, y: 8.6592, label: 'V34', start: 0, display: 0 },
                { x: 2.7692, y: 11.6761, label: 'V35', start: 0, display: 0 },
                { x: 4, y: 12.6491, label: 'V36', start: 0, display: 0 },
                { x: 4, y: 31.4, label: 'V37', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V33', end: 'V34', radius: 1, direction: 1, sweep: 0 },
                { start: 'V34', end: 'V35', radius: 12, direction: 1, sweep: 0 },
                { start: 'V35', end: 'V36', radius: 1, direction: 1, sweep: 0 },
            ]
        },],
    },
    'UArrow Spiral': {
        path: [{
            'vertex': [
                { x: 6, y: 35.4, label: 'V31', start: 1, display: 1 },
                { x: 8, y: 33.4, label: 'V32', start: 0, display: 0 },
                { x: 8, y: 15.8745, label: 'V33', start: 0, display: 0 },
                { x: 10.5, y: 9.2601, label: 'V34', start: 0, display: 0 },
                { x: 4.2303, y: 13.3456, label: 'V35', start: 0, display: 0 },
                { x: 4, y: 17.8745, label: 'V36', start: 0, display: 0 },
                { x: 4, y: 33.4, label: 'V37', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V33', end: 'V34', radius: 10, direction: 1, sweep: 0 },
                { start: 'V34', end: 'V35', radius: 14, direction: 1, sweep: 0 },
                { start: 'V35', end: 'V36', radius: 16, direction: 0, sweep: 0 },
            ]
        },
        ],
    },    'Normal Conventional': {
        path: [{
            'vertex': [
                { x: -3, y: 30, label: 'V1', start: 1, display: 1 },
                { x: -3, y: 12.3693, label: 'V13', start: 0, display: 0 },
                { x: -3.6923, y: 11.4178, label: 'V14', start: 0, display: 0 },
                { x: 3.6923, y: 11.4178, label: 'V15', start: 0, display: 0 },
                { x: 3, y: 12.3693, label: 'V16', start: 0, display: 0 },
                { x: 3, y: 30, label: 'V17', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V13', end: 'V14', radius: 1, direction: 0, sweep: 0 },
                { start: 'V14', end: 'V15', radius: 12, direction: 0, sweep: 0 },
                { start: 'V15', end: 'V16', radius: 1, direction: 0, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -12, label: 'V2', start: 1, display: 1 }, // Original center point
                { x: 10.3923, y: 6, label: 'V21', start: 0, display: 0 },
                { x: 6.0622, y: 3.5, label: 'V22', start: 0, display: 0 },
                { x: 3.5, y: 6.0622, label: 'V23', start: 0, display: 0 },
                { x: 6, y: 10.3923, label: 'V24', start: 0, display: 0 },
                { x: -12, y: 0, label: 'V25', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V2', end: 'V21', radius: 12, direction: 1, sweep: 0 },
                { start: 'V22', end: 'V23', radius: 7, direction: 0, sweep: 1 },
                { start: 'V24', end: 'V25', radius: 12, direction: 1, sweep: 0 },
                { start: 'V25', end: 'V2', radius: 12, direction: 1, sweep: 0 },
            ]
        },
        ],
    },    'U-turn Conventional': {
        path: [{
            'vertex': [
                { x: -8, y: 45, label: 'V1', start: 1, display: 1 },
                { x: -8, y: 9.3808, label: 'V13', start: 0, display: 0 },
                { x: -8.3077, y: 8.6592, label: 'V14', start: 0, display: 0 },
                { x: -2.7692, y: 11.6761, label: 'V15', start: 0, display: 0 },
                { x: -4, y: 12.6491, label: 'V16', start: 0, display: 0 },
                { x: -4, y: 45, label: 'V17', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V13', end: 'V14', radius: 1, direction: 0, sweep: 0 },
                { start: 'V14', end: 'V15', radius: 12, direction: 0, sweep: 0 },
                { start: 'V15', end: 'V16', radius: 1, direction: 0, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -12, label: 'V2', start: 1, display: 1 }, // Original center point
                { x: 2.0838, y: 11.8177, label: 'V21', start: 0, display: 0 },
                { x: 1.2155, y: 6.8937, label: 'V22', start: 0, display: 0 },
                { x: -1.2155, y: 6.8937, label: 'V23', start: 0, display: 0 },
                { x: -2.0838, y: 11.8177, label: 'V24', start: 0, display: 0 },
                { x: -12, y: 0, label: 'V25', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V2', end: 'V21', radius: 12, direction: 1, sweep: 0 },
                { start: 'V22', end: 'V23', radius: 7, direction: 0, sweep: 1 },
                { start: 'V24', end: 'V25', radius: 12, direction: 1, sweep: 0 },
                { start: 'V25', end: 'V2', radius: 12, direction: 1, sweep: 0 },
            ]
        },
        ],
    },    'Auxiliary Conventional': {
        path: [{
            'vertex': [
                { x: -3, y: 30, label: 'V1', start: 1, display: 1 },
                { x: -3, y: 20.3345, label: 'V2', start: 0, radius: 4, display: 0 },
                { x: -19.3345, y: 4, label: 'V3', start: 0, radius: 4, display: 0 },
                { x: -27, y: 4, label: 'V4', start: 0, display: 0 },
                { x: -30, y: 1, label: 'V5', start: 0, display: 0 },
                { x: -27, y: -2, label: 'V6', start: 0, display: 0 },
                { x: -12.6491, y: -2, label: 'V7', start: 0, display: 0 },
                { x: -11.6761, y: -2.7692, label: 'V8', start: 0, display: 0 },
                { x: -11.6761, y: 2.7692, label: 'V9', start: 0, display: 0 },
                { x: -12.6491, y: 2, label: 'V10', start: 0, display: 0 },
                { x: -17.7990, y: 2, label: 'V11', start: 0, display: 0 },
                { x: -3, y: 16.7990, label: 'V12', start: 0, display: 0 },
                { x: -3, y: 12.3693, label: 'V13', start: 0, display: 0 },
                { x: -3.6923, y: 11.4178, label: 'V14', start: 0, display: 0 },
                { x: 3.6923, y: 11.4178, label: 'V15', start: 0, display: 0 },
                { x: 3, y: 12.3693, label: 'V16', start: 0, display: 0 },
                { x: 3, y: 30, label: 'V17', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 1, direction: 0, sweep: 0 },
                { start: 'V8', end: 'V9', radius: 12, direction: 0, sweep: 0 },
                { start: 'V9', end: 'V10', radius: 1, direction: 0, sweep: 0 },
                { start: 'V13', end: 'V14', radius: 1, direction: 0, sweep: 0 },
                { start: 'V14', end: 'V15', radius: 12, direction: 0, sweep: 0 },
                { start: 'V15', end: 'V16', radius: 1, direction: 0, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -12, label: 'V21', start: 1, display: 1 }, // Original center point
                { x: 10.3923, y: 6, label: 'V22', start: 0, display: 0 },
                { x: 6.0622, y: 3.5, label: 'V23', start: 0, display: 0 },
                { x: 3.5, y: 6.0622, label: 'V24', start: 0, display: 0 },
                { x: 6, y: 10.3923, label: 'V25', start: 0, display: 0 },
                { x: -12, y: 0, label: 'V26', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V21', end: 'V22', radius: 12, direction: 1, sweep: 0 },
                { start: 'V23', end: 'V24', radius: 7, direction: 0, sweep: 1 },
                { start: 'V25', end: 'V26', radius: 12, direction: 1, sweep: 0 },
                { start: 'V26', end: 'V21', radius: 12, direction: 1, sweep: 0 },
            ]
        },],
    },    'Normal Spiral': {
        path: [{
            'vertex': [
                { x: -2, y: 24, label: 'V1', start: 1, display: 1 },
                { x: -2, y: 20.785, label: 'V2', start: 0, display: 0 },
                { x: -7, y: 12.124, label: 'V3', start: 0, display: 0 },
                { x: 2.392, y: 13.794, label: 'V4', start: 0, display: 0 },
                { x: 4, y: 20.785, label: 'V5', start: 0, display: 0 },
                { x: 4, y: 24, label: 'V6', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V2', end: 'V3', radius: 10, direction: 0, sweep: 0 },
                { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                { start: 'V4', end: 'V5', radius: 16, direction: 1, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -14, label: 'V11', start: 1, display: 1 }, // Original center point
                { x: 12.1244, y: 7, label: 'V12', start: 0, display: 0 },
                { x: 8.6603, y: 5, label: 'V13', start: 0, display: 0 },
                { x: 5, y: 8.6603, label: 'V14', start: 0, display: 0 },
                { x: 7, y: 12.1244, label: 'V15', start: 0, display: 0 },
                { x: -14, y: 0, label: 'V16', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V11', end: 'V12', radius: 14, direction: 1, sweep: 0 },
                { start: 'V13', end: 'V14', radius: 10, direction: 0, sweep: 1 },
                { start: 'V15', end: 'V16', radius: 14, direction: 1, sweep: 0 },
                { start: 'V16', end: 'V11', radius: 14, direction: 1, sweep: 0 },
            ]
        },],
    },    'U-turn Spiral': {
        path: [{
            'vertex': [
                { x: -6, y: 45, label: 'V1', start: 1, display: 1 },
                { x: -6, y: 17.8885, label: 'V2', start: 0, display: 0 },
                { x: -9.3333, y: 10.4350, label: 'V3', start: 0, display: 0 },
                { x: -2.6252, y: 13.7517, label: 'V4', start: 0, display: 0 },
                { x: -2, y: 17.8885, label: 'V5', start: 0, display: 0 },
                { x: -2, y: 45, label: 'V6', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V2', end: 'V3', radius: 10, direction: 0, sweep: 0 },
                { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                { start: 'V4', end: 'V5', radius: 16, direction: 1, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -14, label: 'V11', start: 1, display: 1 }, // Original center point
                { x: 2, y: 13.8564, label: 'V12', start: 0, display: 0 },
                { x: 2, y: 9.7980, label: 'V13', start: 0, display: 0 },
                { x: 0, y: 10, label: 'V14', start: 0, display: 0 },
                { x: 0, y: 14, label: 'V15', start: 0, display: 0 },
                { x: -14, y: 0, label: 'V16', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V11', end: 'V12', radius: 14, direction: 1, sweep: 0 },
                { start: 'V13', end: 'V14', radius: 10, direction: 0, sweep: 1 },
                { start: 'V15', end: 'V16', radius: 14, direction: 1, sweep: 0 },
                { start: 'V16', end: 'V11', radius: 14, direction: 1, sweep: 0 },
            ]
        },
        ],
    },
    'Auxiliary Spiral': {
        path: [{
            'vertex': [
                { x: -2, y: 30, label: 'V1', start: 1, display: 1 },
                { x: -2, y: 24.1630, label: 'V2', start: 0, radius: 4, display: 0 },
                { x: -24.3045, y: 1.8584, label: 'V3', start: 0, radius: 4, display: 0 },
                { x: -31.2484, y: 1.2509, label: 'V4', start: 0, display: 0 },
                { x: -34, y: -1.9784, label: 'V5', start: 0, display: 0 },
                { x: -30.7294, y: -4.6809, label: 'V6', start: 0, display: 0 },
                { x: -21.734, y: -3.917, label: 'V7', start: 0, display: 0 },
                { x: -13.975, y: -0.841, label: 'V8', start: 0, display: 0 },
                { x: -12.154, y: 6.949, label: 'V9', start: 0, display: 0 },
                { x: -22.6134, y: 0.0140, label: 'V10', start: 0, display: 0 },
                { x: -2, y: 20.6274, label: 'V11', start: 0, display: 0 },
                { x: -7, y: 12.124, label: 'V12', start: 0, display: 0 },
                { x: 2.392, y: 13.794, label: 'V13', start: 0, display: 0 },
                { x: 4, y: 20.785, label: 'V14', start: 0, display: 0 },
                { x: 4, y: 30, label: 'V15', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 18, direction: 1, sweep: 0 },
                { start: 'V8', end: 'V9', radius: 14, direction: 0, sweep: 0 },
                { start: 'V9', end: 'V10', radius: 14, direction: 0, sweep: 0 },
                { start: 'V11', end: 'V12', radius: 10, direction: 0, sweep: 0 },
                { start: 'V12', end: 'V13', radius: 14, direction: 0, sweep: 0 },
                { start: 'V13', end: 'V14', radius: 16, direction: 1, sweep: 0 },
            ]
        },
        {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
            ], 'arcs': []
        },
        {
            'vertex': [
                { x: 0, y: -14, label: 'V21', start: 1, display: 1 }, // Center point
                { x: 12.1244, y: 7, label: 'V22', start: 0, display: 0 },
                { x: 8.6603, y: 5, label: 'V23', start: 0, display: 0 },
                { x: 5, y: 8.6603, label: 'V24', start: 0, display: 0 },
                { x: 7, y: 12.1244, label: 'V25', start: 0, display: 0 },
                { x: -14, y: 0, label: 'V26', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V21', end: 'V22', radius: 14, direction: 1, sweep: 0 },
                { start: 'V23', end: 'V24', radius: 10, direction: 0, sweep: 1 },
                { start: 'V25', end: 'V26', radius: 14, direction: 1, sweep: 0 },
                { start: 'V26', end: 'V21', radius: 14, direction: 1, sweep: 0 },
            ]
        },],
    },
    'Spiral Arrow': {
        path: [{
            'vertex': [
                { x: 2.092, y: 0.091, label: 'V1', start: 1, display: 1 },
                { x: 3.917, y: 2.266, label: 'V2', start: 0, display: 0 },
                { x: 0.841, y: 10.025, label: 'V3', start: 0, display: 0 },
                { x: -6.949, y: 11.846, label: 'V4', start: 0, display: 0 },
                { x: -0.075, y: 1.909, label: 'V5', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V2', end: 'V3', radius: 18, direction: 1, sweep: 0 },
                { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                { start: 'V4', end: 'V5', radius: 14, direction: 0, sweep: 0 },
            ]
        }],
    },
    'ConvRoundabout': {
        path: [
            {
                'vertex': [
                    { x: 0, y: -12, label: 'V1', start: 1, display: 1 }, // Center point
                    { x: 10.3923, y: 6, label: 'V2', start: 0, display: 0 },
                    { x: 6.0622, y: 3.5, label: 'V3', start: 0, display: 0 },
                    { x: 3.5, y: 6.0622, label: 'V4', start: 0, display: 0 },
                    { x: 6, y: 10.3923, label: 'V5', start: 0, display: 0 },
                    { x: -12, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 7, direction: 0, sweep: 1 },
                    { start: 'V5', end: 'V6', radius: 12, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                ]
            },
        ],
    },
    'SpiralRoundabout': {
        path: [
            {
                'vertex': [
                    { x: 0, y: -14, label: 'V1', start: 1, display: 1 }, // Center point
                    { x: 12.1244, y: 7, label: 'V2', start: 0, display: 0 },
                    { x: 8.6603, y: 5, label: 'V3', start: 0, display: 0 },
                    { x: 5, y: 8.6603, label: 'V4', start: 0, display: 0 },
                    { x: 7, y: 12.1244, label: 'V5', start: 0, display: 0 },
                    { x: -14, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 14, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 10, direction: 0, sweep: 1 },
                    { start: 'V5', end: 'V6', radius: 14, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V1', radius: 14, direction: 1, sweep: 0 },
                ]
            },
        ],
    },
};

const symbolsPermittedAngle = {
    'StackArrow': [-135, -90, -45, -22.5, 0, 22.5, 45, 90, 135],
    'Airport': [-90, -45, 0, 45, 90],

};

const symbolsTemplate = {
    // TODO: permitted angle


    //'TestTriangle': [{
    //  'vertex': [
    //    { x: 0, y: 0, label: 'V1', radius: 50, start: 1 },
    //    { x: 300, y: 0, label: 'V2', radius: 50, start: 0 },
    //    { x: 300, y: 600, label: 'V3', radius: 50, start: 0 },
    //    { x: 0, y: 600, label: 'V3', radius: 50, start: 0 },
    //  ], 'arcs': []
    //}],

    //'TestX': {
    //  path: [{ 'vertex': [{ x: 0, y: 0, label: 'V1', start: 1 },], 'arcs': [] }],
    //  text: [{ character: 'x', x: 0, y: 0, fontSize: 100 * 0.075, fontFamily: 'TransportMedium' },
    //  { character: '中', x: 0, y: 0, fontSize: 5, fontFamily: 'Chinese' }]
    //},

    'StackArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: 4, y: 4, label: 'V2', start: 0, display: 0 },
                { x: 4, y: 8, label: 'V3', start: 0, display: 0 },
                { x: 4 / 3, y: 16 / 3, label: 'V4', start: 0, display: 0 },
                { x: 4 / 3, y: 16, label: 'V5', start: 0, display: 0 },
                { x: -4 / 3, y: 16, label: 'V6', start: 0, display: 0 },
                { x: -4 / 3, y: 16 / 3, label: 'V7', start: 0, display: 0 },
                { x: -4, y: 8, label: 'V8', start: 0, display: 0 },
                { x: -4, y: 4, label: 'V9', start: 0, display: 0 },
            ], 'arcs': []
        }],
    },

    'GantryArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: 3, y: 0, label: 'V2', start: 0, display: 0 },
                { x: 3, y: 4, label: 'V3', start: 0, display: 0 },
                { x: 9, y: 4, label: 'V4', start: 0, display: 0 },
                { x: 0, y: 8, label: 'V5', start: 0, display: 0 },
                { x: -9, y: 4, label: 'V6', start: 0, display: 0 },
                { x: -3, y: 4, label: 'V7', start: 0, display: 0 },
                { x: -3, y: 0, label: 'V8', start: 0, display: 0 },
            ], 'arcs': []
        }],
    },

    'Tunnel': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 9, y: 5, label: 'V3', start: 0, display: 0 },
                    { x: 9, y: 16, label: 'V4', start: 0, display: 0 },
                    { x: -9, y: 16, label: 'V5', start: 0, display: 0 },
                    { x: -9, y: 5, label: 'V6', start: 0, display: 0 },
                    { x: -4, y: 0, label: 'V7', start: 0, display: 0 },
                    { x: -5.25, y: 13, label: 'V8', start: 1, display: 0 },
                    { x: 5.25, y: 13, label: 'V9', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V9', end: 'V8', radius: 6.5, direction: 0, sweep: 1 }]
            },
        ],
    },

    'Expressway': {
        path: [ // Diagram 3.5.7.11
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 4.5, y: 0, label: 'V2', radius: 0.75, start: 0, display: 0 },
                    { x: 4.5, y: 9, label: 'V3', radius: 0.75, start: 0, display: 0 },
                    { x: -4.5, y: 9, label: 'V4', radius: 0.75, start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V5', radius: 0.75, start: 0, display: 0 },
                    { x: 0, y: 0.25, label: 'V6', start: 1, display: 0 },
                    { x: -4.25, y: 0.25, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -4.25, y: 8.75, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 4.25, y: 8.75, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 4.25, y: 0.25, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0.25, y: 1.25, label: 'V11', start: 1, display: 0 },
                    { x: 0.75, y: 1.25, label: 'V12', start: 0, display: 0 },
                    { x: 0.972, y: 2.75, label: 'V13', start: 0, display: 0 },
                    { x: 0.25, y: 2.75, label: 'V14', start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: -0.25, y: 1.25, label: 'V15', start: 1, display: 0 },
                    { x: -0.25, y: 2.75, label: 'V16', start: 0, display: 0 },
                    { x: -0.972, y: 2.75, label: 'V17', start: 0, display: 0 },
                    { x: -0.75, y: 1.25, label: 'V18', start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0, y: 3.25, label: 'V19', start: 1, display: 0 },
                    { x: 3.5, y: 3.25, label: 'V20', start: 0, display: 0 },
                    { x: 3.5, y: 3.75, label: 'V21', start: 0, display: 0 },
                    { x: 2.75, y: 3.75, label: 'V22', radius: 0.25, start: 0, display: 0 },
                    { x: 2.75, y: 4.75, label: 'V23', start: 0, display: 0 },
                    { x: 2.25, y: 4.75, label: 'V24', start: 0, display: 0 },
                    { x: 2, y: 3.75, label: 'V25', radius: 0.25, start: 0, display: 0 },
                    { x: -2, y: 3.75, label: 'V26', radius: 0.25, start: 0, display: 0 },
                    { x: -2.25, y: 4.75, label: 'V27', start: 0, display: 0 },
                    { x: -2.75, y: 4.75, label: 'V28', start: 0, display: 0 },
                    { x: -2.75, y: 3.75, label: 'V29', radius: 0.25, start: 0, display: 0 },
                    { x: -3.5, y: 3.75, label: 'V30', start: 0, display: 0 },
                    { x: -3.5, y: 3.25, label: 'V31', start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0.25, y: 4.25, label: 'V32', start: 1, display: 0 },
                    { x: 1.194, y: 4.25, label: 'V33', start: 0, display: 0 },
                    { x: 1.5, y: 8, label: 'V34', start: 0, display: 0 },
                    { x: 0.25, y: 8, label: 'V35', start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: -0.25, y: 4.25, label: 'V36', start: 1, display: 0 },
                    { x: -0.25, y: 8, label: 'V371', start: 0, display: 0 },
                    { x: -1.5, y: 8, label: 'V38', start: 0, display: 0 },
                    { x: -1.194, y: 4.25, label: 'V39', start: 0, display: 0 },
                ], 'arcs': []
            },
        ],
    },

    'ExpresswayRed': {
        path: [ // Diagram 3.5.7.11
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', radius: 0.75, start: 0, display: 0 },
                    { x: 4.5, y: 9, label: 'V3', radius: 0.75, start: 0, display: 0 },
                    { x: -4.5, y: 9, label: 'V4', radius: 0.75, start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V5', radius: 0.75, start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.25, label: 'V6', start: 1, display: 0 },
                    { x: -4.25, y: 0.25, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -4.25, y: 8.75, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 4.25, y: 8.75, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 4.25, y: 0.25, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ffffff'
            },
            {
                'vertex': [
                    { x: 0.25, y: 1.25, label: 'V11', start: 1, display: 0 },
                    { x: 0.75, y: 1.25, label: 'V12', start: 0, display: 0 },
                    { x: 0.972, y: 2.75, label: 'V13', start: 0, display: 0 },
                    { x: 0.25, y: 2.75, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: -0.25, y: 1.25, label: 'V15', start: 1, display: 0 },
                    { x: -0.25, y: 2.75, label: 'V16', start: 0, display: 0 },
                    { x: -0.972, y: 2.75, label: 'V17', start: 0, display: 0 },
                    { x: -0.75, y: 1.25, label: 'V18', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: 0, y: 3.25, label: 'V19', start: 1, display: 0 },
                    { x: 3.5, y: 3.25, label: 'V20', start: 0, display: 0 },
                    { x: 3.5, y: 3.75, label: 'V21', start: 0, display: 0 },
                    { x: 2.75, y: 3.75, label: 'V22', radius: 0.25, start: 0, display: 0 },
                    { x: 2.75, y: 4.75, label: 'V23', start: 0, display: 0 },
                    { x: 2.25, y: 4.75, label: 'V24', start: 0, display: 0 },
                    { x: 2, y: 3.75, label: 'V25', radius: 0.25, start: 0, display: 0 },
                    { x: -2, y: 3.75, label: 'V26', radius: 0.25, start: 0, display: 0 },
                    { x: -2.25, y: 4.75, label: 'V27', start: 0, display: 0 },
                    { x: -2.75, y: 4.75, label: 'V28', start: 0, display: 0 },
                    { x: -2.75, y: 3.75, label: 'V29', radius: 0.25, start: 0, display: 0 },
                    { x: -3.5, y: 3.75, label: 'V30', start: 0, display: 0 },
                    { x: -3.5, y: 3.25, label: 'V31', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: 0.25, y: 4.25, label: 'V32', start: 1, display: 0 },
                    { x: 1.194, y: 4.25, label: 'V33', start: 0, display: 0 },
                    { x: 1.5, y: 8, label: 'V34', start: 0, display: 0 },
                    { x: 0.25, y: 8, label: 'V35', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: -0.25, y: 4.25, label: 'V36', start: 1, display: 0 },
                    { x: -0.25, y: 8, label: 'V371', start: 0, display: 0 },
                    { x: -1.5, y: 8, label: 'V38', start: 0, display: 0 },
                    { x: -1.194, y: 4.25, label: 'V39', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0000'
            },
        ],
    },

    'Airport': {
        path: [ // 3.5.7.14
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 1.27, y: 2.924, label: 'V2', start: 0, display: 0 },
                    { x: 1.27, y: 6.5, label: 'V3', start: 0, display: 0 },
                    { x: 9, y: 11, label: 'V4', radius: 0.5, start: 0, display: 0 },
                    { x: 9, y: 13, label: 'V5', radius: 0.5, start: 0, display: 0 },
                    { x: 2.5, y: 11, label: 'V6', start: 0, display: 0 },
                    { x: 1.25, y: 11, label: 'V7', start: 0, display: 0 },
                    { x: 1.25, y: 11.5, label: 'V8', start: 0, display: 0 },
                    { x: 0.75, y: 15.5, label: 'V9', start: 0, display: 0 },
                    { x: 4, y: 16.5, label: 'V10', radius: 0.5, start: 0, display: 0 },
                    { x: 4, y: 18, label: 'V11', radius: 0.5, start: 0, display: 0 },
                    // mirror
                    { x: -4, y: 18, label: 'V12', radius: 0.5, start: 0, display: 0 },
                    { x: -4, y: 16.5, label: 'V13', radius: 0.5, start: 0, display: 0 },
                    { x: -0.75, y: 15.5, label: 'V14', start: 0, display: 0 },
                    { x: -1.25, y: 11.5, label: 'V15', start: 0, display: 0 },
                    { x: -1.25, y: 11, label: 'V16', start: 0, display: 0 },
                    { x: -2.5, y: 11, label: 'V17', start: 0, display: 0 },
                    { x: -9, y: 13, label: 'V18', radius: 0.5, start: 0, display: 0 },
                    { x: -9, y: 11, label: 'V19', radius: 0.5, start: 0, display: 0 },
                    { x: -1.27, y: 6.5, label: 'V20', start: 0, display: 0 },
                    { x: -1.27, y: 2.924, label: 'V21', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V21', end: 'V1', radius: 4, direction: 1, sweep: 0 },
                ]
            },
        ],
    },

    'Route1': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },        ],
        text: [
            { character: '1', x: -1.56, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route2': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '2', x: -2.4, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route3': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '3', x: -2.54, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route4': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '4', x: -2.64, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route5': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '5', x: -2.44, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route6': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '6', x: -2.52, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route7': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '7', x: -2.08, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route8': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '8', x: -2.76, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route9': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '9', x: -2.56, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route10': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 }, //https://www.wolframalpha.com/input?i2d=true&i=81+%3D+Power%5B%5C%2840%29x-7.5%5C%2841%29%2C2%5D+%2B+Power%5B%5C%2840%29y%2B0.2588%5C%2841%29%2C2%5D%5C%2844%29+16+%3D+Power%5B%5C%2840%29x-4%5C%2841%29%2C2%5D+%2B+Power%5By%2B3.82952%2C2%5D
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '10', x: -4.22, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route11': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '11', x: -3.12, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route12': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '12', x: -3.96, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },


    'CHT': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 16, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 16, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0, y: 6, label: 'V11', start: 1, display: 0 },
                    { x: 2, y: 6, label: 'V12', start: 0, display: 0 },
                    { x: 4.5, y: 8.5, label: 'V13', start: 0, display: 0 },
                    { x: 4.5, y: 14, label: 'V14', start: 0, display: 0 },
                    { x: -4.5, y: 14, label: 'V15', start: 0, display: 0 },
                    { x: -4.5, y: 8.5, label: 'V16', start: 0, display: 0 },
                    { x: -2, y: 6, label: 'V17', start: 0, display: 0 },
                    { x: -2.625, y: 12.5, label: 'V18', start: 1, display: 0 },
                    { x: 2.625, y: 12.5, label: 'V19', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V19', end: 'V18', radius: 3.25, direction: 0, sweep: 1 }]
            },
            {
                'vertex': [
                    { x: -9, y: 3, label: 'V21', start: 1, display: 0 },
                    { x: -8.034, y: 2.485, label: 'V22', start: 0, display: 0 },
                    { x: -4.5, y: 2.583, label: 'V23', start: 0, display: 0 },
                    { x: -1.5, y: 2.525, label: 'V24', start: 0, display: 0 },
                    { x: 1.5, y: 2.525, label: 'V25', start: 0, display: 0 },
                    { x: 4.5, y: 2.583, label: 'V26', start: 0, display: 0 },
                    { x: 8.034, y: 2.485, label: 'V27', start: 0, display: 0 },
                    { x: 9, y: 3, label: 'V28', start: 0, display: 0 },
                    { x: 9, y: 4, label: 'V29', start: 0, display: 0 },
                    { x: 8.034, y: 3.485, label: 'V30', start: 0, display: 0 },
                    { x: 4.5, y: 3.583, label: 'V31', start: 0, display: 0 },
                    { x: 1.5, y: 3.525, label: 'V32', start: 0, display: 0 },
                    { x: -1.5, y: 3.525, label: 'V33', start: 0, display: 0 },
                    { x: -4.5, y: 3.583, label: 'V34', start: 0, display: 0 },
                    { x: -8.034, y: 3.485, label: 'V35', start: 0, display: 0 },
                    { x: -9, y: 4, label: 'V36', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V22', end: 'V23', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V23', end: 'V24', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V24', end: 'V25', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V25', end: 'V26', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V26', end: 'V27', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V30', end: 'V31', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V31', end: 'V32', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V32', end: 'V33', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V33', end: 'V34', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V34', end: 'V35', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
            {
                'vertex': [
                    { x: -9, y: 4.5, label: 'V41', start: 1, display: 0 },
                    { x: -8.034, y: 3.985, label: 'V42', start: 0, display: 0 },
                    { x: -4.5, y: 4.083, label: 'V43', start: 0, display: 0 },
                    { x: -1.5, y: 4.025, label: 'V44', start: 0, display: 0 },
                    { x: 1.5, y: 4.025, label: 'V45', start: 0, display: 0 },
                    { x: 4.5, y: 4.083, label: 'V46', start: 0, display: 0 },
                    { x: 8.034, y: 3.985, label: 'V47', start: 0, display: 0 },
                    { x: 9, y: 4.5, label: 'V48', start: 0, display: 0 },
                    { x: 9, y: 5.5, label: 'V49', start: 0, display: 0 },
                    { x: 8.034, y: 4.985, label: 'V50', start: 0, display: 0 },
                    { x: 4.5, y: 4.983, label: 'V51', start: 0, display: 0 },
                    { x: 1.5, y: 5.025, label: 'V52', start: 0, display: 0 },
                    { x: -1.5, y: 5.025, label: 'V53', start: 0, display: 0 },
                    { x: -4.5, y: 5.083, label: 'V54', start: 0, display: 0 },
                    { x: -8.034, y: 4.985, label: 'V55', start: 0, display: 0 },
                    { x: -9, y: 5.5, label: 'V56', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V42', end: 'V43', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V43', end: 'V44', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V44', end: 'V45', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V45', end: 'V46', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V46', end: 'V47', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V50', end: 'V51', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V51', end: 'V52', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V52', end: 'V53', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V53', end: 'V54', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V54', end: 'V55', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
        ],
        text: [
            { character: 'C', x: 4.845, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '中', x: -9.8, y: -9, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'EHC': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 16, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 16, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0, y: 6, label: 'V11', start: 1, display: 0 },
                    { x: 2, y: 6, label: 'V12', start: 0, display: 0 },
                    { x: 4.5, y: 8.5, label: 'V13', start: 0, display: 0 },
                    { x: 4.5, y: 14, label: 'V14', start: 0, display: 0 },
                    { x: -4.5, y: 14, label: 'V15', start: 0, display: 0 },
                    { x: -4.5, y: 8.5, label: 'V16', start: 0, display: 0 },
                    { x: -2, y: 6, label: 'V17', start: 0, display: 0 },
                    { x: -2.625, y: 12.5, label: 'V18', start: 1, display: 0 },
                    { x: 2.625, y: 12.5, label: 'V19', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V19', end: 'V18', radius: 3.25, direction: 0, sweep: 1 }]
            },
            {
                'vertex': [
                    { x: -9, y: 3, label: 'V21', start: 1, display: 0 },
                    { x: -8.034, y: 2.485, label: 'V22', start: 0, display: 0 },
                    { x: -4.5, y: 2.583, label: 'V23', start: 0, display: 0 },
                    { x: -1.5, y: 2.525, label: 'V24', start: 0, display: 0 },
                    { x: 1.5, y: 2.525, label: 'V25', start: 0, display: 0 },
                    { x: 4.5, y: 2.583, label: 'V26', start: 0, display: 0 },
                    { x: 8.034, y: 2.485, label: 'V27', start: 0, display: 0 },
                    { x: 9, y: 3, label: 'V28', start: 0, display: 0 },
                    { x: 9, y: 4, label: 'V29', start: 0, display: 0 },
                    { x: 8.034, y: 3.485, label: 'V30', start: 0, display: 0 },
                    { x: 4.5, y: 3.583, label: 'V31', start: 0, display: 0 },
                    { x: 1.5, y: 3.525, label: 'V32', start: 0, display: 0 },
                    { x: -1.5, y: 3.525, label: 'V33', start: 0, display: 0 },
                    { x: -4.5, y: 3.583, label: 'V34', start: 0, display: 0 },
                    { x: -8.034, y: 3.485, label: 'V35', start: 0, display: 0 },
                    { x: -9, y: 4, label: 'V36', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V22', end: 'V23', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V23', end: 'V24', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V24', end: 'V25', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V25', end: 'V26', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V26', end: 'V27', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V30', end: 'V31', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V31', end: 'V32', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V32', end: 'V33', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V33', end: 'V34', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V34', end: 'V35', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
            {
                'vertex': [
                    { x: -9, y: 4.5, label: 'V41', start: 1, display: 0 },
                    { x: -8.034, y: 3.985, label: 'V42', start: 0, display: 0 },
                    { x: -4.5, y: 4.083, label: 'V43', start: 0, display: 0 },
                    { x: -1.5, y: 4.025, label: 'V44', start: 0, display: 0 },
                    { x: 1.5, y: 4.025, label: 'V45', start: 0, display: 0 },
                    { x: 4.5, y: 4.083, label: 'V46', start: 0, display: 0 },
                    { x: 8.034, y: 3.985, label: 'V47', start: 0, display: 0 },
                    { x: 9, y: 4.5, label: 'V48', start: 0, display: 0 },
                    { x: 9, y: 5.5, label: 'V49', start: 0, display: 0 },
                    { x: 8.034, y: 4.985, label: 'V50', start: 0, display: 0 },
                    { x: 4.5, y: 4.983, label: 'V51', start: 0, display: 0 },
                    { x: 1.5, y: 5.025, label: 'V52', start: 0, display: 0 },
                    { x: -1.5, y: 5.025, label: 'V53', start: 0, display: 0 },
                    { x: -4.5, y: 5.083, label: 'V54', start: 0, display: 0 },
                    { x: -8.034, y: 4.985, label: 'V55', start: 0, display: 0 },
                    { x: -9, y: 5.5, label: 'V56', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V42', end: 'V43', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V43', end: 'V44', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V44', end: 'V45', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V45', end: 'V46', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V46', end: 'V47', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V50', end: 'V51', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V51', end: 'V52', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V52', end: 'V53', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V53', end: 'V54', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V54', end: 'V55', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
        ],
        text: [
            { character: 'E', x: 4.945, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '東', x: -9.8, y: - 9, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'WHC': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 16, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 16, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: 0, y: 6, label: 'V11', start: 1, display: 0 },
                    { x: 2, y: 6, label: 'V12', start: 0, display: 0 },
                    { x: 4.5, y: 8.5, label: 'V13', start: 0, display: 0 },
                    { x: 4.5, y: 14, label: 'V14', start: 0, display: 0 },
                    { x: -4.5, y: 14, label: 'V15', start: 0, display: 0 },
                    { x: -4.5, y: 8.5, label: 'V16', start: 0, display: 0 },
                    { x: -2, y: 6, label: 'V17', start: 0, display: 0 },
                    { x: -2.625, y: 12.5, label: 'V18', start: 1, display: 0 },
                    { x: 2.625, y: 12.5, label: 'V19', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V19', end: 'V18', radius: 3.25, direction: 0, sweep: 1 }]
            },
            {
                'vertex': [
                    { x: -9, y: 3, label: 'V21', start: 1, display: 0 },
                    { x: -8.034, y: 2.485, label: 'V22', start: 0, display: 0 },
                    { x: -4.5, y: 2.583, label: 'V23', start: 0, display: 0 },
                    { x: -1.5, y: 2.525, label: 'V24', start: 0, display: 0 },
                    { x: 1.5, y: 2.525, label: 'V25', start: 0, display: 0 },
                    { x: 4.5, y: 2.583, label: 'V26', start: 0, display: 0 },
                    { x: 8.034, y: 2.485, label: 'V27', start: 0, display: 0 },
                    { x: 9, y: 3, label: 'V28', start: 0, display: 0 },
                    { x: 9, y: 4, label: 'V29', start: 0, display: 0 },
                    { x: 8.034, y: 3.485, label: 'V30', start: 0, display: 0 },
                    { x: 4.5, y: 3.583, label: 'V31', start: 0, display: 0 },
                    { x: 1.5, y: 3.525, label: 'V32', start: 0, display: 0 },
                    { x: -1.5, y: 3.525, label: 'V33', start: 0, display: 0 },
                    { x: -4.5, y: 3.583, label: 'V34', start: 0, display: 0 },
                    { x: -8.034, y: 3.485, label: 'V35', start: 0, display: 0 },
                    { x: -9, y: 4, label: 'V36', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V22', end: 'V23', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V23', end: 'V24', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V24', end: 'V25', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V25', end: 'V26', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V26', end: 'V27', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V30', end: 'V31', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V31', end: 'V32', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V32', end: 'V33', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V33', end: 'V34', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V34', end: 'V35', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
            {
                'vertex': [
                    { x: -9, y: 4.5, label: 'V41', start: 1, display: 0 },
                    { x: -8.034, y: 3.985, label: 'V42', start: 0, display: 0 },
                    { x: -4.5, y: 4.083, label: 'V43', start: 0, display: 0 },
                    { x: -1.5, y: 4.025, label: 'V44', start: 0, display: 0 },
                    { x: 1.5, y: 4.025, label: 'V45', start: 0, display: 0 },
                    { x: 4.5, y: 4.083, label: 'V46', start: 0, display: 0 },
                    { x: 8.034, y: 3.985, label: 'V47', start: 0, display: 0 },
                    { x: 9, y: 4.5, label: 'V48', start: 0, display: 0 },
                    { x: 9, y: 5.5, label: 'V49', start: 0, display: 0 },
                    { x: 8.034, y: 4.985, label: 'V50', start: 0, display: 0 },
                    { x: 4.5, y: 4.983, label: 'V51', start: 0, display: 0 },
                    { x: 1.5, y: 5.025, label: 'V52', start: 0, display: 0 },
                    { x: -1.5, y: 5.025, label: 'V53', start: 0, display: 0 },
                    { x: -4.5, y: 5.083, label: 'V54', start: 0, display: 0 },
                    { x: -8.034, y: 4.985, label: 'V55', start: 0, display: 0 },
                    { x: -9, y: 5.5, label: 'V56', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V42', end: 'V43', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V43', end: 'V44', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V44', end: 'V45', radius: 2.456, direction: 1, sweep: 0 },
                    { start: 'V45', end: 'V46', radius: 2.8, direction: 0, sweep: 0 },
                    { start: 'V46', end: 'V47', radius: 3.57, direction: 1, sweep: 0 },
                    { start: 'V50', end: 'V51', radius: 3.57, direction: 0, sweep: 0 },
                    { start: 'V51', end: 'V52', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V52', end: 'V53', radius: 2.456, direction: 0, sweep: 0 },
                    { start: 'V53', end: 'V54', radius: 2.8, direction: 1, sweep: 0 },
                    { start: 'V54', end: 'V55', radius: 3.57, direction: 0, sweep: 0 },
                ]
            },
        ],
        text: [
            { character: 'W', x: 4.2, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '西', x: -9.8, y: - 9, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'MTR': {
        path: [ // 3.5.7.19
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 0, y: 22, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 13, radius2: 11, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V1', radius: 13, radius2: 11, direction: 1, sweep: 0 },
                ], 'fill': '#ff0101'
            },
            {
                'vertex': [
                    { x: 0, y: 4, label: 'V3', start: 1, display: 0 },
                    { x: 1, y: 4, label: 'V4', start: 0, display: 0 },
                    { x: 1, y: 8, label: 'V5', start: 0, display: 0 },
                    { x: 4, y: 4.2, label: 'V6', start: 0, display: 0 },
                    { x: 6.2, y: 4.2, label: 'V7', start: 0, display: 0 },
                    { x: 1, y: 10, label: 'V8', start: 0, display: 0 },
                    { x: 1, y: 12, label: 'V9', start: 0, display: 0 },
                    { x: 6.2, y: 17.8, label: 'V10', start: 0, display: 0 },
                    { x: 4, y: 17.8, label: 'V11', start: 0, display: 0 },
                    { x: 1, y: 14, label: 'V12', start: 0, display: 0 },
                    { x: 1, y: 18, label: 'V13', start: 0, display: 0 },
                    { x: -1, y: 18, label: 'V14', start: 0, display: 0 },
                    { x: -1, y: 14, label: 'V15', start: 0, display: 0 },
                    { x: -4, y: 17.8, label: 'V16', start: 0, display: 0 },
                    { x: -6.2, y: 17.8, label: 'V17', start: 0, display: 0 },
                    { x: -1, y: 12, label: 'V18', start: 0, display: 0 },
                    { x: -1, y: 10, label: 'V19', start: 0, display: 0 },
                    { x: -6.2, y: 4.2, label: 'V20', start: 0, display: 0 },
                    { x: -4, y: 4.2, label: 'V21', start: 0, display: 0 },
                    { x: -1, y: 8, label: 'V22', start: 0, display: 0 },
                    { x: -1, y: 4, label: 'V23', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V5', end: 'V6', radius: 3, radius2: 4, direction: 0, sweep: 0 },
                    { start: 'V7', end: 'V8', radius: 5.2, radius2: 6, direction: 1, sweep: 0 },
                    { start: 'V9', end: 'V10', radius: 5.2, radius2: 6, direction: 1, sweep: 0 },
                    { start: 'V11', end: 'V12', radius: 3, radius2: 4, direction: 0, sweep: 0 },
                    { start: 'V15', end: 'V16', radius: 3, radius2: 4, direction: 0, sweep: 0 },
                    { start: 'V17', end: 'V18', radius: 5.2, radius2: 6, direction: 1, sweep: 0 },
                    { start: 'V19', end: 'V20', radius: 5.2, radius2: 6, direction: 1, sweep: 0 },
                    { start: 'V21', end: 'V22', radius: 3, radius2: 4, direction: 0, sweep: 0 },
                ], 'fill': '#ffffff'
            },
        ],
        text: []
    },

    'Hospital': {
        path: [ // 3.5.7.31
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 0, y: 16, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [
                    { x: 0, y: 1.5, label: 'V3', start: 1, display: 0 },
                    { x: 2, y: 1.5, label: 'V4', start: 0, display: 0 },
                    { x: 2, y: 6, label: 'V5', start: 0, display: 0 },
                    { x: 6.5, y: 6, label: 'V6', start: 0, display: 0 },
                    { x: 6.5, y: 10, label: 'V7', start: 0, display: 0 },
                    { x: 2, y: 10, label: 'V8', start: 0, display: 0 },
                    { x: 2, y: 14.5, label: 'V9', start: 0, display: 0 },
                    { x: -2, y: 14.5, label: 'V10', start: 0, display: 0 },
                    { x: -2, y: 10, label: 'V11', start: 0, display: 0 },
                    { x: -6.5, y: 10, label: 'V12', start: 0, display: 0 },
                    { x: -6.5, y: 6, label: 'V13', start: 0, display: 0 },
                    { x: -2, y: 6, label: 'V14', start: 0, display: 0 },
                    { x: -2, y: 1.5, label: 'V15', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0101'
            },
        ],
        text: []
    },

    'Disney': {
        path: [ // https://upload.wikimedia.org/wikipedia/commons/f/fe/Mickey_Mouse_head_and_ears.svg
            {
                'vertex': [
                    { x: 0, y: 3.7266, label: 'V1', start: 1, display: 1 },
                    { x: 2.7767, y: 4.4704, label: 'V2', start: 0, display: 0 },
                    { x: 4.6732, y: 6.2787, label: 'V3', start: 0, display: 0 },
                    { x: -4.6732, y: 6.2787, label: 'V4', start: 0, display: 0 },
                    { x: -2.7767, y: 4.4704, label: 'V5', start: 0, display: 0 },

                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 5.555, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 3.234, direction: 1, sweep: 1 },
                    { start: 'V3', end: 'V4', radius: 5.555, direction: 1, sweep: 1 },
                    { start: 'V4', end: 'V5', radius: 3.234, direction: 1, sweep: 1 },
                    { start: 'V5', end: 'V1', radius: 5.555, direction: 1, sweep: 0 },
                ],
            },
        ],
        text: []
    },

    'Parking': {
        path: [ // 3.5.7.26
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 9, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 9, y: 18, label: 'V3', start: 0, display: 0 },
                    { x: -9, y: 18, label: 'V4', start: 0, display: 0 },
                    { x: -9, y: 0, label: 'V5', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#0000FE'
            },
            {
                'vertex': [
                    { x: -5, y: 2, label: 'V6', start: 1, display: 0 },
                    { x: 2.125, y: 2, label: 'V7', start: 0, display: 0 },
                    { x: 2.125, y: 10.55, label: 'V8', start: 0, display: 0 },
                    { x: -1.58, y: 10.55, label: 'V9', start: 0, display: 0 },
                    { x: -1.58, y: 16.25, label: 'V10', start: 0, display: 0 },
                    { x: -5, y: 16.25, label: 'V11', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V7', end: 'V8', radius: 4.275, direction: 1, sweep: 0 },
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [
                    { x: -1.58, y: 4.28, label: 'V12', start: 1, display: 0 },
                    { x: 1.27, y: 4.28, label: 'V13', start: 0, display: 0 },
                    { x: 2.98, y: 5.99, label: 'V14', start: 0, display: 0 },
                    { x: 2.98, y: 6.56, label: 'V15', start: 0, display: 0 },
                    { x: 1.27, y: 8.27, label: 'V16', start: 0, display: 0 },
                    { x: -1.58, y: 8.27, label: 'V17', start: 0, display: 0 },

                ], 'arcs': [
                    { start: 'V13', end: 'V14', radius: 1.71, direction: 1, sweep: 0 },
                    { start: 'V15', end: 'V16', radius: 1.71, direction: 1, sweep: 0 },
                ], 'fill': '#0000FE'
            },
        ],
        text: []
    },

    'Exit': {
        path: [ // 3.5.7.20
            {
                'vertex': [ //E
                    { x: -2, y: 0.2, label: 'V1', start: 1, display: 1 },
                    { x: -1.0667, y: 0.2, label: 'V2', start: 0, display: 0 },
                    { x: -1.0667, y: 0.5333, label: 'V3', start: 0, display: 0 },
                    { x: -1.6667, y: 0.5333, label: 'V4', start: 0, display: 0 },
                    { x: -1.6667, y: 1.0333, label: 'V5', start: 0, display: 0 },
                    { x: -1.2, y: 1.0333, label: 'V6', start: 0, display: 0 },
                    { x: -1.2, y: 1.3667, label: 'V7', start: 0, display: 0 },
                    { x: -1.6667, y: 1.3667, label: 'V8', start: 0, display: 0 },
                    { x: -1.6667, y: 1.8667, label: 'V9', start: 0, display: 0 },
                    { x: -1.0667, y: 1.8667, label: 'V10', start: 0, display: 0 },
                    { x: -1.0667, y: 2.2, label: 'V11', start: 0, display: 0 },
                    { x: -2, y: 2.2, label: 'V12', start: 0, display: 0 },
                ], 'arcs': [
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [ //X
                    { x: -0.8, y: 0.2, label: 'V13', start: 1, display: 1 },
                    { x: -0.4469, y: 0.2, label: 'V14', start: 0, display: 0 },
                    { x: -0.3, y: 0.6197, label: 'V15', start: 0, display: 0 },
                    { x: -0.1532, y: 0.2, label: 'V16', start: 0, display: 0 },
                    { x: 0.2, y: 0.2, label: 'V17', start: 0, display: 0 },
                    { x: -0.15, y: 1.2, label: 'V18', start: 0, display: 0 },
                    { x: 0.2, y: 2.2, label: 'V19', start: 0, display: 0 },
                    { x: -0.1532, y: 2.2, label: 'V20', start: 0, display: 0 },
                    { x: -0.3, y: 1.7808, label: 'V21', start: 0, display: 0 },
                    { x: -0.4469, y: 2.2, label: 'V22', start: 0, display: 0 },
                    { x: -0.8, y: 2.2, label: 'V23', start: 0, display: 0 },
                    { x: -0.45, y: 1.2, label: 'V24', start: 0, display: 0 },
                ], 'arcs': [
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [ //I
                    { x: 0.543, y: 0.2, label: 'V25', start: 1, display: 1 },
                    { x: 0.8, y: 0.2, label: 'V26', start: 0, display: 0 },
                    { x: 0.8, y: 2.2, label: 'V27', start: 0, display: 0 },
                    { x: 0.543, y: 2.2, label: 'V28', start: 0, display: 0 },
                ], 'arcs': [
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [ //T
                    { x: 1.0667, y: 0.2, label: 'V29', start: 1, display: 1 },
                    { x: 2, y: 0.2, label: 'V30', start: 0, display: 0 },
                    { x: 2, y: 0.5333, label: 'V31', start: 0, display: 0 },
                    { x: 1.7, y: 0.5333, label: 'V32', start: 0, display: 0 },
                    { x: 1.7, y: 2.2, label: 'V33', start: 0, display: 0 },
                    { x: 1.3667, y: 2.2, label: 'V34', start: 0, display: 0 },
                    { x: 1.3667, y: 0.5333, label: 'V35', start: 0, display: 0 },
                    { x: 1.0667, y: 0.5333, label: 'V36', start: 0, display: 0 },], 'arcs': [
                    ], 'fill': '#ffffff'
            },
            {
                'vertex': [
                    { x: 0.4, y: 3.0, label: 'V37', start: 1, display: 1 },
                    { x: 0.4, y: 3.9333, label: 'V38', start: 0, display: 0 },
                    { x: 1.3333, y: 3.9333, label: 'V39', start: 0, display: 0 },
                    { x: 1.3333, y: 3.4, label: 'V40', start: 0, display: 0 },
                    { x: 1.8667, y: 3.4, label: 'V41', start: 0, display: 0 },
                    { x: 1.8667, y: 4.4667, label: 'V42', start: 0, display: 0 },
                    { x: 0.4, y: 4.4667, label: 'V43', start: 0, display: 0 },
                    { x: 0.4, y: 5.4, label: 'V44', start: 0, display: 0 },
                    { x: 1.4667, y: 5.4, label: 'V45', start: 0, display: 0 },
                    { x: 1.4667, y: 4.8667, label: 'V46', start: 0, display: 0 },
                    { x: 2, y: 4.8667, label: 'V47', start: 0, display: 0 },
                    { x: 2, y: 6.2, label: 'V48', start: 0, display: 0 },
                    { x: 1.4667, y: 6.2, label: 'V49', start: 0, display: 0 },
                    { x: 1.4667, y: 5.9333, label: 'V50', start: 0, display: 0 },
                    /////
                    { x: -1.4667, y: 5.9333, label: 'V51', start: 0, display: 0 },
                    { x: -1.4667, y: 6.2, label: 'V52', start: 0, display: 0 },
                    { x: -2, y: 6.2, label: 'V53', start: 0, display: 0 },
                    { x: -2, y: 4.8667, label: 'V54', start: 0, display: 0 },
                    { x: -1.4667, y: 4.8667, label: 'V55', start: 0, display: 0 },
                    { x: -1.4667, y: 5.4, label: 'V56', start: 0, display: 0 },
                    { x: -0.4, y: 5.4, label: 'V57', start: 0, display: 0 },
                    { x: -0.4, y: 4.4667, label: 'V58', start: 0, display: 0 },
                    { x: -1.8667, y: 4.4667, label: 'V59', start: 0, display: 0 },
                    { x: -1.8667, y: 3.4, label: 'V60', start: 0, display: 0 },
                    { x: -1.3333, y: 3.4, label: 'V61', start: 0, display: 0 },
                    { x: -1.3333, y: 3.9333, label: 'V62', start: 0, display: 0 },
                    { x: -0.4, y: 3.9333, label: 'V63', start: 0, display: 0 },
                    { x: -0.4, y: 3.0, label: 'V64', start: 0, display: 0 },

                ], 'arcs': [
                ], 'fill': '#ffffff'
            },
        ],
        text: []
    },

    'LeftArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: -4, y: 0, label: 'V2', start: 0, display: 0 },
                { x: -8, y: 4, label: 'V3', start: 0, display: 0 },
                { x: -4, y: 8, label: 'V4', start: 0, display: 0 },
                { x: -0, y: 8, label: 'V5', start: 0, display: 0 },
                { x: -2.667, y: 5.333, label: 'V6', start: 0, display: 0 },
                { x: -0.667, y: 5.333, label: 'V7', start: 0, display: 0 },
                { x: 3.333, y: 9.333, label: 'V8', start: 0, display: 0 },
                { x: 3.333, y: 18, label: 'V9', start: 0, display: 0 },
                { x: 6, y: 18, label: 'V10', start: 0, display: 0 },
                { x: 6, y: 9.333, label: 'V11', start: 0, display: 0 },
                { x: 0, y: 2.667, label: 'V12', start: 0, display: 0 },
                { x: -2.667, y: 2.667, label: 'V13', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 4, direction: 1, sweep: 0 },
                { start: 'V11', end: 'V12', radius: 6.667, direction: 0, sweep: 0 },
            ]
        }],
    },
    'RightArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: 4, y: 0, label: 'V2', start: 0, display: 0 },
                { x: 8, y: 4, label: 'V3', start: 0, display: 0 },
                { x: 4, y: 8, label: 'V4', start: 0, display: 0 },
                { x: 0, y: 8, label: 'V5', start: 0, display: 0 },
                { x: 2.667, y: 5.333, label: 'V6', start: 0, display: 0 },
                { x: 0.667, y: 5.333, label: 'V7', start: 0, display: 0 },
                { x: -3.333, y: 9.333, label: 'V8', start: 0, display: 0 },
                { x: -3.333, y: 18, label: 'V9', start: 0, display: 0 },
                { x: -6, y: 18, label: 'V10', start: 0, display: 0 },
                { x: -6, y: 9.333, label: 'V11', start: 0, display: 0 },
                { x: 0, y: 2.667, label: 'V12', start: 0, display: 0 },
                { x: 2.667, y: 2.667, label: 'V13', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 4, direction: 0, sweep: 0 },
                { start: 'V11', end: 'V12', radius: 6.667, direction: 1, sweep: 0 },
            ]
        }],
    },

    'LeftStraightArrow': {
        path: [{
            'vertex': [
                { x: -0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: -4, y: 4, label: 'V2', start: 0, display: 0 },
                { x: -4, y: 8, label: 'V3', start: 0, display: 0 },
                { x: -1.333, y: 5.333, label: 'V4', start: 0, display: 0 },
                { x: -1.333, y: 14, label: 'V5', start: 0, display: 0 },
                { x: -5.327, y: 12.667, label: 'V6', start: 0, display: 0 },
                { x: -9.333, y: 12.668, label: 'V7', start: 0, display: 0 },
                { x: -6.667, y: 10, label: 'V8', start: 0, display: 0 },
                { x: -10.667, y: 10, label: 'V9', start: 0, display: 0 },
                { x: -14.667, y: 14, label: 'V10', start: 0, display: 0 },
                { x: -10.667, y: 18, label: 'V11', start: 0, display: 0 },
                { x: -6.667, y: 18, label: 'V12', start: 0, display: 0 },
                { x: -9.333, y: 15.333, label: 'V13', start: 0, display: 0 },
                { x: -5.340, y: 15.333, label: 'V14', start: 0, display: 0 },
                { x: -1.333, y: 19.333, label: 'V15', start: 0, display: 0 },
                { x: -1.333, y: 28, label: 'V16', start: 0, display: 0 },
                { x: 1.333, y: 28, label: 'V17', start: 0, display: 0 },
                { x: 1.333, y: 5.333, label: 'V18', start: 0, display: 0 },
                { x: 4, y: 8, label: 'V19', start: 0, display: 0 },
                { x: 4, y: 4, label: 'V20', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V5', end: 'V6', radius: 6.667, direction: 0, sweep: 0 },
                { start: 'V14', end: 'V15', radius: 4, direction: 1, sweep: 0 },
            ]
        }],
    },

    'RightStraightArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: 4, y: 4, label: 'V2', start: 0, display: 0 },
                { x: 4, y: 8, label: 'V3', start: 0, display: 0 },
                { x: 1.333, y: 5.333, label: 'V4', start: 0, display: 0 },
                { x: 1.333, y: 14, label: 'V5', start: 0, display: 0 },
                { x: 5.327, y: 12.667, label: 'V6', start: 0, display: 0 },
                { x: 9.333, y: 12.668, label: 'V7', start: 0, display: 0 },
                { x: 6.667, y: 10, label: 'V8', start: 0, display: 0 },
                { x: 10.667, y: 10, label: 'V9', start: 0, display: 0 },
                { x: 14.667, y: 14, label: 'V10', start: 0, display: 0 },
                { x: 10.667, y: 18, label: 'V11', start: 0, display: 0 },
                { x: 6.667, y: 18, label: 'V12', start: 0, display: 0 },
                { x: 9.333, y: 15.333, label: 'V13', start: 0, display: 0 },
                { x: 5.340, y: 15.333, label: 'V14', start: 0, display: 0 },
                { x: 1.333, y: 19.333, label: 'V15', start: 0, display: 0 },
                { x: 1.333, y: 28, label: 'V16', start: 0, display: 0 },
                { x: -1.333, y: 28, label: 'V17', start: 0, display: 0 },
                { x: -1.333, y: 5.333, label: 'V18', start: 0, display: 0 },
                { x: -4, y: 8, label: 'V19', start: 0, display: 0 },
                { x: -4, y: 4, label: 'V20', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V5', end: 'V6', radius: 6.667, direction: 1, sweep: 0 },
                { start: 'V14', end: 'V15', radius: 4, direction: 0, sweep: 0 },
            ]
        }],
    },

    'LeftPedestrian': {
        path: [ // 3.5.7.22
            {
                'vertex': [
                    { x: -0.384, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: -0.384, y: 2.565, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 1.283, direction: 0, sweep: 0 },
                    { start: 'V2', end: 'V1', radius: 1.283, direction: 0, sweep: 0 },

                ], 
            },
            {
                'vertex': [
                    { x: 2.016, y: 4.248, label: 'V3', start: 1, display: 1 },
                    { x: -2.378, y: 4.565, label: 'V4', start: 0, display: 0 },
                    { x: -2.86, y: 6.006, label: 'V5', start: 0, display: 0 },
                    { x: -4.498, y: 7.505, label: 'V6', start: 0, display: 0 },
                    { x: -4.035, y: 8.254, label: 'V7', start: 0, display: 0 },
                    { x: -2.136, y: 6.641, label: 'V8', start: 0, display: 0 },
                    { x: -1.552, y: 6, label: 'V9', start: 0, display: 0 },
                    { x: -1.343, y: 8.483, label: 'V10', start: 0, display: 0 },
                    { x: -2.803, y: 12.470, label: 'V11', start: 0, display: 0 },
                    { x: -3, y: 16, label: 'V12', start: 0, display: 0 },
                    { x: -2.003, y: 16, label: 'V13', start: 0, display: 0 },
                    { x: -1.343, y: 12.4, label: 'V14', start: 0, display: 0 },
                    { x: 0.181, y: 9.683, label: 'V15', start: 0, display: 0 },
                    { x: 0.181, y: 9.683, label: 'V16', start: 0, display: 0 },
                    { x: 0.981, y: 11.606, label: 'V17', start: 0, display: 0 },
                    { x: 3.73, y: 15.314, label: 'V18', start: 0, display: 0 },
                    { x: 4.498, y: 14.502, label: 'V19', start: 0, display: 0 },
                    { x: 4.498, y: 14.502, label: 'V20', start: 0, display: 0 },
                    { x: 2.943, y: 12.019, label: 'V21', start: 0, display: 0 },
                    { x: 1.171, y: 5.244, label: 'V22', start: 0, display: 0 },
                    { x: 1.698, y: 5.765, label: 'V23', start: 0, display: 0 },
                    { x: 2.498, y: 9.003, label: 'V24', start: 0, display: 0 },
                    { x: 3.292, y: 8.679, label: 'V25', start: 0, display: 0 },
                    { x: 2.702, y: 5.324, label: 'V26', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 2.467, direction: 0, sweep: 0 },

                ],
            },
        ],
    },

    'RightPedestrian': {
        path: [ // 3.5.7.22
            {
                'vertex': [
                    { x: 0.384, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 0.384, y: 2.565, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 1.283, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V1', radius: 1.283, direction: 1, sweep: 0 },

                ], 
            },
            {
                'vertex': [
                    { x: -2.016, y: 4.248, label: 'V3', start: 1, display: 1 },
                    { x: 2.378, y: 4.565, label: 'V4', start: 0, display: 0 },
                    { x: 2.86, y: 6.006, label: 'V5', start: 0, display: 0 },
                    { x: 4.498, y: 7.505, label: 'V6', start: 0, display: 0 },
                    { x: 4.035, y: 8.254, label: 'V7', start: 0, display: 0 },
                    { x: 2.136, y: 6.641, label: 'V8', start: 0, display: 0 },
                    { x: 1.552, y: 6, label: 'V9', start: 0, display: 0 },
                    { x: 1.343, y: 8.483, label: 'V10', start: 0, display: 0 },
                    { x: 2.803, y: 12.470, label: 'V11', start: 0, display: 0 },
                    { x: 3, y: 16, label: 'V12', start: 0, display: 0 },
                    { x: 2.003, y: 16, label: 'V13', start: 0, display: 0 },
                    { x: 1.343, y: 12.4, label: 'V14', start: 0, display: 0 },
                    { x: -0.181, y: 9.683, label: 'V15', start: 0, display: 0 },
                    { x: -0.181, y: 9.683, label: 'V16', start: 0, display: 0 },
                    { x: -0.981, y: 11.606, label: 'V17', start: 0, display: 0 },
                    { x: -3.73, y: 15.314, label: 'V18', start: 0, display: 0 },
                    { x: -4.498, y: 14.502, label: 'V19', start: 0, display: 0 },
                    { x: -4.498, y: 14.502, label: 'V20', start: 0, display: 0 },
                    { x: -2.943, y: 12.019, label: 'V21', start: 0, display: 0 },
                    { x: -1.171, y: 5.244, label: 'V22', start: 0, display: 0 },
                    { x: -1.698, y: 5.765, label: 'V23', start: 0, display: 0 },
                    { x: -2.498, y: 9.003, label: 'V24', start: 0, display: 0 },
                    { x: -3.292, y: 8.679, label: 'V25', start: 0, display: 0 },
                    { x: -2.702, y: 5.324, label: 'V26', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 2.467, direction: 1, sweep: 0 },

                ],
            },
        ],
    },

    'LeftDisabled': {
        path: [ // 3.5.7.24
            {
                'vertex': [
                    { x: 4.275, y: 2.032, label: 'V1', start: 1, display: 1 },
                    { x: 2.844, y: 3.547, label: 'V2', start: 0, display: 0 },
                    { x: 2.633, y: 6.637, label: 'V3', start: 0, display: 0 },
                    { x: -1.566, y: 6.637, label: 'V4', start: 0, display: 0 },
                    { x: -1.566, y: 7.992, label: 'V5', start: 0, display: 0 },
                    { x: 2.531, y: 7.992, label: 'V6', start: 0, display: 0 },
                    { x: 2.463, y: 9.075, label: 'V7', start: 0, display: 0 },
                    { x: -3.031, y: 9.075, label: 'V8', start: 0, display: 0 },
                    { x: -5.291, y: 14.002, label: 'V9', start: 0, display: 0 },
                    { x: -5.291, y: 14.002, label: 'V10', start: 0, display: 0 },
                    { x: -6.857, y: 13.350, label: 'V11', start: 0, display: 0 },
                    { x: -7.213, y: 14.281, label: 'V12', start: 0, display: 0 },
                    { x: -4.368, y: 15.458, label: 'V13', start: 0, display: 0 },
                    { x: -2.108, y: 10.523, label: 'V14', start: 0, display: 0 },
                    { x: 3.683, y: 10.523, label: 'V15', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 1.645, direction: 0, sweep: 1 },

                ], 
            },
            {
                'vertex': [
                    { x: 4.605, y: 7.272, label: 'V16', start: 1, display: 1 },
                    { x: 4.495, y: 8.880, label: 'V17', start: 0, display: 0 },
                    { x: -1.998, y: 11.970, label: 'V18', start: 0, display: 0 },
                    { x: -2.980, y: 14.104, label: 'V19', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V17', end: 'V18', radius: 4, direction: 1, sweep: 1 },
                    { start: 'V19', end: 'V16', radius: 5.4, direction: 0, sweep: 1 },

                ],
            },
        ],
    },

    'RightDisabled': {
        path: [ // 3.5.7.24
            {
                'vertex': [
                    { x: -4.275, y: 2.032, label: 'V1', start: 1, display: 1 },
                    { x: -2.844, y: 3.547, label: 'V2', start: 0, display: 0 },
                    { x: -2.633, y: 6.637, label: 'V3', start: 0, display: 0 },
                    { x: 1.566, y: 6.637, label: 'V4', start: 0, display: 0 },
                    { x: 1.566, y: 7.992, label: 'V5', start: 0, display: 0 },
                    { x: -2.531, y: 7.992, label: 'V6', start: 0, display: 0 },
                    { x: -2.463, y: 9.075, label: 'V7', start: 0, display: 0 },
                    { x: 3.031, y: 9.075, label: 'V8', start: 0, display: 0 },
                    { x: 5.291, y: 14.002, label: 'V9', start: 0, display: 0 },
                    { x: 5.291, y: 14.002, label: 'V10', start: 0, display: 0 },
                    { x: 6.857, y: 13.350, label: 'V11', start: 0, display: 0 },
                    { x: 7.213, y: 14.281, label: 'V12', start: 0, display: 0 },
                    { x: 4.368, y: 15.458, label: 'V13', start: 0, display: 0 },
                    { x: 2.108, y: 10.523, label: 'V14', start: 0, display: 0 },
                    { x: -3.683, y: 10.523, label: 'V15', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 1.645, direction: 1, sweep: 1 },

                ], 
            },
            {
                'vertex': [
                    { x: -4.605, y: 7.272, label: 'V16', start: 1, display: 1 },
                    { x: -4.495, y: 8.880, label: 'V17', start: 0, display: 0 },
                    { x: 1.998, y: 11.970, label: 'V18', start: 0, display: 0 },
                    { x: 2.980, y: 14.104, label: 'V19', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V17', end: 'V18', radius: 4, direction: 0, sweep: 1 },
                    { start: 'V19', end: 'V16', radius: 5.4, direction: 1, sweep: 1 },

                ],
            },
        ],
    },    'LeftArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: -4, y: 0, label: 'V2', start: 0, display: 0 },
                { x: -8, y: 4, label: 'V3', start: 0, display: 0 },
                { x: -4, y: 8, label: 'V4', start: 0, display: 0 },
                { x: -0, y: 8, label: 'V5', start: 0, display: 0 },
                { x: -2.667, y: 5.333, label: 'V6', start: 0, display: 0 },
                { x: -0.667, y: 5.333, label: 'V7', start: 0, display: 0 },
                { x: 3.333, y: 9.333, label: 'V8', start: 0, display: 0 },
                { x: 3.333, y: 18, label: 'V9', start: 0, display: 0 },
                { x: 6, y: 18, label: 'V10', start: 0, display: 0 },
                { x: 6, y: 9.333, label: 'V11', start: 0, display: 0 },
                { x: 0, y: 2.667, label: 'V12', start: 0, display: 0 },
                { x: -2.667, y: 2.667, label: 'V13', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 4, direction: 1, sweep: 0 },
                { start: 'V11', end: 'V12', radius: 6.667, direction: 0, sweep: 0 },
            ]
        }],
    },
    'RightArrow': {
        path: [{
            'vertex': [
                { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                { x: 4, y: 0, label: 'V2', start: 0, display: 0 },
                { x: 8, y: 4, label: 'V3', start: 0, display: 0 },
                { x: 4, y: 8, label: 'V4', start: 0, display: 0 },
                { x: 0, y: 8, label: 'V5', start: 0, display: 0 },
                { x: 2.667, y: 5.333, label: 'V6', start: 0, display: 0 },
                { x: 0.667, y: 5.333, label: 'V7', start: 0, display: 0 },
                { x: -3.333, y: 9.333, label: 'V8', start: 0, display: 0 },
                { x: -3.333, y: 18, label: 'V9', start: 0, display: 0 },
                { x: -6, y: 18, label: 'V10', start: 0, display: 0 },
                { x: -6, y: 9.333, label: 'V11', start: 0, display: 0 },
                { x: 0, y: 2.667, label: 'V12', start: 0, display: 0 },
                { x: 2.667, y: 2.667, label: 'V13', start: 0, display: 0 },

            ], 'arcs': [
                { start: 'V7', end: 'V8', radius: 4, direction: 0, sweep: 0 },
                { start: 'V11', end: 'V12', radius: 6.667, direction: 1, sweep: 0 },
            ]
        }],
    },

    'LeftBike': {
        path: [
            {
                'vertex': [
                    { x: -3.75, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: -3.75, y: 1, label: 'V2', start: 0, display: 0 },
                    { x: -6.2, y: 1, label: 'V3', start: 0, display: 0 },
                    { x: -5.17, y: 2.47, label: 'V4', start: 0, display: 0 },
                    { x: -5.14, y: 3.75, label: 'V5', start: 0, display: 0 },
                    { x: 4.30, y: 3.75, label: 'V6', start: 0, display: 0 },
                    { x: 5.15, y: 2.22, label: 'V7', start: 0, display: 0 },
                    { x: 2.50, y: 1.24, label: 'V8', start: 0, display: 0 },
                    { x: 2.50, y: 1, label: 'V9', start: 0, display: 0 },
                    { x: 7.25, y: 1, label: 'V10', start: 0, display: 0 },
                    { x: 7.25, y: 1.61, label: 'V11', start: 0, display: 0 },
                    { x: 6.14, y: 2.49, label: 'V12', start: 0, display: 0 },
                    { x: 5.45, y: 3.75, label: 'V13', start: 0, display: 0 },
                    { x: 6.97, y: 6.43, label: 'V14', start: 0, display: 0 },
                    { x: 4.03, y: 11.45, label: 'V15', start: 0, display: 0 },
                    { x: 2.42, y: 11.45, label: 'V16', start: 0, display: 0 },
                    { x: 1.65, y: 12.35, label: 'V17', start: 0, display: 0 },
                    { x: 1.84, y: 12.87, label: 'V18', start: 0, display: 0 },
                    { x: 2.25, y: 12.87, label: 'V19', start: 0, display: 0 },
                    { x: 2.25, y: 13.12, label: 'V20', start: 0, display: 0 },
                    { x: 1.93, y: 13.12, label: 'V21', start: 0, display: 0 },
                    { x: 1.93, y: 13.25, label: 'V22', start: 0, display: 0 },
                    { x: 1.62, y: 13.25, label: 'V23', start: 0, display: 0 },
                    { x: 1.62, y: 13.12, label: 'V24', start: 0, display: 0 },
                    { x: 1.25, y: 13.12, label: 'V25', start: 0, display: 0 },
                    { x: 1.25, y: 12.87, label: 'V26', start: 0, display: 0 },
                    { x: 1.53, y: 12.87, label: 'V27', start: 0, display: 0 },
                    { x: 1.37, y: 12.45, label: 'V28', start: 0, display: 0 },
                    { x: -0.5, y: 10.97, label: 'V29', start: 0, display: 0 },
                    { x: -6.03, y: 6.52, label: 'V30', start: 0, display: 0 },
                    { x: -6.15, y: 6.89, label: 'V31', start: 0, display: 0 },
                    { x: -7.05, y: 6.39, label: 'V32', start: 0, display: 0 },
                    { x: -6.01, y: 3.23, label: 'V33', start: 0, display: 0 },
                    { x: -6.05, y: 2.97, label: 'V34', start: 0, display: 0 },
                    { x: -7.43, y: 0.98, label: 'V35', start: 0, display: 0 },
                    { x: -6.93, y: 0, label: 'V36', start: 0, display: 0 },
                    { x: 4.03, y: 4.75, label: 'V37', start: 1, display: 0 },
                    { x: -5.46, y: 4.75, label: 'V38', start: 0, display: 0 },
                    { x: -5.70, y: 5.50, label: 'V39', start: 0, display: 0 },
                    { x: -0.11, y: 10.0, label: 'V40', start: 0, display: 0 },
                    { x: 0.35, y: 9.65, label: 'V41', start: 0, display: 0 },
                    { x: 0.16, y: 9.12, label: 'V42', start: 0, display: 0 },
                    { x: -0.25, y: 9.12, label: 'V43', start: 0, display: 0 },
                    { x: -0.25, y: 8.87, label: 'V44', start: 0, display: 0 },
                    { x: -0.07, y: 8.87, label: 'V45', start: 0, display: 0 },
                    { x: -0.07, y: 8.74, label: 'V46', start: 0, display: 0 },
                    { x: 0.39, y: 8.74, label: 'V47', start: 0, display: 0 },
                    { x: 0.39, y: 8.87, label: 'V48', start: 0, display: 0 },
                    { x: 0.75, y: 8.87, label: 'V49', start: 0, display: 0 },
                    { x: 0.75, y: 9.12, label: 'V50', start: 0, display: 0 },
                    { x: 0.48, y: 9.12, label: 'V51', start: 0, display: 0 },
                    { x: 0.63, y: 9.55, label: 'V52', start: 0, display: 0 },
                    { x: 1.27, y: 9.52, label: 'V53', start: 0, display: 0 },
                    { x: 5.03, y: 5.03, label: 'V54', start: 1, display: 0 },
                    { x: 2.14, y: 10.03, label: 'V55', start: 0, display: 0 },
                    { x: 2.41, y: 10.50, label: 'V56', start: 0, display: 0 },
                    { x: 4.03, y: 10.50, label: 'V57', start: 0, display: 0 },
                    { x: 6.10, y: 6.92, label: 'V58', start: 0, display: 0 },
                    { x: 6.60, y: 7.80, label: 'V60', start: 1, display: 0 },
                    { x: 5.04, y: 10.50, label: 'V61', start: 0, display: 0 },
                    { x: 8.14, y: 10.50, label: 'V62', start: 0, display: 0 },
                    { x: 7.47, y: 7.30, label: 'V63', start: 1, display: 0 },
                    { x: 9.45, y: 10.77, label: 'V64', start: 0, display: 0 },
                    { x: 9, y: 11.50, label: 'V65', start: 0, display: 0 },
                    { x: 5.04, y: 11.50, label: 'V66', start: 0, display: 0 },
                    { x: -6.48, y: 7.89, label: 'V67', start: 1, display: 0 },
                    { x: -6.84, y: 8.98, label: 'V68', start: 0, display: 0 },
                    { x: -8.71, y: 11.40, label: 'V69', start: 0, display: 0 },
                    { x: -9.24, y: 10.55, label: 'V70', start: 0, display: 0 },
                    { x: -7.79, y: 8.69, label: 'V71', start: 0, display: 0 },
                    { x: -7.36, y: 7.35, label: 'V72', start: 0, display: 0 },
                    { x: 1.01, y: 9.75, label: 'V73', start: 1, display: 0 },
                    { x: 1.01, y: 12.25, label: 'V74', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V4', end: 'V5', radius: 1.35, direction: 1, sweep: 0 },
                    { start: 'V11', end: 'V12', radius: 1, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V15', radius: 5, direction: 1, sweep: 1 },
                    { start: 'V16', end: 'V17', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V28', end: 'V29', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V31', end: 'V32', radius: 5, direction: 1, sweep: 1 },
                    { start: 'V33', end: 'V34', radius: 0.3, direction: 0, sweep: 0 },
                    { start: 'V35', end: 'V36', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V40', end: 'V41', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V45', end: 'V46', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V55', end: 'V56', radius: 1.5, direction: 1, sweep: 0 },
                    { start: 'V57', end: 'V58', radius: 5, direction: 1, sweep: 0 },
                    { start: 'V60', end: 'V61', radius: 4, direction: 0, sweep: 0 },
                    { start: 'V64', end: 'V65', radius: 0.5, direction: 1, sweep: 0 },
                    { start: 'V66', end: 'V63', radius: 4, direction: 0, sweep: 1 },
                    { start: 'V68', end: 'V69', radius: 4.5, direction: 1, sweep: 0 },
                    { start: 'V69', end: 'V70', radius: 0.5, direction: 1, sweep: 0 },
                    { start: 'V70', end: 'V71', radius: 4.5, direction: 0, sweep: 0 },
                    { start: 'V72', end: 'V67', radius: 4, direction: 0, sweep: 1 },
                    { start: 'V73', end: 'V74', radius: 1.25, direction: 0, sweep: 0 },
                    { start: 'V74', end: 'V73', radius: 1.25, direction: 0, sweep: 0 },
                ]
            },
        ],
    },

    'RightBike': {
        path: [
            {
                'vertex': [
                    { x: 3.75, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 3.75, y: 1, label: 'V2', start: 0, display: 0 },
                    { x: 6.2, y: 1, label: 'V3', start: 0, display: 0 },
                    { x: 5.17, y: 2.47, label: 'V4', start: 0, display: 0 },
                    { x: 5.14, y: 3.75, label: 'V5', start: 0, display: 0 },
                    { x: -4.30, y: 3.75, label: 'V6', start: 0, display: 0 },
                    { x: -5.15, y: 2.22, label: 'V7', start: 0, display: 0 },
                    { x: -2.50, y: 1.24, label: 'V8', start: 0, display: 0 },
                    { x: -2.50, y: 1, label: 'V9', start: 0, display: 0 },
                    { x: -7.25, y: 1, label: 'V10', start: 0, display: 0 },
                    { x: -7.25, y: 1.61, label: 'V11', start: 0, display: 0 },
                    { x: -6.14, y: 2.49, label: 'V12', start: 0, display: 0 },
                    { x: -5.45, y: 3.75, label: 'V13', start: 0, display: 0 },
                    { x: -6.97, y: 6.43, label: 'V14', start: 0, display: 0 },
                    { x: -4.03, y: 11.45, label: 'V15', start: 0, display: 0 },
                    { x: -2.42, y: 11.45, label: 'V16', start: 0, display: 0 },
                    { x: -1.65, y: 12.35, label: 'V17', start: 0, display: 0 },
                    { x: -1.84, y: 12.87, label: 'V18', start: 0, display: 0 },
                    { x: -2.25, y: 12.87, label: 'V19', start: 0, display: 0 },
                    { x: -2.25, y: 13.12, label: 'V20', start: 0, display: 0 },
                    { x: -1.93, y: 13.12, label: 'V21', start: 0, display: 0 },
                    { x: -1.93, y: 13.25, label: 'V22', start: 0, display: 0 },
                    { x: -1.62, y: 13.25, label: 'V23', start: 0, display: 0 },
                    { x: -1.62, y: 13.12, label: 'V24', start: 0, display: 0 },
                    { x: -1.25, y: 13.12, label: 'V25', start: 0, display: 0 },
                    { x: -1.25, y: 12.87, label: 'V26', start: 0, display: 0 },
                    { x: -1.53, y: 12.87, label: 'V27', start: 0, display: 0 },
                    { x: -1.37, y: 12.45, label: 'V28', start: 0, display: 0 },
                    { x: 0.5, y: 10.97, label: 'V29', start: 0, display: 0 },
                    { x: 6.03, y: 6.52, label: 'V30', start: 0, display: 0 },
                    { x: 6.15, y: 6.89, label: 'V31', start: 0, display: 0 },
                    { x: 7.05, y: 6.39, label: 'V32', start: 0, display: 0 },
                    { x: 6.01, y: 3.23, label: 'V33', start: 0, display: 0 },
                    { x: 6.05, y: 2.97, label: 'V34', start: 0, display: 0 },
                    { x: 7.43, y: 0.98, label: 'V35', start: 0, display: 0 },
                    { x: 6.93, y: 0, label: 'V36', start: 0, display: 0 },
                    { x: -4.03, y: 4.75, label: 'V37', start: 1, display: 0 },
                    { x: 5.46, y: 4.75, label: 'V38', start: 0, display: 0 },
                    { x: 5.70, y: 5.50, label: 'V39', start: 0, display: 0 },
                    { x: 0.11, y: 10.0, label: 'V40', start: 0, display: 0 },
                    { x: -0.35, y: 9.65, label: 'V41', start: 0, display: 0 },
                    { x: -0.16, y: 9.12, label: 'V42', start: 0, display: 0 },
                    { x: 0.25, y: 9.12, label: 'V43', start: 0, display: 0 },
                    { x: -0.25, y: 8.87, label: 'V44', start: 0, display: 0 },
                    { x: 0.07, y: 8.87, label: 'V45', start: 0, display: 0 },
                    { x: 0.07, y: 8.74, label: 'V46', start: 0, display: 0 },
                    { x: -0.39, y: 8.74, label: 'V47', start: 0, display: 0 },
                    { x: -0.39, y: 8.87, label: 'V48', start: 0, display: 0 },
                    { x: -0.75, y: 8.87, label: 'V49', start: 0, display: 0 },
                    { x: -0.75, y: 9.12, label: 'V50', start: 0, display: 0 },
                    { x: -0.48, y: 9.12, label: 'V51', start: 0, display: 0 },
                    { x: -0.63, y: 9.55, label: 'V52', start: 0, display: 0 },
                    { x: -1.27, y: 9.52, label: 'V53', start: 0, display: 0 },
                    { x: -5.03, y: 5.03, label: 'V54', start: 1, display: 0 },
                    { x: -2.14, y: 10.03, label: 'V55', start: 0, display: 0 },
                    { x: -2.41, y: 10.50, label: 'V56', start: 0, display: 0 },
                    { x: -4.03, y: 10.50, label: 'V57', start: 0, display: 0 },
                    { x: -6.10, y: 6.92, label: 'V58', start: 0, display: 0 },
                    { x: -6.60, y: 7.80, label: 'V60', start: 1, display: 0 },
                    { x: -5.04, y: 10.50, label: 'V61', start: 0, display: 0 },
                    { x: -8.14, y: 10.50, label: 'V62', start: 0, display: 0 },
                    { x: -7.47, y: 7.30, label: 'V63', start: 1, display: 0 },
                    { x: -9.45, y: 10.77, label: 'V64', start: 0, display: 0 },
                    { x: -9, y: 11.50, label: 'V65', start: 0, display: 0 },
                    { x: -5.04, y: 11.50, label: 'V66', start: 0, display: 0 },
                    { x: 6.48, y: 7.89, label: 'V67', start: 1, display: 0 },
                    { x: 6.84, y: 8.98, label: 'V68', start: 0, display: 0 },
                    { x: 8.71, y: 11.40, label: 'V69', start: 0, display: 0 },
                    { x: 9.24, y: 10.55, label: 'V70', start: 0, display: 0 },
                    { x: 7.79, y: 8.69, label: 'V71', start: 0, display: 0 },
                    { x: 7.36, y: 7.35, label: 'V72', start: 0, display: 0 },
                    { x: -1.01, y: 9.75, label: 'V73', start: 1, display: 0 },
                    { x: -1.01, y: 12.25, label: 'V74', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V4', end: 'V5', radius: 1.35, direction: 0, sweep: 0 },
                    { start: 'V11', end: 'V12', radius: 1, direction: 0, sweep: 0 },
                    { start: 'V14', end: 'V15', radius: 5, direction: 0, sweep: 1 },
                    { start: 'V16', end: 'V17', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V28', end: 'V29', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V31', end: 'V32', radius: 5, direction: 0, sweep: 1 },
                    { start: 'V33', end: 'V34', radius: 0.3, direction: 1, sweep: 0 },
                    { start: 'V35', end: 'V36', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V40', end: 'V41', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V45', end: 'V46', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V55', end: 'V56', radius: 1.5, direction: 0, sweep: 0 },
                    { start: 'V57', end: 'V58', radius: 5, direction: 0, sweep: 0 },
                    { start: 'V60', end: 'V61', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V64', end: 'V65', radius: 0.5, direction: 0, sweep: 0 },
                    { start: 'V66', end: 'V63', radius: 4, direction: 1, sweep: 1 },
                    { start: 'V68', end: 'V69', radius: 4.5, direction: 0, sweep: 0 },
                    { start: 'V69', end: 'V70', radius: 0.5, direction: 0, sweep: 0 },
                    { start: 'V70', end: 'V71', radius: 4.5, direction: 1, sweep: 0 },
                    { start: 'V72', end: 'V67', radius: 4, direction: 1, sweep: 1 },
                    { start: 'V73', end: 'V74', radius: 1.25, direction: 1, sweep: 0 },
                    { start: 'V74', end: 'V73', radius: 1.25, direction: 1, sweep: 0 },
                ]
            },
        ],
    },

};

const symbolsTemplateAlt = {
    'Hospital': {
        path: [ // 3.5.7.31
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 0, y: 17, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V1', radius: 8.5, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V3', start: 1, display: 1 },
                    { x: 0, y: 16.5, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': '#ffffff'
            },
            {
                'vertex': [
                    { x: 0, y: 2, label: 'V5', start: 1, display: 0 },
                    { x: 2, y: 2, label: 'V6', start: 0, display: 0 },
                    { x: 2, y: 6.5, label: 'V7', start: 0, display: 0 },
                    { x: 6.5, y: 6.5, label: 'V8', start: 0, display: 0 },
                    { x: 6.5, y: 10.5, label: 'V9', start: 0, display: 0 },
                    { x: 2, y: 10.5, label: 'V10', start: 0, display: 0 },
                    { x: 2, y: 15, label: 'V11', start: 0, display: 0 },
                    { x: -2, y: 15, label: 'V12', start: 0, display: 0 },
                    { x: -2, y: 10.5, label: 'V13', start: 0, display: 0 },
                    { x: -6.5, y: 10.5, label: 'V14', start: 0, display: 0 },
                    { x: -6.5, y: 6.5, label: 'V15', start: 0, display: 0 },
                    { x: -2, y: 6.5, label: 'V16', start: 0, display: 0 },
                    { x: -2, y: 2, label: 'V17', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#ff0101'
            },
        ],
        text: []
    },
    'Route1': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '1', x: -1.56, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    'Route2': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '2', x: -2.4, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route3': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '3', x: -2.54, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route4': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '4', x: -2.64, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route5': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '5', x: -2.44, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route6': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '6', x: -2.52, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route7': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '7', x: -2.08, y: -0.7, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route8': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '8', x: -2.76, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route9': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 4.5, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 4.5, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V4', start: 0, display: 0 },
                    { x: -4.5, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4.5, y: 0, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 6, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 6, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 4, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 4, y: 3, label: 'V3', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V4', start: 0, display: 0 },
                    { x: -4, y: 3, label: 'V5', start: 0, display: 0 },
                    { x: -4, y: 0.5, label: 'V6', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 5.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 5.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '9', x: -2.56, y: -0.6, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route10': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 }, //https://www.wolframalpha.com/input?i2d=true&i=72.25+%3D+Power%5B%5C%2840%29x-7%5C%2841%29%2C2%5D+%2B+Power%5B%5C%2840%29y-0.2412%5C%2841%29%2C2%5D%5C%2844%29+12.25%3D+Power%5B%5C%2840%29x-3.5%5C%2841%29%2C2%5D+%2B+Power%5By%2B3.32952%2C2%5D
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 5.5, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 5.5, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.45, y: 6.329, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V5', start: 0, display: 0 },
                    { x: -4.45, y: 6.329, label: 'V6', start: 0, display: 0 },
                    { x: -5.5, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -5.5, y: 0.5, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 3.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 3.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '10', x: -4.22, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route11': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 5.5, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 5.5, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.45, y: 6.329, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V5', start: 0, display: 0 },
                    { x: -4.45, y: 6.329, label: 'V6', start: 0, display: 0 },
                    { x: -5.5, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -5.5, y: 0.5, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 3.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 3.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '11', x: -3.12, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Route12': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 6, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 6, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.8, y: 6.6861, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 9, label: 'V5', start: 0, display: 0 },
                    { x: -4.8, y: 6.6861, label: 'V6', start: 0, display: 0 },
                    { x: -6, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -6, y: 0, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 4, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 9, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 4, direction: 1, sweep: 0 },
                ], 'fill': '#000000'
            },
            {
                'vertex': [
                    { x: 0, y: 0.5, label: 'V1', start: 1, display: 1 },
                    { x: 5.5, y: 0.5, label: 'V2', start: 0, display: 0 },
                    { x: 5.5, y: 3.8295, label: 'V3', start: 0, display: 0 },
                    { x: 4.45, y: 6.329, label: 'V4', start: 0, display: 0 },
                    { x: 0, y: 8.5, label: 'V5', start: 0, display: 0 },
                    { x: -4.45, y: 6.329, label: 'V6', start: 0, display: 0 },
                    { x: -5.5, y: 3.8295, label: 'V7', start: 0, display: 0 },
                    { x: -5.5, y: 0.5, label: 'V8', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V3', end: 'V4', radius: 3.5, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V5', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V5', end: 'V6', radius: 8.5, direction: 1, sweep: 0 },
                    { start: 'V6', end: 'V7', radius: 3.5, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(233, 181, 0)'
            },
        ],
        text: [
            { character: '12', x: -3.96, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
}

const textWidthMedium = [{ char: ' ', width: 50, shortWidth: 0 }, { char: 'A', width: 136, shortWidth: 0 }, { char: 'B', width: 147, shortWidth: 0 }, { char: 'C', width: 148, shortWidth: 0 }, { char: 'D', width: 154, shortWidth: 0 }, { char: 'E', width: 132, shortWidth: 0 }, { char: 'F', width: 119, shortWidth: 0 }, { char: 'G', width: 155, shortWidth: 0 }, { char: 'H', width: 160, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 93, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 107, shortWidth: 0 }, { char: 'M', width: 184, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 156, shortWidth: 0 }, { char: 'P', width: 130, shortWidth: 0 }, { char: 'Q', width: 158, shortWidth: 0 }, { char: 'R', width: 141, shortWidth: 0 }, { char: 'S', width: 137, shortWidth: 0 }, { char: 'T', width: 109, shortWidth: 105 }, { char: 'U', width: 154, shortWidth: 0 }, { char: 'V', width: 130, shortWidth: 120 }, { char: 'W', width: 183, shortWidth: 189 }, { char: 'X', width: 128, shortWidth: 0 }, { char: 'Y', width: 123, shortWidth: 118 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 103, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 109, shortWidth: 102 }, { char: 'f', width: 75, shortWidth: 0 }, { char: 'g', width: 114, shortWidth: 107 }, { char: 'h', width: 112, shortWidth: 0 }, { char: 'i', width: 54, shortWidth: 0 }, { char: 'j', width: 58, shortWidth: 0 }, { char: 'k', width: 108, shortWidth: 0 }, { char: 'l', width: 62, shortWidth: 0 }, { char: 'm', width: 164, shortWidth: 0 }, { char: 'n', width: 112, shortWidth: 0 }, { char: 'o', width: 118, shortWidth: 111 }, { char: 'p', width: 118, shortWidth: 0 }, { char: 'q', width: 118, shortWidth: 0 }, { char: 'r', width: 73, shortWidth: 59 }, { char: 's', width: 97, shortWidth: 95 }, { char: 't', width: 81, shortWidth: 0 }, { char: 'u', width: 115, shortWidth: 101 }, { char: 'v', width: 98, shortWidth: 0 }, { char: 'w', width: 147, shortWidth: 145 }, { char: 'x', width: 104, shortWidth: 0 }, { char: 'y', width: 98, shortWidth: 96 }, { char: 'z', width: 97, shortWidth: 0 }, { char: '1', width: 78, shortWidth: 0 }, { char: '2', width: 120, shortWidth: 0 }, { char: '3', width: 127, shortWidth: 0 }, { char: '4', width: 132, shortWidth: 0 }, { char: '5', width: 122, shortWidth: 0 }, { char: '6', width: 126, shortWidth: 0 }, { char: '7', width: 104, shortWidth: 0 }, { char: '8', width: 130, shortWidth: 0 }, { char: '9', width: 128, shortWidth: 0 }, { char: '0', width: 133, shortWidth: 0 }, { char: ',', width: 53, shortWidth: 0 }, { char: '.', width: 53, shortWidth: 0 }, { char: "'", width: 39, shortWidth: 0 }, { char: ':', width: 53, shortWidth: 0 }, { char: '•', width: 53, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 66, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 105, shortWidth: 0 }, { char: ')', width: 105, shortWidth: 0 }, { char: '/', width: 85, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }]
const textWidthHeavy = [{ char: ' ', width: 50, shortWidth: 0 }, { char: 'A', width: 142, shortWidth: 0 }, { char: 'B', width: 146, shortWidth: 0 }, { char: 'C', width: 151, shortWidth: 0 }, { char: 'D', width: 150, shortWidth: 0 }, { char: 'E', width: 136, shortWidth: 0 }, { char: 'F', width: 121, shortWidth: 0 }, { char: 'G', width: 156, shortWidth: 0 }, { char: 'H', width: 159, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 95, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 118, shortWidth: 0 }, { char: 'M', width: 186, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 158, shortWidth: 0 }, { char: 'P', width: 134, shortWidth: 0 }, { char: 'Q', width: 161, shortWidth: 0 }, { char: 'R', width: 148, shortWidth: 0 }, { char: 'S', width: 146, shortWidth: 0 }, { char: 'T', width: 118, shortWidth: 113 }, { char: 'U', width: 157, shortWidth: 0 }, { char: 'V', width: 133, shortWidth: 127 }, { char: 'W', width: 193, shortWidth: 196 }, { char: 'X', width: 130, shortWidth: 0 }, { char: 'Y', width: 128, shortWidth: 125 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 107, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 110, shortWidth: 103 }, { char: 'f', width: 79, shortWidth: 0 }, { char: 'g', width: 117, shortWidth: 110 }, { char: 'h', width: 119, shortWidth: 0 }, { char: 'i', width: 55, shortWidth: 0 }, { char: 'j', width: 71, shortWidth: 0 }, { char: 'k', width: 114, shortWidth: 0 }, { char: 'l', width: 63, shortWidth: 0 }, { char: 'm', width: 173, shortWidth: 0 }, { char: 'n', width: 119, shortWidth: 0 }, { char: 'o', width: 115, shortWidth: 107 }, { char: 'p', width: 120, shortWidth: 0 }, { char: 'q', width: 120, shortWidth: 0 }, { char: 'r', width: 80, shortWidth: 67 }, { char: 's', width: 100, shortWidth: 98 }, { char: 't', width: 84, shortWidth: 0 }, { char: 'u', width: 120, shortWidth: 107 }, { char: 'v', width: 107, shortWidth: 0 }, { char: 'w', width: 160, shortWidth: 154 }, { char: 'x', width: 110, shortWidth: 0 }, { char: 'y', width: 106, shortWidth: 104 }, { char: 'z', width: 93, shortWidth: 0 }, { char: '1', width: 84, shortWidth: 0 }, { char: '2', width: 125, shortWidth: 0 }, { char: '3', width: 136, shortWidth: 0 }, { char: '4', width: 138, shortWidth: 0 }, { char: '5', width: 130, shortWidth: 0 }, { char: '6', width: 129, shortWidth: 0 }, { char: '7', width: 107, shortWidth: 0 }, { char: '8', width: 138, shortWidth: 0 }, { char: '9', width: 129, shortWidth: 0 }, { char: '0', width: 145, shortWidth: 0 }, { char: ',', width: 56, shortWidth: 0 }, { char: '.', width: 56, shortWidth: 0 }, { char: "'", width: 41, shortWidth: 0 }, { char: ':', width: 56, shortWidth: 0 }, { char: '•', width: 56, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 71, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 115, shortWidth: 0 }, { char: ')', width: 115, shortWidth: 0 }, { char: '/', width: 88, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }]

const EngDestinations = [{ "Hong Kong Island": ["Hong Kong", "Hong Kong(E)", "Hong Kong(S)", "Hong Kong(W)", "Aberdeen", "Ap Lei Chau", "Causeway Bay", "Central", "Chai Wan", "Chung Hom Kok", "Cyberport", "Hang Fa Tsuen", "Happy Valley", "Kennedy Town", "Kornhill", "Mid-levels", "North Point", "Pok Fu Lam", "Quarry Bay", "Repulse Bay", "Sai Wan", "Sai Wan Ho", "Sai Ying Pun", "Shau Kei Wan", "Shek O", "Shek Tong Tsui", "Sheung Wan", "Shouson Hill", "Stanley", "Siu Sai Wan", "Tai Hang", "Tai Koo Shing", "The Peak", "Wah Fu", "Wan Chai", "Wan Chai(N)", "Wong Chuk Hang"] },
{ "Kowloon": ["Kowloon", "Kowloon(C)", "Kowloon(E)", "Kowloon(W)", "Beacon Hill", "Cha Kwo Ling", "Cheung Sha Wan", "Cheung Sha Wan(W)", "Choi Hung", "Chuk Yuen", "Cruise Terminal", "Diamond Hill", "Hang Hau", "Ho Man Tin", "Hung Hom", "Hung Hom Bay", "Kai Tak", "King's Park", "Kowloon Bay", "Kowloon City", "Kowloon Tong", "Kwun Tong", "Kwun Tong Business Area", "Lai Chi Kok", "Lai Chi Kok(S)", "Lam Tin", "Lok Fu", "Ma Tau Wai", "Mei Foo", "Mong Kok", "Ngau Chi Wan", "Ngau Tau Kok", "Ngong Shuen Chau", "Ping Shek", "Po Lam", "San Po Kong", "Sham Shui Po", "Sham Shui Po(W)", "Shek Kip Mei", "Sau Mau Ping", "Tai Kok Tsui", "Tai Kok Tsui(W)", "Tiu Keng Leng", "To Kwan Wan", "Tsim Sha Tsui", "Tsim Sha Tsui East", "Tsz Wan Shan", "Wang Tau Hom", "West Kowloon Cultural District", "West Kowloon Terminus", "Wong Tai Sin", "Yau Ma Tei", "Yau Ma Tei(W)", "Yau Tong", "Yau Yat Chuen"] },
{ "New Terriitories": ["Lantau", "Airport", "Au Tau", "Clear Water Bay", "Discovery Bay", "Fairview Park", "Fanling", "Fo Tan", "Ha Tsuen", "Hin Tin", "Heung Yuen Wai", "Hong Lok Yuen", "Hung Shui Kiu", "Kam Tin", "Kwai Chung", "Kwai Fong", "Kwai Hing", "Kwu Tung", "Lai King", "Lam Tei", "Lantau(S)", "Lau Fau Shan", "Lei Muk Shue", "Lok Ma Chau", "Long Ping", "Luen Wo Hui", "Luk Keng", "Lung Kwu Tan", "Ma On Shan", "Ma On Shan Town Centre", "Ma Liu Sui", "Ma Wan", "Man Kam To", "Mui Wo", "Ngong Ping", "On Lok Tsuen", "Pak Shek Kok", "Pak Tam Chung", "Pat Heung", "Ping Che", "Ping Shan", "Pui O", "River Trade Terminal", "Sai Sha", "Sai Kung", "Sam Shing Hui", "San Tin", "San Hui", "Science Park", "Sha Tau Kok", "Sha Tin", "Sha Tin Central", "Sham Tseng", "Shek Kong", "Shek Lei", "Shek Pik", "Shek Wu Hui", "Shek Yam", "Shenzhen Bay", "Sheung Shui", "Sheung Tak", "Siu Lam", "Siu Lek Yuen", "So Kwun Wat", "Tai Hing", "Tai Mei Tuk", "Tai O", "Tai Po", "Tai Po Industrial Estate", "Tai Po Kau", "Tai Po Market", "Tai Po Town Centre", "Tai Po(N)", "Tai Po(S)", "Tai Shui Hang", "Tai Wai", "Tin Shui Wai", "Tai Lin Pai", "Tai Wo Hau", "Tin Sam", "Tin Shui Wai(N)", "Tin Shui Wai(S)", "Tin Shui Wai(C)", "Tin Shui Wai(W)", "Ting Kau", "Tiu Keng Leng", "Tseung Kwan O", "Tseung Kwan O(E)", "Tseung Kwan O Industrial Estate", "Tseung Kwan O Town Centre", "Tsing Lung Tau", "Tsing Yi", "Tsing Yi Town Centre", "Tsing Yi(N)", "Tsing Yi(S)", "Tsing Yi(E)", "Tsuen Wan", "Tsuen Wan Central", "Tsuen Wan(N)", "Tsuen Wan(S)", "Tsui Lam", "Tuen Mun", "Tuen Mun Town Centre", "Tuen Mun(W)", "Tung Chung", "Tung Chung Town Centre", "Tung Chung(W)", "Tung Chung(N)", "Tung Tau Industrial Area", "Wo Hop Shek", "Wu kai sha", "Yuen Chau Kok", "Yuen Long", "Yuen Long(C)", "Yuen Long(S)", "Yuen Long Industrial Estate"] },
]

const ChtDestinations = [{ "Hong Kong Island": ["香港", "香港(東)", "香港(南)", "香港(西)", "香港仔", "鴨脷洲", "銅鑼灣", "中區", "柴灣", "舂坎角", "數碼港", "杏花邨", "跑馬地", "堅尼地城", "康怡", "半山", "北角", "薄扶林", "鰂魚涌", "淺水灣", "西灣", "西灣河", "西營盤", "筲箕灣", "石澳", "石塘咀", "上環", "壽臣山", "赤柱", "小西灣", "大坑", "太古城", "山頂", "華富", "灣仔", "灣仔(北)", "黃竹坑"] },
{ "Kowloon": ["九龍", "九龍(中)", "九龍(東)", "九龍(西)", "筆架山", "荼果嶺", "長沙灣", "長沙灣(西)", "彩虹", "竹園", "郵輪碼頭", "鑽石山", "坑口", "何文田", "紅磡", "紅磡灣", "啟德", "京士柏", "九龍灣", "九龍城區", "九龍塘", "觀塘", "觀塘商貿區", "荔枝角", "荔枝角(南)", "藍田", "樂富", "馬頭圍", "美孚", "旺角", "牛池灣", "牛頭角", "昂船洲", "坪石", "寶琳", "新蒲崗", "深水埗", "深水埗(西)", "石硤尾", "秀茂坪", "大角咀", "大角咀(西)", "調景嶺", "土瓜灣", "尖沙咀", "尖沙咀東", "慈雲山", "橫頭磡", "西九文化區", "西九龍總站", "黃大仙", "油麻地", "油麻地(西)", "油塘", "又一村",] },
{ "New Terriitories": ["大嶼山", "機場", "凹頭", "清水灣", "愉景灣", "錦綉花園", "粉嶺", "火炭", "廈村", "顯田", "香園圍", "康樂園", "洪水橋", "錦田", "葵涌", "葵芳", "葵興", "古洞", "荔景", "藍地", "大嶼山", "流浮山", "梨木樹", "落馬洲", "朗屏", "聯和墟", "鹿頸", "龍鼓灘", "馬鞍山", "馬鞍山市中心", "馬料水", "馬灣", "文錦渡", "梅窩", "昂坪", "安樂村", "白石角", "北潭涌", "八鄉", "坪輋", "坪山", "貝澳", "內河碼頭", "西沙", "西貢", "三聖墟", "新田", "新墟", "科學園", "沙頭角", "沙田", "沙田巿中心", "深井", "石崗", "石籬", "石壁", "石湖墟", "石蔭", "深圳灣", "上水", "尚德", "小欖", "小瀝源", "掃管笏", "大興", "大美督", "大澳", "大埔", "大埔工業邨", "大埔滘", "大埔墟", "大埔市中心", "大埔(北)", "大埔(南)", "大水坑", "大圍", "天水圍", "大連排", "大窩口", "田心", "天水圍(北)", "天水圍(南)", "天水圍(中)", "天水圍(西)", "汀九", "調景嶺", "將軍澳", "將軍澳(東)", "將軍澳工業邨", "將軍澳市中心", "青龍頭", "青衣", "青衣市中心", "青衣(北)", "青衣(南)", "青衣(東)", "荃灣", "荃灣(中)", "荃灣(北)", "荃灣(南)", "翠林", "屯門", "屯門市中心", "屯門(西)", "東涌", "東涌市中心", "東涌(西)", "東涌(北)", "東頭工業區", "和合石", "烏溪沙", "圓洲角", "元朗", "元朗(中)", "元朗(南)", "元朗(南)", "元朗工業邨"] }
]


const BorderColorScheme = {
    "Blue Background": {
        'background': 'rgb(0, 51, 162)',
        'symbol': '#ffffff',
        'border': '#ffffff',
    },
    "Green Background": {
        'background': 'rgb(0, 105, 40)',
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
        'border': 'rgb(0, 15, 162)',
    },
    "Yellow Background": {
        'background': 'rgb(233, 181, 0)',
        'symbol': '#000000',
        'border': '#000000',
    },
    "Brown Background": {
        'background': 'rgb(117,75,42)',
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

const BorderFrameWidth = {
    'stack': 1.5,
    'flagLeft': 1.5,
    'flagRight': 1.5,
    'exit': 1,
    'panel': 0,
    'greenPanel': 0.5,
    'rectangle': 0,
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
        ], 'arcs': [], 'fill': 'rgb(0, 105, 40)'
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
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius: 3, start: 0 , display: 0},
            { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, label: 'V3', radius: 3, start: 0, display: 0 },
            { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, label: 'V4', radius: 3, start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', radius: 1.5, start: 1 , display: 0},
            { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', radius: 1.5, start: 0 , display: 0},
            { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V7', radius: 1.5, start: 0 , display: 0},
            { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V8', radius: 1.5, start: 0, display: 0 },
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
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', start: 0, display: 0 },
            { x: block.width / length + padding.right + border, y: 7.2, label: 'V3', start: 0 , display: 0},
            { x: 0 - padding.left - border, y: 7.2, label: 'V4', start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', start: 1, display: 0 },
            { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', start: 0 , display: 0},
            { x: block.width / length + padding.right, y: 6.7, label: 'V7', start: 0, display: 0 },
            { x: 0 - padding.right, y: 6.7, label: 'V8', start: 0 , display: 0},
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

    const returnBorder = [
        /*{
        'vertex': [{ x: 0, y: 0, label: 'V0', start: 1 }], 'arcs': [], 'fill': 'symbol'
    }, */{
        'vertex': [
            { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 , display: 0},
            { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V3', start: 0, display: 0 },
            { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0, display: 0 },
            { x: 0 - padding.left, y: 0 - v.E - rounding.y - border + panel.height / 2, radius: v.F, label: 'V5', start: 0 , display: 0}
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V6', start: 1 , display: 0},
            { x: block.width / length + padding.right, y: 0 - padding.top, radius: v.G, label: 'V7', start: 0, display: 0 },
            { x: block.width / length + padding.right, y: block.height / length + padding.bottom, radius: v.G, label: 'V8', start: 0 , display: 0},
            { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0 , display: 0},
            { x: 0 - padding.left + v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V10', start: 0, display: 0 }
        ], 'arcs': [], 'fill': 'background'
    }, {
        'vertex': [
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1 , display: 0},
            { x: 0 - v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0 , display: 0},
            { x: -padding.left + v.A + (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0, display: 0 },
            { x: 0 - v.D, y: 0 + block.height / length, label: 'V14', start: 0, display: 0 },
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0 , display: 0},
            { x: -padding.left + v.A + v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0 , display: 0},
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

    const returnBorder = [
        /*{
        'vertex': [{ x: 0, y: 0, label: 'V0', start: 1 }], 'arcs': [], 'fill': 'symbol'
    }, */{
        'vertex': [
            { x: 0 - padding.left - border, y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
            { x: block.width / length + padding.right - panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 , display: 0},
            { x: block.width / length + padding.right, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, radius: v.F, label: 'V3', start: 0 , display: 0},
            { x: block.width / length + padding.right - panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0, display: 0 },
            { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V5', start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, radius: v.G, label: 'V8', start: 1 },
            { x: block.width / length + padding.right - v.A - (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V7', start: 0, display: 0 },
            { x: block.width / length + padding.right - v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V8', start: 0, display: 0 },
            { x: block.width / length + padding.right - v.A - (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0, display: 0 },
            { x: 0 - padding.left, y: block.height / length + padding.bottom, radius: v.G, label: 'V10', start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'background'
    }, {
        'vertex': [
            { x: block.width / length + v.D + v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1, display: 0 },
            { x: block.width / length + v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0, display: 0 },
            { x: block.width / length + padding.right - v.A - (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0, display: 0 },
            { x: block.width / length + v.D, y: 0 + block.height / length, label: 'V14', start: 0, display: 0 },
            { x: block.width / length + v.D + v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0, display: 0 },
            { x: block.width / length + padding.right - v.A - v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'symbol'
    }];

    returnBorder.forEach(path => applyLengthAndRounding(path, length));
    return { path: returnBorder };
}


const DividerScheme = {
    'HDivider': HDividerTemplate,
    'VDivider': VDividerTemplate,
    'HLine': HLineTemplate,
    'VLane': VLaneTemplate,
}

const DividerMargin = {
    'HDivider': { left: 0, top: 0, right: 0, bottom: 1 },
    'VDivider': { left: 1, top: 0, right: 1, bottom: 0 },
    'HLine': { left: 1.5, top: 1, right: 1.5, bottom: 1 },
    'VLane': { left: 2.5, top: 1.5, right: 2.5, bottom: 1.5 },
}

function HDividerTemplate(xHeight, position, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;
    const Xwidth = block.width / length;
    rounding.x /= length;
    rounding.y /= length;

    const returnBorder = [{
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
        ], 'arcs': [], 'fill': 'border'
    },];

    returnBorder.forEach(p => {
        p.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.x += position.left + (Xwidth / 2) * length;
            vertex.y *= length;
            vertex.y += position.top + (1.5) * length;
            if (vertex.radius) vertex.radius *= length;
        });
    });

    return { path: returnBorder };
}

function VDividerTemplate(xHeight, position, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;
    const Xwidth = block.height / length;
    rounding.x /= length;
    rounding.y /= length;

    const returnBorder = [{
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
        ], 'arcs': [], 'fill': 'border'
    },];

    returnBorder.forEach(p => {
        p.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.x += position.left + (1.5) * length;
            vertex.y *= length;
            vertex.y += position.top + (Xwidth / 2) * length;
            if (vertex.radius) vertex.radius *= length;
        });
    });
    return { path: returnBorder };
}

function HLineTemplate(xHeight, position, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;
    const Xwidth = block.width / length;
    rounding.x /= length;
    rounding.y /= length;

    const returnBorder = [{
        'vertex': [
            { x: 0, y: 0, label: 'V1', start: 1 },
            { x: Xwidth / 2 - 1.5, y: 0, label: 'V2', start: 0 },
            { x: Xwidth / 2 - 1.5, y: 1, label: 'V3', start: 0 },
            { x: -Xwidth / 2 + 1.5, y: 1, label: 'V4', start: 0 },
            { x: -Xwidth / 2 + 1.5, y: 0, label: 'V5', start: 0 },
        ], 'arcs': [], 'fill': 'border'
    },];

    returnBorder.forEach(p => {
        p.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.x += position.left + (Xwidth / 2) * length;
            vertex.y *= length;
            vertex.y += position.top + (1) * length;
        });
    });

    return { path: returnBorder };
}

function VLaneTemplate(xHeight, position, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;
    const BHeight = block.height / length;
    const strokeHeight = 8
    const strokeSpacing = 4
    rounding.x /= length;
    rounding.y /= length;

    const strokeCount = Math.max(2,Math.floor((BHeight - rounding.y / 2 - DividerMargin['VLane'].top - DividerMargin['VLane'].bottom + strokeSpacing) / (strokeHeight + strokeSpacing)));

    let returnBorder = [{
        'vertex': [], 'arcs': [], 'fill': 'border'
    },];

    for (let i = 0; i < strokeCount; i++) {
        returnBorder[0].vertex.push(...[
            { x: 0, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V1', start: 1 },
            { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V2', start: 0 },
            { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - strokeHeight, label: 'V3', start: 0 },
            { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - strokeHeight, label: 'V4', start: 0 },
            { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V5', start: 0 },
        ])
    }

    returnBorder.forEach(p => {
        p.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.x += position.left + 1.5 * length;
            vertex.y *= length;
            vertex.y += position.top;
            if (vertex.radius) vertex.radius *= length;
        });
    });
    return { path: returnBorder };
}

export {
    BorderColorScheme,
    BorderTypeScheme,
    BorderFrameWidth,
    DividerScheme,
    DividerMargin,
    HDividerTemplate,
    VDividerTemplate,
    HLineTemplate,
    VLaneTemplate,
    symbolsTemplate,
    symbolsTemplateAlt,
    symbolsPermittedAngle,
    textWidthHeavy,
    textWidthMedium,
    roadMapTemplate,
    EngDestinations,
    ChtDestinations,
}