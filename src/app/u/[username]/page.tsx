//todo: (1) sendMessage API => get make it so that anyone can send message, as long as they are accepting
//todo: (2) suggestMessages API => add openAI suggested responses

'use client'

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
// import { useRouter } from "next/navigation";
import { useState } from "react";

const SendMessagePage = ({ params }: { params: { username: string } }) => {
  // const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post<ApiResponse>('/api/sendMessage', {
        username: params.username,
        content
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message,
          variant: "default",
        });
        setContent('');
        // Optional: Redirect after success
        // router.push('/');
      } else {
        toast({
          title: "Error",
          description: response.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">Send Message</h1>
      
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          Send a message to @{params.username}
        </h2>
        <Separator className="my-4" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium">
            Your Message
          </label>
          <textarea
            id="message"
            rows={6}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            placeholder={`Write your message to @${params.username} here...`}
          />
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading || !content.trim()}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Message'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SendMessagePage;