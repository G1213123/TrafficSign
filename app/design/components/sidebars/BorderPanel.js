'use client';

import React, { useState } from 'react';
import { StaticCanvas, Path, Group } from 'fabric';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { BorderGroup } from '../../lib/objects/border.js';
import { DividerObject } from '../../lib/objects/divider.js';
import { convertVertexToPathCommands } from '../../lib/objects/path.js';
import { BorderColorScheme, BorderFrameWidth, BorderTypeScheme } from '../../lib/templates/borderTemplate.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { useGeneralDrawSettings } from './DrawSettings.js';
import { selectObjectHandler } from '../presentations/promptBox.js';
import './sidebar.css';

const BORDER_TYPE_OPTIONS = Object.keys(BorderFrameWidth);
const COLOR_OPTIONS = Object.keys(BorderColorScheme);
const DIVIDER_OPTIONS = [
    {
        type: 'HDivider',
        label: 'Stack Divider',
        imageSrc: '/images/divider%20stack.svg',
    },
    {
        type: 'VDivider',
        label: 'Gantry Divider',
        imageSrc: '/images/divider%20gantry.svg',
    },
    {
        type: 'VLane',
        label: 'Lane Line',
        imageSrc: '/images/divider%20lane.svg',
    },
];

const buttonSvgCache = new Map();

const getBorderSvgFill = (scheme, fillKey) => scheme?.[fillKey] || fillKey || scheme?.border || '#ffffff';

const createBorderButtonSVG = (borderType, xHeight, colorScheme) => {
    const cacheKey = `${borderType}|${xHeight}|${colorScheme}`;
    if (buttonSvgCache.has(cacheKey)) {
        return buttonSvgCache.get(cacheKey);
    }

    const scheme = BorderColorScheme[colorScheme] || BorderColorScheme['Blue Background'];
    const previewWidth = 220;
    const previewHeight = 220;
    const block = { width: borderType === 'exit'? 1000 : 3200, height: 2000  };
    const rounding = { x: 0, y: 0 };
    const shapeMeta = BorderTypeScheme[borderType]?.(xHeight, block, rounding);

    if (!shapeMeta?.path?.length) {
        return '';
    }

    const tempCanvas = new StaticCanvas(null, {
        width: previewWidth,
        height: previewHeight,
        enableRetinaScaling: false,
    });

    const pathObjects = shapeMeta.path.map((path) => {
        const pathCommands = convertVertexToPathCommands(path);
        return new Path(pathCommands, {
            fill: getBorderSvgFill(scheme, path.fill),
            stroke: 'none',
            strokeWidth: 0,
        });
    });

    const group = new Group(pathObjects);
    group.set({ originX: 'center', originY: 'center' });

    const bounds = group.getBoundingRect();
    const scaleX = previewWidth / Math.max(bounds.width, 1);
    const scaleY = previewHeight / Math.max(bounds.height, 1);
    const scale = Math.min(scaleX, scaleY) * 0.9;

    group.set({
        left: previewWidth / 2,
        top: previewHeight / 2,
        scaleX: scale,
        scaleY: scale,
    });

    tempCanvas.add(group);
    tempCanvas.renderAll();

    const svgString = tempCanvas.toSVG({
        width: previewWidth,
        height: previewHeight,
        viewBox: {
            x: 0,
            y: 0,
            width: previewWidth,
            height: previewHeight,
        },
    });

    tempCanvas.dispose();
    buttonSvgCache.set(cacheKey, svgString);
    return svgString;
};

const formatBorderTypeLabel = (value) => value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (letter) => letter.toUpperCase());

