import { CanvasGlobals } from "../canvas/canvas.js";
import { calculateTransformedPoints, convertVertexToPathCommands, getFontPath, convertFontPathToFabricPath } from "./path.js";
import { canvasTracker } from "../utils/Tracker.js";
import { VertexControl } from "./vertex.js";
import { BorderDimensionDisplay } from "./dimension.js";
import { LockIcon } from "./lock.js";
import { globalAnchorTree, anchorShape } from './anchor.js';
import { parsedFontMedium, parsedFontHeavy, parsedFontKorean } from "./path.js";
import { showPropertyPanel, handleClear } from "../utils/property.js";
import { BaseGroup, canvasObject } from './BaseGroup.js';

import { Group, Path } from 'fabric';

const canvas = CanvasGlobals.canvas; // Assuming canvas is a global variable in canvas.js

const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";


// additional property for fabric object
//const originalToObject = fabric.Object.prototype.toObject;
//const myAdditional = ['functionalType'];
//fabric.Object.prototype.toObject = function (additionalProperties) {
//  return originalToObject.call(this, myAdditional.concat(additionalProperties));
//}


class GlyphPath extends Group {
  constructor(options) {
    super([], options); // Call the parent class constructor first

    //this.initialize(shapeMeta, options);
  }

  initialize(shapeMeta, options) {
    shapeMeta.path.map((p) => {
      let transformed = calculateTransformedPoints(p.vertex, {
        x: options.left,
        y: options.top,
        angle: options.angle
      });
      p.vertex = transformed;
    });

    if (shapeMeta.text) {
      shapeMeta.text.map((p) => {
        let transformed = calculateTransformedPoints([{ x: p.x, y: -p.y, label: '' }], {
          x: options.left,
          y: options.top,
          angle: options.angle
        });
        p.x = transformed[0].x;
        p.y = -transformed[0].y;
      });
    }

    const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
    const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));

    options.left = vertexleft;
    options.top = vertextop;
    options.angle = 0;
    options.strokeWidth = 0;

    // Store vertex data for reference
    this.vertex = shapeMeta.path.map(p => p.vertex).flat();
    this.insertPoint = shapeMeta.path[0].vertex[0];

    // Create fabric.Path objects directly from vertex data
    shapeMeta.path.forEach(path => {
      const pathCommands = convertVertexToPathCommands(path);
      const pathObj = new Path(pathCommands, {
        fill: path.fill || options.fill || 'white',
        stroke: options.stroke || 'none',
        strokeWidth: options.strokeWidth || 0,
        objectCaching: options.objectCaching,
        originX: 'left',
        originY: 'top'
      });
      this.add(pathObj);
    });

    // Add text elements if present
    if (shapeMeta.text && shapeMeta.text.length > 0) {
      shapeMeta.text.forEach(textElem => {
        let fontGlyphs;
        switch (textElem.fontFamily) {
          case 'TransportMedium':
            fontGlyphs = parsedFontMedium;
            break;
          case 'TransportHeavy':
            fontGlyphs = parsedFontHeavy;
            break;
          default:
            fontGlyphs = parsedFontKorean;
        }
        // Access font metrics
        const fontMetrics = {
          unitsPerEm: fontGlyphs.unitsPerEm,
          ascender: fontGlyphs.ascender,
          descender: fontGlyphs.descender,
        };

        // Scale metrics to desired font size
        const fontScale = textElem.fontSize / fontMetrics.unitsPerEm;
        const scaledAscender = (fontMetrics.unitsPerEm - fontMetrics.ascender) * fontScale;

        const yOffset = scaledAscender;
        textElem.y = textElem.y - yOffset;
        const charPath = getFontPath(textElem);
        if (charPath && charPath.commands) {
          // Convert font path commands to fabric.Path format
          const pathCommands = convertFontPathToFabricPath(charPath.commands, textElem);
          const textPathObj = new Path(pathCommands, {
            fill: textElem.fill || options.fill || 'black',
            stroke: 'none',
            strokeWidth: 0,
            objectCaching: options.objectCaching,
            originX: 'left',
            originY: 'top'
          });
          this.add(textPathObj);
        }
      });
    }

    this.setCoords();
  }

}




export { GlyphPath };