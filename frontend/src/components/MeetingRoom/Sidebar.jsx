import React, { memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';
import ChatPanel from './ChatPanel';
import ParticipantList from './ParticipantList';

/**
 * Sidebar — Collapsible right panel with Chat and Participants tabs.
 * open: boolean
 * activeTab: 'chat' | 'participants'
 */
const Sidebar = memo(function Sidebar({
    open,
    activeTab,
    onTabChange,
    // Chat props
    messages,
    localUsername,
    message,
    onMessageChange,
    onSend,
    // Participants props
    localName,
    localSocketId,
    localMuted,
    localCamOn,
    isLocalHost,
    localHandRaised,
    videos,
    participants = {},
    speakingMap,
}) {
    return (
        <div className={`${styles.sidebarWrapper} ${open ? styles.open : ''}`}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarTabs} role="tablist">
                    <button
                        role="tab"
                        className={`${styles.sidebarTab} ${activeTab === 'chat' ? styles.active : ''}`}
                        onClick={() => onTabChange('chat')}
                        aria-selected={activeTab === 'chat'}
                    >
                        Chat
                    </button>
                    <button
                        role="tab"
                        className={`${styles.sidebarTab} ${activeTab === 'participants' ? styles.active : ''}`}
                        onClick={() => onTabChange('participants')}
                        aria-selected={activeTab === 'participants'}
                    >
                        People
                    </button>
                </div>

                {activeTab === 'chat' ? (
                    <ChatPanel
                        messages={messages}
                        localUsername={localUsername}
                        message={message}
                        onMessageChange={onMessageChange}
                        onSend={onSend}
                    />
                ) : (
                    <ParticipantList
                        localName={localName}
                        localSocketId={localSocketId}
                        localMuted={localMuted}
                        localCamOn={localCamOn}
                        isLocalHost={isLocalHost}
                        localHandRaised={localHandRaised}
                        videos={videos}
                        participants={participants}
                        speakingMap={speakingMap}
                    />
                )}
            </aside>
        </div>
    );
});

export default Sidebar;
