import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Cpu, Zap, HardDrive, Wifi } from 'lucide-react';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor.js';
import { useRenderManager } from '../../rendering/RenderManagerProvider';

/**
 * PerformancePanel
 * Static panel that sits beside the sidebar showing live performance stats.
 */
export default function PerformancePanel({ visible, sidebarWidth = 72, width = 320 }) {
  const metrics = usePerformanceMonitor();
  const { refreshStatus } = useRenderManager();
  const [memory, setMemory] = useState(null);
  const [network, setNetwork] = useState(null);
  const [storage, setStorage] = useState(null);
  const [latency, setLatency] = useState(null);

  // Derive status from FPS
  const status = metrics.fps < 30 ? 'throttled' : metrics.fps < 45 ? 'adjusting' : 'stable';

  // Poll memory/network/storage/latency every 2s
  useEffect(() => {
    if (!visible) return undefined;

    const poll = async () => {
      if (performance && performance.memory) {
        const { usedJSHeapSize, totalJSHeapSize } = performance.memory;
        setMemory({
          used: usedJSHeapSize / 1048576,
          total: totalJSHeapSize / 1048576,
        });
      }

      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection) {
        setNetwork({
          downlink: connection.downlink,
          type: connection.effectiveType,
        });
      }

      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        setStorage({
          used: (estimate.usage || 0) / 1048576,
          quota: (estimate.quota || 0) / 1048576,
        });
      }

      // Simple latency ping to a fast endpoint
      const start = performance.now();
      try {
        await fetch('https://www.cloudflare.com/cdn-cgi/trace', { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
        setLatency(Math.round(performance.now() - start));
      } catch {
        setLatency(null);
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [visible]);

  const statusStyles = useMemo(() => ({
    stable: 'text-green-400 border-green-500/30 bg-green-500/5',
    adjusting: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5',
    throttled: 'text-red-400 border-red-500/30 bg-red-500/5',
  }), []);

  if (!visible) return null;

  const latestAction = refreshStatus?.lastAction || null;
  const actionsApi = typeof window !== 'undefined' ? window.nexusRefreshActions : null;

  return (
    <aside
      className="h-full border-r border-white/10 backdrop-blur-sm text-white"
      style={{ width }}
    >
      <div className="h-full flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-300" />
          <div>
            <div className="text-sm text-white/70">Performance</div>
            <div className={`text-xs px-2 py-0.5 rounded-full inline-flex ${statusStyles[status]}`}>
              {status === 'stable' ? 'Stable' : status === 'adjusting' ? 'Adjusting' : 'Throttled'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <MetricCard icon={Zap} label="FPS" value={metrics.fps} suffix="fps" accent={statusStyles[status]} />
          <MetricCard
            icon={Cpu}
            label="Memory"
            value={memory ? `${memory.used.toFixed(0)} / ${memory.total.toFixed(0)} MB` : '—'}
            accent="border-blue-500/30 bg-blue-500/5"
          />
          <MetricCard
            icon={HardDrive}
            label="Storage"
            value={storage ? `${storage.used.toFixed(0)} / ${storage.quota.toFixed(0)} MB` : '—'}
            accent="border-emerald-500/30 bg-emerald-500/5"
          />
          <MetricCard
            icon={Wifi}
            label="Network"
            value={network ? `${network.downlink?.toFixed(1)} Mbps (${network.type})` : '—'}
            accent="border-cyan-500/30 bg-cyan-500/5"
          />
          <MetricCard
            icon={Zap}
            label="Latency"
            value={latency !== null ? `${latency} ms` : '—'}
            accent="border-purple-500/30 bg-purple-500/5"
          />
        </div>

        <div className="rounded-lg border border-white/15 bg-white/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/70">Refresh Actions</span>
            <span className="text-[11px] text-white/50">Queue: {refreshStatus?.queueLength ?? 0}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="text-[11px] px-2 py-1 rounded border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
              onClick={() => actionsApi?.enqueue?.('refresh-current-view', { reason: 'manual' })}
            >
              Refresh View
            </button>
            <button
              type="button"
              className="text-[11px] px-2 py-1 rounded border border-amber-400/40 text-amber-200 hover:bg-amber-500/10"
              onClick={() => actionsApi?.setSafeMode?.(!(refreshStatus?.safeMode))}
            >
              Safe Mode: {refreshStatus?.safeMode ? 'On' : 'Off'}
            </button>
          </div>

          {latestAction && (
            <div className="text-[11px] text-white/60">
              Last: {latestAction.name} ({latestAction.status}) in {latestAction.durationMs} ms
            </div>
          )}

          {(refreshStatus?.autoDisabled?.length ?? 0) > 0 && (
            <div className="text-[11px] text-rose-300">
              Auto-disabled: {refreshStatus.autoDisabled.join(', ')}
            </div>
          )}
        </div>

        <div className="text-xs text-white/50">
          Panel is static and pinned beside the sidebar for quick monitoring.
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ icon: Icon, label, value, suffix, accent }) {
  return (
    <div className={`rounded-lg border ${accent} px-3 py-2 bg-white/5`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-white/70" />
        <span className="text-sm text-white/70">{label}</span>
      </div>
      <div className="text-lg font-semibold text-white flex items-baseline gap-1">
        {value}
        {suffix && <span className="text-xs text-white/50">{suffix}</span>}
      </div>
    </div>
  );
}