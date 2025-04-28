/* Info Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas.js';

let FormInfoComponent = {
  // Adding General settings : e.g. turn off text borders, change background color, show grid, etc.
  InfoPanelInit: function () {
    GeneralHandler.tabNum = 9
    var parent = GeneralHandler.PanelInit()
    GeneralHandler.setActiveComponentOff(FormInfoComponent.DebugHandlerOff);
    if (parent) {
      // Create the About header using consistent Measure Tool styling
      GeneralHandler.createNode("h2", { 'class': 'panel-heading' }, parent).innerHTML = "About";

      // Create a container for info
      var infoContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      FormInfoComponent.createInfoPanel(infoContainer);

      const sponsorDiv = GeneralHandler.createNode("div", { 'class': `coffee-link-container` }, parent)
      sponsorDiv.innerHTML = '<a href="https://www.buymeacoffee.com/G1213123" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" height="41" width="174" style="max-width:100%;"></a>'

      // Add GitHub repository link
      const githubLink = GeneralHandler.createNode("div", { 'class': 'github-link-container' }, sponsorDiv);
      githubLink.innerHTML = '<a href="https://github.com/G1213123/TrafficSign" target="_blank"><i class="fa-brands fa-github"></i><span>Visit GitHub Repository</span></a>';

      // Add legal disclaimer
      const disclaimerDiv = GeneralHandler.createNode("div", { 'class': 'legal-disclaimer' }, parent);
      disclaimerDiv.style.fontSize = '12px';
      disclaimerDiv.style.color = '#aaa';
      disclaimerDiv.style.padding = '10px';
      disclaimerDiv.style.marginTop = '20px';
      disclaimerDiv.style.borderTop = '1px solid #444';

      disclaimerDiv.innerHTML = `
        <h4 style="margin: 5px 0; color: #ddd;">Disclaimer</h4>
        <p>Fonts used are subject to their respective licenses: Transport fonts (Crown Copyright), NotoSansHK (SIL OFL), and 教育部標準楷書字形檔(Version 5.00) (CC 「姓名標示-禁止改作」).</p>
        <p>This application is for personal and non-commercial use only.</p>
        <p>This site is not affiliated with the authorities and makes no guarantee of 100% conformity to official standards.</p>
        </p>It is the user's responsibility to ensure that the designs comply with local regulations and standards.</p>
        <p>The creator assumes no liability for any damages resulting from the use of this application or its outputs.</p>
      `;


    }
  },

  createInfoPanel: function (parent) {
    // Create SEO-optimized introduction panel
    const infoPanel = document.createElement('div');
    infoPanel.id = 'debug-info-panel';
    parent.appendChild(infoPanel);
    // Introductory description
    const desc = document.createElement('p');
    desc.innerText = 'Road Sign Factory is a web-based application for designing, customizing, and exporting professional traffic signs. Create your own symbols, add text, borders, and route maps, then export your design in multiple formats.';
    infoPanel.appendChild(desc);
    
    // Compliance statement
    const compliance = document.createElement('p');
    compliance.innerHTML = 'Sign designs are referring the Hong Kong Transport Department’s <a href="https://www.td.gov.hk/en/publications_and_press_releases/publications/tpdm/index.html" target="_blank" rel="noopener noreferrer">Transport Planning and Design Manual (TPDM)</a> as closely as possible.';
    infoPanel.appendChild(compliance);

    // Sub-heading for features section
    const featuresHeader = document.createElement('h3');
    featuresHeader.className = 'panel-subheading';
    featuresHeader.innerText = 'Features';
    infoPanel.appendChild(featuresHeader);

    // Features list
    const features = document.createElement('ul');
    ['Symbol drawing','Custom text insertion','Sign Border creation','Measurement tools','Design export'].forEach(label => {
      const li = document.createElement('li'); li.innerText = label; features.appendChild(li);
    });
    infoPanel.appendChild(features);

  },

};

// Export the FormInfoComponent for use in other files
export { FormInfoComponent };