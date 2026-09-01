'use client';

import React, { useRef, useState } from 'react';
import { StaticCanvas, Path, Group, Rect } from 'fabric';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { BorderGroup } from '../../lib/objects/border.js';
import { DividerObject } from '../../lib/objects/divider.js';
import { convertVertexToPathCommands } from '../../lib/objects/path.js';
import { BorderColorScheme, BorderTypeScheme } from '../../lib/templates/borderTemplate.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { useGeneralDrawSettings } from './DrawSettings.js';
import { selectObjectHandler, showTextBox, hideTextBox } from '../presentations/promptBox.js';
import { HintModal } from '../modal/md-hint.js';
import HintButton from '../shared/HintButton.js';
import { useTouchLongPress } from '../../lib/canvas/touchEvents.js';
import './sidebar.css';

const BORDER_TYPE_OPTIONS = Object.keys(BorderTypeScheme);
const COLOR_OPTIONS = Object.keys(BorderColorScheme);
const BORDER_HINTS = {
    panel: 'border/Panel',
    greenPanel: 'border/GreenPanel',
    stack: 'border/StackBorder',
    flagLeft: 'border/FlagBorder',
    flagRight: 'border/FlagBorder',
    exit: 'border/ExitBorder',
};
const DIVIDER_OPTIONS = [
    {
        type: 'HDivider',
        label: 'Stack Divider',
        imageSrc: '/images/divider%20stack.svg',
        hintPath: 'divider/StackDivider',
    },
    {
        type: 'VDivider',
        label: 'Gantry Divider',
        imageSrc: '/images/divider%20gantry.svg',
        hintPath: 'divider/GantryDivider',
    },
    {
        type: 'VLane',
        label: 'Lane Line',
        imageSrc: '/images/divider%20lane.svg',
        hintPath: 'divider/LaneLine',
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
    const previewWidth = 250;
    const previewHeight = 250;
    const block = {
        width: borderType === 'exit' ? 600 : borderType.includes('Street') ? 600 : 3200,
        height: borderType.includes('Street') ? 100 : 2000,
    };
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

const HintableBorderItem = ({ hintPath, className, onClick, title, children }) => {
    const itemRef = useRef(null);
    const hintTimerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const modalHoverRef = useRef(false);
    const [hintModalState, setHintModalState] = useState({ isOpen: false, anchorRect: null });

    const clearTimers = () => {
        clearTimeout(hintTimerRef.current);
        clearTimeout(closeTimerRef.current);
    };

    const openHint = () => {
        clearTimeout(closeTimerRef.current);
        clearTimeout(hintTimerRef.current);
        hintTimerRef.current = setTimeout(() => {
            modalHoverRef.current = false;
            setHintModalState({
                isOpen: true,
                anchorRect: itemRef.current?.getBoundingClientRect?.() || null,
            });
        }, 250);
    };

    const scheduleCloseHint = () => {
        clearTimeout(hintTimerRef.current);
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = setTimeout(() => {
            if (!modalHoverRef.current) {
                setHintModalState({ isOpen: false, anchorRect: null });
            }
        }, 500);
    };

    const closeHint = () => {
        clearTimers();
        modalHoverRef.current = false;
        setHintModalState({ isOpen: false, anchorRect: null });
    };

    const { touchHandlers, shouldSuppressClick } = useTouchLongPress(
        () => {
            modalHoverRef.current = false;
            setHintModalState({
                isOpen: true,
                anchorRect: itemRef.current?.getBoundingClientRect?.() || null,
            });
        },
        { onLongPressEnd: () => scheduleCloseHint(2500) }
    );

    return (
        <div
            ref={itemRef}
            className="hintable-symbol-item"
            onMouseEnter={openHint}
            onMouseLeave={scheduleCloseHint}
            onFocus={openHint}
            onBlur={scheduleCloseHint}
            {...touchHandlers}
        >
            <button
                type="button"
                className={className}
                onClick={(event) => {
                    if (shouldSuppressClick()) {
                        return;
                    }
                    onClick(event);
                }}
                title={title}
            >
                {children}
            </button>
            <HintModal
                isOpen={hintModalState.isOpen}
                onClose={closeHint}
                hintPath={hintPath}
                anchorRect={hintModalState.anchorRect}
                onMouseEnter={() => {
                    clearTimeout(closeTimerRef.current);
                    modalHoverRef.current = true;
                }}
                onMouseLeave={() => {
                    modalHoverRef.current = false;
                    scheduleCloseHint();
                }}
            />
        </div>
    );
};

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
        const objects = (selectedObjects || [])//.filter((object) => object && object.functionalType !== 'Border');
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
        const canvas = getCanvas();
        if (!canvas) return;

        const activeBorder = { current: null };
        const hoverOverlay = { current: null };
        const compartmentOverlay = { current: null };

        const getCanvasPointer = (event) => {
            if (typeof canvas.getPointer === 'function') {
                return canvas.getPointer(event);
            }

            const source = event?.e || event || {};
            const rect = canvas?.lowerCanvasEl?.getBoundingClientRect?.() || { left: 0, top: 0 };
            return {
                x: (source.clientX ?? source.offsetX ?? 0) - rect.left,
                y: (source.clientY ?? source.offsetY ?? 0) - rect.top,
            };
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                cleanup();
                hideTextBox();
            }
        };

        const cleanup = () => {
            if (hoverOverlay.current) {
                canvas.remove(hoverOverlay.current);
                hoverOverlay.current = null;
            }
            if (compartmentOverlay.current) {
                compartmentOverlay.current.overlays.forEach((overlay) => canvas.remove(overlay));
                canvas.off('mouse:move', compartmentOverlay.current.onMouseMove);
                canvas.off('mouse:down', compartmentOverlay.current.onClick);
                compartmentOverlay.current = null;
            }
            canvas.off('mouse:move', handlePointerMove);
            canvas.off('mouse:down', handleCanvasClick);
            document.removeEventListener('keydown', handleEscape);
            hideTextBox();
            canvas.requestRenderAll?.();
        };

        const showBorderHoverOverlay = (border) => {
            if (!border?.inbbox) {
                border?.updateBboxes?.();
            }
            if (!border?.inbbox) return;
            if (hoverOverlay.current) {
                canvas.remove(hoverOverlay.current);
            }

            const bbox = border.inbbox;
            hoverOverlay.current = new Rect({
                left: bbox.left,
                top: bbox.top,
                width: bbox.right - bbox.left,
                height: bbox.bottom - bbox.top,
                fill: 'rgba(238, 255, 0, 0.6)',
                stroke: 'rgba(0,150,255,0.35)',
                strokeWidth: 1 / (canvas.getZoom?.() || 1),
                selectable: false,
                evented: false,
                objectCaching: false,
                originX: 'left',
                originY: 'top',
            });
            canvas.add(hoverOverlay.current);
            canvas.requestRenderAll?.();
        };

        const hideBorderHoverOverlay = () => {
            if (hoverOverlay.current) {
                canvas.remove(hoverOverlay.current);
                hoverOverlay.current = null;
            }
        };

        const placeDivider = (border, chosenBox, pointer) => {
            const finalBox = chosenBox || border?.compartmentBboxes?.find((box) => {
                if (!pointer) return false;
                return pointer.x >= box.left && pointer.x <= box.right && pointer.y >= box.top && pointer.y <= box.bottom;
            }) || null;

            const columns = border?.compartmentBboxes?.length
                ? [...new Set(border.compartmentBboxes.map((box) => box.left))].sort((a, b) => a - b)
                : [];
            const rows = border?.compartmentBboxes?.length
                ? [...new Set(border.compartmentBboxes.map((box) => box.top))].sort((a, b) => a - b)
                : [];
            const compartmentColumn = finalBox ? columns.indexOf(finalBox.left) : null;
            const compartmentRow = finalBox ? rows.indexOf(finalBox.top) : null;

            if (!border) return;
            const divider = (() => {
                const existing = new DividerObject({
                    dividerType,
                    borderGroup: border,
                    xHeight,
                    colorType: colorScheme,
                    compartmentBox: finalBox || border.inbbox,
                    compartmentColumn,
                    compartmentRow,
                    left: pointer?.x ?? border.inbbox.left,
                    top: pointer?.y ?? border.inbbox.top,
                });

                if (pointer && existing) {
                    if (dividerType === 'HDivider' || dividerType === 'HLine') {
                        existing.set({ left: pointer.x, top: pointer.y - existing.height / 2 });
                    } else {
                        existing.set({ left: pointer.x - existing.width / 2, top: pointer.y });
                    }
                    existing.setCoords();
                    border.assignWidthToDivider?.();
                }

                return existing;
            })();

            cleanup();

            if (divider) {
                canvas.requestRenderAll?.();
            }
        };

        const showCompartmentOverlay = (border) => {
            if (!border?.compartmentBboxes?.length) {
                border?.updateBboxes?.();
            }
            if (!border?.compartmentBboxes?.length) return;

            if (compartmentOverlay.current) {
                compartmentOverlay.current.overlays.forEach((overlay) => canvas.remove(overlay));
                canvas.off('mouse:move', compartmentOverlay.current.onMouseMove);
                canvas.off('mouse:down', compartmentOverlay.current.onClick);
            }

            const overlays = [];
            const dimColor = 'rgba(0,150,255,0.08)';
            const majorColor = 'rgba(0,150,255,0.25)';
            const strokeColor = 'rgba(0,150,255,0.5)';
            const zoom = canvas.getZoom?.() || 1;
            const strokeWidth = 1 / zoom;

            const onMouseMove = (opt) => {
                const pointer = canvas.getScenePoint?.(opt.e) || getCanvasPointer(opt);
                overlays.forEach((overlay) => {
                    const box = overlay._metaBox;
                    const inside = box && pointer.x >= box.left && pointer.x <= box.right && pointer.y >= box.top && pointer.y <= box.bottom;
                    overlay.set('fill', inside ? majorColor : dimColor);
                });
                canvas.requestRenderAll?.();
            };

            const onClick = (opt) => {
                const pointer = canvas.getScenePoint?.(opt.e) || getCanvasPointer(opt);
                let chosenBox = null;
                overlays.forEach((overlay) => {
                    const box = overlay._metaBox;
                    if (box && pointer.x >= box.left && pointer.x <= box.right && pointer.y >= box.top && pointer.y <= box.bottom) {
                        chosenBox = box;
                    }
                });

                if (!chosenBox) return;
                placeDivider(border, chosenBox, pointer);
            };

            border.compartmentBboxes.forEach((box) => {
                const rect = new Rect({
                    left: box.left,
                    top: box.top,
                    width: box.right - box.left,
                    height: box.bottom - box.top,
                    fill: dimColor,
                    stroke: strokeColor,
                    strokeWidth,
                    selectable: false,
                    evented: false,
                    objectCaching: false,
                    originX: 'left',
                    originY: 'top',
                });
                rect._metaBox = box;
                overlays.push(rect);
                canvas.add(rect);
            });

            compartmentOverlay.current = { overlays, onMouseMove, onClick };
            canvas.on('mouse:move', onMouseMove);
            canvas.on('mouse:down', onClick);
            canvas.requestRenderAll?.();
        };

        const handlePointerMove = (opt) => {
            const target = opt.target;
            const border = target && target.functionalType === 'Border' ? target : null;
            if (border) {
                activeBorder.current = border;
                showBorderHoverOverlay(border);
            } else {
                hideBorderHoverOverlay();
                activeBorder.current = null;
            }
        };

        const handleCanvasClick = (opt) => {
            const target = opt.target;
            const border = target && target.functionalType === 'Border' ? target : activeBorder.current;
            if (!border) return;
            border.updateBboxes?.();

            const pointer = canvas.getScenePoint?.(opt.e) || getCanvasPointer(opt);
            const chosenBox = border.compartmentBboxes?.find((box) => {
                return pointer.x >= box.left && pointer.x <= box.right && pointer.y >= box.top && pointer.y <= box.bottom;
            }) || null;

            if (chosenBox || !border.compartmentBboxes?.length) {
                placeDivider(border, chosenBox, pointer);
                return;
            }

            showCompartmentOverlay(border);
        };

        showTextBox(t('Click inside the border to place divider'), null, 'keydown', (event) => {
            if (event?.key === 'Escape') {
                cleanup();
                hideTextBox();
            }
        });

        document.addEventListener('keydown', handleEscape);
        canvas.on('mouse:move', handlePointerMove);
        canvas.on('mouse:down', handleCanvasClick);
        canvas.requestRenderAll?.();
    };

    return (
        <div className="space-y-4">
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
                    onChange={(e) => setXHeight(parseInt(e.target.value, 10) || 0)}
                />
            </div>

            <div className="input-group">
                <label className="input-label">
                    <span>{t('Color Scheme')}</span>
                    <HintButton hintPath="border/ColorPurpose" label={`${t('Color Scheme')} help`} />
                </label>
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
                        const hintPath = BORDER_HINTS[borderType];

                        return (
                            <HintableBorderItem
                                key={borderType}
                                hintPath={hintPath}
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
                            </HintableBorderItem>
                        );
                    })}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Add Divider to Border')}</label>
                <div className="divider-grid">
                    {DIVIDER_OPTIONS.map((divider) => (
                        <HintableBorderItem
                            key={divider.type}
                            hintPath={divider.hintPath}
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
                        </HintableBorderItem>
                    ))}
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                {t('Select canvas objects, then pick a border type to wrap them.')}
            </p>
        </div>
    );
}