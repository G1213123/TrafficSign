/**
 * TextObject extends BaseGroup to create text with proper vertex handling
 */
class TextObject extends BaseGroup {
  constructor(options = {}) {
    // Create the fabric objects first
    const { txtCharList, txtFrameList } = TextObject.createTextElements(
      options.text || '',
      options.xHeight || 100,
      options.color || 'White',
      options.font || 'TransportMedium',
      options.isCursor
    );
    
    // Create a group containing the text characters and frames
    const group = new fabric.Group([...txtCharList, ...txtFrameList], {
      left: options.left || 0,
      top: options.top || 0
    });
    
    // Add special handling for text bounding box calculation
    group.getCombinedBoundingBoxOfRects = TextObject.getCombinedBoundingBoxOfRects;
    
    // Add vertex and text information to the group
    group.setCoords();
    group.vertex = group.getCombinedBoundingBoxOfRects();
    group.text = options.text;
    group.xHeight = options.xHeight;
    
    // If this is a cursor object, we don't want to create a full BaseGroup
    if (options.isCursor) {
      return group;
    }
    
    // Call the BaseGroup constructor with our prepared group
    super(group, 'Text', { calcVertex: false });
    
    // Store text properties
    this.text = options.text;
    this.xHeight = options.xHeight;
    this.font = options.font;
    this.color = options.color;
    
    // Add double-click event handler
    this.on('mousedblclick', this.onDoubleClick.bind(this));
  }
  
  /**
   * Handle double-click on the text object
  */
 onDoubleClick() {
    FormTextAddComponent.textPanelInit(this);
    
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
            button.click();
          }
        });
      }
      
      // Set the color toggle
      const colorToggle = document.getElementById('Message Colour-container');
      if (colorToggle) {
        const buttons = colorToggle.querySelectorAll('.toggle-button');
        buttons.forEach(button => {
          if (button.getAttribute('data-value') === this.color) {
            button.click();
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
    const textWidthMedium = FormTextAddComponent.textWidthMedium;
    const textWidthHeavy = FormTextAddComponent.textWidthHeavy;
    
    let txtCharList = [];
    let txtFrameList = [];
    let left_pos = 0;
    let txt_char, txt_frame;
    
    for (let i = 0; i < txt.length; i++) {
      // Check if the character is a Chinese character
      if (!textWidthMedium.map(item => item.char).includes(txt.charAt(i))) {
        const charWidth = 2.25 * xHeight / 100;
        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: 'Noto Sans Hong Kong',
          fontWeight: 400,
          left: left_pos + 0.25 * xHeight,
          top: 0.1 * xHeight,
          fill: color,
          fontSize: xHeight * 2.25,
        });
        txt_char.lockScalingX = txt_char.lockScalingY = true;
        
        txt_frame = new fabric.Rect({
          left: left_pos,
          top: 0,
          width: 2.75 * xHeight - 2,
          height: 2.75 * xHeight - 2,
          fill: 'rgba(0,0,0,0)',
          stroke: color,
          strokeWidth: 2,
          strokeDashArray: [xHeight / 10, xHeight / 10],
        });

        left_pos += 2.75 * xHeight;
      } else {
        const fontWidth = font.replace('Transport', '') === 'Heavy' ? textWidthHeavy : textWidthMedium;
        const charWidth = fontWidth.find(e => e.char === txt.charAt(i)).width;

        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: font,
          left: left_pos,
          top: 6,
          fill: color,
          fontSize: xHeight * 1.88,
        });
        txt_char.lockScalingX = txt_char.lockScalingY = true;

        txt_frame = new fabric.Rect({
          left: left_pos,
          top: 0,
          width: charWidth * xHeight / 100 - 2,
          height: xHeight * 2 - 2,
          fill: 'rgba(0,0,0,0)',
          stroke: color, 
          strokeWidth: 2,
          strokeDashArray: [xHeight / 10, xHeight / 10],
        });

        left_pos += charWidth * xHeight / 100;
      }
      txtCharList.push(txt_char);
      txtFrameList.push(txt_frame);
    }
    
    return { txtCharList, txtFrameList };
  }
  
  /**
   * Method to calculate combined bounding box from rectangle objects in a group
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
    const { txtCharList, txtFrameList } = TextObject.createTextElements(
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
    
    // Add special handling for text bounding box calculation
    group.getCombinedBoundingBoxOfRects = TextObject.getCombinedBoundingBoxOfRects;
    
    // Add vertex and text information to the group
    group.setCoords();
    group.vertex = group.getCombinedBoundingBoxOfRects();
    group.text = newText;
    group.xHeight = newXHeight;
    
    // Update this text object with the new group
    this.replaceBasePolygon(group, false);
    
    // Update properties
    this.text = newText;
    this.xHeight = newXHeight;
    this.font = newFont;
    this.color = newColor;
    
    // Update the name for the object inspector
    this._showName = `<Group ${this.canvasID}> Text - ${newText}`;
    
    this.canvas.renderAll();
  }
}

// Export the class for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TextObject;
}
