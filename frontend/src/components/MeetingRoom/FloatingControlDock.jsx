import React, { useState, useCallback, memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';

const REACTIONS = ['👍', '👏', '❤️', '😂', '🎉', '🔥'];

/**
 * FloatingControlDock — MacOS-inspired bottom control dock.
 *
 * Props:
 *  video, audio, screen, showModal, newMessages, handRaised
 *  onToggleVideo, onToggleAudio, onToggleScreen, onToggleChat,
 *  onToggleParticipants, onToggleHand, onReaction, onSettings, onEndCall
 */
const FloatingControlDock = memo(function FloatingControlDock({
    video = true,
    audio = true,
    screen = false,
    screenAvailable = false,
    showModal = false,
    newMessages = 0,
    handRaised = false,
    onToggleVideo,
    onToggleAudio,
    onToggleScreen,
    onToggleChat,
    onToggleParticipants,
    onToggleHand,
    onReaction,
    onSettings,
    onEndCall,
}) {
    const [showReactions, setShowReactions] = useState(false);

    const handleReaction = useCallback((emoji) => {
        onReaction && onReaction(emoji);
        setShowReactions(false);
    }, [onReaction]);

    return (
        <>
            {/* Reactions Picker */}
            {showReactions && (
                <div className={styles.reactionsPopup} role="toolbar" aria-label="Reactions">
                    {REACTIONS.map(emoji => (
                        <button
                            key={emoji}
                            className={styles.reactionBtn}
                            onClick={() => handleReaction(emoji)}
                            aria-label={`React with ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            <div className={styles.controlDock} role="toolbar" aria-label="Meeting controls">
                {/* Microphone */}
                <button
                    className={`${styles.dockBtn} ${!audio ? styles.active : ''}`}
                    onClick={onToggleAudio}
                    data-tooltip={audio ? 'Mute (M)' : 'Unmute (M)'}
                    aria-label={audio ? 'Mute microphone' : 'Unmute microphone'}
                    aria-pressed={!audio}
                >
                    <span>{audio ? '🎙️' : '🔇'}</span>
                    <span className={styles.dockBtnLabel}>{audio ? 'Mute' : 'Unmute'}</span>
                </button>

                {/* Camera */}
                <button
                    className={`${styles.dockBtn} ${!video ? styles.active : ''}`}
                    onClick={onToggleVideo}
                    data-tooltip={video ? 'Stop Video (V)' : 'Start Video (V)'}
                    aria-label={video ? 'Stop camera' : 'Start camera'}
                    aria-pressed={!video}
                >
                    <span>{video ? '📹' : '📷'}</span>
                    <span className={styles.dockBtnLabel}>{video ? 'Video' : 'Video Off'}</span>
                </button>

                {/* Screen Share */}
                {screenAvailable && (
                    <button
                        className={`${styles.dockBtn} ${screen ? styles.active : ''}`}
                        onClick={onToggleScreen}
                        data-tooltip={screen ? 'Stop Sharing' : 'Share Screen (S)'}
                        aria-label={screen ? 'Stop screen share' : 'Share screen'}
                        aria-pressed={screen}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-monitor"
                        >
                            <rect width="20" height="14" x="2" y="3" rx="2" />
                            <line x1="8" x2="16" y1="21" y2="21" />
                            <line x1="12" x2="12" y1="17" y2="21" />
                        </svg>
                        <span className={styles.dockBtnLabel}>{screen ? 'Stop Sharing' : 'Share Screen'}</span>
                    </button>
                )}

                <div className={styles.dockDivider} />

                {/* Chat */}
                <button
                    className={`${styles.dockBtn} ${showModal ? styles.active : ''}`}
                    onClick={onToggleChat}
                    data-tooltip="Chat (C)"
                    aria-label="Toggle chat"
                    aria-pressed={showModal}
                >
                    <span>💬</span>
                    {newMessages > 0 && (
                        <div className={styles.dockBadge}>{newMessages > 9 ? '9+' : newMessages}</div>
                    )}
                    <span className={styles.dockBtnLabel}>Chat</span>
                </button>

                {/* Participants */}
                <button
                    className={styles.dockBtn}
                    onClick={onToggleParticipants}
                    data-tooltip="Participants (P)"
                    aria-label="Toggle participants"
                >
                    <span>👥</span>
                    <span className={styles.dockBtnLabel}>People</span>
                </button>

                {/* Raise Hand */}
                <button
                    className={`${styles.dockBtn} ${handRaised ? styles.active : ''}`}
                    onClick={onToggleHand}
                    data-tooltip={handRaised ? 'Lower Hand' : 'Raise Hand (H)'}
                    aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
                    aria-pressed={handRaised}
                >
                    <span>✋</span>
                    <span className={styles.dockBtnLabel}>Hand</span>
                </button>

                {/* Reactions */}
                <button
                    className={`${styles.dockBtn} ${showReactions ? styles.active : ''}`}
                    onClick={() => setShowReactions(r => !r)}
                    data-tooltip="Reactions"
                    aria-label="Send a reaction"
                    aria-expanded={showReactions}
                >
                    <span>😊</span>
                    <span className={styles.dockBtnLabel}>React</span>
                </button>

                {/* Settings */}
                <button
                    className={styles.dockBtn}
                    onClick={onSettings}
                    data-tooltip="Device Settings"
                    aria-label="Open device settings"
                >
                    <span>⚙️</span>
                    <span className={styles.dockBtnLabel}>Settings</span>
                </button>

                <div className={styles.dockDivider} />

                {/* Leave */}
                <button
                    className={`${styles.dockBtn} ${styles.danger}`}
                    onClick={onEndCall}
                    data-tooltip="Leave Meeting"
                    aria-label="Leave meeting"
                >
                    <span>📵</span>
                    <span className={styles.dockBtnLabel}>Leave</span>
                </button>
            </div>
        </>
    );
});

export default FloatingControlDock;
