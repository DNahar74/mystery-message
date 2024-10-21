//todo: (1) check if there are any edge cases that need handling, and how to handle them
//todo: (2) check how to destructure resend.emails.send

import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import VerificationEmailTemplate from "../../emails/verificationEmailTemplate";

export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationCode: string
): Promise<NextResponse<ApiResponse>> {
  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Mystery message verification email',
      react: VerificationEmailTemplate({ username, otp: verificationCode}),
    });

    console.log("Verification email sent successfully");
    return NextResponse.json({success: true, message: "Verification email sent successfully"}, {status: 200});
  } catch (emailError) {
    console.error("Error sending verification email :: \n" + emailError);
    return NextResponse.json({success: false, message: "Failed to send verification email"}, {status: 500});
  }
}