import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    coverLetter: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, internship: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
