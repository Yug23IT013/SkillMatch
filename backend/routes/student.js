import express from "express";
import {
  getProfile,
  updateProfile,
  getRecommendedInternships,
  applyForInternship,
  getMyApplications,
} from "../controllers/studentController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

router.use(protect, authorize("student"));

router.route("/profile").get(getProfile).put(updateProfile);
router.get("/recommendations", getRecommendedInternships);
router.post("/apply/:internshipId", applyForInternship);
router.get("/applications", getMyApplications);

export default router;
