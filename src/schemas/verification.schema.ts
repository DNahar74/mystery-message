import { z } from "zod";

export const verificationCodeValidation = z.string()
  .min(6, {message: "verification code must be atleast 6 characters long"})

export const verificationSchema = z.object({
  verificationCode: verificationCodeValidation
})