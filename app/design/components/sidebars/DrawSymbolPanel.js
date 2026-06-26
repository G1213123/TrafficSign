'use client';

import React, { useState } from 'react';
import { 
  Road, 
  Type, 
  Square, 
  MapPin, 
  Ruler, 
  Signpost, 
  FileExport, 
  History, 
  Info, 
  Settings 
} from 'lucide-react';
import { fabric } from 'fabric';
import { symbolsTemplate } from '../../lib/objects/template';
import { calcSymbol, SymbolObject } from '../../lib/objects/symbols';
import './sidebar.css';

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
    // Note: SymbolObject extends fabric.Group (via BaseGroup)
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
              <Road size={20} />
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
