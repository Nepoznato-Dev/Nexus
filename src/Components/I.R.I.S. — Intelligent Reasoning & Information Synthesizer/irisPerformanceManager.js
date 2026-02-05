/**
 * IRIS Performance Manager & Smart Task Killer
 * Auto-optimizes system resources with user-friendly notifications
 */

/**
 * Performance monitoring and auto-optimization system
 */
export class IRISPerformanceManager {
  constructor() {
    this.monitoringInterval = null;
    this.suspendedTasks = new Map();
    this.performanceHistory = [];
    this.safeMode = false;
    this.userPreferences = {
      autoOptimize: true,
      aggressiveness: 'medium', // low, medium, high
      notifyOnActions: true,
      protectedApps: [], // Never auto-suspend these
      allowActiveCull: true,
      allowSelfCull: false,
      customMessages: {
        optimization: "I.R.I.S has automatically stopped '{process}' to improve performance! {activity}.",
        resumed: "{process} has been resumed! 🚀",
        stopped: "{process} has been stopped.",
        fallbackActivity: "Enjoy your experience lag free! 😄"
      }
    };
  }

  /**
   * Start monitoring system performance
   */
  startMonitoring() {
    this.monitoringInterval = setInterval(() => {
      this.checkPerformance();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Get current system resource usage
   */
  async getSystemUsage() {
    const usage = {
      ram: {
        used: performance.memory?.usedJSHeapSize || 0,
        total: performance.memory?.totalJSHeapSize || 0,
        limit: performance.memory?.jsHeapSizeLimit || 0,
        percentage: 0
      },
      cpu: await this.estimateCPUUsage(),
      gpu: await this.estimateGPUUsage(),
      processes: this.getActiveProcesses()
    };

    usage.ram.percentage = (usage.ram.used / usage.ram.limit) * 100;

    return usage;
  }

  /**
   * Estimate CPU usage (approximate via performance API)
   */
  async estimateCPUUsage() {
    const start = performance.now();
    
    // Run a small benchmark
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
      sum += Math.sqrt(i);
    }
    
    const duration = performance.now() - start;
    
    // Baseline: ~2ms on fast CPU, ~10ms on slow CPU
    // Higher = more CPU load
    const cpuLoad = Math.min(100, (duration / 10) * 100);
    
    return {
      estimated: cpuLoad,
      benchmark: duration,
      status: cpuLoad > 80 ? 'high' : cpuLoad > 50 ? 'medium' : 'low'
    };
  }

  /**
   * Estimate GPU usage (via FPS monitoring)
   */
  async estimateGPUUsage() {
    // Check FPS - if low and CPU is fine, GPU is likely bottleneck
    const fps = this.getCurrentFPS();
    
    return {
      fps,
      estimated: fps < 30 ? 'high' : fps < 50 ? 'medium' : 'low',
      status: fps < 30 ? 'struggling' : fps < 50 ? 'moderate' : 'good'
    };
  }

  /**
   * Get all active processes/tasks sorted by resource usage
   */
  getActiveProcesses() {
    const processes = [];

    // Check browser tabs/iframes
    if (typeof document !== 'undefined') {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe, index) => {
        const src = iframe.src || iframe.dataset.src;
        processes.push({
          id: `iframe-${index}`,
          name: this.getProcessName(src),
          type: 'browser',
          element: iframe,
          estimatedRAM: this.estimateIframeRAM(iframe),
          estimatedCPU: this.estimateIframeCPU(iframe),
          active: this.isElementVisible(iframe),
          canSuspend: !iframe.dataset.protected
        });
      });
    }

    // Check canvas elements (games)
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach((canvas, index) => {
      processes.push({
        id: `canvas-${index}`,
        name: 'Game/Canvas',
        type: 'game',
        element: canvas,
        estimatedRAM: this.estimateCanvasRAM(canvas),
        estimatedCPU: 'high', // Canvas usually CPU/GPU intensive
        active: this.isElementVisible(canvas),
        canSuspend: !canvas.dataset.protected
      });
    });

    // Check AI thinking processes
    if (window.aiThinkingActive) {
      processes.push({
        id: 'ai-thinking',
        name: 'IRIS AI Processing',
        type: 'ai',
        estimatedRAM: 'medium',
        estimatedCPU: 'medium',
        active: true,
        canSuspend: true
      });
    }

    // Check media players
    const videos = document.querySelectorAll('video');
    videos.forEach((video, index) => {
      processes.push({
        id: `video-${index}`,
        name: video.dataset.title || 'Video Player',
        type: 'media',
        element: video,
        estimatedRAM: 'medium',
        estimatedCPU: video.paused ? 'low' : 'medium',
        active: !video.paused,
        canSuspend: !video.dataset.protected
      });
    });

    // Check open widgets (protected from culling when open)
    const widgets = document.querySelectorAll('[data-widget-open="true"]');
    widgets.forEach((widget, index) => {
      const widgetId = widget.dataset.widgetId || `widget-${index}`;
      const widgetTitle = widget.querySelector('h3')?.textContent || 'Widget';
      
      processes.push({
        id: widgetId,
        name: `Widget: ${widgetTitle}`,
        type: 'widget',
        element: widget,
        estimatedRAM: 'low',
        estimatedCPU: 'low',
        active: true,
        canSuspend: false // Never suspend open widgets
      });
    });

    // Sort by estimated resource usage (RAM + CPU combined)
    return processes.sort((a, b) => {
      const scoreA = this.getResourceScore(a);
      const scoreB = this.getResourceScore(b);
      return scoreB - scoreA; // Highest first
    });
  }

