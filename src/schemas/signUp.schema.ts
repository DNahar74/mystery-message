import { z } from "zod";

export const usernameValidation = z.string()
  .min(2, {message: "username must be atleast 2 characters long"})
  .max(20, {message: "username must be no more than 20 characters long"})
  .regex(/^[a-zA-Z0-9_]+$/, {message: "username must not contain any special characters"})

export const emailValidation = z.string()
  .email({message: "Please enter a valid email address"})

export const passwordValidation = z.string()
  .min(8, {message: "password must be atleast 8 characters long"})


export const signUpSchema = z.object({
  username: usernameValidation,
  email: emailValidation,
  password: passwordValidation
})