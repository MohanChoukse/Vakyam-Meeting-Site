import React, { useRef, useEffect, memo } from 'react';
import styles from '../../styles/meetingRoom.module.css';

/**
 * ChatPanel — Modern chat panel showing message bubbles with timestamps.
 * Receives: messages, localUsername, message, onMessageChange, onSend
 */
const ChatPanel = memo(function ChatPanel({
    messages = [],
    localUsername = 'You',
    message = '',
    onMessageChange,
    onSend,
}) {
    const bottomRef = useRef(null);

    // Auto scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) onSend();
        }
    };

    const formatTime = () => {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.sidebarContent}>
            <div className={styles.chatMessages}>
                {messages.length === 0 ? (
                    <div className={styles.chatEmptyState}>
                        <div className={styles.chatEmptyIcon}>💬</div>
                        <p>No messages yet.<br />Say hello to your team!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isSelf = msg.sender === localUsername;
                        return (
                            <div key={i} className={styles.chatMessage}>
                                <div className={styles.chatMessageHeader}>
                                    <span className={`${styles.chatSender} ${isSelf ? styles.self : ''}`}>
                                        {isSelf ? 'You' : msg.sender}
                                    </span>
                                    <span className={styles.chatTimestamp}>{formatTime()}</span>
                                </div>
                                <p className={styles.chatText}>{msg.data}</p>
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            <div className={styles.chatInputArea}>
                <textarea
                    className={styles.chatInput}
                    placeholder="Message everyone..."
                    value={message}
                    onChange={(e) => onMessageChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    aria-label="Chat message input"
                />
                <button
                    className={styles.chatSendBtn}
                    onClick={onSend}
                    disabled={!message.trim()}
                    aria-label="Send message"
                >
                    ➤
                </button>
            </div>
        </div>
    );
});

export default ChatPanel;
