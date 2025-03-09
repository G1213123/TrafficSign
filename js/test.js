let HdividerTest = async function () {
  above = [canvasObject[1]]
  below = [canvasObject[5]]

  await FormBorderWrapComponent.HDividerCreate(above, below, { xHeight: 100 })
}

let VdividerTest = async function () {
  above = [canvasObject[1]]
  below = [canvasObject[5]]

  await FormBorderWrapComponent.VDividerCreate(above, below, { xHeight: 100 })
}


let equalAnchorTest = function () {
  const anchor = {
    sourcePoint: 'E1', targetPoint: 'E1', sourceObject: canvasObject[4], TargetObject: canvasObject[5],
    secondSourcePoint: 'E3', secondTargetPoint: 'E3', secondSourceObject: canvasObject[4], secondTargetObject: canvasObject[5]
  }
  EQanchorShape('x', anchor)
}

let movingObjectTest = function () {
  canvas.setActiveObject(canvasObject[0])
  const specimen = canvas.getActiveObject()
  const left = specimen.getEffectiveCoords()[0].x
  const top = specimen.getEffectiveCoords()[0].y
  specimen.set({ left: left + 100, top: top + 100 })
  specimen.setCoords()
  //console.assert(specimen.getEffectiveCoords()[0].x == left + 100, 'Moving failed');
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

    // Create text object - Hong Kong in English
    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -1050,
      top: -1000,
      text: 'Hong Kong',
      xHeight: 100,
      font: 'TransportMedium'
    });
    TestTracker.register("englishText");

    // Create Chinese text
    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -1050,
      top: -800,
      text: '香港',
      xHeight: 100
    });
    TestTracker.register("chineseText");

    // Create symbol
    await drawLabeledSymbol('StackArrow', {
      x: -1500,
      y: -800,
      length: 25,
      angle: -90,
      color: 'white'
    });
    TestTracker.register("symbol");

    // Test assertions
    let passed = true;

    // Check English text using tracker
    const englishText = TestTracker.get("englishText");
    const englishTextV1 = englishText.getBasePolygonVertex('E1');
    passed = passed && englishText.functionalType === 'Text' && TestTracker.trackLine();
    passed = passed && TestTracker.assert(englishTextV1.x, -1050, "English text left position incorrect", 5);
    passed = passed && TestTracker.assert(englishTextV1.y, -1000, "English text top position incorrect", 5);

    // Check Chinese text using tracker
    const chineseText = TestTracker.get("chineseText");
    const chineseTextV1 = chineseText.getBasePolygonVertex('E1');
    passed = passed && chineseText.functionalType === 'Text';
    passed = passed && TestTracker.assert(chineseTextV1.x, -1050, "Chinese text left position incorrect", 5);
    passed = passed && TestTracker.assert(chineseTextV1.y, -800, "Chinese text top position incorrect", 5);

    // Check symbol using tracker
    const symbol = TestTracker.get("symbol");
    const symbolV1 = symbol.getBasePolygonVertex('V1');
    passed = passed && symbol.functionalType === 'Symbol';
    passed = passed && TestTracker.assert(symbolV1.x, -1500, "Symbol left position incorrect", 5);
    passed = passed && TestTracker.assert(symbolV1.y, -800, "Symbol top position incorrect", 5);

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

    // Create three symbols to anchor together
    // First symbol (base)
    await drawLabeledSymbol('Tunnel', {
      x: 300,
      y: -1000,
      length: 25,
      color: 'white'
    });
    TestTracker.register("baseTunnel");

    // Second symbol (to right)
    await drawLabeledSymbol('Airport', {
      x: 400,
      y: -400,
      length: 25,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("Airport");

    // Third symbol (below)
    await drawLabeledSymbol('Hospital', {
      x: 300,
      y: -300,
      length: 25,
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
    await drawLabeledSymbol('Tunnel', {
      x: 300,
      y: -1000,
      length: 25,
      color: 'white'
    });
    TestTracker.register("baseTunnel1");

    await drawLabeledSymbol('Airport', {
      x: 400,
      y: -1000,
      length: 25,
      angle: 0,
      color: 'white'
    });
    TestTracker.register("airport1");

    // Second pair
    await drawLabeledSymbol('Hospital', {
      x: 300,
      y: -800,
      length: 25,
      color: 'white'
    });
    TestTracker.register("baseHospital");

    await drawLabeledSymbol('StackArrow', {
      x: 400,
      y: -800,
      length: 25,
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
    TestTracker.testSections[TestTracker.currentTest].objects["stackArrow"]-=1;

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

    // Create some text objects for the border
    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -1500,
      top: 300,
      text: 'Border',
      xHeight: 100,
      font: 'TransportMedium'
    });
    TestTracker.register("borderText1");

    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -1500,
      top: 500,
      text: 'Test',
      xHeight: 100,
      font: 'TransportMedium'
    });
    TestTracker.register("borderText2");

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
    const borderGroup = await FormBorderWrapComponent.BorderGroupCreate(
      [object1, object2],
      [object1, object2],
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

    // Create two text objects for the border with divider between them
    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -500,
      top: 300,
      text: 'Above',
      xHeight: 100,
      font: 'TransportMedium'
    });
    TestTracker.register("aboveText");

    await FormTextAddComponent.TextOnMouseClick(null, {
      left: -500,
      top: 450,
      text: 'Below',
      xHeight: 100,
      font: 'TransportMedium'
    });
    TestTracker.register("belowText");

    const aboveObject = TestTracker.get("aboveText");
    const belowObject = TestTracker.get("belowText");

    // Create horizontal divider between objects
    await FormBorderWrapComponent.HDividerCreate(
      [aboveObject],
      [belowObject],
      { xHeight: 100 }
    );
    TestTracker.register("divider");

    const divider = TestTracker.get("divider");

    // Create border around all three objects
    const borderGroup = await FormBorderWrapComponent.BorderGroupCreate(
      [aboveObject, belowObject, divider],
      [aboveObject, belowObject, divider],
      { xHeight: 100, borderType: 'stack', colorType: 'Blue Background' }
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
      'Blue Background',
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
   * Test creation of a root route using route.js drawing functions
   */
  async testRootRoute() {
    TestTracker.startTest("RootRoute");

    // Set up test parameters
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      posx: 800,
      posy: 300
    };

    // Create a MainRoute directly
    const routeOptions = {
      routeList: [
        { x: params.posx, y: params.posy + (params.rootLength + params.tipLength) * params.xHeight / 4, angle: 180, width: 6, shape: 'Butt' },
        { x: params.posx, y: params.posy, angle: 0, width: 6, shape: 'Arrow' }
      ],
      xHeight: params.xHeight,
      rootLength: params.rootLength,
      tipLength: params.tipLength
    };

    const routeMap = new MainRoute(routeOptions);
    await routeMap.initialize(calcRootVertices(params.xHeight, routeOptions.routeList));
    TestTracker.register("rootRoute", routeMap);

    // Test assertions using TestTracker
    let passed = true;

    passed = passed && TestTracker.assert(
      routeMap.left,
      params.posx - 3 * params.xHeight / 4,
      "Route left position incorrect",
      5
    );

    passed = passed && TestTracker.assert(
      routeMap.top,
      params.posy,
      "Route top position incorrect",
      5
    );

    passed = passed && TestTracker.assert(
      routeMap.functionalType,
      'MainRoute',
      "Route has incorrect functional type"
    );

    TestTracker.endTest(passed);
    return routeMap;
  },

  /**
   * Test creation of a branch route on the left side using route.js drawing functions
   */
  async testLeftBranch() {
    TestTracker.startTest("LeftBranch");

    // Get root route from TestTracker instead of window global
    const rootRoute = TestTracker.get("rootRoute", "RootRoute");
    if (!rootRoute) {
      TestTracker.recordFailure("Root route not found", "MainRoute object", "null");
      TestTracker.endTest(false);
      return null;
    }

    // Set up test parameters
    const posx = rootRoute.left - 300; // Left of root
    const posy = rootRoute.top + 600;
    const params = {
      xHeight: rootRoute.xHeight,
      angle: 90,
      shape: 'Butt',
      width: 4
    };

    // Set the root route as active object
    canvas.setActiveObject(rootRoute);

    // Use actual drawing functions with parameters
    await drawBranchRouteOnCursor(null, {
      x: posx,
      y: posy,
      routeParams: params
    });

    // Simulate cursor position
    cursor.left = posx;
    cursor.top = posy;

    // Create the branch with a simulated mouse click
    await finishDrawBranchRoute({ e: { button: 0 } });

    // Find the created branch route and register it
    const branchRoute = rootRoute.branchRoute[rootRoute.branchRoute.length - 1];
    TestTracker.register("leftBranch", branchRoute);

    // Test assertions
    let passed = true;
    passed = passed && TestTracker.assert(
      branchRoute.functionalType,
      'BranchRoute',
      "Branch has incorrect type"
    );
    passed = passed && TestTracker.assert(
      branchRoute.side,
      true,
      "Branch should be on left side"
    );

    // Check vertices touching root
    const rootLeft = rootRoute.routeList[0].x - rootRoute.routeList[0].width * rootRoute.xHeight / 8;

    // Find connecting vertices
    const touchingVertices = branchRoute.basePolygon.vertex.filter(v =>
      v.label === 'V3' || v.label === 'V4' || v.label === 'V5' || v.label === 'V6'
    );

    // At least one vertex should be close to root route
    const touchingRoot = touchingVertices.some(v =>
      Math.abs(v.x - rootLeft) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot,
      "Left branch vertices don't touch root route"
    );

    TestTracker.endTest(passed);
    return branchRoute;
  },

  /**
   * Test creation of a branch route on the right side using route.js drawing functions
   */
  async testRightBranch() {
    TestTracker.startTest("RightBranch");

    // Get root route from TestTracker
    const rootRoute = TestTracker.get("rootRoute", "RootRoute");
    if (!rootRoute) {
      TestTracker.recordFailure("Root route not found", "MainRoute object", "null");
      TestTracker.endTest(false);
      return null;
    }

    // Set up test parameters - intentionally position outside constraints
    // 1. Too close to root horizontally (should be pushed right)
    // 2. Too high vertically (should be pushed down)
    const posx = rootRoute.left + rootRoute.width + 10; // Too close horizontally
    const posy = rootRoute.top - 100; // Too high vertically
    const params = {
      xHeight: rootRoute.xHeight,
      angle: -60, // Negative angle for right side
      shape: 'Arrow',
      width: 4
    };

    // Set the root route as active object
    canvas.setActiveObject(rootRoute);

    // Use actual drawing functions with parameters
    await drawBranchRouteOnCursor(null, {
      x: posx,
      y: posy,
      routeParams: params
    });

    // Simulate cursor position
    cursor.left = posx;
    cursor.top = posy;

    // Create the branch with a simulated mouse click
    await finishDrawBranchRoute({ e: { button: 0 } });

    // Find the right branch using position - more reliable than using TestTracker.get("leftBranch")
    // A right branch will have its x position to the right of the root route center
    const rootCenterX = rootRoute.left + rootRoute.width / 2;
    const branchRoute = rootRoute.branchRoute.find(branch => branch.left > rootCenterX);

    // Register the right branch route with TestTracker
    TestTracker.register("rightBranch", branchRoute);

    // Test assertions
    let passed = true;
    passed = passed && TestTracker.assert(
      branchRoute.functionalType,
      'BranchRoute',
      "Branch has incorrect type"
    );
    passed = passed && TestTracker.assert(
      branchRoute.side,
      false,
      "Branch should be on right side"
    );

    // Check vertices touching root
    const rootRight = rootRoute.routeList[0].x + rootRoute.routeList[0].width * rootRoute.xHeight / 8;

    // Find connecting vertices
    const touchingVertices = branchRoute.basePolygon.vertex.filter(v =>
      v.label === 'V0' || v.label === 'V1' || v.label === 'V5' || v.label === 'V6'
    );

    // At least one vertex should be close to root route
    const touchingRoot = touchingVertices.some(v =>
      Math.abs(v.x - rootRight) < 1
    );

    passed = passed && TestTracker.assertTrue(
      touchingRoot,
      "Right branch vertices don't touch root route"
    );

    // CONSTRAINT TESTS:
    // 1. Test horizontal constraint - branch should be pushed to minimum distance from root
    const minHorizontalDistance = 13 * rootRoute.xHeight / 4;
    const expectedLeftPosition = rootRight + minHorizontalDistance;

    passed = passed && TestTracker.assert(
      branchRoute.left + branchRoute.width,
      expectedLeftPosition,
      "Branch not correctly positioned horizontally - constraint failed",
      5
    );

    // 2. Test vertical constraint - branch should not be above root route's tip
    const rootTop = rootRoute.routeList[1].y;
    const tipLength = rootRoute.tipLength * rootRoute.xHeight / 4;
    const minTopPosition = rootTop + tipLength;

    // Get the top-most part of the branch
    const branchTopVertices = branchRoute.basePolygon.vertex.filter(v =>
      v.label === 'V2');
    const branchTopY = Math.min(...branchTopVertices.map(v => v.y));

    passed = passed && TestTracker.assertTrue(
      branchTopY >= minTopPosition,
      `Branch top (${branchTopY}) should not be above root tip position (${minTopPosition})`
    );

    TestTracker.endTest(passed);
    return branchRoute;
  },

  /**
   * Test branch route movement constraints
   */
  async testBranchRouteMovement() {
    TestTracker.startTest("BranchRouteMovement");

    // Get left branch from TestTracker
    const leftBranch = TestTracker.get("leftBranch", "LeftBranch");
    if (!leftBranch) {
      TestTracker.recordFailure("Left branch not found", "BranchRoute object", "null");
      TestTracker.endTest(false);
      return false;
    }

    const rootRoute = leftBranch.rootRoute;
    const originalX = leftBranch.left;

    // Try to move branch too close to root
    leftBranch.left = rootRoute.left - 10; // Too close
    await leftBranch.branchRouteOnMove();

    // Should have been constrained
    const minDistance = 13 * leftBranch.xHeight / 4;
    const rootLeft = rootRoute.routeList[0].x - rootRoute.routeList[0].width * rootRoute.xHeight / 8;
    const expected = rootLeft - minDistance;

    const passed = TestTracker.assert(
      leftBranch.left,
      expected,
      "Branch route not properly constrained from root",
      5
    );

    TestTracker.endTest(passed);
    return passed;
  },

  /**
   * Run all route tests
   */
  runAll: async function () {
    await this.testRootRoute();
    await this.testLeftBranch();
    await this.testRightBranch();
    await this.testBranchRouteMovement();
  }
};

// Update testToRun to include all test suites in order
testToRun = [
  ShapeTest.runAll.bind(ShapeTest),
  AnchorTest.runAll.bind(AnchorTest),
  RouteTest.runAll.bind(RouteTest),
  BorderTest.runAll.bind(BorderTest),
];

async function runTests(tests) {
  console.log("======== RUNNING TESTS ========\n");

  for (const test of tests) {
    await test();
  }

  // Print just the final summary
  TestTracker.printSummary();
}

runTests(testToRun)