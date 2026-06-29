'use client';

import React, { useState } from 'react';

import { StaticCanvas, Path, Group } from 'fabric';
import { symbolsTemplate } from '../../lib/objects/template';
import { calcSymbol, SymbolObject } from '../../lib/objects/symbols';
import { convertVertexToPathCommands, convertFontPathToFabricPath, getFontPath } from '../../lib/objects/path.js';
import { parsedFontMedium, parsedFontHeavy, parsedFontKorean } from "../../lib/objects/path.js";
import './sidebar.css';

const createButtonSVG =  (symbolType, length, color = 'white') => {
    const symbolData =  calcSymbol(symbolType, length, color);

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
    const group = new Group(pathObjects, {
      left: 0,
      top: 0
    });
    // Calculate dimensions for scaling
    const bounds = group.getBoundingRect();

    // Special case handling for specific symbols
    let symbolWidth = bounds.width;
    let symbolHeight = bounds.height;

    if (symbolType === 'MTR') {
      symbolWidth = 130;
    }
    if (symbolType === 'Hospital') {
      symbolWidth = color == 'White' ? 80 : 90;
    }

    // Scale to fit within SVG dimensions
    const scaleX = svgWidth / symbolWidth;
    const scaleY = svgHeight / symbolHeight;
    const scale = Math.min(scaleX, scaleY);

    // Set the group's properties for centering and scaling
    group.set({
      left: (svgWidth - symbolWidth * scale) / 2,
      top: (svgHeight - symbolHeight * scale) / 2,
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

    return svgString;
  }

export default function DrawSymbolPanel({ canvas }) {
  const [xHeight, setXHeight] = useState(100);
  const [color, setColor] = useState('white');

  const handleAddSymbol = (symbolType) => {
    if (!canvas) return;

    // Calculate center of viewport for placement
    const viewportCenter = canvas.getCenter();
    
    const options = {
      xHeight: xHeight,
      color: color,
      angle: 0,
      x: viewportCenter.left,
      y: viewportCenter.top
    };

    // Use the migrated legacy logic to create the object
    // Note: SymbolObject extends Group (via BaseGroup)
    const symbol = new SymbolObject({
      symbolType: symbolType,
      ...options
    });

    canvas.add(symbol);
    canvas.setActiveObject(symbol);
    canvas.requestRenderAll();
  };

  return (
    <div className="space-y-4">
      <div className="input-group">
        <label className="input-label">X-Height</label>
        <input 
          type="number" 
          className="input-field" 
          value={xHeight} 
          onChange={(e) => setXHeight(parseInt(e.target.value) || 0)}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Color</label>
        <select 
          className="input-field" 
          value={color} 
          onChange={(e) => setColor(e.target.value)}
        >
          <option value="white">White</option>
          <option value="black">Black</option>
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
        </select>
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
            <img src={createButtonSVG(symbolType, xHeight, color)} alt={symbolType} />
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
