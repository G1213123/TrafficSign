import { TextObject } from '../objects/text.js';
import { SymbolObject } from '../objects/symbols.js';
import { anchorShape, globalAnchorTree } from '../objects/anchor.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { DividerObject } from '../objects/divider.js';
import { BorderUtilities, BorderGroup } from '../objects/border.js';
import { MainRoadSymbol, SideRoadSymbol } from '../objects/route.js';
import { FormTemplateComponent } from '../sidebar/sb-template.js';

const canvasObject = CanvasGlobals.canvasObject; // Assuming canvasObject is defined in canvas.js
const canvas = CanvasGlobals.canvas; // Assuming canvas is defined in canvas.js


// MIT http://rem.mit-license.org
// https://stackoverflow.com/questions/33777577/javascript-get-actual-rendered-font-height
function textXHeight() {
  // Create a blank canvas (by not filling a background color).
  var canvasElement = document.getElementById('canvas2');
  var canvas = new fabric.Canvas(canvasElement);
  var ctx = canvas.getContext('2d');

  // Fill it with some coloured text.. (black is default)
  ctx.font = "188px TransportMedium";
  ctx.textBaseline = "hanging";
  ctx.fillText("x", 0, 0);

  // Remove the surrounding transparent pixels
  // result is an actual canvas element
  var result = trim(canvas);

  // you could query it's width, draw it, etc..
  //document.body.appendChild(result);

  // get the height of the trimmed area
  console.log(result.height);

  // Trim Canvas Pixels Method
  // https://gist.github.com/remy/784508
  function trim(c) {

    var ctx = c.getContext('2d'),

      // create a temporary canvas in which we will draw back the trimmed text
      copy = document.createElement('canvas').getContext('2d'),

      // Use the Canvas Image Data API, in order to get all the
      // underlying pixels data of that canvas. This will basically
      // return an array (Uint8ClampedArray) containing the data in the
      // RGBA order. Every 4 items represent one pixel.
      pixels = ctx.getImageData(0, 0, c.width, c.height),

      // total pixels
      l = pixels.data.length,

      // main loop counter and pixels coordinates
      i, x, y,

      // an object that will store the area that isn't transparent
      bound = { top: null, left: null, right: null, bottom: null };

    // for every pixel in there
    for (i = 0; i < l; i += 4) {

      // if the alpha value isn't ZERO (transparent pixel)
      if (pixels.data[i + 3] !== 0) {

        // find it's coordinates
        x = (i / 4) % c.width;
        y = ~~((i / 4) / c.width);

        // store/update those coordinates
        // inside our bounding box Object

        if (bound.top === null) {
          bound.top = y;
        }

        if (bound.left === null) {
          bound.left = x;
        } else if (x < bound.left) {
          bound.left = x;
        }

        if (bound.right === null) {
          bound.right = x;
        } else if (bound.right < x) {
          bound.right = x;
        }

        if (bound.bottom === null) {
          bound.bottom = y;
        } else if (bound.bottom < y) {
          bound.bottom = y;
        }
      }
    }

    // actual height and width of the text
    // (the zone that is actually filled with pixels)
    var trimHeight = bound.bottom - bound.top,
      trimWidth = bound.right - bound.left,

      // get the zone (trimWidth x trimHeight) as an ImageData
      // (Uint8ClampedArray of pixels) from our canvas
      trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    // Draw back the ImageData into the canvas
    copy.canvas.width = trimWidth;
    copy.canvas.height = trimHeight;
    copy.putImageData(trimmed, 0, 0);

    // return the canvas element
    return copy.canvas;
  }
}

/**
 * TestTracker: Utility to track objects created during tests
 */
const TestTracker = {
  testSections: {},
  currentTest: "",
  currentLine: 0,
  failedTests: [],
  passedTests: [],

  /**
   * Mark the start of a test section
   * @param {string} name - The name of the test section
   */
  startTest(name) {
    this.currentTest = name;
    this.testSections[name] = {
      startIndex: canvasObject.length,
      objects: {},
      endIndex: null
    };
    console.log(`▶ Starting test: ${name}`);
  },

  /**
   * Get the current line number using stack trace
   * @return {number} The line number
   */
  getLineNumber() {
    const stack = new Error().stack;
    const caller = stack.split("\n")[3]; // Get the caller (3 levels up)
    const match = caller.match(/:(\d+):\d+\)?$/);
    return match ? parseInt(match[1], 10) : 0;
  },

  /**
   * Track the current line being tested
   * @return {number} The current line number
   */
  trackLine() {
    this.currentLine = this.getLineNumber();
    return this.currentLine;
  },

  /**
   * Record a test failure with line information and make it clickable in console
   * @param {string} message - The failure message
   * @param {string} expected - Expected value
   * @param {string} actual - Actual value
   * @param {number} line - Line number where the failure occurred
   */
  recordFailure(message, expected, actual, line = this.currentLine) {
    // Store the failure information
    this.failedTests.push({
      test: this.currentTest,
      message,
      expected,
      actual,
      line
    });

    // Create an error object to get a proper stack trace
    const error = new Error('');

    // Instead of trying to style the Error object directly, use console.error with styling
    console.error(
      "%c ✗ FAILED: %c%s",
      'background: #f44336; color: white; font-weight: bold; padding: 2px 5px;',
      'color: #f44336; font-weight: bold;',
      ` ${this.currentTest} - ${message}\nExpected: ${expected}, Actual: ${actual}`
    );

    // Optional: directly log the error object which creates a clickable stack trace
    console.error(error);
  },

  /**
   * Register a passed test
   * @param {string} testName - Name of the test that passed
   */
  recordSuccess(testName = this.currentTest) {
    if (!this.passedTests.includes(testName)) {
      this.passedTests.push(testName);
    }
  },

  /**
   * Assert that values are equal or almost equal within tolerance
   * @param {any} actual - The actual value
   * @param {any} expected - The expected value
   * @param {string} message - Message to display on failure
   * @param {number} tolerance - Tolerance for numeric comparison
   * @return {boolean} Whether the assertion passed
   */
  assert(actual, expected, message = "", tolerance = 0) {
    this.trackLine();

    // For numeric values, use tolerance
    if (typeof actual === 'number' && typeof expected === 'number') {
      if (Math.abs(actual - expected) > tolerance) {
        this.recordFailure(message || "Assertion failed", expected, actual);
        return false;
      }
    }
    // For non-numeric values, use strict equality
    else if (actual !== expected) {
      this.recordFailure(message || "Assertion failed", expected, actual);
      return false;
    }

    return true;
  },

  /**
   * Assert that condition is true
   * @param {boolean} condition - The condition to check
   * @param {string} message - Message to display on failure
   * @return {boolean} Whether the assertion passed
   */
  assertTrue(condition, message = "") {
    this.trackLine();
    if (!condition) {
      this.recordFailure(message || "Condition is false", true, false);
      return false;
    }
    return true;
  },

  /**
   * Assert that spacing between objects is correct
   * @param {Object} object1 - First object
   * @param {Object} object2 - Second object
   * @param {string} axis - 'x' or 'y' axis
   * @param {number} spacing - Expected spacing
   * @param {string} message - Message to display on failure
   * @param {number} tolerance - Tolerance for comparison
   * @return {boolean} Whether the assertion passed
   */
  assertSpacing(object1, object2, axis, spacing, message = "", tolerance = 1) {
    this.trackLine();

    let actual = 0;
    if (axis === 'x') {
      // For X-axis, measure from right edge of first object to left edge of second
      const rightOfObj1 = object1.left + object1.width;
      actual = object2.left - rightOfObj1;
    } else {
      // For Y-axis, measure from bottom of first object to top of second
      const bottomOfObj1 = object1.top + object1.height;
      actual = object2.top - bottomOfObj1;
    }

    if (Math.abs(actual - spacing) > tolerance) {
      this.recordFailure(message || `${axis}-spacing incorrect`, spacing, actual);
      return false;
    }
    return true;
  },

  /**
   * Assert that two vertices are touching
   * @param {Object} vertex1 - First vertex {x, y}
   * @param {Object} vertex2 - Second vertex {x, y}
   * @param {string} message - Message to display on failure
   * @param {number} tolerance - Max allowed distance
   * @return {boolean} Whether the assertion passed
   */
  assertVertexTouching(vertex1, vertex2, message = "", tolerance = 1) {
    this.trackLine();

    const distance = Math.sqrt(
      Math.pow(vertex1.x - vertex2.x, 2) +
      Math.pow(vertex1.y - vertex2.y, 2)
    );

    if (distance > tolerance) {
      this.recordFailure(message || "Vertices not touching",
        `distance < ${tolerance}`,
        `distance = ${distance.toFixed(2)}`);
      return false;
    }
    return true;
  },

  /**
   * Register an object with a friendly name (silent)
   * @param {string} name - Friendly name to reference the object 
   * @param {number|Object} objectOrIndex - Object or index to register
   * @return {Object} The registered object
   */
  register(name, objectOrIndex = null) {
    if (!this.currentTest) return null;

    const section = this.testSections[this.currentTest];
    let object, index;

    if (objectOrIndex === null) {
      index = canvasObject.length - 1;
      object = canvasObject[index];
    } else if (typeof objectOrIndex === 'number') {
      index = objectOrIndex;
      object = canvasObject[index];
    } else {
      object = objectOrIndex;
      index = canvasObject.indexOf(object);
    }

    if (!object) return null;

    section.objects[name] = index;
    return object;
  },

  /**
   * Get an object by its friendly name from the current or specified test
   * @param {string} name - The friendly name of the object
   * @param {string} testName - Optional test name (defaults to current test)
   * @return {Object} The canvas object
   */
  get(name, testName = null) {
    const section = this.testSections[testName || this.currentTest];
    if (!section) {
      console.error(`Test section "${testName || this.currentTest}" not found`);
      return null;
    }

    const index = section.objects[name];
    if (index === undefined) {
      console.error(`Object "${name}" not found in test "${testName || this.currentTest}"`);
      return null;
    }

    return canvasObject[index];
  },

  /**
   * Get an object by its relative index from test start
   * @param {number} relativeIndex - Index relative to test start (0 for first)
   * @param {string} testName - Optional test name (defaults to current test)
   * @return {Object} The canvas object
   */
  getByIndex(relativeIndex, testName = null) {
    const section = this.testSections[testName || this.currentTest];
    if (!section) {
      console.error(`Test section "${testName || this.currentTest}" not found`);
      return null;
    }

    const index = section.startIndex + relativeIndex;
    if (index >= canvasObject.length) {
      console.error(`Invalid relative index ${relativeIndex} in "${testName || this.currentTest}"`);
      return null;
    }

    return canvasObject[index];
  },

  /**
   * End the current test and log status
   * @param {boolean} passed - Whether the test passed
   */
  endTest(passed = true) {
    if (!this.currentTest) return;

    const section = this.testSections[this.currentTest];
    section.endIndex = canvasObject.length - 1;

    if (passed) {
      this.recordSuccess();
      console.log(`%c ✓ ${this.currentTest} test passed!`, 'color: #4CAF50; font-weight: bold;');
    } else {
      //console.log(`%c ✗ ${this.currentTest} test failed!`, 'color: #f44336; font-weight: bold;');
    }

    this.currentTest = "";
  },

  /**
   * List all registered objects and their indices
   */
  listAll() {
    console.log("All registered test objects:");
    Object.entries(this.testSections).forEach(([testName, section]) => {
      console.log(`[${testName}] Objects: ${Object.entries(section.objects).map(([name, index]) =>
        `${name}=${index}`).join(', ')}`);
    });
  },

  /**
   * Print a summary of test results with clickable links
   */
  printSummary() {
    console.log("\n===== TEST SUMMARY =====");

    if (this.failedTests.length === 0) {
      console.log(`%c ✅ All ${this.passedTests.length} tests passed! `,
        'background: #4CAF50; color: white; font-weight: bold; padding: 2px 5px;');
    } else {
      console.log(`%c ❌ ${this.failedTests.length} of ${this.passedTests.length + this.failedTests.length} tests failed `,
        'background: #f44336; color: white; font-weight: bold; padding: 2px 5px;');

      // Group failures by test
      const failuresByTest = {};
      this.failedTests.forEach(failure => {
        if (!failuresByTest[failure.test]) {
          failuresByTest[failure.test] = [];
        }
        failuresByTest[failure.test].push(failure);
      });

      // Print failures grouped by test with clickable links
      Object.entries(failuresByTest).forEach(([testName, failures]) => {
        console.log(`- Test: ${testName} (${failures.length} failures)`);
        failures.forEach(failure => {
          // Create a synthetic error to get a clickable stack trace
          const error = new Error(`${failure.message} (Expected: ${failure.expected}, Actual: ${failure.actual})`);
          // This will create a clickable stack trace in most browser DevTools
          console.log(`  • %c${failure.message}`, 'color: #f44336;');
        });
      });
    }

    console.log("\nTests run:");
    [...new Set([...this.passedTests, ...this.failedTests.map(f => f.test)])].forEach(test => {
      const passed = !this.failedTests.some(f => f.test === test);
      console.log(`${passed ? '✓' : '✗'} ${test}`);
    });
  }
};

