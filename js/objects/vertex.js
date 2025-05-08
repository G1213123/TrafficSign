// This file handles VertexControl class and keyboard navigation for vertices
// Implements Tab key cycling through vertices

import { CanvasGlobals } from "../canvas/canvas.js"
import { globalAnchorTree,anchorShape } from './anchor.js';
import { ShowHideSideBarEvent } from '../canvas/keyboardEvents.js'; // Import the event handler for sidebar toggling

const canvas = CanvasGlobals.canvas; // Fabric.js canvas instance
const canvasObject = CanvasGlobals.canvasObject; // All objects on the canvas
let vertexSnapInProgress = false; // Flag to indicate if a snap operation is in progress

class VertexControl extends fabric.Control {
    constructor(vertex, baseGroup) {
        const width = baseGroup.width || baseGroup.tempWidth
        const height = baseGroup.height || baseGroup.tempHeight
        const left = baseGroup.left
        const top = baseGroup.top
        super({
            x: (vertex.x - left) / width - 0.5,
            y: (vertex.y - top) / height - 0.5,
            offsetX: 0,
            offsetY: 0,
            cursorStyle: 'pointer',
            cornerSize: 20,
        });
        this.hover = false;
        this.isDragging = false; // New flag to indicate active dragging
        this.mouseUpHandler = this.onClick.bind(this);
        this.render = this.renderControl.bind(this);
        this.vertex = vertex;
        this.baseGroup = baseGroup;
        this.snapThreshold = 50; // Distance in pixels for snapping
        this.snapTarget = null; // Current snap target
        this.snapHighlight = null; // Visual highlight of snap target
        this.handleMouseMoveRef = this.handleMouseMove.bind(this);
        this.handleMouseDownRef = this.handleMouseDown.bind(this);
        this.handleMouseUpRef = this.handleMouseUp.bind(this);
        this.cancelDragRef = this.cancelDrag.bind(this);
    }

    renderControl(ctx, left, top, styleOverride, fabricObject) {
        const size = this.cornerSize;

        // Draw the circle with different color based on state
        ctx.beginPath();
        ctx.arc(left, top, size / 2, 0, 2 * Math.PI, false);

        // Different fill colors based on state
        if (this.isDragging) {
            // Active dragging state - bright yellow
            ctx.fillStyle = this.snapTarget ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 255, 0, 0.7)';
        } else if (this.baseGroup.focusMode) {
            // Focus mode - no color
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
        }
        else {
            // Normal or hover state
            ctx.fillStyle = `rgba(255, 20, 20, ${this.hover ? 0.7 : 0.2})`;
        }

        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.baseGroup.focusMode ? 'rgba(0, 0, 0, 0)' : this.VertexColorPicker(this.vertex);
        ctx.stroke();

