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


export const BorderColorScheme = {
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
    "Red Background": {
        'background': 'rgb(224,0,0)',
        'symbol': '#ffffff',
        'border': '#ffffff',
    },
}

export const BorderTypeScheme = {
    'stack': StackBorderTemplate,
    'flagLeft': FlagLeftBorderTemplate,
    'flagRight': FlagRightBorderTemplate,
    'exit': ExitBorderTemplate,
    'panel': PanelTemplate,
    'greenPanel': GreenPanelTemplate,
    'rectangle': RectTemplate,
    'StreetName2Way': StreetName2WayTemplate,
    'StreetNameLeft': StreetNameLeftTemplate,
    'StreetNameRight': StreetNameRightTemplate
}

export const BorderFrameWidth = {
    'stack': 1.5,
    'flagLeft': 1.5,
    'flagRight': 1.5,
    'exit': 1,
    'panel': 0,
    'greenPanel': 0.5,
    'rectangle': 0,
    'StreetName2Way': 0,
    'StreetNameLeft': 0,
    'StreetNameRight': 0,
}

export const BorderPaddingWidth = {
    'stack': {
        left: 2.5,
        top: 2.5,
        right: 2.5,
        bottom: 1.5,
    },
    'flagLeft': null, //to be calculated in function
    'flagRight': null,
    'exit': {
        left: 0.5,
        top: 0.3,
        right: 0.5,
        bottom: 0,
    },
    'panel': {
        left: 2.5,
        top: 2.5,
        right: 2.5,
        bottom: 1.5,
    },
    'greenPanel': {
        left: 2.5,
        top: 2.5,
        right: 2.5,
        bottom: 1.5,
    },
    'rectangle': {
        left: 1,
        top: 1,
        right: 1,
        bottom: 1,
    },
}


function StreetName2WayTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;

    const baseWidth = block.width + 136 + 136; // V1 to V2 distance
    const totalWidth = Math.ceil(baseWidth / 50) * 50;
    const paddingX = (totalWidth - baseWidth) / 2;

    const returnBorder = [{
        'vertex': [
            { x: (-136 - paddingX) / length, y: -45 / length, label: 'V1', start: 1, radius: 25 / length },
            { x: (block.width + 136 + paddingX) / length, y: -45 / length, label: 'V2', start: 0, radius: 25 / length },
            { x: (block.width + 136 + paddingX) / length, y: 279 / length, label: 'V3', start: 0, radius: 25 / length },
            { x: (-136 - paddingX) / length, y: 279 / length, label: 'V4', start: 0, radius: 25 / length },
        ], 'arcs': [], 'fill': '#000000'
    }, {
        'vertex': [
            { x: (-6 - paddingX) / length, y: -33 / length, label: 'V1', start: 1, },
            { x: (block.width + 6 + paddingX) / length, y: -33 / length, label: 'V2', start: 0 },
            { x: (block.width + 111 + paddingX) / length, y: 117 / length, label: 'V3', start: 0 },
            { x: (block.width + 6 + paddingX) / length, y: 267 / length, label: 'V4', start: 0 },
            { x: (-6 - paddingX) / length, y: 267 / length, label: 'V5', start: 0 },
            { x: (-111 - paddingX) / length, y: 117 / length, label: 'V6', start: 0 },
        ], 'arcs': [], 'fill': '#FFFFFF'
    }];

    returnBorder.forEach(path => applyLengthAndRounding(path, length));
    return { path: returnBorder };
}

function StreetNameLeftTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;

    const baseWidth = 136 + block.width + 37;
    const totalWidth = Math.ceil(baseWidth / 50) * 50;
    const paddingX = (totalWidth - baseWidth) / 2;

    const returnBorder = [{
        'vertex': [
            { x: (-136 - paddingX) / length, y: -45 / length, label: 'V1', start: 1, radius: 25 / length },
            { x: (block.width + 37 + paddingX) / length, y: -45 / length, label: 'V2', start: 0, radius: 25 / length },
            { x: (block.width + 37 + paddingX) / length, y: 279 / length, label: 'V3', start: 0, radius: 25 / length },
            { x: (-136 - paddingX) / length, y: 279 / length, label: 'V4', start: 0, radius: 25 / length },
        ], 'arcs': [], 'fill': '#000000'
    }, {
        // Chevron on left, straight flat on right
        'vertex': [
            { x: (-6 - paddingX) / length, y: -33 / length, label: 'V1', start: 1, },
            { x: (block.width + 25 + paddingX) / length, y: -33 / length, label: 'V2', start: 0, radius: 12.5 / length },
            { x: (block.width + 25 + paddingX) / length, y: 267 / length, label: 'V3', start: 0, radius: 12.5 / length },
            { x: (-6 - paddingX) / length, y: 267 / length, label: 'V4', start: 0 },
            { x: (-111 - paddingX) / length, y: 117 / length, label: 'V5', start: 0 },
        ], 'arcs': [], 'fill': '#FFFFFF'
    }];

    returnBorder.forEach(path => applyLengthAndRounding(path, length));
    return { path: returnBorder };
}

