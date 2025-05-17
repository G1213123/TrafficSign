/**
 * @file build.js
 * Contains functions to reconstruct Fabric.js objects from serialized JSON.
 */

// Assume BaseGroup, LockIcon, and other necessary classes (e.g., for basePolygon types)
// are globally available (e.g., window.BaseGroup, window.LockIcon) or will be
// when this script is executed.
// Also assumes 'fabric' is global.
// Assumes 'canvas' and 'canvasObject' (e.g. window.canvas, window.canvasObject) are the global
// Fabric canvas instance and the array storing canvas objects, respectively.

const ObjectBuilderFactory = {
    creators: {},

    register(objectType, creatorFunction) {
        this.creators[objectType] = creatorFunction;
    },

    /**
     * Creates an instance of a registered object type.
     * @param {string} objectType - The type of object to create (e.g., "BaseGroup").
     * @param {object} data - The serialized data for the object.
     * @param {fabric.Object | null} reconstructedBasePolygon - The reconstructed basePolygon if any.
     * @param {object} constructorOptions - Options to pass to the constructor.
     * @returns {fabric.Object | null} The created Fabric object or null.
     */
    create(objectType, data, reconstructedBasePolygon, constructorOptions) {
        if (this.creators[objectType]) {
            return this.creators[objectType](data, reconstructedBasePolygon, constructorOptions);
        }
        console.error(`No creator registered for objectType: ${objectType}`);
        return null;
    }
};

// Register a creator for BaseGroup
// This assumes BaseGroup constructor: new BaseGroup(basePolygon, functionalType, options)
// and that it handles adding itself to the global canvas and canvasObject array.
ObjectBuilderFactory.register('BaseGroup', (data, reconstructedBasePolygon, constructorOptions) => {
    // The BaseGroup constructor will use its own logic to add to canvasObject and canvas.
    // The canvasID will be assigned by the BaseGroup constructor.
    return new BaseGroup(reconstructedBasePolygon, data.functionalType, constructorOptions);
});


/**
 * Reconstructs a single Fabric object from its serialized data.
 * This function handles the creation and initial property setting.
 * Linking to other objects is done in a subsequent pass.
 *
 * @param {object} data - The parsed JSON data of the serialized object.
 * @param {fabric.Canvas} fabricCanvas - The Fabric canvas instance.
 * @param {Object.<string, fabric.Object>} allDeserializedObjectsMap - Map to store/retrieve objects by their original canvasID.
 * @returns {Promise<fabric.Object|null>} A promise that resolves to the reconstructed Fabric object or null.
 */
