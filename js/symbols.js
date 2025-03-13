const symbolsTemplate = {
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
          { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
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
          { x: 0.25, y: 1.25, label: 'V11', start: 1, display: 1 },
          { x: 0.75, y: 1.25, label: 'V12', start: 0, display: 0 },
          { x: 0.972, y: 2.75, label: 'V13', start: 0, display: 0 },
          { x: 0.25, y: 2.75, label: 'V14', start: 0, display: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -0.25, y: 1.25, label: 'V15', start: 1, display: 1 },
          { x: -0.25, y: 2.75, label: 'V16', start: 0, display: 0 },
          { x: -0.972, y: 2.75, label: 'V17', start: 0, display: 0 },
          { x: -0.75, y: 1.25, label: 'V18', start: 0, display: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: 0, y: 3.25, label: 'V19', start: 1, display: 1 },
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
          { x: 0.25, y: 4.25, label: 'V32', start: 1, display: 1 },
          { x: 1.194, y: 4.25, label: 'V33', start: 0, display: 0 },
          { x: 1.5, y: 8, label: 'V34', start: 0, display: 0 },
          { x: 0.25, y: 8, label: 'V35', start: 0, display: 0 },
        ], 'arcs': []
      },
      {
        'vertex': [
          { x: -0.25, y: 4.25, label: 'V36', start: 1, display: 1 },
          { x: -0.25, y: 8, label: 'V371', start: 0, display: 0 },
          { x: -1.5, y: 8, label: 'V38', start: 0, display: 0 },
          { x: -1.194, y: 4.25, label: 'V39', start: 0, display: 0 },
        ], 'arcs': []
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
      { character: 'C', x: 4.845, y: -8, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
      { character: '中', x: -9.8, y: - 9, fontSize: 5.7 * 0.9, fontFamily: 'Chinese' }
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
      { character: 'E', x: 4.945, y: -8, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
      { character: '東', x: -9.8, y: - 9, fontSize: 5.7 * 0.9, fontFamily: 'Chinese' }
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
      { character: 'W', x: 4.2, y: -8, fontSize: 6.5 * 0.94, fontFamily: 'TransportMedium' },
      { character: '西', x: -9.8, y: - 9, fontSize: 5.7 * 0.9, fontFamily: 'Chinese' }
    ]
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '1', x: -1.56, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '2', x: -2.4, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '3', x: -2.54, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '4', x: -2.64, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '5', x: -2.44, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '6', x: -2.52, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '7', x: -2.08, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '8', x: -2.6, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '9', x: -2.56, y: -0.9, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
    ]
  },

  'Route10': {
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '10', x: -4.22, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '11', x: -3.12, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': '#ffff01'
      },
    ],
    text: [
      { character: '12', x: -3.96, y: -0.5, fontSize: 8 * 0.94, fontFamily: 'TransportMedium', fill: 'black' },
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
        ], 'fill': 'white'
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
        ], 'fill': 'white'
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
          { x: -1.0667, y: 0.5333, label: 'V2', start: 0, display: 0 },
          { x: -1.6667, y: 0.5333, label: 'V2', start: 0, display: 0 },
          { x: -1.6667, y: 1.0333, label: 'V2', start: 0, display: 0 },
          { x: -1.2, y: 1.0333, label: 'V2', start: 0, display: 0 },
          { x: -1.2, y: 1.3667, label: 'V2', start: 0, display: 0 },
          { x: -1.6667, y: 1.3667, label: 'V2', start: 0, display: 0 },
          { x: -1.6667, y: 1.8667, label: 'V2', start: 0, display: 0 },
          { x: -1.0667, y: 1.8667, label: 'V2', start: 0, display: 0 },
          { x: -1.0667, y: 2.2, label: 'V2', start: 0, display: 0 },
          { x: -2, y: 2.2, label: 'V2', start: 0, display: 0 },
        ], 'arcs': [
        ], 'fill': 'white'
      },
      {
        'vertex': [ //X
          { x: -0.8, y: 0.2, label: 'V1', start: 1, display: 1 },
          { x: -0.4469, y: 0.2, label: 'V2', start: 0, display: 0 },
          { x: -0.3, y: 0.6197, label: 'V2', start: 0, display: 0 },
          { x: -0.1532, y: 0.2, label: 'V2', start: 0, display: 0 },
          { x: 0.2, y: 0.2, label: 'V2', start: 0, display: 0 },
          { x: -0.15, y: 1.2, label: 'V2', start: 0, display: 0 },
          { x: 0.2, y: 2.2, label: 'V2', start: 0, display: 0 },
          { x: -0.1532, y: 2.2, label: 'V2', start: 0, display: 0 },
          { x: -0.3, y: 1.7808, label: 'V2', start: 0, display: 0 },
          { x: -0.4469, y: 2.2, label: 'V2', start: 0, display: 0 },
          { x: -0.8, y: 2.2, label: 'V1', start: 0, display: 0 },
          { x: -0.45, y: 1.2, label: 'V2', start: 0, display: 0 },
        ], 'arcs': [
        ], 'fill': 'white'
      },
      {
        'vertex': [ //I
          { x: 0.543, y: 0.2, label: 'V1', start: 1, display: 1 },
          { x: 0.8, y: 0.2, label: 'V2', start: 0, display: 0 },
          { x: 0.8, y: 2.2, label: 'V2', start: 0, display: 0 },
          { x: 0.543, y: 2.2, label: 'V1', start: 0, display: 0 },
        ], 'arcs': [
        ], 'fill': 'white'
      },
      {
        'vertex': [ //T
          { x: 1.0667, y: 0.2, label: 'V1', start: 1, display: 1 },
          { x: 2, y: 0.2, label: 'V1', start: 0, display: 0 },
          { x: 2, y: 0.5333, label: 'V1', start: 0, display: 0 },
          { x: 1.7, y: 0.5333, label: 'V1', start: 0, display: 0 },
          { x: 1.7, y: 2.2, label: 'V1', start: 0, display: 0 },
          { x: 1.3667, y: 2.2, label: 'V1', start: 0, display: 0 },
          { x: 1.3667, y: 0.5333, label: 'V1', start: 0, display: 0 },
          { x: 1.0667, y: 0.5333, label: 'V1', start: 0, display: 0 },
        ], 'arcs': [
        ], 'fill': 'white'
      },
      {
        'vertex': [
          { x: 0.4, y: 2.6, label: 'V1', start: 1, display: 1 },
          { x: 0.4, y: 3.5333, label: 'V1', start: 0, display: 0 },
          { x: 1.3333, y: 3.5333, label: 'V1', start: 0, display: 0 },
          { x: 1.3333, y: 3, label: 'V1', start: 0, display: 0 },
          { x: 1.8667, y: 3, label: 'V1', start: 0, display: 0 },
          { x: 1.8667, y: 4.0667, label: 'V1', start: 0, display: 0 },
          { x: 0.4, y: 4.0667, label: 'V1', start: 0, display: 0 },
          { x: 0.4, y: 5, label: 'V1', start: 0, display: 0 },
          { x: 1.4667, y: 5, label: 'V1', start: 0, display: 0 },
          { x: 1.4667, y: 4.4667, label: 'V1', start: 0, display: 0 },
          { x: 2, y: 4.4667, label: 'V1', start: 0, display: 0 },
          { x: 2, y: 5.8, label: 'V1', start: 0, display: 0 },
          { x: 1.4667, y: 5.8, label: 'V1', start: 0, display: 0 },
          { x: 1.4667, y: 5.5333, label: 'V1', start: 0, display: 0 },
          /////
          { x: -1.4667, y: 5.5333, label: 'V1', start: 0, display: 0 },
          { x: -1.4667, y: 5.8, label: 'V1', start: 0, display: 0 },
          { x: -2, y: 5.8, label: 'V1', start: 0, display: 0 },
          { x: -2, y: 4.4667, label: 'V1', start: 0, display: 0 },
          { x: -1.4667, y: 4.4667, label: 'V1', start: 0, display: 0 },
          { x: -1.4667, y: 5, label: 'V1', start: 0, display: 0 },
          { x: -0.4, y: 5, label: 'V1', start: 0, display: 0 },
          { x: -0.4, y: 4.0667, label: 'V1', start: 0, display: 0 },
          { x: -1.8667, y: 4.0667, label: 'V1', start: 0, display: 0 },
          { x: -1.8667, y: 3, label: 'V1', start: 0, display: 0 },
          { x: -1.3333, y: 3, label: 'V1', start: 0, display: 0 },
          { x: -1.3333, y: 3.5333, label: 'V1', start: 0, display: 0 },
          { x: -0.4, y: 3.5333, label: 'V1', start: 0, display: 0 },
          { x: -0.4, y: 2.6, label: 'V1', start: 0, display: 0 },

        ], 'arcs': [
        ], 'fill': 'white'
      },
    ],
    text: []
  },


};

