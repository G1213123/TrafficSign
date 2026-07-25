// Important: 
// vertex 'start' property: 1 means the start of the path, 0 means not start. 
// If cutout is needed, the paths with different start point should be defined in the same object path array.
// radius property in vertex is only apply for straight line intersection, to indicate the fillet radius at that vertex.
// display property in vertex: 1 means the vertex is to be displayed, 0 means not displayed.
// display property also control the snapping behavior when try to anchor objects.
// 

export const symbolsPermittedAngle = {
    'StackArrow': [-135, -90, -45, -22.5, 0, 22.5, 45, 90, 135],
    'Airport': [-90, -60, -45, 0, 45, 60, 90],

};

export const symbolsTemplate = {

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

    'TunnelClosed': {
        path: [ // 4.5.2.2
            {
                'vertex': [
                    { x: 0, y: 2, label: 'V1', start: 1, display: 1 },
                    { x: 3.25, y: 2, label: 'V2', start: 0, display: 0 },
                    { x: 7.25, y: 6, label: 'V3', start: 0, display: 0 },
                    { x: 7.25, y: 15, label: 'V4', start: 0, display: 0 },
                    { x: -7.25, y: 15, label: 'V5', start: 0, display: 0 },
                    { x: -7.25, y: 6, label: 'V6', start: 0, display: 0 },
                    { x: -3.25, y: 2, label: 'V7', start: 0, display: 0 },
                    { x: -4.25, y: 12.5, label: 'V8', start: 1, display: 0 },
                    { x: 4.25, y: 12.5, label: 'V9', start: 0, display: 0 },
                    { x: 0, y: 0, label: 'V10', start: 1, display: 0 },
                ], 'arcs': [{ start: 'V9', end: 'V8', radius: 5.25, direction: 0, sweep: 1 }],
            },
            {
                'vertex': [
                    { x: 8.116, y: 0, label: 'V91', start: 1, display: 1 },
                    { x: 9, y: 0, label: 'V92', start: 0, display: 0 },
                    { x: 9, y: 0.884, label: 'V93', start: 0, display: 0 },
                    { x: -8.116, y: 16, label: 'V94', start: 0, display: 1 },
                    { x: -9, y: 16, label: 'V95', start: 0, display: 0 },
                    { x: -9, y: 15.116, label: 'V96', start: 0, display: 0 },

                ], 'arcs': [], 'fill': '#ff0000'
            },
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V10', start: 1, display: 0 },
                    { x: 9, y: 0, label: 'V11', start: 0, display: 0 },
                    { x: 9, y: 16, label: 'V12', start: 0, display: 0 },
                    { x: -9, y: 16, label: 'V13', start: 0, display: 0 },
                    { x: -9, y: 0, label: 'V14', start: 0, display: 0 },
                    { x: 0, y: 0.2, label: 'V15', start: 1, display: 0 },
                    { x: -8.8, y: 0.2, label: 'V16', start: 0, display: 0 },
                    { x: -8.8, y: 1.9, label: 'V17', start: 0, display: 0 },
                    { x: 8.8, y: 1.9, label: 'V18', start: 0, display: 0 },
                    { x: 8.8, y: 0.2, label: 'V19', start: 0, display: 0 },

                    { x: 0, y: 2.1, label: 'V25', start: 1, display: 0 },
                    { x: -8.8, y: 2.1, label: 'V26', start: 0, display: 0 },
                    { x: -8.8, y: 3.9, label: 'V27', start: 0, display: 0 },
                    { x: 8.8, y: 3.9, label: 'V28', start: 0, display: 0 },
                    { x: 8.8, y: 2.1, label: 'V29', start: 0, display: 0 },

                    { x: 0, y: 4.1, label: 'V35', start: 1, display: 0 },
                    { x: -8.8, y: 4.1, label: 'V36', start: 0, display: 0 },
                    { x: -8.8, y: 5.9, label: 'V37', start: 0, display: 0 },
                    { x: 8.8, y: 5.9, label: 'V38', start: 0, display: 0 },
                    { x: 8.8, y: 4.1, label: 'V39', start: 0, display: 0 },

                    { x: 0, y: 6.1, label: 'V45', start: 1, display: 0 },
                    { x: -8.8, y: 6.1, label: 'V46', start: 0, display: 0 },
                    { x: -8.8, y: 7.9, label: 'V47', start: 0, display: 0 },
                    { x: 8.8, y: 7.9, label: 'V48', start: 0, display: 0 },
                    { x: 8.8, y: 6.1, label: 'V49', start: 0, display: 0 },

                    { x: 0, y: 8.1, label: 'V55', start: 1, display: 0 },
                    { x: -8.8, y: 8.1, label: 'V56', start: 0, display: 0 },
                    { x: -8.8, y: 9.9, label: 'V57', start: 0, display: 0 },
                    { x: 8.8, y: 9.9, label: 'V58', start: 0, display: 0 },
                    { x: 8.8, y: 8.1, label: 'V59', start: 0, display: 0 },

                    { x: 0, y: 10.1, label: 'V65', start: 1, display: 0 },
                    { x: -8.8, y: 10.1, label: 'V66', start: 0, display: 0 },
                    { x: -8.8, y: 11.9, label: 'V67', start: 0, display: 0 },
                    { x: 8.8, y: 11.9, label: 'V68', start: 0, display: 0 },
                    { x: 8.8, y: 10.1, label: 'V69', start: 0, display: 0 },

                    { x: 0, y: 12.1, label: 'V75', start: 1, display: 0 },
                    { x: -8.8, y: 12.1, label: 'V76', start: 0, display: 0 },
                    { x: -8.8, y: 13.9, label: 'V77', start: 0, display: 0 },
                    { x: 8.8, y: 13.9, label: 'V78', start: 0, display: 0 },
                    { x: 8.8, y: 12.1, label: 'V79', start: 0, display: 0 },

                    { x: 0, y: 14.1, label: 'V85', start: 1, display: 0 },
                    { x: -8.8, y: 14.1, label: 'V86', start: 0, display: 0 },
                    { x: -8.8, y: 15.8, label: 'V87', start: 0, display: 0 },
                    { x: 8.8, y: 15.8, label: 'V88', start: 0, display: 0 },
                    { x: 8.8, y: 14.1, label: 'V89', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#000000'
            },
        ],
    },

    'TunnelOpened': {
        path: [ // 4.5.2.2
            {
                'vertex': [
                    { x: 0, y: 2, label: 'V1', start: 1, display: 1 },
                    { x: 3.25, y: 2, label: 'V2', start: 0, display: 0 },
                    { x: 7.25, y: 6, label: 'V3', start: 0, display: 0 },
                    { x: 7.25, y: 15, label: 'V4', start: 0, display: 0 },
                    { x: -7.25, y: 15, label: 'V5', start: 0, display: 0 },
                    { x: -7.25, y: 6, label: 'V6', start: 0, display: 0 },
                    { x: -3.25, y: 2, label: 'V7', start: 0, display: 0 },
                    { x: -4.25, y: 12.5, label: 'V8', start: 1, display: 0 },
                    { x: 4.25, y: 12.5, label: 'V9', start: 0, display: 0 },
                    { x: 0, y: 0, label: 'V10', start: 1, display: 0 },
                ], 'arcs': [{ start: 'V9', end: 'V8', radius: 5.25, direction: 0, sweep: 1 }],
            },
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V10', start: 1, display: 0 },
                    { x: 9, y: 0, label: 'V11', start: 0, display: 0 },
                    { x: 9, y: 16, label: 'V12', start: 0, display: 0 },
                    { x: -9, y: 16, label: 'V13', start: 0, display: 0 },
                    { x: -9, y: 0, label: 'V14', start: 0, display: 0 },
                    { x: 0, y: 0.2, label: 'V15', start: 1, display: 0 },
                    { x: -8.8, y: 0.2, label: 'V16', start: 0, display: 0 },
                    { x: -8.8, y: 1.9, label: 'V17', start: 0, display: 0 },
                    { x: 8.8, y: 1.9, label: 'V18', start: 0, display: 0 },
                    { x: 8.8, y: 0.2, label: 'V19', start: 0, display: 0 },

                    { x: 0, y: 2.1, label: 'V25', start: 1, display: 0 },
                    { x: -8.8, y: 2.1, label: 'V26', start: 0, display: 0 },
                    { x: -8.8, y: 3.9, label: 'V27', start: 0, display: 0 },
                    { x: 8.8, y: 3.9, label: 'V28', start: 0, display: 0 },
                    { x: 8.8, y: 2.1, label: 'V29', start: 0, display: 0 },

                    { x: 0, y: 4.1, label: 'V35', start: 1, display: 0 },
                    { x: -8.8, y: 4.1, label: 'V36', start: 0, display: 0 },
                    { x: -8.8, y: 5.9, label: 'V37', start: 0, display: 0 },
                    { x: 8.8, y: 5.9, label: 'V38', start: 0, display: 0 },
                    { x: 8.8, y: 4.1, label: 'V39', start: 0, display: 0 },

                    { x: 0, y: 6.1, label: 'V45', start: 1, display: 0 },
                    { x: -8.8, y: 6.1, label: 'V46', start: 0, display: 0 },
                    { x: -8.8, y: 7.9, label: 'V47', start: 0, display: 0 },
                    { x: 8.8, y: 7.9, label: 'V48', start: 0, display: 0 },
                    { x: 8.8, y: 6.1, label: 'V49', start: 0, display: 0 },

                    { x: 0, y: 8.1, label: 'V55', start: 1, display: 0 },
                    { x: -8.8, y: 8.1, label: 'V56', start: 0, display: 0 },
                    { x: -8.8, y: 9.9, label: 'V57', start: 0, display: 0 },
                    { x: 8.8, y: 9.9, label: 'V58', start: 0, display: 0 },
                    { x: 8.8, y: 8.1, label: 'V59', start: 0, display: 0 },

                    { x: 0, y: 10.1, label: 'V65', start: 1, display: 0 },
                    { x: -8.8, y: 10.1, label: 'V66', start: 0, display: 0 },
                    { x: -8.8, y: 11.9, label: 'V67', start: 0, display: 0 },
                    { x: 8.8, y: 11.9, label: 'V68', start: 0, display: 0 },
                    { x: 8.8, y: 10.1, label: 'V69', start: 0, display: 0 },

                    { x: 0, y: 12.1, label: 'V75', start: 1, display: 0 },
                    { x: -8.8, y: 12.1, label: 'V76', start: 0, display: 0 },
                    { x: -8.8, y: 13.9, label: 'V77', start: 0, display: 0 },
                    { x: 8.8, y: 13.9, label: 'V78', start: 0, display: 0 },
                    { x: 8.8, y: 12.1, label: 'V79', start: 0, display: 0 },

                    { x: 0, y: 14.1, label: 'V85', start: 1, display: 0 },
                    { x: -8.8, y: 14.1, label: 'V86', start: 0, display: 0 },
                    { x: -8.8, y: 15.8, label: 'V87', start: 0, display: 0 },
                    { x: 8.8, y: 15.8, label: 'V88', start: 0, display: 0 },
                    { x: 8.8, y: 14.1, label: 'V89', start: 0, display: 0 },
                ], 'arcs': [], 'fill': '#000000'
            },
        ],
    },

    'AmberLightAbove': {
        path: [ // Diagram 4.5.5.1
            {
                'vertex': [
                    { x: 4.8, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 4.8, y: 3.2, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V1', end: 'V2', radius: 1.6, direction: 1, sweep: 0 },
                { start: 'V2', end: 'V1', radius: 1.6, direction: 1, sweep: 0 }],
                'fill': '#0a0a0a'
            },
            {
                'vertex': [
                    { x: -4.8, y: 0, label: 'V3', start: 1, display: 0 },
                    { x: -4.8, y: 3.2, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V3', end: 'V4', radius: 1.6, direction: 1, sweep: 0 },
                { start: 'V4', end: 'V3', radius: 1.6, direction: 1, sweep: 0 }],
                'fill': '#0a0a0a'
            },
            {
                'vertex': [
                    { x: 4.8, y: 0.2, label: 'V11', start: 1, display: 0 },
                    { x: 4.8, y: 3, label: 'V12', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V11', end: 'V12', radius: 1.4, direction: 1, sweep: 0 },
                { start: 'V12', end: 'V11', radius: 1.4, direction: 1, sweep: 0 }],
                'fill': '#ffbf00'
            },
            {
                'vertex': [
                    { x: -4.8, y: 0.2, label: 'V13', start: 1, display: 0 },
                    { x: -4.8, y: 3, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V13', end: 'V14', radius: 1.4, direction: 1, sweep: 0 },
                { start: 'V14', end: 'V13', radius: 1.4, direction: 1, sweep: 0 }],
                'fill': '#ffbf00'
            },
        ],
    },

    'AmberLightBack': {
        path: [ // Diagram 4.5.5.3
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V21', start: 1, display: 0 },
                    { x: 9.6, y: 0, label: 'V23', start: 0, display: 0, radius: 1.6 },
                    { x: 9.6, y: 6.4, label: 'V24', start: 0, display: 0 },
                    { x: -9.6, y: 6.4, label: 'V25', start: 0, display: 0 },
                    { x: -9.6, y: 0, label: 'V26', start: 0, display: 0, radius: 1.6 },
                ], 'arcs': [],
                'fill': '#333333'
            },
            {
                'vertex': [
                    { x: 4.8, y: 1.6, label: 'V1', start: 1, display: 0 },
                    { x: 4.8, y: 4.8, label: 'V2', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V1', end: 'V2', radius: 1.6, direction: 1, sweep: 0 },
                { start: 'V2', end: 'V1', radius: 1.6, direction: 1, sweep: 0 }],
                'fill': '#0a0a0a'
            },
            {
                'vertex': [
                    { x: -4.8, y: 1.6, label: 'V3', start: 1, display: 0 },
                    { x: -4.8, y: 4.8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V3', end: 'V4', radius: 1.6, direction: 1, sweep: 0 },
                { start: 'V4', end: 'V3', radius: 1.6, direction: 1, sweep: 0 }],
                'fill': '#0a0a0a'
            },
            {
                'vertex': [
                    { x: 4.8, y: 1.8, label: 'V11', start: 1, display: 0 },
                    { x: 4.8, y: 4.6, label: 'V12', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V11', end: 'V12', radius: 1.4, direction: 1, sweep: 0 },
                { start: 'V12', end: 'V11', radius: 1.4, direction: 1, sweep: 0 }],
                'fill': '#ffbf00'
            },
            {
                'vertex': [
                    { x: -4.8, y: 1.8, label: 'V13', start: 1, display: 0 },
                    { x: -4.8, y: 4.6, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [{ start: 'V13', end: 'V14', radius: 1.4, direction: 1, sweep: 0 },
                { start: 'V14', end: 'V13', radius: 1.4, direction: 1, sweep: 0 }],
                'fill': '#ffbf00'
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
            },],
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
            { character: '中', x: -9.8, y: -9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
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
            { character: '東', x: -9.8, y: - 9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
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
            { character: '西', x: -9.8, y: - 9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'JTIS': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 15, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 15, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 14, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 14, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                ], 'arcs': []
            },
            {
                'vertex': [
                    { x: -10, y: 1, label: 'V11', start: 1, display: 1 },
                    { x: 3, y: 1, label: 'V12', start: 0, display: 0 },
                    { x: 3, y: 14, label: 'V13', start: 0, display: 0 },
                    { x: -10, y: 14, label: 'V14', start: 0, display: 0 }
                ], 'arcs': [], fill: '#000000'
            },

        ],
        text: [
            { character: 'mins', x: 3.25, y: -7.94, fontSize: 3 * 0.94, fontFamily: 'TransportMedium' },
            { character: '分鐘', x: 3.25, y: -10.94, fontSize: 3.5 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'JTIS-CHT': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 30, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 30, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V66', start: 1, display: 0 },
                    { x: -10, y: 16, label: 'V67', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V68', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 29, label: 'V69', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 16, label: 'V70', radius: 0.5, start: 0, display: 0 },
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
            {
                'vertex': [
                    { x: -10, y: 16, label: 'V71', start: 1, display: 1 },
                    { x: 3, y: 16, label: 'V72', start: 0, display: 0 },
                    { x: 3, y: 29, label: 'V73', start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V74', start: 0, display: 0 }
                ], 'arcs': [], fill: '#000000'
            },
        ],
        text: [
            { character: 'C', x: 4.845, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '中', x: -9.8, y: -9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' },
            { character: 'mins', x: 3.25, y: -22.94, fontSize: 3 * 0.94, fontFamily: 'TransportMedium' },
            { character: '分鐘', x: 3.25, y: -25.94, fontSize: 3.5 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'JTIS-EHC': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 30, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 30, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V66', start: 1, display: 0 },
                    { x: -10, y: 16, label: 'V67', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V68', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 29, label: 'V69', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 16, label: 'V70', radius: 0.5, start: 0, display: 0 },
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
            {
                'vertex': [
                    { x: -10, y: 16, label: 'V71', start: 1, display: 1 },
                    { x: 3, y: 16, label: 'V72', start: 0, display: 0 },
                    { x: 3, y: 29, label: 'V73', start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V74', start: 0, display: 0 }
                ], 'arcs': [], fill: '#000000'
            },
        ],
        text: [
            { character: 'E', x: 4.945, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '東', x: -9.8, y: - 9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' },
            { character: 'mins', x: 3.25, y: -22.94, fontSize: 3 * 0.94, fontFamily: 'TransportMedium' },
            { character: '分鐘', x: 3.25, y: -25.94, fontSize: 3.5 * 0.9, fontFamily: 'parsedFontKorean' }
        ]
    },

    'JTIS-WHC': {
        path: [ // 3.5.7.7
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 11, y: 0, label: 'V2', radius: 1.5, start: 0, display: 0 },
                    { x: 11, y: 30, label: 'V3', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 30, label: 'V4', radius: 1.5, start: 0, display: 0 },
                    { x: -11, y: 0, label: 'V5', radius: 1.5, start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V6', start: 1, display: 0 },
                    { x: -10, y: 1, label: 'V7', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 15, label: 'V8', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 15, label: 'V9', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 1, label: 'V10', radius: 0.5, start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V66', start: 1, display: 0 },
                    { x: -10, y: 16, label: 'V67', radius: 0.5, start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V68', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 29, label: 'V69', radius: 0.5, start: 0, display: 0 },
                    { x: 10, y: 16, label: 'V70', radius: 0.5, start: 0, display: 0 },
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
            {
                'vertex': [
                    { x: -10, y: 16, label: 'V71', start: 1, display: 1 },
                    { x: 3, y: 16, label: 'V72', start: 0, display: 0 },
                    { x: 3, y: 29, label: 'V73', start: 0, display: 0 },
                    { x: -10, y: 29, label: 'V74', start: 0, display: 0 }
                ], 'arcs': [], fill: '#000000'
            },
        ],
        text: [
            { character: 'W', x: 4.2, y: -9, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
            { character: '西', x: -9.8, y: - 9.3, fontSize: 5.7 * 0.9, fontFamily: 'parsedFontKorean' },
            { character: 'mins', x: 3.25, y: -22.94, fontSize: 3 * 0.94, fontFamily: 'TransportMedium' },
            { character: '分鐘', x: 3.25, y: -25.94, fontSize: 3.5 * 0.9, fontFamily: 'parsedFontKorean' }
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

    'CableCar': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
                    { x: 0.426, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 0.426, y: 3.407, label: 'V3', start: 0, display: 0 },
                    { x: 3.212, y: 3.407, label: 'V4', start: 0, display: 0 },
                    { x: 3.097, y: 3.044, label: 'V5', start: 0, display: 0 },
                    { x: 3.697, y: 3.044, label: 'V6', start: 0, display: 0 },
                    { x: 5.319, y: 8.271, label: 'V7', start: 0, display: 0 },
                    { x: 5.383, y: 11.477, label: 'V8', start: 0, display: 0 },
                    { x: 4.158, y: 16.070, label: 'V9', start: 0, display: 0 },
                    { x: 3.585, y: 16.070, label: 'V10', start: 0, display: 0 },
                    { x: 3.833, y: 15.133, label: 'V11', start: 0, display: 0 },
                    { x: -3.833, y: 15.133, label: 'V12', start: 0, display: 0 },
                    { x: -3.585, y: 16.070, label: 'V13', start: 0, display: 0 },
                    { x: -4.158, y: 16.070, label: 'V14', start: 0, display: 0 },
                    { x: -5.383, y: 11.477, label: 'V15', start: 0, display: 0 },
                    { x: -5.319, y: 8.271, label: 'V16', start: 0, display: 0 },
                    { x: -3.697, y: 3.044, label: 'V17', start: 0, display: 0 },
                    { x: -3.097, y: 3.044, label: 'V18', start: 0, display: 0 },
                    { x: -3.212, y: 3.407, label: 'V19', start: 0, display: 0 },
                    { x: -0.426, y: 3.407, label: 'V20', start: 0, display: 0 },
                    { x: -0.426, y: 0, label: 'V21', start: 0, display: 0 },
                    { x: 3.518, y: 4.390, label: 'V31', start: 1, display: 0 },
                    { x: 3.518, y: 10.656, label: 'V32', start: 0, display: 0 },
                    { x: 4.983, y: 10.656, label: 'V33', start: 0, display: 0 },
                    { x: 4.790, y: 8.437, label: 'V34', start: 0, display: 0 },
                    { x: 0.235, y: 4.390, label: 'V35', start: 1, display: 0 },
                    { x: 0.235, y: 10.656, label: 'V36', start: 0, display: 0 },
                    { x: 3.048, y: 10.656, label: 'V37', start: 0, display: 0 },
                    { x: 3.048, y: 4.390, label: 'V38', start: 0, display: 0 },
                    { x: -3.518, y: 4.390, label: 'V41', start: 1, display: 0 },
                    { x: -4.790, y: 8.437, label: 'V42', start: 0, display: 0 },
                    { x: -4.983, y: 10.656, label: 'V43', start: 0, display: 0 },
                    { x: -3.518, y: 10.656, label: 'V44', start: 0, display: 0 },
                    { x: -0.235, y: 4.390, label: 'V45', start: 1, display: 0 },
                    { x: -3.048, y: 4.390, label: 'V46', start: 0, display: 0 },
                    { x: -3.048, y: 10.656, label: 'V47', start: 0, display: 0 },
                    { x: -0.235, y: 10.656, label: 'V48', start: 0, display: 0 },

                ], 'arcs': [
                    { start: 'V7', end: 'V8', radius: 5.709, direction: 1, sweep: 0 },
                    { start: 'V15', end: 'V16', radius: 5.709, direction: 1, sweep: 0 },
                    { start: 'V33', end: 'V34', radius: 5.155, direction: 0, sweep: 0 },
                    { start: 'V42', end: 'V43', radius: 5.155, direction: 0, sweep: 0 },

                ],
            },
            {
                'vertex': [
                    { x: 0.641, y: 1.103, label: 'V51', start: 1, display: 0 },
                    { x: 7.147, y: 2.847, label: 'V52', start: 0, display: 0 },
                    { x: 7.147, y: 3.335, label: 'V53', start: 0, display: 0 },
                    { x: 0.641, y: 1.589, label: 'V54', start: 0, display: 0 },
                ], 'arcs': [],
            },
            {
                'vertex': [
                    { x: -0.641, y: 0.761, label: 'V55', start: 1, display: 0 },
                    { x: -7.147, y: -0.982, label: 'V56', start: 0, display: 0 },
                    { x: -7.147, y: -0.497, label: 'V57', start: 0, display: 0 },
                    { x: -0.641, y: 1.246, label: 'V58', start: 0, display: 0 },
                ], 'arcs': [],
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
    }, 'LeftArrow': {
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

    'NoEntry': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8.25, y: 8.25, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16.5, label: 'V3', start: 0, display: 0 },
                    { x: -8.25, y: 8.25, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8.25, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8.25, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8.25, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8.25, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 0, y: 0.25, label: 'V11', start: 1, display: 0 },
                    { x: 8, y: 8.25, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 16.25, label: 'V13', start: 0, display: 0 },
                    { x: -8, y: 8.25, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 6.75, label: 'V21', start: 1, display: 0 },
                    { x: 7.25, y: 6.75, label: 'V22', start: 0, display: 0, radius: 0.75 },
                    { x: 7.25, y: 9.75, label: 'V23', start: 0, display: 0, radius: 0.75 },
                    { x: -7.25, y: 9.75, label: 'V24', start: 0, display: 0, radius: 0.75 },
                    { x: -7.25, y: 6.75, label: 'V25', start: 0, display: 0, radius: 0.75 },
                ], 'arcs': [], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
    },

    'AllVehProhibited': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            }, {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },

        ],
    },

    'NoLeftTurn': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -4.557, y: 5.173, label: 'V21', start: 1, display: 0 },
                    { x: -5.6, y: 5.973, label: 'V22', start: 0, display: 0 },
                    { x: -4.557, y: 6.773, label: 'V23', start: 0, display: 0 },
                    { x: 0.96, y: 6.773, label: 'V24', start: 0, display: 0, radius: 0.533 },
                    { x: 0.96, y: 13.333, label: 'V25', start: 0, display: 0 },
                    { x: 2.56, y: 13.333, label: 'V26', start: 0, display: 0 },
                    { x: 2.56, y: 5.173, label: 'V27', start: 0, display: 0, radius: 1.6 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                    { x: -5.056, y: 4.076, label: 'V11', start: 1, display: 0 },
                    { x: 3.924, y: 13.056, label: 'V12', start: 0, display: 0 },
                    { x: -3.924, y: 2.944, label: 'V13', start: 1, display: 0 },
                    { x: 5.056, y: 11.924, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 0, sweep: 0 },
                    { start: 'V14', end: 'V13', radius: 6.4, direction: 0, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            }, {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },

        ],
    },

    'NoRightTurn': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 4.557, y: 5.173, label: 'V21', start: 1, display: 0 },
                    { x: 5.6, y: 5.973, label: 'V22', start: 0, display: 0 },
                    { x: 4.557, y: 6.773, label: 'V23', start: 0, display: 0 },
                    { x: -0.96, y: 6.773, label: 'V24', start: 0, display: 0, radius: 0.533 },
                    { x: -0.96, y: 13.333, label: 'V25', start: 0, display: 0 },
                    { x: -2.56, y: 13.333, label: 'V26', start: 0, display: 0 },
                    { x: -2.56, y: 5.173, label: 'V27', start: 0, display: 0, radius: 1.6 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                    { x: 5.056, y: 4.076, label: 'V11', start: 1, display: 0 },
                    { x: -3.924, y: 13.056, label: 'V12', start: 0, display: 0 },
                    { x: 3.924, y: 2.944, label: 'V13', start: 1, display: 0 },
                    { x: -5.056, y: 11.924, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V11', radius: 6.4, direction: 0, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 0, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            }, {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },

        ],
    },

    'NoUTurn': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -3.467, y: 13.067, label: 'V21', start: 1, display: 0 },
                    { x: -3.467, y: 6.667, label: 'V22', start: 0, display: 0 },
                    { x: 3.467, y: 6.667, label: 'V23', start: 0, display: 0 },
                    { x: 3.467, y: 11.677, label: 'V24', start: 0, display: 0 },
                    { x: 2.4, y: 13.067, label: 'V25', start: 0, display: 0 },
                    { x: 1.333, y: 11.677, label: 'V26', start: 0, display: 0 },
                    { x: 1.333, y: 6.667, label: 'V27', start: 0, display: 0 },
                    { x: -1.333, y: 6.667, label: 'V28', start: 0, display: 0 },
                    { x: -1.333, y: 13.067, label: 'V29', start: 0, display: 0 },
                    { x: -2.4, y: 11.0667, label: 'V30', start: 0, display: 0 },

                ], 'arcs': [
                    { start: 'V22', end: 'V23', radius: 3.467, direction: 1, sweep: 0 },
                    { start: 'V27', end: 'V28', radius: 1.333, direction: 0, sweep: 0 },
                ], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                    { x: -5.899, y: 5.518, label: 'V11', start: 1, display: 0 },
                    { x: 5.099, y: 11.868, label: 'V12', start: 0, display: 0 },
                    { x: -5.099, y: 4.132, label: 'V13', start: 1, display: 0 },
                    { x: 5.899, y: 10.482, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 0, sweep: 0 },
                    { start: 'V14', end: 'V13', radius: 6.4, direction: 0, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            }, {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },

        ],
    },

    '2.3WidthLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 4.516, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: 5.867, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: 5.867, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -4.516, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: -5.867, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: -5.867, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            }, {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },

        ],
        text: [
            { character: '2.3', x: -4.52, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.45, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    '2.5WidthLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 4.466, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: 5.817, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: 5.817, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -4.466, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: -5.817, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: -5.817, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '2.5', x: -4.47, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.4, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    '2.7WidthLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 4.25, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: 5.60, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: 5.60, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -4.25, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: -5.601, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: -5.601, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '2.7', x: -4.25, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.184, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    '2.9WidthLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: 4.466, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: 5.817, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: 5.817, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -4.466, y: 8, label: 'V11', start: 1, display: 0 },
                    { x: -5.817, y: 6.667, label: 'V12', start: 0, display: 0 },
                    { x: -5.817, y: 9.333, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '2.9', x: -4.47, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.4, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    '2HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '2', x: -3.111, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 0.017, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '3HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '3', x: -3.2, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 0.107, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '3.5HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '3.5', x: -4.853, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.76, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4', x: -3.218, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 0.124, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.1HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.1', x: -4.462, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.369, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.2HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.2', x: -4.836, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.742, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.3HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.3', x: -4.924, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.831, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.4HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.4', x: -4.942, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.849, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.5HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.5', x: -4.871, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.778, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.6HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.6', x: -4.871, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.778, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.7HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.7', x: -4.853, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.76, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },
    '4.8HeightLimit': {
        path: [
            {
                'vertex': [
                    { x: 0, y: 0, label: 'V1', start: 1, display: 0 },
                    { x: 8, y: 8, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 16, label: 'V3', start: 0, display: 0 },
                    { x: -8, y: 8, label: 'V4', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V1', end: 'V2', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V2', end: 'V3', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V3', end: 'V4', radius: 8, direction: 1, sweep: 0 },
                    { start: 'V4', end: 'V1', radius: 8, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(224, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 1.6, label: 'V11', start: 1, display: 0 },
                    { x: 6.4, y: 8, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 14.4, label: 'V13', start: 0, display: 0 },
                    { x: -6.4, y: 8, label: 'V14', start: 0, display: 0 },
                ], 'arcs': [
                    { start: 'V11', end: 'V12', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V12', end: 'V13', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V13', end: 'V14', radius: 6.4, direction: 1, sweep: 0 },
                    { start: 'V14', end: 'V11', radius: 6.4, direction: 1, sweep: 0 },
                ], 'fill': 'rgb(255, 255, 255)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 2.133, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 2.133, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 4.267, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: -1.6, y: 13.866, label: 'V11', start: 1, display: 0 },
                    { x: 1.6, y: 13.866, label: 'V12', start: 0, display: 0 },
                    { x: 0, y: 11.733, label: 'V13', start: 0, display: 0 },
                ], 'arcs': [], 'fill': 'rgb(0, 0, 0)'
            },
            {
                'vertex': [
                    { x: 0, y: 8, label: 'C1', start: 1, display: 1 },
                ],
            },
        ],
        text: [
            { character: '4.8', x: -4.942, y: -6.2, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
            { character: 'm', x: 1.849, y: -6.9, fontSize: 3.556, fontFamily: 'TransportHeavy', fill: '#000000' },
        ]
    },

    'Lozenge': {
        path: [
            {
                'vertex': [
                    { x: 0, y: -1, label: 'V1', start: 1, display: 1 },
                    { x: 2, y: 0, label: 'V2', start: 0, display: 0 },
                    { x: 0, y: 1, label: 'V3', start: 0, display: 0 },
                    { x: -2, y: 0, label: 'V4', start: 0, display: 0 },
                ], 'arcs': []
            }
        ]
    },

};

export const symbolsTemplateAlt = {
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