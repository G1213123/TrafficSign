/**
 * TextObject extends BaseGroup to create text with proper vertex handling
 */

import { BaseGroup } from './draw.js';
import {textWidthMedium, textWidthHeavy,} from './template.js';
import { getFontPath, parsedFontMedium, parsedFontHeavy, parsedFontChinese, parsedFontKai } from './path.js';
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
          if (button.getAttribute('data-value') === 'White' && this.color == '#ffffff' ) {
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
   * Static method to create text and frame elements
   */
  static createTextElements(txt, xHeight, color, font, isCursor = false) {
    // Access the font width dictionaries from FormTextAddComponent
    let txtCharList = [];
    let txtCharPromises = [];
    let txtFrameList = [];
    let left_pos = 0;

    // Check if text contains any non-alphabetic characters
    const containsNonAlphabetic = txt.split('').some(char => {
      // If the character is not in our width dictionaries, consider it non-alphabetic
      return !textWidthMedium.map(item => item.char).includes(char);
    });

    for (let i = 0; i < txt.length; i++) {
      // Check if the character is a Chinese character
      const bracketOffset = ['(', ')',].includes(txt.charAt(i)) ? 0.2 : 0;
      let textChar = txt.charAt(i);

      // Determine font family and size based on character type
      const isKnownPunctuation = textWidthHeavy.map(item => item.char).includes(textChar);
      let fontFamily = containsNonAlphabetic ?
        (isKnownPunctuation ? 'TransportHeavy' : 'Noto Sans Hong Kong') :
        font;
      const fontSize = containsNonAlphabetic ?
        (isKnownPunctuation ? xHeight * 1.88 : xHeight * 2.25) :
        xHeight * 1.88;
      const shortWidth = (i > 0 && ['T', 'U', 'V'].includes(txt[i - 1])) ? true : false;
      if (textChar === ',' && containsNonAlphabetic) {
        textChar = '、';
        fontFamily = 'TW-MOE-Std-Kai';
      }

      // Determine character width based on font and character
      const fontWidth = font.replace('Transport', '') === 'Heavy' ? textWidthHeavy : textWidthMedium;
      const charWidthObj = containsNonAlphabetic && isKnownPunctuation ?
        textWidthHeavy.find(e => e.char === textChar) :
        fontWidth.find(e => e.char === textChar);
      const charWidth = charWidthObj ? (shortWidth ? (charWidthObj.shortWidth === 0 ? charWidthObj.width : charWidthObj.shortWidth) : charWidthObj.width) : (containsNonAlphabetic && !isKnownPunctuation ? 275 : 100);

      // Calculate position adjustments for horizontal positioning
      let charLeftPos = left_pos + (containsNonAlphabetic ? 0.25 * xHeight : 0);
      let charTopPos = (bracketOffset+(containsNonAlphabetic ? -0.2 : 0.1)) * xHeight;

      // Create the frame rectangle - we'll need these dimensions for centering
      const frameWidth = containsNonAlphabetic ?
        (isKnownPunctuation ? charWidth * xHeight / 100 + 0.25 * xHeight : 2.75 * xHeight - 2) :
        charWidth * xHeight / 100 - 2;
      const frameHeight = containsNonAlphabetic ? 2.85 * xHeight - 2 : xHeight * 2 - 2;

      // Get the appropriate font - use pre-parsed fonts instead of parsing each time
      let fontGlyphs;
      if (fontFamily === 'TransportMedium' && !containsNonAlphabetic) {
        fontGlyphs = parsedFontMedium;
      } else if (fontFamily === 'TransportHeavy' && !containsNonAlphabetic) {
        fontGlyphs = parsedFontHeavy;
      } else if (textChar === '、') {
        fontGlyphs = parsedFontKai;
      } else {
        fontGlyphs = parsedFontChinese ;
      }

      // Access font metrics
      const fontMetrics = {
        unitsPerEm: fontGlyphs.unitsPerEm,
        ascender: fontGlyphs.ascender,
        descender: fontGlyphs.descender,
      };

      // Scale metrics to desired font size
      const fontScale = fontSize / fontMetrics.unitsPerEm;
      const scaledAscender = fontMetrics.ascender * fontScale;
      const scaledDescender = Math.abs(fontMetrics.descender) * fontScale;
      const fontHeight = scaledAscender + scaledDescender;

      // Calculate the vertical position to center the glyph
      const verticalCenterOffset = (frameHeight - fontHeight) / 2;
      let font2CanvasRatio = 1 / fontHeight * frameHeight;

      // Create the path parameters for this character
      const pathParams = {
        character: textChar,
        x: 0,
        y: scaledAscender * font2CanvasRatio,
        fontSize: fontSize,
        fontFamily: fontFamily,
        fill: color
      };

      // Get the font path
      const charPath = getFontPath(pathParams);
      charPath.fill = color;
      const charSVG = charPath.toPathData({ flipY: false })
      const charGlyph = fontGlyphs.charToGlyph(textChar);

      const minTop = Math.min(...charPath.commands.map(cmd => cmd.y));

      // Create a path from the font path data
      const txt_char = new fabric.Path(charSVG, {
        left: (textChar == '、'? charGlyph.leftSideBearing-800:charGlyph.leftSideBearing) * fontScale + charLeftPos ,
        top: minTop + charTopPos,
        fill: color,
        originX: 'left',
        originY: 'top'
      });

      // Set properties and return the created path
      txt_char.lockScalingX = txt_char.lockScalingY = true;
      txt_char._textChar = textChar; // Store the character for reference

      txtCharList.push(txt_char);

      // Create the frame rectangle
      const txt_frame = new fabric.Rect({
        left: left_pos,
        top: 0,
        width: frameWidth,
        height: frameHeight,
        fill: 'rgba(0,0,0,0)',
        stroke: GeneralSettings.showTextBorders ? color : 'rgba(0,0,0,0)',
        strokeWidth: 2,
        strokeDashArray: [xHeight / 10, xHeight / 10],
      });

      txtFrameList.push(txt_frame);

      // Update position for next character
      left_pos += containsNonAlphabetic ?
        (isKnownPunctuation ? charWidth * xHeight / 100 + 0.25 * xHeight : 2.75 * xHeight) :
        charWidth * xHeight / 100;
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
