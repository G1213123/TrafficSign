'use client';

import React from 'react';

export default function InfoPanel() {
    return (
        <div className="space-y-4">
            <div className="input-group">
                <label className="input-label">Project Info</label>
                <div style={{ color: '#ddd', lineHeight: 1.55, fontSize: '13px' }}>
                    Road Sign Factory is being migrated from the legacy sidebar system to the React layout. The current work keeps the main drawing flows intact while each panel is rebuilt as a reusable component.
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Migrated Panels</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.6 }}>
                    Draw, text, border, and the shared toggle component are already in place. The remaining panels now have React layouts so they can be wired progressively without changing the shell again.
                </div>
            </div>
        </div>
    );
}