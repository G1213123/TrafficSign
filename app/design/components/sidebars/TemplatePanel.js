'use client';

import React, { useState } from 'react';

import { CanvasGlobals } from '../canvas/canvas.js';
import { buildObjectsFromJSON } from '../../lib/objects/build.js';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { createTemplateSign } from '../../lib/templates/signTemplate.js';
import './sidebar.css';

export const TEMPLATES = [
    { name: 'Flag Sign', description: 'Standard flag-type sign with destinations and chevron.', image: '/images/flag.svg' },
    { name: 'Stack Sign', description: 'Stacked road sign with multiple destinations.', image: '/images/stack.svg' },
    { name: 'Lane Sign', description: 'Exit sign showing multiple lanes and directions.', image: '/images/lane.svg' },
    { name: 'Roundabout Sign', description: 'Directions at a conventional roundabout.', image: '/images/roundabout.svg' },
    { name: 'Spiral Roundabout Sign', description: 'Directions at a spiral roundabout.', image: '/images/spiral.svg' },
    { name: 'Gantry Sign', description: 'Overhead gantry sign with multiple compartments.', image: '/images/gantry.svg' },
    { name: 'Diverge Sign', description: 'Complex interchange direction sign.', image: '/images/diverge.svg' },
];


export default function TemplatePanel({ canvas }) {
    const { t } = useI18n();
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [statusText, setStatusText] = useState('');

    const insertTemplate = async (templateName) => {
        const template = TEMPLATES.find((item) => item.name === templateName);

        if (!canvas) {
            setStatusText(t('canvas_not_ready'));
            return;
        }

        if (!template) {
            setStatusText(t('select_template_first'));
            return;
        }

        try {
            canvas.discardActiveObject?.();
            const getCenterCoord = () => {
                return {
                    x: CanvasGlobals.CenterCoord().x,
                    y: CanvasGlobals.CenterCoord().y
                };
            }
            const vpt = getCenterCoord();
            createTemplateSign(template.name, vpt.x, vpt.y);
            canvas.requestRenderAll?.();
            setStatusText(`${template.name} ${t('inserted')}`);
        } catch (error) {
            console.error(`Error inserting template ${template.name}:`, error);
            setStatusText(t('failed_to_insert', { templateName: template.name }));
        }
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <div className="symbol-grid template-grid">
                    {TEMPLATES.map((template) => {
                        const isSelected = selectedTemplate === template.name;

                        return (
                            <button
                                key={template.name}
                                type="button"
                                className={`symbol-item template-item ${isSelected ? 'object-list-button-active' : ''}`}
                                onClick={() => {
                                    setSelectedTemplate(template.name);
                                    insertTemplate(template.name);
                                }}
                            >
                                <strong className="template-item-title">{template.name}</strong>
                                <div className="template-preview">
                                    <img
                                        src={template.image}
                                        alt={`${template.name} preview`}
                                        className="template-preview-image"
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {statusText ? (
                <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                    {statusText}
                </p>
            ) : null}
        </div>
    );
}