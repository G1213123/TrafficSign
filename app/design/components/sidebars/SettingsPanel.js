'use client';

import React, { useEffect, useState } from 'react';

import SidebarToggleGroup from '../shared/SidebarToggleGroup.js';
import { GeneralSettings } from '../../lib/utils/settings.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { showToast } from '../presentations/ToastBox.js';

const readSetting = (key, fallback) => (Object.prototype.hasOwnProperty.call(GeneralSettings, key) ? GeneralSettings[key] : fallback);

const KEYBOARD_SHORTCUTS = [
    { key: 'Arrow Keys', description: 'Nudge Selected Object' },
    { key: 'Delete', description: 'Delete Selected Object' },
    { key: 'Escape', description: 'Cancel Action / Toggle / Close Panel' },
    { key: 'Enter', description: 'Confirm Input' },
    { key: 'Tab', description: 'Switch Vertex / Unit' },
    { key: 'Ctrl + C', description: 'Copy Selected Object' },
    { key: 'Ctrl + V', description: 'Paste Object' },
    { key: 'Ctrl + Z', description: 'Undo' },
    { key: 'Ctrl + S', description: 'Save' },
    { key: 'F3', description: 'Toggle Text Border' },
    { key: 'F4', description: 'Toggle Grid' },
    { key: 'F2', description: 'Toggle Vertices' },
    { key: 'F8', description: 'Toggle Dimension Unit' },
];