async function getFontPath(t) {
  let buffer;
  if (t.fontFamily == 'TransportMedium') {
    buffer = await fetch('./css/font/TransportMedium.woff').then(res => res.arrayBuffer());
  } else {
    buffer = await fetch('./css/font/NotoSansHK-Bold.ttf').then(res => res.arrayBuffer());
  }
  const FontGlyphs = opentype.parse(buffer);
  return FontGlyphs.getPath(t.character, t.x, t.y, t.fontSize, { flipY: true });
}



function calcSymbol(type, length) {
  let symbol
  if (typeof type === 'string') {
    const symbolsT = JSON.parse(JSON.stringify(symbolsTemplate)); // Deep copy to avoid mutation
    symbol = symbolsT[type];
  } else {
    symbol = JSON.parse(JSON.stringify(type));
  }

  symbol.path.forEach(path => {
    path.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.y *= length;
      if (vertex.radius) vertex.radius *= length;
    });
    path.arcs.forEach(arc => {
      arc.radius *= length;
      if (arc.radius2) { arc.radius2 *= length; }
    });
  });

  if (symbol.text) {
    symbol.text.forEach(t => {
      t.x *= length;
      t.y *= length;
      t.fontSize *= length;
    }
    )
  }

  return symbol;
}

function getInsertOffset(shapeMeta, angle = 0) {
  const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
  const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));
  return { left: vertexleft, top: vertextop }
}

