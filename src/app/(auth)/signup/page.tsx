// Use of useDebounceValue here ::
// If we didn't add this, we would be checking if the username is unique, everytime the username field was changed
// This would lead to unnecessary requests when the user has not finished typing the username
// So, we use debouncedUsername, which stores the username after the delay has passed. So, we can check if the username is unique
// This prevents unnecessary requests, and makes the username checking automated

//todo: (1) print and check what is there in axios response and axios error objects
//todo: (2) add type message to newMessage
//todo: (3) change the exhaustive dependencies of the useEffect array
//todo: (4) check usage of useDebouncedValue

"use client"
 
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios, {AxiosError} from "axios"
import { useForm } from "react-hook-form"
import { useDebounceCallback } from 'usehooks-ts'
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useToast } from "@/hooks/use-toast"

import { signUpSchema } from "@/schemas/signUp.schema"
import { ApiResponse } from "@/types/ApiResponse"

import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const SignupPage = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounceCallback(setUsername, 500);
  const { toast } = useToast();

  //zod implementation

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  });
  
  useEffect(()=>{
    const checkUsernameIsUnique = async () => {
      if (username) {
        setIsCheckingUsername(true);
        try {
          const response = await axios.get(`/api/checkUsernameIsUnique?username=${username}`);
          if (response.data.success) {
            toast({
              title: "Success",
              description: "Username is unique",
              type: "background",
            })
          } else {
            toast({
              title: "Failure",
              description: response.data.message,
              type: "background",
              variant: "destructive"
            })
          }
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: "Error",
            description: axiosError.response?.data.message || "Error checking username",
            type: "background",
            variant: "destructive"
          })
        } finally {
          setIsCheckingUsername(false);
        }
      }
    }
    checkUsernameIsUnique();
  }, [username, toast]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>(`/api/signup`, data);
      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          type: "background"
        })
        router.replace(`/verify/${username}`);
      } else {
        toast({
          title: "Failure",
          description: response.data.message,
          type: "background",
          variant: "destructive"
        })
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Error signing up",
        type: "background",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex flex-col">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} 
                    onChange={(e)=>{
                      field.onChange(e);
                      debouncedUsername(e.target.value);
                    }}
                    />
                  </FormControl>
                  {isCheckingUsername && (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>)}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-fit mx-auto" type="submit" disabled={isSubmitting || isCheckingUsername}>
              {
                isSubmitting? (<Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : "Sign up"
              }
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage