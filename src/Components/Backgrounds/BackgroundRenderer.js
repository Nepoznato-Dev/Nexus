import React from 'react';
import SoftParticleDrift from './SoftParticleDrift.js';
import Fireflies from './Fireflies.js';
import GeometricPatterns from './GeometricPatterns.js';
import NetworkNodes from './NetworkNodes.js';

export default function BackgroundRenderer({
    type = 'soft-particle-drift',
    accentColor = '#00f0ff',
    particleCount = 50,
    speed = 0.5,
    opacity = 0.4,
    blur = 2,
    lowEndMode = false,
    targetFPS = 60,
    maxFPS = 165,
    inactiveFPS = 10,
    vsyncEnabled = true,
    animationScale = 1,
}) {
    if (type === 'none') return null;

    // Apply animation scaling to speed for consistent performance
    const scaledSpeed = speed * animationScale;

    const sharedProps = {
        accentColor,
        speed: scaledSpeed,
        opacity,
        lowEndMode,
        targetFPS,
        maxFPS,
        inactiveFPS,
        vsyncEnabled
    };

    switch (type) {
        case 'soft-particle-drift':
            return (
                <SoftParticleDrift
                    {...sharedProps}
                    particleCount={particleCount}
                    blur={blur}
                />
            );
        case 'fireflies':
            return (
                <Fireflies
                    {...sharedProps}
                    count={particleCount}
                    glowSize={Math.max(10, Math.round(blur * 8))}
                />
            );
        case 'geometric':
            return (
                <GeometricPatterns
                    {...sharedProps}
                    density={Math.max(15, 120 - particleCount)}
                />
            );
        case 'network-nodes':
            return (
                <NetworkNodes
                    {...sharedProps}
                    nodeCount={particleCount}
                />
            );
        default:
            return null;
    }
}
