import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema({
    userId: { type: String },
    username: { type: String },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    duration: { type: Number }, // in seconds
    camera: { type: Boolean, default: false },
    mic: { type: Boolean, default: false },
    role: { type: String, enum: ["Host", "Guest", "Participant"], default: "Participant" }
}, { _id: false });

const meetingSchema = new Schema(
    {
        // Legacy Fields (kept for backward compatibility)
        user_id: { type: String },
        meetingCode: { type: String, required: true },
        date: { type: Date, default: Date.now, required: true },

        // New Expanded Schema
        title: { type: String },
        meetingURL: { type: String },
        hostId: { type: String },
        hostName: { type: String },
        participants: [participantSchema],
        participantCount: { type: Number, default: 0 },
        
        createdAt: { type: Date, default: Date.now },
        startedAt: { type: Date },
        endedAt: { type: Date },
        expiresAt: { type: Date },
        lastActivity: { type: Date },
        duration: { type: Number, default: 0 }, // in seconds
        
        status: { 
            type: String, 
            enum: ["Scheduled", "Active", "Ended", "Expired", "Archived"], 
            default: "Active" 
        },
        createdBy: { type: String },
        
        settings: {
            allowGuest: { type: Boolean, default: true },
            allowScreenShare: { type: Boolean, default: true },
            allowChat: { type: Boolean, default: true },
            allowReaction: { type: Boolean, default: true },
            waitingRoom: { type: Boolean, default: false },
            recordingEnabled: { type: Boolean, default: false }
        }
    }
)

const Meeting = mongoose.model("Meeting", meetingSchema);

export { Meeting };