import React, { memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';
import ParticipantCard from './ParticipantCard';

/**
 * VideoGrid — Adaptive CSS-grid video layout engine.
 *
 * When presenter is active:
 *   → Presentation Layout (presenter in large main + others in filmstrip)
 * Else if activeSpeakerId is set OR pinnedId is set:
 *   → Presentation Layout (large main + filmstrip)
 * Otherwise:
 *   → Equal Grid Layout (auto-adapted by participant count)
 */
const VideoGrid = memo(function VideoGrid({
    localStream,
    localSocketId,
    localName,
    localMuted,
    localCamOn,
    videos = [],
    activeSpeakerId,
    speakingMap = {},
    pinnedId,
    onPin,
    localReaction,
    remoteReactions = {},
    isLocalHost = false,
    presenter = null,
}) {
    // Combine local + remote into a unified participants array
    const localParticipant = {
        socketId: localSocketId || 'local',
        stream: localStream,
        displayName: localName || 'You',
        isMuted: localMuted,
        isCameraOn: localCamOn,
        isHost: isLocalHost,
        handRaised: false,
        isLocal: true,
    };

    const allParticipants = [localParticipant, ...videos.map(v => ({ ...v, isLocal: false }))];
    const totalCount = allParticipants.length;

    // Determine "focus" participant for presentation mode
    const focusId = presenter ? presenter.socketId : (pinnedId || activeSpeakerId);
    const usePresentationMode = focusId !== null && focusId !== undefined && totalCount > 1;

    // Get data-count string for CSS grid selector
    const getCountKey = (n) => {
        if (n <= 10) return String(n);
        return 'large';
    };

    if (usePresentationMode) {
        const focusParticipant = allParticipants.find(p => p.socketId === focusId) || allParticipants[0];
        const stripParticipants = allParticipants.filter(p => p.socketId !== focusId);

        return (
            <div className={styles.presentationLayout}>
                {/* Main large view */}
                <div className={styles.presentationMain}>
                    <ParticipantCard
                        stream={focusParticipant.stream}
                        socketId={focusParticipant.socketId}
                        displayName={focusParticipant.displayName}
                        isLocal={focusParticipant.isLocal}
                        isHost={focusParticipant.isHost}
                        isMuted={focusParticipant.isMuted}
                        isCameraOn={focusParticipant.isCameraOn}
                        isSpeaking={speakingMap[focusParticipant.socketId]}
                        handRaised={focusParticipant.handRaised}
                        isPinned={pinnedId === focusParticipant.socketId}
                        onPin={onPin}
                        isStrip={false}
                        isPresenter={focusParticipant.socketId === presenter?.socketId}
                        reactions={remoteReactions[focusParticipant.socketId] || (focusParticipant.isLocal ? remoteReactions['local'] : [])}
                    />
                </div>
                {/* Film strip */}
                <div className={styles.presentationStrip}>
                    {stripParticipants.map(p => (
                        <ParticipantCard
                            key={p.socketId}
                            stream={p.stream}
                            socketId={p.socketId}
                            displayName={p.displayName}
                            isLocal={p.isLocal}
                            isHost={p.isHost}
                            isMuted={p.isMuted}
                            isCameraOn={p.isCameraOn}
                            isSpeaking={speakingMap[p.socketId]}
                            handRaised={p.handRaised}
                            isPinned={pinnedId === p.socketId}
                            onPin={onPin}
                            isStrip={true}
                            isPresenter={p.socketId === presenter?.socketId}
                            reactions={remoteReactions[p.socketId] || (p.isLocal ? remoteReactions['local'] : [])}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Equal grid mode
    return (
        <div
            className={styles.videoGrid}
            data-count={getCountKey(totalCount)}
        >
            {allParticipants.map(p => (
                <ParticipantCard
                    key={p.socketId}
                    stream={p.stream}
                    socketId={p.socketId}
                    displayName={p.displayName}
                    isLocal={p.isLocal}
                    isHost={p.isHost}
                    isMuted={p.isMuted}
                    isCameraOn={p.isCameraOn}
                    isSpeaking={speakingMap[p.socketId]}
                    handRaised={p.handRaised}
                    isPinned={pinnedId === p.socketId}
                    onPin={onPin}
                    isStrip={false}
                    isPresenter={p.socketId === presenter?.socketId}
                    reactions={remoteReactions[p.socketId] || (p.isLocal ? remoteReactions['local'] : [])}
                />
            ))}
        </div>
    );
});

export default VideoGrid;
