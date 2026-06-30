import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import withAuth from '../utils/withAuth';
import '../styles/profile.css'; // Reusing profile styles for layout

function Settings() {
    const navigate = useNavigate();

    return (
        <div className="profile-page">
            <Navbar />
            <div className="profile-container">
                <motion.div 
                    className="profile-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <button className="profile-back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1>Settings</h1>
                </motion.div>

                <div className="profile-grid" style={{ gridTemplateColumns: '1fr' }}>
                    <motion.div 
                        className="profile-card stats-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h3>Preferences</h3>
                        <p style={{ color: 'var(--color-muted)' }}>Settings functionality will be implemented in a future update.</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default withAuth(Settings);