  /**
   * Calculate resource score for sorting
   */
  getResourceScore(process) {
    const ramScore = {
      'low': 1,
      'medium': 5,
      'high': 10
    };

    const cpuScore = {
      'low': 1,
      'medium': 5,
      'high': 10
    };

    const ram = typeof process.estimatedRAM === 'number' 
      ? process.estimatedRAM / 10000000 // Convert bytes to score
      : ramScore[process.estimatedRAM] || 1;

    const cpu = cpuScore[process.estimatedCPU] || 1;

    return ram + cpu;
  }

  /**
   * Check performance and auto-optimize if needed
   */
  async checkPerformance() {
    const usage = await this.getSystemUsage();
    
    // Store history
    this.performanceHistory.push({
      timestamp: Date.now(),
      ...usage
    });

    // Keep only last 60 entries (5 minutes at 5s intervals)
    if (this.performanceHistory.length > 60) {
      this.performanceHistory.shift();
    }

    // Check if optimization needed
    if (this.userPreferences.autoOptimize) {
      if (this.safeMode) {
        await this.runMinimalCulling(usage);
      } else {
        await this.autoOptimize(usage);
      }
    }

    return usage;
  }

  /**
   * Auto-optimize based on current performance
   */
  async autoOptimize(usage) {
    const { aggressiveness } = this.userPreferences;
    
    // Thresholds based on aggressiveness
    const thresholds = {
      low: { ram: 85, cpu: 85 },
      medium: { ram: 75, cpu: 75 },
      high: { ram: 60, cpu: 60 }
    };

    const threshold = thresholds[aggressiveness];

    // Check if we need to optimize
    const needsOptimization = 
      usage.ram.percentage > threshold.ram ||
      usage.cpu.estimated > threshold.cpu;

    if (!needsOptimization) return;

    // Find processes to suspend
    const processes = usage.processes;
    const isCritical = usage.ram.percentage > 90 || usage.cpu.estimated > 90;

    const suspendable = processes.filter(p => 
      p.canSuspend &&
      !this.userPreferences.protectedApps.includes(p.name) &&
      (this.userPreferences.allowActiveCull || !p.active) &&
      (p.type !== 'ai' || (this.userPreferences.allowSelfCull && isCritical))
    );

    // Suspend processes until performance improves
    for (const process of suspendable) {
      if (usage.ram.percentage < threshold.ram && usage.cpu.estimated < threshold.cpu) {
        break; // Performance improved, stop suspending
      }

      if (!this.userPreferences.allowActiveCull && process.active) {
        continue;
      }

      await this.suspendProcess(process);
      
      // Re-check performance after suspension
      usage = await this.getSystemUsage();
    }
  }

