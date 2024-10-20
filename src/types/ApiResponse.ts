//todo: understand typesafety system of TS
// This is for typesafety

import { Message } from "@/models/User.model";

export interface ApiResponse {
  success: boolean;
  message: string;
  status: number;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}