export const routePermittedAngle = {
    'Main Line': [-90, -60, -45, -30, 0, 30, 45, 60, 90],
    'Oval Roundabout': [-90, -60, -30, 0, 30, 60, 90],
    'Double Roundabout': [-90, -60, -30, 0, 30, 60, 90]
};

export const roadMapTemplate = {
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
    'RedBar': {
        path: [{
            'vertex': [
                { x: -1, y: 0, label: 'V1', start: 0, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 1, display: 1 },
                { x: 1, y: 0, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }, {
            'vertex': [
                { x: -3, y: -2.667, label: 'V14', start: 1, display: 1 },
                { x: 3, y: -2.667, label: 'V15', start: 0, display: 1 },
                { x: 3, y: -0.667, label: 'V16', start: 0, display: 1 },
                { x: -3, y: -0.667, label: 'V17', start: 0, display: 1 },
            ], 'arcs': [], fill: 'rgb(224, 0, 0)'
        }],
    },
    'Circular Sign': {
        path: [{
            'vertex': [
                { x: -1, y: 4.3875, label: 'V1', start: 0, display: 1 },
                { x: 0, y: 4.5, label: 'V2', start: 1, display: 1 },
                { x: 1, y: 4.3875, label: 'V3', start: 0, display: 1 },
            ], 'arcs': [
                { start: 'V7', end: 'V1', radius: 4.5, direction: 0, sweep: 0 },
                { start: 'V1', end: 'V2', radius: 4.5, direction: 0, sweep: 0 },]
        }, {
            'vertex': [
                { x: 0, y: 0, label: 'C1', start: 1, display: 1 },
            ], 'arcs': [],
        }],
    },
    'Circular Sign (with Arrow)': {
        path: [{
            'vertex': [
                { x: -1, y: 11.8875, label: 'V1', start: 1, display: 1 },
                { x: 0, y: 12, label: 'V2', start: 0, display: 1 },
                { x: 1, y: 11.8875, label: 'V3', start: 0, display: 1 },
            ], 'arcs': [
                { start: 'V7', end: 'V1', radius: 4.5, direction: 0, sweep: 0 },
                { start: 'V1', end: 'V2', radius: 4.5, direction: 0, sweep: 0 },]
        }, {
            'vertex': [
                { x: -1, y: 1, label: 'V8', start: 1, display: 1 },
                { x: 0, y: 0, label: 'V9', start: 0, display: 1 },
                { x: 1, y: 1, label: 'V10', start: 0, display: 1 },
                { x: 1, y: 3.1125, label: 'V11', start: 0, display: 1 },
                { x: -1, y: 3.1125, label: 'V12', start: 0, display: 1 },
            ], 'arcs': [
                { start: 'V11', end: 'V12', radius: 4.5, direction: 0, sweep: 0 },]
        }, {
            'vertex': [
                { x: 0, y: 7.5, label: 'C1', start: 1, display: 1 },
            ], 'arcs': [],
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
    'Left': {
        path: [{
            'vertex': [
                { x: -1, y: 2.5, label: 'V1', start: 1, display: 0 },
                { x: -1, y: 2, label: 'V2', start: 0, display: 0, radius: 0.5 },
                { x: -15, y: 2, label: 'V3', start: 0, display: 0 },
                { x: -16, y: 1, label: 'V4', start: 0, display: 0 },
                { x: -15, y: 0, label: 'V5', start: 0, display: 0 },
                { x: 1, y: 0, label: 'V6', start: 0, display: 0, radius: 2 },
                { x: 1, y: 2.5, label: 'V7', start: 0, display: 0 },
            ], 'arcs': [
                //{ start: 'V1', end: 'V2', radius: 0.5, direction: 0, sweep: 0 },
                //{ start: 'V6', end: 'V7', radius: 2, direction: 1, sweep: 0 },
            ]
        }],
    },
    'Right': {
        path: [{
            'vertex': [
                { x: -1, y: 2.5, label: 'V1', start: 1, display: 0 },
                { x: -1, y: 0, label: 'V2', start: 0, display: 0, radius: 2 },
                { x: 15, y: 0, label: 'V3', start: 0, display: 0 },
                { x: 16, y: 1, label: 'V4', start: 0, display: 0 },
                { x: 15, y: 2, label: 'V5', start: 0, display: 0 },
                { x: 1, y: 2, label: 'V6', start: 0, display: 0, radius: 0.5 },
                { x: 1, y: 2.5, label: 'V7', start: 0, display: 0 },
            ], 'arcs': []
        }],
    },
    /*'Tee': {
        path: [{
            'vertex': [
                { x: -1, y: 2.5, label: 'V1', start: 1, display: 0 },
                { x: -1, y: 2, label: 'V2', start: 0, display: 0, radius: 0.5 },
                { x: -15, y: 2, label: 'V3', start: 0, display: 0 },
                { x: -16, y: 1, label: 'V4', start: 0, display: 0 },
                { x: -15, y: 0, label: 'V5', start: 0, display: 0 },
                { x: 15, y: 0, label: 'V6', start: 0, display: 0 },
                { x: 16, y: 1, label: 'V7', start: 0, display: 0 },
                { x: 15, y: 2, label: 'V8', start: 0, display: 0 },
                { x: 1, y: 2, label: 'V9', start: 0, display: 0, radius: 0.5 },
                { x: 1, y: 2.5, label: 'V10', start: 0, display: 0 },
            ], 'arcs': []
        }],
    },*/
    'T-Junction': {
        path: [{
            'vertex': [
                { x: -1, y: 1, label: 'V1', start: 1, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 0, display: 1 },
                { x: 1, y: 1, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }],
    },
    /*'LaneDrop': {
        path: [{
            'vertex': [
                { x: -1, y: 6.712, label: 'V1', start: 1, display: 0 },
                { x: -1.5, y: 5.846, label: 'V2', start: 0, display: 0 },
                { x: -8.625, y: 1.732, label: 'V3', start: 0, display: 0 },
                { x: -8.991, y: 0.366, label: 'V4', start: 0, display: 0 },
                { x: -7.625, y: 0, label: 'V5', start: 0, display: 0 },
                { x: -0.5, y: 4.114, label: 'V6', start: 0, display: 0 },
                { x: 1, y: 6.712, label: 'V7', start: 0, display: 0 },
            ], 'arcs': [
                { start: 'V1', end: 'V2', radius: 1, direction: 0, sweep: 0 },
                { start: 'V6', end: 'V7', radius: 3, direction: 1, sweep: 0 },
            ]
        }],
    },*/
    'LaneDrop': {
        path: [{
            'vertex': [
                { x: -1, y: 1, label: 'V1', start: 1, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 0, display: 1 },
                { x: 1, y: 1, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }],
    },
    /*'Bifurcation': {
        path: [{
            'vertex': [
                { x: -1, y: 8.262, label: 'V1', start: 1, display: 0, radius: 0.333 },
                { x: -5.244, y: 0.911, label: 'V2', start: 0, display: 0 },
                { x: -5, y: 0, label: 'V3', start: 0, display: 0 },
                { x: -4.089, y: 0.244, label: 'V4', start: 0, display: 0 },
                { x: 0, y: 7.327, label: 'V5', start: 0, display: 0, radius: 0.667 },
                { x: 4.089, y: 0.244, label: 'V6', start: 0, display: 0 },
                { x: 5, y: 0, label: 'V7', start: 0, display: 0 },
                { x: 5.244, y: 0.911, label: 'V8', start: 0, display: 0 },
                { x: 1, y: 8.262, label: 'V9', start: 0, display: 0, radius: 0.333 },

            ], 'arcs': [
            ]
        }],
    },*/
    'Y-Junction': {
        path: [{
            'vertex': [
                { x: -1, y: 1, label: 'V1', start: 1, display: 1 },
                { x: 0, y: 0, label: 'V2', start: 0, display: 1 },
                { x: 1, y: 1, label: 'V3', start: 0, display: 1 },
            ], 'arcs': []
        }],
    },
    'UArrow Conventional': {
        path: [{
            'vertex': [
                { x: 6, y: 33.4, label: 'V31', start: 1, display: 1 },
                { x: 8, y: 31.4, label: 'V32', start: 0, display: 1 },
                { x: 8, y: 9.3808, label: 'V33', start: 0, display: 1 },
                { x: 8.3077, y: 8.6592, label: 'V34', start: 0, display: 0 },
                { x: 2.7692, y: 11.6761, label: 'V35', start: 0, display: 0 },
                { x: 4, y: 12.6491, label: 'V36', start: 0, display: 0 },
                { x: 4, y: 31.4, label: 'V37', start: 0, display: 1 },
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
                { x: 8, y: 33.4, label: 'V32', start: 0, display: 1 },
                { x: 8, y: 15.8745, label: 'V33', start: 0, display: 1 },
                { x: 10.5, y: 9.2601, label: 'V34', start: 0, display: 1 },
                { x: 4.2303, y: 13.3456, label: 'V35', start: 0, display: 0 },
                { x: 4, y: 15.8745, label: 'V36', start: 0, display: 0 },
                { x: 4, y: 33.4, label: 'V37', start: 0, display: 1 },
            ], 'arcs': [
                { start: 'V33', end: 'V34', radius: 10, direction: 1, sweep: 0 },
                { start: 'V34', end: 'V35', radius: 14, direction: 1, sweep: 0 },
                { start: 'V35', end: 'V36', radius: 16, direction: 0, sweep: 0 },
            ]
        },
        ],
    },

    'Spiral Arrow': {
        path: [{
            'vertex': [
                { x: 2.092, y: 0.091, label: 'V1', start: 1, display: 1 },
                { x: 3.917, y: 2.266, label: 'V2', start: 0, display: 1 },
                { x: 0.841, y: 10.025, label: 'V3', start: 0, display: 1 },
                { x: -6.949, y: 11.846, label: 'V4', start: 0, display: 1 },
                { x: -0.075, y: 1.909, label: 'V5', start: 0, display: 1 },
            ], 'arcs': [
                { start: 'V2', end: 'V3', radius: 18, direction: 1, sweep: 0 },
                { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                { start: 'V4', end: 'V5', radius: 14, direction: 0, sweep: 0 },
            ]
        }],
    },

};

export function baseSideRoadTemplate(baseShape, rootLength) {
    // Shape here are rotated 180 degree pointing downwards to the roundel
    // origin is at the bottom of the side road tip
    switch (baseShape) {
        case 'Base Conventional Normal':
            return {
                path: [{
                    'vertex': [
                        { x: 0, y: 0, label: 'V1', start: 0, display: 1 },
                        { x: -3, y: 0, label: 'V2', start: 1, display: 1 },
                        { x: -3, y: rootLength - 12.3693, label: 'V3', start: 0, display: 0 },
                        { x: -3.6923, y: rootLength - 11.4178, label: 'V4', start: 0, display: 0 },
                        { x: 3.6923, y: rootLength - 11.4178, label: 'V5', start: 0, display: 0 },
                        { x: 3, y: rootLength - 12.3693, label: 'V6', start: 0, display: 0 },
                        { x: 3, y: 0, label: 'V7', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 1, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V5', end: 'V6', radius: 1, direction: 1, sweep: 0 },
                    ]
                }]
            };
        case 'Base Conventional U-turn':
            return {
                path: [{
                    'vertex': [
                        { x: 6, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 8, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: 8, y: rootLength - 9.3808, label: 'V13', start: 0, display: 0 },
                        { x: 8.3077, y: rootLength - 8.6592, label: 'V14', start: 0, display: 0 },
                        { x: 2.7692, y: rootLength - 11.6761, label: 'V15', start: 0, display: 0 },
                        { x: 4, y: rootLength - 12.6491, label: 'V16', start: 0, display: 0 },
                        { x: 4, y: 0, label: 'V17', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V13', end: 'V14', radius: 1, direction: 0, sweep: 0 },
                        { start: 'V14', end: 'V15', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V15', end: 'V16', radius: 1, direction: 0, sweep: 0 },
                    ]
                },]
            }
        case 'Base Conventional Auxiliary':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                            { x: 3, y: 0, label: 'V2', start: 0, display: 1 },
                            { x: 3, y: rootLength - 20.3345, label: 'V3', start: 0, radius: 4, display: 1 },
                            { x: 19.3345, y: rootLength - 4, label: 'V4', start: 0, radius: 4, display: 1 },
                            { x: 27, y: rootLength - 4, label: 'V5', start: 0, display: 1 },
                            { x: 30, y: rootLength - 1, label: 'V6', start: 0, display: 1 },
                            { x: 27, y: rootLength + 2, label: 'V7', start: 0, display: 1 },
                            { x: 12.6491, y: rootLength + 2, label: 'V8', start: 0, display: 0 },
                            { x: 11.6761, y: rootLength + 2.7692, label: 'V9', start: 0, display: 0 },
                            { x: 11.6761, y: rootLength - 2.7692, label: 'V10', start: 0, display: 0 },
                            { x: 12.6491, y: rootLength - 2, label: 'V11', start: 0, display: 0 },
                            { x: 17.7990, y: rootLength - 2, label: 'V12', start: 0, display: 0 },
                            { x: 3, y: rootLength - 16.7990, label: 'V13', start: 0, display: 0 },
                            { x: 3, y: rootLength - 12.3693, label: 'V14', start: 0, display: 0 },
                            { x: 3.6923, y: rootLength - 11.4178, label: 'V15', start: 0, display: 0 },
                            { x: -3.6923, y: rootLength - 11.4178, label: 'V16', start: 0, display: 0 },
                            { x: -3, y: rootLength - 12.3693, label: 'V17', start: 0, display: 0 },
                            { x: -3, y: 0, label: 'V18', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V8', end: 'V9', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V9', end: 'V10', radius: 12, direction: 0, sweep: 0 },
                            { start: 'V10', end: 'V11', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V14', end: 'V15', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V15', end: 'V16', radius: 12, direction: 0, sweep: 0 },
                            { start: 'V16', end: 'V17', radius: 1, direction: 0, sweep: 0 },
                        ]
                    },
                ]
            }
        case 'Base Conventional Auxiliary -45':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                            { x: 3, y: 0, label: 'V2', start: 0, display: 1 },
                            { x: 3, y: rootLength - 20.3345, label: 'V3', start: 0, display: 1 },
                            { x: 16.1806, y: rootLength - 18.7695, label: 'V4', start: 0, display: 1 },
                            { x: 22.708, y: rootLength - 26.3436, label: 'V5', start: 0, display: 1 },
                            { x: 26.950, y: rootLength - 26.3436, label: 'V6', start: 0, display: 1 },
                            { x: 26.950, y: rootLength - 22.1036, label: 'V7', start: 0, display: 1 },
                            { x: 10.3585, y: rootLength - 7.5301, label: "V8", start: 0, display: 0 },
                            { x: 10.2144, y: rootLength - 6.2981, label: "V9", start: 0, display: 0 },
                            { x: 6.2981, y: rootLength - 10.2144, label: "V10", start: 0, display: 0 },
                            { x: 7.5301, y: rootLength - 10.3585, label: "V11", start: 0, display: 0 },
                            { x: 11.1716, y: rootLength - 14, label: "V12", start: 0, display: 0 },
                            { x: 3, y: rootLength - 16.7990, label: 'V13', start: 0, display: 0 },
                            { x: 3, y: rootLength - 12.3693, label: 'V14', start: 0, display: 0 },
                            { x: 3.6923, y: rootLength - 11.4178, label: 'V15', start: 0, display: 0 },
                            { x: -3.6923, y: rootLength - 11.4178, label: 'V16', start: 0, display: 0 },
                            { x: -3, y: rootLength - 12.3693, label: 'V17', start: 0, display: 0 },
                            { x: -3, y: 0, label: 'V18', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V3', end: 'V4', radius: 7.5, direction: 0, sweep: 0 },
                            { start: 'V8', end: 'V9', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V9', end: 'V10', radius: 12, direction: 0, sweep: 0 },
                            { start: 'V10', end: 'V11', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V12', end: 'V13', radius: 10, direction: 1, sweep: 0 },
                            { start: 'V14', end: 'V15', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V15', end: 'V16', radius: 12, direction: 0, sweep: 0 },
                            { start: 'V16', end: 'V17', radius: 1, direction: 0, sweep: 0 },
                        ]
                    },
                ]
            }
        case 'Base Spiral Normal':
            return {
                path: [{
                    'vertex': [
                        { x: 2, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 2, y: rootLength - 20.785, label: 'V2', start: 0, display: 0 },
                        { x: 7, y: rootLength - 12.124, label: 'V3', start: 0, display: 0 },
                        { x: -2.392, y: rootLength - 13.794, label: 'V4', start: 0, display: 0 },
                        { x: -4, y: rootLength - 20.785, label: 'V5', start: 0, display: 0 },
                        { x: -4, y: 0, label: 'V6', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V2', end: 'V3', radius: 10, direction: 0, sweep: 0 },
                        { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 16, direction: 1, sweep: 0 },
                    ]
                },]
            }
        case 'Base Spiral U-turn':
            return {
                path: [{
                    'vertex': [
                        { x: 6, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 6, y: rootLength - 17.8885, label: 'V2', start: 0, display: 0 },
                        { x: 9.3333, y: rootLength - 10.4350, label: 'V3', start: 0, display: 0 },
                        { x: 2.6252, y: rootLength - 13.7517, label: 'V4', start: 0, display: 0 },
                        { x: 2, y: rootLength - 17.8885, label: 'V5', start: 0, display: 0 },
                        { x: 2, y: 0, label: 'V6', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V2', end: 'V3', radius: 10, direction: 0, sweep: 0 },
                        { start: 'V3', end: 'V4', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 16, direction: 1, sweep: 0 },
                    ]
                },]
            }
        case 'Base Spiral Auxiliary':
            return {
                path: [{
                    'vertex': [
                        { x: 2, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 2, y: rootLength - 24.1630, label: 'V2', start: 0, radius: 4, display: 1 },
                        { x: 24.3045, y: rootLength - 1.8584, label: 'V3', start: 0, radius: 4, display: 1 },
                        { x: 31.2484, y: rootLength - 1.2509, label: 'V4', start: 0, display: 1 },
                        { x: 34, y: rootLength + 1.9784, label: 'V5', start: 0, display: 1 },
                        { x: 30.7294, y: rootLength + 4.6809, label: 'V6', start: 0, display: 1 },
                        { x: 21.734, y: rootLength + 3.917, label: 'V7', start: 0, display: 0 },
                        { x: 13.975, y: rootLength + 0.841, label: 'V8', start: 0, display: 0 },
                        { x: 12.154, y: rootLength - 6.949, label: 'V9', start: 0, display: 0 },
                        { x: 22.6134, y: rootLength - 0.0140, label: 'V10', start: 0, display: 0 },
                        { x: 2, y: rootLength - 20.6274, label: 'V11', start: 0, display: 0 },
                        { x: 7, y: rootLength - 12.124, label: 'V12', start: 0, display: 0 },
                        { x: -2.392, y: rootLength - 13.794, label: 'V13', start: 0, display: 0 },
                        { x: -4, y: rootLength - 20.785, label: 'V14', start: 0, display: 0 },
                        { x: -4, y: 0, label: 'V15', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V7', end: 'V8', radius: 18, direction: 1, sweep: 0 },
                        { start: 'V8', end: 'V9', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V9', end: 'V10', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V11', end: 'V12', radius: 10, direction: 0, sweep: 0 },
                        { start: 'V12', end: 'V13', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 16, direction: 1, sweep: 0 },
                    ]
                },]
            }
        case 'Base Double Conventional':
            return {
                path: [{
                    'vertex': [
                        { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 3, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: 3, y: rootLength - 12.3693, label: 'V3', start: 0, display: 0 },
                        { x: 3.6923, y: rootLength - 11.4178, label: 'V4', start: 0, display: 0 },
                        { x: -3.6923, y: rootLength - 11.4178, label: 'V5', start: 0, display: 0 },
                        { x: -3, y: rootLength - 12.3693, label: 'V6', start: 0, display: 0 },
                        { x: -3, y: 0, label: 'V7', start: 0, display: 1 },
                        { x: 0, y: 0, label: 'V8', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                        { start: 'V6', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V5', end: 'V6', radius: 1, direction: 0, sweep: 0 },
                    ],
                },]
            };

        case 'Base Double Spiral':
            return {
                path: [{
                    'vertex': [
                        { x: -1, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 2, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: 2, y: rootLength - 20.785, label: 'V3', start: 0, display: 0 },
                        { x: 7, y: rootLength - 12.124, label: 'V4', start: 0, display: 1 },
                        { x: -2.392, y: rootLength - 13.794, label: 'V5', start: 0, display: 0 },
                        { x: -4, y: rootLength - 20.785, label: 'V6', start: 0, display: 0 },
                        { x: -4, y: 0, label: 'V7', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 10, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 14, direction: 0, sweep: 0 },
                        { start: 'V5', end: 'V6', radius: 16, direction: 1, sweep: 0 },
                    ]
                },]
            };
        case 'Base Oval Normal 0':
        case 'Base Oval Normal 30':
        case 'Base Oval Normal 60':
        case 'Base Oval Normal -30':
        case 'Base Oval Normal -60':
            return {
                path: [{
                    'vertex': [
                        { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 3, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: 3, y: rootLength - 12.3693, label: 'V3', start: 0, display: 0 },
                        { x: 3.6923, y: rootLength - 11.4178, label: 'V4', start: 0, display: 0 },
                        { x: -3.6923, y: rootLength - 11.4178, label: 'V5', start: 0, display: 0 },
                        { x: -3, y: rootLength - 12.3693, label: 'V6', start: 0, display: 0 },
                        { x: -3, y: 0, label: 'V7', start: 0, display: 0 },
                        { x: -0, y: 0, label: 'V8', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V5', end: 'V6', radius: 1, direction: 0, sweep: 0 },
                    ],
                }]
            };
        case 'Base Oval Normal 90 Left':
            return {
                path: [{
                    'vertex': [
                        { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: 3, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: 3, y: rootLength - 12.3693, label: 'V3', start: 0, display: 0 },
                        { x: 3.6923, y: rootLength - 11.4178, label: 'V4', start: 0, display: 0 },
                        { x: -0, y: rootLength - 12, label: "V5", start: 0, display: 0 },
                        { x: -4, y: rootLength - 12, label: 'V6', start: 0, display: 0 },
                        { x: -3, y: rootLength - 13, label: 'V7', start: 0, display: 0 },
                        { x: -3, y: 0, label: 'V8', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 1, direction: 0, sweep: 0 },
                    ],
                }]
            };
        case 'Base Oval Normal 90 Middle':
            return {
                path: [{
                    'vertex': [
                        { x: -12, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: -9, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: -9, y: rootLength - 13, label: 'V3', start: 0, display: 0 },
                        { x: -8, y: rootLength - 12, label: 'V4', start: 0, display: 0 },
                        { x: -12, y: rootLength - 12, label: "V5", start: 0, display: 0 },
                        { x: -16, y: rootLength - 12, label: 'V6', start: 0, display: 0 },
                        { x: -15, y: rootLength - 13, label: 'V7', start: 0, display: 0 },
                        { x: -15, y: 0, label: 'V8', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 0, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 1, direction: 0, sweep: 0 },
                    ],
                }]
            };
        case 'Base Oval Normal -90':
            return {
                path: [{
                    'vertex': [
                        { x: -24, y: 0, label: 'V1', start: 1, display: 1 },
                        { x: -27, y: 0, label: 'V2', start: 0, display: 1 },
                        { x: -27, y: rootLength - 12.3693, label: 'V3', start: 0, display: 0 },
                        { x: -27.6923, y: rootLength - 11.4178, label: 'V4', start: 0, display: 0 },
                        { x: -24, y: rootLength - 12, label: "V5", start: 0, display: 0 },
                        { x: -20, y: rootLength - 12, label: 'V6', start: 0, display: 0 },
                        { x: -21, y: rootLength - 13, label: 'V7', start: 0, display: 0 },
                        { x: -21, y: 0, label: 'V8', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V3', end: 'V4', radius: 1, direction: 1, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 1, direction: 1, sweep: 0 },
                    ],
                }]
            };

    }

}

export function roundelTemplate(type, rootLength) {
    switch (type) {
        case 'Normal Conventional':
        case 'Auxiliary Conventional':
        case 'Auxiliary -45 Conventional':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -12, label: 'V2', start: 1, display: 1 }, // Original center point
                            { x: 12, y: 0, label: 'V20', start: 0, display: 1 }, // Original center point
                            { x: 10.3923, y: 6, label: 'V21', start: 0, display: 0 },
                            { x: 6.0622, y: 3.5, label: 'V22', start: 0, display: 0 },
                            { x: 3.5, y: 6.0622, label: 'V23', start: 0, display: 0 },
                            { x: 6, y: 10.3923, label: 'V24', start: 0, display: 0 },
                            { x: -12, y: 0, label: 'V25', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V2', end: 'V20', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V20', end: 'V21', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V22', end: 'V23', radius: 7, direction: 0, sweep: 1 },
                            { start: 'V24', end: 'V25', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V25', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        ], //'centerLine': [
                        // { x: 4.75, y: 8.2273, label: 'C2', width: 5, start: 1, display: 1 },
                        // { x: 8.2273, y: 4.75, label: 'C3', width: 5, start: 0, display: 1 },
                        // ], 'centerArc': [
                        // { start: 'C2', end: 'C3', radius: 9.5, direction: 1, sweep: 1 }]
                    },
                ],
            }
        case 'U-turn Conventional':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 8, y: Math.sqrt(144 - 64), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: -8, y: Math.sqrt(144 - 64), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -12, label: 'V2', start: 1, display: 1 }, // Original center point
                            { x: 12, y: 0, label: 'V20', start: 0, display: 1 },
                            { x: 2.0838, y: 11.8177, label: 'V21', start: 0, display: 0 },
                            { x: 1.2155, y: 6.8937, label: 'V22', start: 0, display: 0 },
                            { x: -1.2155, y: 6.8937, label: 'V23', start: 0, display: 0 },
                            { x: -2.0838, y: 11.8177, label: 'V24', start: 0, display: 0 },
                            { x: -12, y: 0, label: 'V25', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V2', end: 'V20', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V20', end: 'V21', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V22', end: 'V23', radius: 7, direction: 0, sweep: 1 },
                            { start: 'V24', end: 'V25', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V25', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        ]
                    }
                ],
            }
        case 'Auxiliary Spiral':
        case 'Normal Spiral':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 2.392, y: 13.794, label: 'V1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: -7, y: 12.124, label: 'V3', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -14, label: 'V11', start: 1, display: 1 }, // Original center point
                            { x: 14, y: 0, label: 'V12', start: 0, display: 1 },
                            { x: 12.1244, y: 7, label: 'V13', start: 0, display: 0 },
                            { x: 8.6603, y: 5, label: 'V14', start: 0, display: 0 },
                            { x: 5, y: 8.6603, label: 'V15', start: 0, display: 0 },
                            { x: 7, y: 12.1244, label: 'V16', start: 0, display: 0 },
                            { x: -14, y: 0, label: 'V17', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V11', end: 'V12', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V12', end: 'V13', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V14', end: 'V15', radius: 10, direction: 0, sweep: 1 },
                            { start: 'V16', end: 'V17', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V17', end: 'V11', radius: 14, direction: 1, sweep: 0 },
                        ]
                    },
                ],
            }
        case 'U-turn Spiral':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 9.3333, y: 10.435, label: 'V1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: -9.3333, y: 10.435, label: 'V3', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -14, label: 'V11', start: 1, display: 1 }, // Original center point
                            { x: 14, y: 0, label: 'V12', start: 0, display: 1 },
                            { x: 2, y: 13.8564, label: 'V13', start: 0, display: 0 },
                            { x: 2, y: 9.7980, label: 'V14', start: 0, display: 0 },
                            { x: 0, y: 10, label: 'V15', start: 0, display: 0 },
                            { x: 0, y: 14, label: 'V16', start: 0, display: 0 },
                            { x: -14, y: 0, label: 'V17', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V11', end: 'V12', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V12', end: 'V13', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V14', end: 'V15', radius: 10, direction: 0, sweep: 1 },
                            { start: 'V16', end: 'V17', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V17', end: 'V11', radius: 14, direction: 1, sweep: 0 },
                        ]
                    },
                ],
            }

        case 'Normal 0 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 0, y: -36, label: 'V1', start: 1, display: 1 },
                        { x: 12, y: -24, label: 'V2', start: 0, display: 1 },
                        { x: 12, y: -12, label: 'V3', start: 0, display: 1 },
                        { x: 12, y: 0, label: 'V4', start: 0, display: 1 },
                        { x: 10.392, y: 6, label: 'V5', start: 0, display: 0 },  // notched
                        { x: 6.062, y: 3.5, label: 'V6', start: 0, display: 0 }, // notched
                        { x: 7, y: 0, label: 'V7', start: 0, display: 0 },
                        { x: 7, y: -24, label: 'V9', start: 0, display: 0 },
                        { x: -7, y: -24, label: 'V11', start: 0, display: 0 },
                        { x: -7, y: 0, label: 'V13', start: 0, display: 0 },
                        { x: 3.5, y: 6.062, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 6, y: 10.392, label: 'V15', start: 0, display: 0 }, // notched
                        { x: 0, y: 12, label: 'V16', start: 0, display: 1 },
                        { x: -12, y: 0, label: 'V17', start: 0, display: 1 },
                        { x: -12, y: -12, label: 'V18', start: 0, display: 1 },
                        { x: -12, y: -24, label: 'V19', start: 0, display: 1 },
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V15', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 0, y: -24, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal 30 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 18, y: -31.1769, label: "V1", start: 1, display: 1 },
                        { x: 22.3923, y: -14.7846, label: "V2", start: 0, display: 1 },
                        { x: 16.3923, y: -4.3923, label: "V3", start: 0, display: 1 },
                        { x: 10.392, y: 6, label: 'V5', start: 0, display: 1 },  // notched
                        { x: 6.062, y: 3.5, label: 'V6', start: 0, display: 0 }, // notched
                        { x: 18.0622, y: -17.2846, label: "V9", start: 0, display: 0 },
                        { x: 5.9378, y: -24.2846, label: "V11", start: 0, display: 0 },
                        { x: -6.0622, y: -3.5, label: "V13", start: 0, display: 0 },
                        { x: 3.5, y: 6.062, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 6, y: 10.392, label: 'V15', start: 0, display: 0 }, // notched
                        { x: -6, y: 10.3923, label: "V16", start: 0, display: 1 },
                        { x: -10.3923, y: -6, label: "V17", start: 0, display: 1 },
                        { x: -4.3923, y: -16.3923, label: "V18", start: 0, display: 1 },
                        { x: 1.6077, y: -26.7846, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V15', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 12, y: -20.7846, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal 60 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 31.1769, y: -18, label: "V1", start: 1, display: 1 },
                        { x: 26.7846, y: -1.6077, label: "V2", start: 0, display: 1 },
                        { x: 16.3923, y: 4.3923, label: "V3", start: 0, display: 1 },
                        { x: 9.5, y: 8.372, label: 'V4', start: 0, display: 1 }, // notched
                        { x: 7, y: 4.042, label: 'V5', start: 0, display: 0 },  // notched
                        { x: 24.2846, y: -5.9378, label: "V9", start: 0, display: 0 },
                        { x: 17.2846, y: -18.0622, label: "V11", start: 0, display: 0 },
                        { x: -3.5, y: -6.0622, label: "V13", start: 0, display: 0 },
                        { x: 3.5, y: 6.062, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 6, y: 10.392, label: 'V15', start: 0, display: 1 }, // notched
                        { x: -10.3923, y: 6, label: "V16", start: 0, display: 1 },
                        { x: -6, y: -10.3923, label: "V17", start: 0, display: 1 },
                        { x: 4.3923, y: -16.3923, label: "V18", start: 0, display: 1 },
                        { x: 14.7846, y: -22.3923, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V15', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 20.7846, y: -12, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal 90 Left Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 36, y: 0, label: "V1", start: 1, display: 1 },
                        { x: 24, y: 12, label: "V2", start: 0, display: 1 },
                        { x: 14.5, y: 12, label: 'V5', start: 0, display: 0 },  // notched
                        { x: 14.5, y: 7, label: 'V6', start: 0, display: 0 }, // notched
                        { x: 24, y: 7, label: "V9", start: 0, display: 0 },
                        { x: 24, y: -7, label: "V11", start: 0, display: 0 },
                        { x: 0, y: -7, label: "V13", start: 0, display: 0 },
                        { x: 0, y: 7, label: "V7", start: 0, display: 0 },
                        { x: 9.5, y: 7, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 9.5, y: 12, label: 'V15', start: 0, display: 0 }, // notched
                        { x: 0, y: 12, label: "V4", start: 0, display: 1 },
                        { x: -12, y: 0, label: "V16", start: 0, display: 1 },
                        { x: 0, y: -12, label: "V17", start: 0, display: 1 },
                        { x: 12, y: -12, label: "V18", start: 0, display: 1 },
                        { x: 24, y: -12, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V7', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 24, y: 0, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 9, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 15, y: 12, label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal 90 Middle Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 36, y: 0, label: "V1", start: 1, display: 1 },
                        { x: 34.392, y: 6, label: 'V5', start: 0, display: 0 },  // notched
                        { x: 30.062, y: 3.5, label: 'V6', start: 0, display: 0 }, // notched
                        { x: 24, y: -7, label: "V11", start: 0, display: 0 },
                        { x: 0, y: -7, label: "V13", start: 0, display: 0 },
                        { x: 0, y: 7, label: "V7", start: 0, display: 0 },
                        { x: 24, y: 7, label: "V9", start: 0, display: 0 },
                        { x: 27.5, y: 6.062, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 30, y: 10.392, label: 'V15', start: 0, display: 0 }, // notched
                        { x: 24, y: 12, label: "V2", start: 0, display: 1 },
                        { x: 12, y: 12, label: "V3", start: 0, display: 1 },
                        { x: 0, y: 12, label: "V4", start: 0, display: 1 },
                        { x: -12, y: 0, label: "V16", start: 0, display: 1 },
                        { x: 0, y: -12, label: "V17", start: 0, display: 1 },
                        { x: 12, y: -12, label: "V18", start: 0, display: 1 },
                        { x: 24, y: -12, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V15', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 24, y: 0, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: 12, label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: 12, label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal -30 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: -18, y: -31.1769, label: "V1", start: 1, display: 1 },
                        { x: -22.3923, y: -14.7846, label: "V2", start: 0, display: 1 },
                        { x: -16.3923, y: -4.3923, label: "V3", start: 0, display: 1 },
                        { x: -10.3923, y: 6, label: "V4", start: 0, display: 1 },
                        { x: 6, y: 10.392, label: 'V5', start: 0, display: 0 }, // notched
                        { x: 3.5, y: 6.062, label: 'V6', start: 0, display: 0 }, // notched
                        { x: -6.0622, y: 3.5, label: "V7", start: 0, display: 0 },
                        { x: -18.0622, y: -17.2846, label: "V9", start: 0, display: 0 },
                        { x: -5.9378, y: -24.2846, label: "V11", start: 0, display: 0 },
                        { x: 6.0622, y: -3.5, label: "V13", start: 0, display: 0 },
                        { x: 6.062, y: 3.5, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 10.392, y: 6, label: 'V15', start: 0, display: 0 },  // notched
                        { x: 10.3923, y: -6, label: "V17", start: 0, display: 1 },
                        { x: 4.3923, y: -16.3923, label: "V18", start: 0, display: 1 },
                        { x: -1.6077, y: -26.7846, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V15', end: 'V17', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 0, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -12, y: -20.7846, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }
        case 'Normal -60 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: -31.1769, y: -18, label: "V1", start: 1, display: 1 },
                        { x: -26.7846, y: -1.6077, label: "V2", start: 0, display: 1 },
                        { x: -16.3923, y: 4.3923, label: "V3", start: 0, display: 1 },
                        { x: -6, y: 10.3923, label: "V4", start: 0, display: 1 },
                        { x: 6, y: 10.392, label: 'V5', start: 0, display: 0 }, // notched
                        { x: 3.5, y: 6.062, label: 'V6', start: 0, display: 0 }, // notched
                        { x: -3.5, y: 6.0622, label: "V7", start: 0, display: 0 },
                        { x: -24.2846, y: -5.9378, label: "V9", start: 0, display: 0 },
                        { x: -17.2846, y: -18.0622, label: "V11", start: 0, display: 0 },
                        { x: 3.5, y: -6.0622, label: "V13", start: 0, display: 0 },
                        { x: 7, y: 4.042, label: 'V14', start: 0, display: 0 },  // notched
                        { x: 10.3923, y: 6, label: "V16", start: 0, display: 1 },
                        { x: 6, y: -10.3923, label: "V17", start: 0, display: 1 },
                        { x: -4.3923, y: -16.3923, label: "V18", start: 0, display: 1 },
                        { x: -14.7846, y: -22.3923, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V5', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V6', end: 'V7', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V13', end: 'V14', radius: 7, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 0, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 0, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -20.7846, y: -12, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: -3, y: Math.sqrt(144 - 9), label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 3, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }

        case 'Normal -90 Oval':
            return {
                path: [{
                    'vertex': [
                        { x: 36, y: 0, label: "V1", start: 1, display: 1 },
                        { x: 24, y: 12, label: "V2", start: 0, display: 1 },
                        { x: 14.5, y: 12, label: 'V5', start: 0, display: 0 },  // notched
                        { x: 14.5, y: 7, label: 'V6', start: 0, display: 0 }, // notched
                        { x: 24, y: 7, label: "V9", start: 0, display: 0 },
                        { x: 24, y: -7, label: "V11", start: 0, display: 0 },
                        { x: 0, y: -7, label: "V13", start: 0, display: 0 },
                        { x: 0, y: 7, label: "V7", start: 0, display: 0 },
                        { x: 9.5, y: 7, label: 'V14', start: 0, display: 0 }, // notched
                        { x: 9.5, y: 12, label: 'V15', start: 0, display: 0 }, // notched
                        { x: 0, y: 12, label: "V4", start: 0, display: 1 },
                        { x: -12, y: 0, label: "V16", start: 0, display: 1 },
                        { x: 0, y: -12, label: "V17", start: 0, display: 1 },
                        { x: 12, y: -12, label: "V18", start: 0, display: 1 },
                        { x: 24, y: -12, label: "V19", start: 0, display: 1 }
                    ], 'arcs': [
                        { start: 'V1', end: 'V2', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V9', end: 'V11', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V13', end: 'V7', radius: 7, direction: 0, sweep: 0 },
                        { start: 'V4', end: 'V16', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V16', end: 'V17', radius: 12, direction: 1, sweep: 0 },
                        { start: 'V19', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                    ]
                },
                {
                    'vertex': [
                        { x: 24, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 0, y: 0, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 21, y: 12, label: 'V1', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                {
                    'vertex': [
                        { x: 27, y: Math.sqrt(144 - 9), label: 'V3', start: 1, display: 1 }, // Center point for tracking
                    ], 'arcs': []
                },
                ]
            }

        case 'Conventional Double':
            return {
                path: [
                    {
                        // Top Circle
                        'vertex': [
                            { x: 0, y: -40, label: 'V1', start: 1, display: 1 },
                            { x: 10.3923, y: -22, label: 'V3', start: 0, display: 0 },      // notched
                            { x: 6.0622, y: -24.5, label: 'V4', start: 0, display: 0 },     // notched
                            { x: 3.5, y: -21.9378, label: 'V5', start: 0, display: 0 },     // notched
                            { x: 6, y: -17.6077, label: 'V6', start: 0, display: 0 },       // notched
                            { x: 3.2334, y: -16.4438, label: 'V20', start: 0, display: 0 },
                            { x: 2.5, y: -15.48, label: 'V7', start: 0, display: 0 },
                            { x: 2.5, y: -12.52, label: 'V8', start: 0, display: 0 },
                            { x: 3.2334, y: -11.5562, label: 'V21', start: 0, display: 0 },
                            { x: 10.3923, y: 6, label: 'V10', start: 0, display: 0 },       // notched
                            { x: 6.0622, y: 3.5, label: 'V11', start: 0, display: 0 },      // notched
                            { x: 3.5, y: 6.0622, label: 'V12', start: 0, display: 0 },      // notched
                            { x: 6, y: 10.3923, label: 'V13', start: 0, display: 0 },       // notched
                            { x: -3.2334, y: -11.5562, label: 'V22', start: 0, display: 0 },
                            { x: -2.5, y: -12.52, label: 'V16', start: 0, display: 0 },
                            { x: -2.5, y: -15.48, label: 'V17', start: 0, display: 0 },
                            { x: -3.2334, y: -16.4438, label: 'V23', start: 0, display: 0 },
                        ],
                        'arcs': [
                            { start: 'V1', end: 'V3', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V4', end: 'V5', radius: 7, direction: 0, sweep: 1 },
                            { start: 'V6', end: 'V20', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V20', end: 'V7', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V8', end: 'V21', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V21', end: 'V10', radius: 12, direction: 1, sweep: 0 },
                            { start: 'V11', end: 'V12', radius: 7, direction: 0, sweep: 1 },
                            { start: 'V13', end: 'V22', radius: 12, direction: 1, sweep: 1 },
                            { start: 'V22', end: 'V16', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V17', end: 'V23', radius: 1, direction: 0, sweep: 0 },
                            { start: 'V23', end: 'V1', radius: 12, direction: 1, sweep: 0 },
                        ]
                    },
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -28, label: 'C2', start: 1, display: 1 }, // Center point
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 12, y: -28, label: 'V2', start: 1, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: 12, y: 0, label: 'V9', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: 0, y: 12, label: 'V14', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: -12, y: 0, label: 'V15', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: -12, y: -28, label: 'V18', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: -3, y: Math.sqrt(144 - 9), label: 'V31', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 3, y: Math.sqrt(144 - 9), label: 'V33', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                ]
            };

        case 'Spiral Double':
            return {
                path: [
                    {
                        'vertex': [
                            { x: 0, y: -52, label: 'V1', start: 1, display: 1 }, // Original center point
                            { x: 12.1244, y: -31, label: 'V3', start: 0, display: 0 },  //notched
                            { x: 8.6603, y: -33, label: 'V4', start: 0, display: 0 }, //notched
                            { x: 5, y: -29.3397, label: 'V5', start: 0, display: 0 }, //notched
                            { x: 7, y: -25.8756, label: 'V6', start: 0, display: 0 }, //notched
                            { x: 3.991, y: -24.5833, label: 'V7', start: 0, display: 0 },
                            { x: 0.7835, y: -13.9781, label: 'V8', start: 0, display: 0 },
                            { x: 12.1244, y: 7, label: 'V10', start: 0, display: 0 },  // notched
                            { x: 8.6603, y: 5, label: 'V11', start: 0, display: 0 },  // notched
                            { x: 5, y: 8.6603, label: 'V12', start: 0, display: 0 },  // notched
                            { x: 7, y: 12.1244, label: 'V13', start: 0, display: 0 },  // notched
                            { x: -6.9989, y: -12.125, label: 'V14', start: 0, display: 1 },
                            { x: 0, y: -24, label: 'V15', start: 0, display: 1 },
                        ], 'arcs': [
                            { start: 'V1', end: 'V3', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V4', end: 'V5', radius: 10, direction: 0, sweep: 1 },
                            { start: 'V6', end: 'V7', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V7', end: 'V8', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V8', end: 'V10', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V11', end: 'V12', radius: 10, direction: 0, sweep: 1 },
                            { start: 'V13', end: 'V14', radius: 14, direction: 1, sweep: 0 },
                            { start: 'V14', end: 'V15', radius: 14, direction: 0, sweep: 0 },
                            { start: 'V15', end: 'V1', radius: 14, direction: 1, sweep: 0 },
                        ]
                    },
                    {
                        'vertex': [
                            { x: 0, y: 0, label: 'C1', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 0, y: -38, label: 'C2', start: 1, display: 1 }, // Center point for tracking
                        ], 'arcs': []
                    },
                    {
                        'vertex': [
                            { x: 14, y: -38, label: 'V2', start: 1, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: 14, y: 0, label: 'V9', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: 0, y: 14, label: 'V16', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: -14, y: 0, label: 'V17', start: 0, display: 1 },
                        ],
                    },
                    {
                        'vertex': [
                            { x: -14, y: -38, label: 'V18', start: 0, display: 1 },
                        ],
                    },
                ],

            }
    }
}