async function reconstructSingleObjectInternal(data, fabricCanvas, allDeserializedObjectsMap) {
    if (!data || !data.objectType) {
        console.error("Invalid data or missing objectType for reconstruction", data);
        return null;
    }

    let newFabricObject;
    let reconstructedBasePolygon = null;

    // 1. Reconstruct basePolygon (asynchronously)
    if (data.basePolygon) {
        try {
            reconstructedBasePolygon = await new Promise((resolve, reject) => {
                fabric.util.enlivenObjects([data.basePolygon], function (objects) {
                    if (objects && objects.length > 0) {
                        const enlivenedPoly = objects[0];
                        // Restore vertex data if it was specifically serialized
                        if (data.basePolygonVertex && enlivenedPoly) {
                             // How vertices are stored/restored on basePolygon depends on its type.
                             // If it's a custom class, it should handle this.
                             // If it's a standard fabric object, 'points' might be the property.
                             // For safety, we assume 'vertex' was a custom property saved.
                             enlivenedPoly.vertex = JSON.parse(JSON.stringify(data.basePolygonVertex));
                        }
                        resolve(enlivenedPoly);
                    } else {
                        console.error("Failed to enliven basePolygon from data:", data.basePolygon);
                        reject(new Error("Failed to enliven basePolygon"));
                    }
                }, ''); // Empty namespace for enliven
            });
        } catch (error) {
            console.error("Error enlivening basePolygon:", error);
            return null; // Stop if basePolygon fails to load
        }
    }

    // 2. Prepare constructor options
    const constructorOptions = { ...data };
    delete constructorOptions.basePolygon; // Handled separately
    delete constructorOptions.basePolygonVertex; // Handled separately
    delete constructorOptions.objectType; // Used by factory
    // originalCanvasID is not an option for constructor, but useful for map
    const originalCanvasID = data.canvasID;
    delete constructorOptions.canvasID; // Let constructor assign new one, or handle if restoring

    // 3. Instantiate the object using the factory
    newFabricObject = ObjectBuilderFactory.create(data.objectType, data, reconstructedBasePolygon, constructorOptions);

    if (!newFabricObject) {
        return null;
    }

    // 4. Apply top-level Fabric.js properties that might not be covered by options or toObject/constructor
    const fabricPropsToSet = [
        'left', 'top', 'width', 'height', 'angle', 'scaleX', 'scaleY',
        'flipX', 'flipY', 'skewX', 'skewY', 'visible', 'opacity',
        'originX', 'originY', 'borderColor', 'cornerColor', 'cornerSize',
        'transparentCorners', 'stroke', 'strokeWidth', 'fill',
        // BaseGroup specific properties from serialization if not handled by constructor options:
        'isTemporary', 'focusMode'
    ];

    fabricPropsToSet.forEach(prop => {
        if (typeof data[prop] !== 'undefined') {
            newFabricObject.set(prop, data[prop]);
        }
    });
    
    // Ensure basePolygon is correctly set if the constructor didn't fully handle it with options
    // or if it needs re-setting after other properties.
    // The BaseGroup's setBasePolygon also calls drawVertex.
    if (reconstructedBasePolygon && newFabricObject.setBasePolygon) {
        // setBasePolygon(polygon, calcVertex)
        // Assuming vertices are already in reconstructedBasePolygon from data.basePolygonVertex, so calcVertex = false
        newFabricObject.setBasePolygon(reconstructedBasePolygon, false);
    }


    // Store in the map using its *original* canvasID for the linking pass.
    // The newFabricObject itself will have a *new* canvasID assigned by BaseGroup's constructor.
    if (typeof originalCanvasID !== 'undefined') {
        allDeserializedObjectsMap[originalCanvasID] = newFabricObject;
    }
    
    // newFabricObject.setCoords(); // Called by setBasePolygon, or should be called after all props set.

    return newFabricObject;
}

/**
 * Main function to reconstruct a scene or a set of objects from JSON strings.
 * Assumes `canvas` and `canvasObject` are global (e.g., window.canvas, window.canvasObject).
 *
 * @param {Array<string>} jsonStringsArray - Array of JSON strings, each representing an object.
 * @returns {Promise<Array<fabric.Object>>} A promise resolving to an array of the top-level reconstructed Fabric objects.
 */
