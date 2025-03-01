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

testToRun = [ VdividerTest, borderTest]

async function runTests(tests) {
    await initShape()
    for (const test of tests) {
        await test();
    }
}

runTests(testToRun)
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