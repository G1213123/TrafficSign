// Simple i18n utility for runtime language switching

// Base English fallback: only include entries where the key is NOT the actual English text.
// This lets us skip a full "en" dictionary and use keys-as-English for simple labels.
const base = {
    // Property panel (English differs from technical key)
  'Left (geom)': 'Left',
  'Top (geom)': 'Top',
  'Right (geom)': 'Right',
  'Bottom (geom)': 'Bottom',
  'Width (geom)': 'Width',
  'Height (geom)': 'Height',
  // Font modal example text
  'e.g., 屯門元朗天水圍': 'e.g., Tuen Mun Yuen Long Tin Shui Wai',
  // Export/donation overlay
  'Donation Thanks Title': 'Thank you for using Road Sign Factory!',
  'Donation Message': 'If you find this tool helpful, please consider supporting its continued development and new features.',
   // Region labels (note: key has a typo kept for compatibility)
  'New Terriitories': 'New Territories',
};

const dictionaries = {
  zh: {
     // General UI
    'Toggle Sidebar': '切換側欄',
    'Draw Symbol': '繪製符號',
    'Add Text': '新增文字',
    'Add Border': '新增邊框',
    'Add Route Map': '新增路線圖',
    'Measure Tool': '量度工具',
    'Template Signs': '範例標誌',
    'Import/Export': '匯入/匯出',
    'History Tracker': '歷史追蹤',
    'Information': '資訊',
    'Settings': '設定',
    'Loading resources...': '載入資源中…',
    'Follow the cursor': '跟隨游標',
    'Enter': '確定',
    'Cancel': '取消',
    'Canvas Objects': '畫布物件',
    // Context menu
    'Set Anchor': '鎖定圖形',
    'Pivot Anchor': '交換鎖定點',
    'X-axis': 'X 軸',
    'Y-axis': 'Y 軸',
    'Both': '兩者',
    'Edit': '編輯',
    'Delete': '刪除',
    'Property': '屬性',
    // Settings
    'Keyboard Shortcuts': '鍵盤快速鍵',
    'Arrow Keys': '方向鍵',
    'Nudge Selected Object': '移動選取物件',
    'Delete Selected Object': '刪除選取物件',
    'Escape': 'Esc',
    'Cancel Action / Toggle / Close Panel': '取消動作/切換/關閉側欄',
    'Enter (Key)': 'Enter (鍵)',
    'Confirm Input': '確認輸入',
    'Tab': 'Tab',
    'Switch Vertex / Unit': '切換頂點/單位',
    'Ctrl + Z': 'Ctrl + Z',
    'Undo': '復原',
    'Ctrl + S': 'Ctrl + S',
    'Save': '儲存',
    'Show Text Borders': '顯示文字邊框',
    'Show Grid': '顯示格線',
    'Show All Vertices': '顯示所有頂點',
    'Dimension Unit': '尺寸單位',
    'Background Color': '背景色',
    'Grid Color': '格線色',
    'Grid Size': '格線尺寸',
    'Auto Save': '自動儲存',
    'Auto Save Interval (seconds)': '自動儲存間隔（秒）',
    'Save Canvas': '儲存畫布',
    'Clear Saved Canvas': '清除已儲存畫布',
    'Reset Settings': '重設設定',
    'Run Tests': '執行測試',
    'Run Tests on Start': '啟動時執行測試',
    'App Language': '介面語言',
    'English': '英文',
    'Chinese': '中文',
    'Yes': '是',
    'No': '否',
    // Text panel
    'x Height': 'x 高度',
    'mm': '毫米',
    'sw': '筆畫粗細',
    'Enter spacing in X \n (Leave empty if no need for axis):': '輸入X軸間隔(如無需鎖定則留空白):',
    'Enter spacing in Y \n (Leave empty if no need for axis):': '輸入Y軸間隔(如無需鎖定則留空白):',
    'Black': '黑色',
    'White': '白色',
    'Message Colour': '訊息顏色',
    'Text Font': '英文字體',
    'Chinese Font Setting': '中文字體設定',
    'Underline': '底線',
    'Add New Destination': '新增目的地',
    'Language': '語言',
    '2Liner': '雙行',
    'Justification': '對齊方式',
    'Left': '靠左',
    'Middle': '置中',
    'Right': '靠右',
    'Region': '地區',
    '-- Select Location --': '-- 請選擇地點 --',
    'Text input is disabled in 2Liner mode. Select the location in the destination panel.': '雙行模式不支援直接輸入文字，請於目的地面板選擇地點。',
    'Street Name Plate': '街道名稱牌',
    'Eng St Name': '英文街道名稱',
    'Chin St Name': '中文街道名稱',
    'Left Num 1': '左側數字 1',
    'Left Num 2': '左側數字 2',
    'Right Num 1': '右側數字 1',
    'Right Num 2': '右側數字 2',
    'Add Street Name Plate Text': '新增街道名稱牌文字',
    '(optional)': '(選填)',
    // Property  panel
    'Object Properties': '物件屬性',
    'Geometry': '幾何',
    'Basic': '基本',
    'Special': '特殊',
    'Left (geom)': '左座標',
    'Top (geom)': '上座標',
    'Right (geom)': '右座標',
    'Bottom (geom)': '下座標',
    'Width (geom)': '寬度',
    'Height (geom)': '高度',
    'Color': '顏色',
    'Fill Color': '填充顏色',
    'Text': '文字',
    'Font': '字型',
    'Symbol Type': '符號類型',
    'Angle': '角度',
    'Road Type': '道路類型',
    'Main Line': '主線',
    'Roundabout': '迴旋處',
    'Conventional': '傳統',
    'Spiral': '螺旋',
    'Oval': '橢圓',
    'Double': '雙迴旋',
    'Roundel Shape': '迴旋形狀',
    'Approach Length': '引道長度',
    'Exit Length': '出口長度',
    'Route Width': '路徑寬度',
    'Inner Corner Radius': '內彎半徑',
    'Outer Corner Radius': '外彎半徑',
    'Side Roads': '支路段',
    'Parent Road': '主路段',
    'Branch Index': '分支序號',
    'Shape': '形狀',
    'Arrow': '箭頭',
    'Stub': '平頭',
    'RedBar' : '路線封閉',
    'Circular Sign' : '圓形標誌',
    'Circular Sign (with Arrow)' : '圓形標誌(箭頭)',
    'LaneDrop' : '只往出口',
    'T-Junction' : 'T字路口',
    'Y-Junction' : 'Y字路口',
    'Straight' : '直路',
    'Border Type': '邊框類型',
    'Frame Width': '框厚',
    'Width Objects': '寬度物件數',
    'Height Objects': '高度物件數',
    'HDivider Count': '水平分隔數',
    'VDivider Count': '垂直分隔數',
    'BBox': '邊界盒',
    // Font modal
    'Chinese Font Priority Management': '中文字型優先順序管理',
    'Fonts are tried in order from top to bottom.': '字型會依照由上而下的順序嘗試使用。',
    'Upload Custom Font': '上傳自訂字型',
    'Choose Font File': '選擇字型檔案',
    'Character Override Settings': '特殊字元覆蓋設定',
    'Specify characters that should use a specific font. Enter characters directly without spaces or commas.': '指定需使用特定字型的字元，請直接輸入字元，勿加入空白或逗號。',
    'Override Font:': '覆蓋字型：',
    'Characters:': '字元：',
    'e.g., 屯門元朗天水圍': '例如：屯門元朗天水圍',
    'Apply Changes': '套用變更',
    // Import modal
    'Import JSON from Text': '從文字匯入 JSON',
    'Paste your JSON here...': '在此貼上 JSON 內容…',
    'Import': '匯入',
    // Export panel
    'Filename': '檔名',
    'Quality': '品質',
    'PDF Paper Size': 'PDF 紙張尺寸',
    'Scale Multiplier (PNG/SVG)': '縮放倍率（PNG/SVG）',
    'Include Grid': '包含格線',
    'Include Background': '包含背景',
    'Export as PNG': '匯出為 PNG',
    'Export as SVG': '匯出為 SVG',
    'Export as PDF': '匯出為 PDF',
    'Export as DXF (Outline Only)': '匯出為 DXF（僅外框）',
    'Export as JSON': '匯出為 JSON',
    'Import JSON file': '匯入 JSON 檔案',
    'Import JSON text': '匯入 JSON 文字',
    'Exporting': '正在匯出',
    'Donation Thanks Title': '感謝使用 Road Sign Factory！',
    'Donation Message': '如果本工具對你有所幫助，歡迎支持我們持續開發與新增功能。',
    // Border panel
    'Select Color Scheme': '選擇色彩方案',
    'Add Stack Divider': '新增長型標誌分隔線',
    'Add Gantry Divider': '新增架空標誌分隔線',
    'Add Gantry Line': '新增門架水平線',
    'Add Lane Line': '新增行車線分隔線',
    'Select Border Type': '選擇邊框類型',
    'Fixed Width': '固定寬度',
    'Fixed Height': '固定高度',
    '(optional) mm': '(選填) 毫米',
    'Select Template': '選擇範本',
    'Select shape(s) to calculate border width': '選擇圖形用以計算邊框 寬度',
    'Select shape(s) to calculate border height': '選擇圖形用以計算邊框 高度',
  // New border selection and divider placement prompts
  'Select shape(s) to contain inside the border': '選擇要包含於邊框內的圖形',
  'Click inside the border to place divider': '在邊框內點擊以放置分隔線',
    // Border color scheme labels
    'Blue Background': '藍底',
    'Green Background': '綠底',
    'White Background': '白底',
    'White Background - Parking': '白底－停車場',
    'Yellow Background': '黃底',
    'Brown Background': '棕底',
    'Red Background': '紅底',
    // Measure panel
    'Instructions': '使用說明',
    'Measurement Control': '量度控制',
    'Start Measuring': '開始量度',
    'Stop Measuring': '停止量度',
    'Click on vertices to measure distances. First click selects the starting vertex, second click measures to the end vertex.': '點選頂點以量度距離。第一次點選為起點，第二次點選為終點。',
    'Measurement Results': '量度結果',
    'Distance': '距離',
    'From': '起點',
    'To': '終點',
    'Press Enter to continue': '按 Enter 繼續',
    // Map panel
    'Main Road Type': '主路類型',
    'Main Road Shape': '主路形狀',
    'Main Road Width': '主路寬度',
    'Main Road Approach Length': '主路引道長度',
    'Main Road Exit Length': '主路出口長度',
    'Roundabout Type': '迴旋處類型',
    'Roundabout Approach Length': '迴旋處引道長度',
    'Normal': '一般',
    'Auxiliary': '輔助車道',
    'U-turn': '掉頭',
    'Draw Main Road Symbol': '繪製主路符號',
    '+ Another Route Destination': '+ 新增支路目的地',
    'Side Road width': '支路寬度',
    'Side Road Width': '支路寬度',
    'Side Road Shape': '支路形狀',
    // Tracker
    'Clear History': '清除歷程',
    'Undo Mode: Off': '復原模式：關',
    'Undo Mode: On': '復原模式：開',
    'No actions recorded yet': '尚未記錄任何操作',
    'Created': '已建立',
    'Deleted': '已刪除',
    'Modified': '已修改',
    'Anchored': '已錨定',
    'Property Changed': '屬性已變更',
    'Unlocked': '已解除鎖定',
    // Region group labels
    'Hong Kong Island': '香港島',
    'Kowloon': '九龍',
    'New Terriitories': '新界',

    // ===== Hints: Common =====
    'Usage': '用法',
    'Notes': '備註',
    'Design Reference': '設計參考',
    'Quick reference': '快速參考',
    'Scheme': '方案',
    'Background': '底色',
    'Message': '訊息',
    'Typical purpose': '常見用途',
    'When to use each scheme': '各色彩方案的使用時機',
    'Green': '綠色',
    'Blue': '藍色',
    'White': '白色',
    'Black': '黑色',
    'Yellow': '黃色',
    'Brown': '棕色',
    'Red': '紅色',
    'Language': '語言',
    'Font Family': '字型家族',
    'Background Type': '底色類型',
    'Background Colors': '底色',
    'Transport Alphabet': 'Transport 字體',
    'Dark background': '深色底',
    'Light background': '淺色底',
    'Dark Background': '深色底',
    'Light Background': '淺色底',
    'All Backgrounds': '所有底色',
    'All Colors': '所有顏色',
    'Gantry': '門架',
    'Road Side': '路旁',
    'Design Speed': '設計車速',
    'Typical Road Type': '常見道路類型',
    'Advance Information / Direction Sign': '先導資訊／方向標誌',
    'Final Advance Direction Sign': '最終先導方向標誌',
    'Direction Sign': '方向標誌',
    'RCS': 'RCS',
    '≥ 80 km/h': '≥ 80 公里/小時',
    '70–80 km/h': '70–80 公里/小時',
    '50–70 km/h': '50–70 公里/小時',
    '≤ 50 km/h': '≤ 50 公里/小時',
    'Expressway': '快速公路',
    'Trunk Road': '幹道',
    'Primary / District Distributor / Rural': '主幹／分區幹道／鄉郊',
    'Others': '其他',

    // Fallback/help messages
    'No help available for this item.': '此項目暫無說明。',
    'Failed to load help content.': '無法載入說明內容。',

    // ===== Hints: Border Colour Purpose =====
    'Border Colour Purpose': '邊框色彩用途',
    'TPDM Vol.3 – Section 3.2.7 (Colour formats), 3.5.4.8 (Sign Border Details)': 'TPDM 第3卷－第3.2.7節（顏色格式）、3.5.4.8節（標誌邊框詳情）',
    'Signs within expressway; panels directing to expressways.': '設於快速公路範圍內之標誌；或指向快速公路的導向面板。',
    'Non-expressway and regional destination route guidance.': '非快速公路之道路及區域性目的地的路線引導。',
    'Local destination blocks and general information panels.': '本地目的地區塊與一般資訊面板。',
    'Parking direction only border.': '僅用於停車場方向指示的邊框。',
    'Temporary traffic management or special event directions.': '臨時交通管理或特別活動之指示用途。',
    'Tourist attractions and recreational destinations.': '旅遊景點及康樂設施目的地。',
    'Special cases for warning message. Should not be used in normal situations.': '特殊警示用途；一般情況不應使用。',
    'Border colour matches the message colour unless specified (e.g., Dark border background use white message colour).': '邊框顏色通常與訊息字色一致，除非另有指定（例如：深色底邊框使用白色字）。',
    'Message colour follows background luminance: dark backgrounds → white message; light backgrounds → black message.': '訊息字色依背景明暗而定：深色底用白字；淺色底用黑字。',
    'For text alphabet choice, see Message Colour hint (Transport Medium/Heavy usage).': '字體粗細請參見「訊息顏色」提示（對應 Transport Medium/Heavy）。',

    // ===== Hints: Border types =====
    'Exit Border': '出口編號邊框',
    'TPDM Vol.3 - Section 3.5.7.27-3.5.7.33 (Exit Symbols), Section 3.5.4.8 (Sign Border Details)': 'TPDM 第3卷－第3.5.7.27–3.5.7.33節（出口符號）、第3.5.4.8節（標誌邊框詳情）',
    'Special border for exit numbering on signs.': '配合出口編號使用的專用邊框。',

    'Flag Border': '旗型邊框',
    'TPDM Vol.3 - Section 3.5.5.19-3.5.5.21 (Roadside Directional Signs), Section 3.5.4.8 (Sign Border Details), Section 3.5.4.16 (Border Rounding)': 'TPDM 第3卷－第3.5.5.19–3.5.5.21節（路旁方向標誌）、第3.5.4.8節（邊框詳情）、第3.5.4.16節（邊角圓角）',
    'Asymmetric flag-style border used where a pointer or offset legend is required.': '非對稱旗型邊框，適用於需要指示箭角或偏移文字的情況。',

    'Green Panel Border': '綠底面板邊框',
    'TPDM Vol.3 - Section 3.5.4.6 (Green Panel), Section 3.5.4.8 (Sign Border Details)': 'TPDM 第3卷－第3.5.4.6節（綠底面板）、第3.5.4.8節（標誌邊框詳情）',
    'Green background panel variant typically used for directional guidance to expressways.': '綠底面板，多用於指向快速公路的導向資訊。',
    'Use only on signs erected not on expressway.': '僅適用於設置於非快速公路上的標誌。',

    'Panel Border': '白底面板邊框',
    'TPDM Vol.3 - Section 3.2.7.9-3.2.7.12 (Local Destination Panel), Section 3.5.4.8 (Sign Border Details)': 'TPDM 第3卷－第3.2.7.9–3.2.7.12節（本地目的地面板）、第3.5.4.8節（標誌邊框詳情）',
    'Standard rectangular border used for non-regional destination blocks.': '標準矩形邊框，適用於非區域性目的地區塊。',
    'Whether a destination is local or regional refer to Section TPDM Chapter 3.7.': '目的地屬「本地」或「區域」的判別，請參見 TPDM 第3.7章。',

    'Stack Border': '長型邊框',
    'TPDM Vol.3 - Section 3.5.5 (Roadside Directional Signs), Section 3.5.6 (Gantry Signs), Section 3.5.4.8 (Sign Border Details), Section 3.5.4.16 (Border Rounding)': 'TPDM 第3卷－第3.5.5節（路旁方向標誌）、第3.5.6節（門架標誌）、第3.5.4.8節（邊框詳情）、第3.5.4.16節（邊角圓角）',
    'General border format for stack type, gantry type and map type sign.': '適用於長型、門架及地圖式標誌的一般邊框格式。',
    'Combine with Stack Divider when multiple horizontal blocks are needed.': '當需要多層水平區塊時，配合「長型分隔線」。',
    'Also can combine with Gantry Divider for vertical lane sectioning.': '亦可配合「門架分隔線」作垂直車道分區。',

    // ===== Hints: Divider =====
    'Gantry Border Divider': '門架邊框分隔線',
    'Gantry Border Divider Usage': '門架邊框分隔線用法',
    'TPDM Vol.3 - Section 3.5.6 (Gantry Signs), Section 3.5.4.8 (Sign Border Details)': 'TPDM 第3卷－第3.5.6節（門架標誌）、第3.5.4.8節（邊框詳情）',
    'Used to separate content horizontally within gantry-type borders for overhead directional signs': '用於門架邊框內作水平分隔（架空方向標誌）',
    'Each of the divided compartment of gantry shall represent approximate the traffic lane width': '分隔後的每一格高度，宜近似實際車道寬度',
  'Follows center arrangement principles for gantry signs in mainline or lane drop format (Section 3.5.4.10)': '主線或「車道減少」形式的門架標誌，遵循置中編排原則（詳見 3.5.4.10 節）',
    'Select the divider when placing Gantry border to assign the divider height': '放置門架邊框時選取分隔線以設定分隔高度',

    'Lane Separation Line': '車道分隔線',
    'TPDM Vol.3 - Section 3.5.6.14 (Gantry Line), Diagram 3.5.5.20 (Lane Line sign)': 'TPDM 第3卷－第3.5.6.14節（門架水平線）、圖 3.5.5.20（車道線標誌）',
    'When two or more lanes are serving the same destination with more than one location names': '當兩條或以上車道通往同一目的地且目的地名稱超過一個時',
    'Horizontal Line is added to prevent confusion of associating lanes to destinations': '加入水平線以避免車道與目的地對應關係混淆',

    'Lane Separation Line Usage': '車道分隔線用法',
    'TPDM Vol.3 - Section 3.5.6 (Gantry Signs), Section 3.5.4.9 (Border Spacings)': 'TPDM 第3卷－第3.5.6節（門架標誌）、第3.5.4.9節（邊框間距）',
    'Used to separate different lanes vertically within a lane drop sign': '在「車道減少」標誌中，用於垂直分隔不同車道',
    'Select the line when placing Stack border to assign the lane line strokes and height': '放置長型邊框時選取該線以設定線粗與高度',

    // ===== Hints: Route (Map) =====
    'Main Road Shape Guide': '主路形狀指引',
    'TPDM Vol.3 - Section 3.5.5 (Roadside Directional Signs)': 'TPDM 第3卷－第3.5.5節（路旁方向標誌）',
    'Different termination shapes follow TPDM design standards for traffic flow and road geometry:': '各種末端形狀依 TPDM 設計標準，配合交通流向及道路幾何：',
    'Shape selection should align with actual road configuration and driver expectation': '形狀選擇應符合實際道路配置與駕駛者預期',
    'Taper Diverge Junction where Main Road destination is not shown': '主路目的地未顯示之漸縮分岔路口',
    'Taper Diverge Junction where Main Road destination is shown': '主路目的地已顯示之漸縮分岔路口',
    'Main Road destination not shown here for clarity. Refer to text placement hints.': '為清晰起見，此處不顯示主路目的地。請參考文字擺放提示。',
    'Lane Drop Junction': '車道減少路口',
    'Crossroad Junction': '十字路口',

    'Roundabout Shape Guide': '迴旋處形狀指引',
    'Roundabout shape placement according to Diagram 3.5.5.8:': '依圖 3.5.5.8 之迴旋處形狀擺放：',

    // ===== Hints: Symbols =====
    'Airport Symbol': '機場符號',
    'TPDM Vol.3 - Section 3.5.7.22-3.5.7.25 (Airport Symbols), Section 3.5.4.15 (Symbol Spacing)': 'TPDM 第3卷－第3.5.7.22–3.5.7.25節（機場符號）、第3.5.4.15節（符號間距）',
    'Airport Symbol Usage': '機場符號用法',
    'Refer to general symbols (see Tunnel Symbol) for placement and spacing': '擺放與間距請參考通用符號（見隧道符號）',
    'Orientation should rotate to align with destination direction for clarity': '符號方向應轉至與目的地方向一致以提高清晰度',
    'However, airplane direction should never point downwards for safety recognition': '惟飛機機頭方向不應朝下，以免誤導與安全辨識',
  'Spacing: 2 s/w between symbols, 1.5 s/w between message and symbol (Section 3.5.4.15)': '間距：符號彼此 2 s/w；訊息與符號 1.5 s/w（詳見 3.5.4.15 節）',

    'Exit Symbol': '出口符號',
    'TPDM Vol.3 - Section 3.5.7.27-3.5.7.33 (Exit Symbols)': 'TPDM 第3卷－第3.5.7.27–3.5.7.33節（出口符號）',
    'Exit Symbol Usage': '出口符號用法',
    'Used in conjunction with exit numbers to indicate expressway exits': '與出口編號一併使用，表示快速公路之出口',
    'Positioned on the same side of the direction sign as that of the exit on the road': '應位於與道路實際出口同側之指示牌一側',

    'Expressway Symbol': '快速公路符號（綠底面板）',
    'TPDM Vol.3 - Section 3.5.7.18-3.5.7.21 (Expressway Symbols), Section 3.5.4.6 (Green Panels)': 'TPDM 第3卷－第3.5.7.18–3.5.7.21節（快速公路符號）、第3.5.4.6節（綠底面板）',
    'Expressway symbols should only be used for signs located not in an expressway.': '此符號只適用於設置於「非」快速公路之標誌。',
    'i.e. the sign is in blue background and contains a green panel directing to the expressway.': '即：標誌為藍底，並含有指向快速公路的綠底面板。',
    'This sign is used to warn motorist the start of expressway, which additional regulations will be applied.': '用以提示將進入快速公路，屆時會有額外交通規例生效。',
    'Placement inside green panel:': '放置於綠底面板內：',

    'Red Expressway Symbol': '快速公路符號（紅色，門架）',
    'TPDM Vol.3 - Section 3.5.6 (Gantry Signs), Section 3.5.6.11-18 (Expressway Symbol Placement)': 'TPDM 第3卷－第3.5.6節（門架標誌）、第3.5.6.11–18節（快速公路符號擺放）',
    'Red Expressway symbols should only be used for signs located on the expressway.': '紅色快速公路符號僅用於設置於快速公路上的標誌。',
    'i.e. the sign is in green background.': '即：標誌為綠底。',
    'The Expressway symbols should normally be located in the top right-hand corner of the sign': '符號一般位於標誌之右上角',
    'Whenever there are more than one panel on the gantry for lane drop or diverge, the symbol need only be located on the mainline part of the sign.': '若門架上有多塊面板（如車道減少或分流），僅需置於主線部分之面板即可。',
    'Placement above map type sign:': '置於地圖式標誌之上：',
    'Placement to the right of text in gantry sign:': '置於門架標誌文字右側：',
    'Placement to the left of text in gantry sign:': '置於門架標誌文字左側：',
    'Placement to the right of text in wide gantry sign:': '置於寬門架標誌文字右側：',

    'Gantry Type Sign Arrow Symbol': '門架式箭頭符號',
    'TPDM Vol.3 - Section 3.5.6 (Gantry Signs), Section 3.5.6.7 (Symbol Placement)': 'TPDM 第3卷－第3.5.6節（門架標誌）、第3.5.6.7節（符號擺放）',
    'Gantry Arrow Usage': '門架箭頭用法',
    'Downward pointing arrows must be positioned above the center of the traffic lane they refer to': '向下箭頭必須位於所指車道的正上方',
    'Used in gantry signs for lane guidance and direction indication': '用於門架標誌的車道引導與方向指示',
    'Placement below Horizontal line:': '置於水平線下：',

    'Stack Type Sign Arrow Symbol': '長型標誌箭頭符號',
    'TPDM Vol.3 - Section 3.5.5.22-3.5.5.31 (Stack Type Signs), Section 3.5.4.15 (Symbol Spacing)': 'TPDM 第3卷－第3.5.5.22–3.5.5.31節（長型標誌）、第3.5.4.15節（符號間距）',
    'Stack Arrow Symbol Usage': '長型箭頭用法',
    'Used in roadside stack-type directional signs for indicating direction of travel': '用於路旁長型方向標誌指示行駛方向',
    'Placement above Route Shield for Horizontal Arrows:': '水平箭頭置於路線盾形標誌之上：',
    'Placement when used in lane lines sign:': '用於車道線標誌時之擺放：',

    'Left Pedestrian, Disabled and Cycle Symbol': '行人（左向）、殘疾人士與單車符號',
    'TPDM Vol.3 - Section 3.5.5.34-3.5.5.35 (Pedestrian and Disabled Symbols), Section 3.5.5.47-3.5.5.49 (Cycle Symbols), Section 6.4 (Cycling signs)': 'TPDM 第3卷－第3.5.5.34–3.5.5.35節（行人與殘疾人士符號）、第3.5.5.47–3.5.5.49節（單車符號）、第6.4節（單車設施標誌）',
    'Left Pedestrian Symbol Usage': '行人（左向）符號用法',
    'Used to indicate pedestrian facilities or pedestrian-related destinations': '用以表示行人設施或與行人相關之目的地',
    'Typically placed adjacent to text indicating pedestrian areas or walkways': '通常置於顯示行人區或步行道之文字旁',
    'Symbol facing left or right should align with the sign direction': '符號朝向（左/右）應與指示方向一致',

    'Regulatory sign Symbol': '規例標誌符號',
    'TPDM Vol.3 - Section 3.5.5.13 (Route Symbol Arrangement), Section 3.5.7.42-3.5.5.46 (Cycle Symbols), Section 6.4 (Traffic Sign Symbols)': 'TPDM 第3卷－第3.5.5.13節（路線符號編排）、第3.5.7.42–3.5.5.46節（單車符號）、第6.4節（交通符號）',
    'Regulatory Sign Symbol Usage': '規例標誌符號用法',
    'Used to indicate restriction of the road ahead': '表示前方道路之限制',
    'Restrictions applied might be height, width, no turning left/right, no entry': '可能包括高度/寬度限制、禁止左/右轉、禁止進入等',

    'Route Shield Symbol': '路線盾形標誌',
    'TPDM Vol.3 - Section 3.5.7.2-3.5.7.9 (Route Shield Symbol), Section 3.5.4.15 (Symbol Spacing)': 'TPDM 第3卷－第3.5.7.2–3.5.7.9節（路線盾形）、第3.5.4.15節（符號間距）',
    'Route Shield Symbol Usage': '路線盾形標誌用法',
    'Used to identify specific route numbers and highway designations': '用以識別特定路線編號及道路等級',
    'Can be positioned adjacent to text, below text, or with directional arrows': '可置於文字旁、文字下方，或與方向箭頭搭配',
  'Spacing: 1.5 s/w bottom spacing extension applies to route shields (Section 3.5.4.9)': '下方延伸間距 1.5 s/w 適用於路線盾形（詳見 3.5.4.9 節）',
    'Symbol spacing: 2 s/w between symbols, proper alignment with destination text': '符號間距 2 s/w，並與目的地文字妥善對齊',
    'Placement below text': '置於文字下方',
    'Placement below another symbol': '置於另一符號之下',
    'Placement at the end of main road destination in map type sign': '置於地圖式標誌主路目的地文字之末端',
    'Placement to the side road destination in map type sign': '置於地圖式標誌支路目的地文字旁',
    'Placement with the stack arrow in stack type sign': '於長型標誌與箭頭同置',
    'Alternative placement with the stack arrow in stack type sign': '長型標誌與箭頭之替代擺放方式',
    'Placement with the gantry arrow in gantry type sign': '於門架標誌與箭頭同置',

    'General Symbol': '通用符號',
    'TPDM Vol.3 - Section 3.5.4.15 (Symbol Placement), Section 3.5.7.10-3.5.7.17 (Tunnel Symbols), Section 3.5.7.26 (MTR Symbol), Section 3.5.7.41 (Hospital Symbol)': 'TPDM 第3卷－第3.5.4.15節（符號擺放）、第3.5.7.10–3.5.7.17節（隧道符號）、第3.5.7.26節（港鐵符號）、第3.5.7.41節（醫院符號）',
    'Applicable for Tunnel, Airport, Hospital, Parking, Disney, MTR symbols': '適用於隧道、機場、醫院、停車、迪士尼、港鐵等符號',
    'Symbol placement follows general symbol guidelines with proper spacing and alignment': '符號擺放遵循通用規範並保持適當間距與對齊',
    'Placement next to one line of Text in stack type sign:': '長型標誌單行文字旁之擺放：',
    'Placement next to one line of Text in flag type sign:': '旗型標誌單行文字旁之擺放：',
    'Placement there are multiple lines of Text:': '多行文字之擺放：',
    'Alternative placement there are multiple lines of Text:': '多行文字之替代擺放：',
    'Placement there are multiple logos:': '多個圖標之擺放：',
    'Placement next to Text in gantry sign:': '門架標誌文字旁之擺放：',
    'Placement to the main road destination in map type sign:': '地圖式標誌主路目的地之擺放：',
    'Placement to the side road destination in map type sign:': '地圖式標誌支路目的地之擺放：',
    'Another placement to the side road destination in map type sign:': '地圖式標誌支路目的地之另一擺放：',

    // ===== Hints: Text =====
    'Message Colour Selection': '訊息顏色選擇',
  'TPDM Vol.3 – Section 3.5.3, 3.5.4.6–3.5.4.7; Colour formats per 3.2.7.1': 'TPDM 第3卷－第3.5.3、3.5.4.6–3.5.4.7；顏色格式詳見 3.2.7.1 節',
    'Choose text colour based on the panel/background': '依面板/背景選擇文字顏色',
    'Select the message colour to maintain contrast with the sign panel (border/background). Use this table:': '選擇訊息字色以維持與面板（邊框/背景）的對比。參考下表：',
    'Typical Background Colours': '常見底色',
    'Transport Medium': 'Transport 中黑',
    'Transport Heavy': 'Transport 粗黑',
    'For bilingual signs, follow the same contrast rule for both languages.': '雙語標誌亦應遵照同一對比原則。',
    'Green/Blue panels (e.g., expressway, trunk): use White text.': '綠/藍底面板（如快速公路、幹道）：使用白字。',
    'White/Yellow panels (local/temporary): use Black text.': '白/黃底面板（本地/臨時）：使用黑字。',
    'Refer to TPDM for full colour formats and panel rules. See also 3.5.7 for symbol colour behaviour on green panels.': '完整顏色格式與面板規則請參見 TPDM；另見 3.5.7（綠底面板上之符號顏色表現）。',

    'Text Placement Guide': '文字擺放指引',
    'TPDM Vol.3 - Section 3.5.4.1-3.5.4.5 (Legend Blocks), Section 3.5.4.10 (Alignment)': 'TPDM 第3卷－第3.5.4.1–3.5.4.5節（文字區塊）、第3.5.4.10節（對齊）',
    'Text Placement Guidelines': '文字擺放原則',
    'Text placement follows TPDM specifications for legend block formation and message alignment:': '文字擺放遵循 TPDM 對文字區塊與編排之規範：',
  'Words are formed by butting tiles together with 2 s/w space between words (Section 3.5.4.1)': '英文以字磚相接組成；單字間距 2 s/w（詳見 3.5.4.1 節）',
  'English messages are butted above corresponding Chinese messages (Section 3.5.4.3)': '英文置於相應中文之上方（詳見 3.5.4.3 節）',
  'Alignment: Left for stack/flag/map type signs, center for gantry signs (Section 3.5.4.10)': '對齊：長型/旗型/地圖式採靠左；門架採置中（詳見 3.5.4.10 節）',
    'Diverging Map Type Sign without Main Road Destination': '地圖式分流標誌（不含主路目的地）',
    'Diverging Map Type Sign with Main Road Route Number and expressway symbol': '地圖式分流標誌（含主路路線編號與快速公路符號）',
    'Diverging Map Type Sign with Main Road Destination': '地圖式分流標誌（含主路目的地）',
    'Roundabout Map Type Sign left and top destinations': '迴旋處地圖式標誌（左/上方向目的地）',
    'Roundabout Map Type Sign right and u-turn destinations': '迴旋處地圖式標誌（右/掉頭方向目的地）',
    'Stack Type Sign': '長型標誌',
    'Text above destination panel block (applicable both white and green panel)': '文字置於目的地面板上方（適用白底與綠底面板）',
    'Text below destination panel block (applicable both white and green panel)': '文字置於目的地面板下方（適用白底與綠底面板）',
    'Text placement in gantry sign': '門架標誌中文字擺放',
    'Alternative placement in gantry sign to reduce width': '門架標誌之替代擺放（縮減寬度）',

    'Text Font Guide': '文字字型指引',
    'TPDM Vol.3 - Section 3.5.3 (Lettering and Character Standards), Section 3.5.4.6-3.5.4.7 (Panel Typography)': 'TPDM 第3卷－第3.5.3節（字體及字符標準）、第3.5.4.6–3.5.4.7節（面板字體）',
    'Transport Font Family Selection (TPDM Vol.3 Section 3.5.3)': 'Transport 字型選擇（TPDM 第3卷 3.5.3）',
    'Font selection follows TPDM specifications for optimal legibility and consistency:': '字型選擇遵循 TPDM 規範，以確保可讀性與一致性：',
  'Dark colour panels use Transport Medium alphabet with white color (Section 3.5.4.6)': '深色底面板使用 Transport Medium 白字（詳見 3.5.4.6 節）',
  'Light colour use Transport Heavy alphabet with black color (Section 3.5.4.7)': '淺色底面板使用 Transport Heavy 黑字（詳見 3.5.4.7 節）',
    'Avector Chinese True Type Fonts (Hong Kong) - BlackBold': '全真字庫（港人版）- 粗黑',
    'Avector HK BlackBold (Chinese)': '全真字庫（港人版）- 粗黑',

    'x-Height Input Guide': 'x 高度輸入指南',
    'TPDM Vol.3 - Section 3.2 (Lettering Dimensions), Table 3.2.5.1': 'TPDM 第3卷－第3.2節（字高），表 3.2.5.1',
    'What is x-height?': '何謂 x 高度？',
    'x-height description': 'x 高度為交通標誌英文字母（Transport 字體）的小寫名義高度。此值決定整體設計尺寸，並與筆畫寬（s/w）共同用於換算實際標誌尺寸。常見關係式：mm = x 高度 × 筆畫寬 ÷ 4。',
    'How to choose x-height': '如何選擇 x 高度',
    'Refer to TPDM Table 3.2.5.1 for recommended x-heights by design speed and sign type. Summary:': '請參考 TPDM 表 3.2.5.1 按設計車速與標誌類型之建議 x 高度：',
  'X-height notes': '備註（摘自表下）：x 高度主要由設計車速決定；無括號數值為建議值；括號內為受限制時之較小替代值。中間值可依 5 mm 進位（詳見 3.2.5.2–3 節），另有例外情況。',
    'Minimum clear visibility': '最小清晰可見距離',
  'Table 3.2.5.1 also specifies minimum clear visibility distances for each case. Ensure siting achieves at least the stated minimums; strive for more where feasible (see 3.2.5.4–3.2.5.7).': '表 3.2.5.1 同時列出各情況之最小清晰可見距離。設置位置應至少達到所列最小值，並在可行情況下爭取更大距離（詳見 3.2.5.4–3.2.5.7 節）。',

    'Tunnel Closed Symbol': '隧道封閉符號',
    'TPDM Vol.3 - Section 4.5.5 (Symbol Placement)': 'TPDM 第三卷 - 第 4.5.5 節（符號位置）',
    'Applicable for Tunnel Symbol when the sign is within Trunk Road or Primary Distributor Road': '適用於位於主幹道或市區幹道標誌上的隧道符號',
    'Placement in gantry sign with flashing light above and outside sign:': '門架標誌上的位置（閃燈位於標誌上外方）：',
    'Placement with flashing light together within sign:': '與閃燈同時位於標誌內的位置：',
  },
};

