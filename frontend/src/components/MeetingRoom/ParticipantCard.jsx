import React, { useRef, useEffect, memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';

/**
 * ParticipantCard — Renders a single participant's video/avatar card.
 * Handles both local and remote participants.
 * Local: transform: scaleX(1) to prevent mirroring.
 * Camera off: shows gradient avatar with initials.
 */
const ParticipantCard = memo(function ParticipantCard({
    stream,
    socketId,
    displayName = 'Participant',
    isLocal = false,
    isHost = false,
    isMuted = false,
    isCameraOn = true,
    isSpeaking = false,
    handRaised = false,
    isPinned = false,
    onPin,
    isStrip = false,
    isPresenter = false,
    reactions = [],
}) {
    const videoRef = useRef(null);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    const initials = displayName
        ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'P';

    const cardClass = isStrip
        ? `${styles.participantCardStrip} ${isSpeaking ? styles.speaking : ''} ${isPinned ? styles.pinned : ''}`
        : `${styles.participantCard} ${isSpeaking ? styles.speaking : ''} ${isPinned ? styles.pinned : ''}`;

    // Force showing video element if presenting screen
    const showVideo = isCameraOn || isPresenter;

    return (
        <div className={cardClass} onDoubleClick={() => onPin && onPin(socketId)}>
            {/* Video element — always rendered so stream can attach */}
            <video
                ref={videoRef}
                className={`${styles.participantVideo} ${isLocal ? styles.participantVideoLocal : ''}`}
                autoPlay
                muted={isLocal}
                playsInline
                style={{ display: showVideo ? 'block' : 'none' }}
            />

            {/* Camera Off State — Beautiful Avatar */}
            {!showVideo && (
                <div className={styles.cameraOffAvatar}>
                    <div className={styles.cameraOffInitials}>{initials}</div>
                    <span className={styles.cameraOffName}>{displayName}</span>
                </div>
            )}

            {/* Flying reactions above card */}
            {reactions && reactions.length > 0 && reactions.map(r => (
                <div key={r.id} className={styles.cardReaction}>
                    {r.emoji}
                </div>
            ))}

            {/* Top-left: YOU / HOST / HAND / SCREEN SHARE badges */}
            <div className={styles.cardBadges}>
                {isLocal && <span className={`${styles.badge} ${styles.you}`}>You</span>}
                {isHost && <span className={`${styles.badge} ${styles.host}`}>Host</span>}
                {handRaised && <span className={`${styles.badge} ${styles.hand}`}>✋</span>}
                {isPresenter && <span className={`${styles.badge} ${styles.presenter}`}>🖥 Sharing Screen</span>}
                <span className={`${styles.badge}`} style={{ background: 'rgba(0,0,0,0.5)', color: '#4ade80', border: '1px solid rgba(255,255,255,0.1)' }}>
                    🟢
                </span>
            </div>

            {/* Top-right: status icons */}
            <div className={styles.cardIcons}>
                {isMuted && (
                    <div className={`${styles.cardIcon} ${styles.muted}`} title="Muted">
                        🔇
                    </div>
                )}
                {!showVideo && (
                    <div className={styles.cardIcon} title="Camera Off">
                        📷
                    </div>
                )}
            </div>

            {/* Bottom: name + speaking wave */}
            <div className={styles.cardOverlay}>
                <div className={styles.cardNameRow}>
                    <span className={styles.cardName}>
                        {displayName}
                    </span>
                    {isSpeaking && (
                        <div className={styles.speakingWave}>
                            <span /><span /><span />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

export default ParticipantCard;
