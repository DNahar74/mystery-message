/* eslint-disable @typescript-eslint/no-explicit-any */
//todo: (1) Add google provider for signin
//todo: (2) Remove the explicit any for error messages

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs"

import { dbConnect } from "@/lib/dbConnect";
import UserModel from "@/models/User.model";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        identifier: { label: "Email", type: "email"},
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          });

          if (!user) {
            throw new Error("No user found with that email or username");
          }

          if (!user.isVerified) {
            throw new Error("Your account has not been verified yet.");
          }

          const valid = await bcrypt.compare(credentials.password, user.password);

          if (valid) {
            return user;
          } else {
            throw new Error("Invalid password");
          }
        } catch (error: any) {
          throw new Error(error);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.username = user.username;
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id?.toString();
        session.user.username = token.username?.toString();
        session.user.isVerified = Boolean(token.isVerified)? true: false;
        session.user.isAcceptingMessages = Boolean(token.isAcceptingMessages)? true: false;
      }

      return session
    },
  },
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};