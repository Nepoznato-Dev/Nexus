import React from 'react';
import AIChat from '../../F.L.U.X. - Fast Logic & URL eXtraction/AIChat_new.js';

export default function AIApp() {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)'
        }}>
            <AIChat />
        </div>
    );
}
