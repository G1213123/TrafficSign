
import { getCenterCoordinates } from '../utils.js';

export function handleObjectOnMouseMove(component, event) {\n  const objectKey = component.newTextObject ? 'newTextObject' : \n                     component.newSymbolObject ? 'newSymbolObject' : \n                     component.newMapObject ? 'newMapObject' : null;\n    \n  if (!objectKey || !component[objectKey] || !activeVertex) return;\n    \n  const pointer = canvas.getPointer(event.e);\n  const center = getCenterCoordinates();\n  // If we have an active vertex, let it handle the movement\n  if (activeVertex.handleMouseMoveRef) {\n    // Simulate a mouse move event with the current pointer\n    const simulatedEvent = {\n      e: event.e,\n      pointer: pointer\n    };\n    activeVertex.handleMouseMoveRef(simulatedEvent);\n  } else {\n    // Fallback direct positioning if vertex control isn't active\n    component[objectKey].set({\n      left: pointer.x + center.x - canvas.width /2 ,\n      top: pointer.y + center.y - canvas.height /2\n    });\n    component[objectKey].setCoords();\n    canvas.renderAll();\n  }\n}\n  \nexport function handleObjectOnMouseClick(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {\n  if (event.e.button !== 0) return;\n    \n  // Complete the placement if we have an active object\n  if (component[objectKey]) {\n    // Complete the placement\n    if (activeVertex) {\n      activeVertex.handleMouseDownRef(event);\n    }\n\n    // Clean up\n    canvas.off('mouse:move', component[mouseMoveHandlerName]);\n    canvas.off('mouse:down', component[mouseClickHandlerName]);\n    canvas.discardActiveObject();\n\n    // Reset state\n    component[objectKey].isTemporary = false;\n    component[objectKey] = null;\n    activeVertex = null;\n\n    // Reattach default keyboard event listener\n    document.removeEventListener('keydown', component[cancelHandlerName]);\n    document.addEventListener('keydown', ShowHideSideBarEvent);\n\n    canvas.renderAll();\n  }\n}\n  \nexport function handleCancelWithEscape(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName) {\n  if (event.key === 'Escape') {\n    // If there's a newly created object being placed, delete it\n    if (component[objectKey] && canvas.contains(component[objectKey])) {\n      component[objectKey].deleteObject();\n      component[objectKey] = null;\n    }\n\n    // Clean up active vertex if there is one\n    if (activeVertex) {\n      activeVertex.cleanupDrag();\n      activeVertex = null;\n    }\n\n    // Restore event listeners\n    canvas.off('mouse:move', component[mouseMoveHandlerName]);\n    canvas.off('mouse:down', component[mouseClickHandlerName]);\n    document.removeEventListener('keydown', component.cancelInput || component.cancelDraw);\n    document.addEventListener('keydown', ShowHideSideBarEvent);\n\n    canvas.renderAll();\n  }\n}\n  \nexport function genericHandlerOff(component, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {\n  // If there's a new object being placed, finalize its placement\n  if (component[objectKey]) {\n    if (activeVertex) {\n      activeVertex.finishDrag();\n    }\n    component[objectKey] = null;\n  }\n\n  // Remove event listeners\n  canvas.off('mouse:move', component[mouseMoveHandlerName]);\n  canvas.off('mouse:down', component[mouseClickHandlerName]);\n  document.removeEventListener('keydown', component[cancelHandlerName]);\n  document.addEventListener('keydown', ShowHideSideBarEvent);\n\n  canvas.renderAll();\n}


  if (!objectKey || !component[objectKey] || !activeVertex) return;

  const pointer = canvas.getPointer(event.e);
  const center = getCenterCoordinates();
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
    component[objectKey].set({
      left: pointer.x + center.x - canvas.width / 2,
      top: pointer.y + center.y - canvas.height / 2
    });
    component[objectKey].setCoords();
    canvas.renderAll();
  }
}

export function handleObjectOnMouseClick(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {
  if (event.e.button !== 0) return;

  // Complete the placement if we have an active object
  if (component[objectKey]) {
    // Complete the placement
    if (activeVertex) {
      activeVertex.handleMouseDownRef(event);
    }

    // Clean up
    canvas.off('mouse:move', component[mouseMoveHandlerName]);
    canvas.off('mouse:down', component[mouseClickHandlerName]);
    canvas.discardActiveObject();

    // Reset state
    component[objectKey].isTemporary = false;
    component[objectKey] = null;
    activeVertex = null;

    // Reattach default keyboard event listener
    document.removeEventListener('keydown', component[cancelHandlerName]);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    canvas.renderAll();
  }
}

export function handleCancelWithEscape(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName) {
  if (event.key === 'Escape') {
    // If there's a newly created object being placed, delete it
    if (component[objectKey] && canvas.contains(component[objectKey])) {
      component[objectKey].deleteObject();
      component[objectKey] = null;
    }

    // Clean up active vertex if there is one
    if (activeVertex) {
      activeVertex.cleanupDrag();
      activeVertex = null;
    }

    // Restore event listeners
    canvas.off('mouse:move', component[mouseMoveHandlerName]);
    canvas.off('mouse:down', component[mouseClickHandlerName]);
    document.removeEventListener('keydown', component.cancelInput || component.cancelDraw);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    canvas.renderAll();
  }
}

export function genericHandlerOff(component, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {
  // If there's a new object being placed, finalize its placement
  if (component[objectKey]) {
    if (activeVertex) {
      activeVertex.finishDrag();
    }
    component[objectKey] = null;
  }

  // Remove event listeners
  canvas.off('mouse:move', component[mouseMoveHandlerName]);
  canvas.off('mouse:down', component[mouseClickHandlerName]);
  document.removeEventListener('keydown', component[cancelHandlerName]);
  document.addEventListener('keydown', ShowHideSideBarEvent);

  canvas.renderAll();
}