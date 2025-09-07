import { BaseGroup, GlyphPath } from './draw.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { DividerScheme, BorderColorScheme, DividerMargin } from './template.js';
import { BorderUtilities } from './border.js';
import { anchorShape } from './anchor.js';
import { showTextBox } from '../canvas/promptBox.js';

const canvas = CanvasGlobals.canvas; // Access the global canvas object

function drawDivider(xHeight, color, position, size, type) {

    // Choose the template based on the horizontal parameter
    let dividerTemplate = DividerScheme[type](xHeight, position, size, { x: 0, y: 0 }).path;

    dividerTemplate.map(path => {
        path.fill = color;
    });

    const arrowOptions1 = {
        left: 0,
        top: 0,
        fill: color,
        angle: 0,
        objectCaching: false,
        strokeWidth: 0
    };

    const dividerShape = new GlyphPath();
    dividerShape.initialize({ path: dividerTemplate }, arrowOptions1);
    return dividerShape;
}

class DividerObject extends BaseGroup {
    constructor(options = {}) {
        super(null, options.dividerType, 'DividerObject', options); // Call BaseGroup constructor

        // Store divider-specific properties
        this.xHeight = options.xHeight;
        this.colorType = options.colorType;
        this.color = BorderColorScheme[this.colorType]['border'];
        this.dividerType = options.dividerType; // 'VDivider', 'HDivider', 'HLine', 'VLane'
        this.borderGroup = options.borderGroup || null;

        // Legacy properties for compatibility with existing create functions
        this.leftObjects = options.leftObjects || [];
        this.rightObjects = options.rightObjects || [];
        this.aboveObjects = options.aboveObjects || [];
        this.belowObjects = options.belowObjects || [];
        this.leftValue = options.leftValue;
        this.rightValue = options.rightValue;
        this.aboveValue = options.aboveValue;
        this.belowValue = options.belowValue;

        // Properties to be set by the respective create functions
        // These will now be set directly in initialize
        this.fixedLeftValue = undefined;
        this.fixedRightValue = undefined;
        this.fixedTopValue = undefined;
        this.fixedBottomValue = undefined;


        this.initialize();
    }

    initialize() {
        switch (this.dividerType) {
            case 'HDivider':
            case 'HLine': {
                const objectBBox = { left: this.borderGroup.inbbox.left, top: this.borderGroup.inbbox.top, };
                const objectSize = { width: this.borderGroup.inbbox.right - this.borderGroup.inbbox.left };
                const basePoly = drawDivider(this.xHeight, this.color, objectBBox, objectSize, this.dividerType);
                this.setBasePolygon(basePoly);
                this.set({lockMovementX: true,})
                this.borderGroup.HDivider.push(this);
                break;
            }
        }

        this.setCoords();
        this.updateAllCoord();
        // } // tempGroup is no longer used
        return this;
    }

