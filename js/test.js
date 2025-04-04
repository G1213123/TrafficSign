let equalAnchorTest = function () {
  const anchor = {
    sourcePoint: 'E1', targetPoint: 'E1', sourceObject: canvasObject[4], TargetObject: canvasObject[5],
    secondSourcePoint: 'E3', secondTargetPoint: 'E3', secondSourceObject: canvasObject[4], secondTargetObject: canvasObject[5]
  }
  EQanchorShape('x', anchor)
}



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
  async testShapeCreation() {
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
    await drawLabeledSymbol('StackArrow', {
      x: -1500,
      y: -900,
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
  runAll: async function () {
    await this.testShapeCreation();
  }
};

/**
 * Test suite for object anchoring functionality
 */
const AnchorTest = {
  /**
   * Create and test anchored objects
   */
  async testAnchoringObjects() {
    TestTracker.startTest("AnchorTest");

    // Create three symbols to anchor together using direct object creation instead of FormText methods
    // First symbol (base)
    await drawLabeledSymbol('Tunnel', {
      x: 300,
      y: -1000,
      xHeight: 100,
      color: 'white'
    });
    TestTracker.register("baseTunnel");

    // Second symbol (to right)
    await drawLabeledSymbol('Airport', {
      x: 400,
      y: -400,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("Airport");

    // Third symbol (below)
    await drawLabeledSymbol('Hospital', {
      x: 300,
      y: -300,
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
  async testDelinkingAnchoredObjects() {
    TestTracker.startTest("DelinkingAnchoredObjects");

    // Create four symbols to anchor together
    // First pair
    await drawLabeledSymbol('EHC', {
      x: 1500,
      y: -1000,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("baseTunnel1");

    await drawLabeledSymbol('WHC', {
      x: 1500,
      y: -1000,
      xHeight: 100,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("airport1");

    // Second pair
    await drawLabeledSymbol('Hospital', {
      x: 1575,
      y: -550,
      xHeight: 100,
      color: 'white'
    });
    TestTracker.register("baseHospital");

    await drawLabeledSymbol('CHT', {
      x: 1575,
      y: -550,
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
   * Run all anchor tests
   */
  runAll: async function () {
    await this.testAnchoringObjects();
    await this.testDelinkingAnchoredObjects();
  }
};

/**
 * Test suite for border creation and functionality
 */
const BorderTest = {
  /**
   * Create and test border around objects
   */
  async testBorderCreation() {
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
    const borderGroup = await BorderUtilities.BorderGroupCreate(
      'stack',
      [object1, object2],
      [object1, object2],
      null,
      null,
      { xHeight: 100, borderType: 'stack', colorType: 'Blue Background' }
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
  async testBorderWithDivider() {
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
    await HDividerCreate(
      [aboveObject],
      [belowObject],
      null,
      null,
      { xHeight: 100, colorType: 'Yellow Background' }
    );
    TestTracker.register("divider");

    const divider = TestTracker.get("divider");

    // Create border around all three objects
    const borderGroup = await BorderUtilities.BorderGroupCreate(
      'stack',
      [aboveObject, belowObject, divider],
      [aboveObject, belowObject, divider],
      null, null,
      { xHeight: 100, borderType: 'stack', colorType: 'Yellow Background' }
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
  runAll: async function () {
    await this.testBorderCreation();
    await this.testBorderWithDivider(); // Replace testDividerCreation with combined test
  }
};

/**
 * Test suite for route.js functionality
 */
const RouteTest = {
  /**
   * Test creation of a Main Road using route.js drawing functions
   */
  async testMainRoad() {
    TestTracker.startTest("MainRoad");

    // Set up test parameters
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      posx: 250,
      posy: 300,
      width: 6,
      shape: 'Arrow'
    };

    // Create a MainRoute directly
    const routeOptions = {
      routeList: [
        { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Stub' },
        { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Arrow' }
      ],
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      roadType: 'Main Line'
    };

    const mainRoad = new MainRoadSymbol(routeOptions);
    await mainRoad.initialize(calcMainRoadVertices(params.xHeight, routeOptions.routeList));
    TestTracker.register("mainRoad", mainRoad);

    // Test assertions using TestTracker
    let passed = true;

    passed = passed && TestTracker.assert(
      mainRoad.left,
      params.posx - 3 * params.xHeight / 4,
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
  async testLeftSideRoad() {
    TestTracker.startTest("LeftSideRoad");

    // Get Main Road from TestTracker instead of window global
    const mainRoad = TestTracker.get("mainRoad", "MainRoad");
    if (!mainRoad) {
      TestTracker.recordFailure("Main Road not found", "MainRoute object", "null");
      TestTracker.endTest(false);
      return null;
    }

    // Set up test parameters
    const posx = mainRoad.left - 300; // Left of root
    const posy = mainRoad.top;
    const params = {
      xHeight: mainRoad.xHeight,
      angle: 90,
      shape: 'Stub',
      width: 4
    };

    // Set the Main Road as active object
    canvas.setActiveObject(mainRoad);

    // Use actual drawing functions with parameters
    await drawSideRoadOnCursor(null, {
      x: posx,
      y: posy,
      routeParams: params
    });



    // Create the Side Road with a simulated mouse click
    await finishDrawSideRoad({ e: { button: 0 } });

    // Find the created Side Road route and register it
    const sideRoad = mainRoad.sideRoad[mainRoad.sideRoad.length - 1];
    TestTracker.register("leftSideRoad", sideRoad);

    // Test assertions
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

    // At least one vertex should be close to Main Road
    const touchingRoot = touchingVertices.some(v =>
      Math.abs(v.x - rootLeft) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot,
      "Left Side Road vertices don't touch Main Road"
    );

    TestTracker.endTest(passed);
    return sideRoad;
  },

  /**
   * Test creation of a Side Road route on the right side using route.js drawing functions
   */
  async testRightSideRoad() {
    TestTracker.startTest("RightSideRoad");

    // Get Main Road from TestTracker
    const mainRoad = TestTracker.get("mainRoad", "MainRoad");
    if (!mainRoad) {
      TestTracker.recordFailure("Main Road not found", "MainRoute object", "null");
      TestTracker.endTest(false);
      return null;
    }

    // Set up test parameters - intentionally position outside constraints
    // 1. Too close to root horizontally (should be pushed right)
    // 2. Too high vertically (should be pushed down)
    const posx = mainRoad.left + mainRoad.width + 10; // Too close horizontally
    const posy = mainRoad.top - 100; // Too high vertically
    const params = {
      xHeight: mainRoad.xHeight,
      angle: -60, // Negative angle for right side
      shape: 'Arrow',
      width: 4
    };

    // Set the Main Road as active object
    canvas.setActiveObject(mainRoad);

    // Use actual drawing functions with parameters
    await drawSideRoadOnCursor(null, {
      x: posx,
      y: posy,
      routeParams: params
    });


    // Create the Side Road with a simulated mouse click
    await finishDrawSideRoad({ e: { button: 0 } });

    // Find the right Side Road using position - more reliable than using TestTracker.get("leftBranch")
    // A right Side Road will have its x position to the right of the Main Road center
    const rootCenterX = mainRoad.left + mainRoad.width / 2;
    const sideRoad = mainRoad.sideRoad.find(side => side.left > rootCenterX);

    // Register the right Side Road route with TestTracker
    TestTracker.register("rightSideRoad", sideRoad);

    // Test assertions
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
      v.label === 'V0' || v.label === 'V1' || v.label === 'V5' || v.label === 'V6'
    );

    // At least one vertex should be close to main road
    const touchingRoot = touchingVertices.some(v =>
      Math.abs(v.x - rootRight) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot,
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
  async testSideRoadMovement() {
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
    await leftSideRoad.onMove();

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
  runAll: async function () {
    await this.testMainRoad();
    await this.testLeftSideRoad();
    await this.testRightSideRoad();
    await this.testSideRoadMovement();
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
  async testConventionalRoundabout() {
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

    // Create a Roundabout directly
    const routeOptions = {
      routeList: [
        { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Normal' },
        { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Stub' }
      ],
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      roadType: params.roadType,
      color: params.color
    };

    const roundabout = new MainRoadSymbol(routeOptions);
    await roundabout.initialize(calcRoundaboutVertices('Conventional', params.xHeight, routeOptions.routeList));
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
      x: params.posx + 120,  // Position to the right of roundabout
      y: params.posy - 50,   // Position slightly above centerline
      routeParams: {
        angle: -45,
        shape: 'Arrow',
        width: 4
      }
    };

    // Draw and finalize the side road
    await drawSideRoadOnCursor(null, sideRoadParams);
    await finishDrawSideRoad({ e: { button: 0 } });

    // Create a side road on the roundabout
    const sideRoadParams2 = {
      x: params.posx,
      y: params.posy - 100,
      routeParams: {
        angle: -90,
        shape: 'Arrow',
        width: 6
      }
    };

    // Draw and finalize the side road
    await drawSideRoadOnCursor(null, sideRoadParams2);
    await finishDrawSideRoad({ e: { button: 0 } });

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
  async testSpiralRoundabout() {
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

    // Create a Spiral Roundabout directly
    const routeOptions = {
      routeList: [
        { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Auxiliary' },
        { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Stub' }
      ],
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength,
      roadType: params.roadType,
      color: params.color
    };

    const spiralRoundabout = new MainRoadSymbol(routeOptions);
    await spiralRoundabout.initialize(calcRoundaboutVertices('Spiral', params.xHeight, routeOptions.routeList));
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
    await this.addArmAtAngle(center, 300, 180, "arm1");

    // Add arm in second quadrant (top-left)
    await this.addArmAtAngle(center, 300, 270, "arm2");

    // Add arm in third quadrant (bottom-left)
    await this.addArmAtAngle(center, 300, 360, "arm3");

    // Verify arms were added
    passed = passed && TestTracker.assert(
      spiralRoundabout.sideRoad.length,
      3,
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
    await firstArm.onMove();

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
      distance - params.xHeight * 6 < 1,
      `Arm distance from center should be at least ${params.xHeight * 6} units`
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
  async addArmAtAngle(center, radius, angleDegrees, name) {
    const angleRadians = angleDegrees * Math.PI / 180;
    const x = center.x + radius * Math.cos(angleRadians);
    const y = center.y + radius * Math.sin(angleRadians);

    // Create options for the arm
    const options = {
      x: x,
      y: y,
      routeParams: {
        angle: angleDegrees,
        shape: 'Spiral Arrow',
        width: 4
      }
    };

    // Add the arm
    await drawSideRoadOnCursor(null, options);

    // Finish adding the arm
    await finishDrawSideRoad({
      e: { button: 0 }
    });

    // Register the new arm with TestTracker
    const roundabout = canvas.getActiveObject();
    const newArm = roundabout.sideRoad[roundabout.sideRoad.length - 1];
    TestTracker.register(name, newArm);

    return newArm;
  },

  /**
   * Run all roundabout tests
   */
  runAll: async function () {
    await this.testConventionalRoundabout();
    await this.testSpiralRoundabout();
  }
};

/**
 * Test suite for complex traffic sign layouts
 */
const ComplexSignTest = {
  /**
   * Create and test a complex sign with multiple borders and dividers
   */
  async testComplexSignLayout() {
    TestTracker.startTest("ComplexSignLayout");

    // ===== LEFT SIDE OF SIGN =====
    // Create first line of 2-liner on left
    const leftTopText = new TextObject({
      text: 'Central',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 1800
    });
    TestTracker.register("leftTopText", leftTopText);

    // Create second line of 2-liner on left
    const leftBottomText = new TextObject({
      text: 'District',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 2000
    });
    TestTracker.register("leftBottomText", leftBottomText);

    // Create destination text on left
    const leftDestination = new TextObject({
      text: 'Aberdeen',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2500,
      top: 2200
    });
    TestTracker.register("leftDestination", leftDestination);

    // Create stack arrow below on left
    await drawLabeledSymbol('GantryArrow', {
      x: -2400,
      y: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("leftArrow");

    // ===== RIGHT SIDE OF SIGN =====
    // Create first line of 2-liner on right
    const rightTopText = new TextObject({
      text: 'Western',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2100,
      top: 1800
    });
    TestTracker.register("rightTopText", rightTopText);

    // Create second line of 2-liner on right
    const rightBottomText = new TextObject({
      text: 'District',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2100,
      top: 2000
    });
    TestTracker.register("rightBottomText", rightBottomText);

    // Create destination text on right
    const rightDestination = new TextObject({
      text: 'Kennedy Town',
      xHeight: 200,
      font: 'TransportHeavy',
      color: 'White',
      left: -2100,
      top: 2200
    });
    TestTracker.register("rightDestination", rightDestination);

    // Create stack arrow below on right
    await drawLabeledSymbol('GantryArrow', {
      x: 0,
      y: 2500,
      xHeight: 200,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("rightArrow");

    // Get all created objects
    const leftTopObj = TestTracker.get("leftTopText");
    const leftBottomObj = TestTracker.get("leftBottomText");
    const leftDestObj = TestTracker.get("leftDestination");
    const leftArrowObj = TestTracker.get("leftArrow");

    const rightTopObj = TestTracker.get("rightTopText");
    const rightBottomObj = TestTracker.get("rightBottomText");
    const rightDestObj = TestTracker.get("rightDestination");
    const rightArrowObj = TestTracker.get("rightArrow");

    // Create a vertical gantry divider between left and right sides
    await VDividerCreate(
      [leftDestObj],
      [rightDestObj],
      null,
      null,
      { xHeight: 200, colorType: 'Blue Background' }
    );
    TestTracker.register("vDivider");

    // Create horizontal dividers between the 2-liner and destination on both sides
    await HLineCreate(
      [leftDestObj],
      [leftArrowObj],
      null,
      null,
      { xHeight: 200, colorType: 'Blue Background' }
    );
    TestTracker.register("leftHDivider");

    await HLineCreate(
      [rightDestObj],
      [rightArrowObj],
      null,
      null,
      { xHeight: 200, colorType: 'Blue Background' }
    );
    TestTracker.register("rightHDivider");

    // Create an overall border containing both sides and the dividers
    const vDivider = TestTracker.get("vDivider");
    const leftHDivider = TestTracker.get("leftHDivider");
    const rightHDivider = TestTracker.get("rightHDivider");

    const overallObject = [leftTopObj, leftBottomObj, leftArrowObj, leftDestObj, rightTopObj, rightBottomObj, rightArrowObj, rightDestObj, vDivider, leftHDivider, rightHDivider]

    const overallBorderGroup = await BorderUtilities.BorderGroupCreate(
      'stack',
      overallObject,
      overallObject,
      null,
      null,
      { xHeight: 200, borderType: 'stack', colorType: 'Blue Background' }
    );
    TestTracker.register("overallBorderGroup", overallBorderGroup);

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
      vDividerBounds.top >= overallBounds.top &&
      vDividerBounds.top + vDividerBounds.height <= overallBounds.top + overallBounds.height,
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
      leftHDivider.top < leftDestObj.top,
      "Left horizontal divider should be between 2-liner and destination"
    );

    passed = passed && TestTracker.assertTrue(
      rightHDivider.top > rightBottomObj.top + rightBottomObj.height &&
      rightHDivider.top < rightDestObj.top,
      "Right horizontal divider should be between 2-liner and destination"
    );

    // Test 5: Verify that moving the overall border moves all contained elements
    // Record initial positions
    const initialVDividerLeft = vDivider.left;
    const initialLeftTextLeft = leftTopObj.left;
    const initialRightTextLeft = rightTopObj.left;

    // Move the overall border
    overallBorderGroup.set({ left: overallBorderGroup.left + 100 });
    overallBorderGroup.setCoords();
    overallBorderGroup.updateAllCoord();

    // Check that contained elements moved with the border
    passed = passed && TestTracker.assertTrue(
      Math.abs((vDivider.left - initialVDividerLeft) - 100) < 5,
      "Vertical divider should move with overall border"
    );

    passed = passed && TestTracker.assertTrue(
      Math.abs((leftTopObj.left - initialLeftTextLeft) - 100) < 5,
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
  runAll: async function () {
    await this.testComplexSignLayout();
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
];



async function runTests(tests) {
  console.log("======== RUNNING TESTS ========\n");



  for (const test of tests) {
    await test();
  }

  // Print just the final summary
  TestTracker.printSummary();
}
window.addEventListener("load", () => {
  // Check if tests should run on start
  if (typeof GeneralSettings !== 'undefined' && GeneralSettings.runTestsOnStart) {
    runTests(testToRun);
  }
});

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
  // This is asynchronous since the exportToDXF function creates a blob and triggers a download

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