export default function SettingsPanel() {
    const { t } = useI18n();
    const [locale, setLocale] = useState(readSetting('locale', 'en'));
    const [showTextBorders, setShowTextBorders] = useState(readSetting('showTextBorders', true) ? 'Yes' : 'No');
    const [showGrid, setShowGrid] = useState(readSetting('showGrid', true) ? 'Yes' : 'No');
    const [showAllVertices, setShowAllVertices] = useState(readSetting('showAllVertices', false) ? 'Yes' : 'No');
    const [dimensionUnit, setDimensionUnit] = useState(readSetting('dimensionUnit', 'mm'));
    const [autoSave, setAutoSave] = useState(readSetting('autoSave', true) ? 'Yes' : 'No');
    const [runTestsOnStart, setRunTestsOnStart] = useState(readSetting('runTestsOnStart', false) ? 'Yes' : 'No');
    const [autoSaveInterval, setAutoSaveInterval] = useState(String(readSetting('autoSaveInterval', 300)));
    const [bgColor, setBgColor] = useState(readSetting('backgroundColor', '#2f2f2f'));
    const [gridColor, setGridColor] = useState(readSetting('gridColor', '#ffffff'));

    useEffect(() => {
        const sync = (setting) => {
            if (setting === 'settingsReset' || setting === 'settingsUpdated' || setting === 'locale') {
                setLocale(readSetting('locale', 'en'));
                setShowTextBorders(readSetting('showTextBorders', true) ? 'Yes' : 'No');
                setShowGrid(readSetting('showGrid', true) ? 'Yes' : 'No');
                setShowAllVertices(readSetting('showAllVertices', false) ? 'Yes' : 'No');
                setDimensionUnit(readSetting('dimensionUnit', 'mm'));
                setAutoSave(readSetting('autoSave', true) ? 'Yes' : 'No');
                setRunTestsOnStart(readSetting('runTestsOnStart', false) ? 'Yes' : 'No');
                setAutoSaveInterval(String(readSetting('autoSaveInterval', 300)));
                setBgColor(readSetting('backgroundColor', '#2f2f2f'));
                setGridColor(readSetting('gridColor', '#ffffff'));
                return;
            }

            if (setting === 'showTextBorders') {
                setShowTextBorders(readSetting('showTextBorders', true) ? 'Yes' : 'No');
            }

            if (setting === 'showGrid') {
                setShowGrid(readSetting('showGrid', true) ? 'Yes' : 'No');
            }

            if (setting === 'showAllVertices') {
                setShowAllVertices(readSetting('showAllVertices', false) ? 'Yes' : 'No');
            }

            if (setting === 'dimensionUnit') {
                setDimensionUnit(readSetting('dimensionUnit', 'mm'));
            }

            if (setting === 'autoSave') {
                setAutoSave(readSetting('autoSave', true) ? 'Yes' : 'No');
            }

            if (setting === 'runTestsOnStart') {
                setRunTestsOnStart(readSetting('runTestsOnStart', false) ? 'Yes' : 'No');
            }

            if (setting === 'autoSaveInterval') {
                setAutoSaveInterval(String(readSetting('autoSaveInterval', 300)));
            }

            if (setting === 'backgroundColor') {
                setBgColor(readSetting('backgroundColor', '#2f2f2f'));
            }

            if (setting === 'gridColor') {
                setGridColor(readSetting('gridColor', '#ffffff'));
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

    const updateLocale = (value) => {
        setLocale(value);
        GeneralSettings.updateSetting('locale', value);
        try {
            i18n.setLocale(value);
        } catch (_) {
            // Ignore translation setup failures in non-DOM contexts.
        }
    };

    const handleSaveCanvas = () => {
        const saved = GeneralSettings.saveCanvasState();
    };

    const handleClearSavedCanvas = () => {
        const cleared = GeneralSettings.clearSavedCanvas();
    };

    const handleResetSettings = () => {
        const reset = GeneralSettings.resetSetting();
    };

    return (
        <div className="space-y-4">
            <div className="input-group settings-shortcuts-group">
                <details className="settings-shortcuts-details">
                    <summary className="settings-shortcuts-summary">{t('Keyboard Shortcuts')}</summary>
                    <ul className="settings-shortcut-list">
                        {KEYBOARD_SHORTCUTS.map((shortcut) => (
                            <li key={shortcut.key} className="settings-shortcut-item">
                                <span className="settings-shortcut-key">{shortcut.key}</span>
                                <span className="settings-shortcut-description">{t(shortcut.description)}</span>
                            </li>
                        ))}
                    </ul>
                </details>
            </div>

            <SidebarToggleGroup label={t('App Language')} options={[{ value: 'en', label: t('English') }, { value: 'zh', label: t('Chinese') }]} value={locale} onChange={updateLocale} />
            <SidebarToggleGroup label={t('Show Text Borders')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={showTextBorders} onChange={(value) => { setShowTextBorders(value); updateBoolean('showTextBorders', value); }} />
            <SidebarToggleGroup label={t('Show Grid')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={showGrid} onChange={(value) => { setShowGrid(value); updateBoolean('showGrid', value); }} />
            <SidebarToggleGroup label={t('Show All Vertices')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={showAllVertices} onChange={(value) => { setShowAllVertices(value); updateBoolean('showAllVertices', value); }} />
            <SidebarToggleGroup label={t('Dimension Unit')} options={['mm', 'sw'].map((option) => ({ value: option, label: t(option) }))} value={dimensionUnit} onChange={(value) => { setDimensionUnit(value); GeneralSettings.updateSetting('dimensionUnit', value); }} />
            <SidebarToggleGroup label={t('Auto Save')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={autoSave} onChange={(value) => { setAutoSave(value); updateBoolean('autoSave', value); }} />

            <div className="input-group">
                <label className="input-label">{t('Background Color')}</label>
                <input 
                    type="color" 
                    value={bgColor} 
                    onChange={(e) => {
                        const color = e.target.value;
                        setBgColor(color);
                        GeneralSettings.updateSetting('backgroundColor', color);
                        const canvas = CanvasGlobals.canvas;
                        if (canvas) {
                            canvas.backgroundColor = color;
                            canvas.requestRenderAll?.();
                        }
                    }} 
                />
            </div>

            <div className="input-group">
                <label className="input-label">{t('Grid Color')}</label>
                <input 
                    type="color" 
                    value={gridColor} 
                    onChange={(e) => {
                        const color = e.target.value;
                        setGridColor(color);
                        GeneralSettings.updateSetting('gridColor', color);
                        GeneralSettings.applyGridSettings();
                    }} 
                />
            </div>

            { autoSave === 'Yes' && (
                <div className="input-group">
                    <label className="input-label">{t('Auto Save Interval (seconds)')}</label>
                    <input className="input-field" type="number" value={autoSaveInterval} onChange={(e) => { setAutoSaveInterval(e.target.value); GeneralSettings.updateSetting('autoSaveInterval', parseInt(e.target.value, 10) || 0); }} />
                </div>
            )}

            <SidebarToggleGroup label={t('Run Tests on Start')} options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))} value={runTestsOnStart} onChange={(value) => { setRunTestsOnStart(value); updateBoolean('runTestsOnStart', value); }} />

            <div className="toggle-container">
                <button type="button" className="toggle-button" onClick={handleSaveCanvas}>
                    {t('Save Canvas')}
                </button>
                <button type="button" className="toggle-button" onClick={handleClearSavedCanvas}>
                    {t('Clear Saved Canvas')}
                </button>
                <button type="button" className="toggle-button" onClick={() => GeneralSettings.runTests()}>
                    {t('Run Tests')}
                </button>
            </div>

            <div className="toggle-container">
                <button type="button" className="toggle-button" onClick={handleResetSettings}>
                    {t('Reset Settings')}
                </button>
            </div>
        </div>
    );
}