    SS_initialize() { // Save the original initialize method
        let objectBBox;
        let objectSize;
        let primaryAnchorObject, secondaryAnchorObject;
        let hasFixedPrimary = false, hasFixedSecondary = false;

        switch (this.dividerType) {
            case 'HDivider':
            case 'HLine': {
                let aboveObject = null;
                let belowObject = null;

                // Determine aboveObject
                if (this.dividerType === 'HDivider' && !isNaN(parseInt(this.aboveValue))) {
                    hasFixedPrimary = true;
                    const fixedDistanceFromTop = parseInt(this.aboveValue);
                    const borderCoords = canvas.calcViewportBoundaries();
                    const centerX = CanvasGlobals.CenterCoord().x;
                    aboveObject = { top: (borderCoords.tl.y + borderCoords.br.y) / 2, left: centerX, getBoundingRect: () => false };
                    this.fixedTopValue = fixedDistanceFromTop;
                } else if (Array.isArray(this.aboveObjects) && this.aboveObjects.length) {
                    aboveObject = BorderUtilities.getBottomMostObject(this.aboveObjects);
                }
                primaryAnchorObject = aboveObject;

                // Determine belowObject
                if (this.dividerType === 'HDivider' && !isNaN(parseInt(this.belowValue))) {
                    hasFixedSecondary = true;
                    const fixedDistanceFromBottom = parseInt(this.belowValue);
                    const borderCoords = canvas.calcViewportBoundaries();
                    const centerX = CanvasGlobals.CenterCoord().x;
                    belowObject = { top: (borderCoords.tl.y + borderCoords.br.y) / 2, left: centerX, getBoundingRect: () => false };
                    this.fixedBottomValue = fixedDistanceFromBottom;
                } else if (Array.isArray(this.belowObjects) && this.belowObjects.length) {
                    belowObject = BorderUtilities.getTopMostObject(this.belowObjects);
                }
                secondaryAnchorObject = belowObject;

                if (!primaryAnchorObject || !secondaryAnchorObject) {
                    showTextBox('Please provide valid objects or values for both above and below positions for HDivider/HLine.', '');
                    return this;
                }
                if (!hasFixedSecondary && secondaryAnchorObject.getBoundingRect && secondaryAnchorObject.getBoundingRect() && secondaryAnchorObject.lockYToPolygon && Object.keys(secondaryAnchorObject.lockYToPolygon).length !== 0) {
                    showTextBox('Unlock the object below divider in Y axis', '');
                    return this;
                }

                if (this.dividerType === 'HLine') {
                    objectBBox = BorderUtilities.getBoundingBox(this.aboveObjects);
                } else { // HDivider
                    if (primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect()) {
                        objectBBox = BorderUtilities.getBoundingBox([primaryAnchorObject]);
                    } else {
                        objectBBox = { left: primaryAnchorObject.left - 50, top: primaryAnchorObject.top - 10, right: primaryAnchorObject.left + 50, bottom: primaryAnchorObject.top + 10 };
                    }
                }
                objectSize = { width: objectBBox.right - objectBBox.left, height: objectBBox.bottom - objectBBox.top };

                const basePoly = drawDivider(this.xHeight, this.color, objectBBox, objectSize, this.dividerType);
                this.setBasePolygon(basePoly);

                this.shadowWidth = (this.dividerType === 'HLine') ? { x: 0, y: 0 } : { x: 0, y: 1.5 };
                this.position = objectBBox;
                this.bbox = objectSize;

                const marginTypeH = this.dividerType; // 'HDivider' or 'HLine'
                if (this.dividerType === 'HDivider') {
                    if (!hasFixedPrimary && primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect()) {
                        anchorShape(primaryAnchorObject, this, { vertexIndex1: 'E2', vertexIndex2: 'E6', spacingX: '', spacingY: DividerMargin[marginTypeH]['top'] * this.xHeight / 4 });
                    } else if (hasFixedPrimary) {
                        this.set({ top: primaryAnchorObject.top + DividerMargin[marginTypeH]['top'] * this.xHeight / 4 });
                    }
                    if (!hasFixedSecondary && secondaryAnchorObject.getBoundingRect && secondaryAnchorObject.getBoundingRect()) {
                        anchorShape(this, secondaryAnchorObject, { vertexIndex1: 'E2', vertexIndex2: 'E6', spacingX: '', spacingY: DividerMargin[marginTypeH]['bottom'] * this.xHeight / 4 });
                    }
                } else { // HLine
                    if (primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect()) {
                        anchorShape(primaryAnchorObject, this, { vertexIndex1: 'E2', vertexIndex2: 'E6', spacingX: '', spacingY: DividerMargin[marginTypeH]['top'] * this.xHeight / 4 });
                    }
                    if (secondaryAnchorObject.getBoundingRect && secondaryAnchorObject.getBoundingRect()) {
                        anchorShape(this, secondaryAnchorObject, { vertexIndex1: 'E2', vertexIndex2: 'E6', spacingX: '', spacingY: DividerMargin[marginTypeH]['bottom'] * this.xHeight / 4 });
                    }
                }
                break;
            }
            case 'VDivider':
            case 'VLane': {
                let leftObject = null;
                let rightObject = null;

                if (!isNaN(parseInt(this.leftValue))) {
                    hasFixedPrimary = true;
                    const fixedDistanceFromLeft = parseInt(this.leftValue);
                    const borderCoords = canvas.calcViewportBoundaries();
                    const centerY = CanvasGlobals.CenterCoord().y;
                    leftObject = { left: (borderCoords.tl.x + borderCoords.br.x) / 2, top: centerY, getBoundingRect: () => false };
                    this.fixedLeftValue = fixedDistanceFromLeft;
                } else if (Array.isArray(this.leftObjects) && this.leftObjects.length) {
                    leftObject = BorderUtilities.getExtremeObject(this.leftObjects, 'left');
                }
                primaryAnchorObject = leftObject;

                if (!isNaN(parseInt(this.rightValue))) {
                    hasFixedSecondary = true;
                    const fixedDistanceFromRight = parseInt(this.rightValue);
                    const borderCoords = canvas.calcViewportBoundaries();
                    const centerY = CanvasGlobals.CenterCoord().y;
                    rightObject = { left: (borderCoords.tl.x + borderCoords.br.x) / 2, top: centerY, getBoundingRect: () => false };
                    this.fixedRightValue = fixedDistanceFromRight;
                } else if (Array.isArray(this.rightObjects) && this.rightObjects.length) {
                    rightObject = BorderUtilities.getExtremeObject(this.rightObjects, 'right');
                }
                secondaryAnchorObject = rightObject;

                if (!primaryAnchorObject || !secondaryAnchorObject) {
                    showTextBox('Please provide valid objects or values for both left and right positions for VDivider/VLane.', '');
                    return this;
                }
                if (!hasFixedPrimary && primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect() && primaryAnchorObject.lockXToPolygon && Object.keys(primaryAnchorObject.lockXToPolygon).length !== 0) {
                    showTextBox('Unlock the object left of divider in X axis', '');
                    return this;
                }

                if (primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect()) {
                    objectBBox = BorderUtilities.getBoundingBox([primaryAnchorObject]);
                } else {
                    objectBBox = { left: primaryAnchorObject.left - 10, top: primaryAnchorObject.top - 50, right: primaryAnchorObject.left + 10, bottom: primaryAnchorObject.top + 50 };
                }
                objectSize = { width: objectBBox.right - objectBBox.left, height: objectBBox.bottom - objectBBox.top };

                const basePoly = drawDivider(this.xHeight, this.color, objectBBox, objectSize, this.dividerType);
                this.setBasePolygon(basePoly);

                this.shadowWidth = (this.dividerType === 'VLane') ? { x: 0, y: 0 } : { x: 1.5, y: 0 };
                this.position = objectBBox;
                this.bbox = objectSize;

                const marginTypeV = this.dividerType; // 'VDivider' or 'VLane'
                if (!hasFixedPrimary && primaryAnchorObject.getBoundingRect && primaryAnchorObject.getBoundingRect()) {
                    anchorShape(primaryAnchorObject, this, { vertexIndex1: 'E1', vertexIndex2: 'E3', spacingX: DividerMargin[marginTypeV]['left'] * this.xHeight / 4, spacingY: '' });
                } else if (hasFixedPrimary) {
                    this.set({ left: primaryAnchorObject.left + DividerMargin[marginTypeV]['left'] * this.xHeight / 4 });
                }

                if (!hasFixedSecondary && secondaryAnchorObject.getBoundingRect && secondaryAnchorObject.getBoundingRect()) {
                    anchorShape(this, secondaryAnchorObject, { vertexIndex1: 'E1', vertexIndex2: 'E3', spacingX: DividerMargin[marginTypeV]['right'] * this.xHeight / 4, spacingY: '' });
                }
                break;
            }
            default:
                console.error('Unknown divider type:', this.dividerType);
                return this;
        }

        // if (tempGroup) { // tempGroup is no longer used
        // Copy properties from the created group to this instance
        // this.setBasePolygon(tempGroup.basePolygon); // Assuming basePolygon is the visual element
        // All visual setup and property setting is now done directly on 'this'

        this.setCoords();
        this.updateAllCoord();
        // } // tempGroup is no longer used
        return this;
    }

    // It might be beneficial to move the logic from VDividerCreate, HDividerCreate, etc.
    // into methods of this class, e.g., createVDividerVisuals(), createHDividerVisuals().
    // For now, the existing functions are leveraged.
}

export { drawDivider, DividerObject };