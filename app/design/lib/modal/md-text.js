'use client';

import { ModalUtils } from './mdGeneral.js';
import { CanvasGlobals } from '../../components/canvas/canvas.js';
import { GeneralSettings } from '../utils/settings.js';
import { TextObject } from '../objects/text.js';
import { DividerObject } from '../objects/divider.js';
import { anchorShape } from '../objects/anchor.js';

const FONT_OPTIONS = [
  'TransportMedium',
  'TransportHeavy',
  'TW-MOE-Std-Kai',
  'parsedFontKorean',
  'parsedFontHK',
  'parsedFontSans',
];

const COLOR_OPTIONS = ['White', 'Black'];

const normalizeColor = (color) => {
  if (!color) return 'White';
  if (typeof color === 'string' && color.startsWith('#')) {
    return color.toLowerCase() === '#000000' ? 'Black' : 'White';
  }
  return String(color).toLowerCase() === 'black' ? 'Black' : 'White';
};

const createUnderline = (textObject) => {
  if (!textObject || textObject.underline) return textObject?.underline || null;

  const underlineObject = new DividerObject({
    xHeight: textObject.xHeight,
    color: textObject.color,
    dividerType: 'HLine',
    textObject,
    borderGroup: null,
  });

  underlineObject.isTemporary = true;
  anchorShape(textObject, underlineObject, {
    vertexIndex1: 'V1',
    vertexIndex2: 'E6',
    spacingX: 0,
    spacingY: textObject.xHeight / 4,
  });

  textObject.underline = underlineObject;
  return underlineObject;
};

const removeUnderline = (textObject) => {
  if (!textObject?.underline) return;

  const underlineObject = textObject.underline;
  textObject.underline = null;

  if (typeof underlineObject.deleteObject === 'function') {
    underlineObject.deleteObject(null, underlineObject);
  }
};

export const TextModalManager = {
  showModal(canvas = CanvasGlobals.canvas) {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject?.();
    const currentText = activeObject?.functionalType === 'Text' ? activeObject : null;
    const modalId = 'text-settings-modal';
    const { modal, modalContent } = ModalUtils.createModal(modalId, 'Text Settings');

    const form = document.createElement('div');
    form.className = 'text-modal-form';

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'input-field';
    textInput.value = currentText?.text || '';
    textInput.placeholder = 'Enter text to place on canvas';

    const xHeightInput = document.createElement('input');
    xHeightInput.type = 'number';
    xHeightInput.className = 'input-field';
    xHeightInput.value = Math.round(currentText?.xHeight || GeneralSettings.xHeight || 100);

    const fontSelect = document.createElement('select');
    fontSelect.className = 'input-field';
    FONT_OPTIONS.forEach((fontName) => {
      const option = document.createElement('option');
      option.value = fontName;
      option.textContent = fontName;
      fontSelect.appendChild(option);
    });
    fontSelect.value = currentText?.font || 'TransportMedium';

    const colorSelect = document.createElement('select');
    colorSelect.className = 'input-field';
    COLOR_OPTIONS.forEach((colorName) => {
      const option = document.createElement('option');
      option.value = colorName;
      option.textContent = colorName;
      colorSelect.appendChild(option);
    });
    colorSelect.value = normalizeColor(currentText?.color || GeneralSettings.messageColor || 'White');

    const underlineLabel = document.createElement('label');
    underlineLabel.className = 'input-label';
    const underlineInput = document.createElement('input');
    underlineInput.type = 'checkbox';
    underlineInput.checked = Boolean(currentText?.underline);
    underlineInput.style.marginRight = '8px';
    underlineLabel.appendChild(underlineInput);
    underlineLabel.appendChild(document.createTextNode('Underline'));

    const makeGroup = (labelText, field) => {
      const group = document.createElement('div');
      group.className = 'input-group';
      const label = document.createElement('label');
      label.className = 'input-label';
      label.textContent = labelText;
      group.appendChild(label);
      group.appendChild(field);
      return group;
    };

    form.appendChild(makeGroup('Text', textInput));
    form.appendChild(makeGroup('X-Height', xHeightInput));
    form.appendChild(makeGroup('Font', fontSelect));
    form.appendChild(makeGroup('Color', colorSelect));
    form.appendChild(underlineLabel);

    const applyButton = ModalUtils.createButton(currentText ? 'Update Text' : 'Add Text', 'apply-button', () => {
      const textValue = textInput.value.trim();
      if (!textValue) return;

      const resolvedXHeight = Number(xHeightInput.value) || GeneralSettings.xHeight || 100;
      const viewportCenter = canvas.getCenterPoint();
      let targetObject = currentText;

      if (targetObject) {
        targetObject.updateText(textValue, resolvedXHeight, fontSelect.value, colorSelect.value, targetObject.charSpacing || 0);
      } else {
        targetObject = new TextObject({
          text: textValue,
          xHeight: resolvedXHeight,
          font: fontSelect.value,
          color: colorSelect.value,
          left: viewportCenter.x,
          top: viewportCenter.y,
          underline: null,
        });
      }

      if (underlineInput.checked) {
        createUnderline(targetObject);
      } else {
        removeUnderline(targetObject);
      }

      targetObject.setCoords?.();
      canvas.setActiveObject(targetObject);
      canvas.requestRenderAll();
      ModalUtils.removeModal(modalId);
    });

    const cancelButton = ModalUtils.createButton('Cancel', 'cancel-button', () => ModalUtils.removeModal(modalId));
    const buttonsContainer = ModalUtils.createButtonsContainer([applyButton, cancelButton]);

    modalContent.appendChild(form);
    modalContent.appendChild(buttonsContainer);
    ModalUtils.showModal(modal, textInput);
  },
};

if (typeof window !== 'undefined') {
  window.TextModalManager = TextModalManager;
}

export default TextModalManager;