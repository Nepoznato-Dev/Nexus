import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { initializeAntiTheft } from './utils/antiTheft'; // Corrected import name
import { createTabGovernance } from './utils/tabGovernance';
import { createWorkspaceStorageManager } from './utils/workspaceStorageManager';

const RUNTIME_REQUIRED_ROUTES = [
  '/dashboard',
  '/admindashboard',
  '/settings',
  '/games',
  '/studytools',
  '/music',
  '/videos',
  '/browser',
  '/social',
  '/utilities',
  '/backgrounds',
  '/habits',
  '/useranalytics',
  '/updates',
  '/analytics'
];

let runtimeInitPromise = null;

// Initialize anti-theft protection
initializeAntiTheft(); // Ensure this matches the original function name

console.log('Nexus starting...');

async function initializeRuntimeServices() {
  const url = new URL(window.location.href);
  const isApprovedChild = url.searchParams.get('approvedChild') === '1';
  const pendingCommitQueue = [];

  const tab = createTabGovernance({
    isApprovedChild,
    onRoleChange: (info) => {
      window.__NEXUS_TAB_ROLE__ = info.role;
      window.__NEXUS_TAB_EPOCH__ = info.epoch;
      const runtime = window.__NEXUS_RUNTIME__;
      if (runtime?.workspace) {
        runtime.workspace.setWritable(info.role === 'home');
      }
      console.log('[Nexus TabGovernance] role:', info.role, 'epoch:', info.epoch, 'reason:', info.reason);
    },
    onCommitRequest: ({ mutation }) => {
      const runtime = window.__NEXUS_RUNTIME__;
      if (!runtime?.workspace) {
        pendingCommitQueue.push(mutation);
        return;
      }
      runtime.workspace.applyRemoteMutation(mutation);
    },
    onDuplicateUnapproved: () => {
      // Keep duplicate tabs lightweight unless explicitly approved by home tab.
      document.documentElement.dataset.nexusChildMode = 'unapproved';
    },
  });

  const workspace = await createWorkspaceStorageManager({
    writable: tab.role === 'home',
    requestCommit: (mutation) => tab.requestCommit(mutation),
    onStage: ({ stage, detail }) => {
      console.log(`[Nexus Workspace] ${stage}: ${detail}`);
    },
  });

  while (pendingCommitQueue.length) {
    workspace.applyRemoteMutation(pendingCommitQueue.shift());
  }

  window.__NEXUS_RUNTIME__ = {
    tab,
    workspace,
  };
}

function routeNeedsRuntime(pathname) {
  if (!pathname) return false;
  return RUNTIME_REQUIRED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function ensureRuntimeServices(options = {}) {
  const force = Boolean(options.force);
  if (window.__NEXUS_RUNTIME__) {
    return Promise.resolve(window.__NEXUS_RUNTIME__);
  }
  if (runtimeInitPromise) {
    return runtimeInitPromise;
  }

  const shouldInit = force || routeNeedsRuntime(window.location.pathname);
  if (!shouldInit) {
    return Promise.resolve(null);
  }

  runtimeInitPromise = initializeRuntimeServices()
    .catch((error) => {
      console.warn('[Nexus] runtime services failed to initialize:', error);
      throw error;
    })
    .finally(() => {
      runtimeInitPromise = null;
    });

  return runtimeInitPromise;
}

function installRuntimeRouteWatcher() {
  if (typeof window === 'undefined') return;

  const maybeInit = () => {
    ensureRuntimeServices().catch(() => { });
  };

  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function patchedPushState(...args) {
    const result = originalPushState.apply(this, args);
    maybeInit();
    return result;
  };

  window.history.replaceState = function patchedReplaceState(...args) {
    const result = originalReplaceState.apply(this, args);
    maybeInit();
    return result;
  };

  window.addEventListener('popstate', maybeInit);
}

// Skip mounting if the page already spawned the about:blank wrapper
if (!window.__NEXUS_SKIP_APP__) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);

  installRuntimeRouteWatcher();
  ensureRuntimeServices({ force: routeNeedsRuntime(window.location.pathname) }).catch(() => { });
}

console.log('Nexus rendered');