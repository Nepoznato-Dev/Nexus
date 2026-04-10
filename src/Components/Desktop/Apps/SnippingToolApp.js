import React, { useState } from 'react';

export default function SnippingToolApp() {
    const [message, setMessage] = useState('Click New Snip to start.');
    const [delay, setDelay] = useState(0);

    const handleNewSnip = () => {
        const delayMs = delay * 1000;
        setMessage(`Starting snip in ${delay} seconds...`);
        setTimeout(() => {
            setMessage('Use your browser screenshot shortcut (Ctrl+Shift+S).');
        }, delayMs || 10);
    };

    return (
        <div style={{
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '16px'
        }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>Snipping Tool</div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <button
                    onClick={handleNewSnip}
                    style={{
                        padding: '10px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: '#f97316',
                        color: '#0b1220',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    New Snip
                </button>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#cbd5f5',
                    fontSize: '12px'
                }}>
                    Delay
                    <select
                        value={delay}
                        onChange={(e) => setDelay(Number(e.target.value))}
                        style={{
                            backgroundColor: '#0b1220',
                            border: '1px solid #1f2a44',
                            color: '#fff',
                            borderRadius: '6px',
                            padding: '6px 8px'
                        }}
                    >
                        <option value={0}>0s</option>
                        <option value={3}>3s</option>
                        <option value={5}>5s</option>
                    </select>
                </div>
            </div>

            <div style={{
                flex: 1,
                border: '1px dashed #1f2a44',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '13px'
            }}>
                {message}
            </div>
        </div>
    );
}
