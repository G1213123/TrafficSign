/* Export Panel */
let FormExportComponent = {
  // Export settings for canvas objects
  exportSettings: {
    filename: 'traffic-sign-export',
    quality: 1.0,
    multiplier: 1.0
  },

  exportPanelInit: function (parent) {
    tabNum = 5
    var parent = GeneralHandler.PanelInit()
    // Create container for export options
    const exportContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);

    // Create filename input
    const filenameInput = GeneralHandler.createInput('export-filename', 'Filename', exportContainer,
      FormExportComponent.exportSettings.filename, (e) => {
        FormExportComponent.exportSettings.filename = e.target.value;
      }, 'input');

    // Create quality selector for raster formats
    const qualitySelect = GeneralHandler.createSelect('export-quality', 'Quality',
      ['1.0', '0.9', '0.8', '0.7', '0.5'], exportContainer, '1.0',
      (e) => {
        FormExportComponent.exportSettings.quality = parseFloat(e.target.value);
      });

    // Create scale multiplier
    const scaleInput = GeneralHandler.createInput('export-scale', 'Scale Multiplier', exportContainer,
      FormExportComponent.exportSettings.multiplier, (e) => {
        FormExportComponent.exportSettings.multiplier = parseFloat(e.target.value);
      }, 'input');

    // Create toggle for including/excluding grid
    GeneralHandler.createToggle('Include Grid', ['No', 'Yes'], exportContainer, 'No');

    // Create toggle for including/excluding background
    GeneralHandler.createToggle('Include Background', ['No', 'Yes'], exportContainer, 'No');

    // Create export buttons
    const buttonContainer = GeneralHandler.createNode("div", { 'class': 'export-buttons-container' }, exportContainer);

    // PNG Export
    GeneralHandler.createButton('export-png', 'Export as PNG', buttonContainer, 'input',
      FormExportComponent.exportToPNG, 'click');

    // SVG Export
    GeneralHandler.createButton('export-svg', 'Export as SVG', buttonContainer, 'input',
      FormExportComponent.exportToSVG, 'click');

    // PDF Export
    GeneralHandler.createButton('export-pdf', 'Export as PDF', buttonContainer, 'input',
      FormExportComponent.exportToPDF, 'click');

    // DXF Export
    GeneralHandler.createButton('export-dxf', 'Export as DXF (Outline Only)', buttonContainer, 'input',
      FormExportComponent.exportToDXF, 'click');
  },

  // Helper function to prepare canvas for export
  prepareCanvasForExport: function () {
    const includeGrid = GeneralHandler.getToggleValue('Include Grid-container') === 'Yes';
    const includeBackground = GeneralHandler.getToggleValue('Include Background-container') === 'Yes';

    // Store original canvas state
    const originalState = {
      backgroundColor: canvas.backgroundColor,
      width: canvas.width,
      height: canvas.height,
      viewportTransform: [...canvas.viewportTransform],
      zoom: canvas.getZoom(),
      objects: canvas.getObjects().map(obj => ({
        obj: obj,
        visible: obj.visible
      }))
    };

    // Calculate the bounding box that contains all visible objects (excluding grid)
    const visibleObjects = canvas.getObjects().filter(obj =>
      obj.visible && (includeGrid || obj.id !== 'grid')
    );

    if (visibleObjects.length > 0) {
      // Find the bounds of all objects
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      visibleObjects.forEach(obj => {
        // Get the object's bounding rect in canvas coordinates
        const rect = obj.getBoundingRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.left + rect.width);
        maxY = Math.max(maxY, rect.top + rect.height);
      });

      // Add padding around the objects
      const padding = 20;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      // Calculate dimensions
      const width = maxX - minX;
      const height = maxY - minY;

      // Store the calculated export bounds for later use
      originalState.exportBounds = {
        left: minX,
        top: minY,
        width: width,
        height: height
      };

      // Temporarily resize canvas to fit all objects and center view
      canvas.setDimensions({
        width: width,
        height: height
      });

      // Reset the zoom to 1 (100%)
      canvas.setZoom(1);

      // Center the view on the objects
      canvas.setViewportTransform([1, 0, 0, 1, -minX, -minY]);
    }

    // Set background to transparent if not including it
    if (!includeBackground) {
      canvas.backgroundColor = 'rgba(0,0,0,0)'; // Transparent background
    }

    if (!includeGrid) {
      // Hide grid and grid-related objects
      canvas.getObjects().forEach(obj => {
        if (obj.id === 'grid') {
          obj.visible = false;
        }
      });
    }

    canvas.renderAll();
    return originalState;
  },

  // Helper function to restore canvas after export
  restoreCanvasAfterExport: function (originalState) {
    // Restore original canvas dimensions
    canvas.setDimensions({
      width: originalState.width,
      height: originalState.height
    });

    // Restore original zoom and viewport transform
    canvas.setViewportTransform(originalState.viewportTransform);

    // Restore background
    canvas.backgroundColor = originalState.backgroundColor;

    // Restore object visibility
    originalState.objects.forEach(item => {
      item.obj.visible = item.visible;
    });

    canvas.renderAll();
  },

  combineSvgPaths: function (svgString) {
    // Parse the SVG string into a DOM element
    var parser = new DOMParser();
    var svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    var svgElement = svgDoc.documentElement;
    
    // Get attributes that might affect position
    var viewBox = svgElement.getAttribute('viewBox');
    var viewBoxValues = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 0, 0];
    var viewBoxX = viewBoxValues[0] || 0;
    var viewBoxY = viewBoxValues[1] || 0;
    
    // Get all path elements containing lines and curves
    var paths = svgElement.getElementsByTagName('path');
    var lines = svgElement.getElementsByTagName('line');
    
    // Use a single combined path for DXF export
    var combinedPathData = '';
    
    // Function to apply transformation matrix to a point
    function applyTransform(matrix, x, y) {
      return {
        x: matrix.a * x + matrix.c * y + matrix.e,
        y: matrix.b * x + matrix.d * y + matrix.f
      };
    }
    
    // Function to get transformation matrix from a transform attribute
    function getTransformMatrix(element) {
      // Create a default identity matrix
      var matrix = {a: 1, b: 0, c: 0, d: 1, e: 0, f: 0};
      
      // Handle parent transformations recursively
      var currentElement = element;
      var transformList = [];
      
      while (currentElement && currentElement !== svgElement) {
        if (currentElement.getAttribute('transform')) {
          transformList.unshift(currentElement.getAttribute('transform'));
        }
        currentElement = currentElement.parentElement;
      }
      
      // Apply all transformations
      for (var i = 0; i < transformList.length; i++) {
        var transform = transformList[i];
        
        // Parse transform attribute (simplified for common transforms)
        if (transform.includes('translate')) {
          var translateMatch = transform.match(/translate\s*\(\s*([^,\s]+)(?:\s*,\s*([^,\s]+))?\s*\)/);
          if (translateMatch) {
            var tx = parseFloat(translateMatch[1]) || 0;
            var ty = parseFloat(translateMatch[2]) || 0;
            // Apply translation to matrix
            matrix.e += tx;
            matrix.f += ty;
          }
        }
        
        if (transform.includes('rotate')) {
          var rotateMatch = transform.match(/rotate\s*\(\s*([^,\s]+)(?:\s*,\s*([^,\s]+)(?:\s*,\s*([^,\s]+))?)?\s*\)/);
          if (rotateMatch) {
            var angle = parseFloat(rotateMatch[1]) || 0;
            var cx = parseFloat(rotateMatch[2]) || 0;
            var cy = parseFloat(rotateMatch[3]) || 0;
            
            // Convert angle to radians
            var rad = angle * Math.PI / 180;
            var cos = Math.cos(rad);
            var sin = Math.sin(rad);
            
            // If rotation is around a point other than origin
            if (cx !== 0 || cy !== 0) {
              // Translate to origin
              matrix.e += cx;
              matrix.f += cy;
              
              // Apply rotation
              var newA = matrix.a * cos - matrix.b * sin;
              var newB = matrix.a * sin + matrix.b * cos;
              var newC = matrix.c * cos - matrix.d * sin;
              var newD = matrix.c * sin + matrix.d * cos;
              matrix.a = newA;
              matrix.b = newB;
              matrix.c = newC;
              matrix.d = newD;
              
              // Translate back
              matrix.e -= cx;
              matrix.f -= cy;
            } else {
              // Simple rotation around origin
              var newA = matrix.a * cos - matrix.b * sin;
              var newB = matrix.a * sin + matrix.b * cos;
              var newC = matrix.c * cos - matrix.d * sin;
              var newD = matrix.c * sin + matrix.d * cos;
              matrix.a = newA;
              matrix.b = newB;
              matrix.c = newC;
              matrix.d = newD;
            }
          }
        }
      }
      
      return matrix;
    }
    
    // Process all path elements (which contain lines and curves)
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var pathData = path.getAttribute('d');
      
      if (pathData && pathData.trim() !== '') {
        var matrix = getTransformMatrix(path);
        
        // Create a simplified path object by extracting control points
        var commands = pathData.match(/[MmLlCcQqTtSsAaZz][^MmLlCcQqTtSsAaZz]*/g) || [];
        var currentX = 0;
        var currentY = 0;
        var firstX = 0;
        var firstY = 0;
        var transformedPath = '';
        
        for (var j = 0; j < commands.length; j++) {
          var command = commands[j][0]; // First character is the command type
          var params = commands[j].substring(1).trim().split(/[\s,]+/).map(parseFloat).filter(p => !isNaN(p));
          
          switch (command) {
            case 'M': // Move to (absolute)
              if (params.length >= 2) {
                currentX = params[0];
                currentY = params[1];
                firstX = currentX;
                firstY = currentY;
                
                // Transform the point
                var transformed = applyTransform(matrix, currentX, currentY);
                currentX = transformed.x;
                currentY = transformed.y;
                firstX = currentX;
                firstY = currentY;
                
                // Add to transformed path
                transformedPath += 'M ' + currentX.toFixed(3) + ' ' + currentY.toFixed(3) + ' ';
              }
              break;
              
            case 'L': // Line to (absolute)
              if (params.length >= 2) {
                var x = params[0];
                var y = params[1];
                
                // Transform end point
                var end = applyTransform(matrix, x, y);
                
                // Add to transformed path
                transformedPath += 'L ' + end.x.toFixed(3) + ' ' + end.y.toFixed(3) + ' ';
                
                currentX = end.x;
                currentY = end.y;
              }
              break;
              
            case 'C': // Cubic bezier (absolute)
              if (params.length >= 6) {
                var x1 = params[0];
                var y1 = params[1];
                var x2 = params[2];
                var y2 = params[3];
                var x = params[4];
                var y = params[5];
                
                // Transform all control points
                var cp1 = applyTransform(matrix, x1, y1);
                var cp2 = applyTransform(matrix, x2, y2);
                var end = applyTransform(matrix, x, y);
                
                // Add to transformed path
                transformedPath += 'C ' + 
                  cp1.x.toFixed(3) + ' ' + cp1.y.toFixed(3) + ' ' +
                  cp2.x.toFixed(3) + ' ' + cp2.y.toFixed(3) + ' ' +
                  end.x.toFixed(3) + ' ' + end.y.toFixed(3) + ' ';
                
                currentX = end.x;
                currentY = end.y;
              }
              break;
              
            case 'Z': // Close path
              transformedPath += 'Z ';
              currentX = firstX;
              currentY = firstY;
              break;
              
            // For any other commands, we just leave them unchanged for now
            default:
              // This handles lowercase (relative) commands and others not explicitly handled
              transformedPath += commands[j] + ' ';
              break;
          }
        }
        
        // Add this path's transformed data to the combined path
        combinedPathData += transformedPath + ' ';
      }
    }
    
    // Process direct line elements
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var x1 = parseFloat(line.getAttribute('x1') || 0);
      var y1 = parseFloat(line.getAttribute('y1') || 0);
      var x2 = parseFloat(line.getAttribute('x2') || 0);
      var y2 = parseFloat(line.getAttribute('y2') || 0);
      
      var matrix = getTransformMatrix(line);
      var start = applyTransform(matrix, x1, y1);
      var end = applyTransform(matrix, x2, y2);
      
      // Add to combined path as a move + line
      combinedPathData += 'M ' + start.x.toFixed(3) + ' ' + start.y.toFixed(3) + ' ';
      combinedPathData += 'L ' + end.x.toFixed(3) + ' ' + end.y.toFixed(3) + ' ';
    }
    
    return combinedPathData.trim();
  },

  exportToPNG: function () {
    const options = {
      format: 'png',
      quality: FormExportComponent.exportSettings.quality,
      multiplier: FormExportComponent.exportSettings.multiplier
    };

    // Prepare canvas for export
    const originalState = FormExportComponent.prepareCanvasForExport();

    // Generate the export
    const dataURL = canvas.toDataURL(options);

    // Restore canvas
    FormExportComponent.restoreCanvasAfterExport(originalState);

    // Create the download link
    const link = document.createElement('a');
    link.download = `${FormExportComponent.exportSettings.filename}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToSVG: function () {
    // Prepare canvas for export
    const originalState = FormExportComponent.prepareCanvasForExport();

    const includeBackground = GeneralHandler.getToggleValue('Include Background-container') === 'Yes';

    // Add a temporary background rectangle if background should be included
    if (includeBackground && originalState.exportBounds) {
      // Add a temporary background rectangle that matches the export bounds
      const bgColor = canvas.backgroundColor || '#ffffff';
      const bgRect = new fabric.Rect({
        left: originalState.exportBounds.left,
        top: originalState.exportBounds.top,
        width: originalState.exportBounds.width,
        height: originalState.exportBounds.height,
        fill: bgColor,
        selectable: false,
        evented: false,
        id: 'temp-export-bg'
      });

      // Insert at the bottom of the stack
      canvas.insertAt(0, bgRect);
      originalState.tempBackgroundRect = bgRect;
    }

    // Generate the SVG data
    const svgData = canvas.toSVG({
      // SVG-specific options
      viewBox: {
        x: originalState.exportBounds ? originalState.exportBounds.left : 0,
        y: originalState.exportBounds ? originalState.exportBounds.top : 0,
        width: originalState.exportBounds ? originalState.exportBounds.width : canvas.width,
        height: originalState.exportBounds ? originalState.exportBounds.height : canvas.height
      }
    });

    // Remove temporary background rectangle if it was added
    if (originalState.tempBackgroundRect) {
      canvas.remove(originalState.tempBackgroundRect);
    }

    // Restore canvas
    FormExportComponent.restoreCanvasAfterExport(originalState);

    // Create the download
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${FormExportComponent.exportSettings.filename}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportToDXF: function () {
    // Prepare canvas for export
    const originalState = FormExportComponent.prepareCanvasForExport();

    try {
      // Create a new DXF document using our npm module
      const dxf = new DxfWriter();
      
      // Set document properties
      dxf.setUnits('Millimeters');
      dxf.addLayer('Outlines', 1, 'continuous', 'red');
      
      // Check if we have any objects to export
      if (!canvasObject || canvasObject.length === 0) {
        throw new Error('No objects available for export');
      }
      
      // Track the bounds to adjust coordinates later
      let minX = Infinity, minY = Infinity;
      const pathObjects = [];
      
      // First, recursively collect all path objects
      function collectPathObjects(obj) {
        // Skip grid objects
        if (obj.id === 'grid') return;
        
        // If the object has a basePolygon with _objects
        if (obj.basePolygon && obj.basePolygon._objects) {
          obj.basePolygon._objects.forEach(nestedObj => {
            collectNestedPathObjects(nestedObj, pathObjects);
          });
        } 
        // If it's a fabric Group object that might contain paths
        else if (obj.type === 'group' && obj._objects) {
          obj._objects.forEach(nestedObj => {
            collectNestedPathObjects(nestedObj, pathObjects);
          });
        }
        // Direct path objects
        else if (obj.type === 'path') {
          pathObjects.push(obj);
        }
        // Direct rect objects
        else if (obj.type === 'rect') {
          const rectPathObj = convertRectToPath(obj);
          if (rectPathObj) pathObjects.push(rectPathObj);
        }
      }
      
      // Function to recursively collect path objects from nested structures
      function collectNestedPathObjects(obj, collection) {
        // Skip nulls or undefined
        if (!obj) return;
        
        if (obj.type === 'path') {
          collection.push(obj);
        } 
        else if (obj.type === 'rect') {
          const rectPathObj = convertRectToPath(obj);
          if (rectPathObj) collection.push(rectPathObj);
        }
        else if (obj.type === 'group' && obj._objects) {
          obj._objects.forEach(nestedObj => {
            collectNestedPathObjects(nestedObj, collection);
          });
        }
      }
      
      // Helper function to convert a rectangle to a path object
      function convertRectToPath(rectObj) {
        if (!rectObj || !rectObj.width || !rectObj.height) return null;
        
        // Create a path representing the rectangle outline
        const left = rectObj.left || 0;
        const top = rectObj.top || 0;
        const width = rectObj.width;
        const height = rectObj.height;
        
        // Create a pathData array in the format expected by processPathForDXF
        return {
          type: 'path',
          path: [
            ['M', left, top],
            ['L', left + width, top],
            ['L', left + width, top + height],
            ['L', left, top + height],
            ['Z']
          ]
        };
      }
      
      // Collect all path objects from canvasObject
      canvasObject.forEach(obj => {
        collectPathObjects(obj);
      });
      
      // Now find the min bounds across all collected path objects
      pathObjects.forEach(obj => {
        // For normal objects with getBoundingRect
        if (obj.getBoundingRect) {
          const bounds = obj.getBoundingRect(true);
          minX = Math.min(minX, bounds.left);
          minY = Math.min(minY, bounds.top);
        } 
        // For synthetic path objects (from rectangles)
        else if (obj.path) {
          obj.path.forEach(cmd => {
            if (cmd[0] === 'M' || cmd[0] === 'L') {
              minX = Math.min(minX, cmd[1]);
              minY = Math.min(minY, cmd[2]);
            }
          });
        }
      });
      
      // Apply an offset to ensure all objects are in the positive quadrant
      const offsetX = minX < 0 ? -minX : 0;
      const offsetY = minY < 0 ? -minY : 0;
      
      // Process each path object for DXF export
      pathObjects.forEach(pathObj => {
        FormExportComponent.processPathForDXF(pathObj, dxf, offsetX, offsetY);
      });
      
      // Generate the DXF content
      const dxfContent = dxf.toDxfString();
      
      // Create download link
      const blob = new Blob([dxfContent], { type: 'application/dxf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${FormExportComponent.exportSettings.filename}.dxf`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("DXF export failed:", error);
      alert("DXF export failed: " + error.message);
    } finally {
      // Ensure canvas is restored even on error
      FormExportComponent.restoreCanvasAfterExport(originalState);
    }
  },
  
  // Helper method to process a path object for DXF export
  processPathForDXF: function(pathObj, dxf, offsetX, offsetY) {
    // Convert path to polyline
    const pathData = pathObj.path || [];
    let currentX = 0, currentY = 0;
    let points = [];
    
    for (let i = 0; i < pathData.length; i++) {
      const command = pathData[i][0];
      const values = pathData[i].slice(1);
      
      switch (command) {
        case 'M': // moveTo
          currentX = values[0] + offsetX;
          currentY = values[1] + offsetY;
          points = [[currentX, currentY]];
          break;
          
        case 'L': // lineTo
          currentX = values[0] + offsetX;
          currentY = values[1] + offsetY;
          points.push([currentX, currentY]);
          break;
          
        case 'C': // bezierCurveTo - approximate with multiple line segments
          const startX = currentX;
          const startY = currentY;
          const cp1x = values[0] + offsetX;
          const cp1y = values[1] + offsetY;
          const cp2x = values[2] + offsetX;
          const cp2y = values[3] + offsetY;
          const endX = values[4] + offsetX;
          const endY = values[5] + offsetY;
          
          // Add several points along the bezier curve to approximate it
          for (let t = 0.1; t <= 1; t += 0.1) {
            const bx = Math.pow(1-t, 3) * startX + 
                     3 * Math.pow(1-t, 2) * t * cp1x + 
                     3 * (1-t) * Math.pow(t, 2) * cp2x + 
                     Math.pow(t, 3) * endX;
                     
            const by = Math.pow(1-t, 3) * startY + 
                     3 * Math.pow(1-t, 2) * t * cp1y + 
                     3 * (1-t) * Math.pow(t, 2) * cp2y + 
                     Math.pow(t, 3) * endY;
                     
            points.push([bx, by]);
          }
          currentX = endX;
          currentY = endY;
          break;
          
        case 'Z': // closePath
          if (points.length > 0 && (points[0][0] !== currentX || points[0][1] !== currentY)) {
            points.push([points[0][0], points[0][1]]);
          }
          break;
      }
      
      if (command === 'Z' || i === pathData.length - 1) {
        if (points.length > 1) {
          // Add the polyline to the DXF
          dxf.drawPolyline(points, 'Outlines', true);
        }
        points = [];
      }
    }
  },
} 

// Export the FormExportComponent for use in other files