async function buildObjectsFromJSON(jsonStringsArray) {
    if (!window.canvas || !window.canvasObject) {
        console.error("Global 'canvas' or 'canvasObject' not found.");
        return [];
    }

    const fabricCanvas = window.canvas;
    const globalCanvasObjectArray = window.canvasObject; // This is where BaseGroup adds objects

    const allDeserializedData = jsonStringsArray.map(s => JSON.parse(s));
    const allDeserializedObjectsMap = {}; // Maps originalID -> new FabricObject
    const reconstructedObjects = [];

    // Phase 1: Create all objects
    // Objects are added to globalCanvasObjectArray and fabricCanvas by their constructors (e.g., BaseGroup)
    for (const data of allDeserializedData) {
        const obj = await reconstructSingleObjectInternal(data, fabricCanvas, allDeserializedObjectsMap);
        if (obj) {
            reconstructedObjects.push(obj); // Keep track of successfully created objects
        }
    }

    // Phase 2: Link objects
    for (const data of allDeserializedData) {
        const originalID = data.canvasID;
        const fabricObject = allDeserializedObjectsMap[originalID];

        if (!fabricObject) continue; // Skip if object creation failed

        // Link properties like borderGroup, mainRoad, etc.
        if (data.borderGroup && allDeserializedObjectsMap[data.borderGroup]) {
            fabricObject.borderGroup = allDeserializedObjectsMap[data.borderGroup];
        }
        if (data.mainRoad && allDeserializedObjectsMap[data.mainRoad]) {
            fabricObject.mainRoad = allDeserializedObjectsMap[data.mainRoad];
        }
        if (data.sideRoad && Array.isArray(data.sideRoad)) {
            fabricObject.sideRoad = data.sideRoad.map(id => allDeserializedObjectsMap[id]).filter(Boolean);
        }
        if (data.anchoredPolygon && Array.isArray(data.anchoredPolygon)) {
            fabricObject.anchoredPolygon = data.anchoredPolygon.map(id => allDeserializedObjectsMap[id]).filter(Boolean);
        }

        // Link lockXToPolygon
        if (data.lockXToPolygonTargetID && allDeserializedObjectsMap[data.lockXToPolygonTargetID]) {
            fabricObject.lockXToPolygon = {
                TargetObject: allDeserializedObjectsMap[data.lockXToPolygonTargetID],
                AnchorPoint: data.lockXToPolygonAnchorPoint // This was directly serialized
            };
        } else if (data.lockXToPolygon) { // If it was serialized as a full object (no ID)
             fabricObject.lockXToPolygon = JSON.parse(JSON.stringify(data.lockXToPolygon));
        }


        // Link lockYToPolygon
        if (data.lockYToPolygonTargetID && allDeserializedObjectsMap[data.lockYToPolygonTargetID]) {
            fabricObject.lockYToPolygon = {
                TargetObject: allDeserializedObjectsMap[data.lockYToPolygonTargetID],
                AnchorPoint: data.lockYToPolygonAnchorPoint // This was directly serialized
            };
        } else if (data.lockYToPolygon) {
            fabricObject.lockYToPolygon = JSON.parse(JSON.stringify(data.lockYToPolygon));
        }

        // Reconstruct anchorageLink (e.g., LockIcon instances)
        if (data.anchorageLink && Array.isArray(data.anchorageLink)) {
            fabricObject.anchorageLink = data.anchorageLink.map(linkData => {
                if (linkData && linkData.type === 'LockIcon' && window.LockIcon) {
                    const target = allDeserializedObjectsMap[linkData.targetObjectID];
                    if (target) {
                        // LockIcon(targetObject, lockData, axis) - from draw.js
                        // The lockData would be the fabricObject's lockXToPolygon or lockYToPolygon
                        let lockDataForIcon;
                        if (fabricObject.lockXToPolygon && fabricObject.lockXToPolygon.TargetObject === target) {
                            lockDataForIcon = fabricObject.lockXToPolygon;
                        } else if (fabricObject.lockYToPolygon && fabricObject.lockYToPolygon.TargetObject === target) {
                            lockDataForIcon = fabricObject.lockYToPolygon;
                        } else {
                            lockDataForIcon = {}; // Fallback, might need specific anchor point
                        }
                        const newLockIcon = new LockIcon(fabricObject, lockDataForIcon, linkData.axis);
                        // LockIcon constructor in draw.js adds its objects to canvas.
                        return newLockIcon;
                    }
                }
                return null; // Or handle other types if any
            }).filter(Boolean);
        }
        
        // Finalize object state
        // setBasePolygon calls drawVertex. If not called, call drawVertex explicitly.
        // if (fabricObject.drawVertex) fabricObject.drawVertex(false);

        if (fabricObject.drawAnchorLinkage) fabricObject.drawAnchorLinkage();
        
        fabricObject.setCoords(); // Ensure coordinates are updated after all linking and property setting.
    }
    
    fabricCanvas.renderAll();
    return reconstructedObjects; // Returns array of newly constructed fabric objects
}

// To use:
// 1. Ensure BaseGroup, LockIcon, etc., are defined globally or imported.
// 2. Prepare an array of JSON strings: `const DUMMY_JSON_ARRAY = [jsonString1, jsonString2];`
// 3. Call:
//    buildObjectsFromJSON(DUMMY_JSON_ARRAY)
//      .then(objects => console.log("Reconstructed:", objects))
//      .catch(err => console.error("Reconstruction error:", err));
//
// Before calling, if you want a clean slate:
// window.canvas.clear();
// window.canvasObject.length = 0;
// // Potentially reset other global states related to canvas objects if necessary.
