import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from '../../styles/meetingRoom.module.css';
import MeetingHeader from './MeetingHeader';
import VideoGrid from './VideoGrid';
import Sidebar from './Sidebar';
import FloatingControlDock from './FloatingControlDock';
import DeviceSettingsModal from './DeviceSettingsModal';
import { useActiveSpeaker } from '../../hooks/useActiveSpeaker';

/**
 * MeetingRoom — Top-level UI wrapper for the video meeting.
 *
 * All WebRTC / Socket.IO state lives in VideoMeet.jsx and is passed
 * down via props. This component is purely UI + UX orchestration.
 *
 * Props:
 *  videos, localStream, localSocketId, username
 *  video (bool), audio (bool), screen (bool), screenAvailable (bool)
 *  messages, message, newMessages
 *  onToggleVideo, onToggleAudio, onToggleScreen
 *  onSendMessage, onMessageChange, onEndCall
 *  meetingCode
 */
export default function MeetingRoom({
    videos = [],
    participants = {},  // { [socketId]: { socketId, username, joinedAt } }
    localStream,
    localSocketId,
    username = 'Guest',
    video: cameraOn = true,
    audio: micOn = true,
    screen = false,
    screenAvailable = false,
    presenter = null,
    messages = [],
    message = '',
    newMessages = 0,
    onToggleVideo,
    onToggleAudio,
    onToggleScreen,
    onSendMessage,
    onMessageChange,
    onEndCall,
    meetingCode = '',
}) {
    // Sidebar state
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarTab, setSidebarTab] = useState('chat');

    // Raise hand
    const [handRaised, setHandRaised] = useState(false);

    // Device settings modal
    const [showSettings, setShowSettings] = useState(false);

    // Pinned participant
    const [pinnedId, setPinnedId] = useState(null);

    // Reactions (local floating)
    const [localReaction, setLocalReaction] = useState(null);
    const reactionTimerRef = useRef(null);

    // Active speaker detection — only from remote streams (can't detect own mic via AnalyserNode on local stream easily)
    const { activeSpeakerId, speakingMap } = useActiveSpeaker(videos);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            switch (e.key.toLowerCase()) {
                case 'm': onToggleAudio(); break;
                case 'v': onToggleVideo(); break;
                case 'c':
                    setSidebarOpen(o => !o);
                    setSidebarTab('chat');
                    break;
                case 'p':
                    setSidebarOpen(o => !o);
                    setSidebarTab('participants');
                    break;
                case 'h': setHandRaised(r => !r); break;
                default: break;
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onToggleAudio, onToggleVideo]);

    const handleToggleChat = useCallback(() => {
        setSidebarTab('chat');
        setSidebarOpen(o => !o);
    }, []);

    const handleToggleParticipants = useCallback(() => {
        setSidebarTab('participants');
        setSidebarOpen(true);
    }, []);

    const handleToggleHand = useCallback(() => {
        setHandRaised(r => !r);
    }, []);

    const handlePin = useCallback((socketId) => {
        setPinnedId(prev => prev === socketId ? null : socketId);
    }, []);

    const handleReaction = useCallback((emoji) => {
        const id = Date.now();
        setLocalReaction({ id, emoji });
        clearTimeout(reactionTimerRef.current);
        reactionTimerRef.current = setTimeout(() => setLocalReaction(null), 3000);
    }, []);

    const handleApplySettings = useCallback((deviceConfig) => {
        // Device switching: re-request media with new deviceIds
        if (deviceConfig.videoDeviceId || deviceConfig.audioDeviceId) {
            navigator.mediaDevices.getUserMedia({
                video: deviceConfig.videoDeviceId ? { deviceId: { exact: deviceConfig.videoDeviceId } } : true,
                audio: deviceConfig.audioDeviceId ? { deviceId: { exact: deviceConfig.audioDeviceId } } : true,
            }).then(stream => {
                if (window.localStream) {
                    window.localStream.getTracks().forEach(t => t.stop());
                }
                window.localStream = stream;
            }).catch(e => console.warn('Device switch failed:', e));
        }
    }, []);

    // Clear reaction timer on unmount
    useEffect(() => {
        return () => clearTimeout(reactionTimerRef.current);
    }, []);

    const participantCount = videos.length + 1; // +1 for local

    // Resolve display names from the authoritative participants map
    const enrichedVideos = videos.map(v => {
        const p = participants[v.socketId];
        return {
            ...v,
            displayName: (p && p.username) ? p.username : 'Participant',
            isMuted: v.isMuted ?? false,
            isCameraOn: v.isCameraOn ?? true,
            isHost: v.isHost ?? false,
            handRaised: v.handRaised ?? false,
        };
    });

    return (
        <div className={styles.meetingRoomRoot}>
            {/* Floating Header */}
             <MeetingHeader
                meetingCode={meetingCode}
                participantCount={participantCount}
                username={username}
                presenter={presenter}
                localSocketId={localSocketId}
            />

            {/* Main Layout */}
            <div className={styles.meetingLayout}>
                {/* Video Area */}
                <div className={styles.videoArea}>
                    <VideoGrid
                        localStream={localStream}
                        localSocketId={localSocketId || 'local'}
                        localName={username}
                        localMuted={!micOn}
                        localCamOn={cameraOn}
                        videos={enrichedVideos}
                        activeSpeakerId={activeSpeakerId}
                        speakingMap={speakingMap}
                        pinnedId={pinnedId}
                        onPin={handlePin}
                        localReaction={localReaction}
                        remoteReactions={{}}
                        isLocalHost={false}
                        presenter={presenter}
                    />
                </div>

                {/* Collapsible Sidebar */}
                <Sidebar
                    open={sidebarOpen}
                    activeTab={sidebarTab}
                    onTabChange={setSidebarTab}
                    // Chat
                    messages={messages}
                    localUsername={username}
                    message={message}
                    onMessageChange={onMessageChange}
                    onSend={onSendMessage}
                    // Participants
                    localName={username}
                    localSocketId={localSocketId}
                    localMuted={!micOn}
                    localCamOn={cameraOn}
                    isLocalHost={false}
                    localHandRaised={handRaised}
                    videos={enrichedVideos}
                    participants={participants}
                    speakingMap={speakingMap}
                />
            </div>

            {/* Floating Control Dock */}
            <FloatingControlDock
                video={cameraOn}
                audio={micOn}
                screen={screen}
                screenAvailable={screenAvailable}
                showModal={sidebarOpen && sidebarTab === 'chat'}
                newMessages={newMessages}
                handRaised={handRaised}
                onToggleVideo={onToggleVideo}
                onToggleAudio={onToggleAudio}
                onToggleScreen={onToggleScreen}
                onToggleChat={handleToggleChat}
                onToggleParticipants={handleToggleParticipants}
                onToggleHand={handleToggleHand}
                onReaction={handleReaction}
                onSettings={() => setShowSettings(true)}
                onEndCall={onEndCall}
            />

            {/* Device Settings Modal */}
            {showSettings && (
                <DeviceSettingsModal
                    onClose={() => setShowSettings(false)}
                    onApply={handleApplySettings}
                />
            )}
        </div>
    );
}
