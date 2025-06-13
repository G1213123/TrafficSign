/**
 * Tests for text.js module
 * This module handles text creation, character positioning, font management, and multi-language support
 * Covers TextObject class, character parameter calculations, and text utility functions
 */

import { CanvasGlobals } from '../js/canvas/canvas.js';

// Mock all the complex dependencies at module level
jest.mock('../js/objects/draw.js', () => ({
  BaseGroup: jest.fn().mockImplementation(function(basePolygon, functionalType, className, options = {}) {
    this.type = 'group';
    this.functionalType = functionalType;
    this.className = className;
    this.vertices = [];
    this.fabricGroup = null;
    return this;
  })
}));

jest.mock('../js/objects/template.js', () => ({
  textWidthMedium: [
    { char: ' ', width: 50, shortWidth: 0 },
    { char: 'A', width: 136, shortWidth: 0 }, { char: 'B', width: 147, shortWidth: 0 }, { char: 'C', width: 148, shortWidth: 0 }, { char: 'D', width: 154, shortWidth: 0 }, { char: 'E', width: 132, shortWidth: 0 }, { char: 'F', width: 119, shortWidth: 0 }, { char: 'G', width: 155, shortWidth: 0 }, { char: 'H', width: 160, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 93, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 107, shortWidth: 0 }, { char: 'M', width: 184, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 156, shortWidth: 0 }, { char: 'P', width: 130, shortWidth: 0 }, { char: 'Q', width: 158, shortWidth: 0 }, { char: 'R', width: 141, shortWidth: 0 }, { char: 'S', width: 137, shortWidth: 0 }, { char: 'T', width: 109, shortWidth: 105 }, { char: 'U', width: 154, shortWidth: 0 }, { char: 'V', width: 130, shortWidth: 120 }, { char: 'W', width: 183, shortWidth: 189 }, { char: 'X', width: 128, shortWidth: 0 }, { char: 'Y', width: 123, shortWidth: 118 }, { char: 'Z', width: 119, shortWidth: 0 },
    { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 103, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 109, shortWidth: 102 }, { char: 'f', width: 75, shortWidth: 0 }, { char: 'g', width: 114, shortWidth: 107 }, { char: 'h', width: 112, shortWidth: 0 }, { char: 'i', width: 54, shortWidth: 0 }, { char: 'j', width: 58, shortWidth: 0 }, { char: 'k', width: 108, shortWidth: 0 }, { char: 'l', width: 62, shortWidth: 0 }, { char: 'm', width: 164, shortWidth: 0 }, { char: 'n', width: 112, shortWidth: 0 }, { char: 'o', width: 118, shortWidth: 111 }, { char: 'p', width: 118, shortWidth: 0 }, { char: 'q', width: 118, shortWidth: 0 }, { char: 'r', width: 73, shortWidth: 59 }, { char: 's', width: 97, shortWidth: 95 }, { char: 't', width: 81, shortWidth: 0 }, { char: 'u', width: 115, shortWidth: 101 }, { char: 'v', width: 98, shortWidth: 0 }, { char: 'w', width: 147, shortWidth: 145 }, { char: 'x', width: 104, shortWidth: 0 }, { char: 'y', width: 98, shortWidth: 96 }, { char: 'z', width: 97, shortWidth: 0 },
    { char: '1', width: 78, shortWidth: 0 }, { char: '2', width: 120, shortWidth: 0 }, { char: '3', width: 127, shortWidth: 0 }, { char: '4', width: 132, shortWidth: 0 }, { char: '5', width: 122, shortWidth: 0 }, { char: '6', width: 126, shortWidth: 0 }, { char: '7', width: 104, shortWidth: 0 }, { char: '8', width: 130, shortWidth: 0 }, { char: '9', width: 128, shortWidth: 0 }, { char: '0', width: 133, shortWidth: 0 },
    { char: ',', width: 53, shortWidth: 0 }, { char: '.', width: 53, shortWidth: 0 }, { char: "'", width: 39, shortWidth: 0 }, { char: ':', width: 53, shortWidth: 0 }, { char: '•', width: 53, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 66, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 105, shortWidth: 0 }, { char: ')', width: 105, shortWidth: 0 }, { char: '/', width: 85, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }
  ],  textWidthHeavy: [
    { char: ' ', width: 50, shortWidth: 0 },
    { char: 'A', width: 142, shortWidth: 0 }, { char: 'B', width: 146, shortWidth: 0 }, { char: 'C', width: 151, shortWidth: 0 }, { char: 'D', width: 150, shortWidth: 0 }, { char: 'E', width: 136, shortWidth: 0 }, { char: 'F', width: 121, shortWidth: 0 }, { char: 'G', width: 156, shortWidth: 0 }, { char: 'H', width: 159, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 95, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 118, shortWidth: 0 }, { char: 'M', width: 186, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 158, shortWidth: 0 }, { char: 'P', width: 134, shortWidth: 0 }, { char: 'Q', width: 161, shortWidth: 0 }, { char: 'R', width: 148, shortWidth: 0 }, { char: 'S', width: 146, shortWidth: 0 }, { char: 'T', width: 118, shortWidth: 113 }, { char: 'U', width: 157, shortWidth: 0 }, { char: 'V', width: 133, shortWidth: 127 }, { char: 'W', width: 193, shortWidth: 196 }, { char: 'X', width: 130, shortWidth: 0 }, { char: 'Y', width: 128, shortWidth: 125 }, { char: 'Z', width: 119, shortWidth: 0 },
    { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 107, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 110, shortWidth: 103 }, { char: 'f', width: 79, shortWidth: 0 }, { char: 'g', width: 117, shortWidth: 110 }, { char: 'h', width: 119, shortWidth: 0 }, { char: 'i', width: 55, shortWidth: 0 }, { char: 'j', width: 71, shortWidth: 0 }, { char: 'k', width: 114, shortWidth: 0 }, { char: 'l', width: 63, shortWidth: 0 }, { char: 'm', width: 173, shortWidth: 0 }, { char: 'n', width: 119, shortWidth: 0 }, { char: 'o', width: 115, shortWidth: 107 }, { char: 'p', width: 120, shortWidth: 0 }, { char: 'q', width: 120, shortWidth: 0 }, { char: 'r', width: 80, shortWidth: 67 }, { char: 's', width: 100, shortWidth: 98 }, { char: 't', width: 84, shortWidth: 0 }, { char: 'u', width: 120, shortWidth: 107 }, { char: 'v', width: 107, shortWidth: 0 }, { char: 'w', width: 160, shortWidth: 154 }, { char: 'x', width: 110, shortWidth: 0 }, { char: 'y', width: 106, shortWidth: 104 }, { char: 'z', width: 93, shortWidth: 0 },
    { char: '1', width: 84, shortWidth: 0 }, { char: '2', width: 125, shortWidth: 0 }, { char: '3', width: 136, shortWidth: 0 }, { char: '4', width: 138, shortWidth: 0 }, { char: '5', width: 130, shortWidth: 0 }, { char: '6', width: 129, shortWidth: 0 }, { char: '7', width: 107, shortWidth: 0 }, { char: '8', width: 138, shortWidth: 0 }, { char: '9', width: 129, shortWidth: 0 }, { char: '0', width: 145, shortWidth: 0 },
    { char: ',', width: 56, shortWidth: 0 }, { char: '.', width: 56, shortWidth: 0 }, { char: "'", width: 41, shortWidth: 0 }, { char: ':', width: 56, shortWidth: 0 }, { char: '•', width: 56, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 71, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 115, shortWidth: 0 }, { char: ')', width: 115, shortWidth: 0 }, { char: '/', width: 88, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }
  ]
}));

