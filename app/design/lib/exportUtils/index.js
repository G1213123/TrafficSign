import DxfWriter from 'dxf-writer';
import { jsPDF } from 'jspdf';
import { collectPathObjects, collectNestedPathObjects, convertRectToPath, processPathForDXF, transformPath, cubicBezierToArc } from './export.js';

/**
 * Exports the current canvas to a DXF file.
 * @param {fabric.Canvas} canvas - The fabric canvas instance.
 * @param {string} filename - The filename for the exported DXF.
 */
export const exportToDXF = (canvas, filename) => {
    const dxf = new DxfWriter();
    const pathObjects = [];
    
    // Collect all path objects from the canvas
    canvas.getObjects().forEach(obj => {
        collectPathObjects(obj, pathObjects);
    });

    // Process and draw each path object into the DXF
    pathObjects.forEach(pathObj => {
        processPathForDXF(pathObj, dxf, 0, 0);
    });

    const dxfString = dxf.toDxfString();
    const blob = new Blob([dxfString], { type: 'application/dxf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.dxf`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Exports the current canvas to a PDF file.
 * @param {fabric.Canvas} canvas - The fabric canvas instance.
 * @param {string} filename - The filename for the exported PDF.
 * @param {string} paperSize - The desired paper size (e.g., 'A3', 'A4').
 */
export const exportToPDF = (canvas, filename, paperSize = 'A3') => {
    const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 2 // Higher quality for PDF
    });

    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: paperSize
    });

    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
    const width = imgProps.width * ratio;
    const height = imgProps.height * ratio;
    const x = (pdfWidth - width) / 2;
    const y = (pdfHeight - height) / 2;

    pdf.addImage(dataUrl, 'PNG', x, y, width, height);
    pdf.save(`${filename}.pdf`);
};
