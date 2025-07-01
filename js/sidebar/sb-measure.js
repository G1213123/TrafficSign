/**
 * Measure Tool Module for Sidebar
 * 
 * This module provides a measurement tool to measure distances between vertices
 * It detects snapping points and displays deltaX and deltaY measurements
 */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { ShowHideSideBarEvent } from '../canvas/keyboardEvents.js'; // Import the event handler for sidebar toggling
import { showTextBox, hideTextBox } from '../canvas/promptBox.js'; // Import prompt box functions

const canvas = CanvasGlobals.canvas; // Reference to the main canvas
const canvasObject = CanvasGlobals.canvasObject; // Reference to the canvas objects

const FormMeasureComponent = {
  // State tracking
  activeMeasurement: false,
  firstVertex: null,
  newMeasureObject: null,
  snapThreshold: 30, // Distance in pixels for vertex snapping
  snapTarget: null, // Current snap target
  snapHighlight: null, // Visual highlight of snap target
  /**
   * Initialize the Measure panel UI
   */
  measurePanelInit: function (event) {
    GeneralHandler.tabNum = 5; // Use a unique tab number for the measure tool
    var parent = GeneralHandler.PanelInit();
    GeneralHandler.setActiveComponentOff(FormMeasureComponent.MeasureHandlerOff);
    if (!parent) return;

    // Create the title using consistent styling
    GeneralHandler.createNode("h2", { 'class': 'panel-heading' }, parent).innerHTML = "Measure Tool";

    // Create a container for instructions with proper styling
    const instructionsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
    const instructionsLabel = GeneralHandler.createNode("div", { 'class': 'input-group-label' }, instructionsContainer);
    instructionsLabel.innerHTML = "Instructions";

    const instructionsContent = GeneralHandler.createNode("div", { 'class': 'input-group-content' }, instructionsContainer);
    GeneralHandler.createNode("p", { 'class': 'instruction-text' }, instructionsContent).innerHTML =
      "Click on vertices to measure distances. First click selects the starting vertex, second click measures to the end vertex.";

    // Create a container for the measurement controls with proper styling
    const controlsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
    const controlsLabel = GeneralHandler.createNode("div", { 'class': 'input-group-label' }, controlsContainer);
    controlsLabel.innerHTML = "Measurement Control";

    const controlsContent = GeneralHandler.createNode("div", { 'class': 'input-group-content' }, controlsContainer);

    // Add the measurement toggle button with consistent styling
    GeneralHandler.createButton('toggle-measure',
      FormMeasureComponent.activeMeasurement ? 'Stop Measuring' : 'Start Measuring',
      controlsContent, 'input',
      FormMeasureComponent.toggleMeasurementMode, 'click');
  },

  /**
   * Toggle measurement mode on/off
   */
  toggleMeasurementMode: function () {
    FormMeasureComponent.activeMeasurement = !FormMeasureComponent.activeMeasurement;

    if (FormMeasureComponent.activeMeasurement) {
      // Enable measuring mode
      FormMeasureComponent.startMeasuring();

      // Update button text
      const toggleButton = document.getElementById('toggle-measure');
      if (toggleButton) toggleButton.value = 'Stop Measuring';
    } else {
      // Disable measuring mode
      FormMeasureComponent.stopMeasuring();

      // Update button text
      const toggleButton = document.getElementById('toggle-measure');
      if (toggleButton) toggleButton.value = 'Start Measuring';
    }
  },

  /**
   * Start the measurement mode
   */
  startMeasuring: function () {
    // Clear any existing state
    FormMeasureComponent.clearState();

    // Add mouse move listener to detect vertices
    canvas.on('mouse:move', FormMeasureComponent.MeasureOnMouseMove);
    canvas.on('mouse:down', FormMeasureComponent.MeasureOnMouseClick);

    // Escape key to cancel measuring
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormMeasureComponent.cancelMeasure);

    // Change cursor to indicate measure mode
    canvas.defaultCursor = 'crosshair';
  },

  /**
   * Stop the measurement mode
   */
  stopMeasuring: function () {
    // Remove event listeners
    canvas.off('mouse:move', FormMeasureComponent.MeasureOnMouseMove);
    canvas.off('mouse:down', FormMeasureComponent.MeasureOnMouseClick);
    document.removeEventListener('keydown', FormMeasureComponent.cancelMeasure);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    // Reset cursor
    canvas.defaultCursor = 'default';

    // Clear measurement state
    FormMeasureComponent.clearState();
  },
  /**
   * Clear the measurement state
   */
  clearState: function () {
    // Clear first vertex
    FormMeasureComponent.firstVertex = null;

    // Clear any snap highlights
    FormMeasureComponent.clearSnapHighlight();

    // Clear dynamic line
    FormMeasureComponent.clearDynamicLine();

    // Clear dimension lines
    FormMeasureComponent.clearDimensionLines();
  },

  /**
   * Clear the dynamic line between first vertex and cursor
   */
  clearDynamicLine: function () {
    if (FormMeasureComponent.dynamicLine) {
      canvas.remove(FormMeasureComponent.dynamicLine);
      FormMeasureComponent.dynamicLine = null;
      canvas.renderAll();
    }
  },

  /**
   * Clear any dimension lines created for measurements
   */
  clearDimensionLines: function () {
    if (FormMeasureComponent.dimensionLines && FormMeasureComponent.dimensionLines.length > 0) {
      FormMeasureComponent.dimensionLines.forEach(obj => {
        canvas.remove(obj);
      });
      FormMeasureComponent.dimensionLines = [];
      canvas.renderAll();
    }
  },
  /**
   * Handle mouse move during measurement
   */
  MeasureOnMouseMove: function (event) {
    const pointer = canvas.getPointer(event.e);

    // Check for vertices near the pointer
    FormMeasureComponent.checkForSnapTargets(pointer);

    // If we have a first vertex selected, draw a line to the current pointer
    if (FormMeasureComponent.firstVertex) {
      // Remove any existing dynamic line
      FormMeasureComponent.clearDynamicLine();

      // Create a new dynamic line from first vertex to pointer
      FormMeasureComponent.dynamicLine = new fabric.Line(
        [
          FormMeasureComponent.firstVertex.x,
          FormMeasureComponent.firstVertex.y,
          pointer.x,
          pointer.y
        ],
        {
          stroke: '#FF00FF', // Magenta to match first vertex highlight
          strokeWidth: 2 / canvas.getZoom(),
          strokeDashArray: [5, 5], // Dashed line
          selectable: false,
          evented: false
        }
      );

      // Add the line to the canvas
      canvas.add(FormMeasureComponent.dynamicLine);
      canvas.renderAll();
    }
  },
  /**
   * Handle mouse click during measurement
   */
  MeasureOnMouseClick: function (event) {
    if (event.e.button !== 0 && event.e.type !== 'touchend') return;

    // clear selected objects to avoid interference
    canvas.discardActiveObject();

    // If we have a snap target, use that vertex
    if (FormMeasureComponent.snapTarget) {
      // If this is the first click, store the vertex
      if (!FormMeasureComponent.firstVertex) {
        FormMeasureComponent.firstVertex = {
          x: FormMeasureComponent.snapTarget.vertex.x,
          y: FormMeasureComponent.snapTarget.vertex.y,
          label: FormMeasureComponent.snapTarget.vertex.label,
          objectId: FormMeasureComponent.snapTarget.object.canvasID
        };

        // Keep the highlight for the first vertex
        // But create a new one with a different color
        FormMeasureComponent.clearSnapHighlight();
        FormMeasureComponent.addFirstVertexHighlight();
      }      
      // If this is the second click, calculate and display measurement
      else {
        // Clear the dynamic line when second vertex is clicked
        FormMeasureComponent.clearDynamicLine();

        const secondVertex = {
          x: FormMeasureComponent.snapTarget.vertex.x,
          y: FormMeasureComponent.snapTarget.vertex.y,
          label: FormMeasureComponent.snapTarget.vertex.label,
          objectId: FormMeasureComponent.snapTarget.object.canvasID
        };

        // Calculate delta
        const deltaX = Math.round(secondVertex.x - FormMeasureComponent.firstVertex.x);
        const deltaY = Math.round(secondVertex.y - FormMeasureComponent.firstVertex.y);
        const distance = Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY));

        // Create dimension lines to visualize the measurement
        FormMeasureComponent.createDimensionLines(
          FormMeasureComponent.firstVertex,
          secondVertex,
          deltaX,
          deltaY,
          distance
        );

        // Display measurement using the context menu text box
        const measurementText =
          ` Measurement Results:
          ΔX: ${deltaX}mm
          ΔY: ${deltaY}mm
          Distance: ${distance}mm
          
          From: ${FormMeasureComponent.firstVertex.label} (Object #${FormMeasureComponent.firstVertex.objectId})
          To: ${secondVertex.label} (Object #${secondVertex.objectId})
          
          (Press Enter to continue)
        `;        
        // Clear first vertex highlight
        FormMeasureComponent.firstVertex = null;
        
        // Show measurement result and wait for Enter key
        showTextBox(measurementText, ' ', 'keydown', function handleKeyPress(event) {
          if (event.key === 'Enter') {
            hideTextBox();

            // First clear all dimension lines
            FormMeasureComponent.clearDimensionLines();

            // Then reset for the next measurement after user presses Enter
            FormMeasureComponent.clearState();

            // Make sure dynamic line is fully cleared
            FormMeasureComponent.clearDynamicLine();

            document.removeEventListener('keydown', handleKeyPress);

            // Force a final render to ensure clean canvas
            canvas.renderAll();
          }
        });
      }
    }
  },

  /**
   * Cancel measurement with Escape key
   */
  cancelMeasure: function (event) {
    if (event.key === 'Escape') {
      FormMeasureComponent.clearState();

      // If escape is pressed when the tool is active, deactivate it
      if (FormMeasureComponent.activeMeasurement) {
        FormMeasureComponent.toggleMeasurementMode();
      }
    }
  },
  /**
   * Check for vertices near the pointer position
   */
  checkForSnapTargets: function (pointer) {
    // Clear any existing snap highlight
    FormMeasureComponent.clearSnapHighlight();
    FormMeasureComponent.snapTarget = null;

    // Check all canvas objects for potential snap targets
    let closestDistance = FormMeasureComponent.snapThreshold;
    let closestVertex = null;
    let closestObject = null;

    canvasObject.forEach(obj => {
      // Skip objects without basePolygon
      if (!obj.basePolygon || !obj.basePolygon.vertex) return;

      // Check each vertex
      obj.basePolygon.vertex.forEach(vertex => {
        const dx = vertex.x - pointer.x;
        const dy = vertex.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestVertex = vertex;
          closestObject = obj;
        }
      });
    });

    // If we found a vertex within threshold, highlight it and change cursor
    if (closestVertex) {
      FormMeasureComponent.snapTarget = {
        object: closestObject,
        vertex: closestVertex
      };
      FormMeasureComponent.addSnapHighlight();

      // Change cursor to indicate vertex snap
      canvas.defaultCursor = 'pointer';
    } else {
      // Reset to default measure cursor when not near a vertex
      canvas.defaultCursor = 'crosshair';
    }
  },

  /**
   * Add highlight to the current snap target
   */
  addSnapHighlight: function () {
    if (FormMeasureComponent.snapTarget) {
      // Match the circle size with the vertex control size
      const size = 20 + 5; // Use standard vertex control size plus padding
      const radius = size / 2;
      const zoomFactor = canvas.getZoom() || 1;

      // Create a hollow circle to indicate snap target
      FormMeasureComponent.snapHighlight = new fabric.Circle({
        left: FormMeasureComponent.snapTarget.vertex.x,
        top: FormMeasureComponent.snapTarget.vertex.y,
        radius: radius / zoomFactor,
        fill: 'transparent',
        stroke: '#FFFF00', // Yellow for current snap target
        strokeWidth: 2 / zoomFactor,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      });

      // Add the highlight to the canvas
      canvas.add(FormMeasureComponent.snapHighlight);
      canvas.renderAll();
    }
  },

  /**
   * Add highlight for the first selected vertex
   */
  addFirstVertexHighlight: function () {
    if (FormMeasureComponent.firstVertex) {
      // Match the circle size with the vertex control size
      const size = 20 + 5; // Use standard vertex control size plus padding
      const radius = size / 2;
      const zoomFactor = canvas.getZoom() || 1;

      // Create a hollow circle to indicate first vertex
      FormMeasureComponent.firstVertexHighlight = new fabric.Circle({
        left: FormMeasureComponent.firstVertex.x,
        top: FormMeasureComponent.firstVertex.y,
        radius: radius / zoomFactor,
        fill: 'transparent',
        stroke: '#FF00FF', // Magenta for first vertex
        strokeWidth: 2 / zoomFactor,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      });

      // Add the highlight to the canvas
      canvas.add(FormMeasureComponent.firstVertexHighlight);
      canvas.renderAll();
    }
  },

  /**
   * Clear all snap highlights
   */
  clearSnapHighlight: function () {
    if (FormMeasureComponent.snapHighlight) {
      canvas.remove(FormMeasureComponent.snapHighlight);
      FormMeasureComponent.snapHighlight = null;
    }

    if (FormMeasureComponent.firstVertexHighlight) {
      canvas.remove(FormMeasureComponent.firstVertexHighlight);
      FormMeasureComponent.firstVertexHighlight = null;
    }

    canvas.renderAll();
  },  /**
   * Create dimension lines to visualize the measurement
   */
  createDimensionLines: function (point1, point2, deltaX, deltaY, distance) {
    // Initialize the array if it doesn't exist
    if (!FormMeasureComponent.dimensionLines) {
      FormMeasureComponent.dimensionLines = [];
    }

    // Clear any existing dimension lines
    FormMeasureComponent.clearDimensionLines();

    // Fixed offset distances for engineering dimension style (matching draw.js)
    const offsetDistance = 30; // Fixed pixel offset for dimension line

    // Scale adjustments based on zoom
    const zoom = canvas.getZoom() || 1;
    const lineWidth = 1 / zoom;         // Thinner lines for engineering style
    const fontSize = 15 / zoom;         // Fixed 15px font size
    const arrowSize = 12 / zoom;        // Size of dimension arrows
    const extensionLineLength = 8 / zoom; // Length of extension lines

    // Add X dimension line if there's a horizontal difference
    if (Math.abs(deltaX) > 0) {
      // Position of dimension line, offset from point1
      const dimLineY = point1.y - offsetDistance / zoom;

      // Extension lines (vertical lines from points to dimension line)
      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [point1.x, point1.y, point1.x, dimLineY - extensionLineLength],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [point2.x, point2.y, point2.x, dimLineY - extensionLineLength],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      // Main dimension line
      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [point1.x, dimLineY, point2.x, dimLineY],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      // Add arrow endpoints
      FormMeasureComponent.addArrow(point1.x, dimLineY, 'right', 'green', arrowSize);
      FormMeasureComponent.addArrow(point2.x, dimLineY, 'left', 'green', arrowSize);

      // Calculate the midpoint for dimension text
      const midX = (point1.x + point2.x) / 2;

      // Dimension text
      FormMeasureComponent.dimensionLines.push(new fabric.Text(
        `${deltaX}mm`,
        {
          left: midX,
          top: dimLineY - (25 / zoom),
          fontSize: fontSize,
          fill: 'green',
          fontFamily: 'Arial',
          textAlign: 'center',
          originX: 'center',
          originY: 'bottom',
          selectable: false,
          evented: false,
          stroke: '#fff',
          strokeWidth: 3 / zoom,
          paintFirst: 'stroke'
        }
      ));
    }

    // Add Y dimension line if there's a vertical difference
    if (Math.abs(deltaY) > 0) {
      // Position of dimension line, offset from point1
      const dimLineX = point1.x - offsetDistance / zoom;

      // Extension lines (horizontal lines from points to dimension line)
      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [point1.x, point1.y, dimLineX - extensionLineLength, point1.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [point2.x, point2.y, dimLineX - extensionLineLength, point2.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      // Main dimension line
      FormMeasureComponent.dimensionLines.push(new fabric.Line(
        [dimLineX, point1.y, dimLineX, point2.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          evented: false
        }
      ));

      // Add arrow endpoints
      FormMeasureComponent.addArrow(dimLineX, point1.y, 'down', 'red', arrowSize);
      FormMeasureComponent.addArrow(dimLineX, point2.y, 'up', 'red', arrowSize);

      // Calculate the midpoint for dimension text
      const midY = (point1.y + point2.y) / 2;

      // Dimension text
      FormMeasureComponent.dimensionLines.push(new fabric.Text(
        `${deltaY}mm`,
        {
          left: dimLineX - 15 / zoom,
          top: midY,
          fontSize: fontSize,
          fill: 'red',
          fontFamily: 'Arial',
          textAlign: 'center',
          originX: 'center',
          originY: 'center',
          angle: -90, // Rotate for Y dimension
          selectable: false,
          evented: false,
          stroke: '#fff',
          strokeWidth: 3 / zoom,
          paintFirst: 'stroke'
        }
      ));
    }

    // Add all dimension lines to canvas
    FormMeasureComponent.dimensionLines.forEach(obj => {
      canvas.add(obj);
    });

    canvas.renderAll();
  },

  /**
   * Helper method to add arrow endpoints to dimension lines
   */
  addArrow: function (x, y, direction, color, size) {
    let points;

    switch (direction) {
      case 'right':
        points = [
          { x: x, y: y },
          { x: x + size, y: y - size / 4 },
          { x: x + size, y: y + size / 4 }
        ];
        break;
      case 'left':
        points = [
          { x: x, y: y },
          { x: x - size, y: y - size / 4 },
          { x: x - size, y: y + size / 4 }
        ];
        break;
      case 'up':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y - size },
          { x: x + size / 4, y: y - size }
        ];
        break;
      case 'down':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y + size },
          { x: x + size / 4, y: y + size }
        ];
        break;
    }

    // Convert points to fabric.js polygon format
    const fabricPoints = [];
    points.forEach(point => {
      fabricPoints.push({
        x: point.x,
        y: point.y
      });
    });

    // Create arrow polygon and add to dimension lines
    const arrow = new fabric.Polygon(fabricPoints, {
      fill: color,
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false
    });

    FormMeasureComponent.dimensionLines.push(arrow);
  },

  /**
   * Clean up when panel is closed
   */
  MeasureHandlerOff: function () {
    FormMeasureComponent.stopMeasuring();
  }
};

export { FormMeasureComponent };
