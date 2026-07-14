import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTempPasswordEmail(
  to: string,
  adminName: string,
  institutionName: string,
  tempPassword: string
) {
  const loginUrl = process.env.AUTH_URL || "http://localhost:3000";

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "noreply@nirvar.app",
    to,
    subject: "Your Nirvar Admin Panel Account",
    text: `Hello ${adminName},

You have been assigned as an admin for ${institutionName}.

Login: ${loginUrl}/login
Email: ${to}
Temporary Password: ${tempPassword}

You will be asked to change your password on first login.

— Nirvar Admin Panel`,
  });
}
