'use client';

import React, { useEffect, useState } from 'react';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { MainRoadSymbol } from '../../lib/objects/mainRoute.js';
import { SideRoadSymbol } from '../../lib/objects/sideRoute.js';
import SidebarToggleGroup from '../shared/SidebarToggleGroup.js';
import { routePermittedAngle } from '../../lib/templates/mapTemplate.js';
import { GeneralDrawSettings, useGeneralDrawSettings } from './DrawSettings.js';
import AngleSelector, { getNextAngle } from '../shared/AngleSelector.js';

const ROUTE_TYPES = ['Main Line', 'Roundabout'];
const MAIN_LINE_SUBTYPES = ['Arrow', 'Stub', 'RedBar', 'LaneDrop', 'T-Junction', 'Y-Junction'];
const ROUNDABOUT_SUBTYPES = ['Conventional', 'Spiral', 'Oval', 'Double'];
const ROUNDABOUT_FEATURES = {
    'Conventional': ['Normal', 'Auxiliary', 'U-turn'],
    'Spiral': ['Normal', 'Auxiliary', 'U-turn'],
    'Oval': ['Normal'],
    'Double': ['Conventional', 'Spiral'],
};
const SIDE_SHAPES = ['Arrow', 'Stub', 'RedBar', 'Circular Sign', 'Circular Sign (with Arrow)'];
const SIDE_DIRECTIONS = ['Right', 'Left'];
const SIDE_ANGLES = ['45', '60', '90'];

