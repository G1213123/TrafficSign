'use client';

import React, { useState, useEffect } from 'react';
import {
    Road,
    Type,
    SquareDashed ,
    Waypoints ,
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

const SIDEBAR_ITEMS = [
    { id: 'btn_draw', icon: Road, label: 'Draw Symbol', tooltip: 'Draw Symbol' },
    { id: 'btn_text', icon: Type, label: 'Add Text', tooltip: 'Add Text' },
    { id: 'btn_border', icon: SquareDashed , label: 'Add Border', tooltip: 'Add Border' },
    { id: 'btn_map', icon: Waypoints , label: 'Add Route Map', tooltip: 'Add Route Map' },
    { id: 'btn_measure', icon: Ruler, label: 'Measure Tool', tooltip: 'Measure Tool' },
    { id: 'btn_template', icon: Signpost, label: 'Template Signs', tooltip: 'Template Signs' },
    { id: 'btn_export', icon: FolderInput, label: 'Import/Export', tooltip: 'Import/Export' },
    { id: 'btn_tracker', icon: History, label: 'History Tracker', tooltip: 'History Tracker' },
    { id: 'btn_info', icon: Info, label: 'Information', tooltip: 'Information' },
    { id: 'btn_settings', icon: Settings, label: 'Settings', tooltip: 'Settings' },
];


export default function Sidebar({ canvas }) {
    const [isOpen, setIsOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('btn_draw');
    const [isMobile, setIsMobile] = useState(false);

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
            setIsOpen(prev => !prev);
        };

        window.addEventListener('toggle-sidebar', handleToggle);
        return () => window.removeEventListener('toggle-sidebar', handleToggle);
    }, []);

    return (
        <div className="side-panel-container">
            {/* Main Side Panel */}
            <div
                className={`main-panel ${isOpen ? 'main-panel-open' : 'main-panel-closed'}`}
            >
                <header className="panel-header">
                    <a href="/" className="hover:text-gray-300 transition-colors">Road Sign Factory</a>
                </header>

                <div className="panel-content">
                    {/* Dynamic Content Area */}
                    <div className="tab-container">
                        <h2 className="tab-title">
                            {SIDEBAR_ITEMS.find(item => item.id === activeTab)?.label}
                        </h2>

                        {activeTab === 'btn_draw' && (
                            <DrawSymbolPanel canvas={canvas} />
                        )}

                        {activeTab === 'btn_text' && (
                            <TextPanel canvas={canvas} />
                        )}

                        {activeTab !== 'btn_draw' && activeTab !== 'btn_text' && (
                            <div style={{ color: '#aaa', fontStyle: 'italic' }}>
                                Content for {SIDEBAR_ITEMS.find(item => item.id === activeTab)?.label} is under construction...
                            </div>
                        )}
                    </div>

                    {/* Object List Mock */}
                    <div className="object-list-section">
                        <div className="object-list-header">
                            <span className="text-sm font-medium">Canvas Objects</span>
                            <ChevronsRight style={{ transform: 'rotate(90deg)', width: '16px', height: '16px' }} />
                        </div>
                        <CanvasObjectList canvas={canvas} />
                    </div>
                </div>
            </div>

            {/* Slim Icon Bar */}
            <div
                className={`slim-bar ${isOpen ? 'slim-bar-left-open' : 'slim-bar-left-closed'}`}
            >
                {SIDEBAR_ITEMS.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`sidebar-item ${activeTab === item.id ? 'sidebar-item-active' : 'sidebar-item-inactive'}`}
                    >
                        <item.icon size={24} />
                        <div className="tooltip">
                            {item.tooltip}
                        </div>
                    </div>
                ))}

                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="sidebar-item sidebar-item-inactive sidebar-item-bottom"
                >
                    {isMobile ? (
                        isOpen ? <ChevronsDown size={24} /> : <ChevronsUp size={24} />
                    ) : (
                        isOpen ? <ChevronsLeft size={24} /> : <ChevronsRight size={24} />
                    )}
                    <div className="tooltip">
                        Toggle Sidebar
                    </div>
                </div>
            </div>
        </div>
    );
}
