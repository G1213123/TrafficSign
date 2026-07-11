'use client';

import React, { useEffect, useState } from 'react';

import { GeneralSettings } from './settings.js';
import { TextObject } from '../../lib/objects/text.js';
import { DividerObject } from '../../lib/objects/divider.js';
import { anchorShape } from '../../lib/objects/anchor.js';
import { FontPriorityManager } from '../../lib/modal/md-font.js';
import { EngDestinations, ChtDestinations } from '../../lib/objects/template.js';
import { GeneralDrawSettings, useGeneralDrawSettings } from './DrawSettings.js';
import './sidebar.css';

const FONT_OPTIONS = [
    { value: 'TransportMedium', label: 'Transport Medium' },
    { value: 'TransportHeavy', label: 'Transport Heavy' },
];

const COLOR_OPTIONS = [
    { value: 'White', label: 'White' },
    { value: 'Black', label: 'Black' },
];

const LANGUAGE_OPTIONS = ['2Liner', 'English', 'Chinese'];
const JUSTIFICATION_OPTIONS = ['Left', 'Middle', 'Right'];

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
    const [text, setText] = useState('');
    const { xHeight, setXHeight, color, setColor } = useGeneralDrawSettings();
    const [font, setFont] = useState('TransportMedium');
    const [underline, setUnderline] = useState(false);
    const [activeTextObject, setActiveTextObject] = useState(null);
    const [language, setLanguage] = useState('English');
    const [regionName, setRegionName] = useState(getRegionNames('English')[0] || '');
    const [locationValue, setLocationValue] = useState('');
    const [justification, setJustification] = useState('Left');

    useEffect(() => {
        if (!canvas) return undefined;

        const syncSelectedTextObject = () => {
            const activeObject = canvas.getActiveObject?.();
            const resolvedActiveTextObject = activeObject?.twoLinerTop || activeObject;

            if (resolvedActiveTextObject && resolvedActiveTextObject.functionalType === 'Text') {
                setActiveTextObject(resolvedActiveTextObject);
                setText(resolvedActiveTextObject.text || '');
                setXHeight(Math.round(resolvedActiveTextObject.xHeight || GeneralSettings.xHeight || 100));
                const nextFont = FONT_OPTIONS.some((option) => option.value === resolvedActiveTextObject.font)
                    ? resolvedActiveTextObject.font
                    : 'TransportMedium';
                setFont(nextFont);
                setColor(normalizeColor(resolvedActiveTextObject.color));
                setUnderline(Boolean(resolvedActiveTextObject.underline));

                if (resolvedActiveTextObject.twoLinerTop && resolvedActiveTextObject.twoLinerBottom) {
                    setLanguage('2Liner');
                    setJustification(resolvedActiveTextObject.twoLinerJustification || 'Left');
                    setLocationValue(resolvedActiveTextObject.twoLinerTop.text || resolvedActiveTextObject.text || '');
                    return;
                }

                setLanguage('English');
                setLocationValue(resolvedActiveTextObject.text || '');
            } else {
                setActiveTextObject(null);
            }
        };

        syncSelectedTextObject();

        canvas.on('selection:created', syncSelectedTextObject);
        canvas.on('selection:updated', syncSelectedTextObject);
        canvas.on('selection:cleared', syncSelectedTextObject);
        canvas.on('object:modified', syncSelectedTextObject);

        return () => {
            canvas.off('selection:created', syncSelectedTextObject);
            canvas.off('selection:updated', syncSelectedTextObject);
            canvas.off('selection:cleared', syncSelectedTextObject);
            canvas.off('object:modified', syncSelectedTextObject);
        };
    }, [canvas, setColor, setXHeight]);

    useEffect(() => {
        const fallbackLanguage = language === '2Liner' ? 'English' : language;
        const availableRegions = getRegionNames(fallbackLanguage);

        if (!availableRegions.includes(regionName)) {
            const nextRegion = availableRegions[0] || '';
            setRegionName(nextRegion);

            const locations = getLocationsForRegion(nextRegion, fallbackLanguage);
            setLocationValue(locations[0] || '');
            if (language === '2Liner') {
                setText(locations[0] || '');
            }
            return;
        }

        const locations = getLocationsForRegion(regionName, fallbackLanguage);
        if (!locations.includes(locationValue)) {
            const nextLocation = locations[0] || '';
            setLocationValue(nextLocation);
            if (language === '2Liner') {
                setText(nextLocation);
            }
        }
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

    const handleSubmit = () => {
        if (!canvas) return;

        const trimmedText = (language === '2Liner' ? locationValue : text).trim();
        if (!trimmedText) return;

        const resolvedXHeight = Number(xHeight) || GeneralSettings.xHeight || 100;
        const effectiveLanguage = normalizeLanguage(language);
        const resolvedFont = FONT_OPTIONS.some((option) => option.value === font) ? font : 'TransportMedium';
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
            setActiveTextObject(targetObject);
            canvas.requestRenderAll();
            return;
        }

        if (targetObject && targetObject.functionalType === 'Text') {
            const translatedText = effectiveLanguage === 'Chinese'
                ? (findCorrespondingLocation(trimmedText, 'English', 'Chinese') || trimmedText)
                : trimmedText;
            const finalText = effectiveLanguage === 'Chinese' ? translatedText : trimmedText;

            targetObject.updateText(finalText, resolvedXHeight, resolvedFont, resolvedColor, targetObject.charSpacing || 0);
            targetObject.set({
                left: targetObject.left,
                top: targetObject.top,
            });
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
            canvas.setActiveObject(targetObject);
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

            <div>
                <div className="input-group">
                    <label className="input-label">Font</label>
                    <select
                        className="input-field"
                        value={FONT_OPTIONS.some((option) => option.value === font) ? font : 'TransportMedium'}
                        onChange={(e) => setFont(e.target.value)}
                    >
                        {FONT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <h2 className="tab-title">Destination Settings</h2>

                <div className="input-group">
                    <label className="input-label">Language</label>
                    <select
                        className="input-field"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                    >
                        {LANGUAGE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {language === '2Liner' && (
                    <div className="input-group">
                        <label className="input-label">Justification</label>
                        <select
                            className="input-field"
                            value={justification}
                            onChange={(e) => setJustification(e.target.value)}
                        >
                            {JUSTIFICATION_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label">Region</label>
                    <select
                        className="input-field"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                    >
                        {getRegionNames(language === '2Liner' ? 'English' : language).map((region) => (
                            <option key={region} value={region}>
                                {region}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label className="input-label">Location</label>
                    <select
                        className="input-field"
                        value={locationValue}
                        onChange={(e) => {
                            const nextLocation = e.target.value;
                            setLocationValue(nextLocation);
                            setText(nextLocation);
                        }}
                    >
                        {getLocationsForRegion(regionName, language === '2Liner' ? 'English' : language).map((location) => (
                            <option key={location} value={location}>
                                {location}
                            </option>
                        ))}
                    </select>
                </div>

                {language === '2Liner' && (
                    <div className="input-group">
                        <div className="info-text">
                            Text input is disabled in 2Liner mode. Select the location in the destination panel.
                        </div>
                    </div>
                )}

                <div className="input-group">
                    <label className="input-label">Text</label>
                    <input
                        type="text"
                        className="input-field"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        disabled={language === '2Liner'}
                        placeholder="Enter text to place on canvas"
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">
                        <input
                            type="checkbox"
                            checked={underline}
                            onChange={(e) => setUnderline(e.target.checked)}
                            style={{ marginRight: '8px' }}
                        />
                        Underline
                    </label>
                </div>

                <button className="btn-small" onClick={handleSubmit}>
                    {activeTextObject && language !== '2Liner' ? 'Update Text' : 'Add Text'}
                </button>

                <button className="btn-small" onClick={() => FontPriorityManager.showModal()}>
                    Open Font Settings
                </button>

                <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>
                    Click the canvas to position the text after adding it.
                </p>
            </div>
        </div>
    );
}