let borderTest = function () {
    widthObjects = canvasObject
    heightObjects = canvasObject

    FormBorderWrapComponent.BorderGroupCreate(heightObjects, widthObjects, { xHeight: 100, borderType: 'stack', colorType: 'Blue Background' })
}

let HdividerTest = async function () {
    above = [canvasObject[1]]
      below = [canvasObject[5]]
  
      await FormBorderWrapComponent.HDividerCreate(above, below, {xHeight:100})
  }

let VdividerTest = async function () {
    above = [canvasObject[1]]
      below = [canvasObject[5]]
  
      await FormBorderWrapComponent.VDividerCreate(above, below, {xHeight:100})
  }

let loopAnchoredObjectsTest = function () {
    result = loopAnchoredObjects(canvasObject, console.log)
    console.log(result)
}

let anchorTest = function () {
    anchorShape(canvasObject[0], canvasObject[1], {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
    })
    anchorShape(canvasObject[2], canvasObject[0], {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: ''
    })
    anchorShape(canvasObject[0], canvasObject[3], {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: 0
    })

    anchorShape(canvasObject[5], canvasObject[6], {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
    })
    anchorShape(canvasObject[4], canvasObject[5], {
        vertexIndex1: 'E3',
        vertexIndex2: 'E1',
        spacingX: -50,
        spacingY: ''
    })
}

let equalAnchorTest = function () {
    const anchor = {
        sourcePoint: 'E1', targetPoint: 'E1', sourceObject: canvasObject[4], TargetObject: canvasObject[5],
        secondSourcePoint: 'E3', secondTargetPoint: 'E3', secondSourceObject: canvasObject[4], secondTargetObject: canvasObject[5]
    }
    EQanchorShape('x', anchor)
}

