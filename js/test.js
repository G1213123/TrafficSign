let borderTest = function () {
    canvas.setActiveObject(canvasObject[0])
    FormBorderWrapComponent.BorderPanelInit()
    borderGroup = new fabric.Group()
    xheight = 100
    borderType = FormBorderWrapComponent.BorderType["Blue Background"]
    widthObjects = canvas.getActiveObjects()
    heightObjects = canvas.getActiveObjects()

FormBorderWrapComponent.BorderGroupCreate(heightObjects, widthObjects, xheight, borderType)
}

let loopAnchoredObjectsTest = function () {
    result = loopAnchoredObjects(canvasObject, console.log)
    console.log(result)
}

let anchorTest = function () {
    anchorShape([canvasObject[1]], canvasObject[0], {
        vertexIndex1: 'E2',
        vertexIndex2: 'E2',
        spacingX: -200,
        spacingY: NaN
    })
}

async function initShape() {
    /*routeMap = new fabric.Group()
    var base = LoadShape("base", { scaleY: (31 / 2 + 21.92 + 2.828 + 12 + 10) / 31, top: -(31 / 2 + 21.92 + 2.828 + 12 + 10) }, routeMap)
    var arm = LoadShape("base", { left: -21.92, top: -(31 / 2 + 21.92), scaleX: 4 / 6, angle: -45 }, routeMap)
    canvas.add(routeMap)*/
    //text1 = new fabric.Textbox("Central", {
    //    fontFamily: 'TransportMedium',
    //    fill: '#ffffff',
    //    fontSize: 200
    //})
    //text1.vertex = Object.values(text1.aCoords).map((point, i) => {
    //  return { x: point.x, y: point.y, label: `E${i + 1}` }
    //})
    //text1.insertPoint = text1.vertex[0]

    
        FormTextAddComponent.textPanelInit()
        FormTextAddComponent.TextinputHandler(null,{text:'Hong Kong', xHeight: 100})
        FormTextAddComponent.TextonMouseClick(null,{left: 300, top: 300})

        FormTextAddComponent.textPanelInit()
        FormTextAddComponent.TextinputHandler(null,{text:'香港', xHeight: 100})
        FormTextAddComponent.TextonMouseClick(null,{left: 250, top: 250})


    const arrowOptions1 = { x: 100, y: 100, length: 25, angle: 0, color: 'white', };
    const arrowOptions2 = { x: 200, y: 200, length: 25, angle: 0, color: 'white' };
    Polygon1 = drawLabeledArrow(calcSymbol('Tunnel', 25), arrowOptions1);
    Polygon2 = drawLabeledArrow(calcSymbol('StackArrow', 25), arrowOptions2);
}


testToRun = [initShape,   ]

async function runTests(tests) {
    for (const test of tests) {
      await test();
    }
  }

  runTests(testToRun).then(() => {
    console.log('All tests completed');
  });
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