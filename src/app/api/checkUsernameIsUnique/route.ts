import { NextResponse } from "next/server";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUp.schema";

import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";
import { ApiResponse } from "@/types/ApiResponse";

const usernameQuerySchema = z.object({
  username: usernameValidation
})

export async function GET(request: Request): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    // url is of the format :: localhost:3000/signup(or whatever route)?username=testUser

    const {searchParams} = new URL(request.url);
    const queryParam = {
      username: searchParams.get("username")
    }
    
    // validate with zod

    const result = usernameQuerySchema.safeParse(queryParam);
    console.log(result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors?.join(', \n') || "the username is invalid";
      return NextResponse.json({success: false, message: usernameErrors}, {status: 400});
    }

    // check if username is unique

    const {username} = result.data;
    const existingVerifiedUser = await UserModel.findOne({username, isVerified: true});

    if (existingVerifiedUser) {
      return NextResponse.json({success: false, message: "username is already taken"}, {status: 409});
    }
    
    return NextResponse.json({success: true, message: "username is unique"}, {status: 200});
  } catch (error) {
    console.error("Error checking username ::\n"+ error);
    return NextResponse.json({success: false, message: "error checking username"}, {status: 500});
  }
}