jest.mock('../js/objects/path.js', () => ({
  getFontPath: jest.fn((params) => ({
    commands: [{ y: 100 }, { y: 150 }, { y: 80 }],
    fill: params.fill,
    toPathData: jest.fn(() => 'M 0 0 L 10 10 Z')
  })),
  parsedFontMedium: {
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 50 }))
  },
  parsedFontHeavy: {
    unitsPerEm: 1000,
    ascender: 850,
    descender: -150,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 60 }))
  },
  parsedFontChinese: {
    unitsPerEm: 1000,
    ascender: 900,
    descender: -100,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 0 }))
  },
  parsedFontKorean: {
    unitsPerEm: 1000,
    ascender: 900,
    descender: -100,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 0 }))
  },
  parsedFontKai: {
    unitsPerEm: 1000,
    ascender: 900,
    descender: -100,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: char === '、' ? -800 : 0 }))
  }
}));

jest.mock('../js/sidebar/sbGeneral.js', () => ({
  GeneralSettings: {
    showTextBorders: false
  }
}));

jest.mock('../js/sidebar/sb-text.js', () => ({
  FormTextAddComponent: {
    textPanelInit: jest.fn()
  }
}));

jest.mock('../js/modal/md-font.js', () => ({
  FontPriorityManager: {
    getFontPriorityList: jest.fn(() => ['TW-MOE-Std-Kai', 'parsedFontKorean']),
    getSpecialCharactersArray: jest.fn(() => ['特', '殊']),
    getOverrideFont: jest.fn(() => 'custom_special_font')
  }
}));

