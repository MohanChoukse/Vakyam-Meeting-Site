import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useActiveSpeaker — Web Audio API based active speaker detection.
 * Attaches an AnalyserNode to each remote stream to poll volume.
 * Returns the socketId of the current loudest speaking participant.
 *
 * @param {Array} videos - Array of { socketId, stream } objects from VideoMeet.jsx
 * @param {number} threshold - Minimum RMS volume to count as speaking (0-255)
 * @param {number} debounceMs - Minimum ms a person must speak before becoming active
 */
export function useActiveSpeaker(videos, threshold = 12, debounceMs = 800) {
    const [activeSpeakerId, setActiveSpeakerId] = useState(null);
    const [speakingMap, setSpeakingMap] = useState({});  // { socketId: bool }
    const analysersRef = useRef({});
    const rafRef = useRef(null);
    const candidateRef = useRef(null);
    const candidateTimerRef = useRef(null);

    const cleanup = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        Object.values(analysersRef.current).forEach(({ ctx }) => {
            try { ctx.close(); } catch (_) { }
        });
        analysersRef.current = {};
    }, []);

    useEffect(() => {
        cleanup();

        const analysers = {};

        videos.forEach(({ socketId, stream }) => {
            if (!stream) return;
            const audioTracks = stream.getAudioTracks();
            if (!audioTracks.length) return;

            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const source = ctx.createMediaStreamSource(stream);
                const analyser = ctx.createAnalyser();
                analyser.fftSize = 512;
                analyser.smoothingTimeConstant = 0.4;
                source.connect(analyser);
                analysers[socketId] = { ctx, analyser, dataArray: new Uint8Array(analyser.frequencyBinCount) };
            } catch (_) { /* Stream not ready */ }
        });

        analysersRef.current = analysers;

        const poll = () => {
            const newSpeakingMap = {};
            let maxVolume = threshold;
            let loudestId = null;

            Object.entries(analysers).forEach(([socketId, { analyser, dataArray }]) => {
                analyser.getByteFrequencyData(dataArray);
                const rms = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;
                const isSpeaking = rms > threshold;
                newSpeakingMap[socketId] = isSpeaking;

                if (isSpeaking && rms > maxVolume) {
                    maxVolume = rms;
                    loudestId = socketId;
                }
            });

            setSpeakingMap(newSpeakingMap);

            // Debounce speaker switch to avoid flickering
            if (loudestId !== null) {
                if (loudestId !== candidateRef.current) {
                    candidateRef.current = loudestId;
                    clearTimeout(candidateTimerRef.current);
                    candidateTimerRef.current = setTimeout(() => {
                        setActiveSpeakerId(loudestId);
                    }, debounceMs);
                }
            } else {
                // No one speaking, keep current or null after a longer grace period
                clearTimeout(candidateTimerRef.current);
                candidateTimerRef.current = setTimeout(() => {
                    candidateRef.current = null;
                    setActiveSpeakerId(null);
                }, debounceMs * 2);
            }

            rafRef.current = requestAnimationFrame(poll);
        };

        if (Object.keys(analysers).length > 0) {
            rafRef.current = requestAnimationFrame(poll);
        }

        return cleanup;
    }, [videos, threshold, debounceMs, cleanup]);

    return { activeSpeakerId, speakingMap };
}
