const BorderColorScheme = {
    "Blue Background": {
        'background': '#0000FE',
        'symbol': 'white',
    },
    "Green Background": {
        'background': '#00B95F',
        'symbol': 'white',
    },
}

const BorderTypeScheme = {
    'stack': StackBorderTemplate,
    'flagLeft': FlagLeftBorderTemplate,
}

function StackBorderTemplate(xHeight, block, padding, border) {
    const length = xHeight / 4
    const borderType = {
        'Stack': [{
            'vertex': [
                { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', start: 1 },
                { x: block.width + padding.right + border, y: 0 - padding.top - border, label: 'V2', start: 0 },
                { x: block.width + padding.right + border, y: block.height + padding.bottom + border, label: 'V3', start: 0 },
                { x: 0, y: block.height + padding.bottom + border, label: 'V4', start: 0 },
            ]
        }],

    }
}

function FlagLeftBorderTemplate(xHeight, block) {
    const length = xHeight / 4
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
    }
    const v = block.height > 4.85 * xHeight ? variables['4Lines'] : variables['2Lines']

    const padding = {
        left: v.D + (block.height / length + v.E - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
        top: v.E,
        right: v.E,
        bottom: v.D,
    }

    const border = v.A

    const returnBorder = [{
        'vertex': [ // TPDM 3.5.5.10
            // (H+E-D) / 2 / tan 60o + (A+B+C) / cos 30o - (H+E-D) / 2 * tan 30o
            { x: 0, y: 0 ,  label: 'V0', start: 1 },
    ], 'arcs': [],
        'fill': 'symbol'
    },
        {
            'vertex': [ // TPDM 3.5.5.10
                // (H+E-D) / 2 / tan 60o + (A+B+C) / cos 30o - (H+E-D) / 2 * tan 30o
                { x: 0 - padding.left + (block.height / length + v.E + v.D + v.A * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
                { x: block.width / length + padding.right + border, y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 },
                { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V3', start: 0 },
                { x: 0 - padding.left + (block.height / length + v.E + v.D + v.A * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0 },
                { x: 0 - padding.left, y: 0 - v.E - v.A + (block.height / length + v.E + v.D + v.A * 2) / 2, radius: v.F, label: 'V5', start: 0 }
            ], 'arcs': [],
            'fill': 'symbol'
        }, {
            'vertex': [ // inner
                { x: 0 - padding.left + v.A + (block.height / length + v.E + v.D) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V6', start: 1 },
                { x: block.width / length + padding.right, y: 0 - padding.top, radius: v.G, label: 'V7', start: 0 },
                { x: block.width / length + padding.right, y: block.height / length + padding.bottom, radius: v.G, label: 'V8', start: 0 },
                { x: 0 - padding.left + v.A + (block.height / length + v.E + v.D) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0 },
                { x: 0 - padding.left + v.A, y: 0 - v.E - v.A + (block.height / length + v.E + v.D + v.A * 2) / 2, label: 'V10', start: 0 }
            ], 'arcs': [],
            'fill': 'background'
        },
    ]

    returnBorder.forEach(path => {
        path.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.y *= length;
            if (vertex.radius) vertex.radius *= length;
        });
        path.arcs.forEach(arc => {
            arc.radius *= length;
        });
    });
    return returnBorder


}

function drawLabeledBorder(borderType, xHeight, bbox, color) {

    block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top }
    shapeMeta = BorderTypeScheme[borderType](xHeight, block)
    baseGroup = []
    // Create polygon with labeled vertices
    shapeMeta.forEach(p => {
        const vertexleft = - Math.min(...p.vertex.map(v => v.x));
        const vertextop = - Math.min(...p.vertex.map(v => v.y));


        p.vertex.forEach((p) => {
            p.x = p.x + bbox.left;
            p.y = p.y + bbox.top;
        });

        const pathData = vertexToPath([p]);
        baseGroup.push(
            new fabric.Path(pathData,
                {
                    left: bbox.left - vertexleft,
                    top: bbox.top - vertextop,
                    fill: BorderColorScheme[color][p['fill']],
                    // originX: 'center',
                    objectCaching: false,
                    strokeWidth: 0,
                })
        );
    })
    GroupedBorder = new fabric.Group (baseGroup)
    GroupedBorder.vertex = shapeMeta.map(p => p.vertex).flat()
    BaseBorder = drawBasePolygon(GroupedBorder, 'Border')
    canvas.sendObjectToBack(BaseBorder)
}