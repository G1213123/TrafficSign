'use client';

import React, { useEffect, useRef, useState } from 'react';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { GeneralSettings } from '../../lib/utils/settings.js';
import { TextObject } from '../../lib/objects/text.js';
import { DividerObject } from '../../lib/objects/divider.js';
import { anchorShape } from '../../lib/objects/anchor.js';
import { FontPriorityManager } from '../../lib/modal/md-font.js';
import { EngDestinations, ChtDestinations } from '../../lib/templates/destinationTemplate.js';
import { SymbolObject } from '../../lib/objects/symbols.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { GeneralDrawSettings, useGeneralDrawSettings } from './DrawSettings.js';
import SidebarToggleGroup from '../shared/SidebarToggleGroup.js';
import HintButton from '../shared/HintButton.js';
import './sidebar.css';

const getDestinationCatalog = (language) => (language === 'Chinese' ? ChtDestinations : EngDestinations);

const getRegionNames = (language) => getDestinationCatalog(language).map((region) => Object.keys(region)[0]);

const getLocationsForRegion = (regionName, language) => {
    const region = getDestinationCatalog(language).find((entry) => Object.keys(entry)[0] === regionName);
    return region?.[regionName] || [];
};

const findCorrespondingLocation = (text, fromLanguage, toLanguage) => {
    if (!text) return '';

    const sourceCatalog = getDestinationCatalog(fromLanguage);
    const targetCatalog = getDestinationCatalog(toLanguage);

    for (let index = 0; index < sourceCatalog.length; index += 1) {
        const sourceRegion = sourceCatalog[index];
        const regionName = Object.keys(sourceRegion)[0];
        const sourceLocations = sourceRegion[regionName] || [];
        const matchIndex = sourceLocations.indexOf(text);

        if (matchIndex !== -1) {
            const targetRegion = targetCatalog[index];
            const targetLocations = targetRegion?.[regionName] || [];
            return targetLocations[matchIndex] || '';
        }
    }

    return '';
};

const getJustificationVertices = (justification, isSource = true) => {
    if (isSource) {
        return { Left: 'E1', Middle: 'E2', Right: 'E3' }[justification] || 'E1';
    }

    return { Left: 'E7', Middle: 'E6', Right: 'E5' }[justification] || 'E7';
};

const markTwoLinerPair = (topObject, bottomObject, justification) => {
    topObject.isTwoLiner = true;
    bottomObject.isTwoLiner = true;
    topObject.twoLinerPartner = bottomObject;
    bottomObject.twoLinerPartner = topObject;
    topObject.twoLinerTop = topObject;
    topObject.twoLinerBottom = bottomObject;
    bottomObject.twoLinerTop = topObject;
    bottomObject.twoLinerBottom = bottomObject;
    topObject.twoLinerJustification = justification;
    bottomObject.twoLinerJustification = justification;
};

const normalizeColor = (color) => {
    if (!color) return 'White';
    if (typeof color === 'string' && color.startsWith('#')) {
        return color.toLowerCase() === '#000000' ? 'Black' : 'White';
    }
    const value = String(color);
    if (value.toLowerCase() === 'black') return 'Black';
    return 'White';
};