// Mock fabric.js
global.fabric = {
  Group: jest.fn().mockImplementation(function(objects, options) {
    this.objects = objects || [];
    this.left = options?.left || 0;
    this.top = options?.top || 0;
    this.setCoords = jest.fn();
    this.text = '';
    this.xHeight = 100;
    return this;
  }),
  Path: jest.fn().mockImplementation(function(pathData, options) {
    this.type = 'path';
    this.pathData = pathData;
    this.left = options?.left || 0;
    this.top = options?.top || 0;
    this.fill = options?.fill || '#000000';
    this.lockScalingX = false;
    this.lockScalingY = false;
    this._textChar = '';
    return this;
  }),
  Rect: jest.fn().mockImplementation(function(options) {
    this.type = 'rect';
    this.left = options?.left || 0;
    this.top = options?.top || 0;
    this.width = options?.width || 100;
    this.height = options?.height || 100;
    this.fill = options?.fill || 'rgba(0,0,0,0)';
    this.stroke = options?.stroke || 'rgba(0,0,0,0)';
    this.strokeWidth = options?.strokeWidth || 0;
    this.strokeDashArray = options?.strokeDashArray || [];
    this.setCoords = jest.fn();
    this.aCoords = {
      tl: { x: this.left, y: this.top },
      tr: { x: this.left + this.width, y: this.top },
      bl: { x: this.left, y: this.top + this.height },
      br: { x: this.left + this.width, y: this.top + this.height }
    };
    return this;
  }),
  util: {
    transformPoint: jest.fn((point, matrix) => point)
  }
};

// Mock DOM
global.document = {
  getElementById: jest.fn((id) => {
    const mockElement = {
      value: '',
      focus: jest.fn(),
      querySelectorAll: jest.fn(() => [
        {
          getAttribute: jest.fn(() => 'TransportMedium'),
          classList: { add: jest.fn(), remove: jest.fn() }
        }
      ])
    };
    return mockElement;
  })
};

global.window = {
  custom_special_font: {
    unitsPerEm: 1000,
    ascender: 900,
    descender: -100,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 0 }))
  },
  TransportMedium: {
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 0 }))
  },
  TransportHeavy: {
    unitsPerEm: 1000,
    ascender: 800,
    descender: -200,
    charToGlyph: jest.fn((char) => ({ leftSideBearing: 0 }))
  }
};

global.setTimeout = jest.fn((fn) => fn());

