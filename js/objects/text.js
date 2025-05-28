/**
 * TextObject extends BaseGroup to create text with proper vertex handling
 */

import { BaseGroup } from './draw.js';
import { textWidthMedium, textWidthHeavy, } from './template.js';
import { getFontPath, parsedFontMedium, parsedFontHeavy, parsedFontChinese, parsedFontKorean, parsedFontKai } from './path.js';
import { GeneralSettings } from '../sidebar/sbGeneral.js';
import { FormTextAddComponent } from '../sidebar/sb-text.js';

class TextObject extends BaseGroup {
  constructor(options = {}) {
    options.color = options.color === 'White' ? '#ffffff' : (options.color === 'Black' ? '#000000' : options.color);
    // Call BaseGroup without base polygon
    super(null, 'Text', 'TextObject', options);
    // Store metadata properties
    this.text = options.text || '';
    this.xHeight = options.xHeight || 100;
    this.font = options.font || 'TransportMedium';
    this.color = options.color || '#ffffff';
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.containsNonAlphabetic = false;
    this.txtCharList = [];
    this.txtFrameList = [];

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
   * Helper function to check if text contains non-English characters
   */
  static _containsNonEnglishCharacters(txt) {
    return txt.split('').some(char => {
      // If the character is not in our English width dictionaries, consider it non-English
      return !textWidthMedium.map(item => item.char).includes(char);
    });
  }

  /**
   * Helper function to get character parameters based on type
   */
  static _getCharacterParameters(textChar, containsNonAlphabetic, font, xHeight, previousChar) {
    // Handle special character transformations
    let actualChar = textChar;
    if (textChar === ',' && containsNonAlphabetic) {
      actualChar = '、';
    }

    if (containsNonAlphabetic) {
      return this._getNonEnglishCharacterParams(actualChar, xHeight, previousChar);
    } else {
      return this._getEnglishCharacterParams(textChar, font, xHeight, previousChar);
    }
  }

  /**
   * Helper function for English character parameters
   */
  static _getEnglishCharacterParams(textChar, font, xHeight, previousChar) {
    const isTransportHeavy = font === 'TransportHeavy';
    const fontWidth = isTransportHeavy ? textWidthHeavy : textWidthMedium;
    const hasShortWidth = previousChar && ['T', 'U', 'V'].includes(previousChar);

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
  static _getNonEnglishCharacterParams(actualChar, xHeight, previousChar) {
    const isKnownPunctuation = textWidthHeavy.map(item => item.char).includes(actualChar);

    if (this._isNumber(actualChar)) {
      // Numbers in non-English text
      return this._getNumberParams(actualChar, xHeight, previousChar);
    } else if (isKnownPunctuation) {
      // English punctuation in non-English text - use Transport Heavy
      return this._getPunctuationParams(actualChar, xHeight, previousChar);
    } else {
      // Chinese characters
      return this._getChineseCharacterParams(actualChar, xHeight);
    }
  }

  /**
   * Helper function for punctuation parameters
   */
  static _getPunctuationParams(textChar, xHeight, previousChar) {
    const charWidthObj = textWidthHeavy.find(e => e.char === textChar);
    const charWidth = charWidthObj.width || xHeight * 100 / 4;
    const fontFamily = textChar === '、' ? 'TW-MOE-Std-Kai' : 'TransportHeavy';

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
      actualChar: textChar,
      fontFamily: 'TransportMedium',
      fontSize: xHeight * 1.88 * 1.375,
      charWidth: charWidth * xHeight,
      bracketOffset: 0,
      leftOffset: (this._containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0),
      topOffset: 0.1 * xHeight,
      frameWidth: charWidth - 2 + (this._containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0),
      frameHeight: 2.85 * xHeight - 2,
      advanceWidth: charWidth + (this._containsNonEnglishCharacters(previousChar || '') ? 0.25 * xHeight : 0)
    };
  }

  /**
   * Helper function for Chinese character parameters
   */
  static _getChineseCharacterParams(actualChar, xHeight) {
    const fontFamily = 'Noto Sans Hong Kong';

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
  static _createCharacterElements(charParams, positioning, fontGlyphs, color, xHeight) {
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
    const charSVG = charPath.toPathData({ flipY: false });
    const charGlyph = fontGlyphs.charToGlyph(charParams.actualChar);

    const minTop = Math.min(...charPath.commands.map(cmd => cmd.y));

    // Create a path from the font path data
    const txt_char = new fabric.Path(charSVG, {
      left: (charParams.actualChar === '、' ? charGlyph.leftSideBearing - 800 : charGlyph.leftSideBearing) * fontScale + positioning.charLeftPos,
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
    } else if (textChar === '、') {
      return parsedFontKai;
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
   *    b) Numbers: Uses Noto Sans Hong Kong font
   *    c) Chinese characters: Uses Noto Sans Hong Kong or TW-MOE-Std-Kai font
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
    let left_pos = 0;

    // Check if text contains any non-English characters
    const containsNonAlphabetic = this._containsNonEnglishCharacters(txt);

    for (let i = 0; i < txt.length; i++) {
      let textChar = txt.charAt(i);
      const previousChar = i > 0 ? txt[i - 1] : null;

      // Get character parameters based on type
      const charParams = this._getCharacterParameters(textChar, containsNonAlphabetic, font, xHeight, previousChar);
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
        xHeight
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

    this.canvas.renderAll();
  }
}

export { TextObject };
