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

import { CanvasGlobals } from "../canvas/canvas.js";
import { BaseGroup } from "./draw.js";
import { SymbolObject } from "./symbols.js";
import { TextObject } from "./text.js";
import { MainRoadSymbol, SideRoadSymbol } from "./route.js";
import { BorderGroup } from "./border.js"; // Assuming this is defined in this file or imported correctly
import { DividerObject } from "./divider.js";
import { globalAnchorTree, anchorShape } from "./anchor.js"; // For registering anchor relationships and creating anchors

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

const ObjectType = {
    'BaseGroup': BaseGroup,
    'SymbolObject': SymbolObject,
    'TextObject': TextObject,
    'MainRoadSymbol': MainRoadSymbol,
    'SideRoadSymbol': SideRoadSymbol,
    'BorderGroup': BorderGroup,
    'DividerObject': DividerObject,
    // Add other object types as needed
}

// Register a creator for BaseGroup
// This assumes BaseGroup constructor: new BaseGroup(basePolygon, functionalType, options)
// and that it handles adding itself to the global canvas and canvasObject array.
for (const [key, value] of Object.entries(ObjectType)) {
    ObjectBuilderFactory.register(key, (data, reconstructedBasePolygon, constructorOptions) => {
        // Create a new instance of the object type
        const objectInstance = new value(constructorOptions);
        return objectInstance;
    });
}


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
    //const fabricPropsToSet = [
    //    'left', 'top', 'width', 'height', 'angle', 'scaleX', 'scaleY',
    //    'flipX', 'flipY', 'skewX', 'skewY', 'visible', 'opacity',
    //    'originX', 'originY', 'borderColor', 'cornerColor', 'cornerSize',
    //    'transparentCorners', 'stroke', 'strokeWidth', 'fill',
    //    // BaseGroup specific properties from serialization if not handled by constructor options:
    //    'isTemporary', 'focusMode'
    //];
    //
    //fabricPropsToSet.forEach(prop => {
    //    if (typeof data[prop] !== 'undefined') {
    //        newFabricObject.set(prop, data[prop]);
    //    }
    //});

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

    // If this is a BorderGroup and we have cached coords / rounding, restore them after construction
    if (newFabricObject instanceof BorderGroup) {
        if (data.fixedWidthCoords) newFabricObject.fixedWidthCoords = { ...data.fixedWidthCoords };
        if (data.fixedHeightCoords) newFabricObject.fixedHeightCoords = { ...data.fixedHeightCoords };
        if (data.rounding) newFabricObject.rounding = { ...data.rounding }; // Use stored rounding to avoid drift
    }

    return newFabricObject;
}

/**
 * Main function to reconstruct a scene or a set of objects from JSON strings.
 * Assumes `canvas` and `canvasObject` are global (e.g., window.canvas, window.canvasObject).
 * This version interleaves creation and linking.
 * IMPORTANT: Assumes `jsonStringsArray` is ordered such that dependencies appear before
 * the objects that depend on them.
 *
 * @param {Array<object|string>} jsonStringsArray - Array of serialized objects.
 *   New format: array of plain objects (already deserialized).
 *   Legacy format: array of JSON strings (each an object), possibly double-stringified.
 *   MUST BE IN DEPENDENCY ORDER.
 * @returns {Promise<Array<fabric.Object>>} A promise resolving to an array of the top-level reconstructed Fabric objects.
 */