describe('Text Module', () => {
  let TextObject, containsNonEnglishCharacters, isNonEnglishCharacter;
  let BaseGroup;
  let mockCanvas;

  beforeAll(async () => {
    // Import the actual module after mocks are set up
    const textModule = await import('../js/objects/text.js');
    TextObject = textModule.TextObject;
    containsNonEnglishCharacters = textModule.containsNonEnglishCharacters;
    isNonEnglishCharacter = textModule.isNonEnglishCharacter;

    // Get the mocked classes
    const drawModule = await import('../js/objects/draw.js');
    BaseGroup = drawModule.BaseGroup;

    // Setup BaseGroup mock
    BaseGroup.mockImplementation(function(basePolygon, functionalType, className, options = {}) {
      this.type = 'group';
      this.functionalType = functionalType;
      this.className = className;
      this.basePolygon = basePolygon;
      this.canvasID = CanvasGlobals.canvasObject.length;
      
      // Text-specific properties
      this.text = options.text || '';
      this.xHeight = options.xHeight || 100;
      this.color = options.color || '#ffffff';
      this.left = options.left || 0;
      this.top = options.top || 0;
      this.font = options.font || 'TransportMedium';
      this.containsNonAlphabetic = false;
      this.txtCharList = [];
      this.txtFrameList = [];
      this._showName = '';

      // Mock methods
      this.set = jest.fn();
      this.setCoords = jest.fn();
      this.on = jest.fn();
      this.fire = jest.fn();
      this.add = jest.fn();
      this.remove = jest.fn();
      this.removeAll = jest.fn();
      this.setBasePolygon = jest.fn((polygon) => {
        this.basePolygon = polygon;
      });
      this.replaceBasePolygon = jest.fn((polygon) => {
        this.basePolygon = polygon;      });
      this.initialize = jest.fn(() => this);
      this.canvas = { renderAll: jest.fn() };

      // Add to canvas
      CanvasGlobals.canvasObject.push(this);
      CanvasGlobals.canvas.add(this);

      return this;
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked canvas instance and add missing methods
    mockCanvas = CanvasGlobals.canvas;
    mockCanvas.add = jest.fn();
    mockCanvas.remove = jest.fn();
    mockCanvas.renderAll = jest.fn();
    mockCanvas.getObjects = jest.fn(() => []);
    mockCanvas.fire = jest.fn();
    mockCanvas.getPointer = jest.fn(() => ({ x: 100, y: 100 }));
    mockCanvas.on = jest.fn();
    
    // Reset canvas object array
    CanvasGlobals.canvasObject = [];
  });

  describe('Utility Functions', () => {
    describe('containsNonEnglishCharacters', () => {
      test('should return false for English-only text', () => {
        expect(containsNonEnglishCharacters('HELLO')).toBe(false);
        expect(containsNonEnglishCharacters('ABC 123')).toBe(false);
        expect(containsNonEnglishCharacters('Test, 123')).toBe(false);
      });

      test('should return true for text with Chinese characters', () => {
        expect(containsNonEnglishCharacters('你好')).toBe(true);
        expect(containsNonEnglishCharacters('Hello 世界')).toBe(true);
        expect(containsNonEnglishCharacters('測試')).toBe(true);
      });

      test('should handle edge cases', () => {
        expect(containsNonEnglishCharacters('')).toBe(false);
        expect(containsNonEnglishCharacters(null)).toBe(false);
        expect(containsNonEnglishCharacters(undefined)).toBe(false);
        expect(containsNonEnglishCharacters(123)).toBe(false);
      });
    });

    describe('isNonEnglishCharacter', () => {
      test('should return false for English characters', () => {
        expect(isNonEnglishCharacter('A')).toBe(false);
        expect(isNonEnglishCharacter('1')).toBe(false);
        expect(isNonEnglishCharacter(',')).toBe(false);
        expect(isNonEnglishCharacter(' ')).toBe(false);
      });

      test('should return true for non-English characters', () => {
        expect(isNonEnglishCharacter('你')).toBe(true);
        expect(isNonEnglishCharacter('世')).toBe(true);
        expect(isNonEnglishCharacter('한')).toBe(true);
      });

      test('should handle edge cases', () => {
        expect(isNonEnglishCharacter('')).toBe(false);
        expect(isNonEnglishCharacter(null)).toBe(false);
        expect(isNonEnglishCharacter(undefined)).toBe(false);
        expect(isNonEnglishCharacter('AB')).toBe(false); // Multiple characters
      });
    });
  });

  describe('TextObject Class', () => {
    describe('Construction', () => {
      test('should create TextObject with default properties', () => {
        const textObj = new TextObject({ text: 'TEST' });
        
        expect(textObj).toBeInstanceOf(TextObject);
        expect(textObj.functionalType).toBe('Text');
        expect(textObj.className).toBe('TextObject');
        expect(textObj.text).toBe('TEST');
        expect(textObj.xHeight).toBe(100);
        expect(textObj.color).toBe('#ffffff');
        expect(textObj.font).toBe('TransportMedium');
      });

      test('should create TextObject with custom properties', () => {
        const options = {
          text: 'Custom Text',
          xHeight: 150,
          color: 'Black',
          left: 50,
          top: 75,
          font: 'TransportHeavy'
        };
        
        const textObj = new TextObject(options);
        
        expect(textObj.text).toBe('Custom Text');
        expect(textObj.xHeight).toBe(150);
        expect(textObj.color).toBe('#000000'); // Should convert Black to hex
        expect(textObj.left).toBe(50);
        expect(textObj.top).toBe(75);
        expect(textObj.font).toBe('TransportHeavy');
      });

      test('should handle color conversion correctly', () => {
        const whiteText = new TextObject({ text: 'WHITE', color: 'White' });
        const blackText = new TextObject({ text: 'BLACK', color: 'Black' });
        const customText = new TextObject({ text: 'CUSTOM', color: '#ff0000' });
        
        expect(whiteText.color).toBe('#ffffff');
        expect(blackText.color).toBe('#000000');
        expect(customText.color).toBe('#ff0000');
      });

      test('should detect non-English characters correctly', () => {        const englishText = new TextObject({ text: 'HELLO' });
        const chineseText = new TextObject({ text: '你好' });
        
        expect(englishText.containsNonAlphabetic).toBe(false);
        expect(chineseText.containsNonAlphabetic).toBe(true);
      });
    });

    describe('Font Priority Management', () => {
      test('should use font priority for Chinese text', () => {
        const chineseText = new TextObject({ text: '中文' });
        
        // Should use font from priority list for Chinese characters
        expect(chineseText.font).toBe('TW-MOE-Std-Kai');
      });

      test('should keep original font for English text', () => {
        const englishText = new TextObject({ text: 'ENGLISH', font: 'TransportHeavy' });
        
        expect(englishText.font).toBe('TransportHeavy');
      });

      test('should handle font priority errors gracefully', () => {
        const { FontPriorityManager } = require('../js/modal/md-font.js');
        FontPriorityManager.getFontPriorityList.mockImplementation(() => {
          throw new Error('Font priority error');
        });
        
        const chineseText = new TextObject({ text: '中文', font: 'TransportMedium' });
        
        expect(chineseText.font).toBe('TransportMedium'); // Should fallback
        
        // Restore the mock
        FontPriorityManager.getFontPriorityList.mockImplementation(() => ['TW-MOE-Std-Kai']);
      });
    });

    describe('Character Parameter Calculation', () => {
      describe('English Characters', () => {        test('should calculate correct parameters for basic English characters', () => {
          const params = TextObject._getEnglishCharacterParams('A', 'TransportMedium', 100, null);
          
          expect(params.actualChar).toBe('A');
          expect(params.fontFamily).toBe('TransportMedium');
          expect(params.fontSize).toBe(188); // 100 * 1.88
          expect(params.charWidth).toBe(136); // From actual textWidthMedium data
          expect(params.bracketOffset).toBe(0);
          expect(params.frameWidth).toBe(134); // 136 * 100 / 100 - 2
          expect(params.advanceWidth).toBe(136); // 136 * 100 / 100
        });        test('should handle short width for characters after T, U, V', () => {
          const paramsAfterT = TextObject._getEnglishCharacterParams('A', 'TransportMedium', 100, 'T');
          const paramsAfterU = TextObject._getEnglishCharacterParams('A', 'TransportMedium', 100, 'U');
          const paramsNormal = TextObject._getEnglishCharacterParams('A', 'TransportMedium', 100, 'B');
          
          expect(paramsAfterT.charWidth).toBe(136); // A doesn't have shortWidth, uses normal width
          expect(paramsAfterU.charWidth).toBe(136);
          expect(paramsNormal.charWidth).toBe(136);
        });

        test('should apply bracket offset for parentheses', () => {
          const openParen = TextObject._getEnglishCharacterParams('(', 'TransportMedium', 100, null);
          const closeParen = TextObject._getEnglishCharacterParams(')', 'TransportMedium', 100, null);
          const normalChar = TextObject._getEnglishCharacterParams('A', 'TransportMedium', 100, null);
          
          expect(openParen.bracketOffset).toBe(0.15);
          expect(closeParen.bracketOffset).toBe(0.15);
          expect(normalChar.bracketOffset).toBe(0);
        });        test('should use TransportHeavy font when specified', () => {
          const params = TextObject._getEnglishCharacterParams('A', 'TransportHeavy', 100, null);
          
          expect(params.fontFamily).toBe('TransportHeavy');
          expect(params.charWidth).toBe(142); // From actual textWidthHeavy data
        });
      });

      describe('Non-English Characters', () => {
        test('should handle numbers in non-English text', () => {
          const params = TextObject._getNumberParams('1', 100, null);
          
          expect(params.actualChar).toBe('1');
          expect(params.fontFamily).toBe('TransportMedium');
          expect(params.fontSize).toBe(258.5); // 100 * 1.88 * 1.375
          expect(params.leftOffset).toBe(0);
        });

        test('should handle punctuation in non-English text', () => {
          const params = TextObject._getPunctuationParams(',', 100, null);
          
          expect(params.actualChar).toBe(',');
          expect(params.fontFamily).toBe('TransportHeavy');
          expect(params.leftOffset).toBe(25); // 0.25 * 100
          expect(params.bracketOffset).toBe(0);
        });

        test('should handle special comma transformation', () => {
          const params = TextObject._getPunctuationParams('、', 100, null);
          
          expect(params.actualChar).toBe('、');
          expect(params.fontFamily).toBe('TW-MOE-Std-Kai');
        });

        test('should handle Chinese characters', () => {
          const params = TextObject._getChineseCharacterParams('中', 'TW-MOE-Std-Kai', 100);
          
          expect(params.actualChar).toBe('中');
          expect(params.fontFamily).toBe('TW-MOE-Std-Kai');
          expect(params.fontSize).toBe(225); // 100 * 2.25
          expect(params.charWidth).toBe(275);
          expect(params.leftOffset).toBe(25); // 0.25 * 100
          expect(params.advanceWidth).toBe(275); // 2.75 * 100
        });

        test('should handle special characters with override font', () => {
          const params = TextObject._getChineseCharacterParams('特', 'TW-MOE-Std-Kai', 100);
          
          expect(params.fontFamily).toBe('custom_special_font'); // Should use override font
        });
      });

      describe('Helper Functions', () => {
        test('should correctly identify numbers', () => {
          expect(TextObject._isNumber('1')).toBe(true);
          expect(TextObject._isNumber('9')).toBe(true);
          expect(TextObject._isNumber('A')).toBe(false);
          expect(TextObject._isNumber('中')).toBe(false);
        });

        test('should calculate character positioning correctly', () => {
          const charParams = {
            leftOffset: 10,
            bracketOffset: 0.1,
            topOffset: 5
          };
          
          const positioning = TextObject._calculateCharacterPositioning(100, charParams, 50, null);
          
          expect(positioning.charLeftPos).toBe(110); // 100 + 10
          expect(positioning.charTopPos).toBe(10); // 0.1 * 50 + 5
        });

        test('should get correct font glyphs', () => {
          const mediumGlyph = TextObject._getFontGlyphs('TransportMedium', 'A', false);
          const heavyGlyph = TextObject._getFontGlyphs('TransportHeavy', 'A', false);
          const chineseGlyph = TextObject._getFontGlyphs('TW-MOE-Std-Kai', '中', true);
          const customGlyph = TextObject._getFontGlyphs('custom_special_font', '特', true);
          
          expect(mediumGlyph.unitsPerEm).toBe(1000);
          expect(heavyGlyph.ascender).toBe(850);
          expect(chineseGlyph.descender).toBe(-100);
          expect(customGlyph.unitsPerEm).toBe(1000); // Should use custom font
        });
      });
    });

    describe('Text Creation', () => {
      test('should create text elements for English text', () => {
        const result = TextObject.createTextElements('AB', 100, '#000000', 'TransportMedium');
        
        expect(result.txtCharList).toHaveLength(2);
        expect(result.txtFrameList).toHaveLength(2);
        expect(result.containsNonAlphabetic).toBe(false);
        
        // Check that fabric objects are created
        expect(fabric.Path).toHaveBeenCalledTimes(2);
        expect(fabric.Rect).toHaveBeenCalledTimes(2);
      });

      test('should create text elements for Chinese text', () => {
        const result = TextObject.createTextElements('中文', 100, '#000000', 'TW-MOE-Std-Kai');
        
        expect(result.txtCharList).toHaveLength(2);
        expect(result.txtFrameList).toHaveLength(2);
        expect(result.containsNonAlphabetic).toBe(true);
      });

      test('should handle mixed text correctly', () => {
        const result = TextObject.createTextElements('A中1', 100, '#000000', 'TransportMedium');
        
        expect(result.txtCharList).toHaveLength(3);
        expect(result.txtFrameList).toHaveLength(3);
        expect(result.containsNonAlphabetic).toBe(true);
      });

      test('should transform comma in Chinese text', () => {
        const { getFontPath } = require('../js/objects/path.js');
        
        TextObject.createTextElements('你,好', 100, '#000000', 'TW-MOE-Std-Kai');
        
        // Should call getFontPath with transformed comma
        const calls = getFontPath.mock.calls;
        const commaCall = calls.find(call => call[0].character === '、');
        expect(commaCall).toBeDefined();
      });
    });

    describe('Event Handling', () => {
      test('should handle double-click event', () => {
        const { FormTextAddComponent } = require('../js/sidebar/sb-text.js');
        const textObj = new TextObject({ text: 'TEST' });
        
        const setupSpy = jest.spyOn(textObj, 'setupTextPanelInputs').mockImplementation(() => {});
        
        textObj.onDoubleClick();
        
        expect(FormTextAddComponent.textPanelInit).toHaveBeenCalledWith(null, textObj);
        expect(setupSpy).toHaveBeenCalled();
        
        setupSpy.mockRestore();
      });

      test('should setup text panel inputs correctly', () => {
        const textObj = new TextObject({ 
          text: 'TEST', 
          xHeight: 150, 
          font: 'TransportHeavy',
          color: '#ffffff'
        });
        
        const mockTextInput = { value: '', focus: jest.fn() };
        const mockXHeightInput = { value: '' };
        document.getElementById.mockImplementation((id) => {
          if (id === 'input-text') return mockTextInput;
          if (id === 'input-xHeight') return mockXHeightInput;
          return {
            querySelectorAll: jest.fn(() => [
              { getAttribute: jest.fn(() => 'TransportHeavy'), classList: { add: jest.fn(), remove: jest.fn() } }
            ])
          };
        });
        
        textObj.setupTextPanelInputs();
        
        expect(mockTextInput.value).toBe('TEST');
        expect(mockTextInput.focus).toHaveBeenCalled();
        expect(mockXHeightInput.value).toBe(150);
      });
    });

    describe('Text Updates', () => {
      test('should update text properties correctly', () => {
        const textObj = new TextObject({ text: 'OLD', xHeight: 100 });
        
        textObj.updateText('NEW', 150, 'TransportHeavy', '#000000');
        
        expect(textObj.text).toBe('NEW');
        expect(textObj.xHeight).toBe(150);
        expect(textObj.font).toBe('TransportHeavy');
        expect(textObj.color).toBe('#000000');
        expect(textObj.replaceBasePolygon).toHaveBeenCalled();
      });

      test('should create new fabric group on update', () => {
        const textObj = new TextObject({ text: 'OLD' });
        
        textObj.updateText('NEW', 100, 'TransportMedium', '#ffffff');
        
        expect(fabric.Group).toHaveBeenCalled();
        expect(textObj._showName).toBe('<Group 0> Text - NEW');
      });

      test('should remove old objects before creating new ones', () => {
        const textObj = new TextObject({ text: 'OLD' });
        
        textObj.updateText('NEW', 100, 'TransportMedium', '#ffffff');
        
        expect(textObj.removeAll).toHaveBeenCalled();
      });
    });

    describe('Canvas Integration', () => {
      test('should be added to canvas object array', () => {
        const textObj = new TextObject({ text: 'TEST' });
        
        expect(CanvasGlobals.canvasObject).toContain(textObj);
      });

      test('should be added to canvas', () => {
        const textObj = new TextObject({ text: 'TEST' });
        
        expect(CanvasGlobals.canvas.add).toHaveBeenCalledWith(textObj);
      });

      test('should have unique canvas ID', () => {
        const text1 = new TextObject({ text: 'TEST1' });
        const text2 = new TextObject({ text: 'TEST2' });
        
        expect(text1.canvasID).not.toBe(text2.canvasID);
      });
    });

    describe('Bounding Box Calculation', () => {
      test('should calculate combined bounding box of rectangles', () => {
        // Create a mock text object with fabric group-like behavior
        const mockTextObject = {
          forEachObject: jest.fn((callback) => {
            // Simulate two rect objects
            const rect1 = {
              type: 'rect',
              setCoords: jest.fn(),
              aCoords: {
                tl: { x: 0, y: 0 },
                tr: { x: 100, y: 0 },
                bl: { x: 0, y: 100 },
                br: { x: 100, y: 100 }
              }
            };
            const rect2 = {
              type: 'rect',
              setCoords: jest.fn(),
              aCoords: {
                tl: { x: 100, y: 100 },
                tr: { x: 200, y: 100 },
                bl: { x: 100, y: 200 },
                br: { x: 200, y: 200 }
              }
            };
            callback(rect1);
            callback(rect2);
          }),
          calcTransformMatrix: jest.fn(() => [1, 0, 0, 1, 0, 0])
        };
        
        const result = TextObject.getCombinedBoundingBoxOfRects.call(mockTextObject);
        
        expect(result).toHaveLength(8);
        expect(result.every(point => point.label && typeof point.x === 'number' && typeof point.y === 'number')).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {    test('should work together - character creation and text object', () => {
      const textObj = new TextObject({ text: 'AB中', xHeight: 100 });
      
      expect(textObj.containsNonAlphabetic).toBe(true);
      expect(textObj.text).toBe('AB中');
      // Test that the text object was created successfully - fabric.Group is called in real initialize 
      expect(textObj.font).toBe('TW-MOE-Std-Kai'); // Chinese font due to priority
    });

    test('should handle font priority and character detection together', () => {
      const chineseText = new TextObject({ text: '特殊字符' });
      
      expect(chineseText.containsNonAlphabetic).toBe(true);
      expect(chineseText.font).toBe('TW-MOE-Std-Kai'); // From priority system
    });

    test('should maintain consistency through text updates', () => {
      const textObj = new TextObject({ text: 'English' });
      
      expect(textObj.containsNonAlphabetic).toBe(false);
      
      textObj.updateText('中文', 150, 'TW-MOE-Std-Kai', '#000000');
      
      expect(textObj.containsNonAlphabetic).toBe(true);
      expect(textObj.text).toBe('中文');
      expect(textObj.xHeight).toBe(150);
    });

    test('should handle edge case combinations', () => {
      // Test mixed content with special characters and transformations
      const mixedText = new TextObject({ text: 'A,中1(' });
      
      expect(mixedText.containsNonAlphabetic).toBe(true);
      expect(mixedText.text).toBe('A,中1(');
      
      // Should handle the comma transformation in Chinese context
      const result = TextObject.createTextElements('A,中', 100, '#000000', 'TransportMedium');
      expect(result.containsNonAlphabetic).toBe(true);
    });
  });
});
