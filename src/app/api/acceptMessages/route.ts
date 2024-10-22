import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { ApiResponse } from "@/types/ApiResponse";
import { authOptions } from "../auth/[...nextauth]/options";

import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export async function PATCH(req: Request): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
    }
    
    const {acceptMessages} = await req.json();
    const userId = user._id;
    
    const updatedUser = await UserModel.findByIdAndUpdate(userId, {isAcceptingMessages: acceptMessages}, {new: true});

    if (!updatedUser) {
      return NextResponse.json({success: false, message: "Failed to update user status"}, {status: 404});
    }
    
    return NextResponse.json({success: true, message: "User status updated successfully"}, {status: 200});
  } catch (error) {
    console.error("Failed to update user status ::\n"+ error);
    return NextResponse.json({success: false, message: "Failed to update user status"}, {status: 500});
  }
}

export async function GET(): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
    }

    const userId = user._id;
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return NextResponse.json({success: false, message: "User not found"}, {status: 404});
    }

    const message = foundUser.isAcceptingMessages ? "User is accepting messages" : "User is not accepting messages";

    return NextResponse.json({success: true, message, isAcceptingMessages: foundUser.isAcceptingMessages}, {status: 200})
  } catch (error) {
    console.error("Failed to get user status ::\n"+ error);
    return NextResponse.json({success: false, message: "Failed to get user status"}, {status: 500});
  }
}