  /**
   * Suspend a process to free resources
   */
  async suspendProcess(process) {
    if (this.suspendedTasks.has(process.id)) return; // Already suspended

    let savedState = null;

    switch (process.type) {
      case 'browser':
        savedState = {
          src: process.element.src,
          position: {
            scrollTop: process.element.contentWindow?.scrollY || 0,
            scrollLeft: process.element.contentWindow?.scrollX || 0
          }
        };
        // Remove iframe from DOM
        process.element.dataset.suspended = 'true';
        process.element.src = 'about:blank';
        break;

      case 'game':
        savedState = {
          parent: process.element.parentNode,
          nextSibling: process.element.nextSibling,
          width: process.element.width,
          height: process.element.height,
          style: process.element.getAttribute('style')
        };

        if (window.pauseGameRendering) {
          window.pauseGameRendering(process.element);
        }

        process.element.dataset.suspended = 'true';
        process.element.setAttribute('style', 'display: none !important;');
        break;

      case 'ai':
        // Pause AI thinking
        if (window.pauseAIThinking) {
          window.pauseAIThinking();
        }
        savedState = { thinking: true };
        this.safeMode = true;
        break;

      case 'media':
        savedState = {
          src: process.element.currentSrc || process.element.src,
          time: process.element.currentTime,
          paused: process.element.paused
        };

        process.element.pause();
        process.element.src = '';
        break;
    }

    this.suspendedTasks.set(process.id, {
      process,
      savedState,
      suspendedAt: Date.now()
    });

    // Notify user
    if (this.userPreferences.notifyOnActions) {
      const activity = this.getCurrentActivity();
      const message = this.formatOptimizationMessage(process, activity);
      this.notifyUser(message, 'optimization');
    }

    return true;
  }

  /**
   * Resume a suspended process
   */
  async resumeProcess(processId) {
    const suspended = this.suspendedTasks.get(processId);
    if (!suspended) return;

    const { process, savedState } = suspended;

    switch (process.type) {
      case 'browser':
        process.element.src = savedState.src;
        // Restore scroll position after load
        process.element.onload = () => {
          if (process.element.contentWindow) {
            process.element.contentWindow.scrollTo(
              savedState.position.scrollLeft,
              savedState.position.scrollTop
            );
          }
        };
        delete process.element.dataset.suspended;
        break;

      case 'game':
        if (savedState?.style) {
          process.element.setAttribute('style', savedState.style);
        } else {
          process.element.removeAttribute('style');
        }

        if (window.resumeGameRendering) {
          window.resumeGameRendering(process.element);
        }

        delete process.element.dataset.suspended;
        break;

      case 'ai':
        if (window.resumeAIThinking) {
          window.resumeAIThinking();
        }
        this.safeMode = false;
        break;

      case 'media':
        process.element.src = savedState.src;
        process.element.currentTime = savedState.time;
        if (!savedState.paused) {
          process.element.play().catch(() => {});
        }
        break;
    }

    this.suspendedTasks.delete(processId);

    if (this.userPreferences.notifyOnActions) {
      const message = this.userPreferences.customMessages.resumed
        .replace('{process}', this.getProcessDisplayName(process));
      this.notifyUser(message, 'info');
    }
  }

