/* Export Panel */
let FormExportComponent = {
  // Export settings for canvas objects
  exportSettings: {
    filename: 'traffic-sign-export',
    quality: 1.0,
    multiplier: 1.0,
    paperSize: 'A3', // Default paper size
    // Paper sizes in mm (width, height)
    paperSizes: {
      'A0': [841, 1189],
      'A1': [594, 841],
      'A2': [420, 594],
      'A3': [297, 420],
      'A4': [210, 297],
      'A5': [148, 210],
      'Letter': [216, 279],
      'Legal': [216, 356],
      'Tabloid': [279, 432]
    }
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

    // Create paper size selector for PDF export
    const paperSizeOptions = Object.keys(FormExportComponent.exportSettings.paperSizes);
    const paperSizeSelect = GeneralHandler.createSelect('export-paper-size', 'PDF Paper Size',
      paperSizeOptions, exportContainer, FormExportComponent.exportSettings.paperSize,
      (e) => {
        FormExportComponent.exportSettings.paperSize = e.target.value;
      });

    // Keep scale multiplier for PNG/SVG exports (hidden from UI for PDF export)
    const scaleInput = GeneralHandler.createInput('export-scale', 'Scale Multiplier (PNG/SVG)', exportContainer,
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
      async () => await FormExportComponent.exportToPNG(), 'click');

    // SVG Export
    GeneralHandler.createButton('export-svg', 'Export as SVG', buttonContainer, 'input',
      async () => await FormExportComponent.exportToSVG(), 'click');

    // PDF Export
    GeneralHandler.createButton('export-pdf', 'Export as PDF', buttonContainer, 'input',
      async () => await FormExportComponent.exportToPDF(), 'click');

    // DXF Export
    GeneralHandler.createButton('export-dxf', 'Export as DXF (Outline Only)', buttonContainer, 'input',
      async () => await FormExportComponent.exportToDXF(), 'click');
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

  // Helper function to show loading overlay during export
  showLoadingOverlay: function(exportType) {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    loadingText.textContent = `Exporting ${exportType}...`;
    overlay.style.display = 'flex';
    
    // Force browser to render the overlay before continuing
    return new Promise(resolve => {
      // Use requestAnimationFrame to ensure DOM updates before continuing
      requestAnimationFrame(() => {
        // Add a small delay to ensure the overlay is visible
        setTimeout(resolve, 50);
      });
    });
  },
  // Helper function to hide loading overlay after export
  hideLoadingOverlay: function() {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  },
  
  // Helper function to show donation overlay after export
  showDonationOverlay: function() {
    // Check if overlay already exists
    let overlay = document.getElementById('donation-overlay');
    
    if (!overlay) {      // Create the donation overlay if it doesn't exist
      overlay = document.createElement('div');
      overlay.id = 'donation-overlay';
      
      // Create the message container
      const messageContainer = document.createElement('div');
      messageContainer.className = 'donation-container';
      
      // Create the title
      const title = document.createElement('h2');
      title.textContent = 'Thank you for using Road Sign Factory!';
      
      // Create the message
      const message = document.createElement('p');
      message.textContent = 'If you find this tool helpful, please consider supporting its continued development and new features.';
      
      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
        // Create the donation link with Buy Me Coffee logo
      const donateButton = document.createElement('a');
      donateButton.href = 'https://www.buymeacoffee.com/g1213123';
      donateButton.target = '_blank';
      donateButton.className = 'donate-button';
      
      // Add event listener to close overlay when donation link is clicked
      donateButton.addEventListener('click', function() {
        FormExportComponent.hideDonationOverlay();
      });
      
      // Add Buy Me Coffee logo
      const bmcLogo = document.createElement('img');
      bmcLogo.src = 'https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg';
      bmcLogo.className = 'bmc-logo';
      bmcLogo.alt = 'Buy me a coffee';
      
      // Add text after the logo
      const donateText = document.createTextNode('Buy me a coffee');
      
      // Append logo and text to button
      donateButton.appendChild(bmcLogo);
      donateButton.appendChild(donateText);
      
      // Create the close button
      const closeButton = document.createElement('button');
      closeButton.textContent = 'No thanks';
      closeButton.className = 'close-button';      closeButton.onclick = function() {
        FormExportComponent.hideDonationOverlay();
      };
      
      // Assemble the overlay with the new button container
      messageContainer.appendChild(title);
      messageContainer.appendChild(message);
      buttonContainer.appendChild(donateButton);
      buttonContainer.appendChild(closeButton);
      messageContainer.appendChild(buttonContainer);
      overlay.appendChild(messageContainer);
      
      // Add to document
      document.body.appendChild(overlay);
    } else {
      overlay.style.display = 'flex';
    }
  },
  
  // Helper function to hide donation overlay
  hideDonationOverlay: function() {
    const overlay = document.getElementById('donation-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
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
      var matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };

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

  exportToPNG: async function () {
    // Show loading overlay and wait for it to render
    await FormExportComponent.showLoadingOverlay('PNG');
    
    try {
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
    } finally {      // Hide loading overlay and show donation overlay
      FormExportComponent.hideLoadingOverlay();
      FormExportComponent.showDonationOverlay();
    }
  },

  exportToSVG: async function () {
    // Show loading overlay and wait for it to render
    await FormExportComponent.showLoadingOverlay('SVG');
    
    try {
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
    } finally {      // Hide loading overlay and show donation overlay
      FormExportComponent.hideLoadingOverlay();
      FormExportComponent.showDonationOverlay();
    }
  },
  exportToDXF: async function () {
    // Show loading overlay and wait for it to render
    await FormExportComponent.showLoadingOverlay('DXF');
    
    // Declare originalState outside the try block so it's accessible in finally
    let originalState;
    
    try {
      // Prepare canvas for export
      originalState = FormExportComponent.prepareCanvasForExport();

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

      // Collect all path objects from canvasObject
      canvasObject.forEach(obj => {
        FormExportComponent.collectPathObjects(obj, pathObjects);
      });

      // Process each path object for DXF export
      pathObjects.forEach(pathObj => {
        FormExportComponent.processPathForDXF(pathObj, dxf, 0, 0);
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
      // Ensure canvas is restored even on error (only if originalState was created)
      if (originalState) {
        FormExportComponent.restoreCanvasAfterExport(originalState);
      }
      // Hide loading overlay and show donation overlay
      FormExportComponent.hideLoadingOverlay();
      FormExportComponent.showDonationOverlay();
    }
  },

  exportToPDF: async function () {
    // Show loading overlay and wait for it to render
    await FormExportComponent.showLoadingOverlay('PDF');
    
    try {
      // Prepare canvas for export first
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
      
      // Use the calculated bounds for content dimensions
      const contentWidth = originalState.exportBounds ? originalState.exportBounds.width : canvas.width;
      const contentHeight = originalState.exportBounds ? originalState.exportBounds.height : canvas.height;
      
      // Get the selected paper size dimensions from settings
      const selectedPaperSize = FormExportComponent.exportSettings.paperSize;
      const [paperWidthMM, paperHeightMM] = FormExportComponent.exportSettings.paperSizes[selectedPaperSize];
      
      // Convert paper dimensions from mm to pixels
      const MM_TO_PX = 2.83; // Approximate conversion from mm to px at 72 dpi
      const paperWidthPx = paperWidthMM * MM_TO_PX;
      const paperHeightPx = paperHeightMM * MM_TO_PX;
      
      // Determine orientation based on content aspect ratio
      const contentAspectRatio = contentWidth / contentHeight;
      const paperAspectRatio = paperWidthPx / paperHeightPx;
      
      // Choose orientation that best fits the content
      const isLandscape = contentAspectRatio > paperAspectRatio;
      
      // Set PDF dimensions based on orientation
      const pdfWidth = isLandscape ? paperHeightPx : paperWidthPx;
      const pdfHeight = isLandscape ? paperWidthPx : paperHeightPx;
      
      // Calculate scale to fit content within the paper size while preserving aspect ratio
      const scaleX = pdfWidth / contentWidth;
      const scaleY = pdfHeight / contentHeight;
      const scale = Math.min(scaleX, scaleY) * 0.95; // Use 95% of available space to add margin
      
      // Calculate dimensions of the scaled content
      const scaledWidth = contentWidth * scale;
      const scaledHeight = contentHeight * scale;
      
      // Calculate position to center the content on the page
      const xOffset = (pdfWidth - scaledWidth) / 2;
      const yOffset = (pdfHeight - scaledHeight) / 2;
      
      // Create a new jsPDF instance with appropriate orientation
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'px',
        format: isLandscape ? [paperHeightPx, paperWidthPx] : [paperWidthPx, paperHeightPx],
        compress: true
      });

      // Get PNG data URL from canvas
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: FormExportComponent.exportSettings.quality,
        multiplier: FormExportComponent.exportSettings.multiplier
      });

      // Remove temporary background rectangle if it was added
      if (originalState.tempBackgroundRect) {
        canvas.remove(originalState.tempBackgroundRect);
      }

      // Add the image to the PDF, centered and scaled to fit the selected paper size
      pdf.addImage(
        dataURL,
        'PNG',
        xOffset,
        yOffset,
        scaledWidth,
        scaledHeight
      );

      // Save the PDF
      pdf.save(`${FormExportComponent.exportSettings.filename}.pdf`);
      
      // Restore the canvas after PDF creation
      FormExportComponent.restoreCanvasAfterExport(originalState);
    } finally {
      // Hide loading overlay
      FormExportComponent.hideLoadingOverlay();
    }
  },


  // First, recursively collect all path objects
  collectPathObjects: function (obj, pathObjects) {
    // Skip grid objects
    if (obj.id === 'grid') return;

    // Special handling for TextObjects - collect both frames and character paths
    if (obj.functionalType === 'Text') {
      // Process text frames if available
      if (obj.txtFrameList) {
        obj.txtFrameList.forEach(frame => {
          // Get proper frame position relative to text object
          const frameOffsetX = frame.left + obj.width / 2 + obj.left || 0;
          const frameOffsetY = frame.top + obj.height / 2 + obj.top || 0;

          // Create a path representing the text frame
          const framePoints = [
            { x: frameOffsetX, y: frameOffsetY },
            { x: frameOffsetX + frame.width, y: frameOffsetY },
            { x: frameOffsetX + frame.width, y: frameOffsetY + frame.height },
            { x: frameOffsetX, y: frameOffsetY + frame.height }
          ];

          // Create a synthetic path object from the frame
          const framePath = {
            type: 'path',
            path: [
              ['M', framePoints[0].x, framePoints[0].y],
              ['L', framePoints[1].x, framePoints[1].y],
              ['L', framePoints[2].x, framePoints[2].y],
              ['L', framePoints[3].x, framePoints[3].y],
              ['Z']
            ],
          };

          pathObjects.push(framePath);
        });
      }

      // Process text character paths if available
      if (obj.txtCharList && obj.txtCharList.length > 0) {
        obj.txtCharList.forEach(charObj => {
          if (charObj && charObj.type === 'path' && charObj.path) {
            // Create a copy of the path to preserve the original
            const pathCopy = {
              type: 'path',
              path: charObj.path.slice(),
              left: charObj.left,
              top: charObj.top,
              scaleX: charObj.scaleX || 1,
              scaleY: charObj.scaleY || 1,
              angle: charObj.angle || 0
            };

            // Apply transformations based on the character's position within the text object
            const transformedPath = FormExportComponent.transformPath(
              pathCopy,
              obj.left + obj.width / 2,
              obj.top + obj.height / 2
            );

            if (transformedPath) {
              pathObjects.push(transformedPath);
            }
          }
        });
      }
      return;
    }

    // Handle SVG paths with potential holes
    if (obj.basePolygon && obj.basePolygon.type === 'path' && obj.basePolygon.path) {
      // Add the complete path object from basePolygon
      const rawPath = obj.basePolygon;

      // Add as a regular path
      pathObjects.push({
        type: 'path',
        path: rawPath.path,
        isOuterPath: true, // Mark as potentially having holes
        left: rawPath.left || 0,
        top: rawPath.top || 0,
        scaleX: rawPath.scaleX || 1,
        scaleY: rawPath.scaleY || 1
      });
    }
    // If the object has a basePolygon with _objects
    else if (obj.basePolygon && obj.basePolygon._objects) {
      obj.basePolygon._objects.forEach(nestedObj => {
        FormExportComponent.collectNestedPathObjects(nestedObj, pathObjects, obj);
      });
    }
    // If it's a fabric Group object that might contain paths
    else if (obj.type === 'group' && obj._objects) {
      obj._objects.forEach(nestedObj => {
        FormExportComponent.collectNestedPathObjects(nestedObj, pathObjects, obj);
      });
    }
    // Direct path objects
    else if (obj.type === 'path') {
      // Add path direction info (clockwise/counterclockwise) for hole detection
      const pathWithDirection = {
        ...obj,
        isOuterPath: FormExportComponent.isClockwise(obj.path)
      };
      pathObjects.push(pathWithDirection);
    }
    // Direct rect objects
    else if (obj.type === 'rect') {
      const rectPathObj = FormExportComponent.convertRectToPath(obj);
      if (rectPathObj) {
        rectPathObj.isOuterPath = true; // Rectangles are always outer paths
        pathObjects.push(rectPathObj);
      }
    }
  },

  // Function to recursively collect path objects from nested structures
  collectNestedPathObjects: function (obj, collection, parentObj) {
    // Skip nulls or undefined
    if (!obj) return;

    if (obj.type === 'path') {
      // Add the complete path object from basePolygon
      const rawPath = {
        type: 'path',
        path: obj.path,
        isOuterPath: true, // Mark as potentially having holes
        left: obj.left  || 0,
        top: obj.top  || 0,
        scaleX: obj.scaleX || 1,
        scaleY: obj.scaleY || 1
      };
      // Add as a regular path
      // Apply transformations based on the character's position within the text object
      const transformedPath = FormExportComponent.transformPath(
        rawPath,
        parentObj.left + parentObj.width / 2,
        parentObj.top + parentObj.height / 2
      );

      collection.push(transformedPath);


    }
    else if (obj.type === 'rect') {
      const rectPathObj = FormExportComponent.convertRectToPath(obj);
      if (rectPathObj) {
        rectPathObj.isOuterPath = true; // Rectangles are always outer paths
        rectPathObj.parentObj = parentObj;
        collection.push(rectPathObj);
      }
    }
    else if (obj.type === 'group' && obj._objects) {
      obj._objects.forEach(nestedObj => {
        FormExportComponent.collectNestedPathObjects(nestedObj, collection, parentObj || obj);
      });
    }
  },

  // Helper function to convert a rectangle to a path object
  convertRectToPath: function (rectObj) {
    if (!rectObj || !rectObj.width || !rectObj.height) return null;

    // Get the actual position of the rect considering its parent transformations
    let left = rectObj.left || 0;
    let top = rectObj.top || 0;
    let width = rectObj.width;
    let height = rectObj.height;

    // If the rect is part of a group, we need to apply the group's transformations
    if (rectObj.group) {
      const transformMatrix = rectObj.group.calcTransformMatrix();
      const tl = fabric.util.transformPoint({ x: left, y: top }, transformMatrix);
      const tr = fabric.util.transformPoint({ x: left + width, y: top }, transformMatrix);
      const br = fabric.util.transformPoint({ x: left + width, y: top + height }, transformMatrix);
      const bl = fabric.util.transformPoint({ x: left, y: top + height }, transformMatrix);

      // Create a pathData array using the transformed points
      return {
        type: 'path',
        path: [
          ['M', tl.x, tl.y],
          ['L', tr.x, tr.y],
          ['L', br.x, br.y],
          ['L', bl.x, bl.y],
          ['Z']
        ]
      };
    }

    // For standalone rects, create a simple path
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
  },

  // Helper method to process a path object for DXF export
  processPathForDXF: function (pathObj, dxf, offsetX, offsetY) {
    // Process SVG path data for DXF export
    const pathData = pathObj.path || [];
    
    // First, we'll analyze the path to find subpaths (segments starting with 'M')
    const subpaths = [];
    let currentSubpath = [];
    let firstPointInSubpath = null;
    
    // Group commands by subpaths
    pathData.forEach(cmd => {
      if (cmd[0] === 'M') {
        // Start a new subpath
        if (currentSubpath.length > 0) {
          subpaths.push({
            commands: currentSubpath,
            firstPoint: firstPointInSubpath,
            closed: false
          });
        }
        currentSubpath = [cmd];
        firstPointInSubpath = [
          cmd[1] + offsetX,
          -(cmd[2] + offsetY) // Flip Y coordinate for DXF
        ];
      } else {
        currentSubpath.push(cmd);
        // Mark if path is closed
        if (cmd[0] === 'Z') {
          subpaths.push({
            commands: currentSubpath,
            firstPoint: firstPointInSubpath,
            closed: false
          });
          currentSubpath = [];
          firstPointInSubpath = null;
        }
      }
    });
    
    // Add the last subpath if it exists and wasn't closed with Z
    if (currentSubpath.length > 0) {
      subpaths.push({
        commands: currentSubpath,
        firstPoint: firstPointInSubpath,
        closed: false
      });
    }
    
    // Now process each subpath
    subpaths.forEach(subpath => {
      // For each subpath, we'll build spline control points and polyline points
      let currentX, currentY;
      let polylinePoints = [];
      let currentCmd;
      
      // Process the commands in this subpath
      for (let i = 0; i < subpath.commands.length; i++) {
        currentCmd = subpath.commands[i];
        const command = currentCmd[0];
        const values = currentCmd.slice(1);
        
        switch (command) {
          case 'M': // moveTo
            currentX = values[0] + offsetX;
            currentY = -(values[1] + offsetY); // Flip Y coordinate for DXF
            polylinePoints = [[currentX, currentY]];
            break;
            
          case 'L': // lineTo
            currentX = values[0] + offsetX;
            currentY = -(values[1] + offsetY); // Flip Y coordinate for DXF
            polylinePoints.push([currentX, currentY]);
            break;
            
          case 'C': { // bezierCurveTo - use spline for better representation
            const cp1x = values[0] + offsetX;
            const cp1y = -(values[1] + offsetY); // Flip Y coordinate for DXF
            const cp2x = values[2] + offsetX;
            const cp2y = -(values[3] + offsetY); // Flip Y coordinate for DXF
            const endX = values[4] + offsetX;
            const endY = -(values[5] + offsetY); // Flip Y coordinate for DXF
            
            // If we have accumulated polyline points, draw them first
            if (polylinePoints.length > 1) {
              dxf.drawPolyline(polylinePoints, false);
              // Start new polyline with the endpoint of the existing one
              polylinePoints = [[polylinePoints[polylinePoints.length - 1][0], polylinePoints[polylinePoints.length - 1][1]]];
            }
            
            // Create control points for a cubic spline (degree 3)
            const cubicControlPoints = [
              [currentX, currentY],   // Start point
              [cp1x, cp1y],          // First control point
              [cp2x, cp2y],          // Second control point
              [endX, endY]           // End point
            ];
            
            // Draw the spline
            dxf.drawSpline(cubicControlPoints, 3);
            
            // Update current position
            currentX = endX;
            currentY = endY;
            
            // Continue the polyline from here
            polylinePoints = [[currentX, currentY]];
            break;
          }
            
          case 'Q': { // quadraticCurveTo - use spline for better representation
            const qCpx = values[0] + offsetX;
            const qCpy = -(values[1] + offsetY); // Flip Y coordinate for DXF
            const qEndX = values[2] + offsetX;
            const qEndY = -(values[3] + offsetY); // Flip Y coordinate for DXF
            
            // If we have accumulated polyline points, draw them first
            if (polylinePoints.length > 1) {
              dxf.drawPolyline(polylinePoints, false);
              // Start new polyline with the endpoint of the existing one
              polylinePoints = [[polylinePoints[polylinePoints.length - 1][0], polylinePoints[polylinePoints.length - 1][1]]];
            }
            
            // Create control points for a quadratic spline (degree 2)
            const quadraticControlPoints = [
              [currentX, currentY],  // Start point
              [qCpx, qCpy],          // Control point
              [qEndX, qEndY]         // End point
            ];
            
            // Draw the spline
            dxf.drawSpline(quadraticControlPoints, 2);
            
            // Update current position
            currentX = qEndX;
            currentY = qEndY;
            
            // Continue the polyline from here
            polylinePoints = [[currentX, currentY]];
            break;
          }
            
          case 'Z': // closePath
            // If we have a first point and it's different from current position,
            // add it to close the path
            if (subpath.firstPoint && 
                (subpath.firstPoint[0] !== currentX || subpath.firstPoint[1] !== currentY)) {
              polylinePoints.push([subpath.firstPoint[0], subpath.firstPoint[1]]);
            }
            break;
        }
      }
      
      // Draw any remaining polyline points
      if (polylinePoints.length > 1) {
        dxf.drawPolyline(polylinePoints, subpath.closed);
      }

      // Close the path if it was marked as closed
      if (polylinePoints && polylinePoints.length > 0 ) {

        if (polylinePoints[[polylinePoints.length - 1]][0] !== subpath.firstPoint[0] || 
            polylinePoints[[polylinePoints.length - 1]][1] !== subpath.firstPoint[1]) {
          dxf.drawPolyline([polylinePoints[polylinePoints.length - 1], subpath.firstPoint], false);
        }
      }
    });
  },

  // Helper method to transform a path based on parent position
  transformPath: function (pathObj, parentLeft, parentTop) {
    const path = pathObj.path.slice();

    // Calculate absolute position of the path in the canvas
    // Extract all x,y coordinates from all command types
    let coordinates = [];
    path.forEach(cmd => {
      if (cmd.length >= 3 && cmd[1] !== undefined && cmd[2] !== undefined) {
        // Handle M and L commands
        coordinates.push({ x: cmd[1], y: cmd[2] });
      }
      
      if (cmd[0] === 'C' && cmd.length >= 7) {
        // Handle Bézier curve control points
        coordinates.push({ x: cmd[1], y: cmd[2] }); // First control point
        coordinates.push({ x: cmd[3], y: cmd[4] }); // Second control point
        coordinates.push({ x: cmd[5], y: cmd[6] }); // End point
      }
      
      if (cmd[0] === 'Q' && cmd.length >= 5) {
        // Handle quadratic curve control points
        coordinates.push({ x: cmd[1], y: cmd[2] }); // Control point
        coordinates.push({ x: cmd[3], y: cmd[4] }); // End point
      }
    });
    
    // Find minimum x and y from all collected coordinates
    const minX = coordinates.length > 0 ? Math.min(...coordinates.map(p => p.x)) : 0;
    const minY = coordinates.length > 0 ? Math.min(...coordinates.map(p => p.y)) : 0;
    
    const absLeft = parentLeft + pathObj.left - minX;
    const absTop = parentTop + pathObj.top - minY;

    // Apply transformations directly to path commands
    const transformedPath = {
      type: 'path',
      path: []
    };

    for (let i = 0; i < path.length; i++) {
      const command = path[i][0];
      const values = path[i].slice(1);

      switch (command) {
        case 'M': // moveTo
          if (i !== 0) {
            transformedPath.path.push(['Z']);
          }
          transformedPath.path.push([
            command,
            absLeft + values[0],
            absTop + values[1]
          ]);
          break;
        case 'L': // lineTo
          transformedPath.path.push([
            command,
            absLeft + values[0],
            absTop + values[1]
          ]);
          break;

        case 'C': // bezierCurveTo
          transformedPath.path.push([
            command,
            absLeft + values[0],
            absTop + values[1],
            absLeft + values[2],
            absTop + values[3],
            absLeft + values[4],
            absTop + values[5]
          ]);
          break;

        case 'Q': // quadraticCurveTo
          transformedPath.path.push([
            command,
            absLeft + values[0],
            absTop + values[1],
            absLeft + values[2],
            absTop + values[3]
          ]);
          break;

        case 'Z': // closePath
          transformedPath.path.push([command]);
          break;

        default:
          transformedPath.path.push(path[i].slice());
          break;
      }
    }

    return transformedPath;
  },

  isClockwise: function (path) {
    // Calculate the area of the path to determine if it's clockwise or counterclockwise
    let total = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i].slice(1);
      const [x2, y2] = path[i + 1].slice(1);
      total += (x2 - x1) * (y2 + y1);
    }
    return total > 0;
  },
}

// Export the FormExportComponent for use in other files