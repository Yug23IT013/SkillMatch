import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import StudentProfile from "./models/StudentProfile.js";
import Internship from "./models/Internship.js";
import Application from "./models/Application.js";

const seed = async () => {
  await connectDB();

  console.log("🗑  Clearing existing data...");
  await Promise.all([
    User.deleteMany(),
    StudentProfile.deleteMany(),
    Internship.deleteMany(),
    Application.deleteMany(),
  ]);

  console.log("👤 Creating users...");

  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@siprs.dev",
    password: "admin123",
    role: "admin",
  });

  const recruiter1 = await User.create({
    name: "Alice Recruiter",
    email: "recruiter@techcorp.com",
    password: "recruiter123",
    role: "recruiter",
  });

  const recruiter2 = await User.create({
    name: "Bob HR",
    email: "bob@innovate.io",
    password: "recruiter123",
    role: "recruiter",
  });

  const student1 = await User.create({
    name: "Charlie Student",
    email: "charlie@college.edu",
    password: "student123",
    role: "student",
  });

  const student2 = await User.create({
    name: "Diana Dev",
    email: "diana@college.edu",
    password: "student123",
    role: "student",
  });

  const student3 = await User.create({
    name: "Evan Engineer",
    email: "evan@college.edu",
    password: "student123",
    role: "student",
  });

  console.log("📋 Creating student profiles...");
  await StudentProfile.create([
    {
      user: student1._id,
      branch: "Computer Science",
      cgpa: 8.5,
      skills: ["JavaScript", "React", "Node.js", "MongoDB"],
      interests: ["Web Development", "Full Stack", "Cloud"],
      resumeURL: "https://example.com/resume/charlie.pdf",
    },
    {
      user: student2._id,
      branch: "Information Technology",
      cgpa: 7.8,
      skills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      interests: ["AI", "Data Science", "Machine Learning"],
      resumeURL: "https://example.com/resume/diana.pdf",
    },
    {
      user: student3._id,
      branch: "Electronics",
      cgpa: 6.5,
      skills: ["C++", "Embedded Systems", "Arduino"],
      interests: ["IoT", "Robotics"],
      resumeURL: "",
    },
  ]);

  console.log("💼 Creating internships...");
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 2);

  const internships = await Internship.create([
    {
      title: "Frontend Developer Intern",
      company: "TechCorp",
      description: "Work on our React-based SaaS product.",
      requiredSkills: ["React", "JavaScript", "Tailwind CSS"],
      minCGPA: 7.0,
      location: "Bangalore",
      stipend: 15000,
      duration: "3 months",
      deadline,
      postedBy: recruiter1._id,
    },
    {
      title: "Full Stack Intern",
      company: "TechCorp",
      description: "End-to-end feature development using MERN stack.",
      requiredSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
      minCGPA: 7.5,
      location: "Remote",
      stipend: 20000,
      duration: "6 months",
      deadline,
      postedBy: recruiter1._id,
    },
    {
      title: "ML Engineering Intern",
      company: "Innovate.io",
      description: "Build ML pipelines using Python and TensorFlow.",
      requiredSkills: ["Python", "TensorFlow", "Machine Learning", "SQL"],
      minCGPA: 7.0,
      location: "Hyderabad",
      stipend: 18000,
      duration: "4 months",
      deadline,
      postedBy: recruiter2._id,
    },
    {
      title: "Data Analyst Intern",
      company: "Innovate.io",
      description: "Analyse business data and create dashboards.",
      requiredSkills: ["SQL", "Python", "Data Visualization"],
      minCGPA: 6.0,
      location: "Remote",
      stipend: 12000,
      duration: "3 months",
      deadline,
      postedBy: recruiter2._id,
    },
    {
      title: "Backend Developer Intern",
      company: "TechCorp",
      description: "Develop RESTful APIs with Node.js.",
      requiredSkills: ["Node.js", "Express.js", "MongoDB"],
      minCGPA: 6.5,
      location: "Pune",
      stipend: 16000,
      duration: "3 months",
      deadline,
      postedBy: recruiter1._id,
    },
  ]);

  console.log("📝 Creating sample applications...");
  await Application.create([
    {
      student: student1._id,
      internship: internships[0]._id,
      status: "shortlisted",
    },
    {
      student: student2._id,
      internship: internships[2]._id,
      status: "applied",
    },
  ]);

  console.log("\n✅ Seed completed successfully!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Login Credentials:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Admin     → admin@siprs.dev       / admin123");
  console.log("Recruiter → recruiter@techcorp.com / recruiter123");
  console.log("Student 1 → charlie@college.edu   / student123");
  console.log("Student 2 → diana@college.edu     / student123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
