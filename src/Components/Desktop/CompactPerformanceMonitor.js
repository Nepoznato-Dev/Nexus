import React from 'react';
import { Cpu, HardDrive, Activity, Layers } from 'lucide-react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor.js';

export default function CompactPerformanceMonitor({ visible }) {
    const metrics = usePerformanceMonitor();

    if (!visible) return null;

    const getPercentColor = (value) => {
        if (value >= 80) return '#ef4444';
        if (value >= 60) return '#f59e0b';
        return '#22c55e';
    };

    const getFpsColor = (value) => {
        if (value >= 55) return '#22c55e';
        if (value >= 35) return '#f59e0b';
        return '#ef4444';
    };

    const StatRow = ({ icon: Icon, label, value, color, valueColor, suffix = '%' }) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} color={color} strokeWidth={2} />
                <span style={{ fontSize: '12px', color: '#ccc', fontWeight: 500 }}>{label}</span>
            </div>
            <span style={{ fontSize: '12px', color: valueColor || '#fff', fontWeight: 700 }}>
                {typeof value === 'number' ? `${value}${suffix}` : value}
            </span>
        </div>
    );

    return (
        <div style={{
            backgroundColor: 'rgba(26, 26, 26, 0.98)',
            backdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '8px',
            minWidth: '160px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.1) inset',
            opacity: visible ? 1 : 0,
            transform: visible ? 'scale(1)' : 'scale(0.98)',
            transition: 'opacity 0.2s ease, transform 0.2s ease',
        }}>
            <div style={{
                fontSize: '11px',
                color: '#888',
                fontWeight: 600,
                marginBottom: '6px',
                paddingLeft: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                Performance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <StatRow icon={Cpu} label="CPU" value={metrics.cpu} color="#3b82f6" valueColor={getPercentColor(metrics.cpu)} />
                <StatRow icon={Activity} label="GPU" value={metrics.gpu} color="#10b981" valueColor={getPercentColor(metrics.gpu)} />
                <StatRow icon={HardDrive} label="RAM" value={metrics.ram.percentage} color="#f59e0b" valueColor={getPercentColor(metrics.ram.percentage)} />
                <StatRow icon={Layers} label="FPS" value={metrics.fps} color="#8b5cf6" valueColor={getFpsColor(metrics.fps)} suffix="" />
            </div>
        </div>
    );
}
