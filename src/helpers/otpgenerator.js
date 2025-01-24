import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const generateOtp = async (email) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });

  // Calculate OTP expiration date (e.g., 5 minutes from now)
  const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

  const senderEmail = process.env.SENDER_EMAIL;

  if (!senderEmail) {
    throw new Error("Sender email is not defined in environment variables.");
  }

  const mailOptions = {
    from: `"ClickCart Support" <${senderEmail}>`,
    to: email,
    subject: "Your One-Time Password (OTP) for ClickCart Account Verification",
    text: `Dear user,

  Your One-Time Password (OTP) is ${otp}. This code is valid for the next 5 minutes and can be used to verify your account or complete your current action.

  If you did not request this code, please ignore this email.

  Best regards,
  The ClickCart Team`,
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #0056b3;">Dear User,</h2>
          <p>Thank you for using ClickCart! To proceed with your account verification or current action, please use the following One-Time Password (OTP):</p>
          <p style="font-size: 1.2em; font-weight: bold; color: #ff6f00;">${otp}</p>
          <p>This code is valid for the next <strong>5 minutes</strong>. Please do not share this OTP with anyone.</p>
          <p>If you did not request this code, please disregard this email. Your account security is important to us.</p>
          <p>Best regards,<br>The ClickCart Team</p>
          <hr>
          <p style="font-size: 0.9em; color: #777;">If you have any questions, please contact our support team at <a href="mailto:support@clickcart.com">support@clickcart.com</a>.</p>
        </div>
      `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  return { otp, otpExpiration };
};