        // Draw the text
        ctx.font = '10px Arial, sans-serif';
        ctx.fillStyle = this.baseGroup.focusMode ? 'rgba(0, 0, 0, 0)' : this.VertexColorPicker(this.vertex);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.vertex.label, left, this.vertex.label.includes('E') ? top - 15 : top + 15);
    }

    VertexColorPicker(vertex) {
        switch (vertex.label.substring(0, 1)) {
            case 'E':
                return 'red'
            case 'V':
                return 'violet'
            case 'C':
                return 'orange'
        }
    }    onClick(eventData, transform) {
        // Check if it's a left-click (button 1)
        if (eventData.button !== 0) return;

        // Prevent clicks during ongoing snap operations
        if (vertexSnapInProgress) return;
        
        // Prevent vertex activation if measure mode is active
        if (typeof FormMeasureComponent !== 'undefined' && FormMeasureComponent.activeMeasurement) {
            return;
        }

        const vertexX = this.vertex.x;
        const vertexY = this.vertex.y;

        if (!CanvasGlobals.activeVertex) {
            CanvasGlobals.activeVertex = this;
            this.isDown = true;
            this.isDragging = true; // Set dragging flag

            // Store original position and offset from vertex to group center
            this.originalPosition = {
                left: this.baseGroup.left,
                top: this.baseGroup.top
            };

            this.vertexOriginalPosition = {
                x: this.vertex.x,
                y: this.vertex.y
            };

            this.vertexOffset = {
                x: this.vertex.x - this.baseGroup.left,
                y: this.vertex.y - this.baseGroup.top
            };

            // Set cursor style for canvas
            canvas.defaultCursor = 'move';

            // Add mouse move and click handlers for drag behavior
            document.removeEventListener('keydown', ShowHideSideBarEvent);
            document.addEventListener('keydown', this.cancelDragRef);
            canvas.on('mouse:move', this.handleMouseMoveRef);
            canvas.on('mouse:down', this.handleMouseDownRef);
            canvas.on('mouse:up', this.handleMouseUpRef);

            canvas.renderAll();

            this.baseGroup.enterFocusMode()
        }
    }

    handleMouseMove(event) {
        if (!this.isDown) return;

        const pointer = canvas.getPointer(event.e);

        // Find nearest vertex for snapping
        this.checkForSnapTargets(pointer);

        // Calculate new position of group based on vertex position
        let newLeft, newTop;

        if (this.snapTarget) {
            // Snap to the target vertex
            const snapPoint = this.snapTarget.vertex;

            // Special handling for text objects during snapping
            if (this.baseGroup.functionalType === 'Text') {
                // Calculate the offset from the current vertex to the object's center
                const currentVertex = this.baseGroup.getBasePolygonVertex(this.vertex.label);
                if (currentVertex) {
                    // Calculate position by maintaining the same offset between vertex and object center
                    const offsetX = this.baseGroup.left - currentVertex.x;
                    const offsetY = this.baseGroup.top - currentVertex.y;
                    newLeft = snapPoint.x + offsetX;
                    newTop = snapPoint.y + offsetY;
                } else {
                    // Fall back to standard calculation if vertex not found
                    newLeft = snapPoint.x - this.vertexOffset.x;
                    newTop = snapPoint.y - this.vertexOffset.y;
                }
            } else {
                // Standard calculation for non-text objects
                newLeft = snapPoint.x - this.vertexOffset.x;
                newTop = snapPoint.y - this.vertexOffset.y;
            }
        } else {
            // Regular movement (no snapping target)
            if (this.baseGroup.functionalType === 'Text') {
                // For text objects, adjust movement to prevent shifting
                const currentVertex = this.baseGroup.getBasePolygonVertex(this.vertex.label);
                if (currentVertex) {
                    // Move based on cursor position relative to vertex
                    const dx = pointer.x - currentVertex.x;
                    const dy = pointer.y - currentVertex.y;
                    newLeft = this.baseGroup.left + dx;
                    newTop = this.baseGroup.top + dy;
                } else {
                    // Fall back to standard calculation if vertex not found
                    newLeft = pointer.x - this.vertexOffset.x;
                    newTop = pointer.y - this.vertexOffset.y;
                }
            } else {
                // Standard calculation for non-text objects
                newLeft = pointer.x - this.vertexOffset.x;
                newTop = pointer.y - this.vertexOffset.y;
            }
        }

        // Move the group
        if (this.baseGroup.functionalType !== 'MainRoad' && this.baseGroup.functionalType !== 'SideRoad') {
            // Cache the old position to calculate delta
            const oldLeft = this.baseGroup.left;
            const oldTop = this.baseGroup.top;

            // Process both X and Y updates in a single atomic operation
            let positionChanged = false;

            if (!this.baseGroup.lockMovementX) {
                this.baseGroup.set({ left: newLeft });
                positionChanged = true;
            }

            if (!this.baseGroup.lockMovementY) {
                this.baseGroup.set({ top: newTop });
                positionChanged = true;
            }

            if (positionChanged) {
                // Start a single combined update cycle instead of separate X and Y cycles
                if (!globalAnchorTree.updateInProgressX) {
                    globalAnchorTree.startUpdateCycle('x', this.baseGroup.canvasID);
                }
                if (!globalAnchorTree.updateInProgressY) {
                    globalAnchorTree.startUpdateCycle('y', this.baseGroup.canvasID);
                }

                // Update coordinates in one go
                this.baseGroup.setCoords();
                this.baseGroup.updateAllCoord();

                // End update cycles if we started them
                if (!globalAnchorTree.updateInProgressX) {
                    globalAnchorTree.endUpdateCycle('x');
                }
                if (!globalAnchorTree.updateInProgressY) {
                    globalAnchorTree.endUpdateCycle('y');
                }
            }
        } else {
            // Special handling for MainRoad and SideRoad
            // If we have a snap target, use its position instead of pointer
            const finalPointer = this.snapTarget ?
                { x: this.snapTarget.vertex.x, y: this.snapTarget.vertex.y } :
                pointer;            
                if (this.baseGroup.functionalType === 'SideRoad') {
                // For SideRoad, calculate the appropriate offset based on active vertex
                if (CanvasGlobals.activeVertex && CanvasGlobals.activeVertex.vertex) {
                    // Find the V1 vertex which corresponds to routeList[0]
                    let v1Vertex = this.baseGroup.basePolygon.vertex.find(v => v.label === 'V1');

                    // Calculate offset between active vertex and V1
                    let offsetX = 0;
                    let offsetY = 0;

                    if (CanvasGlobals.activeVertex.vertex.label !== 'V1' && v1Vertex) {
                        // Calculate offset
                        const activeVertexObj = this.baseGroup.basePolygon.vertex.find(v => v.label === CanvasGlobals.activeVertex.vertex.label);
                        if (activeVertexObj) {
                            offsetX = v1Vertex.x - activeVertexObj.x;
                            offsetY = v1Vertex.y - activeVertexObj.y;
                        }
                    }

                    // Apply the position update with the calculated offset, respecting lock properties
                    if (!this.baseGroup.lockMovementX) {
                        this.baseGroup.routeList[0].x = finalPointer.x + offsetX;
                    }
                    if (!this.baseGroup.lockMovementY) {
                        this.baseGroup.routeList[0].y = finalPointer.y + offsetY;
                    }
                } else {
                    // Fallback to old behavior if active vertex information is not available
                    this.baseGroup.routeList.forEach(route => {
                        if (!this.baseGroup.lockMovementX) {
                            route.x = newLeft + this.vertexOffset.x;
                        }
                        if (!this.baseGroup.lockMovementY) {
                            route.y = newTop + this.vertexOffset.y;
                        }
                    });
                }
            } else {
                // For MainRoad, use original behavior but respect lock properties
                this.baseGroup.routeList.forEach(route => {
                    if (!this.baseGroup.lockMovementX) {
                        route.x = newLeft + this.vertexOffset.x;
                    }
                    if (!this.baseGroup.lockMovementY) {
                        route.y = newTop + this.vertexOffset.y;
                    }
                });
            }

            // Process route changes in a single update cycle, but only for directions that aren't locked
            let updateX = !this.baseGroup.lockMovementX;
            let updateY = !this.baseGroup.lockMovementY;
            
            if (updateX && !globalAnchorTree.updateInProgressX) {
                globalAnchorTree.startUpdateCycle('x', this.baseGroup.canvasID);
            }
            if (updateY && !globalAnchorTree.updateInProgressY) {
                globalAnchorTree.startUpdateCycle('y', this.baseGroup.canvasID);
            }

            this.baseGroup.onMove();
            this.baseGroup.setCoords();
            this.baseGroup.updateAllCoord();

            if (!globalAnchorTree.updateInProgressX) {
                globalAnchorTree.endUpdateCycle('x');
            }
            if (!globalAnchorTree.updateInProgressY) {
                globalAnchorTree.endUpdateCycle('y');
            }
        }

        canvas.renderAll();
    }

    checkForSnapTargets(pointer) {
        // Clear any existing snap highlight
        this.clearSnapHighlight();

        this.snapTarget = null;

        // Check all canvas objects for potential snap targets
        let closestDistance = this.snapThreshold;
        let closestVertex = null;
        let closestObject = null;

        canvasObject.forEach(obj => {
            // Skip the current object and objects without basePolygon
            if (obj === this.baseGroup || !obj.basePolygon || !obj.basePolygon.vertex) return;

            // Check each vertex
            obj.basePolygon.vertex.forEach(vertex => {
                const dx = vertex.x - (pointer.x);
                const dy = vertex.y - (pointer.y);
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestVertex = vertex;
                    closestObject = obj;
                }
            });
        });

        // If we found a vertex within threshold, highlight it
        if (closestVertex) {
            this.snapTarget = {
                object: closestObject,
                vertex: closestVertex
            };
            this.addSnapHighlight(); // Add highlight for the snap target

        }
    }

    addSnapHighlight() {
        if (this.snapTarget) {
            // Match the circle size with the vertex control size
            const size = this.cornerSize + 5;
            const radius = size / 2;
            const zoomFactor = canvas.getZoom() || 1; // Get the current zoom factor

            // Create a hollow circle to indicate snap target, centered at the vertex position
            this.snapHighlight = new fabric.Circle({
                left: this.snapTarget.vertex.x,
                top: this.snapTarget.vertex.y,
                radius: radius / zoomFactor,
                fill: 'transparent',
                stroke: '#00FF00',
                strokeWidth: 2 / zoomFactor,
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center'
            });

            // Add the highlight to the canvas
            canvas.add(this.snapHighlight);

            // Force a render to update vertex appearance
            canvas.renderAll();
        }
    }


    // New method to clear snap highlight
    clearSnapHighlight() {
        if (this.snapHighlight) {
            canvas.remove(this.snapHighlight);
            this.snapHighlight = null;
            canvas.renderAll();
        }
    }

    handleMouseDown(event) {
        if (!this.isDown) return;

        // Check for right-click (button 2)
        if (event.e.button === 2) {
            // Cancel drag on right-click
            this.restoreOriginalPosition();
            return;
        }

        // Only process left clicks (button 1) for object selection
        if (event.e.button !== 0) return;

        // If we have a snap target, use that for anchoring
        if (this.snapTarget) {
            // Set the flag to prevent additional onClick events
            vertexSnapInProgress = true;

            // Store the snap target before finishing the drag
            const savedSnapTarget = {
                object: this.snapTarget.object,
                vertex: this.snapTarget.vertex
            };
            const savedVertex = this.vertex;
            const savedBaseGroup = this.baseGroup;

            // Clear the snap highlight before finishing the drag
            this.clearSnapHighlight();

            this.finishDrag();

            // Start the anchor process with the saved snap target
            setTimeout(() => {
                anchorShape(
                    savedSnapTarget.object,
                    savedBaseGroup,
                    {
                        vertexIndex1: savedVertex.label,
                        vertexIndex2: savedSnapTarget.vertex.label
                    }
                ).then(() => {
                    // Reset the flag after anchoring completes
                    setTimeout(() => {
                        vertexSnapInProgress = false;
                    }, 300);
                }).catch(() => {
                    vertexSnapInProgress = false;
                });
            }, 100);
            return;
        }

        const pointer = canvas.getPointer(event.e);
        const targetObject = canvas.findTarget(event.e);

        // Check if we clicked on another object with vertices
        if (targetObject && targetObject !== this.baseGroup && targetObject.basePolygon && targetObject.basePolygon.vertex) {
            // Find the closest vertex to the click point
            const vertices = targetObject.basePolygon.vertex;
            if (!vertices) {
                // Set flag before starting the finishing process
                vertexSnapInProgress = true;

                // Finish drag with a delay to ensure proper cleanup
                this.finishDrag();

                // Reset the flag after a delay
                setTimeout(() => {
                    vertexSnapInProgress = false;
                }, 300);
                return;
            }

            let closestVertex = null;
            let minDistance = 30; // Minimum distance to consider a hit

            for (const vertex of vertices) {
                const dx = vertex.x - pointer.x;
                const dy = vertex.y - pointer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestVertex = vertex;
                }
            }

            if (closestVertex) {
                // Found a vertex to anchor to
                vertexSnapInProgress = true;
                this.finishDrag();

                // Start the anchor process
                setTimeout(() => {
                    anchorShape(
                        targetObject,
                        this.baseGroup,
                        {
                            vertexIndex1: this.vertex.label,
                            vertexIndex2: closestVertex.label
                        }
                    ).then(() => {
                        // Reset the flag after anchoring completes
                        setTimeout(() => {
                            vertexSnapInProgress = false;
                        }, 300);
                    }).catch(() => {
                        vertexSnapInProgress = false;
                    });
                }, 100);
                return;
            }
        }    // If we click on empty space, set flag and finish the drag with a single operation
        vertexSnapInProgress = true;

        // Store reference to the current baseGroup before calling finishDrag
        const baseGroupRef = this.baseGroup;

        // Call finishDrag once to handle all cleanup consistently
        this.finishDrag(true); // Pass true to indicate empty space click

        // Reset the flag after a delay to prevent new clicks
        setTimeout(() => {
            vertexSnapInProgress = false;
            canvas.renderAll();
        }, 300);
    }

    // New helper method to remove all mouse events immediately
    removeAllMouseEvents() {
        canvas.off('mouse:move', this.handleMouseMoveRef);
        canvas.off('mouse:down', this.handleMouseDownRef);
        canvas.off('mouse:up', this.handleMouseUpRef);
        document.removeEventListener('keydown', this.cancelDragRef);

        // Clear any snap highlight before removing events
        this.clearSnapHighlight();

        // Restore default behavior
        document.addEventListener('keydown', ShowHideSideBarEvent);
        canvas.defaultCursor = 'default';

        // Reset internal state
        this.isDown = false;
        this.isDragging = false; // Reset dragging state
    }

    finishDrag(isEmptySpaceClick = false) {
        this.clearSnapHighlight();
        this.cleanupDrag();
        this.baseGroup.updateAllCoord(null, []);

        // Call the appropriate onMove method for special object types
        if (this.baseGroup.functionalType === 'MainRoad' && typeof this.baseGroup.onMove === 'function') {
            this.baseGroup.onMove();
        } else if (this.baseGroup.functionalType === 'SideRoad' && typeof this.baseGroup.onMove === 'function') {
            this.baseGroup.onMove();
        }

        globalAnchorTree.endUpdateCycle('x');
        globalAnchorTree.endUpdateCycle('y');

        // If it's an empty space click, exit focus mode
        if (isEmptySpaceClick) {
            this.baseGroup.exitFocusMode();
        }

        CanvasGlobals.activeVertex = null;
        canvas.renderAll();
    }

    handleMouseUp(event) {
        // Check for right-click (button 2)
        if (event.e.button === 2 && this.isDown) {
            // Cancel drag on right-click
            this.restoreOriginalPosition();
            return;
        }
    }

    restoreOriginalPosition() {
        // Clear any snap highlight
        this.clearSnapHighlight();

        // Restore original position
        this.baseGroup.set(this.originalPosition);
        this.baseGroup.setCoords();
        this.baseGroup.updateAllCoord();
        this.baseGroup.exitFocusMode()

        this.cleanupDrag();
        CanvasGlobals.activeVertex = null;
        canvas.renderAll();
    }

    cancelDrag(event) {
        if (event && event.key === 'Escape') {
            this.restoreOriginalPosition();
        }
    }

    cleanupDrag() {
        // Clear any snap highlight
        this.clearSnapHighlight();

        // First reset object properties
        this.isDown = false;
        this.isDragging = false; // Reset dragging flag

        // Remove event listeners using stored references
        canvas.off('mouse:move', this.handleMouseMoveRef);
        canvas.off('mouse:down', this.handleMouseDownRef);
        canvas.off('mouse:up', this.handleMouseUpRef);
        document.removeEventListener('keydown', this.cancelDragRef);

        // Restore default behavior
        document.addEventListener('keydown', ShowHideSideBarEvent);
        canvas.defaultCursor = 'default';

        // Make sure we're no longer active
        if (CanvasGlobals.activeVertex === this) {
            CanvasGlobals.activeVertex = null;
        }
    }

    onHover() {
        this.hover = true;
        canvas.renderAll();
    }

    onMouseOut() {
        this.hover = false;
        canvas.renderAll();
    }
}

