/**
 * TextObject extends BaseGroup to create text with proper vertex handling
 */

import { BaseGroup } from './draw.js';
import { drawDivider } from './divider.js';
import { textWidthMedium, textWidthHeavy, } from './template.js';
import { getFontPath, parsedFontMedium, parsedFontHeavy, parsedFontChinese, parsedFontHK, parsedFontKorean, parsedFontChocolate, parsedFontKai, parsedFontSans, ensureOpenTypePatched } from './path.js';
import { GeneralSettings } from '../sidebar/sbGeneral.js';
import { FormTextAddComponent } from '../sidebar/sb-text.js';
import { FontPriorityManager } from '../modal/md-font.js';


// Special characters that are not available in Transport fonts and should use fallback
const TRANSPORT_MISSING_CHARS = new Set([
  '$', '@', '#', '*', '~', '`', 
  '€', '£', '¥', '¢', '©', '®', '™', '§',
  '¿', '¡', 'ñ', 'Ñ', 'ç', 'Ç', 'á', 'é', 'í', 'ó', 'ú',
  'À', 'È', 'Ì', 'Ò', 'Ù', 'â', 'ê', 'î', 'ô', 'û',
  'ä', 'ë', 'ï', 'ö', 'ü', 'Ä', 'Ë', 'Ï', 'Ö', 'Ü',
  '±', '×', '÷', '≠', '≤', '≥', '∞', '∑', '∏', '√',
  '°', 'µ', 'Ω', 'α', 'β', 'γ', 'δ', 'π', 'σ', 'τ',
  '♠', '♣', '♥', '♦', '★', '☆', '♪', '♫', '☂', '☀',
  '←', '→', '↑', '↓', '↔', '↕', '⇒', '⇐', '⇑', '⇓'
]);

class TextObject extends BaseGroup {
  constructor(options = {}) {
    options.color = options.color === 'White' ? '#ffffff' : (options.color === 'Black' ? '#000000' : options.color);
    // Call BaseGroup without base polygon
    super(null, 'Text', 'TextObject', options);
    // Store metadata properties
    this.text = options.text || '';
    this.xHeight = options.xHeight || 100;
    this.color = options.color || '#ffffff';
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.containsNonAlphabetic = false;
    this.txtCharList = [];
    this.txtFrameList = [];
    this.underline = options.underline || null;
    this.containsNonAlphabetic = containsNonEnglishCharacters(this.text);

    // Determine the correct font based on text content and priority system
    const defaultFont = options.font || 'TransportMedium';
    const chineseFontFromPriority = this._getChineseFontFromPriority(this.text, defaultFont);

    // Use Chinese font from priority system if text contains non-English characters,
    // otherwise use the provided font or default
    this.font = chineseFontFromPriority || defaultFont;

    this.initialize();
  }

  /**
 * Initialize the TextObject drawing after instantiation.
 * Creates character paths and frames, then sets the base polygon.
 * @returns {TextObject}
 */
  initialize() {
    // Generate elements using stored properties
    const { txtCharList, txtFrameList, containsNonAlphabetic } = TextObject.createTextElements(
      this.text,
      this.xHeight,
      this.color,
      this.font,
      false
    );
    // Build group
    const group = new fabric.Group([...txtCharList, ...txtFrameList], {
      left: this.left,
      top: this.top
    });
    // Custom bounding box calculation
    group.setCoords();
    // Store references
    this.txtCharList = txtCharList;
    this.txtFrameList = txtFrameList;
    this.containsNonAlphabetic = containsNonAlphabetic;
    // Set group as base polygon
    this.setBasePolygon(group);
    // Update display name
    this._showName = `<Group ${this.canvasID}> Text - ${this.text}`;
    return this;
  }

  /**
   * LEGACY Handle double-click on the text object
  */
  onDoubleClick() {
    // If already defined, initialize directly
    FormTextAddComponent.textPanelInit(null, this);
    this.setupTextPanelInputs();

  }

