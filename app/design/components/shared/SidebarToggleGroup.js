'use client';

import React from 'react';
import HintButton from './HintButton.js';

export default function SidebarToggleGroup({ label, options, value, onChange, className = '', hintPath = null }) {
    return (
        <div className={`input-group ${className}`.trim()}>
            <label className="input-label">
                <span>{label}</span>
                {hintPath && <HintButton hintPath={hintPath} label={`${label} help`} />}
            </label>
            <div className="toggle-container" role="group" aria-label={label}>
                {options.map((option) => {
                    const optionValue = typeof option === 'object' ? option.value : option;
                    const optionLabel = typeof option === 'object' ? option.label : option;
                    const isActive = value === optionValue;

                    return (
                        <button
                            key={optionValue}
                            type="button"
                            className={`toggle-button ${isActive ? 'active' : ''}`}
                            aria-pressed={isActive}
                            onClick={() => onChange(optionValue)}
                        >
                            {optionLabel}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}