export const CanvasGlobals = {
  canvas: null,
  ctx: null,
  activeObject: null,
  activeVertex: null,
  canvasObject: [],
  CenterCoord: null,
  scheduleRender: null,
};

export function initCanvasGlobals(fabricCanvas) {
  CanvasGlobals.canvas = fabricCanvas;
  CanvasGlobals.ctx = fabricCanvas.getContext("2d");
  
  CanvasGlobals.CenterCoord = () => {
    const zoom = fabricCanvas.getZoom();
    const vpt = fabricCanvas.viewportTransform;
    return {
      x: fabric.util.invertTransform(vpt)[4] + (fabricCanvas.width / zoom) / 2,
      y: fabric.util.invertTransform(vpt)[5] + (fabricCanvas.height / zoom) / 2
    };
  };

  CanvasGlobals.scheduleRender = () => {
    requestAnimationFrame(() => {
      if (fabricCanvas && typeof fabricCanvas.requestRenderAll === 'function') {
        fabricCanvas.requestRenderAll();
      } else if (fabricCanvas && typeof fabricCanvas.renderAll === 'function') {
        fabricCanvas.renderAll();
      }
    });
  };
}
