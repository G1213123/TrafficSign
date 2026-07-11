'use client';

import React, { useState } from 'react';

import SidebarToggleGroup from './SidebarToggleGroup.js';

const ROUTE_TYPES = ['Main Line', 'Roundabout', 'Spiral Roundabout', 'Diverge'];
const ROUNDABOUT_TYPES = ['Conventional', 'Spiral'];
const OVAL_POSITIONS = ['Left', 'Middle'];

export default function RouteMapPanel() {
    const [routeType, setRouteType] = useState('Main Line');
    const [roundaboutType, setRoundaboutType] = useState('Conventional');
    const [ovalPosition, setOvalPosition] = useState('Left');

    return (
        <div className="space-y-4">
            <SidebarToggleGroup
                label="Main Road Type"
                options={ROUTE_TYPES}
                value={routeType}
                onChange={setRouteType}
            />

            {routeType === 'Roundabout' || routeType === 'Spiral Roundabout' ? (
                <SidebarToggleGroup
                    label="Roundel Shape"
                    options={ROUNDABOUT_TYPES}
                    value={roundaboutType}
                    onChange={setRoundaboutType}
                />
            ) : null}

            {routeType === 'Roundabout' || routeType === 'Spiral Roundabout' ? (
                <SidebarToggleGroup
                    label="Oval Position"
                    options={OVAL_POSITIONS}
                    value={ovalPosition}
                    onChange={setOvalPosition}
                />
            ) : null}

            <div className="input-group">
                <label className="input-label">Route Layout</label>
                <div style={{ color: '#aaa', fontSize: '12px', lineHeight: 1.5 }}>
                    Route-map layout is being migrated to React. This panel now carries the same control structure as the legacy sidebar so the drawing flow can be wired in next.
                </div>
            </div>

            <button type="button" className="btn-small">
                Prepare Route Map
            </button>
        </div>
    );
}