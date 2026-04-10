import React from 'react';
import Settings from '../../../PagesDisplay/Settings';

export default function SettingsApp() {
    return (
        <div style={{ height: '100%', overflow: 'auto', backgroundColor: 'transparent' }}>
            <Settings embedded />
        </div>
    );
}
