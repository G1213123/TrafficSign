'use client';

import React, { useEffect, useState } from 'react';

import SidebarToggleGroup from './SidebarToggleGroup.js';
import { GeneralSettings } from './settings.js';

const readSetting = (key, fallback) => (Object.prototype.hasOwnProperty.call(GeneralSettings, key) ? GeneralSettings[key] : fallback);

export default function SettingsPanel() {
    const [locale, setLocale] = useState(readSetting('locale', 'en'));
    const [showTextBorders, setShowTextBorders] = useState(readSetting('showTextBorders', true) ? 'Yes' : 'No');
    const [showGrid, setShowGrid] = useState(readSetting('showGrid', true) ? 'Yes' : 'No');
    const [showAllVertices, setShowAllVertices] = useState(readSetting('showAllVertices', false) ? 'Yes' : 'No');
    const [dimensionUnit, setDimensionUnit] = useState(readSetting('dimensionUnit', 'mm'));
    const [autoSave, setAutoSave] = useState(readSetting('autoSave', true) ? 'Yes' : 'No');
    const [runTestsOnStart, setRunTestsOnStart] = useState(readSetting('runTestsOnStart', false) ? 'Yes' : 'No');
    const [gridSize, setGridSize] = useState(String(readSetting('gridSize', 20)));
    const [autoSaveInterval, setAutoSaveInterval] = useState(String(readSetting('autoSaveInterval', 300)));
    const [defaultExportScale, setDefaultExportScale] = useState(String(readSetting('defaultExportScale', 2)));

    useEffect(() => {
        const sync = (setting) => {
            if (setting === 'settingsReset') {
                setLocale(readSetting('locale', 'en'));
                setShowTextBorders(readSetting('showTextBorders', true) ? 'Yes' : 'No');
                setShowGrid(readSetting('showGrid', true) ? 'Yes' : 'No');
                setShowAllVertices(readSetting('showAllVertices', false) ? 'Yes' : 'No');
                setDimensionUnit(readSetting('dimensionUnit', 'mm'));
                setAutoSave(readSetting('autoSave', true) ? 'Yes' : 'No');
                setRunTestsOnStart(readSetting('runTestsOnStart', false) ? 'Yes' : 'No');
                setGridSize(String(readSetting('gridSize', 20)));
                setAutoSaveInterval(String(readSetting('autoSaveInterval', 300)));
                setDefaultExportScale(String(readSetting('defaultExportScale', 2)));
            }
        };

        GeneralSettings.addListener(sync);

        return () => {
            GeneralSettings.listeners = GeneralSettings.listeners.filter((listener) => listener !== sync);
        };
    }, []);

    const updateBoolean = (key, value) => {
        GeneralSettings.updateSetting(key, value === 'Yes');
    };

    return (
        <div className="space-y-4">
            <SidebarToggleGroup label="App Language" options={[{ value: 'en', label: 'English' }, { value: 'zh', label: 'Chinese' }]} value={locale} onChange={(value) => { setLocale(value); GeneralSettings.updateSetting('locale', value); }} />
            <SidebarToggleGroup label="Show Text Borders" options={['No', 'Yes']} value={showTextBorders} onChange={(value) => { setShowTextBorders(value); updateBoolean('showTextBorders', value); }} />
            <SidebarToggleGroup label="Show Grid" options={['No', 'Yes']} value={showGrid} onChange={(value) => { setShowGrid(value); updateBoolean('showGrid', value); }} />
            <SidebarToggleGroup label="Show All Vertices" options={['No', 'Yes']} value={showAllVertices} onChange={(value) => { setShowAllVertices(value); updateBoolean('showAllVertices', value); }} />
            <SidebarToggleGroup label="Dimension Unit" options={['mm', 'sw']} value={dimensionUnit} onChange={(value) => { setDimensionUnit(value); GeneralSettings.updateSetting('dimensionUnit', value); }} />
            <SidebarToggleGroup label="Auto Save" options={['No', 'Yes']} value={autoSave} onChange={(value) => { setAutoSave(value); updateBoolean('autoSave', value); }} />

            <div className="input-group">
                <label className="input-label">Grid Size</label>
                <input className="input-field" type="number" value={gridSize} onChange={(e) => { setGridSize(e.target.value); GeneralSettings.updateSetting('gridSize', parseInt(e.target.value, 10) || 0); }} />
            </div>

            <div className="input-group">
                <label className="input-label">Auto Save Interval</label>
                <input className="input-field" type="number" value={autoSaveInterval} onChange={(e) => { setAutoSaveInterval(e.target.value); GeneralSettings.updateSetting('autoSaveInterval', parseInt(e.target.value, 10) || 0); }} />
            </div>

            <div className="input-group">
                <label className="input-label">Default Export Scale</label>
                <input className="input-field" type="number" value={defaultExportScale} onChange={(e) => { setDefaultExportScale(e.target.value); GeneralSettings.updateSetting('defaultExportScale', parseFloat(e.target.value) || 1); }} />
            </div>

            <SidebarToggleGroup label="Run Tests on Start" options={['No', 'Yes']} value={runTestsOnStart} onChange={(value) => { setRunTestsOnStart(value); updateBoolean('runTestsOnStart', value); }} />

            <div className="toggle-container">
                <button type="button" className="toggle-button" onClick={() => GeneralSettings.resetSetting()}>
                    Reset Settings
                </button>
            </div>
        </div>
    );
}