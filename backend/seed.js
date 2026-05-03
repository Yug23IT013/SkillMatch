const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillmatch';

const UserSchema = new mongoose.Schema({ name: String, email: String, password: String, role: String, isActive: { type: Boolean, default: true } }, { timestamps: true });
const StudentSchema = new mongoose.Schema({ userId: mongoose.Schema.Types.ObjectId, phone: String, college: String, degree: String, branch: String, graduationYear: Number, cgpa: Number, technicalSkills: [String], softSkills: [String], certifications: [{ name: String, issuer: String, year: Number }], projects: [{ title: String, description: String, techStack: [String], link: String }], preferredDomains: [String], careerInterests: [String], locationPreference: [String], resume: String, bio: String, skillVector: [Number] }, { timestamps: true });
const JobSchema = new mongoose.Schema({ recruiterId: mongoose.Schema.Types.ObjectId, company: String, title: String, description: String, type: String, location: String, isRemote: Boolean, skillsRequired: [String], minCgpa: Number, experienceLevel: String, domain: String, stipend: String, salary: String, duration: String, openings: Number, deadline: Date, isActive: Boolean, applicationCount: Number }, { timestamps: true });
const ApplicationSchema = new mongoose.Schema({ studentId: mongoose.Schema.Types.ObjectId, jobId: mongoose.Schema.Types.ObjectId, status: String, coverLetter: String, matchScore: Number, appliedAt: { type: Date, default: Date.now } }, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Student = mongoose.model('Student', StudentSchema);
const Job = mongoose.model('Job', JobSchema);
const Application = mongoose.model('Application', ApplicationSchema);

// Use SEED_PASSWORD env var for demo accounts; never hardcode a real password here
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'demo1234';
const hashPassword = async (pw) => bcrypt.hash(pw, 10);

const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Student.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});
  console.log('Cleared existing data');

  // Create admin
  const admin = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'admin' });

  // Create recruiters
  const recruiter1 = await User.create({ name: 'Google HR', email: 'recruiter@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'recruiter' });
  const recruiter2 = await User.create({ name: 'Microsoft Recruiting', email: 'microsoft@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'recruiter' });
  const recruiter3 = await User.create({ name: 'Amazon Talent', email: 'amazon@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'recruiter' });

  // Create students
  const student1 = await User.create({ name: 'Arjun Sharma', email: 'student@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'student' });
  const student2 = await User.create({ name: 'Priya Patel', email: 'priya@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'student' });
  const student3 = await User.create({ name: 'Rahul Kumar', email: 'rahul@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'student' });
  const student4 = await User.create({ name: 'Neha Singh', email: 'neha@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'student' });
  const student5 = await User.create({ name: 'Karan Mehta', email: 'karan@demo.com', password: await hashPassword(SEED_PASSWORD), role: 'student' });

  // Student profiles
  await Student.create({ userId: student1._id, phone: '+91 9876543210', college: 'IIT Bombay', degree: 'B.Tech', branch: 'Computer Science', graduationYear: 2025, cgpa: 8.7, technicalSkills: ['Python', 'Machine Learning', 'React', 'Node.js', 'TensorFlow', 'MongoDB', 'Data Structures', 'Algorithms'], softSkills: ['Communication', 'Teamwork', 'Problem Solving'], preferredDomains: ['Machine Learning', 'Web Development'], locationPreference: ['Bangalore', 'Remote'], bio: 'Passionate about AI and web technologies', resume: '/uploads/resumes/arjun-sharma-resume.pdf', certifications: [{ name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon', year: 2024 }], projects: [{ title: 'AI Chat Bot', description: 'Built a chatbot using NLP techniques', techStack: ['Python', 'TensorFlow', 'Flask'], link: 'github.com/arjun/chatbot' }] });
  await Student.create({ userId: student2._id, phone: '+91 9876543211', college: 'NIT Pune', degree: 'B.Tech', branch: 'Information Technology', graduationYear: 2025, cgpa: 8.2, technicalSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'TypeScript', 'HTML', 'CSS'], softSkills: ['Leadership', 'Teamwork', 'Communication'], preferredDomains: ['Web Development', 'Full Stack'], locationPreference: ['Mumbai', 'Pune', 'Remote'], bio: 'Full-stack developer with a love for clean code', resume: '/uploads/resumes/priya-patel-resume.pdf', projects: [{ title: 'E-Commerce Platform', description: 'Full-stack e-commerce app with React and Node.js', techStack: ['React', 'Node.js', 'MongoDB'], link: 'github.com/priya/ecomm' }] });
  await Student.create({ userId: student3._id, college: 'BITS Pilani', degree: 'B.Tech', branch: 'Electronics', graduationYear: 2025, cgpa: 7.5, technicalSkills: ['Python', 'Data Science', 'Pandas', 'NumPy', 'scikit-learn', 'SQL'], softSkills: ['Analytical Thinking', 'Problem Solving'], preferredDomains: ['Data Science', 'Machine Learning'], locationPreference: ['Hyderabad', 'Bangalore'], bio: 'Data enthusiast exploring ML and analytics', resume: '/uploads/resumes/rahul-kumar-resume.pdf' });
  await Student.create({ userId: student4._id, college: 'DTU Delhi', degree: 'B.Tech', branch: 'CSE', graduationYear: 2025, cgpa: 9.1, technicalSkills: ['Java', 'Spring Boot', 'Docker', 'Kubernetes', 'AWS', 'Git', 'Microservices', 'SQL'], softSkills: ['Time Management', 'Leadership'], preferredDomains: ['DevOps', 'Backend Development', 'Cloud Computing'], locationPreference: ['Delhi', 'Remote'], bio: 'Backend developer interested in cloud and DevOps', resume: '/uploads/resumes/neha-singh-resume.pdf' });
  await Student.create({ userId: student5._id, college: 'VIT Vellore', degree: 'B.Tech', branch: 'CSE', graduationYear: 2025, cgpa: 7.8, technicalSkills: ['Python', 'Flask', 'React', 'HTML', 'CSS', 'Git'], softSkills: ['Creativity', 'Communication'], preferredDomains: ['Web Development'], locationPreference: ['Chennai', 'Bangalore', 'Remote'], bio: 'Building cool web apps one project at a time', resume: '/uploads/resumes/karan-mehta-resume.pdf' });

  // Create jobs
  const jobs = [
    { recruiterId: recruiter1._id, company: 'Google', title: 'Software Engineering Intern', description: 'Join our team to work on large-scale distributed systems. You will design and develop highly scalable software solutions and collaborate with world-class engineers.', type: 'internship', location: 'Bangalore', isRemote: false, skillsRequired: ['Python', 'Data Structures', 'Algorithms', 'System Design', 'Machine Learning'], minCgpa: 7.5, domain: 'Machine Learning', stipend: '₹80,000/month', duration: '3 months', openings: 5, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter1._id, company: 'Google', title: 'Full Stack Developer', description: 'Develop scalable web applications for millions of users. Work with React and Node.js to build innovative features.', type: 'full-time', location: 'Hyderabad', isRemote: true, skillsRequired: ['React', 'Node.js', 'JavaScript', 'TypeScript', 'REST API'], minCgpa: 7.0, domain: 'Web Development', salary: '₹20-35 LPA', openings: 3, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter2._id, company: 'Microsoft', title: 'Cloud Engineer Intern', description: 'Work on Azure cloud services and help build the future of cloud computing. Gain hands-on experience with enterprise-grade cloud infrastructure.', type: 'internship', location: 'Remote', isRemote: true, skillsRequired: ['AWS', 'Docker', 'Kubernetes', 'Python', 'Git', 'Linux'], minCgpa: 7.0, domain: 'Cloud Computing', stipend: '₹60,000/month', duration: '6 months', openings: 8, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter2._id, company: 'Microsoft', title: 'Data Scientist', description: 'Apply machine learning and statistical models to solve real-world problems. Work with petabytes of data to drive business insights.', type: 'full-time', location: 'Bangalore', isRemote: false, skillsRequired: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy', 'SQL', 'Data Science'], minCgpa: 7.5, domain: 'Data Science', salary: '₹18-28 LPA', openings: 4, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter3._id, company: 'Amazon', title: 'Backend Developer Intern', description: 'Build and maintain backend services for Amazon\'s e-commerce platform. Work with Java, Spring Boot and microservices architecture.', type: 'internship', location: 'Hyderabad', isRemote: false, skillsRequired: ['Java', 'Spring Boot', 'Microservices', 'SQL', 'Git', 'REST API'], minCgpa: 7.0, domain: 'Backend Development', stipend: '₹70,000/month', duration: '4 months', openings: 6, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter3._id, company: 'Amazon', title: 'DevOps Engineer', description: 'Manage and optimize CI/CD pipelines. Work with Docker, Kubernetes and AWS to maintain and scale production infrastructure.', type: 'full-time', location: 'Bangalore', isRemote: true, skillsRequired: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Python'], minCgpa: 6.5, domain: 'DevOps', salary: '₹15-25 LPA', openings: 2, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter1._id, company: 'Flipkart', title: 'ML Engineer Intern', description: 'Build recommendation systems and improve ML pipelines at scale. Work directly with the personalization team.', type: 'internship', location: 'Bangalore', isRemote: false, skillsRequired: ['Python', 'Machine Learning', 'scikit-learn', 'Pandas', 'NumPy', 'Deep Learning'], minCgpa: 7.5, domain: 'Machine Learning', stipend: '₹50,000/month', duration: '2 months', openings: 4, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter2._id, company: 'Razorpay', title: 'React Developer', description: 'Build beautiful, intuitive user interfaces for fintech products used by millions. Work on complex UI challenges and state management.', type: 'full-time', location: 'Bangalore', isRemote: true, skillsRequired: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Node.js'], minCgpa: 6.5, domain: 'Web Development', salary: '₹12-20 LPA', openings: 3, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter3._id, company: 'Zomato', title: 'Data Analyst Intern', description: 'Analyze food delivery data to generate business insights and drive product decisions. Work with SQL. Python and Tableau.', type: 'internship', location: 'Delhi', isRemote: false, skillsRequired: ['Python', 'SQL', 'Pandas', 'Data Science', 'NumPy'], minCgpa: 6.5, domain: 'Data Science', stipend: '₹40,000/month', duration: '3 months', openings: 5, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter1._id, company: 'Infosys', title: 'Software Developer', description: 'Develop enterprise software solutions for global clients. Full-stack development with Java/Spring and modern frontend frameworks.', type: 'full-time', location: 'Multiple Cities', isRemote: false, skillsRequired: ['Java', 'JavaScript', 'SQL', 'HTML', 'CSS', 'Git'], minCgpa: 6.0, domain: 'Full Stack', salary: '₹4-8 LPA', openings: 50, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter2._id, company: 'Swiggy', title: 'iOS/Android Developer Intern', description: 'Build and optimize the Swiggy mobile app experience. Work with React Native to improve user experience for food delivery.', type: 'internship', location: 'Bangalore', isRemote: false, skillsRequired: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Git'], minCgpa: 7.0, domain: 'Mobile Development', stipend: '₹45,000/month', duration: '3 months', openings: 4, isActive: true, applicationCount: 0 },
    { recruiterId: recruiter3._id, company: 'Paytm', title: 'Cybersecurity Analyst', description: 'Protect financial systems from cyber threats. Perform security audits, penetration testing and incident response.', type: 'full-time', location: 'Delhi', isRemote: false, skillsRequired: ['Python', 'Linux', 'SQL', 'Git'], minCgpa: 6.5, domain: 'Cybersecurity', salary: '₹10-18 LPA', openings: 2, isActive: true, applicationCount: 0 }
  ];

  const savedJobs = await Job.insertMany(jobs);
  console.log(`Created ${jobs.length} job listings`);

  // Create some demo applications
  const applications = [
    { studentId: student1._id, jobId: savedJobs[0]._id, status: 'Applied', coverLetter: 'I am very interested in this position and believe my skills align well with the requirements.', matchScore: 85 },
    { studentId: student2._id, jobId: savedJobs[0]._id, status: 'Under Review', coverLetter: 'I am excited about this opportunity to work with your team.', matchScore: 78 },
    { studentId: student3._id, jobId: savedJobs[1]._id, status: 'Shortlisted', coverLetter: 'My data science background makes me a great fit for this role.', matchScore: 92 },
    { studentId: student1._id, jobId: savedJobs[2]._id, status: 'Applied', coverLetter: 'Looking forward to contributing to your cloud initiatives.', matchScore: 80 },
    { studentId: student4._id, jobId: savedJobs[3]._id, status: 'Under Review', coverLetter: 'My DevOps expertise would be valuable for this position.', matchScore: 88 }
  ];
  await Application.insertMany(applications);
  console.log(`Created ${applications.length} demo applications`);

  console.log('\n✅ Database seeded successfully!');
  // Only print credentials in development — never log passwords in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('\nDemo Credentials (development only):');
    console.log('  Student:   student@demo.com / [see SEED_PASSWORD in .env]');
    console.log('  Recruiter: recruiter@demo.com / [see SEED_PASSWORD in .env]');
    console.log('  Admin:     admin@demo.com / [see SEED_PASSWORD in .env]');
  }

  await mongoose.disconnect();
};

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });
