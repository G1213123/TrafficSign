/* Export Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { buildObjectsFromJSON } from '../objects/build.js';
import { ImportManager } from '../modal/md-import.js';
import { i18n } from '../i18n/i18n.js';
import { collectPathObjects, processPathForDXF } from '../exportUtils/export.js';

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
    GeneralHandler.tabNum = 7;
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

    // JSON Export
    GeneralHandler.createButton('export-json', 'Export as JSON', buttonContainer, 'input',
      async () => await FormExportComponent.exportCanvasToJSON(), 'click');

  // JSON Import
    const importButtonContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent); // Create a new container for import elements, child of the main parent

    const importJsonInput = GeneralHandler.createButton('import-json', 'Import JSON file', importButtonContainer, 'input',
      async () => await FormExportComponent.importCanvasFromJSON(), 'click'); // Changed parent to importButtonContainer    // New button for importing JSON from text
    const importJsonTextButton = GeneralHandler.createButton('import-json-text', 'Import JSON text', importButtonContainer, 'input',
      () => ImportManager.showImportJSONTextModal(FormExportComponent.importCanvasFromJSONText), 'click');

    try { i18n.applyTranslations(parent); } catch (_) {}

  },

  // Helper function to prepare canvas for export
  prepareCanvasForExport: function () {
    const includeGrid = GeneralHandler.getToggleValue('Include Grid-container') === 'Yes';
    const includeBackground = GeneralHandler.getToggleValue('Include Background-container') === 'Yes';

    // Store original canvas state
    const originalState = {
      backgroundColor: CanvasGlobals.canvas.backgroundColor,
      width: CanvasGlobals.canvas.width,
      height: CanvasGlobals.canvas.height,
      viewportTransform: [...CanvasGlobals.canvas.viewportTransform],
      zoom: CanvasGlobals.canvas.getZoom(),
      objects: CanvasGlobals.canvasObject
    };

    // Calculate the bounding box that contains all visible objects (excluding grid)
    const visibleObjects = originalState.objects;

    if (visibleObjects.length > 0) {
      // Find the bounds of all objects
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      visibleObjects.forEach(obj => {
        // Get the object's bounding rect in canvas coordinates
        const rect = obj.getBoundingRect();
        if (!isNaN(rect.top) && !isNaN(rect.left)){
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.left + rect.width);
          maxY = Math.max(maxY, rect.top + rect.height);
        }
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
      CanvasGlobals.canvas.setDimensions({
        width: width,
        height: height
      });

      // Reset the zoom to 1 (100%)
      CanvasGlobals.canvas.setZoom(1);

      // Center the view on the objects
      CanvasGlobals.canvas.setViewportTransform([1, 0, 0, 1, -minX, -minY]);
    }

    // Set background to transparent if not including it
    if (!includeBackground) {
      CanvasGlobals.canvas.backgroundColor = 'rgba(0,0,0,0)'; // Transparent background
    }

    if (!includeGrid) {
      // Hide grid and grid-related objects
      CanvasGlobals.canvas.getObjects().forEach(obj => {
        if (obj.id === 'grid') {
          obj.visible = false;
        }
      });
    }

    // Enforce correct fill colors for Text objects before export
    // This fixes an issue where colors might be reversed or incorrect in SVG export
    CanvasGlobals.canvas.getObjects().forEach(obj => {
      if (obj.functionalType === 'Text') {
        let color = obj.color;
        // Normalize color names to hex
        if (color === 'White') color = '#ffffff';
        if (color === 'Black') color = '#000000';
        
        if (obj._objects) {
          obj._objects.forEach(child => {
            // Only update if it's a path (character) and not the frame
            if (child.type === 'path') {
              child.set('fill', color);
            }
          });
        }
      }
    });

  CanvasGlobals.scheduleRender();
    return originalState;
  },

  // Helper function to restore canvas after export
  restoreCanvasAfterExport: function (originalState) {
    // Restore original canvas dimensions
    CanvasGlobals.canvas.setDimensions({
      width: originalState.width,
      height: originalState.height
    });

    // Restore original zoom and viewport transform
    CanvasGlobals.canvas.setViewportTransform(originalState.viewportTransform);

    // Restore background
    CanvasGlobals.canvas.backgroundColor = originalState.backgroundColor;

    CanvasGlobals.canvas.getObjects().forEach(obj => {
      if (obj.id === 'grid') {
        obj.visible = true;
      }
    });

  CanvasGlobals.scheduleRender();
  },

  // Helper function to show loading overlay during export
  showLoadingOverlay: function (exportType) {
    const overlay = document.getElementById('loading-overlay');
    const loadingText = overlay.querySelector('.loading-text');
    if (loadingText) {
      loadingText.setAttribute('data-i18n', 'Exporting');
      try { loadingText.textContent = `${i18n.t('Exporting')} ${exportType}...`; } catch (_) { loadingText.textContent = `Exporting ${exportType}...`; }
    }
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
  hideLoadingOverlay: function () {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = 'none';
  },

  // Helper function to show donation overlay after export
  showDonationOverlay: function () {
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
  title.setAttribute('data-i18n', 'Donation Thanks Title');
  title.textContent = i18n && i18n.t ? i18n.t('Donation Thanks Title') : 'Thank you for using Road Sign Factory!';

      // Create the message
  const message = document.createElement('p');
  message.setAttribute('data-i18n', 'Donation Message');
  message.textContent = i18n && i18n.t ? i18n.t('Donation Message') : 'If you find this tool helpful, please consider supporting its continued development and new features.';

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'button-container';
      // Create the donation link with Buy Me Coffee logo
  const donateButton = document.createElement('a');
      donateButton.href = 'https://www.buymeacoffee.com/g1213123';
      donateButton.target = '_blank';
      donateButton.className = 'donate-button';

      // Add event listener to close overlay when donation link is clicked
      donateButton.addEventListener('click', function () {
        FormExportComponent.hideDonationOverlay();
      });

      overlay.addEventListener('click', function (event) {
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
      closeButton.className = 'close-button'; closeButton.onclick = function () {
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
  hideDonationOverlay: function () {
    const overlay = document.getElementById('donation-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
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
  CanvasGlobals.scheduleRender();
      const dataURL = CanvasGlobals.canvas.toDataURL(options);

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
        const bgColor = CanvasGlobals.canvas.backgroundColor || '#ffffff';
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
        CanvasGlobals.canvas.insertAt(0, bgRect);
        originalState.tempBackgroundRect = bgRect;
      }

      // Generate the SVG data
      const svgData = CanvasGlobals.canvas.toSVG({
        // SVG-specific options
        viewBox: {
          x: originalState.exportBounds.left,
          y: originalState.exportBounds.top,
          width: originalState.exportBounds.width,
          height: originalState.exportBounds.height
        }
      });

      // Remove temporary background rectangle if it was added
      if (originalState.tempBackgroundRect) {
        CanvasGlobals.canvas.remove(originalState.tempBackgroundRect);
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
      if (!CanvasGlobals.canvasObject || CanvasGlobals.canvasObject.length === 0) {
        throw new Error('No objects available for export');
      }

      // Track the bounds to adjust coordinates later
      let minX = Infinity, minY = Infinity;
      const pathObjects = [];

      // Collect all path objects from canvasObject
      CanvasGlobals.canvasObject.forEach(obj => {
        try {
          collectPathObjects(obj, pathObjects);
        } catch (error) {
          console.error(`Error collecting path objects for DXF: ${obj.id}`, error);
        }
      });

      // Process each path object for DXF export
      pathObjects.forEach(pathObj => {
        try {
          processPathForDXF(pathObj, dxf, 0, 0);
        } catch (error) {
          console.error(`Error processing path for DXF: ${pathObj.id}`, error);
        }
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
        const bgColor = CanvasGlobals.canvas.backgroundColor || '#ffffff';
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
        CanvasGlobals.canvas.insertAt(0, bgRect);
        originalState.tempBackgroundRect = bgRect;
      }

      // Use the calculated bounds for content dimensions
      const contentWidth = originalState.exportBounds ? originalState.exportBounds.width : CanvasGlobals.canvas.width;
      const contentHeight = originalState.exportBounds ? originalState.exportBounds.height : CanvasGlobals.canvas.height;

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

  CanvasGlobals.scheduleRender();

      // Get PNG data URL from canvas
      const dataURL = CanvasGlobals.canvas.toDataURL({
        format: 'png',
        quality: FormExportComponent.exportSettings.quality,
        multiplier: FormExportComponent.exportSettings.multiplier
      });

      // Remove temporary background rectangle if it was added
      if (originalState.tempBackgroundRect) {
        CanvasGlobals.canvas.remove(originalState.tempBackgroundRect);
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
      FormExportComponent.showDonationOverlay();
    }
  },

  exportCanvasToJSON: function (download = true) {
    if (!CanvasGlobals.canvas) {
      console.error("Canvas is not initialized.");
      return;
    }

    const objectsToSerialize = CanvasGlobals.canvasObject;
    const serializedObjectsArray = [];

    for (const obj of objectsToSerialize) {
      if (typeof obj.serializeToJSON === 'function') {
        serializedObjectsArray.push(obj.serializeToJSON());
      }
    }

    // Prepare metadata including website title and version by reading meta tags
    const appNameMeta = document.querySelector('meta[name="application-name"]');
    const appVersionMeta = document.querySelector('meta[name="application-version"]');

    const metaData = {
      title: appNameMeta ? appNameMeta.getAttribute('content') : 'TrafficSign', // Fallback title
      version: appVersionMeta ? appVersionMeta.getAttribute('content') : '0.0.0', // Fallback version
      exportDate: new Date().toISOString()
    };

    const exportData = {
      meta: metaData,
      objects: serializedObjectsArray
    };

    const jsonString = JSON.stringify(exportData, null, 2);

    if (download) {
      // Create a Blob and download the JSON file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${FormExportComponent.exportSettings.filename || 'canvas-export'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      FormExportComponent.showDonationOverlay();
    }
    return jsonString; // Return JSON string for further processing if needed
  },

  // New private helper function to process and apply JSON data to the canvas
  _applyJSONToCanvas: async function (jsonData) {
    try {
      let objectsToLoad;
      if (jsonData.meta && Array.isArray(jsonData.objects)) {
        console.log("Processing JSON with metadata:", jsonData.meta);
        objectsToLoad = jsonData.objects;
      } else {
        objectsToLoad = jsonData.objects; // Assume old format or direct array
        console.log("Processing JSON (direct array or old format).");
      }

      if (!Array.isArray(objectsToLoad)) {
        // This check can be more specific based on expected structure
        throw new Error("Provided JSON data does not resolve to an array of objects.");
      }

      // Clear existing objects (excluding the grid)
      // This assumes CanvasGlobals.canvasObject is the array of current user-added objects
      // and obj.deleteObject() correctly removes them from canvas and the array.
      if (CanvasGlobals.canvasObject && typeof CanvasGlobals.canvasObject.forEach === 'function') {
        // Iterate backwards if deleteObject modifies the array in place
        for (let i = CanvasGlobals.canvasObject.length - 1; i >= 0; i--) {
          const obj = CanvasGlobals.canvasObject[i];
          if (obj && typeof obj.deleteObject === 'function') {
            obj.deleteObject();
          } else {
            // Fallback for objects without deleteObject or if canvasObject is not what's expected
            console.warn("Object or deleteObject method not found, attempting direct canvas removal for:", obj);
            if (CanvasGlobals.canvas && obj) CanvasGlobals.canvas.remove(obj);
          }
        }
      }
      // If CanvasGlobals.canvasObject is not self-managing, it might need to be reset:
      // CanvasGlobals.canvasObject = []; 
      // Or, if it's just a reference to canvas.getObjects(), then canvas.clear() might be an option,
      // but that would also remove the grid unless handled separately.
      // The current approach relies on the existing pattern of obj.deleteObject().

  CanvasGlobals.scheduleRender(); // Render after clearing

      if (typeof buildObjectsFromJSON === 'function') {
        await buildObjectsFromJSON(objectsToLoad, CanvasGlobals.canvas);
      } else {
        console.error("buildObjectsFromJSON function is not available.");
        throw new Error("Critical function buildObjectsFromJSON is not available to reconstruct objects.");
      }
    } catch (error) {
      console.error("Error applying JSON to canvas:", error);
      throw error; // Re-throw to be handled by the caller
    }
  },
  importCanvasFromJSON: async function () {
    // Warning dialog before proceeding
    const userConfirmed = confirm(
      "Warning: Importing a JSON file will clear the current canvas and replace it with the imported content. " +
      "All current work will be lost.\n\nDo you want to proceed?"
    );

    if (!userConfirmed) {
      console.log("Import cancelled by user.");
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json'; // Accept only JSON files

    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log("No file selected or dialog cancelled.");
        // No overlay shown yet, so no need to hide
        return;
      }

      await FormExportComponent.showLoadingOverlay('JSON file'); // Show overlay when processing starts

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const jsonString = e.target.result;
          const jsonData = JSON.parse(jsonString);
          await FormExportComponent._applyJSONToCanvas(jsonData);
          alert('Canvas imported successfully from file!');
        } catch (error) {
          console.error("Error importing canvas from JSON file:", error);
          alert("Failed to import from JSON file. Ensure the file is a valid JSON export from this tool. Error: " + error.message);
        } finally {
          FormExportComponent.hideLoadingOverlay();
        }
      };
      reader.onerror = () => {
        console.error("Error reading file.");
        alert("Error reading the selected file.");
        FormExportComponent.hideLoadingOverlay(); // Ensure overlay is hidden on read error
      };
      reader.readAsText(file);
    });

    fileInput.click(); // Trigger the file dialog
  },
  // Updated method to import canvas from JSON text
  importCanvasFromJSONText: async function (jsonText) {
    if (!jsonText || jsonText.trim() === '') {
      alert('JSON text cannot be empty.');
      return;
    }

    // Warning dialog before proceeding
    const userConfirmed = confirm(
      "Warning: Importing JSON text will clear the current canvas and replace it with the imported content. " +
      "All current work will be lost.\n\nDo you want to proceed?"
    );

    if (!userConfirmed) {
      console.log("Import from text cancelled by user.");
      return;
    }

    await FormExportComponent.showLoadingOverlay('JSON data'); // Show overlay

    try {
      const jsonData = JSON.parse(jsonText);
      await FormExportComponent._applyJSONToCanvas(jsonData);
      alert('JSON text imported successfully and applied to canvas!');

      const modal = document.getElementById('import-json-text-modal');
      if (modal) {
        modal.remove();
      }
    } catch (error) {
      console.error("Error importing JSON from text:", error);
      alert('Failed to import from JSON text. Please ensure the format is correct. Error: ' + error.message);
    } finally {
      FormExportComponent.hideLoadingOverlay(); // Hide overlay in all cases
    }
  },



}

// Export the FormExportComponent for use in other files
export { FormExportComponent };