'use client';

import React, { useEffect, useState } from 'react';
import { CanvasGlobals } from '../../components/canvas/canvas.js';
import { showPropertyPanel } from '../presentations/property';

export default function CanvasObjectList({ canvas }) {
    const [canvasObjects, setCanvasObjects] = useState([]);
    const [activeObject, setActiveObject] = useState(null);

    const syncCanvasObjects = () => {
        const objects = CanvasGlobals.canvasObject.filter(obj => obj && obj.id !== 'grid');
        setCanvasObjects(objects);

        const currentCanvas = canvas || CanvasGlobals.canvas;
        if (!currentCanvas) {
            setActiveObject(null);
            return;
        }

        const selected = currentCanvas.getActiveObjects?.() || [];
        setActiveObject(selected.length > 0 ? selected[selected.length - 1] : currentCanvas.getActiveObject?.() || null);
    };

    useEffect(() => {
        if (!canvas) {
            setCanvasObjects([]);
            setActiveObject(null);
            return;
        }

        syncCanvasObjects();

        const handleCanvasChange = () => syncCanvasObjects();
        const handleSelectionClear = () => {
            setActiveObject(null);
        };

        canvas.on('object:added', handleCanvasChange);
        canvas.on('object:removed', handleCanvasChange);
        canvas.on('selection:created', handleCanvasChange);
        canvas.on('selection:updated', handleCanvasChange);
        canvas.on('selection:cleared', handleSelectionClear);

        return () => {
            canvas.off('object:added', handleCanvasChange);
            canvas.off('object:removed', handleCanvasChange);
            canvas.off('selection:created', handleCanvasChange);
            canvas.off('selection:updated', handleCanvasChange);
            canvas.off('selection:cleared', handleSelectionClear);
        };
    }, [canvas]);

    useEffect(() => {
        if (!activeObject?.canvasID) return;

        const activeButton = document.querySelector(`[data-object-id="${activeObject.canvasID}"]`);
        activeButton?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [activeObject, canvasObjects]);

    const handleObjectSelect = (object) => {
        const currentCanvas = canvas || CanvasGlobals.canvas;
        if (!currentCanvas || !object) return;

        currentCanvas.setActiveObject(object);
        currentCanvas.requestRenderAll();
        setActiveObject(object);
    };

    const handleObjectDoubleClick = (object) => {
        handleObjectSelect(object);
        showPropertyPanel(object);
    };

    return (
        <div className="object-list-panel">
            {canvasObjects.length === 0 ? (
                <div className="object-list-empty">No objects on canvas</div>
            ) : (
                canvasObjects.map((object, index) => {
                    const isSelected = activeObject
                        ? activeObject === object || activeObject.canvasID === object.canvasID
                        : false;

                    return (
                        <button
                            key={object.canvasID ?? index}
                            type="button"
                            data-object-id={object.canvasID ?? index}
                            className={`object-list-button ${isSelected ? 'object-list-button-active' : ''}`}
                            onClick={() => handleObjectSelect(object)}
                            onDoubleClick={() => handleObjectDoubleClick(object)}
                        >
                            <span className="object-list-button-name">
                                {object._showName || object.className || object.functionalType || object.type || `Object ${index + 1}`}
                            </span>
                        </button>
                    );
                })
            )}
        </div>
    );
}