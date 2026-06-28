import React, { useState, useEffect, memo } from 'react';
import { Video, Shield, Users, Copy, Check } from 'lucide-react';
import styles from '../../styles/meetingRoom.module.css';

/**
 * MeetingHeader — Floating top bar showing meeting info, timer, and badges.
 */
const MeetingHeader = memo(function MeetingHeader({
    meetingCode,
    participantCount = 1,
    username = '',
    presenter = null,
    localSocketId = '',
}) {
    const [elapsed, setElapsed] = useState(0);
    const [copied, setCopied] = useState(false);

    // Meeting timer
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(s => s + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) { }
    };

    const initials = username
        ? username.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    return (
        <header className={styles.meetingHeader}>
            {/* Left: Brand + Meeting Info */}
            <div className={styles.headerLeft}>
                <div className={styles.headerBrand}>
                    <div className={styles.headerLogoIcon}>
                        <Video size={16} />
                    </div>
                </div>
                <div className={styles.headerMeetingInfo}>
                    <span className={styles.headerMeetingName}>Vakyam Meeting</span>
                    <span
                        className={styles.headerMeetingId}
                        title="Click to copy meeting link"
                        onClick={copyLink}
                    >
                        {meetingCode}
                    </span>
                </div>
            </div>

            {/* Center: Timer + Presenter info */}
            <div className={styles.headerCenter}>
                <span className={styles.headerTimer}>{formatTime(elapsed)}</span>
                {presenter && (
                    <span className={styles.presenterBadge}>
                        {presenter.socketId === localSocketId ? 'You are presenting' : `${presenter.username} is presenting`}
                    </span>
                )}
            </div>

            {/* Right: Badges + Avatar */}
            <div className={styles.headerRight}>
                <div className={`${styles.headerBadge} ${styles.participants}`}>
                    <Users size={10} />
                    {participantCount}
                </div>
                <div className={`${styles.headerBadge} ${styles.encrypted}`}>
                    <Shield size={10} />
                    E2E
                </div>
                <button
                    className={styles.headerIconBtn}
                    onClick={copyLink}
                    title="Copy invite link"
                    aria-label="Copy invite link"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <div className={styles.headerAvatar} title={username}>
                    {initials}
                </div>
            </div>
        </header>
    );
});

export default MeetingHeader;
