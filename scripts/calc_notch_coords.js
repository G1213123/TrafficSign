// Parameters
// Coordinate System:
// 0 degrees points to the Right (Positive X)
// Degrees increment Clockwise (90 is Down, -90 is Up)
const originToCenter = { radius: 28, angle: -120 }; // Vector 1: Origin to Circle Center (Polar)

// Vectors 2-5: Polar vectors radiating from the circle center (Radius, Angle in degrees)
// Modify these values as needed
const polarVectors = [
    { radius: 12, angle: 15 },
    { radius: 7, angle:  15 },
    { radius: 7, angle:  45 },
    { radius: 12, angle: 45 }
];

// Helper function to convert degrees to radians
const toRad = (deg) => deg * Math.PI / 180;

// Formatting function to keep coordinates clean
const fmt = (n) => {
    const s = n.toFixed(3);
    return parseFloat(s);
};

console.log("Calculated Vertices:"); 
console.log("------------------------------------------------");

const vertices = polarVectors.map((vec, index) => {
    // Calculate global x, y
    const centerX = originToCenter.radius * Math.cos(toRad(originToCenter.angle));
    const centerY = originToCenter.radius * Math.sin(toRad(originToCenter.angle));
    
    // x = center_x + r * cos(theta)
    // y = center_y + r * sin(theta)
    
    const x = centerX + vec.radius * Math.cos(toRad(vec.angle));
    const y = centerY + vec.radius * Math.sin(toRad(vec.angle));

    // Construct the vertex object string
    // Assuming start: 0 and display: 1 for general points, user can adjust
    // Using index + 1 for Label sequence number
    const label = `V${index + 3}`;
    const start =  0;
    
    return `{ x: ${fmt(x)}, y: ${fmt(y)}, label: '${label}', start: ${start}, display: 1 }`;
});

// Output formatted for copy-pasting
vertices.forEach(v => console.log(v + ","));

console.log("------------------------------------------------");
