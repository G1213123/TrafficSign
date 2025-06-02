export function createDemoBorder(demoCanvas, demoCanvasObject) {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }    try {
        // 1. Handle existing border groups - dissolve and extract content
        const existingBorderGroups = demoCanvasObject.filter(obj => obj.functionalType === 'border');
        let extractedObjects = [];
        
        existingBorderGroups.forEach(borderGroup => {
            if (borderGroup.type === 'group' && borderGroup._objects) {
                // Extract all objects from the group except border rectangles
                const groupObjects = borderGroup._objects.filter(obj => 
                    !(obj.type === 'rect' && (obj.fill === '#0033a2' || obj.stroke === '#ffffff'))
                );
                
                // Calculate the group's transform to properly position extracted objects
                const groupLeft = borderGroup.left || 0;
                const groupTop = borderGroup.top || 0;
                
                groupObjects.forEach(obj => {
                    // Apply group transform to individual objects
                    if (obj.left !== undefined) obj.left += groupLeft;
                    if (obj.top !== undefined) obj.top += groupTop;
                    extractedObjects.push(obj);
                });
            }
            
            // Remove the border group from canvas
            demoCanvas.remove(borderGroup);
        });
        
        // Add extracted objects back to canvas
        extractedObjects.forEach(obj => {
            demoCanvas.add(obj);
        });
        
        // Update demoCanvasObject to exclude border groups and include extracted objects
        demoCanvasObject = demoCanvasObject.filter(obj => obj.functionalType !== 'border');
        demoCanvasObject.push(...extractedObjects);

        // 2. Collect all objects for bounding box calculation
        const objectsToBound = demoCanvasObject;

        if (objectsToBound.length === 0) {
            // No objects to create a border around, ensure canvas is clean if a border was just removed
            demoCanvas.renderAll();
            return;
        }

        // Calculate the collective bounding box of all other objects
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        objectsToBound.forEach(obj => {
            if (obj && typeof obj.getBoundingRect === 'function') {
                // getBoundingRect(true) considers transformations and stroke for the true bounding box
                const objBound = obj.getBoundingRect(true);
                minX = Math.min(minX, objBound.left);
                minY = Math.min(minY, objBound.top);
                maxX = Math.max(maxX, objBound.left + objBound.width);
                maxY = Math.max(maxY, objBound.top + objBound.height);
            }
        });

        if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
            // No valid objects with bounds found
            demoCanvas.renderAll();
            return;
        }

        const contentLeft = minX;
        const contentTop = minY;
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;

        // 3. Define Border Properties
        const padding = 67.5;
        const outerStrokeWidth = 37.5;
        const innerFillColor = '#0033a2';
        const outerStrokeColor = '#ffffff';
        const cornerRadius = 37.5; // Consistent rounded corners

        // Calculate dimensions for the border paths (inner and outer will share this path size)
        const borderPathWidth = contentWidth + (2 * padding);
        const borderPathHeight = contentHeight + (2 * padding);

        // 4. Create Outer Border Rectangle (stroke)
        const outerRect = new fabric.Rect({
            left: contentLeft - padding - outerStrokeWidth / 2,
            top: contentTop - padding - outerStrokeWidth / 2,
            width: borderPathWidth,
            height: borderPathHeight,
            fill: 'transparent',
            stroke: outerStrokeColor,
            strokeWidth: outerStrokeWidth,
            rx: cornerRadius,
            ry: cornerRadius,
            originX: 'left',
            originY: 'top'
            // strokeLineJoin: 'round' // Optional: for smoother stroke corners
        });
        

        // 5. Create Inner Border Rectangle (fill)
        const innerRect = new fabric.Rect({
            left: contentLeft - padding,
            top: contentTop - padding,
            width: borderPathWidth,
            height: borderPathHeight,
            fill: innerFillColor,
            strokeWidth: 0, // No stroke for the inner fill part
            rx: cornerRadius,
            ry: cornerRadius,
            originX: 'left',
            originY: 'top'
        });        // 6. Group and Position
        // Remove the objects to be bounded from the canvas first
        objectsToBound.forEach(obj => {
            demoCanvas.remove(obj);
        });
        
        // The outerRect is drawn first, then innerRect, then the bounded objects on top
        const borderGroup = new fabric.Group([outerRect, innerRect, ...objectsToBound], {
            left: contentLeft - padding,
            top: contentTop - padding,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#3b82f6', // Standard controls color
            cornerColor: '#3b82f6',
            functionalType: 'border' // Mark this object as a border
        });        // 7. Update Canvas
        demoCanvas.add(borderGroup);
        demoCanvas.setActiveObject(borderGroup); // Optional: set active
        demoCanvas.renderAll();
        
        // Update demoCanvasObject - remove the individual objects and add the group
        demoCanvasObject = demoCanvasObject.filter(obj => !objectsToBound.includes(obj));
        demoCanvasObject.push(borderGroup);

        console.log('Demo border created/updated');

    } catch (error) {
        console.error('Error creating demo border:', error);
    }
}