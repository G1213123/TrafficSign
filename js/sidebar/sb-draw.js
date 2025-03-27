/* Draw Symbol Panel */
let FormDrawAddComponent = {
  symbolAngle: 0,
  newSymbolObject: null,

  drawPanelInit: async function () {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for basic symbol parameters
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, null, 'input')
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', FormDrawAddComponent.addAllSymbolsButton)

      // Create a container for angle controls
      var angleControlContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      // Replace slider with two rotate buttons:
      var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, angleControlContainer);

      var btnRotateLeft = GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var btnRotateRight = GeneralHandler.createButton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var angleDisplay = GeneralHandler.createNode("div", { 'id': 'angle-display', 'class': 'angle-display' }, angleContainer);
      angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';

      FormDrawAddComponent.addAllSymbolsButton()
    }
  },

  addAllSymbolsButton: function () {
    const parent = document.getElementById("input-form");
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
    // Clear any existing symbol containers
    const existingSymbolContainers = parent.querySelectorAll('.symbol-container');
    if (existingSymbolContainers.length > 0) {
      existingSymbolContainers.forEach(container => {
        container.remove();
      });
    }
    Object.keys(symbolsTemplate).forEach(async (symbol) => {
      const svg = await FormDrawAddComponent.createButtonSVG(symbol, 5, color)
      GeneralHandler.createSVGButton(`button-${symbol}`, svg, parent, 'symbol', FormDrawAddComponent.createSymbolObject, 'click')
    })
  },

  setAngle: function (event) {
    if (event.currentTarget.id.search('left') > -1) {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle - 45
    } else {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle + 45
    }
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle > 90 ? -90 : FormDrawAddComponent.symbolAngle
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle < -90 ? +90 : FormDrawAddComponent.symbolAngle

    // Handle the angle selection
    document.getElementById('angle-display').innerText = FormDrawAddComponent.symbolAngle + '°';

    // Update the new symbol object if it exists
    if (FormDrawAddComponent.newSymbolObject) {
      FormDrawAddComponent.updateSymbolAngle(FormDrawAddComponent.newSymbolObject);
    }

    canvas.renderAll();
  },

  DrawHandlerOff: function (event) {
    // If there's a new symbol object being placed, finalize its placement
    if (FormDrawAddComponent.newSymbolObject) {
      if (activeVertex) {
        activeVertex.finishDrag();
      }
      FormDrawAddComponent.newSymbolObject = null;
    }

    // Remove any cursor objects
    cursor.forEachObject(function (o) { cursor.remove(o) })

    // Remove event listeners
    canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
    canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);
    document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    canvas.renderAll();
  },

  // Create a new symbol object directly instead of using cursor
  createSymbolObject: async function (event) {
    // Clear any previous symbol being placed
    if (FormDrawAddComponent.newSymbolObject) {
      canvas.remove(FormDrawAddComponent.newSymbolObject);
      FormDrawAddComponent.newSymbolObject = null;
    }

    // Remove event listeners
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormDrawAddComponent.cancelDraw);

    // Get symbol type and parameters from the button or defaults
    const symbolType = event.currentTarget.id.replace('button-', '');
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Account for any panning that has been done
    const vpt = CenterCoord();
    const actualCenterX = vpt.x;
    const actualCenterY = vpt.y;

    // Create the symbol directly
    const symbolObject = await drawSymbolDirectly(symbolType, {
      x: actualCenterX,
      y: actualCenterY,
      length: xHeight / 4,
      angle: FormDrawAddComponent.symbolAngle,
      color: color
    });

    // Store reference to the new symbol
    FormDrawAddComponent.newSymbolObject = symbolObject;

    // Add mouse event handlers for placement
    canvas.on('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
    canvas.on('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);

    // Activate the vertex control immediately to enable dragging and snapping
    if (symbolObject.controls && symbolObject.controls.V1) {
      activeVertex = symbolObject.controls.V1;
      activeVertex.isDown = true;
      activeVertex.originalPosition = {
        left: symbolObject.left,
        top: symbolObject.top
      };

      // Store vertex information
      const v1 = symbolObject.getBasePolygonVertex('V1');
      if (v1) {
        activeVertex.vertexOriginalPosition = {
          x: v1.x,
          y: v1.y
        };
        activeVertex.vertexOffset = {
          x: v1.x - symbolObject.left,
          y: v1.y - symbolObject.top
        };

        // Create indicator for the active vertex
        if (activeVertex.createIndicator) {
          activeVertex.createIndicator(v1.x, v1.y);
        }
      }
    }
  },

  // Helper function to update symbol angle
  updateSymbolAngle: async function (symbolObject) {
    if (!symbolObject) return;

    const symbolType = symbolObject.symbol;
    const xHeight = symbolObject.xHeight;
    const color = symbolObject.color;
    const position = {
      x: symbolObject.left,
      y: symbolObject.top
    };

    // Create new symbol with updated angle
    const newSymbolObject = await drawSymbolDirectly(symbolType, {
      x: position.x,
      y: position.y,
      length: xHeight / 4,
      angle: FormDrawAddComponent.symbolAngle,
      color: color
    });

    // Replace on canvas
    canvas.remove(symbolObject);
    FormDrawAddComponent.newSymbolObject = newSymbolObject;

    // Re-activate vertex control
    if (newSymbolObject.controls && newSymbolObject.controls.V1) {
      activeVertex = newSymbolObject.controls.V1;
      activeVertex.isDown = true;
      activeVertex.originalPosition = {
        left: newSymbolObject.left,
        top: newSymbolObject.top
      };

      // Store vertex information
      const v1 = newSymbolObject.getBasePolygonVertex('V1');
      if (v1) {
        activeVertex.vertexOriginalPosition = {
          x: v1.x,
          y: v1.y
        };
        activeVertex.vertexOffset = {
          x: v1.x - newSymbolObject.left,
          y: v1.y - newSymbolObject.top
        };

        // Create indicator for the active vertex
        if (activeVertex.createIndicator) {
          activeVertex.createIndicator(v1.x, v1.y);
        }
      }
    }
  },

  SymbolOnMouseMove: function (event) {
    if (FormDrawAddComponent.newSymbolObject && activeVertex) {
      const pointer = canvas.getPointer(event.e);

      // If we have an active vertex, let it handle the movement
      if (activeVertex.handleMouseMoveRef) {
        // Simulate a mouse move event with the current pointer
        const simulatedEvent = {
          e: event.e,
          pointer: pointer
        };
        activeVertex.handleMouseMoveRef(simulatedEvent);
      } else {
        // Fallback direct positioning if vertex control isn't active
        FormDrawAddComponent.newSymbolObject.set({
          left: pointer.x,
          top: pointer.y
        });
        FormDrawAddComponent.newSymbolObject.setCoords();
        canvas.renderAll();
      }
    }
  },

  SymbolOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    // Finalize symbol placement on click
    if (FormDrawAddComponent.newSymbolObject && event.e.button === 0) {
      // Complete the placement
      if (activeVertex) {
        activeVertex.handleMouseDownRef(event);
      }

      // Clean up
      canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
      canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);

      // Reset state
      const placedSymbol = FormDrawAddComponent.newSymbolObject;
      FormDrawAddComponent.newSymbolObject = null;
      activeVertex = null;

      // Reattach default keyboard event listener
      document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
      return placedSymbol;
    }
  },

  cancelDraw: function (event) {
    if (event.key === 'Escape') {
      // If there's a new symbol object being placed, remove it
      if (FormDrawAddComponent.newSymbolObject) {
        FormDrawAddComponent.newSymbolObject.deleteObject();
        FormDrawAddComponent.newSymbolObject = null;
      }

      // Clean up active vertex if there is one
      if (activeVertex) {
        activeVertex.cleanupDrag();
        activeVertex = null;
      }

      // Restore event listeners
      canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
      canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);
      document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
    }
  },

  createButtonSVG: async (symbolType, length, color = 'white') => {
    const symbolData = calcSymbol(symbolType, length, color);

    let pathData = await vertexToPath(symbolData, color);

    const svgWidth = 100;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const tempPath = new fabric.Path(pathData, { strokeWidth: 0 });
    let symbolSize = { width: tempPath.width, height: tempPath.height, left: tempPath.left, top: tempPath.top };
    // override the err width and height of symbol with circular border
    if (symbolType === 'MTR') {
      symbolSize.width = 130;
    }
    if (symbolType === 'Hospital') {
      symbolSize.width = color == 'White' ? 80 : 90;
    }
    const scaleX = svgWidth / symbolSize.width;
    const scaleY = svgHeight / symbolSize.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - symbolSize.width * scale) / 2 - symbolSize.left * scale;
    const translateY = (svgHeight - symbolSize.height * scale) / 2 - symbolSize.top * scale;

    pathData = pathData.replace(/<svg>/g, '<svg style="width:100;height:100;">')
    pathData = pathData.replace(/<path/g, `<path transform="translate(${translateX}, ${translateY}) scale(${scale})"`);
    return pathData;
  }
}

// Export the FormDrawAddComponent for use in other files