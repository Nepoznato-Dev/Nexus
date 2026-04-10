import React, { useMemo } from 'react';

export default function SystemInfoApp() {
    const info = useMemo(() => {
        const memory = performance && performance.memory
            ? Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
            : null;

        return [
            { label: 'Browser', value: navigator.userAgent },
            { label: 'Platform', value: navigator.platform || 'Unknown' },
            { label: 'Language', value: navigator.language || 'Unknown' },
            { label: 'Logical Cores', value: navigator.hardwareConcurrency || 'Unknown' },
            { label: 'Device Memory', value: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'Unknown' },
            { label: 'Screen', value: `${window.screen.width}x${window.screen.height}` },
            { label: 'JS Heap Usage', value: memory !== null ? `${memory}%` : 'Unavailable' }
        ];
    }, []);

    return (
        <div style={{
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '16px'
        }}>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>System Information</div>

            <div style={{
                backgroundColor: '#0b1220',
                border: '1px solid #1f2a44',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {info.map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: '12px' }}>
                        <div style={{ width: '140px', color: '#94a3b8', fontSize: '12px' }}>{item.label}</div>
                        <div style={{ fontSize: '12px', color: '#e2e8f0', wordBreak: 'break-word' }}>{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
