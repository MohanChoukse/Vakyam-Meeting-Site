import { meetingService } from "../services/meeting.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const createMeeting = async (req, res) => {
    try {
        const { title } = req.body;
        // User could be passed via middleware. Depending on how auth is handled in users.routes.js,
        // let's assume we extract it from a custom header, token, or session.
        // Assuming we pass user data in req.body or a middleware populates req.user.
        // Wait, looking at the previous implementation, auth wasn't explicitly checking JWT in routes,
        // user details were often sent in req.body for meeting creation via add_to_activity.
        // For standard REST APIs, let's assume req.body contains user info if middleware isn't present yet,
        // or we expect the client to send user details.
        
        const user = req.user || req.body.user;
        if (!user) {
            return ApiResponse.error(res, "User not authenticated", {}, 401);
        }

        const meeting = await meetingService.createMeeting(user, title);
        return ApiResponse.success(res, "Meeting created successfully", meeting, 201);
    } catch (error) {
        return ApiResponse.error(res, "Failed to create meeting", { error: error.message }, 500);
    }
};

export const getRecentMeetings = async (req, res) => {
    try {
        const userId = (req.user && req.user._id) || (req.query.userId || req.body.userId);
        if (!userId) {
            return ApiResponse.error(res, "User ID required", {}, 400);
        }

        const { search, status } = req.query;
        const meetings = await meetingService.getRecentMeetings(userId, search, status);
        
        return ApiResponse.success(res, "Recent meetings fetched", meetings, 200);
    } catch (error) {
        return ApiResponse.error(res, "Failed to fetch meetings", { error: error.message }, 500);
    }
};

export const validateMeeting = async (req, res) => {
    try {
        const { meetingCode } = req.params;
        const meeting = await meetingService.getMeetingByCode(meetingCode);

        if (!meeting) {
            return ApiResponse.error(res, "Meeting not found", {}, 404);
        }

        if (meeting.status === "Expired") {
            return ApiResponse.error(res, "Meeting has expired", { status: meeting.status }, 410);
        }

        if (meeting.status === "Ended") {
            return ApiResponse.error(res, "Meeting has ended", { status: meeting.status }, 403);
        }

        return ApiResponse.success(res, "Meeting is valid", meeting, 200);
    } catch (error) {
        return ApiResponse.error(res, "Failed to validate meeting", { error: error.message }, 500);
    }
};

export const endMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req.user && req.user._id) || req.body.userId;
        
        if (!userId) {
            return ApiResponse.error(res, "User ID required", {}, 400);
        }

        const meeting = await meetingService.endMeeting(id, userId);
        return ApiResponse.success(res, "Meeting ended successfully", meeting, 200);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to end meeting", { error: error.message }, error.message === "Unauthorized" ? 403 : 500);
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = (req.user && req.user._id) || req.body.userId;
        
        if (!userId) {
            return ApiResponse.error(res, "User ID required", {}, 400);
        }

        await meetingService.deleteMeeting(id, userId);
        return ApiResponse.success(res, "Meeting deleted successfully", {}, 200);
    } catch (error) {
        return ApiResponse.error(res, error.message || "Failed to delete meeting", { error: error.message }, error.message === "Unauthorized" ? 403 : 500);
    }
};
