'use client';

import SidebarToggleGroup from './SidebarToggleGroup.js';

const DEFAULT_COLOR_OPTIONS = [
    { value: 'White', label: 'White' },
    { value: 'Black', label: 'Black' },
];

import { useEffect, useState } from 'react';

import { GeneralSettings } from '../../lib/utils/settings.js';

const resolveSetting = (setting, fallback) => {
    return GeneralSettings.hasOwnProperty(setting) ? GeneralSettings[setting] : fallback;
};

export function useGeneralDrawSettings() {
    const [xHeight, setLocalXHeight] = useState(resolveSetting('xHeight', 100));
    const [color, setLocalColor] = useState(resolveSetting('messageColor', 'White'));

    useEffect(() => {
        const syncSettings = (setting) => {
            if (setting === 'xHeight') {
                setLocalXHeight(resolveSetting('xHeight', 100));
            }

            if (setting === 'messageColor') {
                setLocalColor(resolveSetting('messageColor', 'White'));
            }

            if (setting === 'settingsReset') {
                setLocalXHeight(resolveSetting('xHeight', 100));
                setLocalColor(resolveSetting('messageColor', 'White'));
            }
        };

        GeneralSettings.addListener(syncSettings);

        return () => {
            GeneralSettings.listeners = GeneralSettings.listeners.filter((listener) => listener !== syncSettings);
        };
    }, []);

    const setXHeight = (value) => {
        GeneralSettings.updateSetting('xHeight', value);
        setLocalXHeight(value);
    };

    const setColor = (value) => {
        GeneralSettings.updateSetting('messageColor', value);
        setLocalColor(value);
    };

    return {
        xHeight,
        setXHeight,
        color,
        setColor,
    };
}

export function GeneralDrawSettings({
    xHeight,
    onXHeightChange,
    color,
    onColorChange,
    colorOptions = DEFAULT_COLOR_OPTIONS,
}) {
    return (
        <div>
            <div className="input-group">
                <label className="input-label">X-Height</label>
                <input
                    type="number"
                    className="input-field"
                    value={xHeight}
                    step="1"
                    onChange={(e) => onXHeightChange(parseInt(e.target.value, 10) || 0)}
                />
            </div>

            <SidebarToggleGroup
                label="Color"
                options={colorOptions}
                value={color}
                onChange={onColorChange}
            />
        </div>
    );
}