let initShape = async function () {

    await FormTextAddComponent.TextonMouseClick(null, { left: -550, top: -500, text: 'Hong Kong', xHeight: 100, font:'TransportMedium' })

    await FormTextAddComponent.TextonMouseClick(null, { left: 250, top: 250, text: '香港', xHeight: 100 })

    Polygon1 = await drawLabeledSymbol('StackArrow',
        { x: -450, y: 250, length: 25, angle: -90, color: 'white', });
    Polygon2 = await drawLabeledSymbol( 'Tunnel',
        { x: 0, y: 0, length: 25, angle: 0, color: 'white', });
    Polygon2 = await drawLabeledSymbol( 'StackArrow',
        { x: 1038, y: 800, length: 25, angle: 90, color: 'white', });

    await FormTextAddComponent.TextonMouseClick(null, { left: 300, top: 300, text: 'Kowloon', xHeight: 100, font:'TransportMedium' })

    await FormTextAddComponent.TextonMouseClick(null, { left: 250, top: 250, text: '九龍', xHeight: 100 })

    //Polygon3 = drawLabeledBorder('stack', 100, {left:0, top: 0, right:1550, bottom:500}, "Blue Background")
    //console.log(canvasObject)
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
 * Test suite for route.js functionality
 */
const RouteTest = {
  /**
   * Helper: Assert that values are close enough
   */
  assertAlmostEqual(actual, expected, message = "", tolerance = 1) {
    if (Math.abs(actual - expected) > tolerance) {
      console.error(`${message || "Assertion failed"}: Expected ~${expected}, got ${actual}`);
      return false;
    }
    return true;
  },

  /**
   * Helper: Assert two vertices are touching
   */
  assertVertexTouching(vertex1, vertex2, message = "", tolerance = 1) {
    const distance = Math.sqrt(
      Math.pow(vertex1.x - vertex2.x, 2) + 
      Math.pow(vertex1.y - vertex2.y, 2)
    );
    if (distance > tolerance) {
      console.error(`${message || "Vertices not touching"}: Distance=${distance.toFixed(2)}`);
      return false;
    }
    return true;
  },


  /**
   * Test creation of a root route using route.js drawing functions
   */
  async testRootRoute() {
    console.log("Testing root route drawing...");
    // Clear canvas for test
    canvasObject.forEach(obj =>obj.deleteObject());
    canvasObject = [];
    
    // Set up test parameters
    const params = {
      xHeight: 100,
      rootLength: 7,
      tipLength: 12,
      posx: 500,
      posy: 300
    };
    
    // Use the actual drawing functions with parameters
    await drawRootRouteOnCursor(null, params);
    await finishDrawRootRoute(null, { 
      left: params.posx, 
      top: params.posy 
    });
    
    // Get the created route from canvasObject
    const routeMap = canvasObject[0];
    
    // Test assertions
    let passed = true;
    passed = passed && this.assertAlmostEqual(routeMap.left, params.posx - 3 * params.xHeight / 4, "Route left position incorrect");
    passed = passed && this.assertAlmostEqual(routeMap.top, params.posy, "Route top position incorrect");
    passed = passed && routeMap.functionalType === 'MainRoute';
    
    // Store for branch tests
    window.testRootRoute = routeMap;
    
    console.log(passed ? "✓ Root route test passed!" : "✗ Root route test failed!");
    return routeMap;
  },

  /**
   * Test creation of a branch route on the left side using route.js drawing functions
   */
  async testLeftBranch() {
    console.log("Testing branch route (left side)...");
    
    const rootRoute = canvasObject[0];
    if (!rootRoute) {
      console.error("Root route not found! Run testRootRoute first.");
      return null;
    }
    
    // Set up test parameters
    const posx = rootRoute.left - 300; // Left of root
    const posy = rootRoute.top + 300;
    const params = {
      xHeight: rootRoute.xHeight,
      angle: 60,
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
    
    // Get the created branch route (should be the most recently selected object)
    const branchRoute = canvasObject[1];
    
    // Test assertions
    let passed = true;
    passed = passed && branchRoute.functionalType === 'BranchRoute';
    passed = passed && branchRoute.side === true; // Left side
    
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
    
    passed = passed && touchingRoot;
    if (!touchingRoot) {
      console.error("Left branch vertices don't touch root route");
    }
    
    window.testLeftBranch = branchRoute;
    console.log(passed ? "✓ Left branch test passed!" : "✗ Left branch test failed!");
    return branchRoute;
  },

  /**
   * Test creation of a branch route on the right side using route.js drawing functions
   */
  async testRightBranch() {
    console.log("Testing branch route (right side)...");
    
    const rootRoute = canvasObject[0];
    if (!rootRoute) {
      console.error("Root route not found! Run testRootRoute first.");
      return null;
    }
    
    // Set up test parameters
    const posx = rootRoute.left + rootRoute.width + 300; // Right of root
    const posy = rootRoute.top + 300;
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
    
    // Get the created branch route
    const branchRoute = canvasObject[2];
    
    // Test assertions
    let passed = true;
    passed = passed && branchRoute.functionalType === 'BranchRoute';
    passed = passed && branchRoute.side === false; // Right side
    
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
    
    passed = passed && touchingRoot;
    if (!touchingRoot) {
      console.error("Right branch vertices don't touch root route");
    }
    
    window.testRightBranch = branchRoute;
    console.log(passed ? "✓ Right branch test passed!" : "✗ Right branch test failed!");
    return branchRoute;
  },
  
  /**
   * Test branch route movement constraints
   */
  async testBranchRouteMovement() {
    console.log("Testing branch route movement constraints...");
    
    const leftBranch = window.testLeftBranch;
    if (!leftBranch) {
      console.error("Left branch not found! Run testLeftBranch first.");
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
    
    const passed = this.assertAlmostEqual(
      leftBranch.left,
      expected,
      "Branch route not properly constrained from root",
      5
    );
    
    console.log(passed ? "✓ Branch movement test passed!" : "✗ Branch movement test failed!");
    return passed;
  },

  /**
   * Run all route tests
   */
  runAll: async function() {
    console.log("Running all route tests...");
    await this.testRootRoute();
    await this.testLeftBranch();
    await this.testRightBranch();
    await this.testBranchRouteMovement();
    console.log("Route tests complete!");
  }
};

// Update testToRun to include RouteTest
testToRun = [initShape, RouteTest.runAll.bind(RouteTest)]; // Replace with your actual test list

async function runTests(tests) {
    await initShape()
    for (const test of tests) {
        await test();
    }
}

runTests(testToRun)