'use client';

import React, { useState } from 'react';

import { StaticCanvas, Path, Group } from 'fabric';
import { calcSymbol, SymbolObject } from '../../lib/objects/symbols.js';
import { convertVertexToPathCommands, convertFontPathToFabricPath, getFontPath } from '../../lib/objects/path.js';
import { symbolsTemplate, symbolsTemplateAlt, symbolsPermittedAngle } from '../../lib/templates/symbolTemplate.js';
import { parsedFontMedium, parsedFontHeavy, parsedFontKorean } from "../../lib/objects/path.js";
import { CanvasGlobals } from '../canvas/canvas.js';
import { GeneralDrawSettings, useGeneralDrawSettings} from './DrawSettings.js';
import './sidebar.css';

const buttonSvgCache = new Map();

const createButtonSVG = (symbolType, length, color = 'white') => {
  const cacheKey = `${symbolType}|${length}|${String(color).toLowerCase()}`;
  if (buttonSvgCache.has(cacheKey)) {
    return buttonSvgCache.get(cacheKey);
  }

  const symbolData = calcSymbol(symbolType, length, color);

  // Define SVG dimensions for the button
  const svgWidth = 100;
  const svgHeight = 100;
  // Create a temporary canvas to measure and render the symbol
  const tempCanvas = new StaticCanvas(null, {
    width: svgWidth,
    height: svgHeight,
    enableRetinaScaling: false
  });

  // Create temporary path objects for each path in the symbol
  const pathObjects = [];

  // Process each path in the symbol data
  symbolData.path.forEach(path => {
    // Convert vertex data to path commands
    const pathCommands = convertVertexToPathCommands(path);

    // Create a Path object
    const pathObj = new Path(pathCommands, {
      fill: path.fill || color.toLowerCase(),
      stroke: 'none',
      strokeWidth: 0
    });

    pathObjects.push(pathObj);
  });

  // Process text elements if present
  if (symbolData.text && symbolData.text.length > 0) {
    symbolData.text.forEach(textElem => {
      let fontGlyphs;
      switch (textElem.fontFamily) {
        case 'TransportMedium':
          fontGlyphs = parsedFontMedium;
          break;
        case 'TransportHeavy':
          fontGlyphs = parsedFontHeavy;
          break;
        default:
          fontGlyphs = parsedFontKorean;
      }
      if (!fontGlyphs) {
        console.error(`Font glyphs not found for font family: ${textElem.fontFamily}`);
        return;
      }
      // Access font metrics
      const fontMetrics = {
        unitsPerEm: fontGlyphs.unitsPerEm,
        ascender: fontGlyphs.ascender,
        descender: fontGlyphs.descender,
      };

      // Scale metrics to desired font size
      const fontScale = textElem.fontSize / fontMetrics.unitsPerEm;
      const scaledAscender = (fontMetrics.unitsPerEm - fontMetrics.ascender) * fontScale;

      const yOffset = scaledAscender;
      textElem.y = textElem.y - yOffset;
      // Check for font path
      const charPath = getFontPath(textElem);
      if (charPath && charPath.commands) {
        // Convert font path commands to Path format
        const pathCommands = convertFontPathToFabricPath(charPath.commands, textElem);
        const textPathObj = new Path(pathCommands, {
          fill: textElem.fill || color.toLowerCase(),
          stroke: 'none',
          strokeWidth: 0
        });

        pathObjects.push(textPathObj);
      }
    });
  }

  // Create a group with all paths
  const group = new Group(pathObjects);

  // Center the group's origin to its own center for easier scaling and positioning
  group.set({
    originX: 'center',
    originY: 'center'
  });

  // Calculate dimensions for scaling
  const bounds = group.getBoundingRect();

  // Special case handling for specific symbols
  let symbolWidth = bounds.width;
  let symbolHeight = bounds.height;

  if (symbolType === 'MTR') {
    symbolWidth = 2750;
  }

  // Scale to fit within SVG dimensions
  const scaleX = svgWidth / symbolWidth;
  const scaleY = svgHeight / symbolHeight;
  const scale = Math.min(scaleX, scaleY);

  // Set the group's properties for centering and scaling
  group.set({
    left: svgWidth / 2,
    top: svgHeight / 2,
    scaleX: scale,
    scaleY: scale
  });

  // Add the group to the canvas
  tempCanvas.add(group);
  tempCanvas.renderAll();

  // Export as SVG string
  const svgString = tempCanvas.toSVG({
    width: svgWidth,
    height: svgHeight,
    viewBox: {
      x: 0,
      y: 0,
      width: svgWidth,
      height: svgHeight
    }
  });

  // Cleanup
  tempCanvas.dispose();

  buttonSvgCache.set(cacheKey, svgString);

  return svgString;
}

