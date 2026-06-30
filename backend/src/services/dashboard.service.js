import { Meeting } from "../models/meeting.model.js";
import { User } from "../models/user.model.js";
import { meetingService } from "./meeting.service.js";

class DashboardService {
    async getDashboardData(userId) {
        // userId can be an ObjectId, username, or token depending on the client flow
        let query = { $or: [{ username: userId }, { token: userId }] };
        
        // If it's a valid MongoDB ObjectId, add it to the $or array
        if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
            query.$or.push({ _id: userId });
        }

        const user = await User.findOne(query).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        // Get all meetings relevant to the user (check both ID and username for backward compatibility)
        const username = user.username;
        const meetingQuery = { 
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
        const meetings = await Meeting.find(meetingQuery).sort({ createdAt: -1 });

        // Calculate Stats
        let meetingsHosted = 0;
        let meetingsJoined = 0;
        let totalDurationSeconds = 0;
        let longestMeetingSeconds = 0;
        
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        let meetingsThisWeek = 0;
        let todaysMeetings = 0;
        let activeMeetings = 0;

        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        for (const meeting of meetings) {
            const isHost = meeting.hostId === userId || meeting.createdBy === userId || meeting.user_id === userId;
            if (isHost) {
                meetingsHosted++;
            } else {
                meetingsJoined++;
            }

            totalDurationSeconds += (meeting.duration || 0);
            
            if ((meeting.duration || 0) > longestMeetingSeconds) {
                longestMeetingSeconds = meeting.duration;
            }

            const meetingDate = new Date(meeting.createdAt);
            if (meetingDate >= startOfWeek) {
                meetingsThisWeek++;
            }
            if (meetingDate >= startOfDay) {
                todaysMeetings++;
            }
            
            if (meeting.status === 'Active') {
                activeMeetings++;
            }
        }

        const totalHours = (totalDurationSeconds / 3600).toFixed(1);
        const avgDurationMins = meetings.length > 0 ? ((totalDurationSeconds / 60) / meetings.length).toFixed(1) : 0;
        
        // Get top 5 recent evaluated meetings
        const recentEvaluated = await Promise.all(meetings.slice(0, 5).map(m => meetingService.evaluateMeetingLifecycle(m)));

        return {
            user,
            stats: {
                meetingsHosted,
                meetingsJoined,
                totalHours,
                longestMeetingMins: (longestMeetingSeconds / 60).toFixed(1),
                avgDurationMins,
                meetingsThisWeek,
                todaysMeetings,
                activeMeetings,
                lastActive: meetings.length > 0 ? meetings[0].lastActivity || meetings[0].createdAt : null
            },
            recentMeetings: recentEvaluated,
            upcomingMeetings: [], // Future implementation
            notifications: [] // Future implementation
        };
    }
}

export const dashboardService = new DashboardService();
