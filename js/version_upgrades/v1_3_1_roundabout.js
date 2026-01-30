
export const RoundaboutVertexMapping = {
    'Conventional Roundabout': {
        'V1': 'V2',
        'V2': 'V21',
        'V3': 'V22',
        'V4': 'V23',
        'V5': 'V24',
        'V6': 'V25'
    },
    'Spiral Roundabout': {
        'V1': 'V11',
        'V2': 'V13',
        'V3': 'V14',
        'V4': 'V15',
        'V5': 'V16',
        'V6': 'V17'
    }
};

/**
 * Remaps anchors of children attached to the roundabout to new vertex labels.
 * @param {Object} roundabout - The roundabout object (MainRoadSymbol).
 */
export function remapAnchors(roundabout) {
    if (!roundabout || !roundabout.anchoredPolygon || !Array.isArray(roundabout.anchoredPolygon)) {
        return;
    }

    const mapping = RoundaboutVertexMapping[roundabout.roadType];
    if (!mapping) {
        return;
    }

    let remappedCount = 0;

    roundabout.anchoredPolygon.forEach(child => {
        let changed = false;

        // Check Lock X
        if (child.lockXToPolygon && child.lockXToPolygon.TargetObject === roundabout) {
            const oldVertex = child.lockXToPolygon.targetPoint;
            if (mapping[oldVertex]) {
                child.lockXToPolygon.targetPoint = mapping[oldVertex];
                changed = true;
                //console.log(`Remapped X anchor for child ${child.canvasID}: ${oldVertex} -> ${mapping[oldVertex]}`);
            }
        }

        // Check Lock Y
        if (child.lockYToPolygon && child.lockYToPolygon.TargetObject === roundabout) {
            const oldVertex = child.lockYToPolygon.targetPoint;
            if (mapping[oldVertex]) {
                child.lockYToPolygon.targetPoint = mapping[oldVertex];
                changed = true;
                //console.log(`Remapped Y anchor for child ${child.canvasID}: ${oldVertex} -> ${mapping[oldVertex]}`);
            }
        }

        if (changed) {
            // Force update coordinates
            if (typeof child.updateAllCoord === 'function') {
                child.updateAllCoord(); 
            }
            remappedCount++;
        }
    });

    if (remappedCount > 0) {
        console.log(`Remapped anchors for ${remappedCount} children of roundabout ${roundabout.canvasID}`);
    }
}
