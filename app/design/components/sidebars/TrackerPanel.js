'use client';

import React, { useEffect, useState } from 'react';

import { canvasTracker } from '../../lib/utils/Tracker.js';

export default function TrackerPanel() {
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
                <label className="input-label">History Controls</label>
                <div className="toggle-container">
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.clearHistory()}>Clear</button>
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.undo()}>Undo</button>
                    <button type="button" className="toggle-button" onClick={() => canvasTracker.redo()}>Redo</button>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Timeline</label>
                <div className="object-list-panel" style={{ maxHeight: '320px' }}>
                    {history.length === 0 ? (
                        <div className="object-list-empty">No history</div>
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