async function buildObjectsFromJSON(jsonStringsArray) {
    const fabricCanvas = CanvasGlobals.canvas;
    // It's assumed that BaseGroup's constructor (and similar for other types)
    // adds the object to CanvasGlobals.canvasObject and the fabricCanvas.

    // Normalize items (simple version):
    // - If already an object, use it.
    // - If a string, parse once; if result is a string, parse again.
    const allDeserializedData = [];
    for (const entry of jsonStringsArray) {
        if (!entry) continue;
        if (typeof entry === 'object') {
            allDeserializedData.push(entry);
            continue;
        }
        if (typeof entry === 'string') {
            try {
                let parsed = JSON.parse(entry);
                if (parsed && typeof parsed === 'object') {
                    allDeserializedData.push(parsed);
                }
            } catch (_) { /* ignore invalid entries */ }
        }
    }
    const allDeserializedObjectsMap = {}; // Maps originalID -> new FabricObject
    const finalReconstructedObjects = []; // Stores the fabric objects in the order they are fully processed

    const propertiesToRemapById = ['borderGroup', 'mainRoad', 'textObject', 'underline'];
    const arrayPropertiesToRemapItemsById = ['anchoredPolygon', 'sideRoad', 'widthObjects', 'heightObjects',  'leftObjects', 'aboveObjects', 'rightObjects', 'belowObjects', 'VDivider', 'HDivider'];

    // First pass: Create all objects and store them in the map
    for (const data of allDeserializedData) {
        const originalID = data.canvasID;
        // Create the object using the existing internal function.
        // reconstructSingleObjectInternal will add the created object to allDeserializedObjectsMap.
        // We pass a clean copy of data for object creation, separate from linking data.
        const creationData = { ...data };


        // Link direct dependencies that are needed for constructor or initial setup
        // Remap single ID references to objects
        propertiesToRemapById.forEach(propName => {
            if (creationData[propName] !== undefined && allDeserializedObjectsMap[creationData[propName]]) {
                creationData[propName] = allDeserializedObjectsMap[creationData[propName]];
            }
        });

        // Remap arrays of IDs to arrays of objects
        arrayPropertiesToRemapItemsById.forEach(propName => {
            if (Array.isArray(creationData[propName])) {
                creationData[propName] = creationData[propName]
                    .map(id => allDeserializedObjectsMap[id])
                    .filter(Boolean); // Filter out any undefined if an ID wasn't found
            }
        });

        const fabricObject = await reconstructSingleObjectInternal(creationData, fabricCanvas, allDeserializedObjectsMap);

        if (!fabricObject) {
            console.warn(`Failed to reconstruct object for data (originalID: ${originalID}):`, data);
            continue; // Skip if object creation failed
        }
        finalReconstructedObjects.push(fabricObject);
    }

    // Second pass: Link anchors using anchorShape
    for (const data of allDeserializedData) {
        const fabricObject = allDeserializedObjectsMap[data.canvasID];
        if (!fabricObject) continue;

        if (data.LockXInfo) {
            const targetObjectX = allDeserializedObjectsMap[data.LockXInfo.TargetObjectID];
            if (targetObjectX) {
                const options = {
                    vertexIndex1: data.LockXInfo.sourcePoint,
                    vertexIndex2: data.LockXInfo.targetPoint,
                    spacingX: data.LockXInfo.spacingX,
                    spacingY: '' // Or undefined, depending on anchorShape's expectation
                };
                try{
                    await anchorShape(targetObjectX, fabricObject, options);
                    fabricObject.updateAllCoord(); // Update coordinates after linking
                } catch (error) {
                    console.error(`Error linking X-lock for ${data.canvasID} (TargetID: ${data.LockXInfo.TargetObjectID}):`, error);
                }
            } else {
                console.warn(`TargetObject for X-lock not found for ${data.canvasID} (TargetID: ${data.LockXInfo.TargetObjectID})`);
            }
        }

        if (data.LockYInfo) {
            const targetObjectY = allDeserializedObjectsMap[data.LockYInfo.TargetObjectID];
            if (targetObjectY) {
                const options = {
                    vertexIndex1: data.LockYInfo.sourcePoint,
                    vertexIndex2: data.LockYInfo.targetPoint,
                    spacingX: '', // Or undefined
                    spacingY: data.LockYInfo.spacingY
                };
                try {
                    await anchorShape(targetObjectY, fabricObject, options);
                    fabricObject.updateAllCoord(); // Update coordinates after linking
                } catch (error) {
                    console.error(`Error linking Y-lock for ${data.canvasID} (TargetID: ${data.LockYInfo.TargetObjectID}):`, error);
                }
            } else {
                console.warn(`TargetObject for Y-lock not found for ${data.canvasID} (TargetID: ${data.LockYInfo.TargetObjectID})`);
            }
        }

        // Call drawAnchorLinkage if it exists, after anchors are set.
        // anchorShape should handle the logic for globalAnchorTree.addNode
        if (typeof fabricObject.drawAnchorLinkage === 'function') {
            // fabricObject.drawAnchorLinkage(); // Potentially redundant if anchorShape updates visuals
        }
        fabricObject.setCoords(); // Ensure coordinates are updated after all linking and property setting.
    }

    fabricCanvas.renderAll();
    return finalReconstructedObjects; // Returns array of newly constructed fabric objects
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

export { buildObjectsFromJSON, ObjectBuilderFactory };
