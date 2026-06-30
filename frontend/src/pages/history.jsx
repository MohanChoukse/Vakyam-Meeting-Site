import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Search, ExternalLink, Video, Plus, Trash2, Clock, Users, Link
} from 'lucide-react';
import withAuth from '../utils/withAuth';
import Navbar from '../components/Navbar';
import axios from 'axios';
import server from '../environment';
import '../styles/history.css';

function History() {
  const { userData } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // All, Active, Ended, Expired
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${server}/api/v1/meetings/recent`, {
          params: { userId: userData?.userId }
        });
        if (response.data.success) {
          setMeetings(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch meeting history");
      } finally {
        setLoading(false);
      }
    };

    if (userData?.userId) {
      fetchHistory();
    }
  }, [userData]);

  let formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const copyMeetingCode = (code) => {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
  };

  const deleteMeeting = async (id) => {
    if(!window.confirm("Are you sure you want to delete this meeting?")) return;
    try {
      await axios.delete(`${server}/api/v1/meetings/${id}`, {
        data: { userId: userData?.userId }
      });
      setMeetings(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      alert("Only the host can delete this meeting.");
    }
  };

  const filteredMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const matchesSearch = (m.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.meetingCode?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [meetings, searchQuery, statusFilter]);

  return (
    <div className="history-page">
      <Navbar />

      <div className="history-container">
        {/* Header */}
        <motion.div 
          className="history-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="history-title-wrap">
            <button className="history-back-btn" onClick={() => routeTo('/home')}>
              <ArrowLeft size={20} /> Back
            </button>
            <h1>Meeting History</h1>
          </div>
          <p>View, manage, and rejoin your past meetings.</p>
        </motion.div>

        {/* Filters & Search */}
        <div className="history-controls">
          <div className="history-search-bar">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by title or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="history-filters">
            {['All', 'Active', 'Ended', 'Expired'].map(status => (
              <button 
                key={status}
                className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="history-content">
          {loading ? (
            <div className="history-grid">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="history-card skeleton" style={{height: '200px'}}></div>
               ))}
            </div>
          ) : filteredMeetings.length > 0 ? (
            <div className="history-grid">
              <AnimatePresence>
                {filteredMeetings.map((meeting) => {
                  const isHost = meeting.hostId === userData?.userId || meeting.user_id === userData?.token;
                  
                  return (
                  <motion.div
                    key={meeting._id || meeting.meetingCode}
                    className="history-card"
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="card-header">
                      <div className="card-title">
                        <h3>{meeting.title || "Untitled Meeting"}</h3>
                        <span className="card-code">Code: {meeting.meetingCode}</span>
                      </div>
                      <div className={`status-badge ${meeting.status?.toLowerCase() || 'ended'}`}>
                        {meeting.status || 'Ended'}
                      </div>
                    </div>

                    <div className="card-body">
                      <div className="card-detail">
                        <Clock size={14} /> <span>{formatDate(meeting.createdAt || meeting.date)}</span>
                      </div>
                      <div className="card-detail">
                        <Users size={14} /> <span>Host: {isHost ? 'You' : (meeting.hostName || 'Unknown')}</span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="action-btn icon-only" 
                        onClick={() => copyMeetingCode(meeting.meetingCode)}
                        title="Copy Invite Link"
                      >
                        <Link size={16} />
                      </button>

                      {isHost && (
                        <button 
                          className="action-btn icon-only danger" 
                          onClick={() => deleteMeeting(meeting._id)}
                          title="Delete Meeting"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {(meeting.status === 'Active' || meeting.status === 'Scheduled') ? (
                        <button 
                          className="action-btn primary fill"
                          onClick={() => routeTo(`/${meeting.meetingCode}`)}
                        >
                          Rejoin <ExternalLink size={14} />
                        </button>
                      ) : (
                        <button 
                          className="action-btn disabled fill"
                          disabled
                          title="Meeting has ended or expired"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </motion.div>
                )})}
              </AnimatePresence>
            </div>
          ) : (
            <motion.div
              className="history-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="history-empty-icon">
                <Video size={48} />
              </div>
              <h3>No meetings found</h3>
              <p>Try adjusting your search or filters.</p>
              <button
                className="history-empty-btn"
                onClick={() => routeTo('/home')}
              >
                <Plus size={16} /> Create New Meeting
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(History);
