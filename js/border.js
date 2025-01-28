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

function StackBorderTemplate(xHeight, block, rounding) {
    const padding = {
        left: v.D + (block.height / length + v.E - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
        top: v.E,
        right: v.E,
        bottom: v.D,
    }

    const border = v.A
    const returnBorder = [{
        'Stack': [{
            'vertex': [
                { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', radius:3, start: 1 },
                { x: block.width + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius:3, start: 0 },
                { x: block.width + padding.right + border, y: block.height + padding.bottom + border, label: 'V3', radius:3, start: 0 },
                { x: 0, y: block.height + padding.bottom + border, label: 'V4', radius:3, start: 0 },
            ], 'arcs': [],
            'fill': 'symbol'
        },{
            'vertex': [ // TPDM 3.5.5.10
                { x: 0 - padding.left , y: 0 - padding.top , label: 'V1', radius:1.5, start: 1 },
                { x: block.width + padding.right , y: 0 - padding.top , label: 'V2', radius:1.5, start: 0 },
                { x: block.width + padding.right , y: block.height + padding.bottom , label: 'V3', radius:1.5, start: 0 },
                { x: 0- padding.right, y: block.height + padding.bottom , label: 'V4', radius:1.5, start: 0 },
            ], 'arcs': [],
            'fill': 'background'
        },],
    }]
    return returnBorder
    }


function FlagLeftBorderTemplate(xHeight, block, rounding) {
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
        left: v.D + (block.height / length + v.E + rounding.y- v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
        top: v.E + rounding.y / 2,
        right: v.E + rounding.y / 2,
        bottom: v.D,
    }

    const border = v.A

    const panel = {top}

    const returnBorder = [{
        'vertex': [ // TPDM 3.5.5.10
            // (H+E-D) / 2 / tan 60o + (A+B+C) / cos 30o - (H+E-D) / 2 * tan 30o
            { x: 0, y: 0, label: 'V0', start: 1 },
        ], 'arcs': [],
        'fill': 'symbol'
    },
    {
        'vertex': [ // TPDM 3.5.5.10
            // (H+E-D) / 2 / tan 60o + (A+B+C) / cos 30o - (H+E-D) / 2 * tan 30o
            { x: 0 - padding.left + (block.height / length + v.E + rounding.y / 2 + v.D + v.A * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
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
    }, {
        'vertex': [ // arrow
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 - v.E + v.D, label: 'V11', start: 1 },
            { x: 0 - v.D, y: 0 - v.E + v.D, label: 'V12', start: 0 },
            { x: -padding.left + v.A + (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - v.A + (block.height / length + v.E + v.D + v.A * 2) / 2, label: 'V13', start: 0 },
            { x: 0 - v.D, y: 0 + block.height / length, label: 'V14', start: 0 },
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0 },
            { x: -padding.left + v.A + v.B / Math.cos(Math.PI / 6), y: 0 - v.E - v.A + (block.height / length + v.E + v.D + v.A * 2) / 2, label: 'V16', start: 0 },
        ], 'arcs': [],
        'fill': 'symbol'
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
    rounding = {x:0, y:0}
    shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)
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
    borderWidth = 0
    borderHeight = 0
    baseGroup.forEach(b => {
        borderWidth = Math.max(borderWidth, b.getBoundingRect().width)
        borderHeight = Math.max(borderHeight, b.getBoundingRect().height)
    })

    if (borderWidth > 2000 || borderHeight > 2000) {
      roundingX = (50.0 * Math.round(borderWidth / 50.0) - borderWidth) / 2
      roundingY = (50.0 * Math.round(borderHeight / 50.0) - borderHeight) / 2
    } else {
      roundingX = (25.0 * Math.round(borderWidth / 25.0) - borderWidth) / 2
      roundingY = (25.0 * Math.round(borderHeight / 25.0) - borderHeight) / 2
      roundingX = roundingX < -2.5 ? roundingX = 25 / 2 + roundingX : roundingX
      roundingY = roundingY < -2.5 ? roundingY = 25 / 2 + roundingY : roundingY
    }

    rounding = {x:roundingX, y:roundingY}
    shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)
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

    GroupedBorder = new fabric.Group(baseGroup)
    GroupedBorder.vertex = shapeMeta.map(p => p.vertex).flat()
    BaseBorder = drawBasePolygon(GroupedBorder, 'Border')
    canvas.sendObjectToBack(BaseBorder)
}