// Demo Snap Controls - Custom Fabric.js controls for snap functionality
// Based on vertex.js control implementation


class SnapControl extends fabric.Control {
    constructor(x, y, canvas, symbolObject, demoCanvasObject, targetControl = null, textObject = null) {
        super({
            x: 0,
            y: 0,
            offsetX: 0,
            offsetY: 0,
            cursorStyle: 'move',
            cornerSize: 40,
        });

        this.canvas = canvas;
        this.symbolObject = symbolObject;
        this.textObject = textObject;
        this.targetControl = targetControl;
        this.snapThreshold = 50;
        this.isFollowingCursor = true;
        this.snapTarget = null;
        this.snapHighlight = null;
        this.isSnapped = false;

        // Bind event handlers
        this.handleMouseMoveRef = this.handleMouseMove.bind(this);
        this.handleMouseClickRef = this.handleMouseClick.bind(this);
        //this.render = this.renderControl.bind(this);

        // Create the visual circle
        this.circle = new fabric.Circle({
            left: x,
            top: y,
            radius: 20,
            fill: '#FFD700',
            strokeWidth: 0,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            snapIndicator: true
        });

        // Calculate initial offset between circle and symbol
        this.calculateOffset();

        // Add circle to canvas and start following cursor
        this.canvas.add(this.circle);
        this.startFollowingCursor(demoCanvasObject);
    }

    calculateOffset() {
        const symbolBounds = this.symbolObject.getBoundingRect();
        this.offsetToSymbol = {
            x: symbolBounds.left - this.circle.left,
            y: symbolBounds.top - this.circle.top
        };
    }

    startFollowingCursor(demoCanvasObject) {
        this.canvas.on('mouse:move', this.handleMouseMoveRef);
        this.canvas.on('mouse:down', (event) => { this.handleMouseClickRef(event, demoCanvasObject); });
    }

    stopFollowingCursor() {
        this.canvas.off('mouse:move', this.handleMouseMoveRef);
        this.canvas.off('mouse:down', this.handleMouseClickRef);
    }

    handleMouseMove(event) {
        if (!this.isFollowingCursor) return;

        const pointer = this.canvas.getPointer(event.e);
        this.updatePosition(pointer);
    }      
    
