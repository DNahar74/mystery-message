import { z } from "zod";

export const messageValidation = z.string()
  .min(10, {message: "message must be atleast 10 characters long"})
  .max(300, {message: "message must be no more than 300 characters long"})

export const messageSchema = z.object({
  message: messageValidation
})