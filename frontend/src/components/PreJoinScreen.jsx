import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, ArrowLeft, Shield, Globe, Monitor, Settings2, ChevronDown } from 'lucide-react';
import styles from '../styles/preJoin.module.css';

export default function PreJoinScreen({ onJoin, meetingCode }) {
  const navigate = useNavigate();

  // Media state
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState('loading'); // 'loading' | 'granted' | 'denied'

  // Form state
  const [name, setName] = useState('');
  const [joining, setJoining] = useState(false);
  
  // Devices state
  const [cameras, setCameras] = useState([]);
  const [mics, setMics] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [selectedMic, setSelectedMic] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState('');

  // Audio meter
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);

  const getMedia = useCallback(async (deviceIdOverrides = {}) => {
    try {
      setPermissionStatus('loading');
      
      const constraints = {
        video: deviceIdOverrides.video ? { deviceId: { exact: deviceIdOverrides.video } } : true,
        audio: deviceIdOverrides.audio ? { deviceId: { exact: deviceIdOverrides.audio } } : true,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Initialize audio meter
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        let average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationRef.current = requestAnimationFrame(updateMeter);
      };
      
      updateMeter();

      // Enumerate devices once we have permissions
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      const audioInputDevices = devices.filter(d => d.kind === 'audioinput');
      const audioOutputDevices = devices.filter(d => d.kind === 'audiooutput');

      setCameras(videoDevices);
      setMics(audioInputDevices);
      setSpeakers(audioOutputDevices);

      if (!deviceIdOverrides.video && videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
      if (!deviceIdOverrides.audio && audioInputDevices.length > 0) setSelectedMic(audioInputDevices[0].deviceId);
      if (audioOutputDevices.length > 0 && !selectedSpeaker) setSelectedSpeaker(audioOutputDevices[0].deviceId);

      setPermissionStatus('granted');
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setPermissionStatus('denied');
    }
  }, [selectedSpeaker]);

  useEffect(() => {
    getMedia();

    return () => {
      // Cleanup on unmount
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleDeviceChange = async (type, deviceId) => {
    if (type === 'video') {
      setSelectedCamera(deviceId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      await getMedia({ video: deviceId, audio: selectedMic });
    } else if (type === 'audio') {
      setSelectedMic(deviceId);
      if (stream) stream.getTracks().forEach(track => track.stop());
      await getMedia({ video: selectedCamera, audio: deviceId });
    } else if (type === 'speaker') {
      setSelectedSpeaker(deviceId);
      if (videoRef.current && typeof videoRef.current.setSinkId === 'function') {
        try {
          await videoRef.current.setSinkId(deviceId);
        } catch (error) {
          console.error("Error setting speaker:", error);
        }
      }
    }
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicOn(audioTrack.enabled);
        if (!audioTrack.enabled) setAudioLevel(0); // Reset meter visually when muted
      }
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim().length >= 3) {
      setJoining(true);
      // Pass the fully configured localStream and the states up to VideoMeet
      window.localStream = stream; 
      onJoin(name.trim(), cameraOn, micOn);
    }
  };

  const handleBack = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  const isNameValid = name.trim().length >= 3 && name.trim().length <= 30;

  return (
    <div className={styles.container}>
      {/* Abstract Backgrounds */}
      <div className={styles.backgroundAccents}>
        <div className={styles.blob1}></div>
        <div className={styles.blob2}></div>
      </div>

      <button className={styles.backButton} onClick={handleBack} aria-label="Back to Home">
        <ArrowLeft size={16} /> <span>Back to Home</span>
      </button>

      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className={styles.leftColumn}>
          <div className={styles.videoSection}>
          {permissionStatus === 'loading' && (
            <div className={styles.videoOverlay}>
              <div className={styles.spinner}><Globe size={24} /></div>
              <p>Requesting camera & microphone access...</p>
            </div>
          )}
          
          {permissionStatus === 'denied' && (
            <div className={styles.videoOverlay}>
              <p className={styles.errorMessage}>Camera or Microphone permission is required to join the meeting.</p>
              <button 
                onClick={() => getMedia()} 
                style={{ background: 'white', color: 'black', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Retry Permission
              </button>
            </div>
          )}

          {!cameraOn && permissionStatus === 'granted' && (
            <div className={styles.videoOverlay}>
              <VideoOff size={32} />
              <p style={{ marginTop: '8px' }}>Camera is off</p>
            </div>
          )}

          {/* Note: Removed transform: scaleX(-1) to show true representation */}
          <motion.video 
            ref={videoRef}
            className={styles.videoElement}
            autoPlay 
            muted 
            playsInline
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className={styles.deviceControls}>
          <button 
            className={`${styles.controlButton} ${!cameraOn ? styles.off : ''}`} 
            onClick={toggleCamera}
            disabled={permissionStatus !== 'granted'}
            aria-label={cameraOn ? "Turn off camera" : "Turn on camera"}
          >
            {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
          </button>
          <button 
            className={`${styles.controlButton} ${!micOn ? styles.off : ''}`} 
            onClick={toggleMic}
            disabled={permissionStatus !== 'granted'}
            aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
          >
            {micOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ready to join?</h1>
            <p className={styles.subtitle}>Meeting Code: <strong>{meetingCode || 'Guest Room'}</strong></p>
            <div className={styles.badges}>
              <span className={styles.badge}><Monitor size={12} /> Browser Based</span>
              <span className={`${styles.badge} ${styles.encrypted}`}><Shield size={12} /> End-to-End Encrypted</span>
            </div>
          </div>

        <form className={styles.formSection} onSubmit={handleJoin}>
          {/* Extra Feature: Device Selection */}
          {permissionStatus === 'granted' && cameras.length > 0 && (
            <div className={styles.deviceSelection}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className={styles.selectWrapper} style={{ flex: 1 }}>
                  <select 
                    className={styles.deviceSelect}
                    value={selectedCamera}
                    onChange={(e) => handleDeviceChange('video', e.target.value)}
                  >
                    {cameras.map(cam => (
                      <option key={cam.deviceId} value={cam.deviceId}>{cam.label || `Camera ${cam.deviceId.substring(0, 5)}...`}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
                
                <div className={styles.selectWrapper} style={{ flex: 1 }}>
                  <select 
                    className={styles.deviceSelect}
                    value={selectedMic}
                    onChange={(e) => handleDeviceChange('audio', e.target.value)}
                  >
                    {mics.map(mic => (
                      <option key={mic.deviceId} value={mic.deviceId}>{mic.label || `Mic ${mic.deviceId.substring(0, 5)}...`}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                  {micOn && (
                    <div className={styles.meterContainer}>
                      <div className={styles.meterFill} style={{ width: `${audioLevel}%` }}></div>
                    </div>
                  )}
                </div>
              </div>
              
              {speakers.length > 0 && (
                <div className={styles.selectWrapper}>
                  <select 
                    className={styles.deviceSelect}
                    value={selectedSpeaker}
                    onChange={(e) => handleDeviceChange('speaker', e.target.value)}
                  >
                    {speakers.map(speaker => (
                      <option key={speaker.deviceId} value={speaker.deviceId}>{speaker.label || `Speaker ${speaker.deviceId.substring(0, 5)}...`}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              )}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="nameInput" className={styles.inputLabel}>Your Name</label>
            <input
              id="nameInput"
              className={styles.inputField}
              type="text"
              placeholder="e.g. Rahul Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              disabled={joining}
            />
            {name.length > 0 && !isNameValid && (
              <span className={styles.inputError}>Minimum 3 characters required</span>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.joinButton} 
            disabled={!isNameValid || permissionStatus !== 'granted' || joining}
          >
            {joining ? (
              <><Globe size={18} className={styles.spinner} style={{ marginBottom: 0 }} /> Joining...</>
            ) : 'Join Meeting'}
          </button>
        </form>
        </div>
      </motion.div>
    </div>
  );
}
