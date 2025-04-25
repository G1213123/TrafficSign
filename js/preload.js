
// Track resources loading
let resourcesLoaded = 0;
const requiredResources = 4; // Update this if you add more resources

// Store parsed fonts
window.parsedFontMedium = null;
window.parsedFontHeavy = null;
window.parsedFontChinese = null;
window.parsedFontKai = null;

function checkAllResourcesLoaded() {
    resourcesLoaded++;
    if (resourcesLoaded === requiredResources) {
        // All resources are loaded, now parse the fonts
        console.log('All resources loaded, parsing fonts...');
        window.parsedFontMedium = opentype.parse(window.buffer1);
        window.parsedFontHeavy = opentype.parse(window.buffer2);
        window.parsedFontChinese = opentype.parse(window.buffer3);
        window.parsedFontKai = opentype.parse(window.buffer4);
        console.log('Fonts parsed and ready');
    }
}

window.jsPDF = window.jspdf.jsPDF;

fetch('./css/font/TransportMedium.woff')
    .then(res => res.arrayBuffer())
    .then(buffer => {
        window.buffer1 = buffer;
        checkAllResourcesLoaded();
    });

fetch('./css/font/TransportHeavy.woff')
    .then(res => res.arrayBuffer())
    .then(buffer => {
        window.buffer2 = buffer;
        checkAllResourcesLoaded();
    });

fetch('./css/font/NotoSansHK-Medium.ttf')
    .then(res => res.arrayBuffer())
    .then(buffer => {
        window.buffer3 = buffer;
        checkAllResourcesLoaded();
    });

fetch('./css/font/edukai-5.0.ttf')
    .then(res => res.arrayBuffer())
    .then(buffer => {
        window.buffer4 = buffer;
        checkAllResourcesLoaded();
    });

