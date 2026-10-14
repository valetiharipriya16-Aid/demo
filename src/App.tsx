// src/App.tsx
import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './index.css';

// Code-split pages for high performance and minimal initial bundle size
const Landing = lazy(() => import('./pages/Landing'));
const OperatorDashboard = lazy(() => import('./pages/OperatorDashboard'));
const HospitalSelection = lazy(() => import('./pages/HospitalSelection'));
const RouteTracker = lazy(() => import('./pages/RouteTracker'));
const OfficerDashboard = lazy(() => import('./pages/OfficerDashboard'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));

// Accessible Loading Fallback
function PageLoadingFallback() {
  return (
    <div className="page-loading-skeleton" role="status" aria-live="polite">
      <div className="loading-spinner"></div>
      <span className="loading-text">Loading ClearPath Interface...</span>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* WCAG 2.1 AA Skip Link for Keyboard & Screen Reader Users */}
        <a href="#main-content" className="skip-link">
          Skip to main emergency dispatch content
        </a>

        <Header />

        <main id="main-content" className="main-content" tabIndex={-1}>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/operator" element={<OperatorDashboard />} />
              <Route path="/hospitals" element={<HospitalSelection />} />
              <Route path="/track" element={<RouteTracker />} />
              <Route path="/officer" element={<OfficerDashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
