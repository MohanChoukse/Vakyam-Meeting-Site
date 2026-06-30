import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Shield, Users } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
export default function Hero() {
    const navigate = useNavigate();
    const { userData } = useContext(AuthContext);
    return (
        <section className="hero" id="top">
            <div className="hero-bg-blob-1" />
            <div className="hero-bg-blob-2" />
            <div className="container">
                {/* Left Content */}
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="hero-badge">
                        <span className="hero-badge-dot" />
                        Secure & Private Meetings
                    </div>
                    <h1 className="hero-title">
                        Start <span className="hero-title-accent">secure video</span>{' '}
                        meetings instantly.
                    </h1>
                    <p className="hero-subtitle">
                        No installation. No downloads. Just share a meeting link and
                        connect with anyone, anywhere in the world.
                    </p>
                    <div className="hero-buttons">
                        <button
                            className="btn-primary"
                            onClick={() => navigate(userData?.token ? '/home' : '/auth')}
                        >
                            {userData?.token ? 'Go to Dashboard' : 'Start Meeting'} <ArrowRight size={18} />
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                const el = document.getElementById('how-it-works');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <Play size={16} /> How it Works
                        </button>
                    </div>
                </motion.div>
                {/* Right Visual */}
                <motion.div
                    className="hero-visual"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    <div className="hero-visual-main">
                        <div className="hero-visual-grid">
                            <div className="hero-visual-tile">
                                <div className="hero-visual-tile-avatar">A</div>
                            </div>
                            <div className="hero-visual-tile">
                                <div className="hero-visual-tile-avatar">B</div>
                            </div>
                            <div className="hero-visual-tile">
                                <div className="hero-visual-tile-avatar">C</div>
                            </div>
                            <div className="hero-visual-tile">
                                <div className="hero-visual-tile-avatar">D</div>
                            </div>
                        </div>
                    </div>
                    {/* Floating Cards */}
                    <motion.div
                        className="hero-float-card hero-float-card-1"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    >
                        <div className="hero-float-icon primary">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>End-to-End</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Encrypted</div>
                        </div>
                    </motion.div>
                    <motion.div
                        className="hero-float-card hero-float-card-2"
                        animate={{ y: [0, 8, 0] }}
                        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                    >
                        <div className="hero-float-icon accent">
                            <Users size={18} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>10k+ Users</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-muted)' }}>Active Now</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
