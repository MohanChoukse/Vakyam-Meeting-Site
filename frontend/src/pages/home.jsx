import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, LogIn, Clock, LogOut, Plus, ArrowRight,
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import '../styles/home.css';

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState('');

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  const handleNewMeeting = async () => {
    const code = Math.random().toString(36).substring(2, 10);
    await addToUserHistory(code);
    navigate(`/${code}`);
  };

  return (
    <div className="home-page">
      {/* Navbar */}
      <nav className="home-nav">
        <div className="home-nav-inner">
          <a className="home-nav-logo" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <div className="home-nav-logo-icon">
              <Video size={18} />
            </div>
            <span>Vakyam</span>
          </a>

          <div className="home-nav-actions">
            <button
              className="home-nav-btn"
              onClick={() => navigate('/history')}
            >
              <Clock size={16} /> History
            </button>
            <button
              className="home-nav-logout"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/auth');
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="home-content">
        {/* Welcome Card */}
        <motion.div
          className="home-welcome"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Welcome to Vakyam 👋</h1>
          <p>Start a new meeting or join an existing one to connect with others</p>
        </motion.div>

        {/* Quick Actions */}
        <div className="home-actions-grid">
          {/* New Meeting */}
          <motion.div
            className="home-action-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="home-action-icon accent">
              <Plus size={24} />
            </div>
            <h3>New Meeting</h3>
            <p>Create a new meeting room and invite participants</p>
            <button className="home-new-btn" onClick={handleNewMeeting}>
              <Plus size={16} /> Create Meeting
            </button>
          </motion.div>

          {/* Join Meeting */}
          <motion.div
            className="home-action-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="home-action-icon primary">
              <LogIn size={24} />
            </div>
            <h3>Join Meeting</h3>
            <p>Enter a meeting code to join an existing meeting</p>
            <div className="home-join-form">
              <input
                className="home-join-input"
                type="text"
                placeholder="Enter meeting code"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinVideoCall()}
              />
              <button className="home-join-btn" onClick={handleJoinVideoCall}>
                Join <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(HomeComponent);
