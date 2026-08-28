import { Line, Group, Text, util } from 'fabric';
import { GeneralSettings } from '../../lib/utils/settings.js';

export const CanvasGlobals = {
  canvas: null,
  ctx: null,
  activeObject: null,
  activeVertex: null,
  canvasObject: [],
  canvasInteractionLocked: false,
  CenterCoord: null,
  scheduleRender: null,
};

export function initCanvasGlobals(fabricCanvas) {
  CanvasGlobals.canvas = fabricCanvas;
  CanvasGlobals.ctx = fabricCanvas.getContext("2d");

  CanvasGlobals.CenterCoord = () => {
    const viewportWidth = fabricCanvas.getWidth();
    const viewportHeight = fabricCanvas.getHeight();
    const sidebarRects = [...document.querySelectorAll('.main-panel, .slim-bar')]
      .map((element) => element.getBoundingClientRect());
    const isMobile = window.innerWidth <= 768;

    let screenCenter;
    if (isMobile) {
      const unobscuredBottom = sidebarRects.reduce((bottom, rect) => {
        const intersectsViewport = rect.right > 0 && rect.left < viewportWidth && rect.bottom > 0;
        return intersectsViewport ? Math.min(bottom, Math.max(0, rect.top)) : bottom;
      }, viewportHeight);

      screenCenter = {
        x: viewportWidth / 2,
        y: unobscuredBottom / 2
      };
    } else {
      const obscuredRight = sidebarRects.reduce((right, rect) => {
        const intersectsViewport = rect.bottom > 0 && rect.top < viewportHeight && rect.right > 0;
        return intersectsViewport ? Math.max(right, Math.min(viewportWidth, rect.right)) : right;
      }, 0);

      screenCenter = {
        x: (obscuredRight + viewportWidth) / 2,
        y: viewportHeight / 2
      };
    }

    return util.transformPoint(screenCenter, util.invertTransform(fabricCanvas.viewportTransform));
  };
}

export function DrawGrid() {
  if (!GeneralSettings.showGrid) return;
  const canvas = CanvasGlobals.canvas;
  if (!canvas || typeof canvas.calcViewportBoundaries !== 'function') return;

  const currentZoom = canvas.getZoom();
  const corners = canvas.calcViewportBoundaries();
  const xmin = corners.tl.x;
  const xmax = corners.br.x;
  const ymin = corners.tl.y;
  const ymax = corners.br.y;

  let gridDistance = 20;
  if (currentZoom < 0.05) gridDistance = 1000;
  else if (currentZoom < 0.1) gridDistance = 500;
  else if (currentZoom < 0.25) gridDistance = 200;
  else if (currentZoom < 0.5) gridDistance = 100;
  else if (currentZoom < 1) gridDistance = 50;
  else if (currentZoom < 2) gridDistance = 20;
  else if (currentZoom < 5) gridDistance = 10;
  else gridDistance = 5;

  const gridColor = GeneralSettings.gridColor || '#FFF';
  const strokeWidth = 0.1 / currentZoom;
  const gridLines = [];
  const constantFontSize = 12;
  const scaledFontSize = constantFontSize / currentZoom;
  const showLabels = currentZoom > 0.08;

  for (let x = Math.floor(xmin / gridDistance) * gridDistance; x <= xmax; x += gridDistance) {
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
      gridLines.push(new Line([x, ymin, x, ymax], {
        stroke: gridColor,
        strokeWidth: strokeWidth * 2,
        selectable: false,
        evented: false
      }));
    } else {
      gridLines.push(new Line([x, ymin, x, ymax], {
        stroke: gridColor,
        strokeWidth,
        selectable: false,
        evented: false
      }));
    }
  }

  for (let y = Math.floor(ymin / gridDistance) * gridDistance; y <= ymax; y += gridDistance) {
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
      gridLines.push(new Line([xmin, y, xmax, y], {
        stroke: gridColor,
        strokeWidth: strokeWidth * 2,
        selectable: false,
        evented: false,
      }));
    } else {
      gridLines.push(new Line([xmin, y, xmax, y], {
        stroke: gridColor,
        strokeWidth,
        selectable: false,
        evented: false,
      }));
    }
  }

  gridLines.push(new Line([0, ymin, 0, ymax], { stroke: '#888', strokeWidth: 0.5 / currentZoom, selectable: false, evented: false }));
  gridLines.push(new Line([xmin, 0, xmax, 0], { stroke: '#888', strokeWidth: 0.5 / currentZoom, selectable: false, evented: false }));

  const oldGrid = canvas.getObjects().find(obj => obj.id === 'grid');
  if (oldGrid) canvas.remove(oldGrid);

  const gridGroup = new Group(gridLines, { id: 'grid', selectable: false, evented: false });
  canvas.add(gridGroup);
  canvas.sendObjectToBack(gridGroup);
  canvas.requestRenderAll();
}

CanvasGlobals.scheduleRender = () => {
  requestAnimationFrame(() => {
    if (CanvasGlobals.canvas && typeof CanvasGlobals.canvas.requestRenderAll === 'function') {
      CanvasGlobals.canvas.requestRenderAll();
    } else if (fabricCanvas && typeof CanvasGlobals.canvas.renderAll === 'function') {
      CanvasGlobals.canvas.renderAll();
    }
  });
}
