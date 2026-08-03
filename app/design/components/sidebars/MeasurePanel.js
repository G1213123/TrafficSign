'use client';

import React, { useEffect, useRef, useState } from 'react';

import { Circle, Line } from 'fabric';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { showTextBox, hideTextBox } from '../presentations/promptBox.js';

export default function MeasurePanel() {
    const { t } = useI18n();
    const [activeMeasurement, setActiveMeasurement] = useState(false);
    const snapHighlightRef = useRef(null);
    const firstVertexHighlightRef = useRef(null);
    const dynamicLineRef = useRef(null);
    const snapTargetRef = useRef(null);
    const firstVertexRef = useRef(null);

    const getCanvas = () => CanvasGlobals.canvas;

    const clearMeasureHighlight = () => {
        const canvas = getCanvas();
        if (!canvas) return;

        if (snapHighlightRef.current) {
            canvas.remove(snapHighlightRef.current);
            snapHighlightRef.current = null;
        }

        if (firstVertexHighlightRef.current) {
            canvas.remove(firstVertexHighlightRef.current);
            firstVertexHighlightRef.current = null;
        }

        if (dynamicLineRef.current) {
            canvas.remove(dynamicLineRef.current);
            dynamicLineRef.current = null;
        }
    };

    const clearFirstVertexHighlight = () => {
        const canvas = getCanvas();
        if (!canvas || !firstVertexHighlightRef.current) return;

        canvas.remove(firstVertexHighlightRef.current);
        firstVertexHighlightRef.current = null;
    };

    const clearDynamicLine = () => {
        const canvas = getCanvas();
        if (!canvas || !dynamicLineRef.current) return;

        canvas.remove(dynamicLineRef.current);
        dynamicLineRef.current = null;
    };

    const vertexHighlightSize = () => {
        const canvas = getCanvas();
        const zoom = canvas?.getZoom?.() || 1;
        return {
            radius: (20 + 5) / 2 / zoom,
            strokeWidth: 2 / zoom,
            lineWidth: 2 / zoom,
        };
    };

    const seekVertices = (pointer) => {
        const canvas = getCanvas();
        if (!canvas) return;

        clearMeasureHighlight();
        snapTargetRef.current = null;

        let closestDistance = 30;
        let closestVertex = null;
        let closestObject = null;

        (CanvasGlobals.canvasObject || []).forEach((obj) => {
            if (!obj?.basePolygon?.vertex) return;

            obj.basePolygon.vertex.forEach((vertex) => {
                const dx = vertex.x - pointer.x;
                const dy = vertex.y - pointer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestVertex = vertex;
                    closestObject = obj;
                }
            });
        });

        if (!closestVertex) {
            canvas.defaultCursor = 'crosshair';
            clearDynamicLine();
            CanvasGlobals.scheduleRender();
            return;
        }

        snapTargetRef.current = {
            object: closestObject,
            vertex: closestVertex,
        };

        canvas.defaultCursor = 'pointer';
        const { radius, strokeWidth } = vertexHighlightSize();
        snapHighlightRef.current = new Circle({
            left: closestVertex.x,
            top: closestVertex.y,
            radius,
            fill: 'transparent',
            stroke: '#FFFF00',
            strokeWidth,
            selectable: false,
            evented: false,
            originX: 'center',
            originY: 'center',
        });

        canvas.add(snapHighlightRef.current);
        CanvasGlobals.scheduleRender();
    };

    const handleMeasureMouseMove = (event) => {
        const canvas = getCanvas();
        if (!canvas || !CanvasGlobals.activeMeasurement) return;

        const pointer = canvas.getScenePoint?.(event.e) || canvas.getPointer?.(event.e);
        if (!pointer) return;

        seekVertices(pointer);

        if (firstVertexRef.current) {
            clearDynamicLine();
            const zoom = canvas.getZoom?.() || 1;
            dynamicLineRef.current = new Line(
                [
                    firstVertexRef.current.x,
                    firstVertexRef.current.y,
                    pointer.x,
                    pointer.y,
                ],
                {
                    stroke: '#FF00FF',
                    strokeWidth: 2 / zoom,
                    strokeDashArray: [5, 5],
                    selectable: false,
                    evented: false,
                }
            );

            canvas.add(dynamicLineRef.current);
            CanvasGlobals.scheduleRender();
        }
    };

    const handleMeasureMouseDown = (event) => {
        const canvas = getCanvas();
        if (!canvas || !CanvasGlobals.activeMeasurement) return;
        if (event.e.button !== 0 && event.e.type !== 'touchend') return;

        if (!snapTargetRef.current) return;

        if (!firstVertexRef.current) {
            clearDynamicLine();
            firstVertexRef.current = {
                x: snapTargetRef.current.vertex.x,
                y: snapTargetRef.current.vertex.y,
                label: snapTargetRef.current.vertex.label,
                objectId: snapTargetRef.current.object.canvasID,
            };

            if (firstVertexHighlightRef.current) {
                canvas.remove(firstVertexHighlightRef.current);
            }

            const { radius, strokeWidth } = vertexHighlightSize();
            firstVertexHighlightRef.current = new Circle({
                left: firstVertexRef.current.x,
                top: firstVertexRef.current.y,
                radius,
                fill: 'transparent',
                stroke: '#FF00FF',
                strokeWidth,
                selectable: false,
                evented: false,
                originX: 'center',
                originY: 'center',
            });

            canvas.add(firstVertexHighlightRef.current);
            CanvasGlobals.scheduleRender();
            return;
        }

        const secondVertex = {
            x: snapTargetRef.current.vertex.x,
            y: snapTargetRef.current.vertex.y,
            label: snapTargetRef.current.vertex.label,
            objectId: snapTargetRef.current.object.canvasID,
        };

        const deltaX = Math.round(secondVertex.x - firstVertexRef.current.x);
        const deltaY = Math.round(secondVertex.y - firstVertexRef.current.y);
        const distance = Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY));

        const measurementText = `${t('Measurement Results')}:\n` +
            `ΔX: ${deltaX}\n` +
            `ΔY: ${deltaY}\n` +
            `${t('Distance')}: ${distance}\n\n` +
            `${t('From')}: ${firstVertexRef.current.label} (Object #${firstVertexRef.current.objectId})\n` +
            `${t('To')}: ${secondVertex.label} (Object #${secondVertex.objectId})\n\n` +
            `(${t('Press Enter to continue')})`;

        firstVertexRef.current = null;
        clearDynamicLine();

        showTextBox(measurementText, ' ', 'keydown')
            .catch(() => {})
            .finally(() => {
                clearFirstVertexHighlight();
                clearMeasureHighlight();
                canvas.defaultCursor = 'crosshair';
                CanvasGlobals.scheduleRender();
            });
    };

    useEffect(() => {
        return () => {
            CanvasGlobals.activeMeasurement = false;
            const canvas = getCanvas();
            if (canvas) {
                canvas.off('mouse:move', handleMeasureMouseMove);
                canvas.off('mouse:down', handleMeasureMouseDown);
                canvas.defaultCursor = 'default';
                canvas.requestRenderAll?.();
            }
            clearMeasureHighlight();
        };
    }, []);

    useEffect(() => {
        const canvas = getCanvas();
        if (!canvas) return undefined;

        if (activeMeasurement) {
            clearMeasureHighlight();
            firstVertexRef.current = null;
            snapTargetRef.current = null;
            CanvasGlobals.activeMeasurement = true;
            canvas.defaultCursor = 'crosshair';
            canvas.on('mouse:move', handleMeasureMouseMove);
            canvas.on('mouse:down', handleMeasureMouseDown);
        } else {
            CanvasGlobals.activeMeasurement = false;
            canvas.defaultCursor = 'default';
            canvas.off('mouse:move', handleMeasureMouseMove);
            canvas.off('mouse:down', handleMeasureMouseDown);
            clearMeasureHighlight();
        }

        return () => {
            canvas.off('mouse:move', handleMeasureMouseMove);
            canvas.off('mouse:down', handleMeasureMouseDown);
        };
    }, [activeMeasurement]);

    const toggleMeasurement = () => {
        const nextValue = !activeMeasurement;
        setActiveMeasurement(nextValue);
        CanvasGlobals.activeMeasurement = nextValue;

        const canvas = getCanvas();
        if (canvas) {
            canvas.defaultCursor = nextValue ? 'crosshair' : 'default';
            if (!nextValue) {
                hideTextBox();
                clearDynamicLine();
            }
            canvas.requestRenderAll?.();
        }
    };

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">{t('Instructions')}</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5 }}>
                    {t('Click vertices to measure distance. When measuring is active, vertex dragging is disabled and the cursor switches to a crosshair.')}
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Measurement Control')}</label>
                <button type="button" className={`toggle-button ${activeMeasurement ? 'object-list-button-active' : ''}`} onClick={toggleMeasurement}>
                    {activeMeasurement ? t('Stop Measuring') : t('Start Measuring')}
                </button>
            </div>
        </div>
    );
}