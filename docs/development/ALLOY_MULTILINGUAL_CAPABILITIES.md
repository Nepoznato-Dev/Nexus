# ALLOY Multilingual Capability Contract

ALLOY is multi-runtime by responsibility, not by duplication.

## Ownership

JavaScript owns browser-native, low-latency capabilities:

- FPS and long-task observation
- heap and network telemetry collection
- immediate UI-side throttling and fail-soft behavior
- page and interaction sensing

Python owns orchestration and policy:

- stage gating
- branch-merge enable/disable decisions
- reasoning budget and response strategy
- confidence, self-awareness, and planning logic

## Contract Rule

Each capability has one primary owner. Other runtimes may consume the signal, but they should not duplicate the collection logic unless there is a fallback requirement.

## Browser-to-Python Payload

Current schema version: `alloy.capability.v1`

Example payload:

```json
{
  "schemaVersion": "alloy.capability.v1",
  "source": "browser-js",
  "collectedAt": "2026-03-16T00:00:00.000Z",
  "fps": 58,
  "longTaskCount": 2,
  "heapUsedMB": 240.5,
  "rttMs": 80,
  "runtime": {
    "performance": {
      "fps": 58,
      "fpsAverage": 57.7,
      "longTaskCount": 2,
      "longTaskRate": 1.4,
      "heapUsedMB": 240.5,
      "rttMs": 80,
      "eventLoopLagMs": 12,
      "interactionLatencyMs": 18,
      "uiPressure": "stable",
      "health": "stable",
      "sampleWindowMs": 40000
    },
    "ui": {
      "interactionLatencyMs": 18,
      "eventLoopLagMs": 12,
      "uiPressure": "stable"
    },
    "environment": {
      "hardwareConcurrency": 8,
      "deviceMemory": 8,
      "userAgent": "..."
    }
  },
  "capabilities": {
    "owner": "javascript",
    "collector": "alloyPerformanceMonitor",
    "canCollectRealtimeMetrics": true,
    "canThrottleUIWork": true,
    "shouldReportToAlloy": true
  }
}
```

## Compatibility

Python currently accepts both:

- legacy flat site state fields: `fps`, `longTaskCount`, `heapUsedMB`, `rttMs`
- nested capability payloads under `runtime.performance`
- UI pressure fields under `runtime.ui`

This allows gradual migration without breaking existing callers.

## Python Capability Registry

ALLOY now exposes a Python-side capability registry in transparency and metadata. Its role is to make ownership explicit instead of relying on implicit assumptions.

Current registry tracks:

- `browser-performance` owned by JavaScript
- `ui-throttle` owned by JavaScript
- `reasoning-policy` owned by Python
- `branch-merge` owned by Python

## Near-Term Extension Points

- Route module decisions through the capability registry instead of ad hoc runtime checks.
- Add optional Rust or WASM only for proven hot paths, not speculative complexity.
