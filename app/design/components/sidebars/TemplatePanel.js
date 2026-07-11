'use client';

import React, { useState } from 'react';

const TEMPLATES = [
    { name: 'Flag Sign', description: 'Standard flag-type sign with destinations and chevron.' },
    { name: 'Stack Sign', description: 'Stacked road sign with multiple destinations.' },
    { name: 'Lane Sign', description: 'Exit sign showing multiple lanes and directions.' },
    { name: 'Roundabout Sign', description: 'Directions at a conventional roundabout.' },
    { name: 'Spiral Roundabout Sign', description: 'Directions at a spiral roundabout.' },
    { name: 'Gantry Sign', description: 'Overhead gantry sign with multiple compartments.' },
    { name: 'Diverge Sign', description: 'Complex interchange direction sign.' },
];

export default function TemplatePanel() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">Template Gallery</label>
                <div className="symbol-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                    {TEMPLATES.map((template) => {
                        const isSelected = selectedTemplate === template.name;

                        return (
                            <button
                                key={template.name}
                                type="button"
                                className={`symbol-item ${isSelected ? 'object-list-button-active' : ''}`}
                                style={{ aspectRatio: 'auto', minHeight: '128px', textAlign: 'left', justifyContent: 'flex-start', alignItems: 'flex-start' }}
                                onClick={() => setSelectedTemplate(template.name)}
                            >
                                <strong style={{ display: 'block', marginBottom: '6px' }}>{template.name}</strong>
                                <span style={{ fontSize: '12px', color: '#d0d0d0', lineHeight: 1.4 }}>{template.description}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Selection</label>
                <div style={{ color: '#aaa', fontSize: '12px' }}>
                    {selectedTemplate ? `Selected template: ${selectedTemplate}` : 'Select a template to prepare it for insertion.'}
                </div>
            </div>

            <button type="button" className="btn-small" disabled={!selectedTemplate}>
                Insert Template
            </button>
        </div>
    );
}