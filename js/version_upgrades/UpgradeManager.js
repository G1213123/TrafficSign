import { CanvasGlobals } from '../canvas/canvas.js';

export const UpgradeManager = {
    upgrades: [
        {
            targetVersion: '1.3.1', // Applies if save file version is <= 1.3.1
            description: 'Upgrade Roundabouts to have Base Route and remapped anchors',
            apply: (canvas) => {
                const objects = canvas.getObjects();
                objects.forEach(obj => {
                     if (obj.roadType && 
                        (obj.roadType === 'Conventional Roundabout' || obj.roadType === 'Spiral Roundabout') &&
                        typeof obj.upgradeBaseRoute === 'function') {
                         console.log(`Applying 1.3.1 upgrade to object ${obj.id || 'unknown'}`);
                         obj.upgradeBaseRoute();
                     }
                });
            }
        }
    ],

    compareVersions(v1, v2) {
        if (!v1) return -1; // No version means older than any versioned release
        if (!v2) return 1;
        
        const v1Parts = v1.split('.').map(p => parseInt(p, 10));
        const v2Parts = v2.split('.').map(p => parseInt(p, 10));
        
        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const val1 = v1Parts[i] || 0;
            const val2 = v2Parts[i] || 0;
            if (val1 < val2) return -1;
            if (val1 > val2) return 1;
        }
        return 0;
    },

    processUpgrades(fileVersion) {
        console.log(`Checking for upgrades. File version: ${fileVersion || 'Unknown'}`);
        let appliedAny = false;

        this.upgrades.forEach(upgrade => {
            // Apply if fileVersion <= targetVersion
            if (this.compareVersions(fileVersion, upgrade.targetVersion) <= 0) {
                 console.log(`Applying upgrade: ${upgrade.description}`);
                 try {
                    upgrade.apply(CanvasGlobals.canvas);
                    appliedAny = true;
                 } catch (e) {
                     console.error(`Error applying upgrade '${upgrade.description}':`, e);
                 }
            }
        });

        if (appliedAny) {
            CanvasGlobals.canvas.requestRenderAll();
        }
    }
};
