/**
 * md-import.js - Import Modal Management
 * This module handles the JSON import modal functionality
 */

import { ModalUtils } from './mdGeneral.js';

const ImportManager = {
  /**
   * Show the JSON import modal
   * @param {Function} importCallback - Function to call when importing JSON text
   */
  showImportJSONTextModal: function (importCallback) {
    const modalId = 'import-json-text-modal';
    const { modal, modalContent } = ModalUtils.createModal(modalId, 'Import JSON from Text');

    // Create textarea for JSON input
    const textArea = ModalUtils.createTextArea('json-text-area-input', 'Paste your JSON here...');

    // Create import button
    const importButton = ModalUtils.createButton('Import', 'import-button', async () => {
      const jsonText = textArea.value;
      if (importCallback) {
        try {
          await importCallback(jsonText);
          // Modal removal is handled by the callback if successful
        } catch (error) {
          console.error('Import failed:', error);
          // Keep modal open on error so user can try again
        }
      }
    });

    // Create buttons container
    const buttonsContainer = ModalUtils.createButtonsContainer([importButton]);

    // Assemble modal content
    modalContent.appendChild(textArea);
    modalContent.appendChild(buttonsContainer);

    // Show modal and focus textarea
    ModalUtils.showModal(modal, textArea);
  },

  /**
   * Close the import modal
   */
  closeImportModal: function () {
    ModalUtils.removeModal('import-json-text-modal');
  }
};

// Make ImportManager globally accessible
if (typeof window !== 'undefined') {
  window.ImportManager = ImportManager;
}

export { ImportManager };
