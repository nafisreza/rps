import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendUserWelcomeEmail(to: string, password: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Welcome to IUT Result Processing System",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(60,72,88,0.08); padding: 32px 28px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <img src="https://www.tbsnews.net/sites/default/files/styles/author/public/organization/logo/islamic_university_of_technology_coat_of_arms.png" alt="IUT Logo" style="height: 64px; margin-bottom: 8px;" />
            <h2 style="color: #3D74B6; margin: 0; font-size: 1.6rem;">Welcome to IUT Result Processing System</h2>
          </div>
          <p style="font-size: 1.05rem; color: #333; margin-bottom: 18px;">Your account has been created. Use the following credentials to log in:</p>
          <table style="width: 100%; margin-bottom: 18px;">
            <tr>
              <td style="padding: 8px 0; color: #555; font-weight: 500;">Email:</td>
              <td style="padding: 8px 0; color: #222; font-weight: 600;">${to}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #555; font-weight: 500;">Temporary Password:</td>
              <td style="padding: 8px 0; color: #222; font-weight: 600;">${password}</td>
            </tr>
          </table>
          <a href="https://rps.iutoic-dhaka.edu//login" style="display: block; width: 100%; background: #3D74B6; color: #fff; text-align: center; padding: 12px 0; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 1.08rem; margin-bottom: 18px;">Login to your account</a>
          <p style="font-size: 0.98rem; color: #666; margin-bottom: 0;">Please change your password after logging in for the first time.</p>
          <hr style="margin: 28px 0 16px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; color: #aaa; font-size: 0.92rem;">&copy; ${new Date().getFullYear()} Islamic University of Technology</div>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, code: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "IUT RPS Password Reset Code",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(60,72,88,0.08); padding: 32px 28px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #3D74B6; margin: 0; font-size: 1.4rem;">Password Reset Request</h2>
          </div>
          <p style="font-size: 1.05rem; color: #333; margin-bottom: 18px;">You requested to reset your password for the IUT Result Processing System. Use the code below to proceed:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 2rem; letter-spacing: 0.2em; background: #f3f6fa; color: #3D74B6; padding: 12px 32px; border-radius: 8px; font-weight: bold; border: 1px solid #e0e7ef;">${code}</span>
          </div>
          <p style="font-size: 0.98rem; color: #666; margin-bottom: 0;">This code is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.</p>
          <hr style="margin: 28px 0 16px 0; border: none; border-top: 1px solid #eee;" />
          <div style="text-align: center; color: #aaa; font-size: 0.92rem;">&copy; ${new Date().getFullYear()} Islamic University of Technology</div>
        </div>
      </div>
    `,
  });
}
