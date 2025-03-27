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

  exportToPDF: function () {
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
    
    // Use the calculated bounds for PDF dimensions
    const width = originalState.exportBounds ? originalState.exportBounds.width : canvas.width;
    const height = originalState.exportBounds ? originalState.exportBounds.height : canvas.height;

    // Create a new jsPDF instance with appropriate orientation
    const pdf = new jsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height],
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

    // Add the image to the PDF
    pdf.addImage(
      dataURL,
      'PNG',
      0,
      0,
      width,
      height
    );

    // Save the PDF
    pdf.save(`${FormExportComponent.exportSettings.filename}.pdf`);
    
    // Restore the canvas after PDF creation
    FormExportComponent.restoreCanvasAfterExport(originalState);
  },
}

// Export the FormExportComponent for use in other files