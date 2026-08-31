'use client';

import React, { useRef, useState } from 'react';
import { Rect } from 'fabric';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { exportCanvasToJSON, importCanvasFromJSON } from '../../lib/utils/settings.js';
import { exportToPDF, exportToDXF } from '../../lib/exportUtils/index.js';
import { ImportManager } from '../../lib/modal/md-import.js';
import { showToast } from '../../components/presentations/ToastBox.js';
import { GeneralSettings } from '../../lib/utils/settings.js';
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
    const [includeGrid, setIncludeGrid] = useState('Yes');
    const [includeBackground, setIncludeBackground] = useState('Yes');
    const [exportFormat, setExportFormat] = useState('png');

    const getCanvas = () => CanvasGlobals.canvas;

    const exportPNG = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        const originalShowGrid = GeneralSettings.showGrid;
        const originalBgColor = GeneralSettings.backgroundColor;

        if (includeGrid === 'Yes') {
            GeneralSettings.showGrid = true;
            GeneralSettings.applyGridSettings();
        } else {
            GeneralSettings.showGrid = false;
            GeneralSettings.applyGridSettings();
        }

        if (includeBackground === 'Yes') {
            canvas.backgroundColor = originalBgColor;
        } else {
            canvas.backgroundColor = null;
        }

        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: parseFloat(scaleMultiplier) || 1 });
        
        // Restore original settings
        GeneralSettings.showGrid = originalShowGrid;
        GeneralSettings.applyGridSettings();
        canvas.backgroundColor = originalBgColor;
        canvas.requestRenderAll?.();

        downloadHref(`${filename}.png`, dataUrl);
    };

    const exportSVG = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        const originalShowGrid = GeneralSettings.showGrid;
        const originalBgColor = GeneralSettings.backgroundColor;

        if (includeGrid === 'Yes') {
            GeneralSettings.showGrid = true;
            GeneralSettings.applyGridSettings();
        } else {
            GeneralSettings.showGrid = false;
            GeneralSettings.applyGridSettings();
        }

        let tempBgRect = null;
        if (includeBackground === 'Yes') {
            // Create a mock background rectangle to ensure it's exported in SVG
            // Calculate bounds based on current viewport to cover the visible area
            const vpt = canvas.viewportTransform;
            const zoom = canvas.getZoom();
            const canvasScale = parseFloat(scaleMultiplier) || 1;
            
            const bounds = {
                left: -vpt[4] / zoom,
                top: -vpt[5] / zoom,
                width: canvas.width / zoom * 2,
                height: canvas.height / zoom * 2
            };
            tempBgRect = new Rect({
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height,
                fill: originalBgColor,
                selectable: false,
                evented: false,
                id: 'temp-export-bg'
            });
            canvas.insertAt(0, tempBgRect);
        } else {
            canvas.backgroundColor = null;
        }

        const svg = canvas.toSVG();
        
        if (tempBgRect) {
            canvas.remove(tempBgRect);
        }

        // Restore original settings
        GeneralSettings.showGrid = originalShowGrid;
        GeneralSettings.applyGridSettings();
        canvas.backgroundColor = originalBgColor;
        canvas.requestRenderAll?.();

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

        const originalShowGrid = GeneralSettings.showGrid;
        const originalBgColor = GeneralSettings.backgroundColor;

        if (includeGrid === 'Yes') {
            GeneralSettings.showGrid = true;
            GeneralSettings.applyGridSettings();
        } else {
            GeneralSettings.showGrid = false;
            GeneralSettings.applyGridSettings();
        }

        if (includeBackground === 'Yes') {
            canvas.backgroundColor = originalBgColor;
        } else {
            canvas.backgroundColor = null;
        }

        exportToPDF(canvas, filename, paperSize);

        // Restore original settings
        GeneralSettings.showGrid = originalShowGrid;
        GeneralSettings.applyGridSettings();
        canvas.backgroundColor = originalBgColor;
        canvas.requestRenderAll?.();
    };

    const exportDXF = () => {
        const canvas = getCanvas();
        if (!canvas) return;
        exportToDXF(canvas, filename);
    };

    const handleExecuteExport = () => {
        switch (exportFormat) {
            case 'png': exportPNG(); break;
            case 'svg': exportSVG(); break;
            case 'json': exportJSON(); break;
            case 'pdf': exportPDF(); break;
            case 'dxf': exportDXF(); break;
            default: showToast(t('Please select an export format'), 'error');
        }
    };

    const triggerImport = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        const confirmed = window.confirm(
            'Warning: Importing a JSON file will clear the current canvas and replace it with the imported content. All current work will be lost.\n\nDo you want to proceed?'
        );

        if (!confirmed) {
            return;
        }

        try {
            const text = await file.text();
            await importCanvasFromJSON(text);
        } catch (error) {
            console.error('Failed to import canvas from file:', error);
            showToast(error?.message || 'Failed to import canvas data.', 'error');
        }
    };

    const handleImportJSONText = async (jsonText) => {
        const confirmed = window.confirm(
            'Warning: Importing JSON text will clear the current canvas and replace it with the imported content. All current work will be lost.\n\nDo you want to proceed?'
        );

        if (!confirmed) {
            return;
        }

        try {
            await importCanvasFromJSON(jsonText);
            ImportManager.closeImportModal();
        } catch (error) {
            console.error('Failed to import canvas from text:', error);
            showToast(error?.message || 'Failed to import canvas data.', 'error');
            throw error;
        }
    };

    const triggerTextImport = () => {
        ImportManager.showImportJSONTextModal(handleImportJSONText);
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">{t('Filename')}</label>
                <input className="input-field" value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>

            {exportFormat === 'png' && (
                <div className="input-group">
                    <label className="input-label">{t('Quality')}</label>
                    <select className="input-field" value={quality} onChange={(e) => setQuality(e.target.value)}>
                        {QUALITY_OPTIONS.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            )}

            {exportFormat === 'pdf' && (
                <div className="input-group">
                    <label className="input-label">{t('PDF Paper Size')}</label>
                    <select className="input-field" value={paperSize} onChange={(e) => setPaperSize(e.target.value)}>
                        {PAPER_SIZES.map((option) => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </div>
            )}

            {(exportFormat === 'png' || exportFormat === 'svg' || exportFormat === 'pdf') && (
                <>
                    {(exportFormat === 'png' || exportFormat === 'svg') && (
                        <div className="input-group">
                            <label className="input-label">{t('Scale Multiplier (PNG/SVG)')}</label>
                            <input className="input-field" value={scaleMultiplier} onChange={(e) => setScaleMultiplier(e.target.value)} />
                        </div>
                    )}

                    <SidebarToggleGroup label={t('Include Grid')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={includeGrid} onChange={setIncludeGrid} />
                    <SidebarToggleGroup label={t('Include Background')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={includeBackground} onChange={setIncludeBackground} />
                </>
            )}

            <div className="input-group">
                <label className="input-label">{t('Export')}</label>
                <div className="toggle-container">
                    <button type="button" className={`toggle-button ${exportFormat === 'png' ? 'active' : ''}`} onClick={() => setExportFormat('png')}>{t('Export as PNG')}</button>
                    <button type="button" className={`toggle-button ${exportFormat === 'svg' ? 'active' : ''}`} onClick={() => setExportFormat('svg')}>{t('Export as SVG')}</button>
                    <button type="button" className={`toggle-button ${exportFormat === 'json' ? 'active' : ''}`} onClick={() => setExportFormat('json')}>{t('Export as JSON')}</button>
                    <button type="button" className={`toggle-button ${exportFormat === 'pdf' ? 'active' : ''}`} onClick={() => setExportFormat('pdf')}>{t('Export as PDF')}</button>
                    <button type="button" className={`toggle-button ${exportFormat === 'dxf' ? 'active' : ''}`} onClick={() => setExportFormat('dxf')}>{t('Export as DXF (Outline Only)')}</button>
                </div>
                <button type="button" className="panel-action-button" onClick={handleExecuteExport}>
                    {t('Execute Export')}
                </button>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Import')}</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={triggerImport}>{t('Import JSON file')}</button>
                    <button type="button" className="toggle-button" onClick={triggerTextImport}>{t('Import JSON text')}</button>
                </div>
                <input ref={fileInputRef} type="file" accept="application/json,.json" style={{ display: 'none' }} onChange={handleImportFile} />
            </div>
        </div>
    );
}