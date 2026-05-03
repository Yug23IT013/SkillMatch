const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Email templates
const getApplicationStatusEmailTemplate = (studentName, jobTitle, company, status, recruiterNotes = '') => {
  const statusMessages = {
    'Applied': {
      subject: `Application Received - ${jobTitle} at ${company}`,
      color: '#3B82F6',
      message: 'Your application has been successfully submitted and is under review.'
    },
    'Under Review': {
      subject: `Application Under Review - ${jobTitle} at ${company}`,
      color: '#F59E0B',
      message: 'Good news! Your application is now being reviewed by the hiring team.'
    },
    'Shortlisted': {
      subject: `🎉 You\'re Shortlisted! - ${jobTitle} at ${company}`,
      color: '#10B981',
      message: 'Congratulations! You have been shortlisted for the next round.'
    },
    'Rejected': {
      subject: `Application Update - ${jobTitle} at ${company}`,
      color: '#EF4444',
      message: 'Thank you for your interest. Unfortunately, we are moving forward with other candidates at this time.'
    },
    'Accepted': {
      subject: `🎊 Congratulations! Offer for ${jobTitle} at ${company}`,
      color: '#8B5CF6',
      message: 'Congratulations! We are pleased to offer you the position.'
    }
  };

  const statusInfo = statusMessages[status] || statusMessages['Applied'];

  return {
    subject: statusInfo.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, ${statusInfo.color} 0%, ${statusInfo.color}dd 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
          }
          .status-badge {
            display: inline-block;
            background: ${statusInfo.color};
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .job-details {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .job-details h3 {
            margin-top: 0;
            color: ${statusInfo.color};
          }
          .recruiter-notes {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            margin-top: 30px;
          }
          .button {
            display: inline-block;
            background: ${statusInfo.color};
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📧 Application Status Update</h1>
        </div>

        <div class="content">
          <p>Dear ${studentName},</p>

          <p>${statusInfo.message}</p>

          <div class="job-details">
            <h3>Position Details</h3>
            <p><strong>Job Title:</strong> ${jobTitle}</p>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>New Status:</strong> <span class="status-badge">${status}</span></p>
          </div>

          ${recruiterNotes ? `
            <div class="recruiter-notes">
              <strong>📝 Note from Recruiter:</strong>
              <p>${recruiterNotes}</p>
            </div>
          ` : ''}

          ${status === 'Shortlisted' || status === 'Accepted' ? `
            <p>Please check your SkillMatch dashboard for next steps and additional information.</p>
          ` : ''}

          ${status === 'Rejected' ? `
            <p>We encourage you to continue exploring other opportunities on SkillMatch. Your skills and experience are valuable!</p>
          ` : ''}

          <center>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/student/applications" class="button">
              View Application Details
            </a>
          </center>

          <p>Best regards,<br>
          <strong>SkillMatch Team</strong></p>
        </div>

        <div class="footer">
          <p>This is an automated notification from SkillMatch.</p>
          <p>© ${new Date().getFullYear()} SkillMatch. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  };
};

// Send application status update email
const sendApplicationStatusEmail = async (studentEmail, studentName, jobTitle, company, status, recruiterNotes = '') => {
  try {
    // Skip if email credentials are not configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured. Skipping email notification.');
      return { success: false, message: 'Email credentials not configured' };
    }

    const transporter = createTransporter();
    const emailContent = getApplicationStatusEmailTemplate(studentName, jobTitle, company, status, recruiterNotes);

    const mailOptions = {
      from: `"SkillMatch" <${process.env.EMAIL_USER}>`,
      to: studentEmail,
      subject: emailContent.subject,
      html: emailContent.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendApplicationStatusEmail
};
