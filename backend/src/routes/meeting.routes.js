import { Router } from "express";
import { createMeeting, getRecentMeetings, validateMeeting, endMeeting, deleteMeeting } from "../controllers/meeting.controller.js";

const router = Router();

// Notice: In a real app we'd add an auth middleware here like router.use(verifyJWT)
// Since we are extracting userId from req.body/query in the controllers for backward compatibility,
// we'll keep these routes open but they expect userId in the payload.

router.route("/recent").get(getRecentMeetings);
router.route("/").post(createMeeting);
router.route("/:meetingCode").get(validateMeeting);
router.route("/:id/end").patch(endMeeting);
router.route("/:id").delete(deleteMeeting);

export default router;
