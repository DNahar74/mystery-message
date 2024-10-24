//todo: (1) Add a isSubmitting state variable with a loader

'use client'

import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verificationSchema } from '@/schemas/verification.schema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import { useForm } from 'react-hook-form';
import * as z from 'zod'

const Verification = () => {
  const router = useRouter()
  const {toast} = useToast();

  const params = useParams<{username: string}>();

  const form = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: ''
    }
  });

  const onSubmit = async (data: z.infer<typeof verificationSchema>) => {
    try {
      const response = await axios.patch('/api/checkVerificationCode', {
        username: params.username, 
        verificationCode: data.verificationCode
      })

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          type: "background"
        })
        router.replace(`/signin`);
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
        description: axiosError.response?.data.message || "Error verifying user",
        type: "background",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="verificationCode"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              Verify
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Verification