'use client';

import React, { useRef, useState } from 'react';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
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
    const { t } = useI18n();
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
                <label className="input-label">{t('filename')}</label>
                <input className="input-field" value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>

            <div className="input-group">
                <label className="input-label">{t('quality')}</label>
                <select className="input-field" value={quality} onChange={(e) => setQuality(e.target.value)}>
                    {QUALITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="input-label">{t('pdf_paper_size')}</label>
                <select className="input-field" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                    {PAPER_SIZES.map((option) => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="input-label">{t('scale_multiplier_png_svg')}</label>
                <input className="input-field" value={scaleMultiplier} onChange={(e) => setScaleMultiplier(e.target.value)} />
            </div>

            <SidebarToggleGroup label={t('include_grid')} options={['No', 'Yes']} value={includeGrid} onChange={setIncludeGrid} />
            <SidebarToggleGroup label={t('include_background')} options={['No', 'Yes']} value={includeBackground} onChange={setIncludeBackground} />

            <div className="input-group">
                <label className="input-label">{t('export')}</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={exportPNG}>{t('Export as png')}</button>
                    <button type="button" className="toggle-button" onClick={exportSVG}>{t('Export as svg')}</button>
                    <button type="button" className="toggle-button" onClick={exportJSON}>{t('Export as json')}</button>
                    <button type="button" className="toggle-button" onClick={exportPDF}>{t('Export as pdf')}</button>
                    <button type="button" className="toggle-button" onClick={exportDXF}>{t('Export as dxf')}</button>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('import')}</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={triggerImport}>{t('Import json file')}</button>
                    <button type="button" className="toggle-button" disabled title={t('text_import_wiring_next')}>{t('Import json text')}</button>
                </div>
                <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
            </div>
        </div>
    );
}