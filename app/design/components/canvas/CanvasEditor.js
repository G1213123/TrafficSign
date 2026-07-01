'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { DrawGrid, initCanvasGlobals, CanvasGlobals } from '../../lib/canvas/canvas';
import { setupKeyboardEvents } from '../../lib/canvas/keyboardEvents';
import { setupMouseEvents } from '../../lib/canvas/mouseEvents';
import { setupTouchEvents } from '../../lib/canvas/touchEvents';
import { setupContextMenu } from '../../lib/utils/contexMenu';
import { initializePropertyPanel } from '../../lib/utils/property';
import { parseFont } from '../../lib/objects/path';

export default function CanvasEditor() {
    const canvasRef = useRef(null);
    const fabricCanvas = useRef(null);

    useEffect(() => {
        const canvas = new Canvas('canvas', {
            fireMiddleClick: true,
            fireRightClick: true,
            preserveObjectStacking: true,
            enableRetinaScaling: true,
        });
        
        fabricCanvas.current = canvas;
        canvas.setZoom(0.2);

        // Initialize global canvas access for lib scripts
        initCanvasGlobals(canvas);
        const cleanupKeyboardEvents = setupKeyboardEvents();
        const cleanupMouseEvents = setupMouseEvents(canvas);
        const cleanupTouchEvents = setupTouchEvents(canvas);
        const cleanupContextMenu = setupContextMenu(canvas);
        initializePropertyPanel(canvas);

        // Wait for fonts to be parsed before proceeding
        parseFont().then(() => {
            console.log("Fonts parsed, initializing editor components...");
            // If there are components that depend on parsed fonts, 
            // you can initialize them here or trigger a re-render.
        }).catch(err => {
            console.error("Font parsing failed:", err);
        });

        // ...existing code...

        // Initial resize and center
        resizeCanvas(canvas);

        // Handle window resize
        const handleResize = () => resizeCanvas(canvas);
        window.addEventListener('resize', handleResize);

        // Initial Grid
        DrawGrid();

        return () => {
            window.removeEventListener('resize', handleResize);
            cleanupContextMenu?.();
            cleanupKeyboardEvents?.();
            cleanupMouseEvents?.();
            cleanupTouchEvents?.();
            canvas.dispose();
        };
    }, []);

    const resizeCanvas = (canvas) => {
        const container = document.getElementById('canvas-container');
        if (!container) return;

        canvas.setDimensions({
            width: container.clientWidth,
            height: container.clientHeight
        });

        // Center the view
        canvas.absolutePan({
            x: -canvas.width / 2,
            y: -canvas.height / 2
        });

        DrawGrid();
        canvas.requestRenderAll();
    };

    return (
        <div id="canvas-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <canvas id="canvas" />
        </div>
    );
}
