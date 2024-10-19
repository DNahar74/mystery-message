import mongoose, { Schema, Document } from "mongoose";

// Message Interface and Schema

export interface Message extends Document{
  content: string;
  createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  }
})

// User Interface and Schema

export interface User extends Document{
  username: string;
  email: string;
  password: string;
  verificationCode: string;
  verificationCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: { 
    type: String, 
    required: [true, "Username is required"],
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "please use a valid email address"],
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  verificationCode: {
    type: String,
    required: [true, "Verification code is required"]
  },
  verificationCodeExpiry: {
    type: Date,
    required: [true, "Verification code expiry is required"]
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAcceptingMessages: {
    type: Boolean,
    required: true,
    default: true
  },
  messages: [MessageSchema]
})

// User Model

const UserModel = (mongoose.models.Users as mongoose.Model<User>) || (mongoose.model<User>("Users", UserSchema));

export default UserModel