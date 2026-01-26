import React, { Component, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import Landing from './PagesDisplay/Landing.js';
import Consent from './PagesDisplay/Consent.js';
import Auth from './PagesDisplay/Auth.js';
import RegularDashboard from './PagesDisplay/RegularDashboard.js';
import AdminDashboard from './PagesDisplay/AdminDashboard.js';
import Settings from './PagesDisplay/Settings.js';
import Updates from './PagesDisplay/Updates.js';
import Analytics from './PagesDisplay/Analytics.js';
import HabitTracker from './PagesDisplay/HabitTracker.js';
import UserAnalytics from './PagesDisplay/UserAnalytics.js';
import Games from './PagesDisplay/Games.js';
import StudyTools from './PagesDisplay/StudyTools.js';
import Music from './PagesDisplay/Music.js';
import Videos from './PagesDisplay/Videos.js';
import Browser from './PagesDisplay/Browser.js';
import Social from './PagesDisplay/Social.js';
import Utilities from './PagesDisplay/Utilities.js';
import Backgrounds from './PagesDisplay/Backgrounds.js';
import Privacy from './PagesDisplay/Privacy.js';
import Launcher from './PagesDisplay/Launcher.js';
import AccessibilityProvider from './Components/Accessibility/AccessibilityProvider.js';
import FakeErrorScreen from './Components/FakeErrorScreen/FakeErrorScreen.js';
import { session } from './Components/Storage/clientStorage.js';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen.js';

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
        <Router>
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/launcher" element={<Launcher />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/consent" element={<Consent />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<RegularDashboard />} />
                <Route path="/admindashboard" element={<AdminDashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/updates" element={<Updates />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/habits" element={<HabitTracker />} />
                <Route path="/useranalytics" element={<UserAnalytics />} />
                <Route path="/games" element={<Games />} />
                <Route path="/studytools" element={<StudyTools />} />
                <Route path="/music" element={<Music />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/browser" element={<Browser />} />
                <Route path="/social" element={<Social />} />
                <Route path="/utilities" element={<Utilities />} />
                <Route path="/backgrounds" element={<Backgrounds />} />
                <Route path="/privacy" element={<Privacy />} />
                {/* Catch-all 404 route */}
                <Route path="*" element={
                  <div style={{ padding: '20px', color: 'white', background: '#0a0a0f', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '2em', marginBottom: '20px' }}>404 - Page Not Found</h1>
                    <p style={{ marginBottom: '20px', color: '#aaa' }}>The page you're looking for doesn't exist.</p>
                    <a href="/" style={{ color: '#00f0ff', textDecoration: 'none', padding: '10px 20px', border: '1px solid #00f0ff', borderRadius: '4px' }}>
                    Return to Home
                  </a>
                </div>
              } />
              </Routes>
            </Layout>
          </ProtectedRoute>
        </Router>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;