export default function DrawSymbolPanel({ canvas }) {
  const { xHeight, setXHeight, color, setColor } = useGeneralDrawSettings();
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [angle, setAngle] = useState(0);

  const handleRotate = (direction) => {
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !activeObject.symbolType) return;

    const permittedAngles = symbolsPermittedAngle[activeObject.symbolType] || [0];
    if (permittedAngles.length <= 1) return;

    const currentIndex = permittedAngles.indexOf(activeObject.angle);
    let nextIndex;

    if (direction === 'cw') {
      nextIndex = (currentIndex + 1) % permittedAngles.length;
    } else {
      nextIndex = (currentIndex - 1 + permittedAngles.length) % permittedAngles.length;
    }

    const newAngle = permittedAngles[nextIndex];
    activeObject.set('angle', newAngle);
    setAngle(newAngle);
    canvas.requestRenderAll();
  };

  const handleAddSymbol = (symbolType) => {
    if (!canvas) return;

    setSelectedSymbol(symbolType);
    
    // Reset angle to the first permitted value for the new symbol
    if (symbolsPermittedAngle[symbolType]) {
      setAngle(symbolsPermittedAngle[symbolType][0] || 0);
    }

    // Calculate center of viewport for placement
    const viewportCenter = canvas.getCenterPoint();

    const options = {
      xHeight: xHeight,
      color: color,
      angle: symbolsPermittedAngle[selectedSymbol] ? (symbolsPermittedAngle[selectedSymbol].length > 1 ? angle : 0) : 0,
      x: viewportCenter.x,
      y: viewportCenter.y
    };

    // Use the migrated legacy logic to create the object
    // Note: SymbolObject extends Group (via BaseGroup)
    const symbol = new SymbolObject({
      symbolType: symbolType,
      ...options
    });

    canvas.setActiveObject(symbol);

    // Immediate drag activation (Legacy behavior)
    symbol.enterFocusMode();
    
    const v2 = symbol.getBasePolygonVertex('E2');
    if (v2) {
      // We need to pass the cleanup callback to the VertexControl
      // Since VertexControl is created inside SymbolObject, we can't easily pass it to the constructor
      // unless we modify SymbolObject. Instead, we can manually assign it to the existing control.
      const vertexControl = symbol.controls.E2;
      
      if (vertexControl) {
        vertexControl.onCleanup = () => {
          setSelectedSymbol(null);
        };

        // Simulate a mouse click event to trigger the full VertexControl.onClick logic
        // This handles event listeners, focus mode, and drag state initialization
        vertexControl.onClick({
          button: 0,
          type: 'mousedown'
        });
      }
    }

    canvas.requestRenderAll();
  };

  return (
    <div className="space-y-4">
      <GeneralDrawSettings
        xHeight={xHeight}
        onXHeightChange={setXHeight}
        color={color}
        onColorChange={setColor}
      />

      <div className="input-group">
        {selectedSymbol && symbolsPermittedAngle[selectedSymbol] && symbolsPermittedAngle[selectedSymbol].length > 1 && (
          <div>
            <label className="input-label">Angle</label>
            <select
              className="input-field"
              value={angle}
              onChange={(e) => {
                const newAngle = parseInt(e.target.value) || 0;
                setAngle(newAngle);
                if (canvas) {
                  const activeObject = canvas.getActiveObject();
                  if (activeObject) activeObject.set('angle', newAngle);
                  canvas.requestRenderAll();
                }
              }}
            >
              {symbolsPermittedAngle[selectedSymbol].map((angleOption) => (
                <option key={angleOption} value={angleOption}>
                  {angleOption}°
                </option>
              ))}
            </select>
            <div className="flex gap-2 mt-2">
              <button 
                className="btn-small" 
                onClick={() => handleRotate('ccw')}
                title="Rotate Anti-Clockwise"
              >
                ↺
              </button>
              <button 
                className="btn-small" 
                onClick={() => handleRotate('cw')}
                title="Rotate Clockwise"
              >
                ↻
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="symbol-grid">
        {Object.keys(symbolsTemplate).map((symbolType) => {
          if (symbolType === 'Lozenge') return null;
          return (
            <div
              key={symbolType}
              className="symbol-item"
              onClick={() => handleAddSymbol(symbolType)}
              title={symbolType}
            >
              <div 
                className="symbol-svg-container" 
                dangerouslySetInnerHTML={{ __html: createButtonSVG(symbolType, xHeight, color) }} 
              />
              <hr className="symbol-separator" />
              <span className="symbol-label" data-i18n={symbolType}>
                {symbolType}
              </span>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
        Click a symbol to add it to the canvas
      </p>
    </div>
  );
}
