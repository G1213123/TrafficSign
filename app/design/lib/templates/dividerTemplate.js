
export const DividerScheme = {
    'HDivider': HDividerTemplate,
    'VDivider': VDividerTemplate,
    'HLine': HLineTemplate,
    'VLane': VLaneTemplate,
}

export const DividerMargin = {
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
            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
            { x: Xwidth / 2, y: 0, label: 'V2', radius: 1.5, start: 0 },
            { x: Xwidth / 2, y: -1.5, label: 'V3', start: 0 },
            { x: Xwidth / 2, y: 2.5, label: 'V4', start: 0 },
            { x: Xwidth / 2, y: 1, label: 'V5', radius: 1.5, start: 0 },
            { x: 0, y: 1, label: 'V6', radius: 1.5, start: 0, display: 1 },
            { x: -Xwidth / 2, y: 1, label: 'V7', radius: 1.5, start: 0 },
            { x: -Xwidth / 2, y: 2.5, label: 'V8', start: 0 },
            { x: -Xwidth / 2, y: -1.5, label: 'V9', start: 0 },
            { x: -Xwidth / 2, y: 0, label: 'V10', radius: 1.5, start: 0 },
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
            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
            { x: 0, y: Xwidth / 2, label: 'V2', radius: 1.5, start: 0 },
            { x: -1.5, y: Xwidth / 2, label: 'V3', start: 0 },
            { x: 2.5, y: Xwidth / 2, label: 'V4', start: 0 },
            { x: 1, y: Xwidth / 2, label: 'V5', radius: 1.5, start: 0 },
            { x: 1, y: 0, label: 'V6', radius: 1.5, start: 0, display: 1 },
            { x: 1, y: -Xwidth / 2, label: 'V7', radius: 1.5, start: 0 },
            { x: 2.5, y: -Xwidth / 2, label: 'V8', start: 0 },
            { x: -1.5, y: -Xwidth / 2, label: 'V9', start: 0 },
            { x: 0, y: -Xwidth / 2, label: 'V10', radius: 1.5, start: 0 },
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
            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
            { x: Xwidth / 2 - 1.5, y: 0, label: 'V2', start: 0 },
            { x: Xwidth / 2 - 1.5, y: 1, label: 'V3', start: 0 },
            { x: 0, y: 1, label: 'V4', start: 0, display: 1 },
            { x: -Xwidth / 2 + 1.5, y: 1, label: 'V5', start: 0 },
            { x: -Xwidth / 2 + 1.5, y: 0, label: 'V6', start: 0 },
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
    const effHeight = Math.floor((BHeight - rounding.y / 2 - DividerMargin['VLane'].top - DividerMargin['VLane'].bottom + strokeSpacing) / (strokeHeight + strokeSpacing));

    const strokeCount = Math.max(2, effHeight);
    const diminishedStroke = (BHeight - (strokeHeight + strokeSpacing) * strokeCount) - (strokeSpacing)

    let returnBorder = [{
        'vertex': [], 'arcs': [], 'fill': 'border'
    },];

    let k = 0
    for (let i = 0; i < strokeCount + 1; i++) {
        if (i == 0 && diminishedStroke > 0) {
            returnBorder[0].vertex.push(...[
                { x: 0, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V1', start: 1 },
                { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V2', start: 0 },
                { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - diminishedStroke, label: 'V3', start: 0, display: 1 },
                { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - diminishedStroke, label: 'V4', start: 0, display: 1 },
                { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: 'V5', start: 0 },
            ])
            k++
        } else if (i != 0) {
            returnBorder[0].vertex.push(...[
                { x: 0, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: `V${k * 5 + 1}`, start: 1 },
                { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: `V${k * 5 + 2}`, start: 0 },
                { x: 1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - strokeHeight, label: `V${k * 5 + 3}`, start: 0 },
                { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing) - strokeHeight, label: `V${k * 5 + 4}`, start: 0 },
                { x: -1.5, y: BHeight - DividerMargin['VLane'].bottom - rounding.y / 2 + i * (strokeHeight + strokeSpacing), label: `V${k * 5 + 5}`, start: 0 },
            ])
            k++
        }
    }

    returnBorder[0].vertex.filter(v => v.label == 'V3' || v.label == `V4`).forEach(v => v.display = 1)

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