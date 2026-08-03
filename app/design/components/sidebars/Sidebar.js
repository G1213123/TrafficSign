'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../lib/i18n/I18nProvider.js';
import {
    Road,
    Type,
    SquareDashed,
    Waypoints,
    Ruler,
    Signpost,
    FolderInput,
    History,
    Info,
    Settings,
    ChevronsRight,
    ChevronsLeft,
    ChevronsUp,
    ChevronsDown
} from 'lucide-react';
import './sidebar.css';
import DrawSymbolPanel from './SymbolPanel';
import CanvasObjectList from './CanvasObjectList';
import TextPanel from './TextPanel';
import BorderPanel from './BorderPanel';
import RouteMapPanel from './RouteMapPanel';
import MeasurePanel from './MeasurePanel';
import TemplatePanel from './TemplatePanel';
import ExportPanel from './ExportPanel';
import TrackerPanel from './TrackerPanel';
import InfoPanel from './InfoPanel';
import SettingsPanel from './SettingsPanel';

const SIDEBAR_ITEMS = [
    { id: 'btn_draw', icon: Road, label: 'Draw Symbol', tooltip: 'Draw Symbol' },
    { id: 'btn_text', icon: Type, label: 'Add Text', tooltip: 'Add Text' },
    { id: 'btn_border', icon: SquareDashed, label: 'Add Border', tooltip: 'Add Border' },
    { id: 'btn_map', icon: Waypoints, label: 'Add Route Map', tooltip: 'Add Route Map' },
    { id: 'btn_measure', icon: Ruler, label: 'Measure Tool', tooltip: 'Measure Tool' },
    { id: 'btn_template', icon: Signpost, label: 'Template Signs', tooltip: 'Template Signs' },
    { id: 'btn_export', icon: FolderInput, label: 'Import/Export', tooltip: 'Import/Export' },
    { id: 'btn_tracker', icon: History, label: 'History Tracker', tooltip: 'History Tracker' },
    { id: 'btn_info', icon: Info, label: 'Information', tooltip: 'Information' },
    { id: 'btn_settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
];

export default function Sidebar({ canvas }) {
    const { t } = useI18n();
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('btn_draw');
    const [isMobile, setIsMobile] = useState(false);
    const [objectListVisible, setObjectListVisible] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleToggle = () => {
            setIsOpen((prev) => !prev);
        };

        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    return (
        <div className="side-panel-container">
            <div className={`main-panel ${isOpen ? 'main-panel-open' : 'main-panel-closed'}`}>
                <header className="panel-header">
                    <a href="/" className="hover:text-gray-300 transition-colors">{t('Road Sign Factory')}</a>
                </header>

                <div className="panel-content">
                    <div className="sidebar-main-content">
                        <div className="tab-container">
                            <h2 className="tab-title">
                                {t(SIDEBAR_ITEMS.find((item) => item.id === activeTab)?.label)}
                            </h2>

                            {activeTab === 'btn_draw' && <DrawSymbolPanel canvas={canvas} />}
                            {activeTab === 'btn_text' && <TextPanel canvas={canvas} />}
                            {activeTab === 'btn_border' && <BorderPanel canvas={canvas} />}
                            {activeTab === 'btn_map' && <RouteMapPanel canvas={canvas} />}
                            {activeTab === 'btn_measure' && <MeasurePanel canvas={canvas} />}
                            {activeTab === 'btn_template' && <TemplatePanel canvas={canvas} />}
                            {activeTab === 'btn_export' && <ExportPanel canvas={canvas} />}
                            {activeTab === 'btn_tracker' && <TrackerPanel canvas={canvas} />}
                            {activeTab === 'btn_info' && <InfoPanel canvas={canvas} />}
                            {activeTab === 'btn_settings' && <SettingsPanel canvas={canvas} />}

                            {activeTab !== 'btn_draw' && activeTab !== 'btn_text' && activeTab !== 'btn_border' && activeTab !== 'btn_map' && activeTab !== 'btn_measure' && activeTab !== 'btn_template' && activeTab !== 'btn_export' && activeTab !== 'btn_tracker' && activeTab !== 'btn_info' && activeTab !== 'btn_settings' && (
                                <div style={{ color: '#aaa', fontStyle: 'italic' }}>
                                    Content for {SIDEBAR_ITEMS.find((item) => item.id === activeTab)?.label} is under construction...
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="object-list-section">
                    <div
                        className="object-list-header"
                        onClick={() => setObjectListVisible(!objectListVisible)}
                    >
                        <span className="text-sm font-medium">{t('Canvas Objects')}</span>
                        {objectListVisible ? (
                            <ChevronsDown size={16} onClick={() => setObjectListVisible(false)} className="cursor-pointer" />
                        ) : (
                            <ChevronsUp size={16} onClick={() => setObjectListVisible(true)} className="cursor-pointer" />
                        )}
                    </div>
                    <CanvasObjectList canvas={canvas} isVisible={objectListVisible} />
                </div>
            </div>

            <div className={`slim-bar ${isOpen ? 'slim-bar-left-open' : 'slim-bar-left-closed'}`}>
                {SIDEBAR_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
                    >
                        <item.icon size={24} />
                        <div className="tooltip">{t(item.tooltip)}</div>
                    </div>
                ))}

                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="sidebar-item sidebar-item-inactive sidebar-item-bottom"
                >
                    {isMobile ? (isOpen ? <ChevronsDown size={24} /> : <ChevronsUp size={24} />) : (isOpen ? <ChevronsLeft size={24} /> : <ChevronsRight size={24} />)}
                    <div className="tooltip">{t('Toggle Sidebar')}</div>
                </div>
            </div>
        </div>
    );
}
