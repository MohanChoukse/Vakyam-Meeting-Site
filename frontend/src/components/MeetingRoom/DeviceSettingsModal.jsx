import React, { useState, useEffect, memo } from 'react';
import { X } from 'lucide-react';
import styles from '../../styles/meetingRoom.module.css';

/**
 * DeviceSettingsModal — Popup to select camera, mic, speaker devices.
 * onClose: closes modal
 * onApply({ videoDeviceId, audioDeviceId }): applies new device selection
 */
const DeviceSettingsModal = memo(function DeviceSettingsModal({ onClose, onApply }) {
    const [devices, setDevices] = useState({ video: [], audio: [], speaker: [] });
    const [selected, setSelected] = useState({ videoDeviceId: '', audioDeviceId: '', speakerId: '' });

    useEffect(() => {
        (async () => {
            try {
                const allDevices = await navigator.mediaDevices.enumerateDevices();
                setDevices({
                    video: allDevices.filter(d => d.kind === 'videoinput'),
                    audio: allDevices.filter(d => d.kind === 'audioinput'),
                    speaker: allDevices.filter(d => d.kind === 'audiooutput'),
                });
            } catch (e) {
                console.error('Could not enumerate devices', e);
            }
        })();
    }, []);

    const handleApply = () => {
        onApply(selected);
        onClose();
    };

    return (
        <div
            className={styles.modalBackdrop}
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className={styles.settingsModal}>
                <div className={styles.settingsModalHeader}>
                    <span id="settings-title" className={styles.settingsModalTitle}>
                        ⚙️ Device Settings
                    </span>
                    <button
                        className={styles.headerIconBtn}
                        onClick={onClose}
                        aria-label="Close settings"
                    >
                        <X size={14} />
                    </button>
                </div>

                <div className={styles.settingsModalBody}>
                    {/* Camera */}
                    <div className={styles.settingsGroup}>
                        <label htmlFor="camera-select">Camera</label>
                        <select
                            id="camera-select"
                            className={styles.settingsSelect}
                            value={selected.videoDeviceId}
                            onChange={e => setSelected(s => ({ ...s, videoDeviceId: e.target.value }))}
                        >
                            {devices.video.length === 0 && <option value="">No cameras found</option>}
                            {devices.video.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>
                                    {d.label || `Camera ${d.deviceId.slice(0, 6)}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Microphone */}
                    <div className={styles.settingsGroup}>
                        <label htmlFor="mic-select">Microphone</label>
                        <select
                            id="mic-select"
                            className={styles.settingsSelect}
                            value={selected.audioDeviceId}
                            onChange={e => setSelected(s => ({ ...s, audioDeviceId: e.target.value }))}
                        >
                            {devices.audio.length === 0 && <option value="">No microphones found</option>}
                            {devices.audio.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>
                                    {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Speaker */}
                    {devices.speaker.length > 0 && (
                        <div className={styles.settingsGroup}>
                            <label htmlFor="speaker-select">Speaker</label>
                            <select
                                id="speaker-select"
                                className={styles.settingsSelect}
                                value={selected.speakerId}
                                onChange={e => setSelected(s => ({ ...s, speakerId: e.target.value }))}
                            >
                                {devices.speaker.map(d => (
                                    <option key={d.deviceId} value={d.deviceId}>
                                        {d.label || `Speaker ${d.deviceId.slice(0, 6)}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className={styles.settingsModalFooter}>
                    <button className={styles.btnGhost} onClick={onClose}>Cancel</button>
                    <button className={styles.btnPrimary} onClick={handleApply}>Apply</button>
                </div>
            </div>
        </div>
    );
});

export default DeviceSettingsModal;
