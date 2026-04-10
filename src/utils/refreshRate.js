/**
 * Detects the monitor's refresh rate
 * @returns {Promise<number>} - Detected refresh rate in Hz
 */
export async function detectRefreshRate() {
    return new Promise((resolve) => {
        let rafId;
        const samples = [];
        let lastTime = performance.now();
        let sampleCount = 0;
        const maxSamples = 60;

        const measure = (time) => {
            if (sampleCount > 0) {
                const delta = time - lastTime;
                samples.push(delta);
            }

            lastTime = time;
            sampleCount++;

            if (sampleCount < maxSamples) {
                rafId = requestAnimationFrame(measure);
            } else {
                // Calculate refresh rate from average delta
                const avgDelta = samples.reduce((a, b) => a + b) / samples.length;
                const refreshRate = Math.round(1000 / avgDelta);

                // Sanitize the result - common refresh rates
                if (refreshRate >= 140 && refreshRate <= 170) {
                    resolve(144);
                } else if (refreshRate >= 170 && refreshRate <= 200) {
                    resolve(180);
                } else if (refreshRate >= 200 && refreshRate <= 260) {
                    resolve(240);
                } else if (refreshRate >= 50 && refreshRate <= 65) {
                    resolve(60);
                } else if (refreshRate >= 65 && refreshRate <= 85) {
                    resolve(75);
                } else if (refreshRate >= 85 && refreshRate <= 110) {
                    resolve(90);
                } else if (refreshRate >= 110 && refreshRate <= 130) {
                    resolve(120);
                } else {
                    // Default to 60Hz if we can't determine
                    resolve(60);
                }
            }
        };

        rafId = requestAnimationFrame(measure);
    });
}

/**
 * Hook to get and cache the refresh rate
 */
let cachedRefreshRate = null;

export async function getRefreshRate() {
    if (cachedRefreshRate === null) {
        cachedRefreshRate = await detectRefreshRate();
    }
    return cachedRefreshRate;
}
