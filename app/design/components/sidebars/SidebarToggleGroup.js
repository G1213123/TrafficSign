'use client';

import React from 'react';

export default function SidebarToggleGroup({ label, options, value, onChange, className = '' }) {
    return (
        <div className={`input-group ${className}`.trim()}>
            <label className="input-label">{label}</label>
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