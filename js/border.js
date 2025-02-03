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
    const length = xHeight / 4
    rounding.x /= length
    rounding.y /= length
    const padding = {
        left: 2.5 + rounding.x,
        top: 2.5 + rounding.y,
        right: 2.5 + rounding.x,
        bottom: 1.5 + rounding.y,
    }

    const border = 1.5
    const returnBorder = [{

        'vertex': [
            { x: 0 - padding.left - border, y: 0 - padding.top - border, label: 'V1', radius: 3, start: 1 },
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius: 3, start: 0 },
            { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, label: 'V3', radius: 3, start: 0 },
            { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, label: 'V4', radius: 3, start: 0 },
        ], 'arcs': [],
        'fill': 'symbol'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', radius: 1.5, start: 1 },
            { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', radius: 1.5, start: 0 },
            { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V7', radius: 1.5, start: 0 },
            { x: 0 - padding.right, y: block.height / length + padding.bottom, label: 'V8', radius: 1.5, start: 0 },
        ], 'arcs': [],
        'fill': 'background'
    },]

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
    return { path: returnBorder }
}


function FlagLeftBorderTemplate(xHeight, block, rounding) {
    const length = xHeight / 4
    rounding.x /= length
    rounding.y /= length
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
        left: v.D + (block.height / length + v.E + rounding.y / 2 - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
        top: v.E + rounding.y,
        right: v.E,
        bottom: v.D + rounding.y,
    }

    const border = v.A

    const panel = {
        height: (block.height / length + v.E + rounding.y * 2 + v.D + v.A * 2)
    }

    const returnBorder = [{
        'vertex': [ // TPDM 3.5.5.10
            { x: 0, y: 0, label: 'V0', start: 1 },
        ], 'arcs': [],
        'fill': 'symbol'
    },
    {
        'vertex': [ // outer
            // (H+E-D) / 2 / tan 60o + (A+B+C) / cos 30o - (H+E-D) / 2 * tan 30o
            { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V1', start: 1 },
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0 },
            { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V3', start: 0 },
            { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0 },
            { x: 0 - padding.left, y: 0 - v.E - rounding.y - border + panel.height / 2, radius: v.F, label: 'V5', start: 0 }
        ], 'arcs': [],
        'fill': 'symbol'
    }, {
        'vertex': [ // inner
            { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V6', start: 1 },
            { x: block.width / length + padding.right, y: 0 - padding.top, radius: v.G, label: 'V7', start: 0 },
            { x: block.width / length + padding.right, y: block.height / length + padding.bottom, radius: v.G, label: 'V8', start: 0 },
            { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0 },
            { x: 0 - padding.left + v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V10', start: 0 }
        ], 'arcs': [],
        'fill': 'background'
    }, {
        'vertex': [ // chevron
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1 },
            { x: 0 - v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0 },
            { x: -padding.left + v.A + (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0 },
            { x: 0 - v.D, y: 0 + block.height / length, label: 'V14', start: 0 },
            { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0 },
            { x: -padding.left + v.A + v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0 },
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
    return { path: returnBorder }


}

function drawLabeledBorder(borderType, xHeight, bbox, color) {

    block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top }
    rounding = { x: 0, y: 0 }
    shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)
    baseGroup = []
    // Create polygon with labeled vertices
    shapeMeta.path.forEach(p => {
        const vertexleft = - Math.min(...p.vertex.map(v => v.x));
        const vertextop = - Math.min(...p.vertex.map(v => v.y));


        p.vertex.forEach((p) => {
            p.x = p.x + bbox.left;
            p.y = p.y + bbox.top;
        });

        const pathData = vertexToPath({ path: [p] });
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

    rounding = { x: roundingX, y: roundingY }
    shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)
    baseGroup = []
    // Create polygon with labeled vertices
    shapeMeta.path.forEach(p => {
        const vertexleft = - Math.min(...p.vertex.map(v => v.x));
        const vertextop = - Math.min(...p.vertex.map(v => v.y));


        p.vertex.forEach((p) => {
            p.x = p.x + bbox.left;
            p.y = p.y + bbox.top;
        });

        const pathData = vertexToPath({ path: [p] });
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
    GroupedBorder.vertex = shapeMeta.path.map(p => p.vertex).flat()

    return GroupedBorder
}

drawDivider = async function (xHeight, top, width, frameWidth = 1) {
    const length = xHeight / 4
    const Xwidth = width / length
    let dividerTemplate = [{
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
        ], 'arcs': [],
        'fill': 'white'
    }]

    dividerTemplate.forEach(p => {

        p.vertex.forEach(vertex => {
            vertex.x *= length;
            vertex.y *= length;
            if (vertex.radius) vertex.radius *= length;
        });
    }
    )

    const arrowOptions1 = {
        left: 0,
        top: top,
        fill: '#FFF',
        angle: 0,
        // originX: 'center',
        objectCaching: false,
        strokeWidth: 0
      },

    dividerShape = new GlyphPath()
    await dividerShape.initialize({ path: dividerTemplate }, arrowOptions1);
    return dividerShape
}