/**
 * Test suite for basic shape creation and positioning
 */
const ShapeTest = {
  /**
   * Create and test basic shapes (text and symbols)
   */
  testShapeCreation() {
    TestTracker.startTest("ShapeCreation");

    // Create text object - Hong Kong in English - Use direct TextObject creation instead
    const englishText = new TextObject({
      text: 'Hong Kong',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: -1050,
      top: -1000
    });
    TestTracker.register("englishText", englishText);

    // Create Chinese text - Use direct TextObject creation
    const chineseText = new TextObject({
      text: '香港',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: -1050,
      top: -800
    });
    TestTracker.register("chineseText", chineseText);

    // Create symbol (unchanged)
    new SymbolObject({
      symbolType: 'StackArrow',
      left: -1500,
      top: -900,
      xHeight: 100,
      angle: -45,
      color: 'white'
    });
    TestTracker.register("symbol");

    // Test assertions
    let passed = true;

    // Check English text using tracker
    const englishTextV1 = englishText.getBasePolygonVertex('E1');
    passed = passed && englishText.functionalType === 'Text' && TestTracker.trackLine();

    // Update the position checks to use the base group position instead of vertex position
    passed = passed && TestTracker.assert(englishText.left, -1050, "English text left position incorrect", 20);
    passed = passed && TestTracker.assert(englishText.top, -1000, "English text top position incorrect", 20);

    // Check Chinese text using tracker
    const chineseTextV1 = chineseText.getBasePolygonVertex('E1');
    passed = passed && chineseText.functionalType === 'Text';

    // Update the position checks for Chinese text
    passed = passed && TestTracker.assert(chineseText.left, -1050, "Chinese text left position incorrect", 20);
    passed = passed && TestTracker.assert(chineseText.top, -800, "Chinese text top position incorrect", 20);

    // Check symbol using tracker (unchanged)
    const symbol = TestTracker.get("symbol");
    const symbolV1 = symbol.getBasePolygonVertex('V1');
    passed = passed && symbol.functionalType === 'Symbol';
    passed = passed && TestTracker.assert(symbolV1.x, -1500, "Symbol left position incorrect", 5);
    passed = passed && TestTracker.assert(symbolV1.y, -900, "Symbol top position incorrect", 5);

    // Check that text objects are instances of TextObject class
    passed = passed && TestTracker.assertTrue(
      englishText instanceof TextObject,
      "English text should be an instance of TextObject"
    );
    passed = passed && TestTracker.assertTrue(
      chineseText instanceof TextObject,
      "Chinese text should be an instance of TextObject"
    );

    // Test text update functionality
    const originalText = englishText.text;
    englishText.updateText("Updated Text", englishText.xHeight, englishText.font, englishText.color);
    passed = passed && TestTracker.assert(englishText.text, "Updated Text", "Text update failed");

    // Restore original text for other tests
    englishText.updateText(originalText, englishText.xHeight, englishText.font, englishText.color);

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all shape tests
   */
  runAll: function () {
    this.testShapeCreation();
  }
};

/**
 * Test suite for object anchoring functionality
 */
const AnchorTest = {
  /**
   * Create and test anchored objects
   */
  testAnchoringObjects() {
    TestTracker.startTest("AnchorTest");

    // Create three symbols to anchor together using direct object creation instead of FormText methods
    // First symbol (base)
    new SymbolObject({
      symbolType: 'Tunnel',
      left: 300,
      top: -1000,
      xHeight: 100,
      color: 'white'
    });
    TestTracker.register("baseTunnel");

    // Second symbol (to right)
    new SymbolObject({
      symbolType: 'Airport',
      left: 400,
      top: -400,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("Airport");

    // Third symbol (below)
    new SymbolObject({
      symbolType: 'Hospital',
      left: 300,
      top: -300,
      xHeight: 100,
      color: 'white'
    });
    TestTracker.register("bottomHospital");

    // Anchor second object to first with 50px horizontal spacing
    anchorShape(TestTracker.get("baseTunnel"), TestTracker.get("Airport"), {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: 50,
      spacingY: 0
    });

    // Anchor third object below first with 30px vertical spacing
    anchorShape(TestTracker.get("baseTunnel"), TestTracker.get("bottomHospital"), {
      vertexIndex1: 'E2',
      vertexIndex2: 'E6',
      spacingX: 0,
      spacingY: 50
    });

    // Test assertions
    let passed = true;

    // Check that objects are anchored correctly
    passed = passed && TestTracker.assertSpacing(
      TestTracker.get("baseTunnel"), TestTracker.get("Airport"),
      'x', 50,
      "Horizontal anchor spacing incorrect"
    );

    passed = passed && TestTracker.assertSpacing(
      TestTracker.get("baseTunnel"), TestTracker.get("bottomHospital"),
      'y', 50,
      "Vertical anchor spacing incorrect"
    );

    // Now move the base object and verify that anchored objects move accordingly
    TestTracker.get("baseTunnel").set({ left: TestTracker.get("baseTunnel").left + 100 });
    TestTracker.get("baseTunnel").setCoords();
    TestTracker.get("baseTunnel").updateAllCoord();

    // Check that anchored objects moved with base
    passed = passed && TestTracker.assert(
      TestTracker.get("Airport").left,
      TestTracker.get("baseTunnel").left + TestTracker.get("baseTunnel").width + 50,
      "Horizontal anchor movement failed",
      5
    );

    passed = passed && TestTracker.assert(
      TestTracker.get("bottomHospital").left,
      TestTracker.get("baseTunnel").left + TestTracker.get("baseTunnel").width / 2 - TestTracker.get("bottomHospital").width / 2,
      "Vertical anchor movement failed - horizontal position",
      5
    );

    // Check that the vertical position of the second object didn't change
    passed = passed && TestTracker.assert(
      TestTracker.get("bottomHospital").top,
      TestTracker.get("baseTunnel").top + TestTracker.get("baseTunnel").height + 50,
      "Vertical anchor movement failed - vertical position should not change",
      5
    );

    window.testAnchors = canvasObject.slice();

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Create and test delinking of anchored objects
   */
  testDelinkingAnchoredObjects() {
    TestTracker.startTest("DelinkingAnchoredObjects");

    // Create four symbols to anchor together
    // First pair
    new SymbolObject({
      symbolType: 'Tunnel',
      left: 1500,
      top: -1000,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("baseTunnel1");

    new SymbolObject({
      symbolType: 'WHC',
      left: 1500,
      top: -1000,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("airport1");

    // Second pair
    new SymbolObject({
      symbolType: 'Hospital',
      left: 1575,
      top: -550,
      xHeight: 100,
      color: 'white'
    });
    TestTracker.register("baseHospital");

    new SymbolObject({
      symbolType: 'CHT',
      left: 1575,
      top: -550,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("stackArrow");

    // Anchor first pair
    anchorShape(TestTracker.get("baseTunnel1"), TestTracker.get("airport1"), {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: 50,
      spacingY: 0
    });

    // Anchor second pair
    anchorShape(TestTracker.get("baseHospital"), TestTracker.get("stackArrow"), {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: 50,
      spacingY: 0
    });

    // Test assertions
    let passed = true;

    // Check that objects are anchored correctly
    passed = passed && TestTracker.assertSpacing(
      TestTracker.get("baseTunnel1"), TestTracker.get("airport1"),
      'x', 50,
      "Horizontal anchor spacing incorrect for first pair"
    );

    passed = passed && TestTracker.assertSpacing(
      TestTracker.get("baseHospital"), TestTracker.get("stackArrow"),
      'x', 50,
      "Horizontal anchor spacing incorrect for second pair"
    );

    // Delink first pair by calling onClick of LockIcon
    canvas.setActiveObject(TestTracker.get("airport1"));
    const lockIcon1 = TestTracker.get("airport1").anchorageLink[0]
    lockIcon1.onClick();

    // Check that first pair is delinked
    passed = passed && TestTracker.assertTrue(
      !TestTracker.get("airport1").lockXToPolygon.TargetObject,
      "First pair should be delinked"
    );

    // Delink second pair by deleting the base object
    TestTracker.get("baseHospital").deleteObject();
    TestTracker.testSections[TestTracker.currentTest].objects["stackArrow"] -= 1;

    // Check that second pair is delinked
    passed = passed && TestTracker.assertTrue(
      !TestTracker.get("stackArrow").lockXToPolygon.TargetObject,
      "Second pair should be delinked"
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Test the anchor pivoting functionality
   */
  testAnchorPivoting() {
    TestTracker.startTest("AnchorPivoting");

    // Create two text objects
    const topText1 = new TextObject({
      text: 'Line 1',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: 2750,
      top: -1000
    });
    TestTracker.register("pivotTopText", topText1);

    // Create two text objects
    const topText2 = new TextObject({
      text: 'Line 2',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: 2750,
      top: -1000
    });
    TestTracker.register("pivotTopText", topText2);

    const bottomText1 = new TextObject({
      text: 'Line 3',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: 2750,
      top: -800 // Position it roughly below
    });
    TestTracker.register("pivotBottomText", bottomText1);

    const bottomText2 = new TextObject({
      text: 'Line 4',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: 2750,
      top: -800 // Position it roughly below
    });
    TestTracker.register("pivotBottomText", bottomText2);

    // Anchor bottomText below topText
    const initialSpacingY = 50;
    anchorShape(topText1, topText2, {
      vertexIndex1: 'E2', // Bottom center of topText
      vertexIndex2: 'E6', // Top center of bottomText
      spacingX: '', // No X anchor
      spacingY: initialSpacingY
    });
    anchorShape(topText2, bottomText1, {
      vertexIndex1: 'E2', // Bottom center of topText
      vertexIndex2: 'E6', // Top center of bottomText
      spacingX: '', // No X anchor
      spacingY: initialSpacingY
    });
    anchorShape(bottomText1, bottomText2, {
      vertexIndex1: 'E2', // Bottom center of topText
      vertexIndex2: 'E6', // Top center of bottomText
      spacingX: '', // No X anchor
      spacingY: initialSpacingY
    });

    let passed = true;

    // Verify initial anchor state
    passed = passed && TestTracker.assertTrue(
      bottomText1.lockYToPolygon && bottomText1.lockYToPolygon.TargetObject === topText2,
      "Initial state: bottomText should be locked to topText in Y"
    );
    passed = passed && TestTracker.assert(
      bottomText1.lockYToPolygon.spacing,
      initialSpacingY,
      "Initial state: bottomText Y spacing incorrect"
    );
    passed = passed && TestTracker.assertTrue(
      bottomText1.lockMovementY,
      "Initial state: bottomText should have lockMovementY=true"
    );
    passed = passed && TestTracker.assertTrue(
      !topText1.lockYToPolygon || !topText1.lockYToPolygon.TargetObject,
      "Initial state: topText should not be locked in Y"
    );

    // --- Perform the Pivot ---
    // Simulate the pivot action on the bottomText
    globalAnchorTree.reverseAnchorChain('y', bottomText1.canvasID);

    // --- Verify the reversed anchor state ---
    passed = passed && TestTracker.assertTrue(
      !bottomText1.lockYToPolygon || !bottomText1.lockYToPolygon.TargetObject,
      "Pivoted state: bottomText should NOT be locked to topText in Y"
    );
    passed = passed && TestTracker.assertTrue(
      !bottomText1.lockMovementY, // Assuming no other locks
      "Pivoted state: bottomText should have lockMovementY=false"
    );

    passed = passed && TestTracker.assertTrue(
      topText2.lockYToPolygon && topText2.lockYToPolygon.TargetObject === bottomText1,
      "Pivoted state: topText should NOW be locked to bottomText in Y"
    );
    passed = passed && TestTracker.assert(
      topText2.lockYToPolygon.spacing,
      -initialSpacingY,
      "Pivoted state: topText Y spacing should be negative of original"
    );
    passed = passed && TestTracker.assertTrue(
      topText2.lockMovementY,
      "Pivoted state: topText should have lockMovementY=true"
    );

    passed = passed && TestTracker.assertTrue(
      topText1.lockYToPolygon && topText1.lockYToPolygon.TargetObject === topText2,
      "Pivoted state: topText should NOW be locked to bottomText in Y"
    );
    passed = passed && TestTracker.assert(
      topText1.lockYToPolygon.spacing,
      -initialSpacingY,
      "Pivoted state: topText Y spacing should be negative of original"
    );
    passed = passed && TestTracker.assertTrue(
      topText1.lockMovementY,
      "Pivoted state: topText should have lockMovementY=true"
    );

    // Optional: Check relative position remains correct (within tolerance)
    const topBottomEdge = topText2.top + topText2.height;
    const bottomTopEdge = bottomText1.top;
    passed = passed && TestTracker.assert(
      bottomTopEdge - topBottomEdge,
      initialSpacingY, // The visual spacing should remain the same
      "Pivoted state: Visual spacing between objects changed",
      2 // Allow small tolerance
    );


    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all anchor tests
   */
  runAll: function () {
    this.testAnchoringObjects();
    this.testDelinkingAnchoredObjects();
    this.testAnchorPivoting(); // Add the new test here
  }
};

/**
 * Test suite for border creation and functionality
 */
const BorderTest = {
  /**
   * Create and test border around objects
   */
  testBorderCreation() {
    TestTracker.startTest("BorderCreation");

    // Create text objects directly using TextObject constructor instead of FormTextAddComponent
    const borderText1 = new TextObject({
      text: 'Border',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: -1800,
      top: 300
    });
    TestTracker.register("borderText1", borderText1);

    const borderText2 = new TextObject({
      text: 'Test',
      xHeight: 100,
      font: 'TransportMedium',
      color: 'White',
      left: -1800,
      top: 500
    });
    TestTracker.register("borderText2", borderText2);

    // Capture object dimensions before border creation
    const object1 = TestTracker.get("borderText1");
    const object2 = TestTracker.get("borderText2");

    const minX = Math.min(object1.left, object2.left);
    const maxX = Math.max(object1.left + object1.width, object2.left + object2.width);
    const minY = Math.min(object1.top, object2.top);
    const maxY = Math.max(object1.top + object1.height, object2.top + object2.height);

    const expectedWidth = maxX - minX;
    const expectedHeight = maxY - minY;

    // Create border around the objects
    const borderGroup = new BorderGroup(
      {
        widthObjects: [object1, object2],
        heightObjects: [object1, object2],
        xHeight: 100,
        borderType: 'stack',
        color: 'Blue Background' // Assuming BorderGroup constructor takes color directly or BorderUtilities.BorderGroupCreate handles mapping colorType to color
      }
    );
    TestTracker.register("borderGroup", borderGroup);

    // Test assertions
    let passed = true;

    // Border should be wider and taller than the combined objects due to padding
    passed = passed && TestTracker.assertTrue(
      borderGroup.width > expectedWidth,
      "Border should be wider than combined objects"
    );

    passed = passed && TestTracker.assertTrue(
      borderGroup.height > expectedHeight,
      "Border should be taller than combined objects"
    );

    // Border should contain both objects
    const borderBounds = borderGroup.getBoundingRect();
    const obj1Bounds = object1.getBoundingRect();
    const obj2Bounds = object2.getBoundingRect();

    passed = passed && TestTracker.assertTrue(
      borderBounds.left <= obj1Bounds.left,
      "Border should contain first object (left edge)"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.top <= obj1Bounds.top,
      "Border should contain first object (top edge)"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.left + borderBounds.width >= obj2Bounds.left + obj2Bounds.width,
      "Border should contain second object (right edge)"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.top + borderBounds.height >= obj2Bounds.top + obj2Bounds.height,
      "Border should contain second object (bottom edge)"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.width % 25 == 0,
      "Border width is rounded to nearest 25"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.height % 25 == 0,
      "Border height is rounded to nearest 25"
    );

    // Check border color scheme
    passed = passed && TestTracker.assert(
      borderGroup.color,
      'Blue Background',
      "Border has incorrect color scheme"
    );

    window.testBorder = borderGroup;

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Create and test border around objects with divider
   */
  testBorderWithDivider() {
    TestTracker.startTest("BorderWithDivider");

    // Create text objects directly using TextObject constructor
    const aboveText = new TextObject({
      text: 'Above',
      xHeight: 100,
      font: 'TransportHeavy',
      color: 'Black',
      left: -800,
      top: 250
    });
    TestTracker.register("aboveText", aboveText);

    const belowText = new TextObject({
      text: 'Below',
      xHeight: 100,
      font: 'TransportHeavy',
      color: 'Black',
      left: -800,
      top: 450
    });
    TestTracker.register("belowText", belowText);

    const aboveObject = TestTracker.get("aboveText");
    const belowObject = TestTracker.get("belowText");

    // Create horizontal divider between objects
    // HDividerCreate(
    //   [aboveObject],
    //   [belowObject],
    //   null,
    //   null,
    //   { xHeight: 100, colorType: 'Yellow Background' }
    // );
    new DividerObject({
      aboveObjects: [aboveObject], // Corrected to plural and array
      belowObjects: [belowObject], // Corrected to plural and array
      xHeight: 100,
      colorType: 'Yellow Background',
      dividerType: 'HDivider',
    });
    TestTracker.register("divider");

    const divider = TestTracker.get("divider");

    // Create border around all three objects
    const borderGroup = new BorderGroup(
      {
        widthObjects: [aboveObject, belowObject, divider],
        heightObjects: [aboveObject, belowObject, divider],
        xHeight: 100,
        borderType: 'stack',
        color: 'Yellow Background' // Assuming BorderGroup constructor takes color directly or BorderUtilities.BorderGroupCreate handles mapping colorType to color
      }
    );
    TestTracker.register("combinedBorder", borderGroup);

    // Test assertions
    let passed = true;

    // Border should contain all three objects
    passed = passed && TestTracker.assertTrue(
      borderGroup.heightObjects.includes(aboveObject) &&
      borderGroup.heightObjects.includes(belowObject) &&
      borderGroup.HDivider.includes(divider),
      "Border should contain both text objects and the divider"
    );

    // Check border contains all elements
    const borderBounds = borderGroup.getBoundingRect();
    const aboveBounds = aboveObject.getBoundingRect();
    const belowBounds = belowObject.getBoundingRect();
    const dividerBounds = divider.getBoundingRect();

    passed = passed && TestTracker.assertTrue(
      borderBounds.top <= Math.min(aboveBounds.top, belowBounds.top, dividerBounds.top),
      "Border should contain all elements (top edge)"
    );

    passed = passed && TestTracker.assertTrue(
      borderBounds.top + borderBounds.height >= Math.max(
        aboveBounds.top + aboveBounds.height,
        belowBounds.top + belowBounds.height,
        dividerBounds.top + dividerBounds.height
      ),
      "Border should contain all elements (bottom edge)"
    );

    // Check divider position is between objects
    passed = passed && TestTracker.assertTrue(
      divider.top >= aboveObject.getEffectiveCoords()[2].y, // Text object height is greater than effective height
      "Divider should be below first object"
    );

    passed = passed && TestTracker.assertTrue(
      divider.top < belowObject.top,
      "Divider should be above second object"
    );

    // Now move the border and check if everything moves together
    const originalDividerTop = divider.top;
    const originalBelowTop = belowObject.top;
    const originalBorderTop = borderGroup.top;
    aboveObject.set({ top: aboveObject.top + 50 });
    aboveObject.setCoords();
    aboveObject.updateAllCoord();

    // Check that all elements moved with the border
    passed = passed && TestTracker.assertTrue(
      Math.abs((divider.top - originalDividerTop) - 50) < 5,
      "Divider should move with border"
    );

    passed = passed && TestTracker.assertTrue(
      Math.abs((belowObject.top - originalBelowTop) - 50) < 5,
      "Below text should move with border"
    );

    passed = passed && TestTracker.assertTrue(
      Math.abs((borderGroup.top - originalBorderTop) - 50) < 5,
      "Below text should move with border"
    );

    // Check border color scheme
    passed = passed && TestTracker.assert(
      borderGroup.color,
      'Yellow Background',
      "Border has incorrect color scheme"
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all border tests
   */
  runAll: function () {
    this.testBorderCreation();
    this.testBorderWithDivider(); // Replace testDividerCreation with combined test
  }
};

/**
 * Test suite for route.js functionality
 */
const RouteTest = {
  /**
   * Test creation of a Main Road using route.js drawing functions
   */
  testMainRoad() {
    TestTracker.startTest("MainRoad");

    // Set up test parameters
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      posx: 250,
      posy: 300,
      width: 6,
      shape: 'Arrow',
      color: 'white',
      roadType: 'Main Line'
    };

    // Create the route list with the main road points
    const routeList = [
      { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: params.width, shape: 'Stub' },
      { x: params.posx, y: params.posy, angle: 0, width: params.width, shape: params.shape }
    ];

    // Create route options for the MainRoadSymbol
    const routeOptions = {
      routeList: routeList,
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      color: params.color,
      roadType: params.roadType,
      // Ensure left and top are set for consistent positioning in tests
      left: params.posx - (params.width * params.xHeight / 8),
      top: params.posy
    };

    // Create and initialize the MainRoadSymbol
    const mainRoad = new MainRoadSymbol(routeOptions);
    // Manually call updateAllCoord as it's usually handled by canvas add
    mainRoad.updateAllCoord();


    TestTracker.register("mainRoad", mainRoad);

    // Test assertions using TestTracker
    let passed = true;

    passed = passed && TestTracker.assert(
      mainRoad.left,
      params.posx - (params.width * params.xHeight / 8), // Adjusted for actual calculation in constructor
      "Main Road left position incorrect",
      5
    );

    passed = passed && TestTracker.assert(
      mainRoad.top,
      params.posy,
      "Main Road top position incorrect",
      5
    );

    passed = passed && TestTracker.assert(
      mainRoad.functionalType,
      'MainRoad',
      "Main Road has incorrect functional type"
    );

    TestTracker.endTest(passed);
    return mainRoad;
  },

  /**
   * Test creation of a Side Road route on the left side using route.js drawing functions
   */
  testLeftSideRoad() {
    TestTracker.startTest("LeftSideRoad");

    const mainRoad = TestTracker.get("mainRoad", "MainRoad");
    if (!mainRoad) {
      TestTracker.recordFailure("Main Road not found for LeftSideRoad test", "MainRoad object", "null");
      TestTracker.endTest(false);
      return null;
    }

    // Ensure mainRoad coordinates are up-to-date
    mainRoad.updateAllCoord();


    const params = {
      xHeight: mainRoad.xHeight,
      color: 'white',
      mainRoad: mainRoad,
      side: true, // true for left
      branchIndex: mainRoad.sideRoad.length + 1,
      // Position the side road relative to the main road's root
      // Note: SideRoadSymbol constructor handles precise attachment logic
      routeList: [{
        x: mainRoad.left - 100,
        y: mainRoad.top,
        angle: -90,
        shape: 'Stub',
        width: 4
      }],
    };

    const sideRoad = new SideRoadSymbol(params);

    TestTracker.register("leftSideRoad", sideRoad);

    let passed = true;
    passed = passed && TestTracker.assert(
      sideRoad.functionalType,
      'SideRoad',
      "Side Road has incorrect type"
    );
    passed = passed && TestTracker.assert(
      sideRoad.side,
      true,
      "Side Road should be on left side"
    );

    // Check vertices touching root
    const rootLeft = mainRoad.routeList[0].x - mainRoad.routeList[0].width * mainRoad.xHeight / 8;

    // Find connecting vertices
    const touchingVertices = sideRoad.basePolygon.vertex.filter(v =>
      v.label === 'V3' || v.label === 'V4' || v.label === 'V5' || v.label === 'V6'
    );

    // All vertex should be close to Main Road
    const touchingRoot = touchingVertices.filter(v =>
      Math.abs(v.x - rootLeft) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot.length == touchingVertices.length,
      "Left Side Road vertices don't touch Main Road"
    );

    TestTracker.endTest(passed);
    return sideRoad;
  },

  /**
   * Test creation of a Side Road route on the right side using route.js drawing functions
   */
  testRightSideRoad() {
    TestTracker.startTest("RightSideRoad");

    const mainRoad = TestTracker.get("mainRoad", "MainRoad");
    if (!mainRoad) {
      TestTracker.recordFailure("Main Road not found for RightSideRoad test", "MainRoad object", "null");
      TestTracker.endTest(false);
      return null;
    }
    // Ensure mainRoad coordinates are up-to-date
    mainRoad.updateAllCoord();

    const params = {
      xHeight: mainRoad.xHeight,
      color: 'white',
      mainRoad: mainRoad,
      side: false, // false for right
      // Position the side road relative to the main road's root
      routeList: [{
        x: mainRoad.left + 300,
        y: mainRoad.top,
        angle: 60,
        shape: 'Arrow',
        width: 4
      }],
    };

    const sideRoad = new SideRoadSymbol(params);

    TestTracker.register("rightSideRoad", sideRoad);

    let passed = true;
    passed = passed && TestTracker.assert(
      sideRoad.functionalType,
      'SideRoad',
      "Side Road has incorrect type"
    );
    passed = passed && TestTracker.assert(
      sideRoad.side,
      false,
      "Side Road should be on right side"
    );

    // Check vertices touching root
    const rootRight = mainRoad.routeList[0].x + mainRoad.routeList[0].width * mainRoad.xHeight / 8;

    // Find connecting vertices
    const touchingVertices = sideRoad.basePolygon.vertex.filter(v =>
      v.label === 'V3' || v.label === 'V4' || v.label === 'V5' || v.label === 'V6'
    );

    // At least one vertex should be close to main road
    const touchingRoot = touchingVertices.filter(v =>
      Math.abs(v.x - rootRight) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot.length == touchingVertices.length,
      "Right Side Road vertices don't touch Main Road"
    );

    // CONSTRAINT TESTS:
    // 1. Test horizontal constraint - branch should be pushed to minimum distance from main road
    const minHorizontalDistance = 13 * mainRoad.xHeight / 4;
    const expectedLeftPosition = rootRight + minHorizontalDistance;

    passed = passed && TestTracker.assert(
      sideRoad.left + sideRoad.width,
      expectedLeftPosition,
      "Side Road not correctly positioned horizontally - constraint failed",
      5
    );

    // 2. Test vertical constraint - branch should not be above main road's tip
    const rootTop = mainRoad.routeList[1].y;
    const tipLength = mainRoad.tipLength * mainRoad.xHeight / 4;
    const minTopPosition = rootTop + tipLength;

    // Get the top-most part of the side road
    const sideRoadTopVertices = sideRoad.basePolygon.vertex.filter(v =>
      v.label === 'V5');
    const branchTopY = Math.min(...sideRoadTopVertices.map(v => v.y));

    passed = passed && TestTracker.assertTrue(
      branchTopY >= minTopPosition,
      `Side Road top (${branchTopY}) should not be above Main Road tip position (${minTopPosition})`
    );

    TestTracker.endTest(passed);
    return sideRoad;
  },

  /**
   * Test Side Road route movement constraints
   */
  testSideRoadMovement() {
    TestTracker.startTest("SideRoadMovement");

    // Get left Side Road from TestTracker
    const leftSideRoad = TestTracker.get("leftSideRoad", "LeftSideRoad");
    if (!leftSideRoad) {
      TestTracker.recordFailure("Left Side Road not found", "sideRoad object", "null");
      TestTracker.endTest(false);
      return false;
    }

    const mainRoad = leftSideRoad.mainRoad;
    const originalX = leftSideRoad.left;

    // Try to move Side Road too close to root
    leftSideRoad.left = mainRoad.left; // Too close
    leftSideRoad.updateAllCoord();
    leftSideRoad.onMove();

    // Should have been constrained
    const minDistance = 4 * leftSideRoad.xHeight / 4;
    const rootLeft = mainRoad.routeList[0].x - mainRoad.routeList[0].width * mainRoad.xHeight / 8;
    const expected = rootLeft - minDistance;

    const passed = TestTracker.assert(
      leftSideRoad.left,
      expected,
      "Side Road route not properly constrained from root",
      5
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all route tests
   */
  runAll: function () {
    this.testMainRoad();
    this.testLeftSideRoad();
    this.testRightSideRoad();
    this.testSideRoadMovement();
    // Roundabout tests moved to dedicated test suite
  }
};

/**
 * Test suite for roundabout functionality (both conventional and spiral)
 */
const RoundaboutTest = {
  /**
   * Test creation of a Conventional Roundabout and adding a side road to it
   */
  testConventionalRoundabout() {
    TestTracker.startTest("ConventionalRoundabout");

    // Set up test parameters for roundabout
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      color: 'white',
      width: 6,
      shape: 'Stub',
      roadType: 'Conventional Roundabout',
      posx: 1250,
      posy: 600
    };

    // Create a Roundabout directly using updated construction method
    const routeList = [
      { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Normal' },
      { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Stub' }
    ];

    // Create route options for the MainRoadSymbol with Conventional Roundabout type
    const routeOptions = {
      routeList: routeList,
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      roadType: params.roadType,
      color: params.color
    };

    const roundabout = new MainRoadSymbol(routeOptions);
    TestTracker.register("conventionalRoundabout", roundabout);

    // Test assertions
    let passed = true;

    passed = passed && TestTracker.assert(
      roundabout.functionalType,
      'MainRoad',
      "Roundabout has incorrect functional type"
    );

    passed = passed && TestTracker.assert(
      roundabout.roadType,
      'Conventional Roundabout',
      "Roundabout has incorrect road type"
    );

    passed = passed && TestTracker.assert(
      roundabout.left,
      params.posx - 12 * params.xHeight / 4,  // Radius of roundabout is 12
      "Roundabout left position incorrect",
      5
    );

    // Set the roundabout as active object to add a side road
    canvas.setActiveObject(roundabout);

    // Create a side road on the roundabout
    const sideRoadParams = {
      xHeight: roundabout.xHeight,
      color: 'white',
      mainRoad: roundabout,
      side: false, // false for right
      // Position the side road relative to the main road's root
      routeList: [{
        x: params.posx + 120,
        y: params.posy - 50, 
        angle: -45,
        shape: 'Stub',
        width: 4
      }],
    };

    // Draw and finalize the side road
    new SideRoadSymbol(sideRoadParams);

    // Create a second side road on the roundabout
    const sideRoadParams2 = {
      xHeight: roundabout.xHeight,
      color: 'white',
      mainRoad: roundabout,
      side: false, // false for right
      // Position the side road relative to the main road's root
      routeList: [{
        x: params.posx,
        y: params.posy - 100,
        angle: -90,
        shape: 'Arrow',
        width: 6
      }]
    };

    // Set the roundabout as active object to add a side road
    canvas.setActiveObject(roundabout);

    // Draw and finalize the second side road
    new SideRoadSymbol(sideRoadParams2);

    // Find the created Side Road route and register it
    const sideRoad = roundabout.sideRoad[roundabout.sideRoad.length - 1];
    TestTracker.register("roundaboutSideRoad", sideRoad);

    // Test side road assertions
    passed = passed && TestTracker.assertTrue(
      sideRoad != null,
      "Side road should be created"
    );

    if (sideRoad) {
      passed = passed && TestTracker.assert(
        sideRoad.functionalType,
        'SideRoad',
        "Side Road has incorrect type"
      );

      // Check side road is correctly positioned relative to roundabout center
      const roundaboutCenter = routeOptions.routeList[1];
      const distanceFromCenter = Math.sqrt(
        Math.pow(sideRoad.routeList[0].x - roundaboutCenter.x, 2) +
        Math.pow(sideRoad.routeList[0].y - roundaboutCenter.y, 2)
      );

      // Side road should be at least the roundabout radius away from center
      const minDistanceFromCenter = 12 * params.xHeight / 4;
      passed = passed && TestTracker.assertTrue(
        distanceFromCenter >= minDistanceFromCenter,
        `Side Road should be at least ${minDistanceFromCenter} units from roundabout center, but is ${distanceFromCenter}`
      );
    }

    TestTracker.endTest(passed);
    return sideRoad;
  },

  /**
   * Create and test a spiral roundabout with multiple arms
   */
  testSpiralRoundabout() {
    TestTracker.startTest("SpiralRoundabout");

    // Create a spiral roundabout
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      color: 'white',
      width: 6,
      shape: 'Spiral Arrow',
      roadType: 'Spiral Roundabout',
      posx: 2500,
      posy: 600
    };

    // Create a Spiral Roundabout directly using updated construction method
    const routeList = [
      { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Auxiliary' },
      { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Stub' }
    ];

    // Create route options for the MainRoadSymbol with Spiral Roundabout type
    const routeOptions = {
      routeList: routeList,
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      roadType: params.roadType,
      color: params.color
    };

    const spiralRoundabout = new MainRoadSymbol(routeOptions);
    TestTracker.register("spiralRoundabout", spiralRoundabout);

    // Test assertions for the roundabout
    let passed = true;

    passed = passed && TestTracker.assertTrue(
      spiralRoundabout != null,
      "Spiral roundabout should be created"
    );

    passed = passed && TestTracker.assert(
      spiralRoundabout.roadType,
      'Spiral Roundabout',
      "Roundabout has incorrect road type"
    );

    // Add three arms to the roundabout in different quadrants
    const center = spiralRoundabout.routeList[1];
    canvas.setActiveObject(spiralRoundabout);

    // Add arm in first quadrant (top-right)
    this.addArmAtAngle(center, 300, -90, "arm1");

    // Add arm in second quadrant (top-left)
    this.addArmAtAngle(center, 300, 0, "arm2");


    // Verify arms were added
    passed = passed && TestTracker.assert(
      spiralRoundabout.sideRoad.length,
      2,
      `Wrong number of arms added to spiral roundabout`
    );

    // Test dragging the first arm
    const firstArm = spiralRoundabout.sideRoad[0];
    canvas.setActiveObject(firstArm);

    // Record initial position
    const initialPos = {
      left: firstArm.left,
      top: firstArm.top,
      tipX: firstArm.routeList[0].x,
      tipY: firstArm.routeList[0].y
    };

    // Move the arm
    firstArm.set({
      left: firstArm.left + 50,
      top: firstArm.top + 50
    });

    // Trigger update
    firstArm.onMove();

    // Validate arm position after movement
    const armTip = firstArm.routeList[0];
    const dx = armTip.x - center.x;
    const dy = armTip.y - center.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const roundedAngle = Math.round(angle / 15) * 15;

    // Check angle snaps to 15 degree increments
    passed = passed && TestTracker.assertTrue(
      Math.abs(angle - roundedAngle) < 0.5,
      `Arm didn't snap to 15 degree increment. Actual: ${angle}, Expected: ${roundedAngle}`
    );

    // Check distance from center is maintained
    const distance = Math.sqrt(dx * dx + dy * dy);
    passed = passed && TestTracker.assertTrue(
      distance >= 24 * params.xHeight / 4 - 1,
      `Arm distance from center should be at least ${24 * params.xHeight / 4} units`
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Helper function to add an arm at a specific angle from center
   * @param {Object} center - Center point {x, y}
   * @param {number} radius - Distance from center to place arm
   * @param {number} angleDegrees - Angle in degrees
   * @param {string} name - Name to register the arm with in TestTracker
   */
  addArmAtAngle(center, radius, angleDegrees, name) {
    const angleRadians = angleDegrees * Math.PI / 180;
    const x = center.x + radius * Math.cos(angleRadians);
    const y = center.y + radius * Math.sin(angleRadians);

    const roundabout = TestTracker.get("spiralRoundabout", "SpiralRoundabout");
    canvas.setActiveObject(roundabout);

    // Create options for the arm
    const options = {
      xHeight: roundabout.xHeight,
      color: 'white',
      mainRoad: roundabout,
      side: false, // false for right
      routeList: [{
        x: x,
        y: y,
        angle: angleDegrees,
        shape: 'Spiral Arrow',
        width: 4
      }],
    };

    // Add the arm
    new SideRoadSymbol(options);


    // Register the new arm with TestTracker

    const newArm = roundabout.sideRoad[roundabout.sideRoad.length - 1];
    TestTracker.register(name, newArm);

    return newArm;
  },

  /**
   * Run all roundabout tests
   */
  runAll: function () {
    this.testConventionalRoundabout();
    this.testSpiralRoundabout();
  }
};

/**
 * Test suite for complex traffic sign layouts
 */
const ComplexSignTest = {
  /**
   * Create and test a complex sign with multiple borders and dividers
   */
  testComplexSignLayout() {
    TestTracker.startTest("ComplexSignLayout");

    // ===== LEFT SIDE OF SIGN =====
    // Create first line of 2-liner on left
    const leftTopText = new TextObject({
      text: 'Mong Kok, Hong Kong(W)',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 1800
    });
    TestTracker.register("leftTopText", leftTopText);

    // Create second line of 2-liner on left
    const leftBottomText = new TextObject({
      text: 'Kowloon City',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 2000
    });
    TestTracker.register("leftBottomText", leftBottomText);

    // Create destination text on left
    const leftDestination = new TextObject({
      text: '旺角,香港(西),九龍城',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 2200
    });
    TestTracker.register("leftDestination", leftDestination);

    // Create stack arrow below on left
    new SymbolObject({
      symbolType: 'GantryArrow',
      left: -2400,
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("leftArrow");

    // Create Airport on left
    new SymbolObject({
      symbolType: 'Airport',
      left: -2700,
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("Airport");

    // Create WHC on left
    new SymbolObject({
      symbolType: 'WHC',
      left: 2700,
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("WHC");

    // ===== RIGHT SIDE OF SIGN =====
    // Create first line of 2-liner on right
    const rightTopText = new TextObject({
      text: 'Kowloon Tong & Sha Tin',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: 3000,
      top: 1800
    });
    TestTracker.register("rightTopText", rightTopText);

    // Create destination text on right
    const rightDestination = new TextObject({
      text: '九龍塘及沙田',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: 3000,
      top: 2200
    });
    TestTracker.register("rightDestination", rightDestination);

    // Create stack arrow below on right
    new SymbolObject({
      symbolType: 'GantryArrow',
      left: 3000,
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("rightArrow");

    // Create second gantry arrow on right
    new SymbolObject({
      symbolType: 'GantryArrow',
      left: 3300, // Position roughly to the right
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("rightArrow2");

    // Create third gantry arrow on right
    new SymbolObject({
      symbolType: 'GantryArrow',
      left: 3600, // Position roughly further right
      top: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("rightArrow3");

    // Get all created objects
    const leftTopObj = TestTracker.get("leftTopText");
    const leftBottomObj = TestTracker.get("leftBottomText");
    const leftDestObj = TestTracker.get("leftDestination");
    const leftArrowObj = TestTracker.get("leftArrow");
    const airportObj = TestTracker.get("Airport");
    const whcObj = TestTracker.get("WHC");

    const rightTopObj = TestTracker.get("rightTopText");
    const rightDestObj = TestTracker.get("rightDestination");
    const rightArrowObj = TestTracker.get("rightArrow");
    const rightArrowObj2 = TestTracker.get("rightArrow2"); // Get new arrow 2
    const rightArrowObj3 = TestTracker.get("rightArrow3"); // Get new arrow 3


    // Create horizontal dividers between the 2-liner and destination on both sides
    // HLineCreate(
    //   [leftDestObj],
    //   [leftArrowObj],
    //   null,
    //   null,
    //   { xHeight: 200, colorType: 'Blue Background' }
    // );
    new DividerObject({
      aboveObjects: [leftDestObj], // Corrected to plural and array
      belowObjects: [leftArrowObj], // Corrected to plural and array
      xHeight: 200,
      colorType: 'Blue Background',
      dividerType: 'HLine',
    });
    TestTracker.register("leftHDivider");

    // HLineCreate(
    //   [rightDestObj],
    //   [rightArrowObj2],
    //   null,
    //   null,
    //   { xHeight: 200, colorType: 'Blue Background' }
    // );
    new DividerObject({
      aboveObjects: [rightDestObj], // Corrected to plural and array
      belowObjects: [rightArrowObj2], // Corrected to plural and array
      xHeight: 200,
      colorType: 'Blue Background',
      dividerType: 'HLine',
    });
    TestTracker.register("rightHDivider");

    // Anchor the objects in place
    anchorShape(whcObj, leftTopObj, {
      vertexIndex1: 'E3',
      vertexIndex2: 'E1',
      spacingX: -100,
      spacingY: 0
    });

    anchorShape(leftTopObj, airportObj, {
      vertexIndex1: 'E3',
      vertexIndex2: 'E1',
      spacingX: -100,
      spacingY: 0
    });

    anchorShape(leftTopObj, leftBottomObj, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E7',
      spacingX: 0,
      spacingY: 0
    });

    anchorShape(leftBottomObj, leftDestObj, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E7',
      spacingX: 0,
      spacingY: 0
    });

    anchorShape(leftBottomObj, rightTopObj, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E3',
      spacingX: '',
      spacingY: 0
    });

    anchorShape(rightTopObj, rightDestObj, {
      vertexIndex1: 'E2',
      vertexIndex2: 'E6',
      spacingX: 0,
      spacingY: 0
    });

    // Create a vertical gantry divider between left and right sides
    // VDividerCreate(
    //   [whcObj],
    //   [rightTopObj],
    //   null,
    //   null,
    //   { xHeight: 200, colorType: 'Blue Background' }
    // );
    new DividerObject({
      leftObjects: [whcObj], // Corrected to plural and array
      rightObjects: [rightTopObj], // Corrected to plural and array
      xHeight: 200,
      colorType: 'Blue Background',
      dividerType: 'VDivider',
    });
    TestTracker.register("vDivider");

    // Create an overall border containing both sides and the dividers
    const vDivider = TestTracker.get("vDivider");
    const leftHDivider = TestTracker.get("leftHDivider");
    const rightHDivider = TestTracker.get("rightHDivider");

    const overallObject = [leftTopObj, leftBottomObj, leftArrowObj, leftDestObj, airportObj, whcObj, rightTopObj, rightArrowObj, rightDestObj, vDivider, leftHDivider, rightHDivider, rightArrowObj2, rightArrowObj3]; // Add new arrows

    const overallBorderGroup = BorderUtilities.BorderGroupCreate(
      'stack',
      overallObject,
      overallObject,
      13400,
      null,
      { xHeight: 200, borderType: 'stack', colorType: 'Blue Background' }
    );
    TestTracker.register("overallBorderGroup", overallBorderGroup);

    anchorShape(overallBorderGroup, leftArrowObj, {
      vertexIndex1: 'E1',
      vertexIndex2: 'E7',
      spacingX: 1550,
      spacingY: ''
    });

    anchorShape(leftArrowObj, rightArrowObj, {
      vertexIndex1: 'E2',
      vertexIndex2: 'E2',
      spacingX: 3650,
      spacingY: 0
    });

    anchorShape(overallBorderGroup, rightArrowObj2, { // Anchor rightArrow -> rightArrow2
      vertexIndex1: 'E3',
      vertexIndex2: 'E3',
      spacingX: -800, // Add some spacing
      spacingY: ''
    });

    anchorShape(rightArrowObj2, rightArrowObj3, { // Anchor rightArrow2 -> rightArrow3
      vertexIndex1: 'E3',
      vertexIndex2: 'E3',
      spacingX: -3650, // Add some spacing
      spacingY: 0
    });


    // Test assertions
    let passed = true;

    // Test 1: Verify that the overall border contains all elements
    passed = passed && TestTracker.assertTrue(
      overallBorderGroup.VDivider.includes(vDivider) &&
      overallBorderGroup.HDivider.includes(leftHDivider) &&
      overallBorderGroup.HDivider.includes(rightHDivider),
      "Overall border should contain all elements"
    );

    // Test 2: Verify that dividers do not cross borders
    // Get the vertical divider bounding box
    const vDividerBounds = vDivider.getBoundingRect();

    // Verify vertical divider top and bottom are within the overall border
    const overallBounds = overallBorderGroup.getBoundingRect();
    passed = passed && TestTracker.assertTrue(
      vDivider.top >= overallBounds.top &&
      vDivider.top + vDivider.height <= overallBounds.top + overallBounds.height,
      "Vertical divider should not extend beyond overall border"
    );

    // Test 3: Verify that horizontal dividers do not cross vertical divider
    const leftHDividerBounds = leftHDivider.getBoundingRect();
    const rightHDividerBounds = rightHDivider.getBoundingRect();

    // Left horizontal divider should not extend beyond vertical divider
    passed = passed && TestTracker.assertTrue(
      leftHDividerBounds.left + leftHDividerBounds.width <= vDividerBounds.left + 5,  // Allow 5px tolerance
      "Left horizontal divider should not extend beyond vertical divider"
    );

    // Right horizontal divider should not start before vertical divider
    passed = passed && TestTracker.assertTrue(
      rightHDividerBounds.left >= vDividerBounds.left + vDividerBounds.width - 5,  // Allow 5px tolerance
      "Right horizontal divider should not start before vertical divider"
    );

    // Test 4: Verify that horizontal dividers are positioned correctly between objects
    passed = passed && TestTracker.assertTrue(
      leftHDivider.top > leftBottomObj.top + leftBottomObj.height &&
      leftHDivider.top < leftArrowObj.top,
      "Left horizontal divider should be between 2-liner and destination"
    );

    passed = passed && TestTracker.assertTrue(
      rightHDivider.top > rightTopObj.top + rightTopObj.height &&
      rightHDivider.top < rightArrowObj.top,
      "Right horizontal divider should be between 2-liner and destination"
    );

    // Test 5: Verify that moving the overall border moves all contained elements
    // Record initial positions
    const initialVDividerLeft = vDivider.left;
    const initialLeftTextLeft = whcObj.left;
    const initialRightTextLeft = rightTopObj.left;
    const initialRightArrow2Left = rightArrowObj2.left; // Record initial position
    const initialRightArrow3Left = rightArrowObj3.left; // Record initial position

    // Move the overall border by left top object
    whcObj.set({ left: whcObj.left + 100 });
    whcObj.setCoords();
    whcObj.updateAllCoord();

    // Check that contained elements moved with the border
    passed = passed && TestTracker.assertTrue(
      Math.abs((vDivider.left - initialVDividerLeft) - 100) < 5,
      "Vertical divider should move with overall border"
    );

    passed = passed && TestTracker.assertTrue(
      Math.abs((whcObj.left - initialLeftTextLeft) - 100) < 5,
      "Left text should move with overall border"
    );

    passed = passed && TestTracker.assertTrue(
      Math.abs((rightTopObj.left - initialRightTextLeft) - 100) < 5,
      "Right text should move with overall border"
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all complex sign tests
   */
  runAll: function () {
    this.testComplexSignLayout();
  }
};


/**
 * Test suite for template sign creation
 */
const TemplateTest = {
 
  /**
 * Expected dimensions for each template.
 * NOTE: These are placeholders and need to be filled with actual expected values.
 */
  expectedTemplateDimensions: {
   
    'Flag Sign': { width: 2907, height: 1650, left: -15400, top: 7740 }, // Placeholder values
    'Stack Sign': { width: 1925, height: 1150 + 1275, left: -10602, top: 6749 }, // Placeholder values
    'Lane Sign': { width: 3950, height: 1600, left: -7606, top: 7998 }, // Placeholder values
    'Roundabout Sign': { width: 3800, height: 3250, left: -3488, top: 6019 }, // Placeholder values
    'Spiral Roundabout Sign': { width: 3800, height: 3250, left: 1794, top: 6230 }, // Placeholder values, may be null if not fully implemented
    'Gantry Sign': { width: 7900, height: 2700, left: 7493, top:  7306 }, // Placeholder values
    'Diverge Sign ': { width: 2950, height: 5900, left: 17320, top: 7605 }, // Placeholder values
    // Add entries for any other templates
  },

  /**
   * Test creation of all available template signs
   */
  testTemplateCreation() {
    let overallPassed = true;
    // Assuming templateList is globally available or imported from sb-template.js
    const templateList = Object.keys(FormTemplateComponent.templates) || []; // Adjust this line based on your actual template list source

    const initialObjectCount = canvasObject.length;
    let createdCount = 0;
    let gridX = -15000;
    let gridY = 8000;

    templateList.forEach((template, index) => {
      const testName = `TemplateCreation_${template || 'UnnamedTemplate'}_${index}`;
      TestTracker.startTest(testName);
      let passed = true;
      let createdSignResult = null;

      try {
        createdSignResult = FormTemplateComponent.createTemplateSign(template, gridX, gridY,);
        gridX += template == 'Gantry Sign' ? 11000 : (template == 'Stack Sign' ? 3500 : 5000); // Adjust grid position for next template

        // Get expected dimensions for this template
        const expected = this.expectedTemplateDimensions[template];

        if (createdSignResult && expected) {
          const tolerance = 5; // Tolerance for dimension checks
          passed = passed && TestTracker.assertTrue(createdSignResult != null, "Template sign object should be created");
          // Add more specific assertions if needed, e.g., check functionalType or number of objects created
          // Assert dimensions against expected values
          passed = passed && TestTracker.assert(
            createdSignResult.width,
            expected.width,
            `Template ${template}: Width mismatch`,
            tolerance
          );
          passed = passed && TestTracker.assert(
            createdSignResult.height,
            expected.height,
            `Template ${template}: Height mismatch`,
            tolerance
          );
          // Assert that the returned top-left corner is consistent with the center point and dimensions
          passed = passed && TestTracker.assert(
            createdSignResult.left,
            expected.left,
            `Template ${template}: Left position mismatch (relative to center)`,
            tolerance
          );
          passed = passed && TestTracker.assert(
            createdSignResult.top,
            expected.top,
            `Template ${template}: Top position mismatch (relative to center)`,
            tolerance
          );
          createdCount++;
        } else {
          passed = false;
          TestTracker.recordFailure("Template sign creation returned null or undefined", "Fabric Object/Group", createdSign);
        }
      } catch (error) {
        passed = false;
        TestTracker.recordFailure(`Error creating template: ${error.message}`, "No error", error);
        console.error(`Error details for template ${template.name || index}:`, error);
      }

      TestTracker.endTest(passed);
      if (!passed) {
        overallPassed = false;
      }
    });

    // Final check
    TestTracker.startTest("TemplateCreationSummary");
    let summaryPassed = TestTracker.assert(createdCount, templateList.length, "Number of successfully created templates doesn't match list length");
    TestTracker.endTest(summaryPassed);

    return overallPassed && summaryPassed;
  },

  /**
   * Run all template tests
   */
  runAll: function () {
    this.testTemplateCreation();
  }
};

// Update testToRun to use the new consolidated RoundaboutTest instead of SpiralRoundaboutTest
const testToRun = [
  ShapeTest.runAll.bind(ShapeTest),
  AnchorTest.runAll.bind(AnchorTest),
  RouteTest.runAll.bind(RouteTest),
  BorderTest.runAll.bind(BorderTest),
  RoundaboutTest.runAll.bind(RoundaboutTest), // Replace SpiralRoundaboutTest with RoundaboutTest
  ComplexSignTest.runAll.bind(ComplexSignTest),
  TemplateTest.runAll.bind(TemplateTest),
];



function runTests(tests) {
  console.log("======== RUNNING TESTS ========\n");



  for (const test of tests) {
    test();
  }

  // Print just the final summary
  TestTracker.printSummary();
}


/**
 * Test for TextObject to DXF export
 * This test verifies that a TextObject maintains its position when exported to DXF
 */
function testTextObjectDXFExport() {
  // Create a new DXF document using our npm module
  const dxf = new DxfWriter();

  // Set document properties
  dxf.setUnits('Millimeters');
  dxf.addLayer('Outlines', 1, 'continuous', 'red');

  // Create a test text object at a specific position
  const textPosition = { left: 0, top: 0 };
  const testText = new TextObject({
    text: 'O',
    left: textPosition.left,
    top: textPosition.top,
    xHeight: 100,
    color: '#ffffff',
    font: 'TransportMedium'
  });

  // Add text to canvas temporarily
  canvas.add(testText);
  canvas.renderAll();

  // Export to DXF using the existing FormExportComponent.exportToDXF function
  // This is hronous since the exportToDXF function creates a blob and triggers a download

  const pathObject = [];
  FormExportComponent.collectPathObjects(testText, pathObject);

  const minX = testText.left;
  const minY = testText.top;
  pathObject.forEach(path => {
    FormExportComponent.processPathForDXF(path, dxf, minX, minY);
  })

  // Generate the DXF content
  const dxfContent = dxf.toDxfString();

  verifyTextPositionInDXF(dxfContent, testText)

  // Create download link
  const blob = new Blob([dxfContent], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${FormExportComponent.exportSettings.filename}.dxf`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper function to verify text position in DXF content
 * @param {string} dxfContent - The DXF content string
 * @param {Object} originalPosition - Original position {left, top}
 * @returns {string} - Test result message
 */
function verifyTextPositionInDXF(dxfContent, originalPosition) {
  // A basic check for coordinates in the DXF
  // DXF format has coordinates after code 10 (X) and 20 (Y)

  // Find position entries in DXF
  const positionEntries = [];
  const lines = dxfContent.split('\n');

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '10') { // X coordinate identifier
      const xValue = parseFloat(lines[i + 1]);

      if (lines[i + 2].trim() === '20') { // Y coordinate identifier
        const yValue = parseFloat(lines[i + 3]);
        positionEntries.push({ x: xValue, y: yValue });
      }
    }
  }

  // Check if any position is close to the original text position
  const tolerance = 1; // Allow 1 unit of tolerance for floating point precision
  const positionMatched = positionEntries.some(pos =>
    Math.abs(pos.x - originalPosition.left) <= tolerance &&
    Math.abs(pos.y - originalPosition.top) <= tolerance
  );

  if (positionMatched) {
    return `✅ Text position verified in DXF output! Original: (${originalPosition.left}, ${originalPosition.top})`;
  } else {
    if (positionEntries.length > 0) {
      return `❌ Text position not found in DXF! Original: (${originalPosition.left}, ${originalPosition.top}), Found positions: ${JSON.stringify(positionEntries.slice(0, 3))}...`;
    } else {
      return `❌ No position coordinates found in DXF output!`;
    }
  }
}

export { runTests, testToRun };