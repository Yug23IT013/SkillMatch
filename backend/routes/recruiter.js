import express from "express";
import {
  createInternship,
  getMyInternships,
  updateInternship,
  deleteInternship,
  getApplicants,
  updateApplicationStatus,
} from "../controllers/recruiterController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

router.use(protect, authorize("recruiter"));

router.route("/").post(createInternship).get(getMyInternships);
router.route("/:id").put(updateInternship).delete(deleteInternship);
router.get("/applicants/:id", getApplicants);
router.put("/applicants/:applicationId/status", updateApplicationStatus);

export default router;
