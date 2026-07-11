'use client';

import React, { useState } from 'react';

export default function MeasurePanel({ canvas }) {
    const [activeMeasurement, setActiveMeasurement] = useState(false);

    const toggleMeasurement = () => {
        setActiveMeasurement((value) => {
            const nextValue = !value;
            if (canvas) {
                canvas.defaultCursor = nextValue ? 'crosshair' : 'default';
                canvas.requestRenderAll?.();
            }
            return nextValue;
        });
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">Instructions</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5 }}>
                    Click vertices to measure distance. The layout matches the legacy sidebar and the live measuring hook can be wired to the canvas next.
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Measurement Control</label>
                <button type="button" className={`btn-small ${activeMeasurement ? 'object-list-button-active' : ''}`} onClick={toggleMeasurement}>
                    {activeMeasurement ? 'Stop Measuring' : 'Start Measuring'}
                </button>
            </div>
        </div>
    );
}