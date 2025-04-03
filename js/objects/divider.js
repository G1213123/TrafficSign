drawDivider = async function (xHeight, color, position, size, type) {

    // Choose the template based on the horizontal parameter
    let dividerTemplate = DividerScheme[type](xHeight, position, size, { x: 0, y: 0 }).path;

    const arrowOptions1 = {
        left: 0,
        top: 0,
        fill: color,
        angle: 0,
        objectCaching: false,
        strokeWidth: 0
    };

    const dividerShape = new GlyphPath();
    await dividerShape.initialize({ path: dividerTemplate }, arrowOptions1);
    return dividerShape;
}


async function VDividerCreate(leftObjects, rightObjects, leftValue, rightValue, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']

    // Get border canvas area coordinates
    let borderCoords = null;
    let leftObject = null;
    let rightObject = null;
    let hasFixedLeft = false;
    let hasFixedRight = false;

    // Handle fixed value for left position
    if (!isNaN(parseInt(leftValue))) {
        hasFixedLeft = true;
        // Create virtual border coords with fixed distance from left border
        const fixedDistanceFromLeft = parseInt(leftValue);
        // We need to get the border bounding box
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center y coordinate
        const centerY = CenterCoord().y;
        leftObject = { left: borderCoords.tl.x + fixedDistanceFromLeft, top: centerY };
    } else if (Array.isArray(leftObjects) && leftObjects.length) {
        leftObject = BorderUtilities.getExtremeObject(leftObjects, 'left');
    }

    // Handle fixed value for right position
    if (!isNaN(parseInt(rightValue))) {
        hasFixedRight = true;
        // Create virtual border coords with fixed distance from right border
        const fixedDistanceFromRight = parseInt(rightValue);
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center y coordinate
        const centerY = CenterCoord().y;
        rightObject = { left: borderCoords.tr.x - fixedDistanceFromRight, top: centerY };
    } else if (Array.isArray(rightObjects) && rightObjects.length) {
        rightObject = BorderUtilities.getExtremeObject(rightObjects, 'right');
    }

    if (!leftObject || !rightObject) {
        showTextBox('Please provide valid objects or values for both left and right positions', '');
        return;
    }

    // Check if left object has X lock - only if it's a real object
    if (!hasFixedLeft && leftObject.lockXToPolygon && Object.keys(leftObject.lockXToPolygon).length != 0) {
        showTextBox('Unlock the object left of divider in X axis', '')
        return
    }

    // Get bounding boxes
    const leftObjectBBox = leftObject.getBoundingRect ?
        BorderUtilities.getBoundingBox([leftObject]) :
        { left: leftObject.left - 10, top: leftObject.top - 50, right: leftObject.left + 10, bottom: leftObject.top + 50 };

    const leftObjectSize = { width: leftObjectBBox.right - leftObjectBBox.left, height: leftObjectBBox.bottom - leftObjectBBox.top }

    const BaseBorder = await drawDivider(xHeight, color, leftObjectBBox, leftObjectSize, 'VDivider')
    const borderGroup = new BaseGroup(BaseBorder, 'VDivider')
    borderGroup.shadowWidth = {x: 1.5, y: 0}
    borderGroup.xHeight = xHeight
    borderGroup.color = color

    // Store fixed distance values in the divider object if provided
    if (hasFixedLeft) {
        borderGroup.fixedLeftValue = parseInt(leftValue);
    }

    if (hasFixedRight) {
        borderGroup.fixedRightValue = parseInt(rightValue);
    }

    // Handle anchoring only if we have real objects, not fixed values
    if (!hasFixedLeft && leftObject.getBoundingRect) {
        anchorShape(leftObject, borderGroup, {
            vertexIndex1: 'E1',
            vertexIndex2: 'E3',
            spacingX: DividerMargin['VDivider']['left'] * xHeight / 4,
            spacingY: ''
        })
    } else if (hasFixedLeft) {
        // Position divider based on fixed left position without anchoring
        borderGroup.set({ left: leftObject.left + DividerMargin['VDivider']['left'] * xHeight / 4 });
    }

    if (!hasFixedRight && rightObject.getBoundingRect) {
        anchorShape(borderGroup, rightObject, {
            vertexIndex1: 'E1',
            vertexIndex2: 'E3',
            spacingX: DividerMargin['VDivider']['right'] * xHeight / 4,
            spacingY: ''
        })
    } else if (hasFixedRight) {
        // For fixed value, remember the position for later usage
        // We don't need to adjust position here as the left position is already set
        // This will be handled later during border's assignWidthToDivider
    }

    borderGroup.setCoords()
    borderGroup.updateAllCoord()
    return borderGroup
}

