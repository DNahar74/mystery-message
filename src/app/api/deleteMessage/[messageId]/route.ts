//todo: (1) Learn MongoDB aggregation pipelines

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { dbConnect } from "@/lib/dbConnect";
import { ApiResponse } from "@/types/ApiResponse";
import { authOptions } from "../../auth/[...nextauth]/options";
import UserModel from "@/models/User.model";

export async function DELETE({params}: {params: {messageId: string}}): Promise<NextResponse<ApiResponse>> {
  await dbConnect();
  const messageId = params.messageId;

  try {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    
    if (!session || !user) {
      return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    const updateResult = await UserModel.updateOne(
      {_id: userId},
      { $pull: {messages: {_id: messageId}}}
    );

    if (!updateResult || updateResult.modifiedCount === 0) {
      return NextResponse.json({success: false, message: "Message not found"}, {status: 404});
    }

    return NextResponse.json({success: true, message: "Message deleted"}, {status: 200})
  } catch (error) {
    console.error("Failed to get user status ::\n"+ error);
    return NextResponse.json({success: false, message: "Failed to get user messages"}, {status: 500});
  }
}