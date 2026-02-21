import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    cgpa: {
      type: Number,
      min: [0, "CGPA cannot be negative"],
      max: [10, "CGPA cannot exceed 10"],
      default: 0,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    resumeURL: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);
export default StudentProfile;
