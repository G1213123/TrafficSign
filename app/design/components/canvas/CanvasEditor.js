'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Line, Group, Text } from 'fabric'
import { initCanvasGlobals } from '../../lib/canvas/canvas';

export default function CanvasEditor({ canvasInstance }) {
  const canvasRef = useRef(null);
  const fabricCanvas = useRef(null);
  const [zoom, setZoom] = useState(0.2);

  useEffect(() => {
    if (!canvasInstance) return;
    
    const canvas = canvasInstance;
    canvas.setZoom(zoom);
    
    // Initialize global canvas access for lib scripts
    initCanvasGlobals(canvas);
    
    // ...existing code...

        // Initial resize and center
        resizeCanvas(canvas);

        // Handle window resize
        const handleResize = () => resizeCanvas(canvas);
        window.addEventListener('resize', handleResize);

        // --- PANNING LOGIC (Middle Mouse) ---
        let isDragging = false;
        let lastPosX = 0;
        let lastPosY = 0;

        canvas.on('mouse:down', (opt) => {
            const e = opt.e;
            if (e.button === 1) { // Middle mouse button
                isDragging = true;
                canvas.selection = false;
                lastPosX = e.clientX;
                lastPosY = e.clientY;
            }
        });

        canvas.on('mouse:move', (opt) => {
            const e = opt.e;
            if (isDragging) {
                const vpt = canvas.viewportTransform;
                vpt[4] += e.clientX - lastPosX;
                vpt[5] += e.clientY - lastPosY;
                canvas.requestRenderAll();
                lastPosX = e.clientX;
                lastPosY = e.clientY;
                drawGrid(canvas);
            }
        });

        canvas.on('mouse:up', () => {
            isDragging = false;
            canvas.selection = true;
        });

        // --- ZOOM LOGIC (Mouse Wheel) ---
        canvas.on('mouse:wheel', (opt) => {
            const e = opt.e;
            e.preventDefault();
            e.stopPropagation();

            let currentZoom = canvas.getZoom();
            const delta = e.deltaY;
            currentZoom *= 0.999 ** delta;

            if (currentZoom > 20) currentZoom = 20;
            if (currentZoom < 0.01) currentZoom = 0.01;

            canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, currentZoom);
            setZoom(currentZoom);
            drawGrid(canvas);
            canvas.requestRenderAll();
        });

        // Initial Grid
        drawGrid(canvas);

        return () => {
            window.removeEventListener('resize', handleResize);
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

        drawGrid(canvas);
        canvas.requestRenderAll();
    };

    const drawGrid = (canvas) => {
        const currentZoom = canvas.getZoom();
        const corners = canvas.calcViewportBoundaries();
        const xmin = corners.tl.x;
        const xmax = corners.br.x;
        const ymin = corners.tl.y;
        const ymax = corners.br.y;

        // Dynamic grid distance based on zoom (from legacy code)
        let gridDistance = 20;
        if (currentZoom < 0.05) gridDistance = 1000;
        else if (currentZoom < 0.1) gridDistance = 500;
        else if (currentZoom < 0.25) gridDistance = 200;
        else if (currentZoom < 0.5) gridDistance = 100;
        else if (currentZoom < 1) gridDistance = 50;
        else if (currentZoom < 2) gridDistance = 20;
        else if (currentZoom < 5) gridDistance = 10;
        else gridDistance = 5;

        const gridColor = '#888888'; // Darker for the dark theme
        const strokeWidth = 0.1 / currentZoom;

        const gridLines = [];

        const constantFontSize = 12;
        const scaledFontSize = constantFontSize / currentZoom;
        const showLabels = currentZoom > 0.08;

        // Vertical lines
        for (let x = Math.floor(xmin / gridDistance) * gridDistance; x <= xmax; x += gridDistance) {
            gridLines.push(new Line([x, ymin, x, ymax], {
                stroke: gridColor,
                strokeWidth: strokeWidth,
                selectable: false,
                evented: false
            }));

            if (showLabels && Math.abs(x % (5 * gridDistance)) < 1e-6) {
                gridLines.push(new Text(String(x), {
                    left: x + 2 / currentZoom,
                    top: 2 / currentZoom,
                    fill: gridColor,
                    selectable: false,
                    evented: false,
                    fontSize: scaledFontSize,
                    originX: 'left',
                    originY: 'top'
                }));
            }
        }

        // Horizontal lines
        for (let y = Math.floor(ymin / gridDistance) * gridDistance; y <= ymax; y += gridDistance) {
            gridLines.push(new Line([xmin, y, xmax, y], {
                stroke: gridColor,
                strokeWidth: strokeWidth,
                selectable: false,
                evented: false,
            }));

            if (showLabels && Math.abs(y % (5 * gridDistance)) < 1e-6) {
                gridLines.push(new Text(String(y), {
                    left: 2 / currentZoom,
                    top: y + 2 / currentZoom,
                    fill: gridColor,
                    selectable: false,
                    evented: false,
                    fontSize: scaledFontSize,
                    originY: 'top',
                    originX: 'left'
                }));
            }
        }


        // Origin lines
        gridLines.push(new Line([0, ymin, 0, ymax], { stroke: '#888', strokeWidth: 0.5 / currentZoom, selectable: false, evented: false }));
        gridLines.push(new Line([xmin, 0, xmax, 0], { stroke: '#888', strokeWidth: 0.5 / currentZoom, selectable: false, evented: false }));

        // Remove old grid
        const oldGrid = canvas.getObjects().find(obj => obj.id === 'grid');
        if (oldGrid) canvas.remove(oldGrid);

        const gridGroup = new Group(gridLines, { id: 'grid', selectable: false, evented: false });
        canvas.add(gridGroup);
        canvas.sendObjectToBack(gridGroup);
        canvas.requestRenderAll();
    };

    return (
        <div id="canvas-container" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
            <canvas id="canvas" />
        </div>
    );
}
