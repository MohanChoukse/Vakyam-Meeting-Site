import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Search, Copy, ExternalLink, Video, Plus,
} from 'lucide-react';
import '../styles/history.css';

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        // IMPLEMENT SNACKBAR
      }
    };
    fetchHistory();
  }, [getHistoryOfUser]);

  let formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const copyMeetingCode = (code) => {
    const fullUrl = `${window.location.origin}/${code}`;
    navigator.clipboard.writeText(fullUrl);
  };

  const filteredMeetings = meetings.filter((m) =>
    m.meetingCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="history-page">
      {/* Navbar */}
      <nav className="history-nav">
        <div className="history-nav-inner">
          <div className="history-nav-left">
            <button
              className="history-back-btn"
              onClick={() => routeTo('/home')}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <h1>Meeting History</h1>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="history-content">
        {meetings.length > 0 ? (
          <>
            {/* Toolbar */}
            <motion.div
              className="history-toolbar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="history-search">
                <Search size={16} className="history-search-icon" />
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <span className="history-count">
                {filteredMeetings.length} meeting{filteredMeetings.length !== 1 ? 's' : ''}
              </span>
            </motion.div>

            {/* Table */}
            <motion.div
              className="history-table-wrapper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Meeting Code</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMeetings.map((e, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="history-meeting-code">
                          {e.meetingCode}
                        </span>
                      </td>
                      <td>{formatDate(e.date)}</td>
                      <td>
                        <button
                          className="history-copy-btn"
                          onClick={() => copyMeetingCode(e.meetingCode)}
                          title="Copy link"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          className="history-join-btn"
                          onClick={() => routeTo(`/${e.meetingCode}`)}
                        >
                          <ExternalLink size={12} /> Rejoin
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            className="history-empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="history-empty-icon">
              <Video size={32} />
            </div>
            <h3>No meetings yet</h3>
            <p>Start or join a meeting to see your history here</p>
            <button
              className="history-empty-btn"
              onClick={() => routeTo('/home')}
            >
              <Plus size={16} /> Start a Meeting
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
