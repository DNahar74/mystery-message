//todo: (1) Learn MongoDB aggregation pipelines

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import { ApiResponse } from "@/types/ApiResponse";
import { authOptions } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User.model";

export async function GET(): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      return NextResponse.json({success: false, message: "User not found"}, {status: 404});
    }

    const foundUser = await UserModel.aggregate([
      { $match: {_id: userId}},
      { $unwind: '$messages'},
      { $sort: {'messages.createdAt': -1}},
      { $group: {_id: '$_id', messages: {$push: '$messages'}}}
    ]);

    return NextResponse.json({success: true, message: "User messages found", messages: foundUser[0]?.messages || []}, {status: 200})
  } catch (error) {
    console.error("Failed to get user status ::\n"+ error);
    return NextResponse.json({success: false, message: "Failed to get user messages"}, {status: 500});
  }
}