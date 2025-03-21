/**
 * TextObject extends BaseGroup to create text with proper vertex handling
 */

const textWidthMedium = [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 136, shortWidth: 0 }, { char: 'B', width: 147, shortWidth: 0 }, { char: 'C', width: 148, shortWidth: 0 }, { char: 'D', width: 154, shortWidth: 0 }, { char: 'E', width: 132, shortWidth: 0 }, { char: 'F', width: 119, shortWidth: 0 }, { char: 'G', width: 155, shortWidth: 0 }, { char: 'H', width: 160, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 93, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 107, shortWidth: 0 }, { char: 'M', width: 184, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 156, shortWidth: 0 }, { char: 'P', width: 130, shortWidth: 0 }, { char: 'Q', width: 158, shortWidth: 0 }, { char: 'R', width: 141, shortWidth: 0 }, { char: 'S', width: 137, shortWidth: 0 }, { char: 'T', width: 109, shortWidth: 105 }, { char: 'U', width: 154, shortWidth: 0 }, { char: 'V', width: 130, shortWidth: 120 }, { char: 'W', width: 183, shortWidth: 189 }, { char: 'X', width: 128, shortWidth: 0 }, { char: 'Y', width: 123, shortWidth: 118 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 103, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 109, shortWidth: 102 }, { char: 'f', width: 75, shortWidth: 0 }, { char: 'g', width: 114, shortWidth: 107 }, { char: 'h', width: 112, shortWidth: 0 }, { char: 'i', width: 54, shortWidth: 0 }, { char: 'j', width: 58, shortWidth: 0 }, { char: 'k', width: 108, shortWidth: 0 }, { char: 'l', width: 62, shortWidth: 0 }, { char: 'm', width: 164, shortWidth: 0 }, { char: 'n', width: 112, shortWidth: 0 }, { char: 'o', width: 118, shortWidth: 111 }, { char: 'p', width: 118, shortWidth: 0 }, { char: 'q', width: 118, shortWidth: 0 }, { char: 'r', width: 73, shortWidth: 59 }, { char: 's', width: 97, shortWidth: 95 }, { char: 't', width: 81, shortWidth: 0 }, { char: 'u', width: 115, shortWidth: 101 }, { char: 'v', width: 98, shortWidth: 0 }, { char: 'w', width: 147, shortWidth: 145 }, { char: 'x', width: 104, shortWidth: 0 }, { char: 'y', width: 98, shortWidth: 96 }, { char: 'z', width: 97, shortWidth: 0 }, { char: '1', width: 78, shortWidth: 0 }, { char: '2', width: 120, shortWidth: 0 }, { char: '3', width: 127, shortWidth: 0 }, { char: '4', width: 132, shortWidth: 0 }, { char: '5', width: 122, shortWidth: 0 }, { char: '6', width: 126, shortWidth: 0 }, { char: '7', width: 104, shortWidth: 0 }, { char: '8', width: 130, shortWidth: 0 }, { char: '9', width: 128, shortWidth: 0 }, { char: '0', width: 133, shortWidth: 0 }, { char: ',', width: 53, shortWidth: 0 }, { char: '.', width: 53, shortWidth: 0 }, { char: "'", width: 39, shortWidth: 0 }, { char: ':', width: 53, shortWidth: 0 }, { char: '•', width: 53, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 66, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 105, shortWidth: 0 }, { char: ')', width: 105, shortWidth: 0 }, { char: '/', width: 85, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }]
const textWidthHeavy = [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 142, shortWidth: 0 }, { char: 'B', width: 146, shortWidth: 0 }, { char: 'C', width: 151, shortWidth: 0 }, { char: 'D', width: 150, shortWidth: 0 }, { char: 'E', width: 136, shortWidth: 0 }, { char: 'F', width: 121, shortWidth: 0 }, { char: 'G', width: 156, shortWidth: 0 }, { char: 'H', width: 159, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 95, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 118, shortWidth: 0 }, { char: 'M', width: 186, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 158, shortWidth: 0 }, { char: 'P', width: 134, shortWidth: 0 }, { char: 'Q', width: 161, shortWidth: 0 }, { char: 'R', width: 148, shortWidth: 0 }, { char: 'S', width: 146, shortWidth: 0 }, { char: 'T', width: 118, shortWidth: 113 }, { char: 'U', width: 157, shortWidth: 0 }, { char: 'V', width: 133, shortWidth: 127 }, { char: 'W', width: 193, shortWidth: 196 }, { char: 'X', width: 130, shortWidth: 0 }, { char: 'Y', width: 128, shortWidth: 125 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 107, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 110, shortWidth: 103 }, { char: 'f', width: 79, shortWidth: 0 }, { char: 'g', width: 117, shortWidth: 110 }, { char: 'h', width: 119, shortWidth: 0 }, { char: 'i', width: 55, shortWidth: 0 }, { char: 'j', width: 71, shortWidth: 0 }, { char: 'k', width: 114, shortWidth: 0 }, { char: 'l', width: 63, shortWidth: 0 }, { char: 'm', width: 173, shortWidth: 0 }, { char: 'n', width: 119, shortWidth: 0 }, { char: 'o', width: 115, shortWidth: 107 }, { char: 'p', width: 120, shortWidth: 0 }, { char: 'q', width: 120, shortWidth: 0 }, { char: 'r', width: 80, shortWidth: 67 }, { char: 's', width: 100, shortWidth: 98 }, { char: 't', width: 84, shortWidth: 0 }, { char: 'u', width: 120, shortWidth: 107 }, { char: 'v', width: 107, shortWidth: 0 }, { char: 'w', width: 160, shortWidth: 154 }, { char: 'x', width: 110, shortWidth: 0 }, { char: 'y', width: 106, shortWidth: 104 }, { char: 'z', width: 93, shortWidth: 0 }, { char: '1', width: 84, shortWidth: 0 }, { char: '2', width: 125, shortWidth: 0 }, { char: '3', width: 136, shortWidth: 0 }, { char: '4', width: 138, shortWidth: 0 }, { char: '5', width: 130, shortWidth: 0 }, { char: '6', width: 129, shortWidth: 0 }, { char: '7', width: 107, shortWidth: 0 }, { char: '8', width: 138, shortWidth: 0 }, { char: '9', width: 129, shortWidth: 0 }, { char: '0', width: 145, shortWidth: 0 }, { char: ',', width: 56, shortWidth: 0 }, { char: '.', width: 56, shortWidth: 0 }, { char: "'", width: 41, shortWidth: 0 }, { char: ':', width: 56, shortWidth: 0 }, { char: '•', width: 56, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 71, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 115, shortWidth: 0 }, { char: ')', width: 115, shortWidth: 0 }, { char: '/', width: 88, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }]

