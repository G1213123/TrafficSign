/* Template Signs Panel */
let FormTemplateComponent = {
  // Template gallery with predefined complex sign layouts
  templates: {
    'Basic Gantry': {
      description: 'Standard overhead gantry sign with destinations and arrows',
      thumbnail: function (color) {
        // Simple SVG representation of a gantry sign
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="110" height="70" stroke="${color}" fill="none" stroke-width="2"/>
          <line x1="60" y1="5" x2="60" y2="75" stroke="${color}" stroke-width="2"/>
          <rect x="15" y="15" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="15" y="35" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="15" y="55" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="75" y="15" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="75" y="35" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="75" y="55" width="30" height="10" stroke="${color}" fill="none" stroke-width="1"/>
        </svg>`;
      }
    },
    'Stack Sign': {
      description: 'Stacked road sign with multiple destinations',
      thumbnail: function (color) {
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="5" width="100" height="70" stroke="${color}" fill="none" stroke-width="2"/>
          <line x1="10" y1="25" x2="110" y2="25" stroke="${color}" stroke-width="2"/>
          <line x1="10" y1="50" x2="110" y2="50" stroke="${color}" stroke-width="2"/>
          <rect x="20" y="10" width="50" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="20" y="32" width="50" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="20" y="57" width="50" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="80,15 95,15 87.5,22" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="80,38 95,38 87.5,45" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="80,61 95,61 87.5,68" stroke="${color}" fill="none" stroke-width="1"/>
        </svg>`;
      }
    },
    'Roundabout Directions': {
      description: 'Sign showing directions at a roundabout',
      thumbnail: function (color) {
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="110" height="70" stroke="${color}" fill="none" stroke-width="2"/>
          <circle cx="60" cy="40" r="15" stroke="${color}" fill="none" stroke-width="1.5"/>
          <line x1="5" y1="28" x2="110" y2="28" stroke="${color}" stroke-width="1"/>
          <line x1="5" y1="52" x2="110" y2="52" stroke="${color}" stroke-width="1"/>
          <rect x="15" y="10" width="30" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="75" y="10" width="30" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="15" y="62" width="30" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="75" y="62" width="30" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <path d="M 40,40 Q 48,15 60,25" stroke="${color}" fill="none" stroke-width="1.5"/>
          <path d="M 60,55 Q 80,45 75,62" stroke="${color}" fill="none" stroke-width="1.5"/>
        </svg>`;
      }
    },
    'Interchange Directions': {
      description: 'Complex interchange direction sign with multiple destinations',
      thumbnail: function (color) {
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="110" height="70" stroke="${color}" fill="none" stroke-width="2"/>
          <line x1="60" y1="5" x2="60" y2="75" stroke="${color}" stroke-width="2"/>
          <line x1="5" y1="30" x2="60" y2="30" stroke="${color}" stroke-width="1"/>
          <line x1="60" y1="45" x2="115" y2="45" stroke="${color}" stroke-width="1"/>
          <rect x="10" y="10" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="10" y="35" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="10" y="60" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="70" y="10" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="70" y="30" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="70" y="55" width="40" height="8" stroke="${color}" fill="none" stroke-width="1"/>
          <circle cx="23" cy="20" r="3" stroke="${color}" fill="none" stroke-width="1"/>
          <circle cx="85" cy="20" r="3" stroke="${color}" fill="none" stroke-width="1"/>
        </svg>`;
      }
    },
    'Multi-Lane Exit': {
      description: 'Exit sign showing multiple lanes with directions',
      thumbnail: function (color) {
        return `<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="5" width="110" height="70" stroke="${color}" fill="none" stroke-width="2"/>
          <line x1="40" y1="5" x2="40" y2="75" stroke="${color}" stroke-width="1"/>
          <line x1="80" y1="5" x2="80" y2="75" stroke="${color}" stroke-width="1"/>
          <line x1="5" y1="40" x2="115" y2="40" stroke="${color}" stroke-width="1"/>
          <rect x="10" y="15" width="20" height="7" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="45" y="15" width="30" height="7" stroke="${color}" fill="none" stroke-width="1"/>
          <rect x="85" y="15" width="20" height="7" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="20,50 20,65 30,57.5" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="60,50 60,65 70,57.5" stroke="${color}" fill="none" stroke-width="1"/>
          <polygon points="100,57.5 90,50 110,50" stroke="${color}" fill="none" stroke-width="1"/>
        </svg>`;
      }
    }
  },

  // Currently selected template
  selectedTemplate: null,
    /**
   * Initialize the template panel
   */  templatePanelInit: function () {
    tabNum = 8;
    var parent = GeneralHandler.PanelInit();

    if (parent) {
      // Create basic parameters container
      GeneralHandler.createBasicParamsContainer(parent, FormTemplateComponent);

      // Create heading for templates
      const templateHeader = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const heading = GeneralHandler.createNode("div", { 'class': 'placeholder' }, templateHeader);
      heading.innerHTML = "Select Template";

      // Create templates grid - using FormTemplateComponent as context
      FormTemplateComponent.createTemplatesGrid(parent);
    }
  },
  /**
   * Create a grid of template thumbnails
   */  createTemplatesGrid: function (parent) {
    const color = document.getElementById('Message Colour-container').selected ?
      document.getElementById('Message Colour-container').selected.getAttribute('data-value').toLowerCase() :
      'white';

    // Create a container for the templates using the symbols-grid class for consistency
    const templatesContainer = GeneralHandler.createNode("div", { 'class': 'symbols-grid' }, parent);

    // Add each template as an SVG button that directly deploys the template
    Object.keys(this.templates).forEach(templateName => {
      const template = this.templates[templateName];

      // Create the SVG content
      const svgContent = template.thumbnail(color);

      // Create a container for the button using border-container class like in border buttons
      const buttonContainer = GeneralHandler.createNode("div", { 'class': 'border-container' }, templatesContainer);

      // Create the button using GeneralHandler's SVG button creator for consistency
      const templateBtn = GeneralHandler.createSVGButton(
        templateName,
        svgContent,
        buttonContainer,
        'border', // Use 'border' style instead of 'template'
        // Direct deployment on click - no selection step needed
        function () {
          const xHeight = parseInt(document.getElementById('input-xHeight').value);
          const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
          FormTemplateComponent.createTemplateSign(templateName, xHeight, color);
        },
        'click'
      );

      // Apply border-button class to match border button styling
      templateBtn.classList.remove('template-button');
      templateBtn.classList.add('border-button');

      // Add description tooltip
      templateBtn.title = template.description;
    });
  },

  /**
   * Select a template when its button is clicked
   */
  selectTemplate: function (event) {
    // Remove active class from all template buttons
    const templateButtons = document.querySelectorAll('.template-button');
    templateButtons.forEach(button => button.classList.remove('active'));

    // Add active class to clicked button
    event.currentTarget.classList.add('active');

    // Store selected template name
    this.selectedTemplate = event.currentTarget.id;

    console.log(`Selected template: ${this.selectedTemplate}`);
  },

  /**
   * Insert the selected template into the canvas
   */
  insertSelectedTemplate: function () {
    if (!FormTemplateComponent.selectedTemplate) {
      console.log('No template selected');
      return;
    }

    const templateName = FormTemplateComponent.selectedTemplate;
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Clear any active selection
    canvas.discardActiveObject();

    // Call the appropriate template creation function
    FormTemplateComponent.createTemplateSign(templateName, xHeight, color);
  },
  /**
   * Create a template sign based on the selected template
   */
  createTemplateSign: async function (templateName, xHeight, color) {
    console.log(`Creating template: ${templateName}, xHeight: ${xHeight}, color: ${color}`);

    const vpt = CenterCoord();
    const centerX = vpt.x;
    const centerY = vpt.y;

    switch (templateName) {
      case 'Basic Gantry':
        await this.createBasicGantry(centerX, centerY, xHeight, color);
        break;
      case 'Stack Sign':
        await this.createStackSign(centerX, centerY, xHeight, color);
        break;
      case 'Roundabout Directions':
        await this.createRoundaboutDirections(centerX, centerY, xHeight, color);
        break;
      case 'Interchange Directions':
        await this.createInterchangeDirections(centerX, centerY, xHeight, color);
        break;
      case 'Multi-Lane Exit':
        await this.createMultiLaneExit(centerX, centerY, xHeight, color);
        break;
      default:
        console.log(`Template ${templateName} not implemented`);
    }
  },
  /**
   * Create a basic overhead gantry sign
   */
  createBasicGantry: async function (centerX, centerY, xHeight, color) {
    try {
      // Create first line text objects
      const Line1English = new TextObject({
        text: 'Tai Kok Tsui(W)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY - 150
      });

      const Line1Chinese = new TextObject({
        text: '大角咀(西)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY - 50
      });

      // Create WHC symbol for first line
      await drawLabeledSymbol('WHC', {
        x: centerX + 150,
        y: centerY - 100,
        xHeight: xHeight,
        angle: 0,
        color: 'White'
      });
      const Line1Symbol = canvasObject[canvasObject.length - 1];

      // Create second line text objects
      const Line2English = new TextObject({
        text: 'Hong Kong(W)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY + 50
      });

      const Line2Chinese = new TextObject({
        text: '香港(西)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY + 150
      });

      // Create Airport symbol for second line
      await drawLabeledSymbol('Airport', {
        x: centerX + 150,
        y: centerY + 100,
        xHeight: xHeight,
        angle: 90,
        color: 'White'
      });
      const Line2Symbol = canvasObject[canvasObject.length - 1];

      // Create third line text objects
      const Line3English = new TextObject({
        text: 'Lantau',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY + 250
      });

      const Line3Chinese = new TextObject({
        text: '大嶼山',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY + 350
      });

      // Anchor text objects in pairs
      anchorShape(Line1English, Line1Chinese, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(Line1Chinese, Line2English, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(Line2English, Line2Chinese, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(Line2Chinese, Line3English, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(Line3English, Line3Chinese, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(Line2English, Line1Symbol, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: 0
      });

      anchorShape(Line3English, Line2Symbol, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: '',
        spacingY: 0
      });

      anchorShape(Line3Chinese, Line2Symbol, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: ''
      });

      // Create an overall border containing all components
      const allObjects = [
        Line1English, Line1Chinese, Line1Symbol,
        Line2English, Line2Chinese, Line2Symbol,
        Line3English, Line3Chinese,
      ];

      const borderGroup = await BorderUtilities.BorderGroupCreate(
        'flagRight',  // Changed from 'stack' to 'flag' type border
        allObjects,
        allObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'flag', colorType: 'Blue Background' }
      );

      canvas.renderAll();
      console.log('Basic Gantry template created successfully');

    } catch (error) {
      console.error('Error creating Basic Gantry template:', error);
    }
  },

  /**
   * Create a stacked road sign with multiple destinations
   */
  createStackSign: async function (centerX, centerY, xHeight, color) {
    try {
      // Create destination texts
      const topEng1 = new TextObject({
        text: 'Pok Fu Lam',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 300,
        top: centerY - 1150
      });

      const topChi1 = new TextObject({
        text: '薄扶林',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 250,
        top: centerY - 200
      });

      const topEng2 = new TextObject({
        text: 'Central',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 250,
        top: centerY - 300
      });

      const topChi2 = new TextObject({
        text: '中區',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'White',
        left: centerX - 250,
        top: centerY - 200
      });

      const midDestinationText = new TextObject({
        text: 'Cyberport',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'Black',
        left: centerX - 250,
        top: centerY
      });

      const midChineseText = new TextObject({
        text: '數碼港',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'Black',
        left: centerX - 250,
        top: centerY + 100
      });

      const botDestinationText = new TextObject({
        text: 'Wa Fu Estate',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'Black',
        left: centerX - 250,
        top: centerY + 300
      });

      const botChineseText = new TextObject({
        text: '華富邨',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'Black',
        left: centerX - 250,
        top: centerY + 400
      });

      // Create arrows
      await drawLabeledSymbol('StackArrow', {
        x: centerX + 200,
        y: centerY - 750,
        xHeight: xHeight,
        angle: 0,
        color: 'White'
      });
      const topArrow = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('StackArrow', {
        x: centerX + 200,
        y: centerY + 50,
        xHeight: xHeight,
        angle: 0,
        color: 'Black'
      });
      const midArrow = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('StackArrow', {
        x: centerX + 200,
        y: centerY + 350,
        xHeight: xHeight,
        angle: -90,
        color: 'Black'
      });
      const botArrow = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('Airport', {
        x: centerX + 200,
        y: centerY - 664,
        xHeight: xHeight,
        angle: 0,
        color: 'White'
      });
      const airport = canvasObject[canvasObject.length - 1];

      // Create horizontal dividers
      await HDividerCreate(
        [midChineseText],
        [botDestinationText],
        null,
        null,
        { xHeight: xHeight, colorType: 'White Background' }
      );
      const topDivider = canvasObject[canvasObject.length - 1];

      // Anchor text objects in pairs
      anchorShape(midDestinationText, midChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(midDestinationText, midArrow, {
        vertexIndex1: 'E3',
        vertexIndex2: 'E1',
        spacingX: -50,
        spacingY: ''
      });

      anchorShape(midArrow, botArrow, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: ''
      });

      anchorShape(botArrow, botDestinationText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: ''
      });

      anchorShape(botDestinationText, botChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(botDestinationText, airport, {
        vertexIndex1: 'E3',
        vertexIndex2: 'E3',
        spacingX: 0,
        spacingY: ''
      });

      anchorShape(airport, topEng2, {
        vertexIndex1: 'E3',
        vertexIndex2: 'E1',
        spacingX: -50,
        spacingY: 0
      });

      anchorShape(topEng2, topChi1, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: 0
      });
      anchorShape(topChi1, topEng1, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: 0
      });


      anchorShape(topEng2, topChi2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(topEng1, topArrow, {
        vertexIndex1: 'E3',
        vertexIndex2: 'E1',
        spacingX: -50,
        spacingY: ''
      });

      // Create an overall border containing all components
      const topObjects = [
        topEng1, topChi1, topEng2, topChi2, topArrow, airport
      ];
      const botObjects = [
        midDestinationText, midChineseText, midArrow,
        botDestinationText, botChineseText, botArrow,
        topDivider
      ];

      const borderGroup1 = await BorderUtilities.BorderGroupCreate(
        'stack',
        topObjects,
        topObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'stack', colorType: 'Blue Background' }
      );

      const borderGroup2 = await BorderUtilities.BorderGroupCreate(
        'stack',
        botObjects,
        botObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'stack', colorType: 'White Background' }
      );

      anchorShape(borderGroup2, midArrow, {
        vertexIndex1: 'E8',
        vertexIndex2: 'C3',
        spacingX: '',
        spacingY: 0
      });
      anchorShape(borderGroup2, botArrow, {
        vertexIndex1: 'E8',
        vertexIndex2: 'C6',
        spacingX: '',
        spacingY: 0
      });
      anchorShape(borderGroup1, topArrow, {
        vertexIndex1: 'E8',
        vertexIndex2: 'C4',
        spacingX: '',
        spacingY: 0
      });


      canvas.renderAll();
      console.log('Stack Sign template created successfully');

    } catch (error) {
      console.error('Error creating Stack Sign template:', error);
    }
  },
  /**
   * Create a roundabout directions sign
   */
  createRoundaboutDirections: async function (centerX, centerY, xHeight, color) {
    try {
      // Create roundabout symbol at center with three side roads
      // Using the same approach as in test.js for roundabout creation
      const routeOptions = {
        routeList: [
          { x: centerX, y: centerY + 5 * xHeight, angle: 180, width: 6, shape: 'Normal' },
          { x: centerX, y: centerY, angle: 0, width: 6, shape: 'Stub' }
        ],
        xHeight: xHeight,
        rootLength: 7,
        tipLength: 12,
        roadType: 'Conventional Roundabout',
        color: color
      };

      const roundabout = new MainRoadSymbol(routeOptions);
      await roundabout.initialize(calcRoundaboutVertices('Conventional', xHeight, routeOptions.routeList));

      // Create side roads at top, left, and right positions
      canvas.setActiveObject(roundabout);

      // Top side road (Tsuen Wan West Station)
      await drawSideRoadOnCursor(null, {
        x: centerX,
        y: centerY - 600,
        routeParams: {
          angle: 0,
          shape: 'Arrow',
          width: 6
        }
      });
      await finishDrawSideRoad({ e: { button: 0 } });
      const side1 = canvasObject[canvas.getActiveObject().canvasID];

      // Set the roundabout as active object to add a side road
      canvas.setActiveObject(roundabout);

      // Left side road (Sham Tseng and Tuen Mun)
      await drawSideRoadOnCursor(null, {
        x: centerX - 600,
        y: centerY,
        routeParams: {
          angle: 90,
          shape: 'Arrow',
          width: 4
        }
      });
      await finishDrawSideRoad({ e: { button: 0 } });
      const side2 = canvasObject[canvas.getActiveObject().canvasID];

      // Set the roundabout as active object to add a side road
      canvas.setActiveObject(roundabout);

      // Right side road (Tsing Yi and Kowloon)
      await drawSideRoadOnCursor(null, {
        x: centerX + 600,
        y: centerY,
        routeParams: {
          angle: -90,
          shape: 'Arrow',
          width: 4
        }
      });
      await finishDrawSideRoad({ e: { button: 0 } });
      const side3 = canvasObject[canvas.getActiveObject().canvasID];

      // Get all created side roads
      const topRoad = roundabout.sideRoad[0];
      const leftRoad = roundabout.sideRoad[1];
      const rightRoad = roundabout.sideRoad[2];

      // Create destination texts for the top side road (Tsuen Wan West Station)
      const topDestinationText1 = new TextObject({
        text: 'Tsuen Wan',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'black',
        left: centerX,
        top: centerY - 250
      })

      const topDestinationText2 = new TextObject({
        text: 'West Station',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'black',
        left: centerX,
        top: centerY - 250
      });

      const topChineseText = new TextObject({
        text: '荃灣西站',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: 'black',
        left: centerX,
        top: centerY - 170
      });

      const topDestinationText3 = new TextObject({
        text: 'Tsuen Wan(C)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX,
        top: centerY - 250
      });

      const topChineseText2 = new TextObject({
        text: '荃灣(中)',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX,
        top: centerY - 170
      });

      // Add MTR symbol for the top side road
      await drawLabeledSymbol('MTR', {
        x: centerX - 100,
        y: centerY - 200,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const topSymbol = canvasObject[canvasObject.length - 1];

      // Create destination texts for the left side road (Sham Tseng and Tuen Mun)
      const leftDestinationText1 = new TextObject({
        text: 'Sham Tseng',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX - 300,
        top: centerY - 50
      });

      const leftChineseText1 = new TextObject({
        text: '深井',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX - 300,
        top: centerY + 30
      });

      const leftDestinationText2 = new TextObject({
        text: 'Tuen Mun',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX - 300,
        top: centerY + 100
      });

      const leftChineseText2 = new TextObject({
        text: '屯門',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX - 300,
        top: centerY + 180
      });

      // Add symbol for the left side road
      await drawLabeledSymbol('Expressway', {
        x: centerX - 450,
        y: centerY + 40,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const leftSymbol1 = canvasObject[canvasObject.length - 1];
      await drawLabeledSymbol('Route4', {
        x: centerX - 450,
        y: centerY + 40,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const leftSymbol2 = canvasObject[canvasObject.length - 1];

      // Create destination texts for the right side road (Tsing Yi and Kowloon)
      const rightDestinationText1 = new TextObject({
        text: 'Tsing Yi',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX + 300,
        top: centerY - 50
      });

      const rightChineseText1 = new TextObject({
        text: '青衣',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX + 300,
        top: centerY + 30
      });

      const rightDestinationText2 = new TextObject({
        text: 'Kowloon',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX + 300,
        top: centerY + 100
      });

      const rightChineseText2 = new TextObject({
        text: '九龍',
        xHeight: xHeight,
        font: 'TransportMedium',
        color: 'white',
        left: centerX + 300,
        top: centerY + 180
      });

      // Add Airport symbol for the right side road
      await drawLabeledSymbol('Airport', {
        x: centerX + 450,
        y: centerY + 40,
        xHeight: xHeight,
        angle: 90,
        color: color
      });
      const rightSymbol1 = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('Expressway', {
        x: centerX - 450,
        y: centerY + 40,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const rightSymbol2 = canvasObject[canvasObject.length - 1];
      await drawLabeledSymbol('Route4', {
        x: centerX - 450,
        y: centerY + 40,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const rightSymbol3 = canvasObject[canvasObject.length - 1];

      // Anchor top side road objects
      anchorShape(side1, topChineseText2, {
        vertexIndex1: 'E6',
        vertexIndex2: 'V1',
        spacingX: -484.5,
        spacingY: 0
      });

      anchorShape(topChineseText2, topDestinationText3, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(topDestinationText3, topChineseText, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 62.5,
        spacingY: -37.5
      });

      const topBorderObjects = [
        topDestinationText1, topDestinationText2, topChineseText,
        topSymbol,        
      ];

      const whiteBorder = await BorderUtilities.BorderGroupCreate(
        'panel',
        topBorderObjects,
        topBorderObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'panel', colorType: 'White Background' }
      );

      anchorShape(topChineseText, topDestinationText2, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(topDestinationText2, topDestinationText1, {
        vertexIndex1: 'E7',
        vertexIndex2: 'E1',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(topDestinationText2, topSymbol, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: -145
      });

      // Anchor left side road objects
      anchorShape(side2, leftSymbol1, {
        vertexIndex1: 'E3',
        vertexIndex2: 'V7',
        spacingX: '',
        spacingY: 112.5
      });
      anchorShape(roundabout, leftSymbol1, {
        vertexIndex1: 'E3',
        vertexIndex2: 'V1',
        spacingX: -350,
        spacingY: ''
      });
      anchorShape(leftSymbol1, leftSymbol2, {
        vertexIndex1: 'E2',
        vertexIndex2: 'E6',
        spacingX: 0,
        spacingY: 35
      });
      anchorShape(leftSymbol1, leftDestinationText1, {
        vertexIndex1: 'E3',
        vertexIndex2: 'E1',
        spacingX: -50,
        spacingY: 0
      });
      anchorShape(leftDestinationText1, leftChineseText1, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });
      anchorShape(leftChineseText1, leftDestinationText2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });
      anchorShape(leftDestinationText2, leftChineseText2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      const leftBorderObjects = [
        leftDestinationText1, leftChineseText1,
        leftDestinationText2, leftChineseText2,
        leftSymbol1, leftSymbol2,   
      ];

      const greenBorder1 = await BorderUtilities.BorderGroupCreate(
        'greenPanel',
        leftBorderObjects,
        leftBorderObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'greenPanel', colorType: 'White Background' }
      );


      // Anchor right side road objects
      anchorShape(side3, rightDestinationText1, {
        vertexIndex1: 'E1',
        vertexIndex2: 'V2',
        spacingX: '',
        spacingY: 112.5
      });
      anchorShape(roundabout, rightDestinationText1, {
        vertexIndex1: 'E1',
        vertexIndex2: 'V1',
        spacingX: 500,
        spacingY: ''
      });
      anchorShape(rightDestinationText1, rightChineseText1, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });
      anchorShape(rightChineseText1, rightDestinationText2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });
      anchorShape(rightDestinationText2, rightChineseText2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });


      anchorShape(rightDestinationText1, rightSymbol1, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: 0
      });
      anchorShape(rightDestinationText2, rightSymbol2, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E3',
        spacingX: 50,
        spacingY: 0
      });
      anchorShape(rightSymbol2, rightSymbol3, {
        vertexIndex1: 'E2',
        vertexIndex2: 'E6',
        spacingX: 0,
        spacingY: 35
      });

      const rightBorderObjects = [
        rightChineseText1, rightDestinationText1,
        rightChineseText2, rightDestinationText2,
        rightSymbol1, rightSymbol2, rightSymbol3 
      ];

      const greenBorder2 = await BorderUtilities.BorderGroupCreate(
        'greenPanel',
        rightBorderObjects,
        rightBorderObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'greenPanel', colorType: 'White Background' }
      );



      // Create an overall border containing all components
      const allObjects = [
        roundabout,
        whiteBorder, greenBorder1, greenBorder2,       
      ];

      const borderGroup = await BorderUtilities.BorderGroupCreate(
        'stack',
        allObjects,
        allObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'stack', colorType: 'Blue Background' }
      );

      canvas.renderAll();
      console.log('Roundabout Directions template created successfully');

    } catch (error) {
      console.error('Error creating Roundabout Directions template:', error);
    }
  },

  /**
   * Create an interchange direction sign
   */
  createInterchangeDirections: async function (centerX, centerY, xHeight, color) {
    try {
      // Create left side text objects
      const leftTopDestinationText = new TextObject({
        text: 'Kowloon Tong',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 400,
        top: centerY - 200
      });

      const leftTopChineseText = new TextObject({
        text: '九龍塘',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 400,
        top: centerY - 120
      });

      const leftBottomDestinationText = new TextObject({
        text: 'Shatin',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 400,
        top: centerY + 100
      });

      const leftBottomChineseText = new TextObject({
        text: '沙田',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 400,
        top: centerY + 180
      });

      // Create interchange symbol
      await drawLabeledSymbol('InterchangeSymbol', {
        x: centerX,
        y: centerY,
        xHeight: xHeight * 1.5,
        angle: 0,
        color: color
      });
      const interchangeSymbol = canvasObject[canvasObject.length - 1];

      // Create right side text objects
      const rightTopDestinationText = new TextObject({
        text: 'Yuen Long',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 400,
        top: centerY - 200
      });

      const rightTopChineseText = new TextObject({
        text: '元朗',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 400,
        top: centerY - 120
      });

      const rightBottomDestinationText = new TextObject({
        text: 'Tuen Mun',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 400,
        top: centerY + 100
      });

      const rightBottomChineseText = new TextObject({
        text: '屯門',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 400,
        top: centerY + 180
      });

      // Create highway symbols
      await drawLabeledSymbol('Highway1', {
        x: centerX - 200,
        y: centerY - 160,
        xHeight: xHeight * 0.8,
        angle: 0,
        color: color
      });
      const leftHighwaySymbol = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('Highway3', {
        x: centerX + 200,
        y: centerY - 160,
        xHeight: xHeight * 0.8,
        angle: 0,
        color: color
      });
      const rightHighwaySymbol = canvasObject[canvasObject.length - 1];

      // Create dividers
      await VDividerCreate(
        [leftTopDestinationText],
        [rightTopDestinationText],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const vDivider = canvasObject[canvasObject.length - 1];

      await HDividerCreate(
        [leftTopChineseText],
        [leftBottomDestinationText],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const leftHDivider = canvasObject[canvasObject.length - 1];

      await HDividerCreate(
        [rightTopChineseText],
        [rightBottomDestinationText],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const rightHDivider = canvasObject[canvasObject.length - 1];

      // Anchor text objects in pairs
      anchorShape(leftTopDestinationText, leftTopChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(leftBottomDestinationText, leftBottomChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(rightTopDestinationText, rightTopChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(rightBottomDestinationText, rightBottomChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      // Create an overall border containing all components
      const allObjects = [
        leftTopDestinationText, leftTopChineseText,
        leftBottomDestinationText, leftBottomChineseText,
        rightTopDestinationText, rightTopChineseText,
        rightBottomDestinationText, rightBottomChineseText,
        interchangeSymbol, leftHighwaySymbol, rightHighwaySymbol,
        vDivider, leftHDivider, rightHDivider
      ];

      const borderGroup = await BorderUtilities.BorderGroupCreate(
        'stack',
        allObjects,
        allObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'stack', colorType: 'Blue Background' }
      );

      canvas.renderAll();
      console.log('Interchange Directions template created successfully');

    } catch (error) {
      console.error('Error creating Interchange Directions template:', error);
    }
  },

  /**
   * Create a multi-lane exit sign
   */
  createMultiLaneExit: async function (centerX, centerY, xHeight, color) {
    try {
      // Create lane text objects
      const leftLaneText = new TextObject({
        text: 'Sheung Wan',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 300,
        top: centerY - 200
      });

      const leftChineseText = new TextObject({
        text: '上環',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX - 300,
        top: centerY - 120
      });

      const middleLaneText = new TextObject({
        text: 'Central',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX,
        top: centerY - 200
      });

      const middleChineseText = new TextObject({
        text: '中環',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX,
        top: centerY - 120
      });

      const rightLaneText = new TextObject({
        text: 'Wan Chai',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 300,
        top: centerY - 200
      });

      const rightChineseText = new TextObject({
        text: '灣仔',
        xHeight: xHeight,
        font: 'TransportHeavy',
        color: color,
        left: centerX + 300,
        top: centerY - 120
      });

      // Create arrows for each lane
      await drawLabeledSymbol('StackArrow', {
        x: centerX - 300,
        y: centerY + 100,
        xHeight: xHeight,
        angle: -45,
        color: color
      });
      const leftArrow = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('StackArrow', {
        x: centerX,
        y: centerY + 100,
        xHeight: xHeight,
        angle: 0,
        color: color
      });
      const middleArrow = canvasObject[canvasObject.length - 1];

      await drawLabeledSymbol('StackArrow', {
        x: centerX + 300,
        y: centerY + 100,
        xHeight: xHeight,
        angle: 45,
        color: color
      });
      const rightArrow = canvasObject[canvasObject.length - 1];

      // Create lane dividers
      await VLaneCreate(
        [leftLaneText],
        [middleLaneText],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const leftLaneDivider = canvasObject[canvasObject.length - 1];

      await VLaneCreate(
        [middleLaneText],
        [rightLaneText],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const rightLaneDivider = canvasObject[canvasObject.length - 1];

      // Create horizontal divider
      await HDividerCreate(
        [leftChineseText, middleChineseText, rightChineseText],
        [leftArrow, middleArrow, rightArrow],
        null,
        null,
        { xHeight: xHeight, colorType: 'Blue Background' }
      );
      const hDivider = canvasObject[canvasObject.length - 1];

      // Anchor text objects in pairs
      anchorShape(leftLaneText, leftChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(middleLaneText, middleChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      anchorShape(rightLaneText, rightChineseText, {
        vertexIndex1: 'E1',
        vertexIndex2: 'E7',
        spacingX: 0,
        spacingY: 0
      });

      // Create an overall border containing all components
      const allObjects = [
        leftLaneText, leftChineseText, leftArrow,
        middleLaneText, middleChineseText, middleArrow,
        rightLaneText, rightChineseText, rightArrow,
        leftLaneDivider, rightLaneDivider, hDivider
      ];

      const borderGroup = await BorderUtilities.BorderGroupCreate(
        'stack',
        allObjects,
        allObjects,
        null,
        null,
        { xHeight: xHeight, borderType: 'stack', colorType: 'Blue Background' }
      );

      canvas.renderAll();
      console.log('Multi-Lane Exit template created successfully');

    } catch (error) {
      console.error('Error creating Multi-Lane Exit template:', error);
    }
  }
};

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(8, function (setting, value) {
    // Template-specific updates when settings change
    if (setting === 'messageColor') {
      // Redraw the templates grid with the new color
      const parent = document.getElementById('input-form');
      if (parent) {
        const templatesGrid = parent.querySelector('.templates-grid');
        if (templatesGrid) {
          templatesGrid.remove();
          FormTemplateComponent.createTemplatesGrid(parent);
        }
      }
    }
  })
);