// Register the Tab key handler for vertex cycling
document.addEventListener('keydown', function (event) {
    // Only handle Tab key when a vertex is active and we're not in a text input
    if (event.key === 'Tab' && CanvasGlobals.activeVertex &&
        document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {

        // Prevent default Tab behavior (focus change)
        event.preventDefault();

        // Check if Shift key is also pressed
        const shiftPressed = event.shiftKey;

        // Get reference to current baseGroup and the active vertex
        const currentBaseGroup = CanvasGlobals.activeVertex.baseGroup;
        const currentVertex = CanvasGlobals.activeVertex.vertex;        // Handle both V and E vertices
        // Get all E vertices in the group
        const eVertices = currentBaseGroup.basePolygon.vertex.filter(v => v.label.startsWith('E'));

        // Sort them by their label number
        eVertices.sort((a, b) => {
            const aNum = parseInt(a.label.substring(1));
            const bNum = parseInt(b.label.substring(1));
            return aNum - bNum;
        });

        // Determine which vertex to activate next/previous
        let nextVertex;

        // Special handling for V vertices
        if (currentVertex.label.startsWith('V')) {
            if (shiftPressed) {
                // When Shift+Tab on a V vertex, move to the last E vertex
                nextVertex = eVertices[eVertices.length - 1];
            } else {
                // When Tab on a V vertex, find E3 or default to the first E vertex
                nextVertex = eVertices.find(v => v.label === 'E3') || eVertices[0];
            }
        } else if (currentVertex.label.startsWith('E')) {
            // Normal case for E vertices - cycle through them
            const currentIndex = eVertices.findIndex(v => v.label === currentVertex.label);

            if (shiftPressed) {
                // Calculate the previous index (cycle back to end if at the beginning)
                const prevIndex = (currentIndex - 1 + eVertices.length) % eVertices.length;
                nextVertex = eVertices[prevIndex];
            } else {
                // Calculate the next index (cycle back to 0 if at the end)
                const nextIndex = (currentIndex + 1) % eVertices.length;
                nextVertex = eVertices[nextIndex];
            }
        } else {
            // For any other vertex type, default based on Shift key
            nextVertex = shiftPressed ? eVertices[eVertices.length - 1] : eVertices[0];
        }

        // Only proceed if we have a valid next vertex
        if (nextVertex) {
            // Use the current active vertex position instead of trying to get a pointer position
            // This works because we're cycling from one vertex to another
            const currentVertexPosition = {
                x: currentVertex.x,
                y: currentVertex.y
            };

            // Only proceed if we have valid vertex positions
            if (typeof currentVertexPosition.x === 'number' && !isNaN(currentVertexPosition.x) &&
                typeof currentVertexPosition.y === 'number' && !isNaN(currentVertexPosition.y)) {

                // Clean up the current active vertex
                CanvasGlobals.activeVertex.cleanupDrag();

                // Activate the next vertex control
                const nextVertexControl = currentBaseGroup.controls[nextVertex.label];
                if (nextVertexControl) {

                    // Make it the active vertex
                    CanvasGlobals.activeVertex = nextVertexControl;
                    CanvasGlobals.activeVertex.isDown = true;
                    CanvasGlobals.activeVertex.isDragging = true;

                    // Store original position for possible cancellation
                    CanvasGlobals.activeVertex.originalPosition = {
                        left: currentBaseGroup.left,
                        top: currentBaseGroup.top
                    };

                    CanvasGlobals.activeVertex.vertexOriginalPosition = {
                        x: nextVertex.x,
                        y: nextVertex.y
                    };
                    // Store the vertex's original position
                    CanvasGlobals.activeVertex.vertexOriginalPosition = {
                        x: nextVertex.x,
                        y: nextVertex.y
                    };

                    // Calculate offset from vertex to group center - ensure values are numeric
                    const offsetX = nextVertex.x - currentBaseGroup.left;
                    const offsetY = nextVertex.y - currentBaseGroup.top;

                    CanvasGlobals.activeVertex.vertexOffset = {
                        x: isNaN(offsetX) ? 0 : offsetX,
                        y: isNaN(offsetY) ? 0 : offsetY
                    };

                    // Calculate the delta needed to move the new vertex to the position of the current vertex
                    // This effectively keeps the object position stable while cycling through vertices
                    const deltaX = currentVertexPosition.x - nextVertex.x;
                    const deltaY = currentVertexPosition.y - nextVertex.y;

                    // Verify we have valid deltas before moving
                    const validDeltaX = typeof deltaX === 'number' && !isNaN(deltaX);
                    const validDeltaY = typeof deltaY === 'number' && !isNaN(deltaY);

                    // Move the group so that the new active vertex is at the pointer position
                    if (!currentBaseGroup.lockMovementX && validDeltaX) {
                        currentBaseGroup.set({ left: currentBaseGroup.left + deltaX });
                    }
                    if (!currentBaseGroup.lockMovementY && validDeltaY) {
                        currentBaseGroup.set({ top: currentBaseGroup.top + deltaY });
                    }
                    try {
                        // Update coordinates for the entire group
                        currentBaseGroup.setCoords();
                        currentBaseGroup.updateAllCoord();

                        // Set up event listeners for the new active vertex
                        document.removeEventListener('keydown', ShowHideSideBarEvent);
                        document.addEventListener('keydown', CanvasGlobals.activeVertex.cancelDragRef);
                        canvas.on('mouse:move', CanvasGlobals.activeVertex.handleMouseMoveRef);
                        canvas.on('mouse:down', CanvasGlobals.activeVertex.handleMouseDownRef);
                        canvas.on('mouse:up', CanvasGlobals.activeVertex.handleMouseUpRef);

                        // Keep the group in focus mode
                        currentBaseGroup.enterFocusMode();

                        // Set cursor style
                        canvas.defaultCursor = 'move';

                        // Render the updated canvas
                        canvas.renderAll();
                    } catch (err) {
                        console.error("Error during vertex cycling:", err);

                        // Clean up if there was an error
                        if (CanvasGlobals.activeVertex) {
                            CanvasGlobals.activeVertex.cleanupDrag();
                            CanvasGlobals.activeVertex = null;
                        }

                        // Restore default behavior
                        document.addEventListener('keydown', ShowHideSideBarEvent);
                        canvas.defaultCursor = 'default';
                        canvas.renderAll();
                    }
                }
            }
        }
    }
});

export { VertexControl };