async function HDividerCreate(aboveObjects, belowObjects, aboveValue, belowValue, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']

    // Get border canvas area coordinates
    let borderCoords = null;
    let aboveObject = null;
    let belowObject = null;
    let hasFixedTop = false;
    let hasFixedBottom = false;

    // Handle fixed value for top position
    if (!isNaN(parseInt(aboveValue))) {
        hasFixedTop = true;
        // Create virtual border coords with fixed distance from top border
        const fixedDistanceFromTop = parseInt(aboveValue);
        // We need to get the border bounding box
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center x coordinate
        const centerX = CenterCoord().x;
        aboveObject = { top: borderCoords.tl.y + fixedDistanceFromTop, left: centerX };
    } else if (Array.isArray(aboveObjects) && aboveObjects.length) {
        aboveObject = BorderUtilities.getBottomMostObject(aboveObjects);
    }

    // Handle fixed value for bottom position
    if (!isNaN(parseInt(belowValue))) {
        hasFixedBottom = true;
        // Create virtual border coords with fixed distance from bottom border
        const fixedDistanceFromBottom = parseInt(belowValue);
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center x coordinate
        const centerX = CenterCoord().x;
        belowObject = { top: borderCoords.bl.y - fixedDistanceFromBottom, left: centerX };
    } else if (Array.isArray(belowObjects) && belowObjects.length) {
        belowObject = BorderUtilities.getTopMostObject(belowObjects);
    }

    if (!aboveObject || !belowObject) {
        showTextBox('Please provide valid objects or values for both above and below positions', '');
        return;
    }

    // Check if bottom object has Y lock - only if it's a real object
    if (!hasFixedBottom && belowObject.lockYToPolygon && Object.keys(belowObject.lockYToPolygon).length != 0) {
        showTextBox('Unlock the object below divider in Y axis', '')
        return
    }

    // Get bounding boxes
    const aboveObjectBBox = aboveObject.getBoundingRect ?
        BorderUtilities.getBoundingBox([aboveObject]) :
        { left: aboveObject.left - 50, top: aboveObject.top - 10, right: aboveObject.left + 50, bottom: aboveObject.top + 10 };

    const aboveObjectSize = { width: aboveObjectBBox.right - aboveObjectBBox.left, height: aboveObjectBBox.bottom - aboveObjectBBox.top }
    const BaseBorder = await drawDivider(xHeight, color, aboveObjectBBox, aboveObjectSize, 'HDivider')
    const borderGroup = new BaseGroup(BaseBorder, 'HDivider')
    borderGroup.shadowWidth = {x: 0, y: 1.5}
    borderGroup.xHeight = xHeight
    borderGroup.color = color

    // Store fixed distance values in the divider object if provided
    if (hasFixedTop) {
        borderGroup.fixedTopValue = parseInt(aboveValue);
    }

    if (hasFixedBottom) {
        borderGroup.fixedBottomValue = parseInt(belowValue);
    }

    // Handle anchoring only if we have real objects, not fixed values
    if (!hasFixedTop && aboveObject.getBoundingRect) {
        anchorShape(aboveObject, borderGroup, {
            vertexIndex1: 'E2',
            vertexIndex2: 'E6',
            spacingX: '',
            spacingY: DividerMargin['HDivider']['top'] * xHeight / 4
        })
    } else if (hasFixedTop) {
        // Position divider based on fixed top position without anchoring
        borderGroup.set({ top: aboveObject.top + DividerMargin['HDivider']['top'] * xHeight / 4 });
    }

    if (!hasFixedBottom && belowObject.getBoundingRect) {
        anchorShape(borderGroup, belowObject, {
            vertexIndex1: 'E2',
            vertexIndex2: 'E6',
            spacingX: '',
            spacingY: DividerMargin['HDivider']['bottom'] * xHeight / 4
        })
    } else if (hasFixedBottom) {
        // For fixed value, remember the position for later usage
        // We don't need to adjust position here as the top position is already set
        // This will be handled later during border's assignWidthToDivider
    }

    borderGroup.setCoords()
    borderGroup.updateAllCoord()
    return borderGroup
}

async function HLineCreate(aboveObjects, belowObjects, aboveValue, belowValue, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']
    const aboveObject = BorderUtilities.getBottomMostObject(aboveObjects)
    const belowObject = BorderUtilities.getTopMostObject(belowObjects)

    if (Object.keys(belowObject.lockYToPolygon).length != 0) {
        showTextBox('Unlock the object below divider in Y axis', '')
        return
    }
    const aboveObjectBBox = BorderUtilities.getBoundingBox(aboveObjects)
    const aboveObjectSize = { width: aboveObjectBBox.right - aboveObjectBBox.left, height: aboveObjectBBox.bottom - aboveObjectBBox.top }

    const BaseBorder = await drawDivider(xHeight, color, aboveObjectBBox, aboveObjectSize, 'HLine') // Added true param to indicate horizontal divider
    const borderGroup = new BaseGroup(BaseBorder, 'HLine')
    borderGroup.shadowWidth = {x: 0, y: 0}
    borderGroup.xHeight = xHeight
    borderGroup.color = color
    anchorShape(aboveObject, borderGroup, {
        vertexIndex1: 'E2',
        vertexIndex2: 'E6',
        spacingX: '',
        spacingY: DividerMargin['HLine']['top'] * xHeight / 4
    })
    anchorShape(borderGroup, belowObject, {
        vertexIndex1: 'E2',
        vertexIndex2: 'E6',
        spacingX: '',
        spacingY: DividerMargin['HLine']['bottom'] * xHeight / 4
    })
    borderGroup.setCoords()
    borderGroup.updateAllCoord()
}