export default function RouteMapPanel() {
    const { t } = useI18n();
    const { xHeight, setXHeight, color, setColor } = useGeneralDrawSettings();
    const [routeType, setRouteType] = useState('Main Line');
    const [subType, setSubType] = useState('Arrow');
    const [roundaboutType, setRoundaboutType] = useState('Normal');
    const [mainWidth, setMainWidth] = useState('6');
    const [rootLength, setRootLength] = useState('12');
    const [tipLength, setTipLength] = useState('7');
    const [innerCornerRadius, setInnerCornerRadius] = useState('1');
    const [outerCornerRadius, setOuterCornerRadius] = useState('4');
    const [sideDirection, setSideDirection] = useState('Right');
    const [sideShape, setSideShape] = useState('Arrow');
    const [sideWidth, setSideWidth] = useState('4');
    const [sideAngle, setSideAngle] = useState('45');
    const [mainAngle, setMainAngle] = useState(0);
    const [statusText, setStatusText] = useState('');
    const [selectedMainRoad, setSelectedMainRoad] = useState(null);
    const [permittedAngles, setPermittedAngles] = useState([-90, -60, -45, -30, 0, 30, 45, 60, 90]);

    const getCanvas = () => CanvasGlobals.canvas;
    const translateOptions = (options) => options.map((option) => ({ value: option, label: t(option) }));

    useEffect(() => {
        const syncSelectedMainRoad = () => {
            const canvas = getCanvas();
            if (!canvas) {
                setSelectedMainRoad(null);
                return;
            }

            const activeObject = canvas.getActiveObject?.() || null;
            setSelectedMainRoad(activeObject?.functionalType === 'MainRoad' ? activeObject : null);
        };

        syncSelectedMainRoad();

        const canvas = getCanvas();
        if (!canvas) return undefined;

        canvas.on('selection:created', syncSelectedMainRoad);
        canvas.on('selection:updated', syncSelectedMainRoad);
        canvas.on('selection:cleared', syncSelectedMainRoad);
        canvas.on('object:modified', syncSelectedMainRoad);

        return () => {
            canvas.off('selection:created', syncSelectedMainRoad);
            canvas.off('selection:updated', syncSelectedMainRoad);
            canvas.off('selection:cleared', syncSelectedMainRoad);
            canvas.off('object:modified', syncSelectedMainRoad);
        };
    }, []);

    const resolveNumber = (value, fallback) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const resolveActiveMainRoad = (canvas) => {
        const selectedObjects = canvas.getActiveObjects?.() || [];
        const selectedMainRoad = selectedObjects.find((object) => object?.functionalType === 'MainRoad');
        if (selectedMainRoad) return selectedMainRoad;

        const activeObject = canvas.getActiveObject?.();
        if (activeObject?.functionalType === 'MainRoad') return activeObject;
        if (activeObject?.functionalType === 'SideRoad' && activeObject?.mainRoad) return activeObject.mainRoad;

        const objects = canvas.getObjects?.() || [];
        for (let index = objects.length - 1; index >= 0; index -= 1) {
            if (objects[index]?.functionalType === 'MainRoad') {
                return objects[index];
            }
        }

        return null;
    };

    const buildRouteOptions = (centerPoint) => {
        const width = resolveNumber(mainWidth, 6);
        const normalizedColor = (color || 'White').toLowerCase();
        const parsedRootLength = resolveNumber(rootLength, 7);
        const parsedTipLength = resolveNumber(tipLength, 12);
        const parsedInnerCornerRadius = resolveNumber(innerCornerRadius, 1);
        const parsedOuterCornerRadius = resolveNumber(outerCornerRadius, 4);
        const resolvedMainAngle = resolveNumber(mainAngle, 0);

        if (routeType === 'Roundabout') {
            const roadTypeValue = subType === 'Spiral' ? 'Spiral Roundabout' : (subType === 'Oval' ? 'Oval Roundabout' : (subType === 'Double' ? 'Double Roundabout' : 'Conventional Roundabout'));

            let computedRootLength = parsedRootLength;
            let computedTipLength = parsedTipLength;

            // Legacy logic for specific roundabout types
            if (subType === 'Oval') {
                computedTipLength = 24;
            } else if (subType === 'Double') {
                computedTipLength = roundaboutType === 'Spiral' ? 38 : 28;
            }

            const angleRad = resolvedMainAngle * Math.PI / 180;
            const cosA = Math.cos(angleRad);
            const sinA = Math.sin(angleRad);
            const baseShape = roundaboutType + (subType === 'Oval' ? ' ' + resolvedMainAngle : '');

            return {
                routeList: [
                    {
                        x: centerPoint.x + (computedTipLength * sinA * xHeight / 4),
                        y: centerPoint.y - (computedTipLength * cosA * xHeight / 4),
                        angle: resolvedMainAngle,
                        width,
                        length: computedTipLength,
                        shape: baseShape,
                    },
                    {
                        x: centerPoint.x,
                        y: centerPoint.y,
                        angle: 180 + resolvedMainAngle,
                        width,
                        length: computedRootLength,
                        shape: baseShape,
                    },
                ],
                xHeight,
                rootLength: computedRootLength,
                tipLength: computedTipLength,
                routeWidth: width,
                color: normalizedColor,
                roadType: roadTypeValue,
                RAfeature: baseShape,
                mainAngle: resolvedMainAngle,
                left: centerPoint.x - (width * xHeight / 8),
                top: centerPoint.y,
            };
        }

        const isDiverge = subType === 'LaneDrop'
        const isTJunction = subType === 'T-Junction';
        const isYJunction = subType === 'Y-Junction';
        const computedTipLength = parsedTipLength;
        const topShape = subType;

        // Calculate rotation for the whole route
        const angleRad = resolvedMainAngle * Math.PI / 180;
        const cosA = Math.cos(angleRad);
        const sinA = Math.sin(angleRad);

        const routeList = [
            {
                x: centerPoint.x - Math.sin(angleRad) * tipLength * xHeight / 4,
                y: centerPoint.y + (Math.cos(angleRad) * tipLength + (width / 2 * (1 - Math.cos(angleRad)))) * xHeight / 4,
                angle: 180,
                length: parsedRootLength,
                width,
                shape: 'Stub',
            },
        ];

        if (isTJunction || isYJunction) {
            const relativeAngle = isTJunction ? -90 : -30;
            const absoluteAngle = resolvedMainAngle + relativeAngle;
            const absAngleRad = absoluteAngle * Math.PI / 180;
            const widthMod = isYJunction ? (width * 2) / 3 : width;

            routeList.push({
                x: centerPoint.x + 2 * Math.sin(absAngleRad) * computedTipLength * xHeight / 4,
                y: centerPoint.y - 2 * Math.cos(absAngleRad) * computedTipLength * xHeight / 4, // Adjusted for rotation
                angle: absoluteAngle,
                length: computedTipLength,
                width: widthMod,
                shape: topShape,
            });

            routeList.push({
                x: centerPoint.x - 2 * Math.sin(absAngleRad) * computedTipLength * xHeight / 4,
                y: centerPoint.y - 2 * Math.cos(absAngleRad) * computedTipLength * xHeight / 4, // Adjusted for rotation
                angle: -absoluteAngle,
                length: computedTipLength,
                width: widthMod,
                shape: topShape,
            });
        } else {
            routeList.push({
                x: centerPoint.x,
                y: centerPoint.y,
                angle: resolvedMainAngle,
                length: computedTipLength,
                width,
                shape: topShape,
            },)
        }

        return {
            routeList: routeList,
            xHeight,
            rootLength: parsedRootLength,
            tipLength: computedTipLength,
            routeWidth: width,
            color: normalizedColor,
            roadType: 'Main Line',
            innerCornerRadius: isDiverge ? parsedInnerCornerRadius : null,
            outerCornerRadius: isDiverge ? parsedOuterCornerRadius : null,
            mainAngle: resolvedMainAngle,
            left: centerPoint.x - (width * xHeight / 8),
            top: centerPoint.y,
        };
    };

    const activateMapVertexControl = (mapObject) => {
        if (!mapObject || !mapObject.routeList) return;

        const vertexName = mapObject.roadType?.includes('Roundabout') ? 'C1' : 'V1';
        const v2 = mapObject.getBasePolygonVertex(vertexName);
        if (v2) {
            const vertexControl = mapObject.roadType?.includes('Roundabout') ? mapObject.controls.C1 : mapObject.controls.V1;

            if (vertexControl) {
                vertexControl.onCleanup = () => {
                    setSelectedMainRoad(null);
                };

                vertexControl.onClick({
                    button: 0,
                    type: 'mousedown'
                });
            }
        }
    }

    const prepareRouteMap = () => {
        const canvas = getCanvas();
        if (!canvas) {
            setStatusText(t('Canvas is not ready yet.'));
            return;
        }

        const centerPoint = canvas.getCenterPoint?.() || {
            x: (canvas.width || 0) / 2,
            y: (canvas.height || 0) / 2,
        };

        const routeOptions = buildRouteOptions(centerPoint);
        const routeObject = new MainRoadSymbol(routeOptions);

        canvas.setActiveObject?.(routeObject);
        canvas.requestRenderAll?.();
        activateMapVertexControl(routeObject);
        setStatusText(t('Main road created.'));
    };

    const addSideRoad = () => {
        const canvas = getCanvas();
        if (!canvas) {
            setStatusText(t('Canvas is not ready yet.'));
            return;
        }

        const mainRoad = resolveActiveMainRoad(canvas);
        if (!mainRoad) {
            setStatusText(t('Select a main road first.'));
            return;
        }

        const anchor = mainRoad.routeList?.[1] || canvas.getCenterPoint?.() || { x: 0, y: 0 };
        const resolvedSideWidth = resolveNumber(sideWidth, 4);
        const resolvedSideAngle = Math.abs(resolveNumber(sideAngle, 45));
        const isLeftSide = sideDirection === 'Left';
        const signedAngle = isLeftSide ? -resolvedSideAngle : resolvedSideAngle;
        const xOffset = (isLeftSide ? -1 : 1) * Math.max(16, resolvedSideWidth * 4) * xHeight / 4;
        const yOffset = -Math.max(10, resolveNumber(rootLength, 7)) * xHeight / 8;

        const sideRoad = new SideRoadSymbol({
            xHeight: mainRoad.xHeight || xHeight,
            color: mainRoad.color || (color || 'White').toLowerCase(),
            mainRoad,
            side: isLeftSide,
            routeList: [
                {
                    x: anchor.x + xOffset,
                    y: anchor.y + yOffset,
                    angle: signedAngle,
                    shape: sideShape,
                    width: resolvedSideWidth,
                },
            ],
        });

        canvas.setActiveObject?.(sideRoad);
        canvas.requestRenderAll?.();
        activateMapVertexControl(sideRoad);
        setStatusText(t('Side road created.'));
    };

    return (
        <div className="space-y-4">
            <GeneralDrawSettings
                xHeight={xHeight}
                onXHeightChange={setXHeight}
                color={color}
                onColorChange={setColor}
            />

            <SidebarToggleGroup
                label={t('Main Road Type')}
                options={translateOptions(ROUTE_TYPES)}
                value={routeType}
                onChange={(val) => {
                    setRouteType(val);
                    if (val === 'Main Line') setSubType('Arrow');
                    else if (val === 'Roundabout') setSubType('Conventional');

                    const angleKey = subType + ' ' + val;
                    setPermittedAngles(routePermittedAngle[angleKey] || routePermittedAngle[val] || []);
                }}
            />

            {routeType === 'Main Line' && (
                <SidebarToggleGroup
                    label={t('Main Road Sub-type')}
                    options={translateOptions(MAIN_LINE_SUBTYPES)}
                    value={subType}
                    onChange={
                        (val) => {
                            setSubType(val);
                            const angleKey = val + ' ' + routeType;
                            setPermittedAngles(routePermittedAngle[angleKey] || routePermittedAngle[routeType] || []);
                            if (['Arrow', 'Stub', 'RedBar'].includes(val)) {
                                setTipLength(12);
                            } else if (val === 'LaneDrop') {
                                setTipLength(18.45);
                                setInnerCornerRadius(1);
                                setOuterCornerRadius(4);
                                setMainAngle(-60);
                            } else if (val === 'T-Junction' || val === 'Y-Junction') {
                                setTipLength(12);
                                setMainAngle(0);
                            }
                        }
                    }
                />
            )}

            {routeType === 'Roundabout' && (
                <SidebarToggleGroup
                    label={t('Roundabout Sub-type')}
                    options={translateOptions(ROUNDABOUT_SUBTYPES)}
                    value={subType}
                    onChange={(val) => {
                        setSubType(val);
                        setRoundaboutType(val === 'Double' ? 'Conventional' : 'Normal');
                        setMainAngle(0);
                        const angleKey = val === 'Spiral' ? 'Spiral Roundabout' : (val === 'Oval' ? 'Oval Roundabout' : (val === 'Double' ? 'Double Roundabout' : 'Conventional Roundabout'));
                        setPermittedAngles(routePermittedAngle[angleKey] || []);
                    }}
                />
            )}

            {routeType === 'Roundabout' && subType !== 'Oval' && (
                <SidebarToggleGroup
                    label={t('Roundel Shape')}
                    options={translateOptions(ROUNDABOUT_FEATURES[subType] || [])}
                    value={roundaboutType}
                    onChange={setRoundaboutType}
                />
            )}

            <div className="input-group">
                <label className="input-label">{t('Main Road Angle')}</label>
                {permittedAngles.length > 0 ? (
                    <AngleSelector
                        value={mainAngle}
                        options={permittedAngles}
                        label={t('Main Road Angle')}
                        onChange={(nextAngle) => setMainAngle(nextAngle)}
                        onRotateLeft={() => setMainAngle(getNextAngle(permittedAngles, mainAngle, 'left'))}
                        onRotateRight={() => setMainAngle(getNextAngle(permittedAngles, mainAngle, 'right'))}
                    />
                ) : null}
            </div>

            <div className="input-group">
                <label className="input-label">{t('Approach Length')}</label>
                <input
                    type="number"
                    className="input-field"
                    value={rootLength}
                    step="0.1"
                    onChange={(e) => setRootLength(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label className="input-label">{t('Exit Length')}</label>
                <input
                    type="number"
                    className="input-field"
                    value={tipLength}
                    step="0.1"
                    onChange={(e) => setTipLength(e.target.value)}
                />
            </div>

            {routeType === 'Main Line' && subType === 'LaneDrop' ? (
                <>
                    <div className="input-group">
                        <label className="input-label">{t('Inner Corner Radius')}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={innerCornerRadius}
                            step="0.1"
                            onChange={(e) => setInnerCornerRadius(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('Outer Corner Radius')}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={outerCornerRadius}
                            step="0.1"
                            onChange={(e) => setOuterCornerRadius(e.target.value)}
                        />
                    </div>
                </>
            ) : null}


            <div className="input-group">
                <label className="input-label">{t('Route Layout')}</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5 }}>
                    {t('Main-road creation is now wired. Select a main road and use side-road controls below to add branches.')}
                </div>
            </div>

            <div className="input-group">
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={prepareRouteMap}>
                        {t('Add Main Road')}
                    </button>
                </div>
            </div>

            {selectedMainRoad ? (
                <>
                    <div className="input-group">
                        <label className="input-label">{t('Side Road')}</label>
                        <SidebarToggleGroup
                            label={t('Shape')}
                            options={translateOptions(SIDE_SHAPES)}
                            value={sideShape}
                            onChange={setSideShape}
                        />
                        <SidebarToggleGroup
                            label={t('Angle')}
                            options={translateOptions(SIDE_ANGLES)}
                            value={sideAngle}
                            onChange={setSideAngle}
                        />
                        <label className="input-label">{t('Side Road Width')}</label>
                        <input
                            type="number"
                            className="input-field"
                            value={sideWidth}
                            step="0.1"
                            onChange={(e) => setSideWidth(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <div className="toggle-container">
                            <button type="button" className="toggle-button" onClick={addSideRoad}>
                                {t('Add Side Road')}
                            </button>
                        </div>
                    </div>
                </>
            ) : null}

            {statusText ? (
                <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                    {statusText}
                </p>
            ) : null}
        </div>
    );
}