  /**
   * Notify user of optimization actions
   */
  notifyUser(message, type = 'info') {
    // Integration with Nexus notification system
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      console.log(`[IRIS] ${message}`);
    }
  }

  /**
   * Get process name from URL/element
   */
  getProcessName(src) {
    if (!src) return 'Unknown';
    
    try {
      const url = new URL(src);
      return url.hostname || 'Browser Tab';
    } catch {
      return 'Browser Tab';
    }
  }

  /**
   * Estimate iframe RAM usage
   */
  estimateIframeRAM(iframe) {
    // Rough estimate based on iframe size
    const rect = iframe.getBoundingClientRect();
    const pixels = rect.width * rect.height;
    
    // Assume ~4 bytes per pixel + overhead
    return pixels * 4 + 5000000; // ~5MB base overhead
  }

  /**
   * Estimate iframe CPU usage
   */
  estimateIframeCPU(iframe) {
    const visible = this.isElementVisible(iframe);
    return visible ? 'medium' : 'low';
  }

  /**
   * Estimate canvas RAM usage
   */
  estimateCanvasRAM(canvas) {
    const pixels = canvas.width * canvas.height;
    return pixels * 4; // 4 bytes per pixel (RGBA)
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth &&
      element.offsetParent !== null
    );
  }

  /**
   * Get current FPS
   */
  getCurrentFPS() {
    // Integration with existing FPS monitor
    if (window.fpsMonitor?.getCurrentFPS) {
      return window.fpsMonitor.getCurrentFPS();
    }
    return 60; // Default assumption
  }

  /**
   * Get task manager UI data
   */
  getTaskManagerData() {
    return {
      processes: this.getActiveProcesses(),
      suspended: Array.from(this.suspendedTasks.values()),
      performance: this.performanceHistory[this.performanceHistory.length - 1] || null,
      preferences: this.userPreferences
    };
  }

  /**
   * Manual kill process (user-initiated)
   */
  async killProcess(processId) {
    const processes = this.getActiveProcesses();
    const process = processes.find(p => p.id === processId);
    
    if (!process) return false;

    // Remove from DOM entirely
    if (process.element) {
      process.element.remove();
    }

    // If it was AI thinking, stop it
    if (process.type === 'ai' && window.stopAIThinking) {
      window.stopAIThinking();
    }

    const stoppedMessage = this.userPreferences.customMessages.stopped
      .replace('{process}', this.getProcessDisplayName(process));
    this.notifyUser(stoppedMessage, 'info');
    return true;
  }

  /**
   * Format a user-friendly optimization message
   */
  formatOptimizationMessage(process, activity) {
    const activityLine = activity?.message || this.userPreferences.customMessages.fallbackActivity;
    return this.userPreferences.customMessages.optimization
      .replace('{process}', this.getProcessDisplayName(process))
      .replace('{activity}', activityLine);
  }

  /**
   * Get a human-friendly process name
   */
  getProcessDisplayName(process) {
    return process.name || this.getProcessName(process.element?.src) || 'Unknown Task';
  }

  /**
   * Detect what the user is currently doing for custom messages
   */
  getCurrentActivity() {
    const activeVideo = document.querySelector('video:not([data-suspended])');
    if (activeVideo && !activeVideo.paused) {
      const title = activeVideo.dataset.title || 'your video';
      return { type: 'video', message: `Enjoy '${title}' lag free! 😄` };
    }

    const activeCanvas = document.querySelector('canvas:not([data-suspended])');
    if (activeCanvas && this.isElementVisible(activeCanvas)) {
      return { type: 'game', message: 'Enjoy your game lag free! 🎮' };
    }

    return { type: 'general', message: this.userPreferences.customMessages.fallbackActivity };
  }

  /**
   * Update user preferences
   */
  updatePreferences(newPrefs) {
    this.userPreferences = {
      ...this.userPreferences,
      ...newPrefs
    };
  }

  /**
   * Minimal culling when AI thinking is paused (safe mode)
   * Only suspends inactive browser/media/game tasks to avoid self-lockout
   */
  async runMinimalCulling(usage) {
    const candidates = usage.processes.filter(p =>
      p.canSuspend &&
      !p.active &&
      !this.userPreferences.protectedApps.includes(p.name) &&
      p.type !== 'ai'
    );

    if (candidates.length === 0) return;

    // Cull the single most expensive inactive task first
    const target = candidates[0];
    await this.suspendProcess(target);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
}

// Export singleton instance
export const performanceManager = new IRISPerformanceManager();

// Auto-start monitoring on load
if (typeof window !== 'undefined') {
  window.irisPerformanceManager = performanceManager;
  
  // Start monitoring after page loads
  if (document.readyState === 'complete') {
    performanceManager.startMonitoring();
  } else {
    window.addEventListener('load', () => {
      performanceManager.startMonitoring();
    });
  }
}

export default performanceManager;
