import express from "express";
import { getStats, getAllUsers, deleteUser } from "../controllers/adminController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/role.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.route("/users").get(getAllUsers);
router.delete("/users/:id", deleteUser);

export default router;
