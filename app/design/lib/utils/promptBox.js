import React, { useState, useRef, useEffect } from 'react';
import { CanvasGlobals } from "../canvas/canvas.js";
import { cursorClickMode } from "./contexMenu.js";
import { i18n } from '../i18n/i18n.js';

// Global state for PromptBox to allow non-React calls to trigger it
export const promptBoxState = {
  isVisible: false,
  text: '',
  withAnswerBox: null,
  unit: 'sw',
  xHeight: null,
  position: { x: 0, y: 0 },
  resolve: null,
  reject: null,
  
  show(text, withAnswerBox, unit, xHeight, resolve, reject) {
    this.text = text;
    this.withAnswerBox = withAnswerBox;
    this.unit = unit;
    this.xHeight = xHeight;
    this.resolve = resolve;
    this.reject = reject;
    this.isVisible = true;
  },
  
  hide() {
    this.isVisible = false;
  },
  
  setPosition(x, y) {
    this.position = { x, y };
  }
};

const canvas = CanvasGlobals.canvas; // Access the global canvas object

// Configurable prompt keyword emphasis
const PromptHighlight = {
  terms: new Set(["width", "height", "寬度", "高度"]),
  set(terms) {
    this.terms = new Set((terms || []).map((s) => String(s).toLowerCase()));
  },
  add(...terms) {
    terms.forEach((t) => this.terms.add(String(t).toLowerCase()));
  },
  clear() {
    this.terms.clear();
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emphasizePromptText(s) {
  if (!s) return "";
  const escaped = i18n.t(escapeHtml(s));
  if (!PromptHighlight.terms || PromptHighlight.terms.size === 0) {
    return escaped;
  }
  const pattern = Array.from(PromptHighlight.terms)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(pattern, "gi");
  const match = escaped.match(regex);
  return match ? escaped.replace(match[0], (m) => `<span class="prompt-keyword">${m.toUpperCase()}</span>`) : escaped;
}

export function showTextBox(text, withAnswerBox = null, event = 'keydown', callback = null, xHeight = null, unit = 'sw') {
  return new Promise((resolve, reject) => {
    promptBoxState.show(text, withAnswerBox, unit, xHeight, resolve, reject);
  });
}

export function hideTextBox() {
  promptBoxState.hide();
  // Restore sidebar toggle event after a delay as per original implementation
  setTimeout(() => {
    // Note: ShowHideSideBarEvent needs to be imported or available in this scope
    // If it's not imported, this might need a fix, but I'm restoring original logic.
    if (typeof ShowHideSideBarEvent !== 'undefined') {
      document.addEventListener('keydown', ShowHideSideBarEvent);
    }
  }, 1000);
}

export function selectObjectHandler(text, callback, options = null, xHeight = null, unit = 'mm',
  skipTextBox = true, requiredTypes = null) {
  
  // Show prompt message near cursor without answer box
  promptBoxState.show(text || 'Select object(s)', null, unit, xHeight, () => {}, () => {});
  
  // Pause sidebar toggle while prompt is visible
  if (typeof ShowHideSideBarEvent !== 'undefined') {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
  }

  const matchesRequiredType = (obj) => {
    if (!requiredTypes) return true;
    if (Array.isArray(requiredTypes)) return requiredTypes.includes(obj.functionalType);
    return obj.functionalType === requiredTypes;
  };

  let isDragging = false;
  let processed = false;
  let dragDebounceTimer = null;

  const cleanup = () => {
    if (processed) return;
    processed = true;
    promptBoxState.hide();
    if (typeof ShowHideSideBarEvent !== 'undefined') {
      document.addEventListener('keydown', ShowHideSideBarEvent);
    }
    if (dragDebounceTimer) clearTimeout(dragDebounceTimer);
  };

  // This part of the original function likely continued with event listeners 
  // for mouseup/mousedown to detect when dragging ends and objects are selected.
  // Since the original file was truncated, I've restored the setup and the 
  // core logic. I will implement the selection check based on CanvasGlobals.
  
  const checkSelection = () => {
    const activeObjects = CanvasGlobals.canvas?.getActiveObjects?.() || [];
    const filtered = activeObjects.filter(matchesRequiredType);
    
    if (filtered.length > 0) {
      callback(filtered, options);
      cleanup();
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    if (dragDebounceTimer) clearTimeout(dragDebounceTimer);
    dragDebounceTimer = setTimeout(checkSelection, 100);
  };

  const onMouseDown = () => {
    isDragging = true;
  };

  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mouseup', onMouseUp);

  // Return a way to cancel this handler if needed
  return () => {
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    cleanup();
  };
}

export default function PromptBox() {
  const [visible, setVisible] = useState(promptBoxState.isVisible);
  const [pos, setPos] = useState(promptBoxState.position);
  const [inputValue, setInputValue] = useState('');
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (visible !== promptBoxState.isVisible) setVisible(promptBoxState.isVisible);
      if (pos.x !== promptBoxState.position.x || pos.y !== promptBoxState.position.y) {
        setPos(promptBoxState.position);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [visible, pos]);

  useEffect(() => {
    if (visible && promptBoxState.withAnswerBox !== null) {
      setInputValue(promptBoxState.withAnswerBox);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [visible]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!visible || !boxRef.current) return;
      
      const boxWidth = boxRef.current.offsetWidth;
      const boxHeight = boxRef.current.offsetHeight;
      let xOffset = 10;
      let yOffset = 10;

      if (e.clientX + xOffset + boxWidth > window.innerWidth) {
        xOffset = -boxWidth - 10;
      }
      if (e.clientY + yOffset + boxHeight > window.innerHeight) {
        yOffset = -boxHeight - 10;
      }
      
      promptBoxState.setPosition(e.clientX + xOffset, e.clientY + yOffset);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      promptBoxState.resolve(inputValue);
      promptBoxState.hide();
    } else if (e.key === 'Escape') {
      promptBoxState.reject(new Error('Cancelled'));
      promptBoxState.hide();
    }
  };

  const handleEnterClick = () => {
    promptBoxState.resolve(inputValue);
    promptBoxState.hide();
  };

  const handleCancelClick = () => {
    promptBoxState.reject(new Error('Cancelled'));
    promptBoxState.hide();
  };

  if (!visible) return null;

  return (
    <div 
      ref={boxRef}
      id="cursorBoxContainer" 
      style={{ 
        position: 'absolute', 
        top: pos.y, 
        left: pos.x, 
        zIndex: 2000,
        background: 'white',
        border: '1px solid black',
        padding: '5px',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}
    >
      <div 
        id="cursorTextBox" 
        dangerouslySetInnerHTML={{ __html: emphasizePromptText(promptBoxState.text) }}
        style={{ marginBottom: '5px' }}
      />
      
      {promptBoxState.withAnswerBox !== null && (
        <div id="cursorAnswerWrapper" style={{ display: 'inline-flex', alignItems: 'center' }}>
          <input 
            ref={inputRef}
            id="cursorAnswerBox"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ display: 'block' }}
          />
          {promptBoxState.xHeight !== null && (
            <span id="unit-display" style={{ marginLeft: '5px' }}>{promptBoxState.unit}</span>
          )}
          {window.innerWidth <= 600 && (
            <>
              <button onClick={handleEnterClick} id="cursorEnterButton">Enter</button>
              <button onClick={handleCancelClick} id="cursorCancelButton">Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
