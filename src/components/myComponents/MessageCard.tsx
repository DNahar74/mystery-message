'use client'

import {
  Card,
  CardContent,
  CardDescription,
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
import { X } from "lucide-react"
import { Message } from "@/models/User.model"
import { useToast } from "@/hooks/use-toast"
import axios from "axios"

type MessageCardProps = {
  message: Message,
  onMessageDelete: (messageId: string) => void,
}

const MessageCard = ({message, onMessageDelete}: MessageCardProps) => {
  const {toast} = useToast() 
  const handleDeleteConfirm = async () => {
    const messageId = message._id as string || '';
    const response = await axios.delete(`/api/deleteMessage/${message._id}`)
    if (response.data.success) {
      toast({
        title: "Success",
        description: "Message deleted successfully",
        type: "background"
      })
    } else if (response.data.error) {
      toast({
        title: "Error",
        description: response.data.error,
        type: "background",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Error",
        description: "An error occurred while deleting the message",
        type: "background",
        variant: "destructive"
      })
    }
    onMessageDelete(messageId);
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive"><X className="w-5 h-5"/></Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>

  )
}

export default MessageCard