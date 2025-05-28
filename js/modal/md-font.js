/**
 * md-font.js - Font Priority Management Modal
 * This module handles the Chinese font priority management functionality
 */

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
    // Remove existing modal if any
    let existingModal = document.getElementById('font-priority-modal');
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal container
    const modal = document.createElement('div');
    modal.id = 'font-priority-modal';

    // Create modal content box
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Modal Title
    const title = document.createElement('h3');
    title.textContent = 'Chinese Font Priority Management';

    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.className = 'close-button';
    closeButton.onclick = () => modal.remove();

    // Info text
    const infoText = document.createElement('p');
    infoText.textContent = 'Fonts are tried in order from top to bottom.';
    infoText.className = 'info-text';

    // Font list container
    const fontListContainer = document.createElement('div');
    fontListContainer.className = 'font-list-container';
    fontListContainer.id = 'font-list-container';

    // Populate font list
    FontPriorityManager.updateFontListDisplay(fontListContainer);

    // Upload font section
    const uploadSection = document.createElement('div');
    uploadSection.className = 'upload-section';

    const uploadTitle = document.createElement('h4');
    uploadTitle.textContent = 'Upload Custom Font';
    const uploadInput = document.createElement('input');
    uploadInput.type = 'file';
    uploadInput.accept = '.ttf,.otf,.woff';
    uploadInput.className = 'font-upload-input';
    uploadInput.onchange = FontPriorityManager.handleFontUpload;

    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Choose Font File';
    uploadButton.className = 'upload-button';
    uploadButton.onclick = () => uploadInput.click();

    uploadSection.appendChild(uploadTitle);
    uploadSection.appendChild(uploadButton);
    uploadSection.appendChild(uploadInput);

    // Character Override section
    const overrideSection = document.createElement('div');
    overrideSection.className = 'upload-section';

    const overrideTitle = document.createElement('h4');
    overrideTitle.textContent = 'Character Override Settings'; const overrideInfo = document.createElement('p');
    overrideInfo.textContent = 'Specify characters that should use a specific font. Enter characters directly without spaces or commas.';
    overrideInfo.className = 'info-text';

    const overrideContainer = document.createElement('div');
    overrideContainer.className = 'override-container';

    // Font selection for override
    const fontSelectLabel = document.createElement('label');
    fontSelectLabel.textContent = 'Override Font:';
    fontSelectLabel.className = 'override-label';

    const fontSelect = document.createElement('select');
    fontSelect.className = 'font-select';
    fontSelect.id = 'override-font-select';
    FontPriorityManager.populateFontSelect(fontSelect);

    // Character input
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

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'buttons-container';
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Changes';
    applyButton.className = 'apply-button';
    applyButton.onclick = () => {
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
      modal.remove();
    };

    buttonsContainer.appendChild(applyButton);

    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(title);
    modalContent.appendChild(infoText);
    modalContent.appendChild(fontListContainer);
    modalContent.appendChild(uploadSection);
    modalContent.appendChild(overrideSection);
    modalContent.appendChild(buttonsContainer);
    modal.appendChild(modalContent);

    // Append modal to body
    document.body.appendChild(modal);  },

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
        FontPriorityManager.fontPriorityList.push(customFontName);

        // Update display
        FontPriorityManager.updateFontListDisplay(document.getElementById('font-list-container'));

        alert(`Font "${file.name}" uploaded successfully!`);
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
    alert('Font priority changes applied successfully!');
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
      localStorage.removeItem('characterOverrideCharacters');
      
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
};

// Initialize the font priority system when the module loads
FontPriorityManager.initialize();

// Make FontPriorityManager globally accessible for path.js and other modules
if (typeof window !== 'undefined') {
  window.FontPriorityManager = FontPriorityManager;
}

export { FontPriorityManager };