// draw segment in svg between vertex
function drawSegment(current, next, previous, prevArc, final = false) {
  let pathString = ''
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

  } else if (prevArc && (!current.start || final)) {
    pathString += ` A ${prevArc.radius} ${prevArc.radius2 ? prevArc.radius2 : prevArc.radius} 0 ${prevArc.sweep} ${prevArc.direction} ${current.x} ${current.y}`
  } else {
    // Line to the next point
    pathString += ` ${current.start ? 'M' : 'L'} ${current.x} ${current.y}`;
  }
  return pathString
}

// Convert shapeMeta.vertex points to SVG path string with circular trims
function vertexToPath(shapeMeta) {
  let svgContent = '<svg>';
  let pathString = '';
  let textPromises = [];

  shapeMeta.path.forEach((path) => {
    const fillColor = path.fill || 'white';
    let pathStart = path.vertex[0]
    let pathNext = path.vertex[1]
    for (let i = 0; i < path.vertex.length; i++) {
      const current = path.vertex[i];
      const next = path.vertex[(i + 1) % path.vertex.length];
      const previous = path.vertex.at(i - 1);
      const prevArc = path.arcs.find(arc => (arc.end == current.label))

      pathString += drawSegment(current, next, previous, prevArc)

      // at end of path
      if (next.start == 1) {
        // Handle the last corner (which is also the first corner)
        const finalArc = path.arcs.find(arc => (arc.start == current.label))
        pathString += drawSegment(pathStart, pathNext, current, finalArc, true)
        pathString += ' Z'
        pathStart = next
        pathNext = path.vertex[(i + 2) % path.vertex.length];
      }

    }

    svgContent += `<path d="${pathString}" fill="${fillColor}" />`;
    pathString = ''
  })

  // handle text objects in path
  if (shapeMeta.text && shapeMeta.text.length > 0) {
    shapeMeta.text.forEach(t => {
      const fillColor = t.fill||'white';
      
      // Create a promise for each text element
      textPromises.push(
        getFontPath(t).then(charPath => {
          charPath.commands.map(c => {
        c.y = - c.y
        if (c.y1) { c.y1 = - c.y1 }
          })
          svgContent += `<path d="${charPath.toPathData()}" fill="${fillColor}" />`;
        })
      );
        })
      }

      // If we have text promises, await them all before returning the SVG content
      if (textPromises.length > 0) {
        return (async () => {
          await Promise.all(textPromises);
          svgContent += '</svg>';
          return svgContent;
        })();
      } else {
        // If no text promises, just return the SVG content immediately
        svgContent += '</svg>';
        return svgContent;
      }
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

function calculateTransformedPoints(pointsList, options) {
  const { x, y, angle } = options;
  const radians = angle * (Math.PI / 180); // Convert angle to radians
  const points = pointsList.path?pointsList.path[0].vertex:pointsList

  return points.map(point => {
    // Translate point to origin
    const translatedX = point.x;
    const translatedY = point.y;

    // Apply rotation
    const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

    // Translate point back to the specified position
    return {
      ...point,
      x: rotatedX + x,
      y: rotatedY + y,
      label: point.label
    };
  });
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