  /**
   * Setup text panel inputs with current text values
   */
  setupTextPanelInputs() {
    // Wait for the panel to initialize
    setTimeout(() => {
      // Fill the text input with the current text
      const textInput = document.getElementById('input-text');
      if (textInput) {
        textInput.value = this.text;
        textInput.focus();
      }

      // Set the xHeight input
      const xHeightInput = document.getElementById('input-xHeight');
      if (xHeightInput) {
        xHeightInput.value = this.xHeight;
      }

      // Set the font toggle
      const fontToggle = document.getElementById('Text Font-container');
      if (fontToggle) {
        const buttons = fontToggle.querySelectorAll('.toggle-button');
        buttons.forEach(button => {
          if (button.getAttribute('data-value') === this.font) {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
      }

      // Set the color toggle
      const colorToggle = document.getElementById('Message Colour-container');
      if (colorToggle) {
        const buttons = colorToggle.querySelectorAll('.toggle-button');
        buttons.forEach(button => {
          if (button.getAttribute('data-value') === 'White' && this.color == '#ffffff') {
            button.classList.add('active');
          } else if
            (button.getAttribute('data-value') === 'Black' && this.color == '#000000') {
            button.classList.add('active');
          } else {
            button.classList.remove('active');
          }
        });
      }
    }, 100);
  }


  /**
   * Helper function to get the appropriate font for Chinese/non-English characters
   * @param {string} text - Text to check
   * @returns {string} - Font family name to use
   */
  _getChineseFontFromPriority(text, defaultFont = null) {
    try {
      // Check if text contains non-English characters
      if (!containsNonEnglishCharacters(text)) {
        return null; // Not Chinese text, don't override font
      }

     if (window[defaultFont]) {
        return defaultFont; // If a specific font is provided, don't override it
      } else {
        const fontPriorityList = FontPriorityManager.getFontPriorityList();
        const priorityFont = fontPriorityList.length > 0 ? fontPriorityList[0] : 'parsedFontKorean';
        return priorityFont; // Return the first font from the priority list
      }
    } catch (error) {
      console.warn('Could not get font from FontPriorityManager, falling back to default Chinese font:', error);
      return defaultFont; // Fallback to default Chinese font
    }
  }

  /**
   * Helper function to get character parameters based on type
   */
  static _getCharacterParameters(textChar, containsNonAlphabetic, font, xHeight, previousChar, nextChar) {
    // Handle special character transformations
    let actualChar = textChar;
    if (textChar === ',' && containsNonAlphabetic) {
      actualChar = '、';
    }

    // Check if character is missing from Transport fonts and force fallback
    let effectiveFont = font;
    if ((font === 'TransportMedium' || font === 'TransportHeavy') && TRANSPORT_MISSING_CHARS.has(textChar)) {
      console.log(`Character "${textChar}" is not available in ${font}, switching to fallback font`);
      effectiveFont = 'parsedFontSans'; // Use sans serif fallback for special characters
    }

    if (containsNonAlphabetic) {
      return this._getNonEnglishCharacterParams(actualChar, effectiveFont, xHeight, previousChar);
    } else {
      return this._getEnglishCharacterParams(textChar, effectiveFont, xHeight, previousChar, nextChar);
    }
  }

  /**
   * Helper function for English character parameters
   */
  static _getEnglishCharacterParams(textChar, font, xHeight, previousChar, nextChar) {
    const isTransportHeavy = font === 'TransportHeavy';
    const fontWidth = isTransportHeavy ? textWidthHeavy : textWidthMedium;
    
    // Check if current character should use short width based on specific rules
    let hasShortWidth = false;
    
    // Rule 1: Characters following T, U, V use short width
    if (previousChar && ['T', 'U', 'V'].includes(previousChar)) {
      hasShortWidth = true;
    }
    
    // Rule 2: T, U, V use short width when followed by a character that has short width AND is lowercase
    if (['T', 'U', 'V'].includes(textChar) && nextChar) {
      const nextCharWidthObj = fontWidth.find(e => e.char === nextChar);
      const nextCharHasShortWidth = nextCharWidthObj && nextCharWidthObj.shortWidth !== 0;
      const nextCharIsLowercase = nextChar >= 'a' && nextChar <= 'z';
      
      if (nextCharHasShortWidth && nextCharIsLowercase) {
        hasShortWidth = true;
      }
    }
    
    // Rule 3: W uses short width when followed by uppercase letter
    if (textChar === 'W' && nextChar) {
      const nextCharIsUppercase = nextChar >= 'A' && nextChar <= 'Z';
      if (nextCharIsUppercase) {
        hasShortWidth = true;
      }
    }

    const charWidthObj = fontWidth.find(e => e.char === textChar);
    const charWidth = charWidthObj ?
      (hasShortWidth && charWidthObj.shortWidth !== 0 ? charWidthObj.shortWidth : charWidthObj.width) :
      100;

    return {
      actualChar: textChar,
      fontFamily: font,
      fontSize: xHeight * 1.88,
      charWidth: charWidth,
      bracketOffset: ['(', ')'].includes(textChar) ? 0.15 : 0,
      leftOffset: 0,
      topOffset: 0.1 * xHeight,
      frameWidth: charWidth * xHeight / 100 - 2,
      frameHeight: xHeight * 2 - 2,
      advanceWidth: charWidth * xHeight / 100
    };
  }
  /**
   * Helper function for non-English character parameters (Chinese, numbers, punctuation)
   */
  static _getNonEnglishCharacterParams(actualChar, font, xHeight, previousChar) {
    const isKnownPunctuation = textWidthHeavy.map(item => item.char).includes(actualChar);

    if (this._isNumber(actualChar)) {
      // Numbers in non-English text
      return this._getNumberParams(actualChar, xHeight, previousChar);
    } else if (isKnownPunctuation) {
      // English punctuation in non-English text - use Transport Heavy
      return this._getPunctuationParams(actualChar, xHeight, previousChar);
    } else {
      // Chinese characters - pass the font parameter
      return this._getChineseCharacterParams(actualChar, font, xHeight);
    }
  }

  /**
   * Helper function for punctuation parameters
   */
  static _getPunctuationParams(textChar, xHeight, previousChar) {
    const charWidthObj = textWidthHeavy.find(e => e.char === textChar);
    const charWidth = charWidthObj?.width || xHeight * 100 / 4;
    
    // Check if this punctuation should use fallback font
    let fontFamily;
    if (textChar === '、') {
      fontFamily = 'TW-MOE-Std-Kai';
    } else if (TRANSPORT_MISSING_CHARS.has(textChar)) {
      fontFamily = 'parsedFontSans'; // Use sans serif for special punctuation
      console.log(`Punctuation "${textChar}" using fallback font`);
    } else {
      fontFamily = 'TransportHeavy';
    }

    return {
      actualChar: textChar,
      fontFamily: fontFamily,
      fontSize: xHeight * 1.88,
      charWidth: charWidth,
      bracketOffset: ['(', ')'].includes(textChar) ? -0.3125 : 0,
      leftOffset: 0.25 * xHeight,
      topOffset: 0.2 * xHeight,
      frameWidth: charWidth * xHeight / 100 + 0.5 * xHeight - 2,
      frameHeight: 2.85 * xHeight - 2,
      advanceWidth: charWidth * xHeight / 100 + 0.5 * xHeight
    };
  }

  /**
   * Helper function for number parameters
   */
  static _getNumberParams(textChar, xHeight, previousChar) {
    const charWidthObj = textWidthMedium.find(e => e.char === textChar);
    const charWidth = charWidthObj.width * 1.375 * xHeight / 100;

    return {
      actualChar: textChar, fontFamily: 'TransportMedium',
      fontSize: xHeight * 1.88 * 1.375,
      charWidth: charWidth * xHeight,
      bracketOffset: 0,
      leftOffset: (containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0),
      topOffset: 0.1 * xHeight,
      frameWidth: charWidth - 2 + (containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0),
      frameHeight: 2.85 * xHeight - 2,
      advanceWidth: charWidth + (containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0)
    };
  }  /**
   * Helper function for Chinese character parameters
   */
  static _getChineseCharacterParams(actualChar, font, xHeight) {
    // Check if character requires special override font
    let fontFamily = font;
    
    try {
      // Get override rules from FontPriorityManager
      const rules = FontPriorityManager.getOverrideRules();
      
      // Find a rule that contains this character
      const matchingRule = rules.find(rule => rule.characters.includes(actualChar));
      
      if (matchingRule) {
        fontFamily = matchingRule.font;
      }
    } catch (error) {
      console.warn('Could not check special characters, using default font:', error);
      // Continue with the originally passed font
    }

    return {
      actualChar: actualChar,
      fontFamily: fontFamily,
      fontSize: xHeight * 2.25,
      charWidth: 275,
      bracketOffset: 0,
      leftOffset: 0.25 * xHeight,
      topOffset: -0.2 * xHeight,
      frameWidth: 2.75 * xHeight - 2,
      frameHeight: 2.85 * xHeight - 2,
      advanceWidth: 2.75 * xHeight
    };
  }

  /**
   * Helper function to check if character is a number
   */
  static _isNumber(char) {
    return /\d/.test(char);
  }

  /**
   * Helper function to calculate character positioning
   */
  static _calculateCharacterPositioning(left_pos, charParams, xHeight, previousChar) {
    return {
      charLeftPos: left_pos + charParams.leftOffset,
      charTopPos: charParams.bracketOffset * xHeight + charParams.topOffset
    };
  }

  /**
   * Helper function to create character elements (path and frame)
   */
  static _createCharacterElements(charParams, positioning, fontGlyphs, color, xHeight, textChar, font, previousChar, nextChar) {
    // Access font metrics
    const fontMetrics = {
      unitsPerEm: fontGlyphs.unitsPerEm,
      ascender: fontGlyphs.ascender,
      descender: fontGlyphs.descender,
    };

    // Scale metrics to desired font size
    const fontScale = charParams.fontSize / fontMetrics.unitsPerEm;
    const scaledAscender = fontMetrics.ascender * fontScale;
    const scaledDescender = Math.abs(fontMetrics.descender) * fontScale;
    const fontHeight = scaledAscender + scaledDescender;

    // Calculate the vertical position to center the glyph
    const font2CanvasRatio = 1 / fontHeight * charParams.frameHeight;

    // Create the path parameters for this character
    const pathParams = {
      character: charParams.actualChar,
      x: 0,
      y: scaledAscender * font2CanvasRatio,
      fontSize: charParams.fontSize,
      fontFamily: charParams.fontFamily,
      fill: color
    };

    // Get the font path
    const charPath = getFontPath(pathParams);
    charPath.fill = color;
    // Ensure opentype rounding patch is applied at point of use in TextObject
    ensureOpenTypePatched();
    const charSVG = charPath.toPathData({ flipY: false });
    const charGlyph = fontGlyphs.charToGlyph(charParams.actualChar);

    const minTop = Math.min(...charPath.commands.map(cmd => cmd.y));

    // Calculate left position adjustment for short width characters
    let leftAdjustment = 0;
    
    // Check if current character should use short width based on the same rules
    let shouldUseShortWidth = false;
    
    // Rule 1: Characters following T, U, V use short width
    if (previousChar && ['T', 'U', 'V'].includes(previousChar)) {
      shouldUseShortWidth = true;
    }
    
    // Rule 2: T, U, V use short width when followed by a character that has short width AND is lowercase
    if (['T', 'U', 'V'].includes(textChar) && nextChar) {
      const isTransportFont = font === 'TransportMedium' || font === 'TransportHeavy';
      if (isTransportFont) {
        const fontWidth = font === 'TransportHeavy' ? textWidthHeavy : textWidthMedium;
        const nextCharWidthObj = fontWidth.find(e => e.char === nextChar);
        const nextCharHasShortWidth = nextCharWidthObj && nextCharWidthObj.shortWidth !== 0;
        const nextCharIsLowercase = nextChar >= 'a' && nextChar <= 'z';
        
        if (nextCharHasShortWidth && nextCharIsLowercase) {
          shouldUseShortWidth = true;
        }
      }
    }
    
    // Rule 3: W uses short width when followed by uppercase letter
    if (textChar === 'W' && nextChar) {
      const nextCharIsUppercase = nextChar >= 'A' && nextChar <= 'Z';
      if (nextCharIsUppercase) {
        shouldUseShortWidth = true;
      }
    }
    
    if (shouldUseShortWidth && !TRANSPORT_MISSING_CHARS.has(textChar)) {
      // Check if short width was actually used for this character
      const isTransportFont = font === 'TransportMedium' || font === 'TransportHeavy';
      if (isTransportFont) {
        const fontWidth = font === 'TransportHeavy' ? textWidthHeavy : textWidthMedium;
        const charWidthObj = fontWidth.find(e => e.char === textChar);
        
        if (charWidthObj && charWidthObj.shortWidth !== 0 && charWidthObj.shortWidth < charWidthObj.width) {
          // Calculate the width difference and center the character
          const widthDifference = (charWidthObj.width - charWidthObj.shortWidth) * xHeight / 100;
          leftAdjustment = widthDifference / 2;
        }
      }
    }

    // Create a path from the font path data
    const txt_char = new fabric.Path(charSVG, {
      left: (charParams.actualChar === '、' ? charGlyph.leftSideBearing - 800 : charGlyph.leftSideBearing) * fontScale + positioning.charLeftPos - leftAdjustment,
      top: minTop + positioning.charTopPos - (charParams.actualChar === '、' ? 600 * fontScale : 0),
      fill: color,
      originX: 'left',
      originY: 'top'
    });

    // Set properties and return the created path
    txt_char.lockScalingX = txt_char.lockScalingY = true;
    txt_char._textChar = charParams.actualChar; // Store the character for reference

    // Create the frame rectangle
    const txt_frame = new fabric.Rect({
      left: positioning.charLeftPos - charParams.leftOffset,
      top: 0,
      width: charParams.frameWidth,
      height: charParams.frameHeight,
      fill: 'rgba(0,0,0,0)',
      stroke: GeneralSettings.showTextBorders ? color : 'rgba(0,0,0,0)',
      strokeWidth: 2,
      strokeDashArray: [xHeight / 10, xHeight / 10],
    });

    return {
      textPath: txt_char,
      frame: txt_frame
    };
  }
  /**
   * Helper function to get appropriate font glyphs
   */
  static _getFontGlyphs(fontFamily, textChar, containsNonAlphabetic) {
    if (fontFamily === 'TransportMedium') {
      return parsedFontMedium;
    } else if (fontFamily === 'TransportHeavy') {
      return parsedFontHeavy;
    } else if (fontFamily === 'TW-MOE-Std-Kai') {
      return parsedFontKai;
    } else if (fontFamily === 'parsedFontKorean') {
      return parsedFontKorean;
    } else if (fontFamily === 'parsedFontHK') {
      return parsedFontHK;
    } else if (fontFamily === 'parsedFontChocolate') {
      return parsedFontChocolate;
    } else if (fontFamily === 'parsedFontSans') {
      return parsedFontSans; // Return the sans serif fallback font
    } else if (fontFamily.startsWith('custom_')) {
      // Handle custom fonts - they should have their font object in window
      const customFont = window[fontFamily];
      return customFont || parsedFontChinese; // Fallback to default
    } else {
      return parsedFontChinese;
    }
  }
  /**
   * Static method to create text and frame elements
   * 
   * This function handles different character types with clear separation:
   * 
   * 1. English characters:
   *    - Uses TransportMedium or TransportHeavy font based on font parameter
   *    - Handles short width for characters following T, U, V
   * 
   * 2. Non-English text containing:
   *    a) English punctuation: Uses TransportHeavy font
   *    b) Numbers: Uses TransportMedium font with adjusted sizing
   *    c) Chinese characters: Uses font from FontPriorityManager priority system
   *       - Font determined by priority list (e.g., TW-MOE-Std-Kai, custom fonts)
   *       - Special handling for comma (,) → 、 transformation
   *
   * Each character type has specific parameters for:
   * - Font family and size
   * - Character width and positioning offsets
   * - Frame dimensions and advance width
   */
  static createTextElements(txt, xHeight, color, font, isCursor = false) {
    let txtCharList = [];
    let txtFrameList = [];
    let left_pos = 0;    // Check if text contains any non-English characters
    const containsNonAlphabetic = containsNonEnglishCharacters(txt);

    for (let i = 0; i < txt.length; i++) {
      let textChar = txt.charAt(i);
      const previousChar = i > 0 ? txt[i - 1] : null;
      const nextChar = i < txt.length - 1 ? txt[i + 1] : null;

      // Get character parameters based on type
      const charParams = this._getCharacterParameters(textChar, containsNonAlphabetic, font, xHeight, previousChar, nextChar);
      // Calculate positioning
      const positioning = this._calculateCharacterPositioning(left_pos, charParams, xHeight, previousChar);

      // Get font glyphs
      const fontGlyphs = this._getFontGlyphs(charParams.fontFamily, charParams.actualChar, containsNonAlphabetic);

      // Create character path and frame
      const charElements = this._createCharacterElements(
        charParams,
        positioning,
        fontGlyphs,
        color,
        xHeight,
        textChar,
        font,
        previousChar,
        nextChar
      );

      txtCharList.push(charElements.textPath);
      txtFrameList.push(charElements.frame);

      // Update position for next character
      left_pos += charParams.advanceWidth;
    }

    return { txtCharList, txtFrameList, containsNonAlphabetic };
  }

  /**
   * Legacy Method to calculate combined bounding box from rectangle objects in a group
   */
  static getCombinedBoundingBoxOfRects() {
    let combinedBBox = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    let points = [];
    this.forEachObject(obj => {
      if (obj.type === 'rect') {
        obj.setCoords();
        const aCoords = obj.aCoords;

        // Transform the coordinates to the canvas coordinate system
        Object.values(aCoords).forEach(point => {
          const absPoint = fabric.util.transformPoint(point, this.calcTransformMatrix());
          combinedBBox.left = Math.min(combinedBBox.left, absPoint.x);
          combinedBBox.top = Math.min(combinedBBox.top, absPoint.y);
          combinedBBox.right = Math.max(combinedBBox.right, absPoint.x);
          combinedBBox.bottom = Math.max(combinedBBox.bottom, absPoint.y);
        });
      }
    });

    // Calculate the 8 points (excluding the center point) from the combined bounding box
    const centerX = (combinedBBox.left + combinedBBox.right) / 2;
    const centerY = (combinedBBox.top + combinedBBox.bottom) / 2;

    points = [
      { x: combinedBBox.left, y: combinedBBox.top, label: 'E1' }, // Top-left corner
      { x: centerX, y: combinedBBox.top, label: 'E2' }, // Top-middle
      { x: combinedBBox.right, y: combinedBBox.top, label: 'E3' }, // Top-right corner
      { x: combinedBBox.right, y: centerY, label: 'E4' }, // Middle-right
      { x: combinedBBox.right, y: combinedBBox.bottom, label: 'E5' }, // Bottom-right corner
      { x: centerX, y: combinedBBox.bottom, label: 'E6' }, // Bottom-middle
      { x: combinedBBox.left, y: combinedBBox.bottom, label: 'E7' }, // Bottom-left corner
      { x: combinedBBox.left, y: centerY, label: 'E8' } // Middle-left
    ];

    return points;
  }

  /**
   * Method to update text properties
   */
  updateText(newText, newXHeight, newFont, newColor) {
    // Remove old objects
    this.removeAll();

    // Create new text elements
    const { txtCharList, txtFrameList, containsNonAlphabetic } = TextObject.createTextElements(
      newText,
      newXHeight,
      newColor,
      newFont
    );

    // Create a new group
    const group = new fabric.Group([...txtCharList, ...txtFrameList], {
      left: this.left,
      top: this.top
    });


    // Add vertex and text information to the group
    group.setCoords();
    group.text = newText;
    group.xHeight = newXHeight;

    // Update this text object with the new group
    this.replaceBasePolygon(group);

    // Update properties
    this.text = newText;
    this.xHeight = newXHeight;
    this.font = newFont;
    this.color = newColor;
    this.txtCharList = txtCharList;
    this.txtFrameList = txtFrameList;
    this.containsNonAlphabetic = containsNonAlphabetic;

    // Update the name for the object inspector
    this._showName = `<Group ${this.canvasID}> Text - ${newText}`; 

    // Update underline if it exists
    if (this.underline) {
      const textWidth = (this.basePolygon && this.basePolygon.width)
        ? this.basePolygon.width * this.basePolygon.scaleX
        : this.width;

      const objectBBox = { left: this.left, top: this.top+this.height, right: 0, bottom: 0 };
      const objectSize = { width: textWidth, height: this.underline.xHeight / 4 };

      const basePoly = drawDivider(this.underline.xHeight, this.underline.color, objectBBox, objectSize, 'HLine');
      this.underline.replaceBasePolygon(basePoly, false);
      //this.underline.drawVertex(false);
      //this.underline.setCoords();
    }
    
    //this.canvas.renderAll();
  }
}

/**
 * Check if text contains non-English characters
 * @param {string} txt - Text to check
 * @returns {boolean} - True if text contains non-English characters
 */
export function containsNonEnglishCharacters(txt) {
  if (!txt || typeof txt !== 'string') {
    return false;
  }

  return txt.split('').some(char => {
    // If the character is not in our English width dictionaries, consider it non-English
    return !textWidthMedium.map(item => item.char).includes(char);
  });
}

/**
 * Check if a single character is non-English
 * @param {string} char - Single character to check
 * @returns {boolean} - True if character is non-English
 */
export function isNonEnglishCharacter(char) {
  if (!char || typeof char !== 'string' || char.length !== 1) {
    return false;
  }

  return !textWidthMedium.map(item => item.char).includes(char);
}

export { TextObject };
