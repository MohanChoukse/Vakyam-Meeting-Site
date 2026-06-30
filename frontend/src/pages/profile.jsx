import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Calendar, Video, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import withAuth from '../utils/withAuth';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import { AnimatePresence } from 'framer-motion';
import server from '../environment';
import axios from 'axios';
import '../styles/profile.css';

function Profile() {
    const navigate = useNavigate();
    const { userData, logout, updateProfile } = useContext(AuthContext);
    const { showToast } = useContext(ToastContext);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: userData?.name || '', bio: userData?.bio || '' });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!editForm.name.trim()) return;
        setIsSaving(true);
        try {
            await updateProfile(editForm);
            showToast("Profile updated successfully!", "success");
            setIsEditing(false);
        } catch (err) {
            showToast("Failed to update profile", "error");
        } finally {
            setIsSaving(false);
        }
    };
    const [stats, setStats] = useState({
        meetingsHosted: 0,
        meetingsJoined: 0,
        totalHours: 0
    });

    useEffect(() => {
        // Fetch real stats from dashboard API
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${server}/api/v1/dashboard`, {
                    params: { userId: userData?.userId }
                });
                if (response.data?.success) {
                    setStats(response.data.data.stats);
                }
            } catch (err) {
                console.error("Failed to fetch user stats", err);
            }
        };
        
        if (userData?.userId) {
            fetchStats();
        }
    }, [userData]);

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
                    <h1>My Profile</h1>
                </motion.div>

                <div className="profile-grid">
                    <motion.div 
                        className="profile-card user-info-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="profile-avatar-container">
                            <img src={userData?.avatar} alt={userData?.name} className="profile-avatar-xl" />
                        </div>
                        <h2 className="profile-name">{userData?.name}</h2>
                        <p className="profile-email"><Mail size={14} /> {userData?.email}</p>
                        
                        <div className="profile-actions">
                            <button className="profile-btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            <button className="profile-btn-danger" onClick={logout}>Sign Out</button>
                        </div>
                    </motion.div>

                    <motion.div 
                        className="profile-card stats-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>Activity Overview</h3>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <div className="stat-icon accent"><Video size={20} /></div>
                                <div className="stat-details">
                                    <span className="stat-value">{stats.meetingsHosted}</span>
                                    <span className="stat-label">Hosted</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon primary"><User size={20} /></div>
                                <div className="stat-details">
                                    <span className="stat-value">{stats.meetingsJoined}</span>
                                    <span className="stat-label">Joined</span>
                                </div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-icon success"><Clock size={20} /></div>
                                <div className="stat-details">
                                    <span className="stat-value">{stats.totalHours}h</span>
                                    <span className="stat-label">Total Time</span>
                                </div>
                            </div>
                        </div>

                        <div className="account-details">
                            <h4>Account Details</h4>
                            <div className="detail-row">
                                <span>User ID</span>
                                <code>{userData?.userId}</code>
                            </div>
                            <div className="detail-row">
                                <span>Member Since</span>
                                <span>{new Date(parseInt(userData?.loginTime) || Date.now()).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            <AnimatePresence>
                {isEditing && (
                    <div className="overlay-backdrop">
                        <motion.div 
                            className="overlay-card edit-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <h2>Edit Profile</h2>
                            <form className="edit-form" onSubmit={handleSaveProfile}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        value={editForm.name} 
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                        required 
                                        autoFocus
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Bio (Optional)</label>
                                    <textarea 
                                        value={editForm.bio} 
                                        onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                        placeholder="Tell us about yourself..."
                                        rows={3}
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
                                    <button type="submit" className="btn-save" disabled={isSaving}>
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default withAuth(Profile);
