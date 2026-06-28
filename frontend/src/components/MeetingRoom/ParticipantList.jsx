import React, { memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';

/**
 * ParticipantList — Scrollable list of all participants with mic/cam/hand status.
 * Uses the authoritative `participants` map { [socketId]: { socketId, username, joinedAt } }
 * from the backend to resolve real display names.
 */
const ParticipantList = memo(function ParticipantList({
    localName = 'You',
    localSocketId,
    localMuted = false,
    localCamOn = true,
    isLocalHost = false,
    localHandRaised = false,
    videos = [],        // [{ socketId, isMuted, isCameraOn, isHost, handRaised }]
    participants = {},  // { [socketId]: { socketId, username, joinedAt } }
    speakingMap = {},
}) {
    const getInitials = (name) =>
        (name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const localParticipant = {
        socketId: localSocketId || 'local',
        displayName: localName,
        isMuted: localMuted,
        isCameraOn: localCamOn,
        isHost: isLocalHost,
        handRaised: localHandRaised,
        isLocal: true,
    };

    // Build remote participants using the authoritative participants map for names
    const remoteParticipants = videos.map(v => {
        const p = participants[v.socketId];
        return {
            ...v,
            displayName: (p && p.username) ? p.username : 'Participant',
            isLocal: false,
        };
    });

    const allParticipants = [localParticipant, ...remoteParticipants];

    return (
        <div className={styles.sidebarContent}>
            <div className={styles.participantsList}>
                <div className={styles.participantsGroupLabel}>
                    In This Call — {allParticipants.length}
                </div>

                {allParticipants.map((p) => (
                    <div key={p.socketId} className={styles.participantListItem}>
                        <div className={`${styles.participantListAvatar} ${speakingMap[p.socketId] ? styles.speaking : ''}`}>
                            {getInitials(p.displayName)}
                        </div>
                        <div className={styles.participantListInfo}>
                            <div className={styles.participantListName}>
                                {p.displayName}
                                {p.isLocal && (
                                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 500 }}> (You)</span>
                                )}
                                {p.isHost && (
                                    <span style={{ fontSize: '10px', color: '#FACC15', fontWeight: 700, marginLeft: '4px' }}>Host</span>
                                )}
                                {p.handRaised && <span style={{ marginLeft: '4px' }}>✋</span>}
                            </div>
                            <div className={styles.participantListStatus}>
                                {speakingMap[p.socketId] ? 'Speaking...' : 'In call'}
                            </div>
                        </div>
                        <div className={styles.participantListIcons}>
                            <div className={`${styles.statusIcon} ${p.isMuted ? styles.muted : ''}`}>
                                {p.isMuted ? '🔇' : '🎙️'}
                            </div>
                            <div className={styles.statusIcon}>
                                {p.isCameraOn ? '📹' : '📷'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default ParticipantList;
