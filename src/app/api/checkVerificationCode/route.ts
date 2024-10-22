//todo: (1) Add zod validation for this API

import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { ApiResponse } from "@/types/ApiResponse";

export async function PATCH(request: Request): Promise<NextResponse<ApiResponse>> {
  await dbConnect();
  
  try {
    const {username, verificationCode} = await request.json(); 
    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({username: decodedUsername});
    if (!user) {
      return NextResponse.json({success: false, message: "User not found"}, {status: 404});
    }

    const isCodeValid = user.verificationCode === verificationCode;
    if (!isCodeValid) {
      return NextResponse.json({success: false, message: "Invalid verification code"}, {status: 401});
    }

    const isCodeExpired = new Date(user.verificationCodeExpiry) < new Date();
    if (isCodeExpired) {
      return NextResponse.json({success: false, message: "Verification code has expired, please signup again for a new code"}, {status: 401});
    }
    
    user.isVerified = true;
    await user.save();

    return NextResponse.json({success: true, message: "User verified successfully"}, {status: 200});
  } catch (error) {
    console.error("Error verifying user ::\n"+ error);
    return NextResponse.json({success: false, message: "Error verifying user"}, {status: 500});
  }
}