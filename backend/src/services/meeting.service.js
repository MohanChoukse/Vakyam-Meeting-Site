import { Meeting } from "../models/meeting.model.js";
import crypto from "crypto";

class MeetingService {
    /**
     * Generate a unique 8-character meeting code
     */
    generateMeetingCode() {
        return crypto.randomBytes(4).toString("hex");
    }

    /**
     * Apply lifecycle rules to a meeting.
     * Scheduled -> Active -> Ended -> Expired
     */
    async evaluateMeetingLifecycle(meeting) {
        if (!meeting) return null;

        const now = new Date();
        let updated = false;

        // Auto-end if no participants and inactive for > 30 mins
        if (meeting.status === "Active" && meeting.participantCount === 0) {
            const lastActivityTime = meeting.lastActivity ? new Date(meeting.lastActivity).getTime() : new Date(meeting.createdAt).getTime();
            const inactiveDuration = now.getTime() - lastActivityTime;
            
            if (inactiveDuration > 30 * 60 * 1000) {
                meeting.status = "Ended";
                meeting.endedAt = now;
                updated = true;
            }
        }

        // Auto-expire if ended for > 24 hours or expiresAt is past
        if (meeting.status === "Ended") {
            const endedTime = meeting.endedAt ? new Date(meeting.endedAt).getTime() : now.getTime();
            if (now.getTime() - endedTime > 24 * 60 * 60 * 1000) {
                meeting.status = "Expired";
                updated = true;
            }
        }
        
        if (meeting.expiresAt && now.getTime() > new Date(meeting.expiresAt).getTime() && meeting.status !== "Expired") {
            meeting.status = "Expired";
            updated = true;
        }

        if (updated) {
            await meeting.save();
        }

        return meeting;
    }

    /**
     * Create a new meeting
     */
    async createMeeting(user, title) {
        const meetingCode = this.generateMeetingCode();
        const meetingURL = `/meeting/${meetingCode}`; // Frontend route format
        
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours default expiry

        const formattedTitle = title || `Meeting - ${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

        const newMeeting = new Meeting({
            user_id: user.token, // Keeping for backward compatibility (some logic uses token as user_id)
            title: formattedTitle,
            meetingCode,
            meetingURL,
            hostId: user._id || user.userId || user.username, 
            hostName: user.name,
            createdBy: user._id || user.userId || user.username,
            createdAt: now,
            startedAt: now,
            expiresAt,
            lastActivity: now,
            status: "Active"
        });

        await newMeeting.save();
        return newMeeting;
    }

    /**
     * Get recent meetings for a user
     */
    async getRecentMeetings(userId, search = "", status = "") {
        // userId can be ObjectId, username, or token
        let userQuery = { $or: [{ username: userId }, { token: userId }] };
        if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
            userQuery.$or.push({ _id: userId });
        }
        
        // Import User dynamically or at top. We can just use mongoose.model('User') to avoid circular deps if any.
        const mongoose = await import('mongoose');
        const User = mongoose.model('User');
        const user = await User.findOne(userQuery);
        const username = user ? user.username : userId; // fallback to userId if user not found

        const query = { 
            $or: [
                { hostId: userId }, 
                { createdBy: userId }, 
                { "participants.userId": userId }, 
                { user_id: userId },
                { hostId: username }, 
                { createdBy: username }, 
                { "participants.userId": username }, 
                { user_id: username }
            ] 
        };
        
        if (search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { meetingCode: { $regex: search, $options: "i" } }
                ]
            });
        }

        if (status) {
            query.status = status;
        }

        const meetings = await Meeting.find(query).sort({ createdAt: -1 }).limit(50);
        
        // Lazily evaluate lifecycle for all fetched meetings
        const evaluatedMeetings = await Promise.all(meetings.map(m => this.evaluateMeetingLifecycle(m)));
        return evaluatedMeetings;
    }

    /**
     * Validate and fetch meeting by code
     */
    async getMeetingByCode(meetingCode) {
        const meeting = await Meeting.findOne({ meetingCode });
        return await this.evaluateMeetingLifecycle(meeting);
    }

    /**
     * End a meeting manually
     */
    async endMeeting(meetingId, userId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");
        if (meeting.hostId !== userId && meeting.createdBy !== userId) throw new Error("Unauthorized");
        
        meeting.status = "Ended";
        meeting.endedAt = new Date();
        await meeting.save();
        return meeting;
    }

    /**
     * Delete a meeting
     */
    async deleteMeeting(meetingId, userId) {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) throw new Error("Meeting not found");
        if (meeting.hostId !== userId && meeting.createdBy !== userId) throw new Error("Unauthorized");
        
        await Meeting.findByIdAndDelete(meetingId);
        return true;
    }
}

export const meetingService = new MeetingService();
