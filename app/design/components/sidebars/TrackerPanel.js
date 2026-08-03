'use client';

import React, { useEffect, useState } from 'react';

import { useI18n } from '../../lib/i18n/I18nProvider.js';
import { canvasTracker } from '../../lib/utils/Tracker.js';

export default function TrackerPanel() {
    const { t } = useI18n();
    const [history, setHistory] = useState([...canvasTracker.history]);
    const [historyIndex, setHistoryIndex] = useState(canvasTracker.historyIndex);

    useEffect(() => {
        const refresh = () => {
            setHistory([...canvasTracker.history]);
            setHistoryIndex(canvasTracker.historyIndex);
        };

        canvasTracker.addHistoryChangeCallback(refresh);
        refresh();

        return () => {
            canvasTracker.removeHistoryChangeCallback(refresh);
        };
    }, []);

    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">{t('History Controls')}</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.clearHistory()}>{t('clear')}</button>
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.undo()}>{t('undo')}</button>
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.redo()}>{t('redo')}</button>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">{t('Timeline')}</label>
                <div className="object-list-panel" style={{ maxHeight: '320px' }}>
                    {history.length === 0 ? (
                        <div className="object-list-empty">{t('No history available')}</div>
                    ) : (
                        history.map((entry, index) => {
                            const isCurrent = index === historyIndex;
                            return (
                                <button
                                    key={`${entry.timestamp || index}-${index}`}
                                    type="button"
                                    className={`object-list-button ${isCurrent ? 'object-list-button-active' : ''}`}
                                    onClick={() => canvasTracker.restoreState(index)}
                                >
                                    <span className="object-list-button-name">
                                        {entry.timestamp || 'Unknown time'} - {entry.description || `State ${index + 1}`}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}