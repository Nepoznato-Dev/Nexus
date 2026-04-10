import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { WindowMemoryManager } from '../../utils/WindowMemoryManager';

/**
 * Memory Stats Monitor
 * Displays real-time memory usage and resource count
 */
export function MemoryStatsWidget() {
    const [memory, setMemory] = useState(null);
    const [resourceCount, setResourceCount] = useState(0);

    useEffect(() => {
        let tick = 0;
        const interval = setInterval(() => {
            tick += 1;
            const isVisible = typeof document === 'undefined' || document.visibilityState === 'visible';

            // Poll frequently while visible, much less when hidden.
            if (!isVisible && tick % 5 !== 0) {
                return;
            }

            // Get memory usage
            if (performance.memory) {
                setMemory({
                    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(1),
                    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(1),
                    limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(1),
                    percent: ((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100).toFixed(0)
                });
            }

            // Get resource count from WindowMemoryManager
            try {
                const stats = WindowMemoryManager.getStats();
                setResourceCount(stats.totalWindows);
            } catch (e) { }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (!memory) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '85px',
            right: '12px',
            backgroundColor: 'rgba(20,20,20,0.9)',
            border: '1px solid rgba(77,150,255,0.3)',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: '#fff',
            zIndex: 5001,
            minWidth: '160px',
            fontFamily: 'monospace',
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                color: '#4d96ff',
                fontWeight: '600'
            }}>
                <Zap size={14} />
                Memory Stats
            </div>

            <div style={{ lineHeight: '1.6', color: '#aaa' }}>
                <div>Used: <span style={{ color: memory.percent > 70 ? '#ff6b6b' : '#4d96ff' }}>{memory.used}MB</span></div>
                <div>Total: {memory.total}MB</div>
                <div>Limit: {memory.limit}MB</div>
                <div style={{
                    marginTop: '6px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '6px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                width: `${Math.min(memory.percent, 100)}%`,
                                height: '100%',
                                backgroundColor: memory.percent > 70 ? '#ff6b6b' : memory.percent > 50 ? '#ffa500' : '#4d96ff',
                                transition: 'width 200ms'
                            }} />
                        </div>
                        <span>{memory.percent}%</span>
                    </div>
                </div>
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#666' }}>
                    {resourceCount} window{resourceCount !== 1 ? 's' : ''} open
                </div>
            </div>
        </div>
    );
}
