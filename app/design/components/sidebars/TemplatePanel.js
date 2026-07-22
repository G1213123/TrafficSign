'use client';

import React, { useState } from 'react';

import { CanvasGlobals } from '../canvas/canvas.js';
import { buildObjectsFromJSON } from '../../lib/objects/build.js';

import flagTemplate from '../../../../legacy/llm_templates/Flag.json';
import stackTemplate from '../../../../legacy/llm_templates/Stack.json';
import laneTemplate from '../../../../legacy/llm_templates/Lane.json';
import conventionalRoundaboutTemplate from '../../../../legacy/llm_templates/Conventional_Roundabout.json';
import spiralRoundaboutTemplate from '../../../../legacy/llm_templates/Spiral_Roundabout.json';
import gantryTemplate from '../../../../legacy/llm_templates/Gantry.json';
import divergeTemplate from '../../../../legacy/llm_templates/Diverge.json';

export const TEMPLATES = [
    { name: 'Flag Sign', description: 'Standard flag-type sign with destinations and chevron.', data: flagTemplate },
    { name: 'Stack Sign', description: 'Stacked road sign with multiple destinations.', data: stackTemplate },
    { name: 'Lane Sign', description: 'Exit sign showing multiple lanes and directions.', data: laneTemplate },
    { name: 'Roundabout Sign', description: 'Directions at a conventional roundabout.', data: conventionalRoundaboutTemplate },
    { name: 'Spiral Roundabout Sign', description: 'Directions at a spiral roundabout.', data: spiralRoundaboutTemplate },
    { name: 'Gantry Sign', description: 'Overhead gantry sign with multiple compartments.', data: gantryTemplate },
    { name: 'Diverge Sign', description: 'Complex interchange direction sign.', data: divergeTemplate },
];

export async function createTemplateSign(templateName) {
    const template = TEMPLATES.find((item) => item.name === templateName);
    const canvas = CanvasGlobals.canvas;

    if (!template || !canvas) {
        return null;
    }

    const startIndex = canvas.getObjects().length;

    await buildObjectsFromJSON(template.data.objects);

    const createdObjects = canvas.getObjects().slice(startIndex);
    const borderObject = [...createdObjects].reverse().find((object) => object.functionalType === 'Border' || object.objectType === 'BorderGroup') || createdObjects.at(-1);

    return borderObject ? {
        width: borderObject.width,
        height: borderObject.height,
        left: borderObject.left,
        top: borderObject.top,
    } : null;
}

export default function TemplatePanel() {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [statusText, setStatusText] = useState('');

    const getCanvas = () => CanvasGlobals.canvas;

    const insertTemplate = async () => {
        const canvas = getCanvas();
        const template = TEMPLATES.find((item) => item.name === selectedTemplate);

        if (!canvas) {
            setStatusText('Canvas is not ready yet.');
            return;
        }

        if (!template) {
            setStatusText('Select a template first.');
            return;
        }

        try {
            canvas.discardActiveObject?.();
            await buildObjectsFromJSON(template.data.objects);
            canvas.requestRenderAll?.();
            setStatusText(`${template.name} inserted.`);
        } catch (error) {
            console.error(`Error inserting template ${template.name}:`, error);
            setStatusText(`Failed to insert ${template.name}.`);
        }
    };

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

            <button type="button" className="btn-small" disabled={!selectedTemplate} onClick={insertTemplate}>
                Insert Template
            </button>

            {statusText ? (
                <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                    {statusText}
                </p>
            ) : null}
        </div>
    );
}