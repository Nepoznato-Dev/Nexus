import React, { Component, useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout';
const lazyWithRetry = (importer, key) =>
  lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(`lazy-retry-${key}`);
      return module;
    } catch (error) {
      const retryKey = `lazy-retry-${key}`;
      const alreadyRetried = sessionStorage.getItem(retryKey) === '1';

      if (!alreadyRetried) {
        sessionStorage.setItem(retryKey, '1');
        window.location.reload();
        return new Promise(() => { });
      }

      throw error;
    }
  });

const Landing = lazyWithRetry(() => import('./PagesDisplay/Landing.js'), 'landing');
const Consent = lazy(() => import('./PagesDisplay/Consent.js'));
const Auth = lazy(() => import('./PagesDisplay/Auth.js'));
const AdminDashboard = lazy(() => import('./PagesDisplay/AdminDashboard.js'));
const Settings = lazy(() => import('./PagesDisplay/Settings.js'));
const Updates = lazy(() => import('./PagesDisplay/Updates.js'));
const Analytics = lazy(() => import('./PagesDisplay/Analytics.js'));
const HabitTracker = lazy(() => import('./PagesDisplay/HabitTracker.js'));
const UserAnalytics = lazy(() => import('./PagesDisplay/UserAnalytics.js'));
const Games = lazy(() => import('./PagesDisplay/Games.js'));
const StudyTools = lazy(() => import('./PagesDisplay/StudyTools.js'));
const Music = lazy(() => import('./PagesDisplay/Music.js'));
const Videos = lazy(() => import('./PagesDisplay/Videos.js'));
const Browser = lazy(() => import('./PagesDisplay/Browser.js'));
const Social = lazy(() => import('./PagesDisplay/Social.js'));
const Utilities = lazy(() => import('./PagesDisplay/Utilities.js'));
const Backgrounds = lazy(() => import('./PagesDisplay/Backgrounds.js'));
const Privacy = lazy(() => import('./PagesDisplay/Privacy.js'));
const Launcher = lazy(() => import('./PagesDisplay/Launcher.js'));
const DashboardWrapper = lazy(() => import('./PagesDisplay/DashboardWrapper.js'));
import AccessibilityProvider from './Components/Accessibility/AccessibilityProvider.js';
import FakeErrorScreen from './Components/FakeErrorScreen/FakeErrorScreen.js';
import { session, storage } from './Components/Storage/clientStorage.js';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen.js';
import { WindowManagerProvider } from './Components/Desktop/WindowManager';
const DesktopView = lazy(() => import('./Components/Desktop/DesktopView'));
import { RenderManagerProvider } from './rendering/RenderManagerProvider';
import RenderGate from './rendering/RenderGate';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#0a0a0f', minHeight: '100vh' }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Route guard: redirect unverified users to landing
function ProtectedRoute({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  const isVerified = session.isVerified();

  // Protected pages that require authentication
  const protectedPages = [
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

  // Check on mount and when location changes
  useEffect(() => {
    // If accessing a protected page without verification, redirect to landing
    if (protectedPages.some(page => location.pathname.includes(page)) && !isVerified) {
      navigate('/', { replace: true });
    }
    setChecked(true);
  }, [location.pathname, isVerified, navigate]);

  // Don't render until we've checked auth
  if (!checked) {
    return <LoadingScreen isLoading showDuration={600} />;
  }

  return children;
}

function App() {
  const [showErrorScreen, setShowErrorScreen] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    // Show error screen only if NOT embedded (direct access)
    // embedded=true means we're in the iframe, so don't show the error screen
    return !params.has('embedded');
  });

  // IRIS Performance Optimization on startup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const perfMode = params.get('performance');
    const loadMode = params.get('mode');

    if (perfMode === 'optimized' && loadMode === 'iris-load') {
      // Enable IRIS Performance Manager in aggressive mode
      if (typeof window !== 'undefined') {
        // Start performance optimization immediately
        try {
          const performanceManager = require('./Components/A.L.L.O.Y. - Autonomous Logical Layering & Optimized sYstem/irisPerformanceManager.js').default;
          if (performanceManager) {
            performanceManager.startMonitoring();
            performanceManager.setAggressiveness('medium');

            // Log optimization started
            console.log('[IRIS] Performance optimization active - culling non-essential resources');

            // Signal to launcher that page is loading
            if (window.parent && window.parent !== window) {
              try {
                window.parent.postMessage({ type: 'nexus:page-loading' }, '*');
              } catch (e) {
                // Ignore cross-origin errors
              }
            }
          }
        } catch (e) {
          console.warn('[IRIS] Performance manager not yet loaded');
        }
      }
    }
  }, []);

  // Signal page ready to launcher
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const perfMode = params.get('performance');

    if (perfMode === 'optimized') {
      const timeout = setTimeout(() => {
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'nexus:page-ready' }, '*');
          }
        } catch (e) {
          // Ignore
        }
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, []);

  // If error screen is showing, don't render the app at all
  if (showErrorScreen) {
    return (
      <ErrorBoundary>
        <AccessibilityProvider>
          <FakeErrorScreen onDismiss={() => {
            setShowErrorScreen(false);
          }} />
        </AccessibilityProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <RenderManagerProvider>
          <WindowManagerProvider>
            <Router>
              <ProtectedRoute>
                <Layout>
                  <Suspense fallback={<LoadingScreen isLoading showDuration={500} />}>
                    <Routes>
                      <Route path="/" element={<RenderGate id="route:landing" priority="high"><Landing /></RenderGate>} />
                      <Route path="/launcher" element={<RenderGate id="route:launcher" priority="critical"><Launcher /></RenderGate>} />
                      <Route path="/landing" element={<RenderGate id="route:landing-alt" priority="high"><Landing /></RenderGate>} />
                      <Route path="/consent" element={<RenderGate id="route:consent" priority="critical"><Consent /></RenderGate>} />
                      <Route path="/auth" element={<RenderGate id="route:auth" priority="critical"><Auth /></RenderGate>} />
                      <Route path="/dashboard" element={<RenderGate id="route:dashboard" priority="high"><DashboardWrapper /></RenderGate>} />
                      <Route path="/admindashboard" element={<RenderGate id="route:admin" priority="high"><AdminDashboard /></RenderGate>} />
                      <Route path="/settings" element={<RenderGate id="route:settings" priority="normal"><Settings /></RenderGate>} />
                      <Route path="/updates" element={<RenderGate id="route:updates" priority="low"><Updates /></RenderGate>} />
                      <Route path="/analytics" element={<RenderGate id="route:analytics" priority="normal"><Analytics /></RenderGate>} />
                      <Route path="/habits" element={<RenderGate id="route:habits" priority="normal"><HabitTracker /></RenderGate>} />
                      <Route path="/useranalytics" element={<RenderGate id="route:useranalytics" priority="normal"><UserAnalytics /></RenderGate>} />
                      <Route path="/games" element={<RenderGate id="route:games" priority="high"><Games /></RenderGate>} />
                      <Route path="/studytools" element={<RenderGate id="route:studytools" priority="normal"><StudyTools /></RenderGate>} />
                      <Route path="/music" element={<RenderGate id="route:music" priority="low"><Music /></RenderGate>} />
                      <Route path="/videos" element={<RenderGate id="route:videos" priority="low"><Videos /></RenderGate>} />
                      <Route path="/browser" element={<RenderGate id="route:browser" priority="high"><Browser /></RenderGate>} />
                      <Route path="/social" element={<RenderGate id="route:social" priority="low"><Social /></RenderGate>} />
                      <Route path="/utilities" element={<RenderGate id="route:utilities" priority="normal"><Utilities /></RenderGate>} />
                      <Route path="/backgrounds" element={<RenderGate id="route:backgrounds" priority="background"><Backgrounds /></RenderGate>} />
                      <Route path="/privacy" element={<RenderGate id="route:privacy" priority="critical"><Privacy /></RenderGate>} />
                      {/* Catch-all 404 route */}
                      <Route path="*" element={
                        <RenderGate id="route:notfound" priority="critical">
                          <div style={{ padding: '20px', color: 'white', background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>404 - Page Not Found</h1>
                            <p style={{ marginBottom: '20px', color: '#aaa' }}>The page you're looking for doesn't exist.</p>
                            <a href="/" style={{ color: '#00f0ff', textDecoration: 'none', padding: '10px 20px', border: '1px solid #00f0ff', borderRadius: '4px' }}>
                              Return to Home
                            </a>
                          </div>
                        </RenderGate>
                      } />
                    </Routes>
                  </Suspense>
                </Layout>
              </ProtectedRoute>
            </Router>
          </WindowManagerProvider>
        </RenderManagerProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;