async function VLaneCreate(leftObjects, rightObjects, leftValue, rightValue, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    const colorType = options ? options.colorType : document.getElementById("input-color").value
    const color = BorderColorScheme[colorType]['border']

    // Get border canvas area coordinates
    let borderCoords = null;
    let leftObject = null;
    let rightObject = null;
    let hasFixedLeft = false;
    let hasFixedRight = false;

    // Handle fixed value for left position
    if (!isNaN(parseInt(leftValue))) {
        hasFixedLeft = true;
        // Create virtual border coords with fixed distance from left border
        const fixedDistanceFromLeft = parseInt(leftValue);
        // We need to get the border bounding box
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center y coordinate
        const centerY = CenterCoord().y;
        leftObject = { left: borderCoords.tl.x + fixedDistanceFromLeft, top: centerY };
    } else if (Array.isArray(leftObjects) && leftObjects.length) {
        leftObject = BorderUtilities.getExtremeObject(leftObjects, 'left');
    }

    // Handle fixed value for right position
    if (!isNaN(parseInt(rightValue))) {
        hasFixedRight = true;
        // Create virtual border coords with fixed distance from right border
        const fixedDistanceFromRight = parseInt(rightValue);
        if (!borderCoords) {
            borderCoords = canvas.vptCoords; // Use viewport as fallback
        }
        // Use canvas center y coordinate
        const centerY = CenterCoord().y;
        rightObject = { left: borderCoords.tr.x - fixedDistanceFromRight, top: centerY };
    } else if (Array.isArray(rightObjects) && rightObjects.length) {
        rightObject = BorderUtilities.getExtremeObject(rightObjects, 'right');
    }

    if (!leftObject || !rightObject) {
        showTextBox('Please provide valid objects or values for both left and right positions', '');
        return;
    }

    // Check if left object has X lock - only if it's a real object
    if (!hasFixedLeft && leftObject.lockXToPolygon && Object.keys(leftObject.lockXToPolygon).length != 0) {
        showTextBox('Unlock the object left of divider in X axis', '')
        return
    }

    // Get bounding boxes
    const leftObjectBBox = leftObject.getBoundingRect ?
        BorderUtilities.getBoundingBox([leftObject]) :
        { left: leftObject.left - 10, top: leftObject.top - 50, right: leftObject.left + 10, bottom: leftObject.top + 50 };

    const leftObjectSize = { width: leftObjectBBox.right - leftObjectBBox.left, height: leftObjectBBox.bottom - leftObjectBBox.top }

    const BaseBorder = await drawDivider(xHeight, color, leftObjectBBox, leftObjectSize, 'VLane')
    const borderGroup = new BaseGroup(BaseBorder, 'VLane')
    borderGroup.shadowWidth = {x: 0, y: 0}
    borderGroup.xHeight = xHeight
    borderGroup.color = color

    // Store fixed distance values in the divider object if provided
    if (hasFixedLeft) {
        borderGroup.fixedLeftValue = parseInt(leftValue);
    }

    if (hasFixedRight) {
        borderGroup.fixedRightValue = parseInt(rightValue);
    }

    // Handle anchoring only if we have real objects, not fixed values
    if (!hasFixedLeft && leftObject.getBoundingRect) {
        anchorShape(leftObject, borderGroup, {
            vertexIndex1: 'E1',
            vertexIndex2: 'E3',
            spacingX: DividerMargin['VLane']['left'] * xHeight / 4,
            spacingY: ''
        })
    } else if (hasFixedLeft) {
        // Position divider based on fixed left position without anchoring
        borderGroup.set({ left: leftObject.left + DividerMargin['VLane']['left'] * xHeight / 4 });
    }

    if (!hasFixedRight && rightObject.getBoundingRect) {
        anchorShape(borderGroup, rightObject, {
            vertexIndex1: 'E1',
            vertexIndex2: 'E3',
            spacingX: DividerMargin['VLane']['right'] * xHeight / 4,
            spacingY: ''
        })
    } else if (hasFixedRight) {
        // For fixed value, remember the position for later usage
        // We don't need to adjust position here as the left position is already set
        // This will be handled later during border's assignWidthToDivider
    }

    borderGroup.setCoords()
    borderGroup.updateAllCoord()
    return borderGroup
}

