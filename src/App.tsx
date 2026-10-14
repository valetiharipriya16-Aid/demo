// src/App.tsx
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import OperatorDashboard from './pages/OperatorDashboard';
import HospitalSelection from './pages/HospitalSelection';
import RouteTracker from './pages/RouteTracker';
import OfficerDashboard from './pages/OfficerDashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import Header from './components/Header';
import Footer from './components/Footer';
import './index.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <main className="main-content">
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
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
