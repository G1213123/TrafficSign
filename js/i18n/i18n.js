// Simple i18n utility for runtime language switching

// Base English fallback: only include entries where the key is NOT the actual English text.
// This lets us skip a full "en" dictionary and use keys-as-English for simple labels.
const base = {
  'dev_notice_html': '<strong>Development Version</strong> - This application is under active development. Please report any issues on <a href="https://github.com/G1213123/TrafficSign" target="_blank">GitHub</a>.',
  'hero_subtitle_html': 'Create, customize, and export professional directional signs online. Built with Hong Kong <span class="tpdm-tooltip" data-tooltip="Transport Planning and Design Manual">TPDM</span> standards for precision and compliance.',
  'feature_destination_text': 'Choose destinations from a comprehensive list of common districts, or type in names with authentic fonts.',
  'feature_symbols_text': 'Access a comprehensive library of traffic symbols and glyphs. No hassle for drawing points and shapes.',
  'feature_vector_text': 'Create scalable signs using vector graphics that maintain quality at any size.',
  'feature_export_text': 'Export your designs as PNG, SVG, DXF, or PDF for professional use.',
  'feature_precision_text': 'Built-in measurement tools and grid system for accurate sign dimensions.',
  'feature_save_text': 'Automatic save to browser storage and manual save/load functionality to preserve your work.',
  'demo_click_hint': 'Click any button below to see the feature in action',
  // Homepage/nav (only non-trivial copies)
  'Changelog Intro Text': "Here you'll find detailed information about all the updates, new features, bug fixes, and improvements made to Road Sign Factory. Each entry includes a short summary of what's changed.",
  'Stay Updated Description': 'Want to be notified about new releases? Follow our development on GitHub or check back here regularly for the latest updates.',
  // About page body
  'About Intro Text': 'Road Sign Factory provides traffic engineers, designers, and enthusiasts with a standards-compliant tool for creating professional road signage. It is a web service built and served to meet the modern needs for generating quality designs.',
  'feature_comply_tpdm_html': 'Comply to Hong Kong <span class="tpdm-tooltip" data-tooltip="Transport Planning and Design Manual">TPDM</span>',
  'feature_export_quality': 'Professional Export Quality',
  'feature_no_install': 'No Installation Required',
  'feature_interactive_uiux_html': 'Interactive and Responsive <span class="tpdm-tooltip" data-tooltip="User Interface / User Experience">UI/UX</span>',
  'feature_cad_html': '<span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span> Tool Grade Functionality',
  'feature_open_source': 'Open Source & Free',
  'feature_save_autosave': 'Save & Load with Auto-Save',
  'Timeline Intro Text': 'Traditionally, traffic signs are designed by professional engineers as a package of a roadworks project with <span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span>. While <span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span> is powerful in generating detailed drawings, characters and symbols must still be drawn carefully block by block, stroke by stroke. Sign making was like a renaissance of old technology <a href="https://en.wikipedia.org/wiki/Movable_type"> Movable Printing Press</a> in modern times. A need to speed up the design process within a tight project timeframe is called. This application is the result of seeking a modern and streamlined workflow for road sign design.',
  'Timeline Apr 2022 Desc': 'The original idea for Road Sign Factory was conceived as a solution for creating professional traffic signage with modern web technologies. The project was shelved after prototyping due to the technical difficulties encounter when prototyping.',
  'Timeline May 2024 Desc': 'Transport Department of HKSAR publicly released the Traffic Signs and Road Markings Manual (TPDM), providing comprehensive standards and guidelines that became the foundation for professional traffic sign design.',
  'Timeline Jan 2025 Desc': 'After a period of dormancy, the project was restarted with renewed focus and intensive development efforts to build the complete application.',
  'Timeline Feb 2025 Desc': 'The AI revolution transformed development workflows with advanced coding assistants, enabling rapid prototyping and intuitive "vibe-based" programming approaches that accelerated the project significantly.',
  'Timeline May 2025 Desc': 'The first public prototype was released, marking a major milestone with a functional traffic sign design tool available to users worldwide.',
  'Timeline Future Desc': 'Ongoing development with regular updates, new features, and improvements based on user feedback. See our <a href="changelog.html#upcoming">planned feature list</a>.',
  'Tech Info P1': 'Road Sign Factory is built using modern web technologies including HTML5 Canvas, JavaScript ES6+, and responsive CSS. The application uses the <a href="https://fabricjs.com/" target="_blank" rel="noopener noreferrer">Fabric.js</a> library for advanced canvas manipulation and supports vector graphics export through SVG generation.',
  'Tech Info P2': "The application features an intelligent save system that automatically stores your work in the browser's local storage, preventing data loss. Additionally, manual save and load functionality allows you to manage multiple projects and create backups of your designs.",
  'Tech Info P3': 'The export function supports multiple file formats including PNG (raster), SVG (vector), PDF (document), and DXF (CAD). PDF export is handled using the <a href="https://github.com/MrRio/jsPDF" target="_blank" rel="noopener noreferrer">jsPDF</a> library, which converts the canvas content to high-quality PDF documents suitable for printing and sharing. DXF export is powered by the <a href="https://github.com/tarikjabiri/js-dxf" target="_blank" rel="noopener noreferrer">dxf-writer</a> library, with the aids of <a href="http://paperjs.org/" target="_blank" rel="noopener noreferrer">paper.js</a> for path processing, enabling seamless integration with professional CAD software and engineering workflows.',
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
  'dev_notice_html': '<strong>開發版本</strong>－本應用仍在積極開發中。如有問題，請到 <a href="https://github.com/G1213123/TrafficSign" target="_blank">GitHub</a> 回報。',
  'hero_subtitle_html': '線上建立、客製與匯出專業方向指示標誌。採用香港 <span class="tpdm-tooltip" data-tooltip="Transport Planning and Design Manual">TPDM</span> 標準，精準又合規。',
  'feature_destination_text': '從常見地區清單中選擇目的地，或使用真實字型自行輸入。',
  'feature_symbols_text': '提供完整的交通符號與圖標庫，免去繪點與描圖的麻煩。',
  'feature_vector_text': '使用可擴放向量圖，任何尺寸都能維持高品質。',
  'feature_export_text': '支援 PNG、SVG、DXF、PDF 等多種匯出格式。',
  'feature_precision_text': '內建量測工具與格線系統，尺寸控制更精準。',
  'feature_save_text': '支援瀏覽器自動儲存與手動儲存/載入，保障你的成果。',
  'demo_click_hint': '點擊下方任一按鈕以查看功能示範',
  'Snap prompt': '對齊提示',
  'Drag & Snap': '拖曳對齊',
  // Homepage/nav
  'Home': '首頁',
  'Getting Started': '快速開始',
  'About': '關於',
  'Changelog': '更新記錄',
  'GitHub': 'GitHub',
  'Launch App': '啟動應用',
  'Launch Application': '啟動應用程式',
  'Open Full App': '開啟完整應用',
  'Professional Directional Sign Design Tool': '專業方向指示標誌設計工具',
  'Current Build': '目前版本',
  'Sign Templates': '範例標誌',
  'Symbols': '符號',
  'Destination Names': '目的地名稱',
  'Web-Based': '網頁版',
  'Professional Design Features': '專業設計功能',
  'Comprehensive tools for creating standards-compliant traffic signs': '全面工具，打造合乎規範的交通標誌',
  'Destination Text': '目的地文字',
  'Symbol Library': '符號庫',
  'Vector Graphics': '向量圖形',
  'Multiple Export Formats': '多種匯出格式',
  'Precision Tools': '精準工具',
  'Save & Load': '儲存與載入',
  'See It In Action': '即時演示',
  'Interactive demonstration of key features': '互動示範關鍵功能',
  'Add Symbol': '新增符號',
  'Add Border': '新增邊框',
  'Reset': '重設',
  'Example Signs Gallery': '範例標誌集',
  'Browse through various traffic sign examples': '瀏覽多款交通標誌範例',
  'Road Sign Factory': 'Road Sign Factory',
  'Quick Links': '快速連結',
  'Resources': '資源',
  'Support': '支持',
  'Launch Application - Free': '免費啟動應用程式',
  'About Road Sign Factory': '關於 Road Sign Factory',
  'Key features:': '主要功能：',
  'Development Timeline': '開發時間線',
  'Technical Information': '技術資訊',
  'View on GitHub': '在 GitHub 檢視',
  'Contact Us': '聯絡我們',
  'Release History': '版本歷史',
  'Changelog Intro Text': '在此可查看 Road Sign Factory 的所有更新、新功能、錯誤修正與改進摘要。',
  'Stay Updated': '持續關注',
  'Stay Updated Description': '想要接收新版本通知？請在 GitHub 追蹤我們，或不時回來查看最新消息。',
  'Follow on GitHub': '在 GitHub 追蹤',
  'Try the App': '試用應用程式',
  'Getting Started Guide': '快速開始指南',
  'Learn how to create professional traffic signs with our powerful design tool': '了解如何使用我們強大的設計工具製作專業交通標誌',
  'Welcome to Road Sign Factory': '歡迎使用 Road Sign Factory',
  'Follow our step-by-step tutorials to master traffic sign design': '依照逐步教學掌握交通標誌設計',
  // About page body
  'About Intro Text': 'Road Sign Factory 為交通工程師、設計師與愛好者提供一套符合標準的專業交通標誌製作工具。這是一個以現代需求為目標而建置與提供的網頁服務，致力於生成高品質設計。',
  'feature_comply_tpdm_html': '符合香港 <span class="tpdm-tooltip" data-tooltip="Transport Planning and Design Manual">TPDM</span> 標準',
  'feature_export_quality': '專業級匯出品質',
  'feature_no_install': '免安裝即可使用',
  'feature_interactive_uiux_html': '互動且響應式的 <span class="tpdm-tooltip" data-tooltip="User Interface / User Experience">UI/UX</span>',
  'feature_cad_html': '<span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span> 等級的工具功能',
  'feature_open_source': '開源與免費',
  'feature_save_autosave': '支援儲存/載入與自動儲存',
  'Timeline Intro Text': '傳統上，交通標誌通常由專業工程師以 <span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span> 作為道路工程專案的一部分來設計。雖然 <span class="tpdm-tooltip" data-tooltip="Computer Aided Design">CAD</span> 在產生細節圖面上非常強大，但字符與符號仍需逐一細緻描繪。某種程度上，標誌製作像是現代對古老技術——<a href="https://en.wikipedia.org/wiki/Movable_type">活字印刷</a>——的一次復興。為了在緊迫的工期內加速設計流程，本應用致力於探索更現代且順暢的工作流程。',
  'Initial Idea': '初步構想',
  'First Concept': '首個概念',
  'Timeline Apr 2022 Desc': 'Road Sign Factory 的原始理念是以現代網頁技術，提供專業交通標誌設計的解決方案。該專案在原型設計後，因技術挑戰而暫時擱置。',
  'TPDM Release': 'TPDM 發布',
  'HKSAR TPDM Public Release': '香港 TPDM 公開發布',
  'Timeline May 2024 Desc': '香港運輸署公開發布《交通標誌及道路標記手冊（TPDM）》，提供完整的標準與指引，成為專業交通標誌設計的重要基礎。',
  'Restart': '重新啟動',
  'Project Revival & Development': '專案復活與開發',
  'Timeline Jan 2025 Desc': '在一段休眠期後，專案以全新焦點重啟，並展開密集開發以建置完整應用。',
  'AI Boom': 'AI 熱潮',
  'AI-Powered Vibe Coding Era': 'AI 驅動的 Vibe Coding 時代',
  'Timeline Feb 2025 Desc': 'AI 革命改變了開發流程，透過先進的輔助工具加速原型製作與更直覺的「氛圍式」程式設計，大幅推進專案。',
  'Public Prototype': '公開原型',
  'First Public Release': '首次公開版本',
  'Timeline May 2025 Desc': '首次公開原型發布，具備可用的交通標誌設計功能，為專案發展的重要里程碑。',
  'Future': '未來',
  'Ongoing': '持續進行',
  'Continuous Enhancement': '持續開發',
  'Timeline Future Desc': '持續開發，定期推出更新、新功能與改進，並根據使用者回饋調整。詳見<a href="changelog.html#upcoming">規劃功能清單</a>。',
  'Tech Info P1': '本專案以 HTML5 Canvas、JavaScript ES6+ 與 RWD CSS 等現代網頁技術打造。應用程式使用 <a href="https://fabricjs.com/" target="_blank" rel="noopener noreferrer">Fabric.js</a> 進行進階畫布操作，並支援以 SVG 產生向量輸出。',
  'Tech Info P2': '應用內建智慧型儲存系統，會自動將您的作品保存在瀏覽器的本機儲存空間，避免資料遺失；同時提供手動儲存/載入功能，方便管理多個專案與備份設計。',
  'Tech Info P3': '支援 PNG（點陣）、SVG（向量）、PDF（文件）與 DXF（CAD）等多種輸出格式。PDF 輸出使用 <a href="https://github.com/MrRio/jsPDF" target="_blank" rel="noopener noreferrer">jsPDF</a> 將畫布內容轉為高品質 PDF；DXF 輸出採用 <a href="https://github.com/tarikjabiri/js-dxf" target="_blank" rel="noopener noreferrer">dxf-writer</a>，並輔以 <a href="http://paperjs.org/" target="_blank" rel="noopener noreferrer">paper.js</a> 進行路徑處理，與專業 CAD 軟體與工程流程無縫整合。',
  // Footer/common
  'Professional traffic sign design tool for modern web browsers.': '專為現代瀏覽器打造的專業交通標誌設計工具。',
  'HK TPDM Guidelines': '香港 TPDM 指南',
  'UK Traffic Signs Manual': '英國交通標誌手冊',
  'Help support this project:': '支持此專案：',
    // General UI
    'Toggle Sidebar': '切換側邊欄',
    'Draw Symbol': '繪製符號',
    'Add Text': '新增文字',
    'Add Border': '新增邊框',
    'Add Route Map': '新增路線圖',
    'Measure Tool': '量測工具',
    'Template Signs': '範例標誌',
    'Import/Export': '匯入/匯出',
    'History Tracker': '歷史追蹤',
    'Information': '資訊',
    'Settings': '設定',
    'Loading resources...': '載入資源中…',
    'Follow the cursor': '跟隨游標',
    'Enter': '確定',
    'Cancel': '取消',
    // Context menu
    'Set Anchor': '設定錨點',
    'Pivot Anchor': '旋轉錨點',
    'Edit': '編輯',
    'Delete': '刪除',
    'Property': '屬性',
    // Settings
    'Keyboard Shortcuts': '鍵盤快速鍵',
    'Arrow Keys': '方向鍵',
    'Nudge Selected Object': '微移選取物件',
    'Delete Selected Object': '刪除選取物件',
    'Escape': 'Esc',
    'Cancel Action / Toggle / Close Panel': '取消動作/切換/關閉面板',
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
    'Message Colour': '訊息顏色',
    'Text Font': '文字字型',
    'Chinese Font Setting': '中文字型設定',
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
    // Property panel
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
    'Approach Length': '引道長度',
    'Exit Length': '出口長度',
    'Route Width': '路徑寬度',
    'Inner Corner Radius': '內角半徑',
    'Outer Corner Radius': '外角半徑',
    'Side Roads': '支路數',
    'Parent Road': '母路段',
    'Branch Index': '分支序號',
    'Shape': '形狀',
    'Arrow': '箭頭',
    'Stub': '短枝',
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
    'Add Stack Divider': '新增堆疊分隔線',
    'Add Gantry Divider': '新增門架分隔線',
    'Add Gantry Line': '新增門架水平線',
    'Add Lane Line': '新增車道分隔線',
    'Select Border Type': '選擇邊框類型',
    'Select Template': '選擇範本',
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
    'Measurement Control': '量測控制',
    'Start Measuring': '開始量測',
    'Stop Measuring': '停止量測',
  'Click on vertices to measure distances. First click selects the starting vertex, second click measures to the end vertex.': '點選頂點以量測距離。第一次點選為起點，第二次點選為終點。',
  'Measurement Results': '量測結果',
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
  'Roundabout Type': '環島類型',
  'Roundabout Approach Length': '環島引道長度',
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
