// Anyone can send messages even if they are not logged in yet

//todo: (1) add zod validation for message validation
//todo: (2) add type message to newMessage

import { NextResponse } from "next/server";

import { ApiResponse } from "@/types/ApiResponse";
import { dbConnect } from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/User.model";

export async function POST(req: Request): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    const {username, content} = await req.json();

    const reciever = await UserModel.findOne({username, isVerified: true});
    if (!reciever) {
      return NextResponse.json({success: false, message: "User not found"}, {status: 404});
    }
    
    if (!reciever.isAcceptingMessages) {
      return NextResponse.json({success: false, message: "User is not accepting messages"}, {status: 403});
    }

    const newMessage = {content, createdAt: new Date()};
    reciever.messages.push(newMessage as Message);

    await reciever.save();

    return NextResponse.json({success: true, message: "Message sent successfully"}, {status: 200});
  } catch (error) {
    console.error("Internal server error ::\n"+ error);
    return NextResponse.json({success: false, message: "Internal server error"}, {status: 500});
  }
}