    async handleMouseClick(event, demoCanvasObject) {
        if (!this.isFollowingCursor) return;

        this.hideSnapPreview();
        this.exitSnappingMode();

        if (this.snapTarget) {
            // Show prompts for both X and Y axes
            console.log('Snap target found, showing prompts...');
            const spacingX = await this.showAxisPrompt('X');
            if (spacingX === null) {
                // User cancelled
                this.snapTarget = null;
                return;
            }
            
            const spacingY = await this.showAxisPrompt('Y');
            if (spacingY === null) {
                // User cancelled
                this.snapTarget = null;
                return;
            }
            
            // Apply the spacing and move the symbol
            this.applySpacing(spacingX, spacingY, demoCanvasObject);
            console.log(`Applied spacing - X: ${spacingX}, Y: ${spacingY}`);
        }

        this.snapTarget = null;
    }
      async showAxisPrompt(axis) {
        return new Promise((resolve) => {
            const promptBox = document.getElementById('demo-cursor-text-box');
            const answerBox = document.getElementById('demo-cursor-answer-box');
            const container = document.getElementById('demo-cursor-box-container');
            
            if (!promptBox || !answerBox || !container) {
                console.log('Snap confirmed - cursor box elements not found');
                resolve('0');
                return;
            }            // Show the prompt for the specific axis
            promptBox.innerText = `Enter spacing for ${axis} axis (in units):`;
            answerBox.value = axis === 'X' ? '-2' : '1.7'; // Default value for Y axis
            container.style.display = 'block';
            
            // Use setTimeout to ensure the element is visible before focusing
            setTimeout(() => {
                answerBox.focus();
                answerBox.select();
            }, 10);

            const cleanup = () => {
                container.style.display = 'none';
                answerBox.removeEventListener('keydown', handleKeyDown);
            };

            const handleKeyDown = (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    const result = answerBox.value;
                    resolve(result);
                    cleanup();
                } else if (event.key === 'Escape') {
                    resolve(null);
                    cleanup();
                }
            };

            answerBox.addEventListener('keydown', handleKeyDown);
        });
    }    applySpacing(spacingX, spacingY, demoCanvasObject) {
        if (!this.snapTarget || !this.symbolObject) return;

        // Mark snap as completed (used for progressive demo tracking)
        if (window.demoSnapState) {
            window.demoSnapState.snapCompleted = true;
        }

        // Convert spacing values using formula: (entered_value * 100) / 4
        const calculatedSpacingX = (parseFloat(spacingX) * 100) / 4;
        const calculatedSpacingY = (parseFloat(spacingY) * 100) / 4;

        // Get current positions
        const targetX = this.snapTarget.left;
        const targetY = this.snapTarget.top;
        
        // Calculate new symbol position with spacing
        const newSymbolX = targetX + calculatedSpacingX + this.offsetToSymbol.x;
        const newSymbolY = targetY + calculatedSpacingY + this.offsetToSymbol.y;

        // Move the symbol object
        this.symbolObject.set({
            left: newSymbolX,
            top: newSymbolY
        });

        // Update coordinates
        this.symbolObject.setCoords();
        this.circle.setCoords();

        // Create a fabric group with symbol and text if text object exists
        if (this.textObject) {
            // Prepare objects for grouping
            const objectsToGroup = [this.symbolObject, this.textObject];
            
            // Create the group
            const group = new fabric.Group(objectsToGroup, {
                left: Math.min(this.symbolObject.left, this.textObject.left),
                top: Math.min(this.symbolObject.top, this.textObject.top),
                selectable: true,
                evented: true
            });            // Remove individual objects from canvas
            this.canvas.remove(this.symbolObject);
            this.canvas.remove(this.textObject);
            
            // Add the group to canvas
            this.canvas.add(group);

            // Remove individual objects from the array and add the group
            const symbolIndex = demoCanvasObject.indexOf(this.symbolObject);
            const textIndex = demoCanvasObject.indexOf(this.textObject);
            
            if (symbolIndex > -1) {
                demoCanvasObject.splice(symbolIndex, 1);
            }
            if (textIndex > -1) {
                // Adjust index if symbolIndex was before textIndex and was removed
                const adjustedTextIndex = textIndex > symbolIndex ? textIndex - 1 : textIndex;
                demoCanvasObject.splice(adjustedTextIndex, 1);
            }
            demoCanvasObject.push(group);
            
            console.log('Created fabric group with symbol and text objects');
        }

        this.canvas.renderAll();
        console.log(`Symbol moved to: X=${newSymbolX}, Y=${newSymbolY}`);
    }

    updatePosition(pointer) {
        // Update circle position
        this.circle.set({
            left: pointer.x,
            top: pointer.y
        });

        // Update symbol position based on offset
        const newSymbolLeft = pointer.x + this.offsetToSymbol.x;
        const newSymbolTop = pointer.y + this.offsetToSymbol.y;

        this.symbolObject.set({
            left: newSymbolLeft,
            top: newSymbolTop
        });

        // Update coordinates
        this.symbolObject.setCoords();
        this.circle.setCoords();

        // Check for snap targets
        this.checkForSnapTargets(pointer);

        this.canvas.renderAll();
    }

    checkForSnapTargets(pointer) {
        // Clear existing highlight
        this.clearSnapHighlight();
        this.snapTarget = null;

        // Find snap targets (objects with snapTarget property)
        const snapTargets = this.canvas.getObjects().filter(obj => obj.snapTarget);

        let closestDistance = this.snapThreshold;
        let closestTarget = null;

        snapTargets.forEach(target => {
            const dx = target.left - pointer.x;
            const dy = target.top - pointer.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestTarget = target;
            }
        });

        if (closestTarget) {
            this.snapTarget = closestTarget;
            this.showSnapPreview();
            this.addSnapHighlight();
            this.performSnap();


            //this.hideSnapPreview();
            //if (this.isSnapped) {
            //    this.exitSnappingMode();
            //}
        }
    }

    showSnapPreview() {
        this.circle.set({
            fill: '#00FF00',
            stroke: '#00CC00',
            strokeWidth: 3,
            radius: 22 // Slightly larger to indicate readiness to snap
        });
    }

    hideSnapPreview() {
        this.circle.set({
            fill: '#FFD700',
            stroke: '',
            strokeWidth: 0,
            radius: 20 // Reset to original size
        });
    }

    addSnapHighlight() {
        if (!this.snapTarget) return;

        this.snapHighlight = new fabric.Circle({
            left: this.snapTarget.left,
            top: this.snapTarget.top,
            radius: 30,
            fill: 'transparent',
            stroke: '#00FF00',
            strokeWidth: 3,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false
        });

        this.canvas.add(this.snapHighlight);
    }

    clearSnapHighlight() {
        if (this.snapHighlight) {
            this.canvas.remove(this.snapHighlight);
            this.snapHighlight = null;
        }
    }

    performSnap() {
        if (!this.snapTarget) return;

        // Mark as snapped but keep following cursor
        this.isSnapped = true;

        // Snap to target position
        this.circle.set({
            left: this.snapTarget.left,
            top: this.snapTarget.top
        });

        // Update symbol position
        const newSymbolLeft = this.snapTarget.left + this.offsetToSymbol.x;
        const newSymbolTop = this.snapTarget.top + this.offsetToSymbol.y;

        this.symbolObject.set({
            left: newSymbolLeft,
            top: newSymbolTop
        });

        // Update coordinates
        this.symbolObject.setCoords();
        this.circle.setCoords();

        this.canvas.renderAll();
        console.log('Snap performed! Click to exit snapping mode.');
    }

    exitSnappingMode() {
        this.isSnapped = false;

        // Clear highlight
        this.clearSnapHighlight();

        // Reset circle appearance
        this.hideSnapPreview();

        console.log('Exited snapping mode. Demo cleaned up.');

        // Cleanup and remove all circles
        this.cleanup();
    }

    cleanup() {
        this.stopFollowingCursor();
        this.clearSnapHighlight();
        if (this.circle) {
            this.canvas.remove(this.circle);
        }
        if (this.targetControl) {
            this.targetControl.cleanup();
        }
    }
}

class SnapTargetControl {
    constructor(x, y, canvas, name = 'Snap Target') {
        this.canvas = canvas;
        this.name = name;

        // Create main circle
        this.circle = new fabric.Circle({
            left: x,
            top: y,
            radius: 20,
            fill: '#00FF00',
            strokeWidth: 0,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            snapTarget: true,
            name: name // Add name property for identification
        });

        this.canvas.add(this.circle);
    }

    cleanup() {
        if (this.circle) {
            this.canvas.remove(this.circle);
        }
    }
}

// Export only the control classes
export { SnapControl, SnapTargetControl };
