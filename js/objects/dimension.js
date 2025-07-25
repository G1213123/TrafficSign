import { CanvasGlobals } from "../canvas/canvas.js";
const canvas = CanvasGlobals.canvas;

// Class to handle engineering style dimension displays for border objects
class BorderDimensionDisplay {
  constructor(options = {}) {
    this.direction = options.direction || 'horizontal'; // 'horizontal' or 'vertical'
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX !== undefined ? options.endX : this.startX;
    this.endY = options.endY !== undefined ? options.endY : this.startY;
    this.color = options.color || 'blue';
    this.offset = options.offset || 30;
    this.objects = [];

    this.createDimension();
  }

  createDimension() {
    // Scale adjustments based on zoom
    const zoom = canvas.getZoom();
    const lineWidth = 1 / zoom;
    const fontSize = 12 / zoom;
    const arrowSize = 8 / zoom;
    const extensionLength = 8 / zoom;

    // Create dimension lines based on direction
    if (this.direction === 'horizontal') {
      this.createHorizontalDimension(lineWidth, fontSize, arrowSize, extensionLength);
    } else {
      this.createVerticalDimension(lineWidth, fontSize, arrowSize, extensionLength);
    }

    // Add all objects to the canvas
    canvas.add(...this.objects);
  }

  createHorizontalDimension(lineWidth, fontSize, arrowSize, extensionLength) {
    // Position of the dimension line
    const dimLineY = this.startY - this.offset;
    const distance = Math.abs(this.endX - this.startX);

    // Extension lines
    this.objects.push(new fabric.Line(
      [this.startX, this.startY, this.startX, dimLineY - extensionLength],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    this.objects.push(new fabric.Line(
      [this.endX, this.startY, this.endX, dimLineY - extensionLength],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Main dimension line
    this.objects.push(new fabric.Line(
      [this.startX, dimLineY, this.endX, dimLineY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Add arrows
    this.addArrow(this.startX, dimLineY, this.endX > this.startX ? 'right' : 'left', arrowSize);
    this.addArrow(this.endX, dimLineY, this.endX > this.startX ? 'left' : 'right', arrowSize);

    // Add dimension text
    const midX = (this.startX + this.endX) / 2;
    this.objects.push(new fabric.Text(
      `${Math.round(distance)}mm`,
      {
        left: midX,
        top: dimLineY - (8 / canvas.getZoom()),
        fontSize: fontSize,
        fill: this.color,
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'bottom',
        selectable: false,
        evented: false,
        stroke: '#fff',
        strokeWidth: 3 / canvas.getZoom(),
        paintFirst: 'stroke'
      }
    ));
  }

  createVerticalDimension(lineWidth, fontSize, arrowSize, extensionLength) {
    // Position of the dimension line
    const dimLineX = this.startX - this.offset;
    const distance = Math.abs(this.endY - this.startY);

    // Extension lines
    this.objects.push(new fabric.Line(
      [this.startX, this.startY, dimLineX - extensionLength, this.startY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    this.objects.push(new fabric.Line(
      [this.startX, this.endY, dimLineX - extensionLength, this.endY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Main dimension line
    this.objects.push(new fabric.Line(
      [dimLineX, this.startY, dimLineX, this.endY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Add arrows
    this.addArrow(dimLineX, this.startY, this.endY > this.startY ? 'down' : 'up', arrowSize);
    this.addArrow(dimLineX, this.endY, this.endY > this.startY ? 'up' : 'down', arrowSize);

    // Add dimension text
    const midY = (this.startY + this.endY) / 2;

    // Create text with rotation for vertical dimension
    this.objects.push(new fabric.Text(
      `${Math.round(distance)}mm`,
      {
        left: dimLineX - (15 / canvas.getZoom()),
        top: midY,
        fontSize: fontSize,
        fill: this.color,
        fontFamily: 'Arial',
        angle: -90, // Rotate for vertical text
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        stroke: '#fff',
        strokeWidth: 3 / canvas.getZoom(),
        paintFirst: 'stroke'
      }
    ));
  }

  addArrow(x, y, direction, size) {
    let points;

    switch (direction) {
      case 'right':
        points = [
          { x: x, y: y },
          { x: x + size, y: y - size / 4 },
          { x: x + size, y: y + size / 4 }
        ];
        break;
      case 'left':
        points = [
          { x: x, y: y },
          { x: x - size, y: y - size / 4 },
          { x: x - size, y: y + size / 4 }
        ];
        break;
      case 'up':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y - size },
          { x: x + size / 4, y: y - size }
        ];
        break;
      case 'down':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y + size },
          { x: x + size / 4, y: y + size }
        ];
        break;
    }

    const arrow = new fabric.Polygon(points, {
      fill: this.color,
      stroke: this.color,
      strokeWidth: 0,
      selectable: false,
      evented: false
    });

    this.objects.push(arrow);
  }
}

// Class to handle radius dimension displays for corner radius
class RadiusDimensionDisplay {
  constructor(options = {}) {
    this.centerX = options.centerX;
    this.centerY = options.centerY;
    this.radius = options.radius;
    this.color = options.color || 'purple';
    this.startAngle = options.startAngle || 0; // Angle in degrees where to start the dimension
    this.objects = [];

    this.createRadiusDimension();
  }

  createRadiusDimension() {
    // Scale adjustments based on zoom
    const zoom = canvas.getZoom();
    const lineWidth = 1 / zoom;
    const fontSize = 12 / zoom;
    const arrowSize = 6 / zoom;

    // Convert start angle to radians
    const startAngleRad = (this.startAngle * Math.PI) / 180;
    
    // Calculate radius line end point
    const radiusEndX = this.centerX + this.radius * Math.cos(startAngleRad);
    const radiusEndY = this.centerY + this.radius * Math.sin(startAngleRad);

    // Create radius line from center to edge
    this.objects.push(new fabric.Line(
      [this.centerX, this.centerY, radiusEndX, radiusEndY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Add center point marker
    this.objects.push(new fabric.Circle({
      left: this.centerX,
      top: this.centerY,
      radius: 2 / zoom,
      fill: this.color,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false
    }));

    // Add arrow at the radius end
    this.addRadiusArrow(radiusEndX, radiusEndY, startAngleRad, arrowSize);

    // Add radius dimension text
    const textX = this.centerX - (this.radius * 0.2) * Math.cos(startAngleRad);
    const textY = this.centerY - (this.radius * 0.2) * Math.sin(startAngleRad);
    
    this.objects.push(new fabric.Text(
      `R${Math.round(this.radius)}mm`,
      {
        left: textX,
        top: textY,
        fontSize: fontSize,
        fill: this.color,
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        stroke: '#fff',
        strokeWidth: 3 / canvas.getZoom(),
        paintFirst: 'stroke'
      }
    ));


    // Add all objects to the canvas
    canvas.add(...this.objects);
  }

  addRadiusArrow(x, y, angle, size) {
    // Calculate arrow direction (pointing away from center)
    const arrowAngle1 = angle + Math.PI + Math.PI / 6;
    const arrowAngle2 = angle + Math.PI - Math.PI / 6;

    const points = [
      { x: x, y: y },
      { x: x + size * Math.cos(arrowAngle1), y: y + size * Math.sin(arrowAngle1) },
      { x: x + size * Math.cos(arrowAngle2), y: y + size * Math.sin(arrowAngle2) }
    ];

    const arrow = new fabric.Polygon(points, {
      fill: this.color,
      stroke: this.color,
      strokeWidth: 0,
      selectable: false,
      evented: false
    });

    this.objects.push(arrow);
  }


  // Remove radius dimension from canvas
  remove() {
    this.objects.forEach(obj => canvas.remove(obj));
    this.objects = [];
  }
}

export { BorderDimensionDisplay, RadiusDimensionDisplay };