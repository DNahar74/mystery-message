'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { X, Mail } from "lucide-react"
import { Message } from "@/models/User.model"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
// import { format } from "date-fns"

type MessageCardProps = {
  message: Message,
  onMessageDelete: (messageId: string) => void,
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast()

  const handleDeleteConfirm = async () => {
    try {
      console.log(message._id);
      const response = await axios.delete(`/api/deleteMessage/${message._id}`)
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Message deleted successfully",
          variant: "default",
        })
        onMessageDelete(message._id as string);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="relative pb-2">
        <div className="flex justify-between items-start gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              New Message
            </CardTitle>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The message will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none">
          <p className="whitespace-pre-wrap text-gray-800">
            {message.content}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default MessageCard