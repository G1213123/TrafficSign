
const rootLength = 7; // Placeholder value

const data = {
    path: [{
        'vertex': [
            { x: 0, y: -36, label: 'V1', start: 1, display: 0 },
            { x: 12, y: -24, label: 'V2', start: 0, display: 0 },
            { x: 12, y: -12, label: 'V3', start: 0, display: 0 },
            { x: 12, y: 0, label: 'V4', start: 0, display: 0 },
            { x: 10.392, y: 6, label: 'V5', start: 0, display: 0 },  // notched
            { x: 6.062, y: 3.5, label: 'V6', start: 0, display: 0 }, // notched
            { x: 7, y: 0, label: 'V7', start: 0, display: 0 },
            { x: 7, y: -24, label: 'V9', start: 0, display: 0 },
            { x: -7, y: -24, label: 'V11', start: 0, display: 0 },
            { x: -7, y: 0, label: 'V13', start: 0, display: 0 },
            { x: 3.5, y: 6.062, label: 'V14', start: 0, display: 0 }, // notched
            { x: 6, y: 10.392, label: 'V15', start: 0, display: 0 }, // notched
            { x: 0, y: 12, label: 'V16', start: 0, display: 0 },
            { x: -12, y: 0, label: 'V17', start: 0, display: 0 },
            { x: -12, y: -12, label: 'V18', start: 0, display: 0 },
            { x: -12, y: -24, label: 'V19', start: 0, display: 0 },
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
            { x: -3, y: rootLength, label: 'V21', start: 1, display: 1, isRoot: true },
            { x: -3, y: 12.3693, label: 'V23', start: 0, display: 0 },
            { x: -3.6923, y: 11.4178, label: 'V24', start: 0, display: 0 },
            { x: 3.6923, y: 11.4178, label: 'V25', start: 0, display: 0 },
            { x: 3, y: 12.3693, label: 'V26', start: 0, display: 0 },
            { x: 3, y: rootLength, label: 'V27', start: 0, display: 0, isRoot: true },
            { x: 0, y: rootLength, label: 'V28', start: 0, display: 0, isRoot: true },
        ], 'arcs': [
            { start: 'V23', end: 'V24', radius: 1, direction: 0, sweep: 0 },
            { start: 'V24', end: 'V25', radius: 12, direction: 0, sweep: 0 },
            { start: 'V25', end: 'V26', radius: 1, direction: 0, sweep: 0 },
        ], 
    },
    ]
};

function rotatePoint(x, y, angleDeg) {
    const angleRad = angleDeg * Math.PI / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);
    
    // Rotate 
    const newX = x * cos - y * sin;
    const newY = x * sin + y * cos;
    
    return { x: newX, y: newY };
}

function processData(data, angle) {
    // Clone data conceptually (but we'll modify inline for simplicity given this is a script)
    
    data.path.forEach(part => {
        if (part.vertex) {
            part.vertex.forEach(v => {
                let x = v.x;
                let y = v.y;
                
                // If y involves rootLength, we need to handle that.
                // For this script, we substituted rootLength with a value.
                // But ideally we want to output 'rootLength' in variables if possible?
                // Given the complexity, I'll just rotate the numeric values.
                // If the user wants symbolic rotation, that's much harder.
                // But wait, rotating (0, rootLength) by 30 degrees will mix rootLength into X and Y.
                // x' = 0*cos - rootLength*sin = -rootLength * sin(30)
                // y' = 0*sin + rootLength*cos = rootLength * cos(30)
                // So the output will likely need numerical values if I run this.
                // I will print the numeric result.
                
                const rotated = rotatePoint(x, y, angle);
                
                v.x = parseFloat(rotated.x.toFixed(4));
                v.y = parseFloat(rotated.y.toFixed(4));
            });
        }
    });

    let json = JSON.stringify(data, null, 4);
    
    // Remove quotes from keys
    json = json.replace(/"(\w+)":/g, '$1:');

    // Collapse vertex objects onto one line (looking for x property)
    json = json.replace(/\{\s*x:[\s\S]*?\}/g, (match) => {
        return match.replace(/\s+/g, ' ');
    });

    // Collapse arc objects onto one line (looking for start property)
    json = json.replace(/\{\s*start:[\s\S]*?\}/g, (match) => {
        return match.replace(/\s+/g, ' ');
    });
    
    console.log(json);
}

// Rotate by 30 degrees
processData(data, 60);
