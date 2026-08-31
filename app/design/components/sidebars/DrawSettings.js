'use client';

import { useEffect, useState } from 'react';

import SidebarToggleGroup from '../shared/SidebarToggleGroup.js';
import HintButton from '../shared/HintButton.js';
import { useI18n } from '../../lib/i18n/I18nProvider.js';

const DEFAULT_COLOR_OPTIONS = [
    { value: 'White', label: 'White' },
    { value: 'Black', label: 'Black' },
];

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
    const { t } = useI18n();
    const resolvedColorOptions = colorOptions.map((option) => {
        if (typeof option === 'object') {
            return { ...option, label: t(option.label) };
        }

        return { value: option, label: t(option) };
    });

    return (
        <div>
            <div className="input-group">
                <label className="input-label">
                    <span>{t('x Height')}</span>
                    <HintButton hintPath="text/XHeight" label={`${t('x Height')} help`} />
                </label>
                <input
                    type="number"
                    className="input-field"
                    value={xHeight}
                    step="1"
                    onChange={(e) => onXHeightChange(parseInt(e.target.value, 10) || 0)}
                />
            </div>

            <SidebarToggleGroup
                label={t('Color')}
                options={resolvedColorOptions}
                value={color}
                onChange={onColorChange}
                hintPath="text/MessageColor"
            />
        </div>
    );
}