import React from 'react';
import { useRenderPermission } from './RenderManagerProvider';

const PRESSURE_TO_QUALITY = {
    stable: 'ultra',
    strained: 'high',
    degraded: 'medium',
    critical: 'low',
};

export default function RenderGate({
    id,
    priority = 'normal',
    budgetCost = 1,
    layer = 'content',
    fallback = null,
    children,
}) {
    const { enabled, pressure, bootPhase } = useRenderPermission({ id, priority, budgetCost, layer });

    if (!enabled) {
        return fallback;
    }

    if (typeof children === 'function') {
        return children({
            pressure,
            bootPhase,
            quality: PRESSURE_TO_QUALITY[pressure] || 'high',
        });
    }

    return children;
}
