'use client';

import React, { useEffect, useState } from 'react';

import { CanvasGlobals } from '../canvas/canvas.js';
import { MainRoadSymbol } from '../../lib/objects/mainRoute.js';
import { SideRoadSymbol } from '../../lib/objects/sideRoute.js';
import SidebarToggleGroup from './SidebarToggleGroup.js';
import { useGeneralDrawSettings } from './DrawSettings.js';

const ROUTE_TYPES = ['Main Line', 'Roundabout', 'Spiral Roundabout', 'Diverge'];
const ROUNDABOUT_TYPES = ['Conventional', 'Spiral'];
const OVAL_POSITIONS = ['Left', 'Middle'];
const SIDE_SHAPES = ['Arrow', 'Stub', 'RedBar', 'Circular Sign', 'Circular Sign (with Arrow)'];
const SIDE_DIRECTIONS = ['Right', 'Left'];
const SIDE_ANGLES = ['45', '60', '90'];

export default function RouteMapPanel() {
    const { xHeight, color } = useGeneralDrawSettings();
    const [routeType, setRouteType] = useState('Main Line');
    const [roundaboutType, setRoundaboutType] = useState('Conventional');
    const [ovalPosition, setOvalPosition] = useState('Left');
    const [mainWidth, setMainWidth] = useState('6');
    const [rootLength, setRootLength] = useState('7');
    const [tipLength, setTipLength] = useState('12');
    const [innerCornerRadius, setInnerCornerRadius] = useState('1');
    const [outerCornerRadius, setOuterCornerRadius] = useState('4');
    const [sideDirection, setSideDirection] = useState('Right');
    const [sideShape, setSideShape] = useState('Arrow');
    const [sideWidth, setSideWidth] = useState('4');
    const [sideAngle, setSideAngle] = useState('45');
    const [statusText, setStatusText] = useState('');
    const [selectedMainRoad, setSelectedMainRoad] = useState(null);

    const getCanvas = () => CanvasGlobals.canvas;

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

        if (routeType === 'Roundabout' || routeType === 'Spiral Roundabout') {
            const isSpiral = routeType === 'Spiral Roundabout' || roundaboutType === 'Spiral';
            const roadTypeValue = isSpiral ? 'Spiral Roundabout' : 'Conventional Roundabout';
            const computedRootLength = parsedRootLength;
            const computedTipLength = parsedTipLength;
            const baseShape = isSpiral ? 'Auxiliary' : 'Normal';
            const roundaboutFeature = isSpiral ? baseShape : `${baseShape}${ovalPosition === 'Middle' ? ' Middle' : ''}`;

            return {
                routeList: [
                    {
                        x: centerPoint.x,
                        y: centerPoint.y + (computedRootLength + computedTipLength) * xHeight / 4,
                        angle: 180,
                        width,
                        shape: baseShape,
                    },
                    {
                        x: centerPoint.x,
                        y: centerPoint.y,
                        angle: 0,
                        width,
                        length: computedRootLength,
                        shape: 'Stub',
                    },
                ],
                xHeight,
                rootLength: computedRootLength,
                tipLength: computedTipLength,
                routeWidth: width,
                color: normalizedColor,
                roadType: roadTypeValue,
                RAfeature: roundaboutFeature,
                left: centerPoint.x - (width * xHeight / 8),
                top: centerPoint.y,
            };
        }

        const isDiverge = routeType === 'Diverge';
        const computedRootLength = parsedRootLength;
        const computedTipLength = parsedTipLength;
        const topShape = isDiverge ? 'LaneDrop' : 'Arrow';

        return {
            routeList: [
                {
                    x: centerPoint.x,
                    y: centerPoint.y + computedRootLength * xHeight / 4,
                    angle: 180,
                    length: computedTipLength,
                    width,
                    shape: 'Stub',
                },
                {
                    x: centerPoint.x,
                    y: centerPoint.y,
                    angle: 0,
                    length: computedRootLength,
                    width,
                    shape: topShape,
                },
            ],
            xHeight,
            rootLength: computedRootLength,
            tipLength: computedTipLength,
            routeWidth: width,
            color: normalizedColor,
            roadType: 'Main Line',
            innerCornerRadius: isDiverge ? parsedInnerCornerRadius : null,
            outerCornerRadius: isDiverge ? parsedOuterCornerRadius : null,
            left: centerPoint.x - (width * xHeight / 8),
            top: centerPoint.y,
        };
    };

    const prepareRouteMap = () => {
        const canvas = getCanvas();
        if (!canvas) {
            setStatusText('Canvas is not ready yet.');
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
        setStatusText('Main road created.');
    };

    const addSideRoad = () => {
        const canvas = getCanvas();
        if (!canvas) {
            setStatusText('Canvas is not ready yet.');
            return;
        }

        const mainRoad = resolveActiveMainRoad(canvas);
        if (!mainRoad) {
            setStatusText('Select a main road first.');
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
        setStatusText('Side road created.');
    };

    return (
        <div className="space-y-4">
            <SidebarToggleGroup
                label="Main Road Type"
                options={ROUTE_TYPES}
                value={routeType}
                onChange={setRouteType}
            />

            {routeType === 'Roundabout' || routeType === 'Spiral Roundabout' ? (
                <SidebarToggleGroup
                    label="Roundel Shape"
                    options={ROUNDABOUT_TYPES}
                    value={roundaboutType}
                    onChange={setRoundaboutType}
                />
            ) : null}

            {routeType === 'Roundabout' || routeType === 'Spiral Roundabout' ? (
                <SidebarToggleGroup
                    label="Oval Position"
                    options={OVAL_POSITIONS}
                    value={ovalPosition}
                    onChange={setOvalPosition}
                />
            ) : null}

            <div className="input-group">
                <label className="input-label">Main Road Width</label>
                <input
                    type="number"
                    className="input-field"
                    value={mainWidth}
                    step="0.1"
                    onChange={(e) => setMainWidth(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label className="input-label">Approach Length</label>
                <input
                    type="number"
                    className="input-field"
                    value={rootLength}
                    step="0.1"
                    onChange={(e) => setRootLength(e.target.value)}
                />
            </div>

            <div className="input-group">
                <label className="input-label">Exit Length</label>
                <input
                    type="number"
                    className="input-field"
                    value={tipLength}
                    step="0.1"
                    onChange={(e) => setTipLength(e.target.value)}
                />
            </div>

            {routeType === 'Diverge' ? (
                <>
                    <div className="input-group">
                        <label className="input-label">Inner Corner Radius</label>
                        <input
                            type="number"
                            className="input-field"
                            value={innerCornerRadius}
                            step="0.1"
                            onChange={(e) => setInnerCornerRadius(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Outer Corner Radius</label>
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
                <label className="input-label">Route Layout</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5 }}>
                    Main-road creation is now wired. Select a main road and use side-road controls below to add branches.
                </div>
            </div>

            <div className="input-group">
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={prepareRouteMap}>
                        Prepare Route Map
                    </button>
                </div>
            </div>

            {selectedMainRoad ? (
                <>
                    <div className="input-group">
                        <label className="input-label">Side Road</label>
                        <SidebarToggleGroup
                            label="Direction"
                            options={SIDE_DIRECTIONS}
                            value={sideDirection}
                            onChange={setSideDirection}
                        />
                        <SidebarToggleGroup
                            label="Shape"
                            options={SIDE_SHAPES}
                            value={sideShape}
                            onChange={setSideShape}
                        />
                        <SidebarToggleGroup
                            label="Angle"
                            options={SIDE_ANGLES}
                            value={sideAngle}
                            onChange={setSideAngle}
                        />
                        <label className="input-label">Side Road Width</label>
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
                                Add Side Road
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