const EngDestinations = [{"Hong Kong Island":["Hong Kong","Hong Kong (E)","Hong Kong (S)","Hong Kong (W)","Aberdeen","Ap Lei Chau","Causeway Bay","Central","Chai Wan","Chung Hom Kok","Cyberprot","Hang Fa Tsuen","Happy Valley","Kennedy Town","Kornhill","Mid-levels","North Point","Pok Fu Lam","Quarry Bay","Repulse Bay","Sai Wan","Sai Wan Ho","Sai Ying Pun","Shau Kei Wan","Shek O","Shek Tong Tsui","Sheung Wan","Shouson Hill","Stanley","Siu Sai Wan","Tai Hang","Tai Koo Shing","The Peak","Wah Fu","Wan Chai","Wan Chai (N)","Wong Chuk Hang"]},
{"Kowloon":["Kowloon","Kowloon (C)","Kowloon (E)","Kowloon (W)","Beacon Hill","Cha Kwo Ling","Cheung Sha Wan","Cheung Sha Wan(W)","Choi Hung","Chuk Yuen","Cruise Terminal","Diamond Hill","Hang Hau","Ho Man Tin","Hung Hom","Hung Hom Bay","Kai Tak","King's Park","Kowloon Bay","Kowloon City","Kowloon Tong","Kwun Tong","Kwun Tong Business Area","Lai Chi Kok","Lai Chi Kok (S)","Lam Tin","Lok Fu","Ma Tau Wai","Mei Foo","Mong Kok","Ngau Chi Wan","Ngau Tau Kok","Ngong Shuen Chau","Ping Shek","Po Lam","San Po Kong","Sham Shui Po","Sham Shui Po (W)","Shek Kip Mei","Sau Mau Ping","Tai Kok Tsui","Tai Kok Tsui (W)","Tiu Keng Leng","To Kwan Wan","Tsim Sha Tsui","Tsim Sha Tsui East","Tsz Wan Shan","Wang Tau Hom","West Kowloon Cultural District","West Kowloon Terminus","Wong Tai Sin","Yau Ma Tei","Yau Ma Tei (W)","Yau Tong","Yau Yat Chuen"]},
{"New Terriitories":["Lantau","Airport","Au Tau","Clear Water Bay","Discovery Bay","Fairview Park","Fanling","Fo Tan","Ha Tsuen","Hin Tin","Heung Yuen Wai","Hong Lok Yuen","Hung Shui Kiu","Kam Tin","Kwai Chung","Kwai Fong","Kwai Hing","Kwu Tung","Lai King","Lam Tei","Lantau(S)","Lau Fau Shan","Lei Muk Shue","Lok Ma Chau","Long Ping","Luen Wo Hui","Luk Keng","Lung Kwu Tan","Ma On Shan","Ma On Shan Town Centre","Ma Liu Sui","Ma Wan","Man Kam To","Mui Wo","Ngong Ping","On Lok Tsuen","Pak Shek Kok","Pak Tam Chung","Pat Heung","Ping Che","Ping Shan","Pui O","River Trade Terminal","Sai Sha","Sai Kung","Sam Shing Hui","San Tin","San Hui","Science Park","Sha Tau Kok","Sha Tin","Sha Tin Central","Sham Tseng","Shek Kong","Shek Lei","Shek Pik","Shek Wu Hui","Shek Yam","Shenzhen Bay","Sheung Shui","Sheung Tak","Siu Lam","Siu Lek Yuen","So Kwun Wat","Tai Hing","Tai Mei Tuk","Tai O","Tai Po","Tai Po Industrial Estate","Tai Po Kau","Tai Po Market","Tai Po Town Centre","Tai Po (N)","Tai Po (S)","Tai Shui Hang","Tai Wai","Tin Shui Wai","Tai Lin Pai","Tai Wo Hau","Tin Sam","Tin Shui Wai (N)","Tin Shui Wai (S)","Tin Shui Wai €","Tin Shui Wai (W)","Ting Kau","Tiu Keng Leng","Tseung Kwan O","Tseung Kwan O (E)","Tseung Kwan O Industrial Estate","Tseung Kwan O Town Centre","Tsing Lung Tau","Tsing Yi","Tsing Yi Town Centre","Tsing Yi (N)","Tsing Yi (S)","Tsing Yi (E)","Tsuen Wan","Tsuen Wan Central","Tsuen Wan (N)","Tsuen Wan (S)","Tsui Lam","Tuen Mun","Tuen Mun Town Centre","Tuen Mun (W)","Tung Chung","Tung Chung Town Centre","Tung Chung (W)","Tung Chung (N)","Tung Tau Industrial Area","Wo Hop Shek","Wu kai sha","Yuen Chau Kok","Yuen Long","Yuen Long (C)","Yuen Long (S)","元朗工業邨"]},
]