const normalizeLanguage = (language) => {
    if (language === 'Chinese' || language === 'English' || language === '2Liner') {
        return language;
    }

    return 'English';
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

export default function TextPanel({ canvas }) {
    const { t } = useI18n();
    const [text, setText] = useState('');
    const { xHeight, setXHeight, color, setColor } = useGeneralDrawSettings();
    const [font, setFont] = useState('TransportMedium');
    const [underline, setUnderline] = useState(false);
    const [activeTextObject, setActiveTextObject] = useState(null);
    const lastSyncedTextObjectIdRef = useRef(null);
    const [language, setLanguage] = useState('English');
    const [regionName, setRegionName] = useState(getRegionNames('English')[0] || '');
    const [locationValue, setLocationValue] = useState('');
    const [justification, setJustification] = useState('Left');
    const [streetName, setStreetName] = useState({
        english: '',
        chinese: '',
        leftNumber1: '',
        leftNumber2: '',
        rightNumber1: '',
        rightNumber2: '',
    });
    const fallbackLanguage = language === '2Liner' ? 'English' : language;
    const regionNames = getRegionNames(fallbackLanguage);
    const locationOptions = getLocationsForRegion(regionName, fallbackLanguage);
    const fontOptions = [
        { value: 'TransportMedium', label: t('Transport Medium') },
        { value: 'TransportHeavy', label: t('Transport Heavy') },
    ];
    const regionOptions = regionNames.map((region) => ({ value: region, label: t(region) }));
    const languageOptions = ['2Liner', 'English', 'Chinese'].map((option) => ({ value: option, label: t(option) }));
    const justificationOptions = ['Left', 'Middle', 'Right'].map((option) => ({ value: option, label: t(option) }));

    useEffect(() => {
        if (!canvas) return undefined;

        const syncSelectedTextObject = () => {
            const activeObject = canvas.getActiveObject?.();
            const resolvedActiveTextObject = activeObject?.twoLinerTop || activeObject;
            const activeObjectId = resolvedActiveTextObject?.canvasID ?? null;

            if (activeObjectId !== null && lastSyncedTextObjectIdRef.current === activeObjectId) {
                return;
            }

            if (resolvedActiveTextObject && resolvedActiveTextObject.functionalType === 'Text') {
                lastSyncedTextObjectIdRef.current = activeObjectId;
                setActiveTextObject(resolvedActiveTextObject);
                setText(resolvedActiveTextObject.text || '');
                setXHeight(Math.round(resolvedActiveTextObject.xHeight || GeneralSettings.xHeight || 100));
                const nextFont = fontOptions.some((option) => option.value === resolvedActiveTextObject.font)
                    ? resolvedActiveTextObject.font
                    : 'TransportMedium';
                setFont(nextFont);
                setColor(normalizeColor(resolvedActiveTextObject.color));
                setUnderline(Boolean(resolvedActiveTextObject.underline));

                if (resolvedActiveTextObject.twoLinerTop && resolvedActiveTextObject.twoLinerBottom) {
                    setLanguage('2Liner');
                    setJustification(resolvedActiveTextObject.twoLinerJustification || 'Left');
                    setLocationValue(resolvedActiveTextObject.twoLinerTop.text || resolvedActiveTextObject.text || '');
                    const matchedRegion = getRegionNames('English').find((region) =>
                        getLocationsForRegion(region, 'English').includes(resolvedActiveTextObject.twoLinerTop.text || resolvedActiveTextObject.text || '')
                    );
                    if (matchedRegion) {
                        setRegionName(matchedRegion);
                    }
                    return;
                }

                setLanguage('English');
                setLocationValue(resolvedActiveTextObject.text || '');
                const matchedRegion = getRegionNames('English').find((region) =>
                    getLocationsForRegion(region, 'English').includes(resolvedActiveTextObject.text || '')
                );
                if (matchedRegion) {
                    setRegionName(matchedRegion);
                }
            } else {
                lastSyncedTextObjectIdRef.current = null;
                setActiveTextObject(null);
            }
        };

        syncSelectedTextObject();

        canvas.on('selection:created', syncSelectedTextObject);
        canvas.on('selection:updated', syncSelectedTextObject);
        canvas.on('selection:cleared', syncSelectedTextObject);

        return () => {
            canvas.off('selection:created', syncSelectedTextObject);
            canvas.off('selection:updated', syncSelectedTextObject);
            canvas.off('selection:cleared', syncSelectedTextObject);
        };
    }, [canvas, setColor, setXHeight]);

    useEffect(() => {
        const availableRegions = getRegionNames(fallbackLanguage);

        if (!availableRegions.includes(regionName)) {
            const nextRegion = availableRegions[0] || '';
            setRegionName(nextRegion);

            const locations = getLocationsForRegion(nextRegion, fallbackLanguage);
            const nextLocation = locations[0] || '';
            setLocationValue(nextLocation);
            setText(nextLocation);
            return;
        }

        const locations = getLocationsForRegion(regionName, fallbackLanguage);
        if (!locations.includes(locationValue)) {
            const nextLocation = locations[0] || '';
            setLocationValue(nextLocation);
            setText(nextLocation);
            return;
        }

        setText(locationValue);
    }, [language, regionName, locationValue]);

    const syncTwoLinerPair = (topObject, bottomObject, pairText, translatedText, resolvedFont, resolvedColor) => {
        const resolvedJustification = justification || 'Left';
        const topVertex = getJustificationVertices(resolvedJustification, true);
        const bottomVertex = getJustificationVertices(resolvedJustification, false);

        topObject.updateText(pairText, xHeight, resolvedFont, resolvedColor, topObject.charSpacing || 0);
        bottomObject.updateText(translatedText, xHeight, resolvedFont, resolvedColor, bottomObject.charSpacing || 0);
        markTwoLinerPair(topObject, bottomObject, resolvedJustification);

        setTimeout(() => {
            anchorShape(topObject, bottomObject, {
                vertexIndex1: topVertex,
                vertexIndex2: bottomVertex,
                spacingX: 0,
                spacingY: 0,
            });
            canvas.requestRenderAll();
        }, 0);
    };

    const createTwoLinerPair = (pairText, resolvedFont, resolvedColor) => {
        const viewportCenter = canvas.getCenterPoint();
        const translatedText = findCorrespondingLocation(pairText, 'English', 'Chinese') || pairText;

        const topObject = new TextObject({
            text: pairText,
            xHeight,
            font: resolvedFont,
            color: resolvedColor,
            left: viewportCenter.x,
            top: viewportCenter.y - xHeight * 0.6,
            underline: null,
        });
        topObject.isTemporary = true;

        const bottomObject = new TextObject({
            text: translatedText,
            xHeight,
            font: resolvedFont,
            color: resolvedColor,
            left: viewportCenter.x,
            top: viewportCenter.y + xHeight * 0.6,
            underline: null,
        });
        bottomObject.isTemporary = true;

        markTwoLinerPair(topObject, bottomObject, justification || 'Left');

        setTimeout(() => {
            anchorShape(topObject, bottomObject, {
                vertexIndex1: getJustificationVertices(justification || 'Left', true),
                vertexIndex2: getJustificationVertices(justification || 'Left', false),
                spacingX: 0,
                spacingY: 0,
            });
            canvas.requestRenderAll();
        }, 0);

        return topObject;
    };

    const activateTextVertexControl = (textObject) => {
        if (!textObject) return;

        const v2 = textObject.getBasePolygonVertex('E2');
        if (v2) {
            const vertexControl = textObject.controls.E2;

            if (vertexControl) {
                vertexControl.onCleanup = () => {
                    setActiveTextObject(null);
                };

                vertexControl.onClick({
                    button: 0,
                    type: 'mousedown'
                });
            }
        }
    }

    const createStreetNamePlate = () => {
        if (!canvas) return;

        const values = Object.fromEntries(
            Object.entries(streetName).map(([key, value]) => [key, value.trim()])
        );
        if (!Object.values(values).some(Boolean)) return;

        let chineseFont = 'TW-MOE-Std-Kai';
        try {
            const priorityFont = FontPriorityManager.getFontPriorityList()?.[0];
            if (priorityFont === 'parsedFontMedium') chineseFont = 'TransportMedium';
            if (priorityFont === 'parsedFontHeavy') chineseFont = 'TransportHeavy';
        } catch {
            chineseFont = 'TW-MOE-Std-Kai';
        }

        const position = CanvasGlobals.CenterCoord?.() || canvas.getCenterPoint();
        let yOffset = 0;
        const objects = {};

        const createText = (value, textXHeight, textFont = font, charSpacing = 0) => {
            if (!value) return null;
            const textObject = new TextObject({
                text: value,
                xHeight: textXHeight,
                font: textFont,
                color: 'black',
                left: position.x,
                top: position.y + yOffset,
                charSpacing,
            });
            textObject.isTemporary = true;
            yOffset += 10;
            return textObject;
        };

        objects.english = createText(values.english, 50);
        objects.chinese = createText(values.chinese, 43.5, chineseFont, 18.25);
        objects.leftNumber1 = createText(values.leftNumber1, 35);
        objects.leftNumber2 = createText(values.leftNumber2, 35);
        objects.rightNumber1 = createText(values.rightNumber1, 35);
        objects.rightNumber2 = createText(values.rightNumber2, 35);

        const leftNumberWidth = (objects.leftNumber2?.width || 0) + (objects.leftNumber1?.width || 0);
        const rightNumberWidth = (objects.rightNumber1?.width || 0) + (objects.rightNumber2?.width || 0);
        const leftEqualization = leftNumberWidth > rightNumberWidth ? 0 : 0.5 * (leftNumberWidth - rightNumberWidth);
        const rightEqualization = rightNumberWidth > leftNumberWidth ? 0 : 0.5 * (rightNumberWidth - leftNumberWidth);

        const createLozenge = () => {
            const lozenge = new SymbolObject({
                symbolType: 'Lozenge',
                xHeight: 35,
                color: 'black',
                left: position.x,
                top: position.y + yOffset,
            });
            lozenge.isTemporary = true;
            yOffset += 10;
            return lozenge;
        };

        if (objects.english && objects.chinese) {
            anchorShape(objects.english, objects.chinese, {
                vertexIndex1: 'E2',
                vertexIndex2: 'E6',
                spacingX: 0,
                spacingY: 56 - 50 * 0.5 - 43.5 * 0.1,
            });
        }
        if (objects.chinese && (objects.leftNumber1 || objects.leftNumber2)) {
            anchorShape(objects.chinese, objects.leftNumber2 || objects.leftNumber1, {
                vertexIndex1: 'E4',
                vertexIndex2: 'E8',
                spacingX: -35 + leftEqualization + 43.5 * 0.25,
                spacingY: 0,
            });
        }
        if (objects.leftNumber1 && objects.leftNumber2) {
            const lozenge = createLozenge();
            anchorShape(objects.leftNumber2, lozenge, { vertexIndex1: 'E4', vertexIndex2: 'E8', spacingX: -10, spacingY: -7 });
            anchorShape(lozenge, objects.leftNumber1, { vertexIndex1: 'E4', vertexIndex2: 'E8', spacingX: -10, spacingY: 7 });
        }
        if (objects.chinese && (objects.rightNumber1 || objects.rightNumber2)) {
            anchorShape(objects.chinese, objects.rightNumber1 || objects.rightNumber2, {
                vertexIndex1: 'E8',
                vertexIndex2: 'E4',
                spacingX: 35 - rightEqualization - 43.5 * 0.25,
                spacingY: 0,
            });
        }
        if (objects.rightNumber1 && objects.rightNumber2) {
            const lozenge = createLozenge();
            anchorShape(objects.rightNumber1, lozenge, { vertexIndex1: 'E8', vertexIndex2: 'E4', spacingX: 10, spacingY: -7 });
            anchorShape(lozenge, objects.rightNumber2, { vertexIndex1: 'E8', vertexIndex2: 'E4', spacingX: 10, spacingY: 7 });
        }

        const firstText = objects.english || objects.chinese || objects.leftNumber1 || objects.rightNumber1;
        activateTextVertexControl(firstText);
        canvas.setActiveObject(firstText);
        canvas.requestRenderAll();
    };

    const handleSubmit = () => {
        if (!canvas) return;

        const trimmedText = (language === '2Liner' ? locationValue : text).trim();
        if (!trimmedText) return;

        const resolvedXHeight = Number(xHeight) || GeneralSettings.xHeight || 100;
        const effectiveLanguage = normalizeLanguage(language);
        const resolvedFont = fontOptions.some((option) => option.value === font) ? font : 'TransportMedium';
        const resolvedColor = color || 'White';

        let targetObject = activeTextObject;

        if (effectiveLanguage === '2Liner') {
            const activePairTop = activeTextObject?.twoLinerTop || activeTextObject;
            const activePairBottom = activeTextObject?.twoLinerBottom || activeTextObject?.twoLinerPartner;

            if (activePairTop && activePairBottom && activePairTop.functionalType === 'Text' && activePairBottom.functionalType === 'Text') {
                syncTwoLinerPair(activePairTop, activePairBottom, trimmedText, findCorrespondingLocation(trimmedText, 'English', 'Chinese') || trimmedText, resolvedFont, resolvedColor);
                canvas.setActiveObject(activePairTop);
                setActiveTextObject(activePairTop);
                canvas.requestRenderAll();
                return;
            }

            targetObject = createTwoLinerPair(trimmedText, resolvedFont, resolvedColor);
            canvas.setActiveObject(targetObject);
            activateTextVertexControl(targetObject);
            setActiveTextObject(targetObject);
            canvas.requestRenderAll();
            return;
        }

        if (targetObject && targetObject.functionalType === 'Text') {
            const translatedText = effectiveLanguage === 'Chinese'
                ? (findCorrespondingLocation(trimmedText, 'English', 'Chinese') || trimmedText)
                : trimmedText;
            const finalText = effectiveLanguage === 'Chinese' ? translatedText : trimmedText;

            const preservedOriginX = targetObject.originX || 'left';
            const preservedOriginY = targetObject.originY || 'top';
            const preservedOriginPoint = targetObject.getPointByOrigin
                ? targetObject.getPointByOrigin(preservedOriginX, preservedOriginY)
                : { x: targetObject.left, y: targetObject.top };

            targetObject.updateText(finalText, resolvedXHeight, resolvedFont, resolvedColor, targetObject.charSpacing || 0);

            if (targetObject.setPositionByOrigin) {
                targetObject.setPositionByOrigin(preservedOriginPoint, preservedOriginX, preservedOriginY);
            } else {
                targetObject.set({
                    left: preservedOriginPoint.x,
                    top: preservedOriginPoint.y,
                    originX: preservedOriginX,
                    originY: preservedOriginY,
                });
            }
        } else {
            const viewportCenter = canvas.getCenterPoint();
            const finalText = effectiveLanguage === 'Chinese'
                ? (findCorrespondingLocation(trimmedText, 'English', 'Chinese') || trimmedText)
                : trimmedText;

            targetObject = new TextObject({
                text: finalText,
                xHeight: resolvedXHeight,
                font: resolvedFont,
                color: resolvedColor,
                left: viewportCenter.x,
                top: viewportCenter.y,
                underline: null,
            });

            activateTextVertexControl(targetObject);
        }

        if (underline) {
            createUnderline(targetObject);
        } else {
            removeUnderline(targetObject);
        }

        targetObject.setCoords?.();
        canvas.setActiveObject(targetObject);
        canvas.requestRenderAll();
        setActiveTextObject(targetObject);
    };

    return (
        <div className="space-y-4">
            <GeneralDrawSettings
                xHeight={xHeight}
                onXHeightChange={setXHeight}
                color={color}
                onColorChange={setColor}
            />

                <SidebarToggleGroup
                    label={t('Font')}
                    options={fontOptions}
                value={fontOptions.some((option) => option.value === font) ? font : 'TransportMedium'}
                onChange={setFont}
                    hintPath="text/TextFont"
            />

            <div>
                <h2 className="tab-title">{t('Destination Settings')}</h2>

                <SidebarToggleGroup
                    label={t('Language')}
                    options={languageOptions}
                    value={language}
                    onChange={setLanguage}
                />

                {language === '2Liner' && (
                    <SidebarToggleGroup
                        label={t('Justification')}
                        options={justificationOptions}
                        value={justification}
                        onChange={setJustification}
                    />
                )}

                <SidebarToggleGroup
                    label={t('Region')}
                    options={regionOptions}
                    value={regionName}
                    onChange={setRegionName}
                    className="toggle-group-wrap"
                />

                <div className="input-group">
                    <label className="input-label">{t('Location')}</label>
                    <select
                        className="input-field"
                        value={locationValue}
                        onChange={(e) => {
                            const nextLocation = e.target.value;
                            setLocationValue(nextLocation);
                            setText(nextLocation);
                        }}
                    >
                        {locationOptions.map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                {language === '2Liner' && (
                    <div className="input-group">
                        <div className="info-text">
                            {t('Text input is disabled in 2Liner mode. Select the location in the destination panel.')}
                        </div>
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label">
                        <span>{t('Text')}</span>
                        <HintButton hintPath="text/Text" label={`${t('Text')} help`} />
                    </label>
                    <input
                        type="text"
                        className="input-field"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        disabled={language === '2Liner'}
                        placeholder={t('Enter text to place on canvas')}
                    />
                </div>

                <SidebarToggleGroup
                    label={t('Underline')}
                    options={['No', 'Yes'].map((option) => ({ value: option, label: t(option) }))}
                    value={underline ? 'Yes' : 'No'}
                    onChange={(nextValue) => setUnderline(nextValue === 'Yes')}
                    hintPath="divider/GantryLine"
                />

                <button className="panel-action-button" onClick={handleSubmit}>
                    {activeTextObject && language !== '2Liner' ? t('Update Text') : t('Add Text')}
                </button>

                <button className="toggle-button" onClick={() => FontPriorityManager.showModal()}>
                    {t('Open Font Settings')}
                </button>

                <div className="input-group">
                    <h2 className="tab-title">{t('Street Name Plate')}</h2>
                    {[
                        ['english', 'Eng St Name'],
                        ['chinese', 'Chin St Name'],
                    ].map(([key, label]) => (
                        <input
                            key={key}
                            type="text"
                            className="input-field"
                            value={streetName[key]}
                            placeholder={t(label)}
                            onChange={(event) => setStreetName((current) => ({ ...current, [key]: event.target.value }))}
                        />
                    ))}
                    {[
                        [['leftNumber1', 'Left Num 1'], ['leftNumber2', 'Left Num 2']],
                        [['rightNumber1', 'Right Num 1'], ['rightNumber2', 'Right Num 2']],
                    ].map((row) => (
                        <div className="street-number-row" key={row[0][0]}>
                            {row.map(([key, label]) => (
                                <input
                                    key={key}
                                    type="text"
                                    className="input-field street-number-input"
                                    value={streetName[key]}
                                    placeholder={t(label)}
                                    onChange={(event) => setStreetName((current) => ({ ...current, [key]: event.target.value }))}
                                />
                            ))}
                        </div>
                    ))}
                    <button className="panel-action-button" onClick={createStreetNamePlate}>
                        {t('Add Street Name Plate Text')}
                    </button>
                </div>

                <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                    {t('Click the canvas to position the text after adding it.')}
                </p>
            </div>
        </div>
    );
}