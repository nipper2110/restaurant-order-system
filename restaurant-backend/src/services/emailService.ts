import { Resend } from "resend";
import { createError } from "../utils/error";
import { errorCode } from "../../config/errorCode";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (to: string, otp: number) => {
  const { error } = await resend.emails.send({
    from: `GUSTO <${process.env.RESEND_FROM_EMAIL}>`,
    to,
    subject: "Your GUSTO verification code",
    html: `
      <div style="font-family: sans-serif; max-width: 420px; margin: 0 auto;">
        <h2 style="color: #111827;">Your verification code</h2>
        <p style="color: #374151;">Use this code to continue. It expires in 2 minutes.</p>
        <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #d97706;">${otp}</p>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw createError(
      "Failed to send verification email. Please try again.",
      502,
      errorCode.invalid,
    );
  }
};