export default function BorderPanel() {
    const { t } = useI18n();
    const { xHeight, setXHeight } = useGeneralDrawSettings();
    const [colorScheme, setColorScheme] = useState('Blue Background');
    const [fixedWidth, setFixedWidth] = useState('');
    const [fixedHeight, setFixedHeight] = useState('');
    const [selectedBorderType, setSelectedBorderType] = useState('stack');

    const getCanvas = () => CanvasGlobals.canvas;

    const addEscapeToCancelSelection = (cancelSelection) => {
        const handleEscape = (event) => {
            if (event.key !== 'Escape') return;

            event.preventDefault();
            event.stopPropagation();
            document.removeEventListener('keydown', handleEscape, true);
            cancelSelection?.();
        };

        document.addEventListener('keydown', handleEscape, true);

        return () => document.removeEventListener('keydown', handleEscape, true);
    };

    const createBorderFromSelection = (borderType, selectedObjects) => {
        const objects = (selectedObjects || []).filter((object) => object && object.functionalType !== 'Border');
        if (!objects.length) return;

        const resolvedFixedWidth = fixedWidth.trim() !== '' ? parseFloat(fixedWidth) : null;
        const resolvedFixedHeight = fixedHeight.trim() !== '' ? parseFloat(fixedHeight) : null;

        new BorderGroup({
            borderType,
            widthObjects: objects,
            heightObjects: objects,
            fixedWidth: Number.isNaN(resolvedFixedWidth) ? null : resolvedFixedWidth,
            fixedHeight: Number.isNaN(resolvedFixedHeight) ? null : resolvedFixedHeight,
            xHeight,
            color: colorScheme,
        });

        getCanvas()?.requestRenderAll?.();
    };

    const createBorder = (borderType) => {
        setSelectedBorderType(borderType);

        let cleanupEscape = () => {};
        const cancelSelection = selectObjectHandler(
            t('select_shapes_to_contain_inside_the_border'),
            (selectedObjects) => {
                cleanupEscape();
                createBorderFromSelection(borderType, selectedObjects);
            },
            null,
            xHeight,
            'mm',
            true
        );

        cleanupEscape = addEscapeToCancelSelection(cancelSelection);
    };

    const createDivider = (dividerType) => {
        let cleanupEscape = () => {};
        const cancelSelection = selectObjectHandler(
            t('select_border_to_place_divider_inside'),
            (selectedObjects) => {
                cleanupEscape();
                const border = (selectedObjects || []).find((object) => object?.functionalType === 'Border');
                if (!border) return;

                new DividerObject({
                    dividerType,
                    borderGroup: border,
                    xHeight,
                    colorType: colorScheme,
                });

                getCanvas()?.requestRenderAll?.();
            },
            null,
            xHeight,
            'mm',
            true,
            'Border'
        );

        cleanupEscape = addEscapeToCancelSelection(cancelSelection);
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">{t('x Height')}</label>
                <input
                    type="number"
                    className="input-field"
                    value={xHeight}
                    step="1"
                    onChange={(e) => setXHeight(parseInt(e.target.value, 10) || 0)}
                />
            </div>

            <div className="input-group">
                <label className="input-label">{t('Color Scheme')}</label>
                <select
                    className="input-field"
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                >
                    {COLOR_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Fixed Width')}</label>
                <input
                    type="number"
                    className="input-field"
                    value={fixedWidth}
                    step="1"
                    onChange={(e) => setFixedWidth(e.target.value)}
                    placeholder={t('Optional')}
                />
            </div>

            <div className="input-group">
                <label className="input-label">{t('Fixed Height')}</label>
                <input
                    type="number"
                    className="input-field"
                    value={fixedHeight}
                    step="1"
                    onChange={(e) => setFixedHeight(e.target.value)}
                    placeholder={t('Optional')}
                />
            </div>

            <div className="input-group">
                <label className="input-label">{t('Border Type')}</label>
                <div className="symbol-grid-border">
                    {BORDER_TYPE_OPTIONS.map((borderType) => {
                        const preview = createBorderButtonSVG(borderType, xHeight, colorScheme);

                        return (
                            <button
                                key={borderType}
                                type="button"
                                className={`symbol-item ${selectedBorderType === borderType ? 'object-list-button-active' : ''}`}
                                onClick={() => createBorder(borderType)}
                                title={borderType}
                            >
                                <div
                                    className="symbol-svg-container"
                                    dangerouslySetInnerHTML={{ __html: preview }}
                                />
                                <hr className="symbol-separator" />
                                <span className="symbol-label">
                                    {t(formatBorderTypeLabel(borderType))}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Add Divider to Border')}</label>
                <div className="divider-grid">
                    {DIVIDER_OPTIONS.map((divider) => (
                        <button
                            key={divider.type}
                            type="button"
                            className="symbol-item divider-item"
                            onClick={() => createDivider(divider.type)}
                            title={t(divider.label)}
                        >
                            <img
                                className="divider-item-image"
                                src={divider.imageSrc}
                                alt={t(divider.label)}
                            />
                            <hr className="symbol-separator" />
                            <span className="symbol-label">{t(divider.label)}</span>
                        </button>
                    ))}
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                {t('Select canvas objects, then pick a border type to wrap them.')}
            </p>
        </div>
    );
}