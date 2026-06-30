import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import LandingPage from './pages/landing';
import Authentication from './pages/authentication';
import HomeComponent from './pages/home';
import History from './pages/history';
import VideoMeetComponent from './pages/VideoMeet';
import Profile from './pages/profile';
import Settings from './pages/settings';

import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ScrollToTop from './components/ScrollToTop';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<Authentication />} />
        <Route path="/home" element={<HomeComponent />} />
        <Route path="/history" element={<History />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/:url" element={<VideoMeetComponent />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="App">
      <Router>
        <ToastProvider>
          <AuthProvider>
            <ScrollToTop />
            <AnimatedRoutes />
          </AuthProvider>
        </ToastProvider>
      </Router>
    </div>
  );
}

export default App;