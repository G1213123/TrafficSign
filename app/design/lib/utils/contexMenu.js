import React, { useState, useRef, useEffect } from 'react';
import { showPropertyPanel } from './property.js'; // Import showPropertyPanel
import { CanvasGlobals } from "../canvas/canvas.js"; // Import CanvasGlobals

// Context menu state management
export const menuState = {
  isVisible: false,
  position: { x: 0, y: 0 },
  selectedArrow: null,
  setCordinate: (x, y) => {
    menuState.position = { x, y };
  },
  setVisible: (visible) => {
    menuState.isVisible = visible;
  },
  setSelectedArrow: (obj) => {
    menuState.selectedArrow = obj;
  }
};

// Context menu
let cursorClickMode = 'normal'; // Default click mode

function clickModelHandler(event) {
  const canvas = CanvasGlobals.canvas; // Access the global canvas object inside the handler
  if (!canvas) return;

  switch (cursorClickMode) {
    case 'normal': {
      if (event.e.button === 2 && event.target) { // Right click
        event.e.preventDefault();
        menuState.setCordinate(event.e.clientX, event.e.clientY);
        menuState.setSelectedArrow(event.target);
        menuState.setVisible(true);
      } else {
        menuState.setVisible(false);
      }
    }
      break;
    case 'select': {
      if (event.e.button === 0 && event.target) {
        menuState.setSelectedArrow(event.target);
        cursorClickMode = 'normal';
        menuState.setVisible(false); // Ensure context menu is hidden
      }
    }
      break;
  }
}

export function setupContextMenu(canvas) {

  canvas.on('mouse:down', function (event) {
    clickModelHandler(event);
  });

}


//document.addEventListener('contextmenu', function (event) {
//  event.preventDefault();
//});


// Add handlers for context-menu actions
function handleDeleteObject() {
  menuState.setVisible(false);
  const obj = menuState.selectedArrow;
  if (obj && typeof obj.deleteObject === 'function') {
    obj.deleteObject(null, { target: obj });
  }
}

function handleEditObject() {
  menuState.setVisible(false);
  const obj = menuState.selectedArrow;
  if (obj) {
    showPropertyPanel(obj);
  }
}

export default function ContextMenu() {
  const [visible, setVisible] = useState(menuState.isVisible);
  const [pos, setPos] = useState(menuState.position);
  const [openLeft, setOpenLeft] = useState(false);
  const menuRef = useRef(null);
  const pivotRef = useRef(null);

  // Simple polling or event-based update for the demo
  // In a real app, you'd use a state management lib or a custom event
  useEffect(() => {
    const interval = setInterval(() => {
      if (visible !== menuState.isVisible) setVisible(menuState.isVisible);
      if (pos.x !== menuState.position.x || pos.y !== menuState.position.y) {
        setPos(menuState.position);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [visible, pos]);

  const handlePivotMouseEnter = () => {
    if (!pivotRef.current) return;
    
    // Use requestAnimationFrame to ensure the submenu is rendered/visible if CSS handles it
    requestAnimationFrame(() => {
      const submenu = pivotRef.current.querySelector('.context-submenu');
      if (submenu) {
        const rect = submenu.getBoundingClientRect();
        if (rect.right > window.innerWidth - 4) {
          setOpenLeft(true);
        } else {
          setOpenLeft(false);
        }
      }
    });
  };

  if (!visible) return null;

  return (
    <div 
      ref={menuRef}
      id="context-menu" 
      style={{ 
        position: 'absolute', 
        top: pos.y, 
        left: pos.x, 
        display: 'block',
        zIndex: 1000 
      }}
    >
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, background: 'white', border: '1px solid black' }}>
        <li id="set-anchor" data-i18n="Set Anchor">Set Anchor</li>
        <li 
          id="pivot-anchor" 
          ref={pivotRef} 
          onMouseEnter={handlePivotMouseEnter}
          className={openLeft ? 'open-left' : ''}
        >
          <span data-i18n="Pivot Anchor">Pivot Anchor</span>
          <ul className="context-submenu">
            <li id="pivot-anchor-x" data-i18n="X-axis">X-axis</li>
            <li id="pivot-anchor-y" data-i18n="Y-axis">Y-axis</li>
            <li id="pivot-anchor-both" data-i18n="Both">Both</li>
          </ul>
        </li>
        <li id="edit-object" data-i18n="Edit" onClick={handleEditObject} style={{ cursor: 'pointer' }}>Edit</li>
        <li id="delete-object" data-i18n="Delete" onClick={handleDeleteObject} style={{ cursor: 'pointer' }}>Delete</li>
        <li id="property" data-i18n="Property">Property</li>
      </ul>
    </div>
  )
};

export { cursorClickMode }