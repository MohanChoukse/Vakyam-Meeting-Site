import { dashboardService } from "../services/dashboard.service.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const getDashboardData = async (req, res) => {
    try {
        const userId = (req.user && req.user._id) || (req.query.userId || req.body.userId);
        
        if (!userId) {
            return ApiResponse.error(res, "User ID required", {}, 400);
        }

        const data = await dashboardService.getDashboardData(userId);
        return ApiResponse.success(res, "Dashboard data fetched successfully", data, 200);
    } catch (error) {
        return ApiResponse.error(res, "Failed to fetch dashboard data", { error: error.message }, 500);
    }
};
