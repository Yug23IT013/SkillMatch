import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    minCGPA: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
      default: "Remote",
    },
    stipend: {
      type: Number,
      default: 0,
    },
    duration: {
      type: String,
      default: "",
    },
    deadline: {
      type: Date,
      required: [true, "Application deadline is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

internshipSchema.index({ requiredSkills: 1 });
internshipSchema.index({ minCGPA: 1 });
internshipSchema.index({ deadline: 1 });

const Internship = mongoose.model("Internship", internshipSchema);
export default Internship;
