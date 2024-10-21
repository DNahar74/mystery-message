import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

import { ApiResponse } from "@/types/ApiResponse";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  await dbConnect();

  try {
    const {username, email, password} = await request.json();
    
    const existingUserByEmail = await UserModel.findOne({ email }); 
    const verificationCode = Math.floor(100000 + Math.random()*900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json({success: false, message: "this email is already in use"}, {status: 409});
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
  
        const verificationCodeExpiry = new Date();
        verificationCodeExpiry.setHours(verificationCodeExpiry.getDate() + 1); // Verification code expires in 1 hour
  
        existingUserByEmail.username = username;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verificationCode = verificationCode;
        existingUserByEmail.verificationCodeExpiry = verificationCodeExpiry;

        await existingUserByEmail.save();
      }
    } else {
      const existingUserVerifiedByUsername = await UserModel.findOne({
        username,
        isVerified: true
      });
      if (existingUserVerifiedByUsername) {
        return NextResponse.json({success: false, message: "username is already taken"}, {status: 409});
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const verificationCodeExpiry = new Date();
      verificationCodeExpiry.setHours(verificationCodeExpiry.getDate() + 1); // Verification code expires in 1 hour

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verificationCode,
        verificationCodeExpiry,
        isVerified: false,
        isAcceptingMessages: true,
        messages: []
      });

      await newUser.save();
    }

    //send verification email

    const emailResponse = await sendVerificationEmail(email, username, verificationCode);

    // const emailResponseData: ApiResponse = await emailResponse.json();

    if (!emailResponse.ok) {
      return NextResponse.json({success: false, message: "Failed to send verification email"}, {status: 500});
    }

    return NextResponse.json({success: true, message: "User registered successfully, please verify your email", isAcceptingMessages: true, messages: []}, {status: 201});
  } catch (error) {
    console.error("Error registering user ::\n"+ error);
    return NextResponse.json({success: false, message: "user registration failed"}, {status: 500});
  }
}