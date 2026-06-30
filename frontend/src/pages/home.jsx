import React, { useContext, useState, useEffect } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, LogIn, Clock, Plus, ArrowRight, User, ChevronRight, Users, Play, AlertCircle
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import server from '../environment';
import '../styles/home.css';

function HomeComponent() {
  const navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const [meetingCode, setMeetingCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const [isCreating, setIsCreating] = useState(false);
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');

  // Date and Time for Hero
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(`${server}/api/v1/dashboard`, {
          params: { userId: userData?.userId }
        });
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setLoadingStats(false);
      }
    };
    if (userData?.userId) {
      fetchDashboardData();
    }
  }, [userData]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const extractMeetingCode = (input) => {
    let cleanInput = input.trim();
    // Extract the last part after a slash if it's a URL or contains slashes
    if (cleanInput.includes('/')) {
      const parts = cleanInput.split('/');
      return parts[parts.length - 1];
    }
    return cleanInput;
  };

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    setJoinError('');
    setIsJoining(true);
    
    const code = extractMeetingCode(meetingCode);

    try {
      const response = await axios.get(`${server}/api/v1/meetings/${code}`);
      if (response.data.success) {
        showToast("Joining meeting...", "success");
        navigate(`/${code}`);
      }
    } catch (err) {
      if (err.response?.status === 410) {
        setJoinError("This meeting has expired.");
        showToast("This meeting has expired.", "error");
      } else if (err.response?.status === 403) {
        setJoinError("This meeting has already ended.");
        showToast("This meeting has already ended.", "error");
      } else {
        setJoinError("Meeting not found.");
        showToast("Meeting not found.", "error");
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handleNewMeeting = async () => {
    setIsCreating(true);
    try {
      const response = await axios.post(`${server}/api/v1/meetings`, {
        title: meetingTitle.trim(),
        userId: userData?.userId,
        user: userData 
      });
      
      if (response.data.success) {
        const { meetingCode } = response.data.data;
        try {
          await navigator.clipboard.writeText(`${window.location.origin}/${meetingCode}`);
          showToast("Meeting created and link copied!", "success");
        } catch (e) {
          showToast("Meeting created successfully!", "success");
        }
        // Instant redirect
        navigate(`/${meetingCode}`);
        setShowNewMeetingModal(false);
        setMeetingTitle('');
      }
    } catch (err) {
      setIsCreating(false);
      showToast("Failed to create meeting", "error");
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      <main className="home-content">
        {/* HERO SECTION */}
        <motion.div 
          className="home-hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="hero-datetime">
            <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <span className="dot-separator">•</span>
            <span>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <h1>{getGreeting()}, <span className="hero-name">{userData?.name?.split(' ')[0]}</span></h1>
          <p>Ready for your next meeting?</p>
        </motion.div>

        {/* DASHBOARD STATS */}
        <div className="home-stats-grid">
          {loadingStats ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="stat-card skeleton"></div>
            ))
          ) : (
            <>
              <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stat-icon-wrapper primary"><Video size={20} /></div>
                <div className="stat-info">
                  <h4>Meetings Hosted</h4>
                  <p>{dashboardData?.stats?.meetingsHosted || 0}</p>
                </div>
              </motion.div>
              <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="stat-icon-wrapper success"><Users size={20} /></div>
                <div className="stat-info">
                  <h4>Meetings Joined</h4>
                  <p>{dashboardData?.stats?.meetingsJoined || 0}</p>
                </div>
              </motion.div>
              <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="stat-icon-wrapper accent"><Clock size={20} /></div>
                <div className="stat-info">
                  <h4>Total Hours</h4>
                  <p>{dashboardData?.stats?.totalHours || "0.0"}</p>
                </div>
              </motion.div>
              <motion.div className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <div className="stat-icon-wrapper warning"><Play size={20} /></div>
                <div className="stat-info">
                  <h4>This Week</h4>
                  <p>{dashboardData?.stats?.meetingsThisWeek || 0}</p>
                </div>
              </motion.div>
            </>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <h3 className="section-title">Quick Actions</h3>
        <div className="home-actions-grid">
          <motion.div
            className="home-action-card create"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            onClick={() => setShowNewMeetingModal(true)}
          >
            <div className="action-icon-large accent"><Plus size={32} /></div>
            <h3>New Meeting</h3>
            <p>Create a fresh workspace and invite your team</p>
          </motion.div>

          <motion.div
            className="home-action-card join"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
          >
            <div className="action-icon-large primary"><LogIn size={32} /></div>
            <h3>Join Meeting</h3>
            <p>Enter a meeting code or link to join instantly</p>
            <div className="join-input-wrapper">
              <input 
                type="text" 
                placeholder="Enter Code or URL"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isJoining && handleJoinVideoCall()}
                disabled={isJoining}
              />
              <button onClick={handleJoinVideoCall} disabled={isJoining}>
                {isJoining ? <div className="spinner-small" /> : <ArrowRight size={20} />}
              </button>
            </div>
            {joinError && <p className="join-error"><AlertCircle size={14} /> {joinError}</p>}
          </motion.div>
          
          <motion.div
            className="home-action-card secondary"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            onClick={() => navigate('/history')}
          >
            <div className="action-icon-large neutral"><Clock size={32} /></div>
            <h3>History</h3>
            <p>View your past meetings and recordings</p>
          </motion.div>

          <motion.div
            className="home-action-card secondary"
            whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            onClick={() => navigate('/profile')}
          >
            <div className="action-icon-large neutral"><User size={32} /></div>
            <h3>Profile</h3>
            <p>Manage your account and preferences</p>
          </motion.div>
        </div>
        
        {/* RECENT MEETINGS PREVIEW */}
        {!loadingStats && dashboardData?.recentMeetings?.length > 0 && (
          <div className="recent-preview-section">
             <div className="recent-header">
                <h3 className="section-title">Recent Activity</h3>
                <button className="view-all-btn" onClick={() => navigate('/history')}>
                  View all <ChevronRight size={16} />
                </button>
             </div>
             <div className="recent-preview-list">
                {dashboardData.recentMeetings.slice(0, 3).map((meeting) => (
                  <div className="recent-preview-item" key={meeting._id}>
                    <div className="recent-info">
                      <h4>{meeting.title || "Untitled Meeting"}</h4>
                      <p>Code: {meeting.meetingCode} • {new Date(meeting.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`status-badge ${meeting.status.toLowerCase()}`}>
                      {meeting.status}
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </main>

      {/* NEW MEETING MODAL */}
      <AnimatePresence>
        {showNewMeetingModal && (
          <div className="overlay-backdrop">
            <motion.div 
              className="overlay-card edit-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {isCreating ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                  <div className="spinner-large"></div>
                  <h2>Creating your space...</h2>
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '8px' }}>Setting up secure meeting environment</p>
                </div>
              ) : (
                <>
                  <h2>New Meeting</h2>
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Meeting Title (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Weekly Sync" 
                        value={meetingTitle}
                        onChange={(e) => setMeetingTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNewMeeting()}
                        autoFocus
                      />
                    </div>
                    <div className="modal-actions">
                      <button className="btn-cancel" onClick={() => { setShowNewMeetingModal(false); setMeetingTitle(''); }}>Cancel</button>
                      <button className="btn-save" onClick={handleNewMeeting}>Create Space</button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(HomeComponent);
