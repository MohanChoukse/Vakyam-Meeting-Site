import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Copy, RefreshCw, LogIn, Share2 } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
export default function MeetingLinkCard() {
    const [meetingUrl, setMeetingUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const { addToUserHistory } = useContext(AuthContext);
    const generateMeetingCode = () => {
        const code = Math.random().toString(36).substring(2, 10);
        setMeetingUrl(code);
        setCopied(false);
    };
    const copyLink = () => {
        if (!meetingUrl) return;
        const fullUrl = `${window.location.origin}/${meetingUrl}`;
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const joinMeeting = async () => {
        if (!meetingUrl) return;
        try {
            await addToUserHistory(meetingUrl);
        } catch (e) {
            // Guest may not be logged in
        }
        navigate(`/${meetingUrl}`);
    };
    const shareMeeting = () => {
        if (!meetingUrl) return;
        const fullUrl = `${window.location.origin}/${meetingUrl}`;
        if (navigator.share) {
            navigator.share({
                title: 'Join my Vakyam meeting',
                text: 'Click the link to join the meeting',
                url: fullUrl,
            });
        } else {
            copyLink();
        }
    };
    return (
        <section className="meeting-link-section section">
            <div className="container">
                <motion.div
                    className="meeting-link-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h3>Quick Meeting</h3>
                    <p>Generate a meeting link and share it with others</p>
                    <div className="meeting-link-input-group">
                        <input
                            className="meeting-link-input"
                            type="text"
                            placeholder="Enter meeting code or generate one"
                            value={meetingUrl}
                            onChange={(e) => setMeetingUrl(e.target.value)}
                        />
                        <button className="btn-primary" onClick={generateMeetingCode}>
                            <RefreshCw size={16} /> Generate
                        </button>
                    </div>
                    <div className="meeting-link-actions">
                        <button className="btn-icon" onClick={copyLink} disabled={!meetingUrl}>
                            <Copy size={16} /> {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button className="btn-icon" onClick={joinMeeting} disabled={!meetingUrl}>
                            <LogIn size={16} /> Join
                        </button>
                        <button className="btn-icon" onClick={shareMeeting} disabled={!meetingUrl}>
                            <Share2 size={16} /> Share
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