const ChtDestinations = [{"Hong Kong Island":["香港","香港(東)","香港(南)","香港(西)","香港仔","鴨脷洲","銅鑼灣","中環","柴灣","舂坎角","數碼港","杏花邨","跑馬地","堅尼地城","康怡","半山","北角","薄扶林","鰂魚涌","淺水灣","西灣","西灣河","西營盤","筲箕灣","石澳","石塘咀","上環","壽臣山","赤柱","小西灣","大坑","太古城","山頂","華富","灣仔","灣仔(北)","黃竹坑"]},
{"Kowloon":["九龍","九龍(中)","九龍(東)","九龍(西)","筆架山","荼果嶺","長沙灣","長沙灣(西)","彩虹","竹園","郵輪碼頭","鑽石山","坑口","何文田","紅磡","紅磡灣","啟德","京士柏","九龍灣","九龍城區","九龍塘","觀塘","觀塘商貿區","荔枝角","荔枝角(南)","藍田","樂富","馬頭圍","美孚","旺角","牛池灣","牛頭角","昂船洲","坪石","寶琳","新蒲崗","深水埗","深水埗(西)","石硤尾","秀茂坪","大角咀","大角咀(西)","調景嶺","土瓜灣","尖沙咀","尖沙咀東","慈雲山","橫頭磡","西九文化區","西九龍總站","黃大仙","油馬地","油馬地(西)","油塘","又一村",]},
{"New Terriitories":["大嶼山","飛機場","凹頭","清水灣","愉景灣","錦綉花園","粉嶺","火炭","廈村","顯田","香園圍","康樂園","洪水橋","錦田","葵涌","葵芳","葵興","古洞","麗景","藍地","大嶼山","流浮山","梨木樹","落馬洲","朗屏","聯和墟","鹿頸","龍鼓灘","馬鞍山","馬鞍山市中心","馬料水","馬灣","文錦渡","梅窩","昂坪","安樂村","白石角","北潭涌","八鄉","坪輋","坪山","貝澳","內河碼頭","西沙","西貢","三聖墟","新田","新墟","科學園","沙頭角","沙田","沙田巿中心","深井","石崗","石籬","石壁","石湖墟","石蔭","深圳灣","上水","尚德","小欖","小瀝源","掃管笏","太興","大美督","大澳","大埔","大埔工業邨","大埔滘","大埔墟","大埔市中心","大埔(北)","大埔(南)","大水坑","大圍","天水圍","大連排","大窩口","田心","天水圍(北)","天水圍(南)","天水圍€","天水圍(西)","汀九","調景嶺","將軍澳","將軍澳(東)","將軍澳工業邨","將軍澳市中心","青龍頭","青衣","青衣市中心","青衣(北)","青衣(南)","青衣(東)","荃灣","荃灣中環","荃灣(北)","荃灣(南)","翠林","屯門","屯門市中心","屯門(西)","東涌","東涌市中心","東涌(西)","東涌(北)","東頭工業區","和合石","烏溪沙","圓洲角","元朗區","元朗(中)","元朗(南)","元朗(南)","元朗工業邨"]}
]

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
    FormTextAddComponent.textPanelInit(null, this);

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

    let txtCharList = [];
    let txtFrameList = [];
    let left_pos = 0;
    let txt_char, txt_frame;
    // Check if text contains any non-alphabetic characters
    const containsNonAlphabetic = txt.split('').some(char => {
      // If the character is not in our width dictionaries, consider it non-alphabetic
      return !textWidthMedium.map(item => item.char).includes(char);
    });
    for (let i = 0; i < txt.length; i++) {
      // Check if the character is a Chinese character
      const bracketOffset = ['(', ')',].includes(txt.charAt(i)) ? 0.2 : 0;
      let textChar = txt.charAt(i);
      if (textChar === '、') {
        textChar = '、';
      }
      if (containsNonAlphabetic) {
        if(textWidthHeavy.map(item => item.char).includes(txt.charAt(i))){
          // Punctuation Marks
          const charWidth = textWidthHeavy.find(e => e.char === txt.charAt(i)).width;
          txt_char = new fabric.Text(txt.charAt(i), {
            fontFamily: 'TransportHeavy',
            left: left_pos + 0.25*xHeight,
            top: (0.225 + bracketOffset) * xHeight ,
            fill: color,
            fontSize: xHeight * 1.88,
          });
          txt_char.lockScalingX = txt_char.lockScalingY = true;
  
          txt_frame = new fabric.Rect({
            left: left_pos,
            top: 0,
            width: txt_char.width + 0.25*xHeight,
            height: 2.75 * xHeight - 2,
            fill: 'rgba(0,0,0,0)',
            stroke: color,
            strokeWidth: 2,
            strokeDashArray: [xHeight / 10, xHeight / 10],
          });
  
          left_pos += charWidth * xHeight / 100 + 0.25 * xHeight;
        } else{
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
        }
      } else {
        const fontWidth = font.replace('Transport', '') === 'Heavy' ? textWidthHeavy : textWidthMedium;
        const charWidth = fontWidth.find(e => e.char === txt.charAt(i)).width;

        txt_char = new fabric.Text(txt.charAt(i), {
          fontFamily: font,
          left: left_pos,
          top: 6 + bracketOffset * xHeight,
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
