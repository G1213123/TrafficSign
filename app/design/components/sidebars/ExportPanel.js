'use client';

import React, { useRef, useState } from 'react';

import { CanvasGlobals } from '../canvas/canvas.js';
import { exportCanvasToJSON } from '../../lib/utils/settings.js';
import { exportToPDF, exportToDXF } from '../../lib/exportUtils/index.js';
import SidebarToggleGroup from '../shared/SidebarToggleGroup.js';

const QUALITY_OPTIONS = ['1.0', '0.9', '0.8', '0.7', '0.5'];
const PAPER_SIZES = ['A3', 'A4', 'A5', 'Letter', 'Legal', 'Tabloid'];

const downloadText = (filename, text, mimeType) => {
    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

const downloadHref = (filename, href) => {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
};

export default function ExportPanel() {
    const fileInputRef = useRef(null);
    const [filename, setFilename] = useState('traffic-sign-export');
    const [quality, setQuality] = useState('1.0');
    const [paperSize, setPaperSize] = useState('A3');
    const [scaleMultiplier, setScaleMultiplier] = useState('2');
    const [includeGrid, setIncludeGrid] = useState('No');
    const [includeBackground, setIncludeBackground] = useState('No');

    const getCanvas = () => CanvasGlobals.canvas;

    const exportPNG = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: parseFloat(scaleMultiplier) || 1 });
        downloadHref(`${filename}.png`, dataUrl);
    };

    const exportSVG = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        const svg = canvas.toSVG();
        downloadText(`${filename}.svg`, svg, 'image/svg+xml');
    };

    const exportJSON = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        // Use the custom serialization logic from GeneralSettings
        // This matches how the app saves state to local storage
        const json = exportCanvasToJSON();
        
        if (!json) {
            alert('Failed to export canvas data.');
            return;
        }

         downloadText(`${filename}.json`, json, 'application/json');
    };

    const exportPDF = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        exportToPDF(canvas, filename, paperSize);
    };

    const exportDXF = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        exportToDXF(canvas, filename);
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        downloadText(`${file.name}.copy.txt`, text, 'text/plain');
        event.target.value = '';
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">Filename</label>
                <input className="input-field" value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>

            <div className="input-group">
                <label className="input-label">Quality</label>
                <select className="input-field" value={quality} onChange={(e) => setQuality(e.target.value)}>
                    {QUALITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="input-label">PDF Paper Size</label>
                <select className="input-field" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                    {PAPER_SIZES.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="input-label">Scale Multiplier (PNG/SVG)</label>
                <input className="input-field" value={scaleMultiplier} onChange={(e) => setScaleMultiplier(e.target.value)} />
            </div>

            <SidebarToggleGroup label="Include Grid" options={['No', 'Yes']} value={includeGrid} onChange={setIncludeGrid} />
            <SidebarToggleGroup label="Include Background" options={['No', 'Yes']} value={includeBackground} onChange={setIncludeBackground} />

            <div className="input-group">
                <label className="input-label">Export</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={exportPNG}>Export as PNG</button>
                    <button type="button" className="toggle-button" onClick={exportSVG}>Export as SVG</button>
                    <button type="button" className="toggle-button" onClick={exportJSON}>Export as JSON</button>
                    <button type="button" className="toggle-button" onClick={exportPDF}>Export as PDF</button>
                    <button type="button" className="toggle-button" onClick={exportDXF}>Export as DXF</button>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Import</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={triggerImport}>Import JSON file</button>
                    <button type="button" className="toggle-button" disabled title="Text import wiring next">Import JSON text</button>
                </div>
                <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
            </div>
        </div>
    );
}