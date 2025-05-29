/**
 * md-font.js - Font Priority Management Modal
 * This module handles the Chinese font priority management functionality
 */

import { ModalUtils } from './mdGeneral.js';

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
    uploadTitle.textContent = 'Upload Custom Font';
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
    overrideTitle.textContent = 'Character Override Settings';
    const overrideInfo = ModalUtils.createInfoText('Specify characters that should use a specific font. Enter characters directly without spaces or commas.');

    const overrideContainer = document.createElement('div');
    overrideContainer.className = 'override-container';

    // Font selection for override
    const fontSelectLabel = document.createElement('label');
    fontSelectLabel.textContent = 'Override Font:';
    fontSelectLabel.className = 'override-label';

    const fontSelect = document.createElement('select');
    fontSelect.className = 'font-select';
    fontSelect.id = 'override-font-select';
    FontPriorityManager.populateFontSelect(fontSelect);    // Character input
    const charInputLabel = document.createElement('label');
    charInputLabel.textContent = 'Characters:';
    charInputLabel.className = 'override-label';
    const charInput = document.createElement('input');
    charInput.type = 'text';
    charInput.className = 'char-input';
    charInput.id = 'override-char-input';
    charInput.placeholder = 'e.g., 屯門元朗天水圍';
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
    ModalUtils.showModal(modal);},

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
   */
  handleFontUpload: function (event) {
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

      } catch (error) {
        console.error('Error parsing font:', error);
        alert('Failed to parse font file. Please ensure it\'s a valid font file.');
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
  },

  /**
   * Load font priority from localStorage
   */
  loadFontPriorityFromStorage: function () {
    const stored = localStorage.getItem('fontPriorityList');
    if (stored) {
      try {
        FontPriorityManager.fontPriorityList = JSON.parse(stored);
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

};

// Initialize the font priority system when the module loads
FontPriorityManager.initialize();

// Make FontPriorityManager globally accessible for path.js and other modules
if (typeof window !== 'undefined') {
  window.FontPriorityManager = FontPriorityManager;
}

export { FontPriorityManager };
