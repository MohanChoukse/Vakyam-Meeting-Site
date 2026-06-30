import React, { useEffect, useRef, useState, useCallback } from 'react'
import io from "socket.io-client";
import server from '../environment';
import PreJoinScreen from '../components/PreJoinScreen';
import MeetingRoom from '../components/MeetingRoom/MeetingRoom';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

const silence = () => {
    let ctx = new AudioContext()
    let oscillator = ctx.createOscillator()
    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start()
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}

const black = ({ width = 640, height = 480 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext('2d').fillRect(0, 0, width, height)
    let stream = canvas.captureStream()
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();



    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();




    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [remoteReactions, setRemoteReactions] = useState({});
    let [isReconnecting, setIsReconnecting] = useState(false);
    let [myStream, setMyStream] = useState(null);
    // socketId -> { socketId, username, joinedAt }
    let [participants, setParticipants] = useState({});
    let [isSharingScreen, setIsSharingScreen] = useState(false);
    let [cameraWasOnBeforeShare, setCameraWasOnBeforeShare] = useState(true);
    let [presenter, setPresenter] = useState(null); // { socketId, username }
    let [screenAvailable] = useState(
        typeof navigator !== 'undefined' && 
        typeof navigator.mediaDevices !== 'undefined' && 
        typeof navigator.mediaDevices.getDisplayMedia !== 'undefined'
    );

    // Auto-rejoin from session storage
    useEffect(() => {
        const sessionData = sessionStorage.getItem('vakyam_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const currentRoom = window.location.pathname.replace('/', '');

                // If it's the same room and within 60 seconds of last activity
                if (session.room === currentRoom && (Date.now() - session.timestamp < 60000)) {
                    setIsReconnecting(true);
                    setUsername(session.username);
                    setVideoAvailable(session.cameraOn);
                    setAudioAvailable(session.micOn);
                    setVideo(session.cameraOn);
                    setAudio(session.micOn);
                    setAskForUsername(false);
                    // Connection starts via the useEffect observing askForUsername below
                }
            } catch (e) {
                console.error("Failed to parse session", e);
            }
        }
    }, []);

    useEffect(() => {
        if (!askForUsername) {
            connectToSocketServer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [askForUsername]);

    // TODO
    // if(isChrome() === false) {


    // }

    // Stream is attached inside ParticipantCard via useEffect on stream prop.
    // No localVideoref needed in VideoMeet.jsx after MeetingRoom refactor.

    const getUserMediaSuccess = useCallback((stream) => {
        const newVideoTrack = stream.getVideoTracks()[0];
        const newAudioTrack = stream.getAudioTracks()[0];

        if (isSharingScreen) {
            window.webcamVideoTrack = newVideoTrack;
            
            if (newAudioTrack) {
                for (let id in connections) {
                    if (id === socketIdRef.current) continue;
                    const senders = connections[id].getSenders();
                    const audioSender = senders.find(s => s.track && s.track.kind === 'audio');
                    if (audioSender) {
                        audioSender.replaceTrack(newAudioTrack).catch(e => console.log(e));
                    }
                }
            }
            
            const screenTrack = window.screenTrack;
            const combinedStream = new MediaStream();
            if (screenTrack) combinedStream.addTrack(screenTrack);
            if (newAudioTrack) combinedStream.addTrack(newAudioTrack);
            
            const innerStream = new MediaStream();
            if (newVideoTrack) innerStream.addTrack(newVideoTrack);
            if (newAudioTrack) innerStream.addTrack(newAudioTrack);
            window.localStream = innerStream;
            
            setMyStream(combinedStream);
        } else {
            try {
                window.localStream.getTracks().forEach(track => track.stop())
            } catch (e) { console.log(e) }

            window.localStream = stream;
            setMyStream(stream);

            for (let id in connections) {
                if (id === socketIdRef.current) continue;

                const senders = connections[id].getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');

                if (videoSender && newVideoTrack) {
                    videoSender.replaceTrack(newVideoTrack).catch(e => console.log(e));
                }
                if (audioSender && newAudioTrack) {
                    audioSender.replaceTrack(newAudioTrack).catch(e => console.log(e));
                }
            }
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                window.localStream.getTracks().forEach(t => t.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            setMyStream(window.localStream)

            for (let id in connections) {
                if (id === socketIdRef.current) continue;
                const senders = connections[id].getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                const audioSender = senders.find(s => s.track && s.track.kind === 'audio');

                const newVTrack = window.localStream.getVideoTracks()[0];
                const newATrack = window.localStream.getAudioTracks()[0];

                if (videoSender && newVTrack) videoSender.replaceTrack(newVTrack).catch(e => console.log(e));
                if (audioSender && newATrack) audioSender.replaceTrack(newATrack).catch(e => console.log(e));
            }
        })
    }, [isSharingScreen, setVideo, setAudio]);

    const getUserMedia = useCallback(() => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                window.localStream.getTracks().forEach(t => t.stop())
            } catch (e) { }
        }
    }, [video, videoAvailable, audio, audioAvailable, getUserMediaSuccess]);

    const getUserMediaRef = useRef();
    getUserMediaRef.current = getUserMedia;

    const stopScreenShare = useCallback(() => {
        if (window.screenTrack) {
            window.screenTrack.stop();
            window.screenTrack = null;
        }

        const restoreTrack = window.webcamVideoTrack;
        if (restoreTrack) {
            for (let id in connections) {
                if (id === socketIdRef.current) continue;
                const senders = connections[id].getSenders();
                const videoSender = senders.find(s => s.track && s.track.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(restoreTrack).catch(err => console.error(err));
                }
            }

            const localAudioTrack = window.localStream ? window.localStream.getAudioTracks()[0] : null;
            const restoredStream = new MediaStream();
            restoredStream.addTrack(restoreTrack);
            if (localAudioTrack) restoredStream.addTrack(localAudioTrack);

            window.localStream = restoredStream;
            setMyStream(restoredStream);
        }

        setIsSharingScreen(false);
        setScreen(false);
        setPresenter(null);

        socketRef.current?.emit('screen-share-stopped', window.location.pathname.replace('/', ''), username);
    }, [username, setScreen]);

    const isSharingScreenRef = useRef(false);
    isSharingScreenRef.current = isSharingScreen;

    const stopScreenShareRef = useRef();
    stopScreenShareRef.current = stopScreenShare;

    const getDislayMediaSuccess = useCallback((stream) => {
        const screenTrack = stream.getVideoTracks()[0];
        window.screenTrack = screenTrack;

        if (window.localStream) {
            window.webcamVideoTrack = window.localStream.getVideoTracks()[0];
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            const senders = connections[id].getSenders();
            const videoSender = senders.find(s => s.track && s.track.kind === 'video');
            if (videoSender) {
                videoSender.replaceTrack(screenTrack).catch(err => console.error(err));
            }
        }

        const localAudioTrack = window.localStream ? window.localStream.getAudioTracks()[0] : null;
        const combinedStream = new MediaStream();
        combinedStream.addTrack(screenTrack);
        if (localAudioTrack) combinedStream.addTrack(localAudioTrack);

        setMyStream(combinedStream);
        setIsSharingScreen(true);
        setPresenter({ socketId: socketIdRef.current, username });

        socketRef.current?.emit('screen-share-started', window.location.pathname.replace('/', ''), username);

        screenTrack.onended = () => {
            stopScreenShare();
        };
    }, [username, stopScreenShare]);

    const getDislayMedia = useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .catch((e) => {
                        console.log(e);
                        setScreen(false);
                        alert("Screen sharing permission denied.");
                    })
            }
        } else if (isSharingScreen) {
            stopScreenShare();
        }
    }, [screen, getDislayMediaSuccess, isSharingScreen, stopScreenShare, setScreen]);

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio, getUserMedia])



    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            setIsReconnecting(false);
            // Emit username with the join payload so the backend stores it
            socketRef.current.emit('join-call', {
                path: window.location.href,
                username: username
            })
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('reaction', (id, emoji) => {
                setRemoteReactions(prev => {
                    const userReactions = prev[id] || [];
                    const newReactions = [...userReactions, { id: Date.now() + Math.random(), emoji }].slice(-5);
                    return {
                        ...prev,
                        [id]: newReactions
                    };
                });
            });

            // Listen for the full named participant list on every join/leave
            socketRef.current.on('participants-update', (participantList) => {
                // Convert array to a map keyed by socketId for O(1) lookup
                const map = {}
                participantList.forEach(p => { map[p.socketId] = p })
                setParticipants(map)
            })

            socketRef.current.on('screen-share-started', (data) => {
                if (isSharingScreenRef.current) {
                    stopScreenShareRef.current();
                }
                setPresenter(data);
            })

            socketRef.current.on('screen-share-stopped', (data) => {
                setPresenter(null);
            })

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                setParticipants(prev => {
                    const next = { ...prev }
                    delete next[id]
                    return next
                })
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;
                    if (connections[socketListId]) return;

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // For modern browsers to play audio correctly
                    connections[socketListId].ontrack = (event) => {
                        setVideos(prevVideos => {
                            let videoExists = prevVideos.find(video => video.socketId === socketListId);
                            if (videoExists) {
                                const updatedVideos = prevVideos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.streams[0] } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            } else {
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: event.streams[0],
                                    autoplay: true,
                                    playsinline: true
                                };
                                const updatedVideos = [...prevVideos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    }

                    // Wait for their video stream (legacy support)
                    connections[socketListId].onaddstream = (event) => {
                        setVideos(prevVideos => {
                            let videoExists = prevVideos.find(video => video.socketId === socketListId);
                            if (videoExists) {
                                const updatedVideos = prevVideos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            } else {
                                let newVideo = {
                                    socketId: socketListId,
                                    stream: event.stream,
                                    autoplay: true,
                                    playsinline: true
                                };
                                const updatedVideos = [...prevVideos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            }
                        });
                    };


                    // Add the local video stream
                    let streamToSend = window.localStream;
                    if (isSharingScreenRef.current && window.screenTrack) {
                        const tempStream = new MediaStream();
                        tempStream.addTrack(window.screenTrack);
                        const micTrack = window.localStream ? window.localStream.getAudioTracks()[0] : null;
                        if (micTrack) tempStream.addTrack(micTrack);
                        streamToSend = tempStream;
                    }

                    if (streamToSend !== undefined && streamToSend !== null) {
                        connections[socketListId].addStream(streamToSend)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        let streamToSend = window.localStream;
                        if (isSharingScreenRef.current && window.screenTrack) {
                            const tempStream = new MediaStream();
                            tempStream.addTrack(window.screenTrack);
                            const micTrack = window.localStream ? window.localStream.getAudioTracks()[0] : null;
                            if (micTrack) tempStream.addTrack(micTrack);
                            streamToSend = tempStream;
                        }

                        try {
                            connections[id2].addStream(streamToSend)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let handleVideo = () => {
        setVideo(!video);
        // getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop())
            }
        } catch (e) { }
        
        if (localStorage.getItem("token")) {
            window.location.href = "/home"
        } else {
            window.location.href = "/"
        }
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };



    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }

    let handlePreJoin = (name, cameraOn, micOn) => {
        setUsername(name);
        setVideoAvailable(cameraOn);
        setAudioAvailable(micOn);
        setVideo(cameraOn);
        setAudio(micOn);
        setAskForUsername(false);

        // Save session for reconnect
        sessionStorage.setItem('vakyam_session', JSON.stringify({
            room: window.location.pathname.replace('/', ''),
            username: name,
            cameraOn,
            micOn,
            timestamp: Date.now()
        }));
    }

    // Update session timestamp periodically to keep it alive
    useEffect(() => {
        if (!askForUsername) {
            const interval = setInterval(() => {
                const sessionData = sessionStorage.getItem('vakyam_session');
                if (sessionData) {
                    try {
                        const session = JSON.parse(sessionData);
                        session.timestamp = Date.now();
                        sessionStorage.setItem('vakyam_session', JSON.stringify(session));
                    } catch (e) { }
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [askForUsername]);

    let handleReaction = (emoji) => {
        socketRef.current.emit('reaction', window.location.pathname.replace('/', ''), emoji);
        setRemoteReactions(prev => {
            const current = prev['local'] || [];
            const newReactions = [...current, { id: Date.now() + Math.random(), emoji }].slice(-5);
            return {
                ...prev,
                local: newReactions
            };
        });
    }


    return (
        <div>
            {askForUsername === true ? (
                <PreJoinScreen
                    onJoin={handlePreJoin}
                    meetingCode={window.location.pathname.replace('/', '')}
                />
            ) : (
                <>
                    {isReconnecting && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: '#FACC15', color: '#111', padding: '12px', textAlign: 'center', fontWeight: 'bold', zIndex: 9999 }}>
                            Reconnecting to meeting...
                        </div>
                    )}
                    <MeetingRoom
                        videos={videos}
                        participants={participants}
                        localStream={myStream}
                        localSocketId={socketIdRef.current}
                        username={username}
                        video={video}
                        audio={audio}
                        screen={screen}
                        screenAvailable={screenAvailable}
                        messages={messages}
                        message={message}
                        newMessages={newMessages}
                        onClearNewMessages={() => setNewMessages(0)}
                        onToggleVideo={handleVideo}
                        onToggleAudio={handleAudio}
                        onToggleScreen={handleScreen}
                        onSendMessage={sendMessage}
                        onMessageChange={setMessage}
                        onEndCall={handleEndCall}
                        onReaction={handleReaction}
                        remoteReactions={remoteReactions}
                        meetingCode={window.location.pathname.replace('/', '')}
                    />
                </>
            )}
        </div>
    )
}