let currentLocale = 'en';

const i18n = {
  t(key) {
    if (!key) return '';
    const dict = dictionaries[currentLocale] || {};
    // Prefer current locale, then base (English), then the key itself
    return dict[key] || base[key] || key;
  },
  setLocale(locale) {
    // Allow 'en' even without a dictionary (it will use base/keys)
    if (locale === 'en' || (locale && dictionaries[locale])) {
      currentLocale = locale;
    } else {
      currentLocale = 'en';
    }
  },
  getLocale() {
    return currentLocale;
  },
  applyTranslations(root = document) {
    if (!root) return;
    // Text content
    root.querySelectorAll('[data-i18n]')?.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = i18n.t(key);
    });
    // HTML content
    root.querySelectorAll('[data-i18n-html]')?.forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) el.innerHTML = i18n.t(key);
    });
    // Placeholders
    root.querySelectorAll('[data-i18n-placeholder]')?.forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) el.setAttribute('placeholder', i18n.t(key));
    });
    // Tooltips (data-tooltip and title)
    root.querySelectorAll('[data-i18n-tooltip]')?.forEach(el => {
      const key = el.getAttribute('data-i18n-tooltip');
      if (key) {
        const val = i18n.t(key);
        el.setAttribute('data-tooltip', val);
        el.setAttribute('title', val);
      }
    });
  }
};

export { i18n };

// Also expose globally for inline scripts that cannot import modules
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