function StreetNameRightTemplate(xHeight, block, rounding = { x: 0, y: 0 }) {
    const length = xHeight / 4;

    const baseWidth = 37 + block.width + 136;
    const totalWidth = Math.ceil(baseWidth / 50) * 50;
    const paddingX = (totalWidth - baseWidth) / 2;

    const returnBorder = [{
        'vertex': [
            { x: (-37 - paddingX) / length, y: -45 / length, label: 'V1', start: 1, radius: 25 / length },
            { x: (block.width + 136 + paddingX) / length, y: -45 / length, label: 'V2', start: 0, radius: 25 / length },
            { x: (block.width + 136 + paddingX) / length, y: 279 / length, label: 'V3', start: 0, radius: 25 / length },
            { x: (-37 - paddingX) / length, y: 279 / length, label: 'V4', start: 0, radius: 25 / length },
        ], 'arcs': [], 'fill': '#000000'
    }, {
        // Straight flat on left, Chevron on right
        'vertex': [
            { x: (-25 - paddingX) / length, y: -33 / length, label: 'V1', start: 1, radius: 12.5 / length },
            { x: (block.width + 6 + paddingX) / length, y: -33 / length, label: 'V2', start: 0 },
            { x: (block.width + 111 + paddingX) / length, y: 117 / length, label: 'V3', start: 0 },
            { x: (block.width + 6 + paddingX) / length, y: 267 / length, label: 'V4', start: 0 },
            { x: (-25 - paddingX) / length, y: 267 / length, label: 'V5', start: 0, radius: 12.5 / length },
        ], 'arcs': [], 'fill': '#FFFFFF'
    }];

    returnBorder.forEach(path => applyLengthAndRounding(path, length));
    return { path: returnBorder };
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
            { x: block.width / length + padding.right + border, y: 0 - padding.top - border, label: 'V2', radius: 3, start: 0, display: 0 },
            { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, label: 'V3', radius: 3, start: 0, display: 0 },
            { x: 0 - padding.left - border, y: block.height / length + padding.bottom + border, label: 'V4', radius: 3, start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', radius: 1.5, start: 1, display: 0 },
            { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', radius: 1.5, start: 0, display: 0 },
            { x: block.width / length + padding.right, y: block.height / length + padding.bottom, label: 'V7', radius: 1.5, start: 0, display: 0 },
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
            { x: block.width / length + padding.right + border, y: 7.2, label: 'V3', start: 0, display: 0 },
            { x: 0 - padding.left - border, y: 7.2, label: 'V4', start: 0, display: 0 },
        ], 'arcs': [], 'fill': 'border'
    }, {
        'vertex': [
            { x: 0 - padding.left, y: 0 - padding.top, label: 'V5', start: 1, display: 0 },
            { x: block.width / length + padding.right, y: 0 - padding.top, label: 'V6', start: 0, display: 0 },
            { x: block.width / length + padding.right, y: 6.7, label: 'V7', start: 0, display: 0 },
            { x: 0 - padding.right, y: 6.7, label: 'V8', start: 0, display: 0 },
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
    const v = block.height > 19.4 * xHeight / 4 + 1 ? variables['4Lines'] : variables['2Lines'];

    const padding = {
        left: v.D + (block.height / length + v.E + rounding.y / 2 - v.D) / 2 / Math.tan(Math.PI / 3) + (v.A + v.B + v.C) / Math.cos(Math.PI / 6),
        top: v.E + rounding.y,
        right: v.E + rounding.x * 2,
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
                { x: block.width / length + padding.right + border, y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0, display: 0 },
                { x: block.width / length + padding.right + border, y: block.height / length + padding.bottom + border, radius: v.H, label: 'V3', start: 0, display: 0 },
                { x: 0 - padding.left + panel.height / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom + border, radius: v.H, label: 'V4', start: 0, display: 0 },
                { x: 0 - padding.left, y: 0 - v.E - rounding.y - border + panel.height / 2, radius: v.F, label: 'V5', start: 0, display: 0 }
            ], 'arcs': [], 'fill': 'border'
        }, {
            'vertex': [
                { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top, radius: v.G, label: 'V6', start: 1, display: 0 },
                { x: block.width / length + padding.right, y: 0 - padding.top, radius: v.G, label: 'V7', start: 0, display: 0 },
                { x: block.width / length + padding.right, y: block.height / length + padding.bottom, radius: v.G, label: 'V8', start: 0, display: 0 },
                { x: 0 - padding.left + v.A + (panel.height - border * 2) / 2 * Math.tan(Math.PI / 6), y: block.height / length + padding.bottom, radius: v.G, label: 'V9', start: 0, display: 0 },
                { x: 0 - padding.left + v.A, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V10', start: 0, display: 0 }
            ], 'arcs': [], 'fill': 'background'
        }, {
            'vertex': [
                { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y + v.D, label: 'V11', start: 1, display: 0 },
                { x: 0 - v.D, y: 0 - v.E - rounding.y + v.D, label: 'V12', start: 0, display: 0 },
                { x: -padding.left + v.A + (v.B + v.C) / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V13', start: 0, display: 0 },
                { x: 0 - v.D, y: 0 + block.height / length, label: 'V14', start: 0, display: 0 },
                { x: 0 - v.D - v.C / Math.cos(Math.PI / 6), y: 0 + block.height / length, label: 'V15', start: 0, display: 0 },
                { x: -padding.left + v.A + v.B / Math.cos(Math.PI / 6), y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, label: 'V16', start: 0, display: 0 },
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
        left: v.E + rounding.x * 2,
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
                { x: block.width / length + padding.right - panel.height / 2 * Math.tan(Math.PI / 6), y: 0 - padding.top - border, radius: v.H, label: 'V2', start: 0, display: 0 },
                { x: block.width / length + padding.right, y: 0 - v.E - rounding.y - v.A + (panel.height) / 2, radius: v.F, label: 'V3', start: 0, display: 0 },
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