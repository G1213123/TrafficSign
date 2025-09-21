/**
 * md-font.js - Font Priority Management Modal
 * This module handles the Chinese font priority management functionality
 */

import { ModalUtils } from './mdGeneral.js';
import { GeneralHandler } from '../sidebar/sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { i18n } from '../i18n/i18n.js';

const FontPriorityManager = {
  fontPriorityList: ['parsedFontKorean', 'parsedFontChinese'], // Default priority
  /**
   * Initialize font priority system
   */
  initialize: function () {
    FontPriorityManager.loadFontPriorityFromStorage();

  },

  /**
   * Show the font priority management modal
   */
  showModal: function () {
    const modalId = 'font-priority-modal';
  const { modal, modalContent } = ModalUtils.createModal(modalId, 'Chinese Font Priority Management');

    // Info text
  const infoText = ModalUtils.createInfoText('Fonts are tried in order from top to bottom.');

    // Font list container
    const fontListContainer = document.createElement('div');
    fontListContainer.className = 'font-list-container';
    fontListContainer.id = 'font-list-container';

    // Populate font list
    FontPriorityManager.updateFontListDisplay(fontListContainer);

    // Upload font section
  const uploadSection = ModalUtils.createSection('upload-section');

  const uploadTitle = document.createElement('h4');
  uploadTitle.setAttribute('data-i18n', 'Upload Custom Font');
  uploadTitle.textContent = i18n.t('Upload Custom Font');
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = '.ttf,.otf,.woff';
    uploadInput.className = 'font-upload-input';
    uploadInput.onchange = FontPriorityManager.handleFontUpload;

  const uploadButton = ModalUtils.createButton('Choose Font File', 'upload-button', () => uploadInput.click());

    uploadSection.appendChild(uploadTitle);
    uploadSection.appendChild(uploadButton);
    uploadSection.appendChild(uploadInput);

    // Character Override section
  const overrideSection = ModalUtils.createSection('upload-section');

  const overrideTitle = document.createElement('h4');
  overrideTitle.setAttribute('data-i18n', 'Character Override Settings');
  overrideTitle.textContent = i18n.t('Character Override Settings');
  const overrideInfo = ModalUtils.createInfoText('Specify characters that should use a specific font. Enter characters directly without spaces or commas.');

    const overrideContainer = document.createElement('div');
    overrideContainer.className = 'override-container';

    // Font selection for override
  const fontSelectLabel = document.createElement('label');
  fontSelectLabel.setAttribute('data-i18n', 'Override Font:');
  fontSelectLabel.textContent = i18n.t('Override Font:');
    fontSelectLabel.className = 'override-label';

    const fontSelect = document.createElement('select');
    fontSelect.className = 'font-select';
    fontSelect.id = 'override-font-select';
    FontPriorityManager.populateFontSelect(fontSelect);    // Character input
  const charInputLabel = document.createElement('label');
  charInputLabel.setAttribute('data-i18n', 'Characters:');
  charInputLabel.textContent = i18n.t('Characters:');
    charInputLabel.className = 'override-label';
    const charInput = document.createElement('input');
    charInput.type = 'text';
    charInput.className = 'char-input';
    charInput.id = 'override-char-input';
  charInput.setAttribute('data-i18n-placeholder', 'e.g., 屯門元朗天水圍');
  charInput.placeholder = i18n.t('e.g., 屯門元朗天水圍');
    charInput.value = FontPriorityManager.getSpecialCharacters();
    overrideContainer.appendChild(fontSelectLabel);
    overrideContainer.appendChild(fontSelect);
    overrideContainer.appendChild(charInputLabel);
    overrideContainer.appendChild(charInput);

    overrideSection.appendChild(overrideTitle);
    overrideSection.appendChild(overrideInfo);
    overrideSection.appendChild(overrideContainer);

    // Create apply button using ModalUtils
    const applyButton = ModalUtils.createButton('Apply Changes', 'apply-button', () => {
      // Save character override settings
      const fontSelect = document.getElementById('override-font-select');
      const charInput = document.getElementById('override-char-input');

      if (fontSelect && charInput) {
        const selectedFont = fontSelect.value;
        const characters = charInput.value.trim();
        FontPriorityManager.saveCharacterOverride(selectedFont, characters);
      }

      // Apply other changes and close modal
      FontPriorityManager.applyChanges();
      ModalUtils.removeModal('font-priority-modal');
    });

    // Create buttons container using ModalUtils
    const buttonsContainer = ModalUtils.createButtonsContainer([applyButton]);

    // Assemble modal
    modalContent.appendChild(infoText);
    modalContent.appendChild(fontListContainer);
    modalContent.appendChild(uploadSection);
    modalContent.appendChild(overrideSection);
    modalContent.appendChild(buttonsContainer);

    // Show modal
    ModalUtils.showModal(modal);
  },

  /**
   * Update the font list display in the modal
   */
  updateFontListDisplay: function (container) {
    container.innerHTML = '';

    // Validate and clean up font priority list before displaying
    const validFonts = [];
    let listChanged = false;

    FontPriorityManager.fontPriorityList.forEach((fontName) => {
      // Check if it's a built-in font
      const isBuiltInFont = ['parsedFontChinese', 'parsedFontKorean', 'parsedFontMedium', 'parsedFontHeavy', 'parsedFontKai'].includes(fontName);

      if (isBuiltInFont) {
        validFonts.push(fontName);
      } else {
        // For custom fonts, check if they still exist in window object
        if (window[fontName]) {
          validFonts.push(fontName);
        } else {
          // Font no longer exists, mark for removal
          console.warn(`Custom font "${fontName}" no longer exists in window object, removing from list`);
          listChanged = true;
        }
      }
    });

    // Update the font priority list if any fonts were removed
    if (listChanged) {
      FontPriorityManager.fontPriorityList = validFonts;
      FontPriorityManager.saveFontPriorityToStorage();
    }

    // Display the validated font list
    validFonts.forEach((fontName, index) => {
      const fontItem = document.createElement('div');
      fontItem.className = 'font-item';
      fontItem.dataset.fontName = fontName;

      const fontLabel = document.createElement('span');
      fontLabel.className = 'font-label';
      fontLabel.textContent = FontPriorityManager.getFontDisplayName(fontName);

      const controlsContainer = document.createElement('div');
      controlsContainer.className = 'font-controls';

      // Up arrow
      const upButton = document.createElement('button');
      upButton.textContent = '↑';
      upButton.className = 'move-button';
      upButton.disabled = index === 0;
      upButton.onclick = () => FontPriorityManager.moveFontUp(index);

      // Down arrow
      const downButton = document.createElement('button');
      downButton.textContent = '↓';
      downButton.className = 'move-button';
      downButton.disabled = index === FontPriorityManager.fontPriorityList.length - 1;
      downButton.onclick = () => FontPriorityManager.moveFontDown(index);

      // Remove button (only for custom fonts)
      if (fontName.startsWith('custom_')) {
        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => FontPriorityManager.removeCustomFont(fontName);
        controlsContainer.appendChild(removeButton);
      }

      controlsContainer.appendChild(upButton);
      controlsContainer.appendChild(downButton);

      fontItem.appendChild(fontLabel);
      fontItem.appendChild(controlsContainer);
      container.appendChild(fontItem);
    });
  },

  /**
   * Get display name for font
   */
  getFontDisplayName: function (fontName) {
    const displayNames = {
      'parsedFontKorean': 'Noto Sans KR (Default)',
      'parsedFontChinese': 'Noto Sans HK',
    };

    if (fontName.startsWith('custom_')) {
      return fontName.replace('custom_', 'Custom: ');
    }

    return displayNames[fontName] || fontName;
  },

  /**
   * Move font up in priority list
   */
  moveFontUp: function (index) {
    if (index > 0) {
      const list = FontPriorityManager.fontPriorityList;
      [list[index - 1], list[index]] = [list[index], list[index - 1]];
      FontPriorityManager.updateFontListDisplay(document.getElementById('font-list-container'));
    }
  },

  /**
   * Move font down in priority list
   */
  moveFontDown: function (index) {
    const list = FontPriorityManager.fontPriorityList;
    if (index < list.length - 1) {
      [list[index], list[index + 1]] = [list[index + 1], list[index]];
      FontPriorityManager.updateFontListDisplay(document.getElementById('font-list-container'));
    }
  },

  /**
   * Handle font file upload
   */  handleFontUpload: function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        // Parse the font using opentype.js
        const font = opentype.parse(e.target.result);
        const customFontName = `custom_${file.name.replace(/\.[^/.]+$/, "")}`;

        // Store the font globally (you might want to add this to your font storage system)
        window[customFontName] = font;

        // Add to priority list
        FontPriorityManager.fontPriorityList.unshift(customFontName);

        // Update display
        FontPriorityManager.updateFontListDisplay(document.getElementById('font-list-container'));

        // Check for text objects that need this font and update them
        FontPriorityManager.updateTextObjectsWithUploadedFont(customFontName);

        // Save the updated priority list
        FontPriorityManager.saveFontPriorityToStorage();

      } catch (error) {
        console.error('Error parsing font:', error);
        if (GeneralHandler && GeneralHandler.showToast) {
          GeneralHandler.showToast(
            'Failed to parse font file. Please ensure it\'s a valid font file.',
            'warning',
            4000
          );
        } else {
          alert('Failed to parse font file. Please ensure it\'s a valid font file.');
        }
      }
    };
    reader.readAsArrayBuffer(file);
  },

  /**
   * Remove custom font from priority list
   */
  removeCustomFont: function (fontName) {
    const index = FontPriorityManager.fontPriorityList.indexOf(fontName);
    if (index > -1) {
      FontPriorityManager.fontPriorityList.splice(index, 1);
      // Remove from global scope
      if (window[fontName]) {
        delete window[fontName];
      }
      FontPriorityManager.updateFontListDisplay(document.getElementById('font-list-container'));
    }
  },
  /**
   * Apply font priority changes
   */
  applyChanges: function () {
    // Store in localStorage for persistence
    FontPriorityManager.saveFontPriorityToStorage();

    console.log('Font priority updated:', FontPriorityManager.fontPriorityList);
  },
  /**
   * Save font priority to localStorage
   */
  saveFontPriorityToStorage: function () {
    localStorage.setItem('fontPriorityList', JSON.stringify(FontPriorityManager.fontPriorityList));
    // Validate fonts after saving
    setTimeout(() => FontPriorityManager.validateFonts(), 100);
  },

  /**
   * Load font priority from localStorage
   */
  loadFontPriorityFromStorage: function () {
    const stored = localStorage.getItem('fontPriorityList');
    if (stored) {
      try {
        FontPriorityManager.fontPriorityList = JSON.parse(stored);
        // Validate fonts after loading
        setTimeout(() => FontPriorityManager.validateFonts(), 100);
      } catch (e) {
        console.warn('Failed to parse stored font priority list');
      }
    }
  },

  /**
   * Get the current font priority list for use by other modules
   */
  getFontPriorityList: function () {
    return FontPriorityManager.fontPriorityList;
  },
  /**
   * Get special characters from localStorage or return default
   */
  getSpecialCharacters: function () {
    const stored = localStorage.getItem('specialCharacters');
    if (stored !== null) {
      // Ensure the stored characters are a valid string
      return stored;
    }
    return '彩天輸勝都愉朗';

  },

  /**
   * Get the override font from localStorage or return default
   */
  getOverrideFont: function () {
    const stored = localStorage.getItem('overrideFont');
    return stored || 'parsedFontChinese';
  },

  /**
   * Save special characters and override font to localStorage
   */
  saveCharacterOverride: function (font, characters) {
    localStorage.setItem('overrideFont', font);
    localStorage.setItem('specialCharacters', characters);
  },
  /**
   * Populate font select dropdown with available fonts
   */
  populateFontSelect: function (selectElement) {
    // Clear existing options
    selectElement.innerHTML = '';

    const currentOverride = FontPriorityManager.getOverrideFont();
    const fontPriorityList = FontPriorityManager.fontPriorityList;

    // Create options from the font priority list
    fontPriorityList.forEach(fontName => {
      const option = document.createElement('option');
      option.value = fontName;

      // Create user-friendly labels for built-in fonts
      let label = fontName;
      switch (fontName) {
        case 'parsedFontChinese':
          label = 'Noto Sans HK';
          break;
        case 'parsedFontKorean':
          label = 'Noto Sans KR';
          break;
        default:
          // For custom fonts, use the font name as is
          label = fontName.replace('parsedFont', '').replace(/([A-Z])/g, ' $1').trim();
          if (!label) label = fontName;
      }

      option.textContent = label;
      if (fontName === currentOverride) {
        option.selected = true;
      }
      selectElement.appendChild(option);
    });
  },

  /**
   * Get special characters as array for use in path.js
   */
  getSpecialCharactersArray: function () {
    const charactersString = FontPriorityManager.getSpecialCharacters();
    // Split into individual characters and filter out whitespace
    return charactersString.split('').filter(char => char.trim().length > 0);
  },

  /**
   * Reset font manager settings to default values
   */
  resetToDefaults: function () {
    try {
      // Reset font priority list to default
      FontPriorityManager.fontPriorityList = ['parsedFontKorean', 'parsedFontChinese'];

      // Clear character override settings
      localStorage.removeItem('characterOverrideFont');
      localStorage.setItem('specialCharacters', '彩天輸勝都愉朗 ');

      // Remove custom fonts from window object
      Object.keys(window).forEach(key => {
        if (key.startsWith('custom_') && typeof window[key] === 'object' && window[key]?.getPath) {
          delete window[key];
        }
      });

      // Save the reset font priority to storage
      FontPriorityManager.saveFontPriorityToStorage();

      console.log('Font manager settings reset to defaults');
      return true;
    } catch (error) {
      console.error('Error resetting font manager settings:', error);
      return false;
    }
  },
  /**
   * Get all available fonts (built-in + custom) with user-friendly labels
   * @param {boolean} containsNonEnglish - Whether the text contains non-English characters
   * @returns {Array} Array of {value, label} objects for font selection
   */
  getAllAvailableFonts: function (containsNonEnglish = false) {
    const fonts = [];

    if (containsNonEnglish) {
      // For text with non-English characters, show Chinese/Asian fonts
      fonts.push({ value: 'parsedFontChinese', label: 'Noto Sans HK' });
      fonts.push({ value: 'parsedFontKorean', label: 'Noto Sans KR' });

      // Add custom fonts from fontPriorityList for non-English text
      FontPriorityManager.fontPriorityList.forEach(fontName => {
        if (fontName.startsWith('custom_')) {
          // Check if custom font is still available in window
          if (window[fontName]) {
            const label = fontName.replace('custom_', '').replace(/([A-Z])/g, ' $1').trim() || fontName;
            fonts.push({ value: fontName, label: `${label} (Custom)` });
          }
        }
      });
    } else {
      // For English-only text, show standard English fonts
      fonts.push({ value: 'TransportMedium', label: 'Transport Medium' });
      fonts.push({ value: 'TransportHeavy', label: 'Transport Heavy' });
    }

    return fonts;
  },

  /**
   * Validate that all fonts in the priority list exist
   * Show warning toast for missing fonts
   */
  validateFonts: function () {
    const missingFonts = [];

    FontPriorityManager.fontPriorityList.forEach(fontName => {
      // Check if font exists (either as built-in or in window)
      const isBuiltInFont = ['parsedFontKorean', 'parsedFontChinese', 'TransportMedium', 'TransportHeavy', 'TW-MOE-Std-Kai'].includes(fontName);
      const existsInWindow = window[fontName] !== undefined;

      if (!isBuiltInFont && !existsInWindow) {
        missingFonts.push(fontName);
      }
    });

    if (missingFonts.length > 0 && GeneralHandler && GeneralHandler.showToast) {
      GeneralHandler.showToast(
        `Warning: ${missingFonts.length} font(s) not found: ${missingFonts.join(', ')}. Please upload or remove them from the priority list.`,
        'warning',
        7000
      );
    }
    return missingFonts;
  },

  /**
   * Check all fonts periodically and show warnings for missing ones
   * This is useful after font uploads or changes
   */
  checkAllFonts: function () {
    // Check if any fonts in the current priority list are missing
    const missingFonts = FontPriorityManager.validateFonts();

    // Also check all custom fonts that might be referenced by text objects
    if (window.CanvasGlobals && window.CanvasGlobals.canvas) {
      const textObjects = window.CanvasGlobals.canvas.getObjects().filter(obj =>
        obj.functionalType === 'Text'
      );

      const uniqueFonts = new Set();
      textObjects.forEach(textObj => {
        if (textObj.fontFamily) uniqueFonts.add(textObj.fontFamily);
        if (textObj.fontNames) uniqueFonts.add(textObj.fontNames);
      });

      // Check each unique font
      uniqueFonts.forEach(fontName => {
        const isBuiltInFont = ['parsedFontKorean', 'parsedFontChinese', 'TransportMedium', 'TransportHeavy', 'TW-MOE-Std-Kai'].includes(fontName);
        const existsInWindow = window[fontName] !== undefined;

        if (!isBuiltInFont && !existsInWindow && !missingFonts.includes(fontName)) {
          missingFonts.push(fontName);
        }
      });
    }

    return missingFonts;
  },

  /**
   * Get all text objects from the canvas
   * @returns {Array} Array of text objects
   */
  getAllTextObjects: function () {

    return CanvasGlobals.canvasObject.filter(obj =>
      obj.functionalType === 'Text'
    );
  },
  /**
   * Update all text objects to use a fallback font
   * @param {string} missingFont - The font that was not found
   * @param {string} fallbackFont - The font to use instead
   * @returns {number} Number of text objects updated
   */
  updateAllTextObjectsFont: function (missingFont, fallbackFont) {
    const textObjects = FontPriorityManager.getAllTextObjects();
    let updatedCount = 0;

    textObjects.forEach(textObj => {
      if (textObj.fontFamily === missingFont || textObj.fontNames === missingFont) {
        // Store the original font name so we can restore it later when the font becomes available
        if (!textObj.originalFontFamily) {
          textObj.originalFontFamily = missingFont;
        }

        // Update the font property
        if (textObj.fontFamily) textObj.fontFamily = fallbackFont;
        if (textObj.fontNames) textObj.fontNames = fallbackFont;

        // Force re-render
        textObj.dirty = true;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      window.CanvasGlobals.canvas.renderAll();
    }

    return updatedCount;
  },

  /**
   * Get the first available font from the system
   * @returns {string} Name of an available font
   */
  getFirstAvailableFont: function () {
    // Check built-in fonts first by accessing global font variables
    const builtInFonts = [
      { name: 'TransportMedium', check: () => window.parsedFontMedium },
      { name: 'TransportHeavy', check: () => window.parsedFontHeavy },
      { name: 'TW-MOE-Std-Kai', check: () => window.parsedFontKai },
      { name: 'parsedFontKorean', check: () => window.parsedFontKorean },
      { name: 'parsedFontChinese', check: () => window.parsedFontChinese }
    ];

    for (const font of builtInFonts) {
      if (font.check && font.check()) {
        return font.name;
      }
    }

    // Fallback to system font
    return 'TransportMedium';
  },

  /**
   * Handle missing font - show toast and update all text objects
   * @param {string} missingFontName - The name of the missing font
   * @returns {string} The fallback font name used
   */
  handleMissingFont: function (missingFontName) {
    const fallbackFont = FontPriorityManager.getFirstAvailableFont();
    const updatedCount = FontPriorityManager.updateAllTextObjectsFont(missingFontName, fallbackFont);

    // Show toast message instead of console warning
    if (GeneralHandler && GeneralHandler.showToast) {
      GeneralHandler.showToast(
        `Font "${missingFontName}" not found. ${updatedCount} text object(s) updated to use "${fallbackFont}".`,
        'warning',
        5000
      );
    }
    return fallbackFont;
  },
  /**
   * Check for text objects that need the uploaded font and update them
   * @param {string} uploadedFontName - The name of the newly uploaded font
   * @returns {number} Number of text objects updated
   */
  updateTextObjectsWithUploadedFont: function (uploadedFontName) {
    const textObjects = FontPriorityManager.getAllTextObjects();
    let updatedCount = 0;

    // Get the original font filename without the "custom_" prefix
    const originalFontName = uploadedFontName.replace(/^custom_/, '');

    textObjects.forEach(textObj => {
      // Check if this text object was looking for this font
      // This could happen if the font was missing before and now it's available
      const needsUpdate = (
        (textObj.font === uploadedFontName) ||
        (textObj.font === originalFontName));

      if (needsUpdate) {
        // Update to use the newly uploaded font
        textObj.font = uploadedFontName;

        // Force re-render
        textObj.removeAll();
        textObj.initialize();
        textObj.updateAllCoord();
      }
    });

    if (updatedCount > 0) {

      // Show success toast
      if (GeneralHandler && GeneralHandler.showToast) {
        GeneralHandler.showToast(
          `Font "${originalFontName}" uploaded successfully! ${updatedCount} text object(s) updated to use the new font.`,
          'success',
          4000
        );
      }
    } else {
      // Show info toast even if no objects were updated
      if (GeneralHandler && GeneralHandler.showToast) {
        GeneralHandler.showToast(
          `Font "${originalFontName}" uploaded successfully and added to priority list.`,
          'success',
          3000
        );
      }
    }
    return updatedCount;
  },


};

// Initialize the font priority system when the module loads
FontPriorityManager.initialize();

// Make FontPriorityManager globally accessible for path.js and other modules
if (typeof window !== 'undefined') {
  window.FontPriorityManager = FontPriorityManager;
}

export { FontPriorityManager };
