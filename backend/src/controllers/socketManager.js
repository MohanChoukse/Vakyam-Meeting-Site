import { Server } from "socket.io"

// socket.id -> { path, username, joinedAt }
let socketMeta = {}

// path -> [socket.id, ...]
let connections = {}

// path -> [{ sender, data, socket-id-sender }]
let messages = {}

let roomTimers = {}

/**
 * Build the participants-update payload for a room.
 * Returns an array of { socketId, username, joinedAt }.
 */
function buildParticipantList(path) {
    if (!connections[path]) return []
    return connections[path].map(id => ({
        socketId: id,
        username: (socketMeta[id] && socketMeta[id].username) || 'Participant',
        joinedAt: (socketMeta[id] && socketMeta[id].joinedAt) || Date.now(),
    }))
}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("SOMETHING CONNECTED:", socket.id)

        // join-call accepts { path, username } OR just path (backward compat)
        socket.on("join-call", (pathOrObj, legacyUsername) => {
            let path, username

            if (typeof pathOrObj === 'object' && pathOrObj !== null) {
                path = pathOrObj.path
                username = pathOrObj.username || 'Participant'
            } else {
                path = pathOrObj
                username = legacyUsername || 'Participant'
            }

            if (!path) return

            if (connections[path] === undefined) {
                connections[path] = []
            }

            // Cancel room deletion if it was scheduled
            if (roomTimers[path]) {
                clearTimeout(roomTimers[path])
                delete roomTimers[path]
            }

            // Only add if not already in the room (handles reconnects)
            if (!connections[path].includes(socket.id)) {
                connections[path].push(socket.id)
            }

            // Store participant metadata
            socketMeta[socket.id] = { path, username, joinedAt: Date.now() }

            console.log(`[join] ${username} (${socket.id}) joined ${path}`)

            // Broadcast updated socket ID list for WebRTC peer setup (existing logic)
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            // Broadcast full named participant list to everyone in the room
            const participantList = buildParticipantList(path)
            connections[path].forEach(id => {
                io.to(id).emit("participants-update", participantList)
            })

            // Replay past messages for the joining user
            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message",
                        messages[path][a]['data'],
                        messages[path][a]['sender'],
                        messages[path][a]['socket-id-sender']
                    )
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message)
        })

        socket.on("reaction", (roomId, emoji) => {
            connections[roomId]?.forEach((elem) => {
                if (elem !== socket.id) {
                    io.to(elem).emit("reaction", socket.id, emoji)
                }
            })
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true]
                    }
                    return [room, isFound]
                }, ['', false])

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }
                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("screen-share-started", (roomId, username) => {
            connections[roomId]?.forEach((elem) => {
                if (elem !== socket.id) {
                    io.to(elem).emit("screen-share-started", { socketId: socket.id, username })
                }
            })
        })

        socket.on("screen-share-stopped", (roomId, username) => {
            connections[roomId]?.forEach((elem) => {
                if (elem !== socket.id) {
                    io.to(elem).emit("screen-share-stopped", { socketId: socket.id, username })
                }
            })
        })

        socket.on("disconnect", () => {
            const meta = socketMeta[socket.id]
            delete socketMeta[socket.id]

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        const key = k

                        // Notify all peers that this user left
                        for (let b = 0; b < connections[key].length; ++b) {
                            io.to(connections[key][b]).emit('user-left', socket.id)
                        }

                        const index = connections[key].indexOf(socket.id)
                        connections[key].splice(index, 1)

                        // Broadcast updated participant list after removal
                        const participantList = buildParticipantList(key)
                        connections[key].forEach(id => {
                            io.to(id).emit("participants-update", participantList)
                        })

                        if (connections[key].length === 0) {
                            // 20-second grace period before deleting room
                            roomTimers[key] = setTimeout(() => {
                                delete connections[key]
                                delete messages[key]
                                delete roomTimers[key]
                            }, 20000)
                        }
                    }
                }
            }

            if (meta) {
                console.log(`[disconnect] ${meta.username} (${socket.id}) left ${meta.path}`)
            }
        })
    })

    return io
}
