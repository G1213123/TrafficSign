import React, { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import { CanvasGlobals } from "../canvas/canvas.js";
import { cursorClickMode } from "./contexMenu.js";
import { ShowHideSideBarEvent } from "../../lib/canvas/keyboardEvents.js";
import { i18n } from '../../lib/i18n/i18n.js';

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
  version: 0,
  listeners: new Set(),

  notify() {
    this.version += 1;
    this.listeners.forEach((listener) => listener());
  },

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  },

  getSnapshot() {
    return this.version;
  },
  
  show(text, withAnswerBox, unit, xHeight, resolve, reject) {
    this.text = text;
    this.withAnswerBox = withAnswerBox;
    this.unit = unit;
    this.xHeight = xHeight;
    this.resolve = resolve;
    this.reject = reject;
    this.isVisible = true;
    this.notify();
  },
  
  hide() {
    this.isVisible = false;
    this.notify();
  },
  
  setPosition(x, y) {
    this.position = { x, y };
    this.notify();
  }
};

const canvas = CanvasGlobals.canvas; // Access the global canvas object

const promptBoxStyles = {
  container: {
    position: 'absolute',
    zIndex: 2000,
    background: '#f5e9ad',
    border: '2px solid #000',
    color: '#000',
    padding: '8px 10px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    width: 'min(320px, calc(100vw - 20px))',
    maxWidth: '320px',
    boxSizing: 'border-box',
  },
  textBox: {
    marginBottom: '6px',
    color: '#000',
    lineHeight: 1.35,
    maxWidth: '100%',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  },
  answerWrapper: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  input: {
    display: 'block',
    background: '#f8efbf',
    color: '#000',
    border: '1px solid #000',
    borderRadius: '3px',
    padding: '6px 8px',
    minWidth: '160px',
    boxSizing: 'border-box',
  },
  unit: {
    marginLeft: '5px',
    color: '#000',
  },
  actionButton: {
    background: '#f8efbf',
    color: '#000',
    border: '1px solid #000',
    borderRadius: '3px',
    padding: '6px 10px',
    cursor: 'pointer',
  },
};

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
  document.removeEventListener('keydown', ShowHideSideBarEvent);
  return new Promise((resolve, reject) => {
    promptBoxState.show(text, withAnswerBox, unit, xHeight, resolve, reject);
  });
}

export function hideTextBox() {
  promptBoxState.hide();
  // Restore sidebar toggle event after a delay as per original implementation
  setTimeout(() => {
    document.addEventListener('keydown', ShowHideSideBarEvent);
  }, 1000);
}

export function selectObjectHandler(text, callback, options = null, xHeight = null, unit = 'mm',
  skipTextBox = true, requiredTypes = null) {
  
  // Show prompt message near cursor without answer box
  promptBoxState.show(text || 'Select object(s)', null, unit, xHeight, () => {}, () => {});
  
  // Pause sidebar toggle while prompt is visible
  document.removeEventListener('keydown', ShowHideSideBarEvent);

  const matchesRequiredType = (obj) => {
    if (!requiredTypes) return true;
    if (Array.isArray(requiredTypes)) return requiredTypes.includes(obj.functionalType);
    return obj.functionalType === requiredTypes;
  };

  let isDragging = false;
  let processed = false;
  let dragDebounceTimer = null;

  const onMouseUp = () => {
    isDragging = false;
    if (dragDebounceTimer) clearTimeout(dragDebounceTimer);
    dragDebounceTimer = setTimeout(checkSelection, 100);
  };

  const onMouseDown = () => {
    isDragging = true;
  };

  const cleanup = () => {
    if (processed) return;
    processed = true;
    document.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mouseup', onMouseUp);
    promptBoxState.hide();
    document.addEventListener('keydown', ShowHideSideBarEvent);
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
  useSyncExternalStore(
    (listener) => promptBoxState.subscribe(listener),
    () => promptBoxState.getSnapshot(),
    () => promptBoxState.getSnapshot()
  );
  const [inputValue, setInputValue] = useState('');
  const boxRef = useRef(null);
  const inputRef = useRef(null);

  const visible = promptBoxState.isVisible;
  const pos = promptBoxState.position;

  useEffect(() => {
    if (visible && promptBoxState.withAnswerBox !== null) {
      setInputValue(promptBoxState.withAnswerBox);
      setTimeout(() => inputRef.current?.focus(), 0);
      setTimeout(() => inputRef.current?.select(), 0);
    }
  }, [visible]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      let xOffset = 10;
      let yOffset = 10;

      if (visible && boxRef.current) {
        const boxWidth = boxRef.current.offsetWidth;
        const boxHeight = boxRef.current.offsetHeight;

        if (e.clientX + xOffset + boxWidth > window.innerWidth) {
          xOffset = -boxWidth - 10;
        }
        if (e.clientY + yOffset + boxHeight > window.innerHeight) {
          yOffset = -boxHeight - 10;
        }
      }
      
      promptBoxState.setPosition(e.clientX + xOffset, e.clientY + yOffset);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [visible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      promptBoxState.resolve(inputValue);
      hideTextBox();
    } else if (e.key === 'Escape') {
      promptBoxState.reject(new Error('Cancelled'));
      hideTextBox();
    }
  };

  const handleInputBlur = () => {
    if (!visible || promptBoxState.withAnswerBox === null) return;
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleEnterClick = () => {
    promptBoxState.resolve(inputValue);
    hideTextBox();
  };

  const handleCancelClick = () => {
    promptBoxState.reject(new Error('Cancelled'));
    hideTextBox();
  };

  if (!visible) return null;

  return (
    <div 
      ref={boxRef}
      id="cursorBoxContainer" 
      style={{ ...promptBoxStyles.container, top: pos.y, left: pos.x }}
    >
      <div 
        id="cursorTextBox" 
        dangerouslySetInnerHTML={{ __html: emphasizePromptText(promptBoxState.text) }}
        style={promptBoxStyles.textBox}
      />
      
      {promptBoxState.withAnswerBox !== null && (
        <div id="cursorAnswerWrapper" style={promptBoxStyles.answerWrapper}>
          <input 
            ref={inputRef}
            id="cursorAnswerBox"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onFocus={() => inputRef.current?.select()}
            style={promptBoxStyles.input}
          />
          {promptBoxState.xHeight !== null && (
            <span id="unit-display" style={promptBoxStyles.unit}>{promptBoxState.unit}</span>
          )}
          {window.innerWidth <= 600 && (
            <>
              <button onClick={handleEnterClick} id="cursorEnterButton" style={promptBoxStyles.actionButton}>Enter</button>
              <button onClick={handleCancelClick} id="cursorCancelButton" style={promptBoxStyles.actionButton}>Cancel</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
