"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw, Mail, Copy } from "lucide-react";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import MessageCard from "@/components/myComponents/MessageCard";
import { Message } from "@/models/User.model";
import { acceptMessageSchema } from "@/schemas/acceptMessage.schema";
import { ApiResponse } from "@/types/ApiResponse";

const Dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [profileUrl, setProfileUrl] = useState<string>("");
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const handleApiError = useCallback(
    (error: unknown, defaultMessage: string) => {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: axiosError.response?.data.message || defaultMessage,
        variant: "destructive",
      });
    },
    [toast]
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [messagesRes, settingsRes] = await Promise.all([
        axios.get<ApiResponse>("/api/getMessages"),
        axios.get<ApiResponse>("/api/acceptMessages"),
      ]);

      if (messagesRes.data.success) {
        setMessages(messagesRes.data.messages || []);
      }
      if (settingsRes.data.success) {
        setValue("acceptMessages", settingsRes.data.isAcceptingMessages);
      }
    } catch (error) {
      handleApiError(error, "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, [setValue, handleApiError]);

  const refreshMessages = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<ApiResponse>("/api/getMessages");
      if (response.data.success) {
        setMessages(response.data.messages || []);
        toast({
          title: "Messages refreshed",
          description: "Showing latest messages",
        });
      }
    } catch (error) {
      handleApiError(error, "Failed to refresh messages");
    } finally {
      setIsLoading(false);
    }
  }, [toast, handleApiError]);

  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  }, []);
  const copyProfileUrl = useCallback(() => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied!",
      description: "Profile link copied to clipboard",
    });
  }, [profileUrl, toast]);

  const toggleMessageAcceptance = useCallback(async () => {
    try {
      setIsSwitchLoading(true);
      const response = await axios.patch<ApiResponse>("/api/acceptMessages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", response.data.isAcceptingMessages);
      toast({
        title: "Status changed",
        description: `You are ${
          response.data.isAcceptingMessages ? "now" : "no longer"
        } accepting messages.`,
      });
    } catch (error) {
      handleApiError(error, "Failed to update settings");
    } finally {
      setIsSwitchLoading(false);
    }
  }, [acceptMessages, setValue, toast, handleApiError]);

  useEffect(() => {
    if (session?.user) {
      const { username } = session.user as User;
      setProfileUrl(
        `${window.location.protocol}//${window.location.host}/u/${username}`
      );
      fetchData();
    }
  }, [session?.user, fetchData]);

  if (!session?.user) return null;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Message Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your profile and incoming messages
        </p>
      </header>

      <section className="space-y-4 rounded-lg border p-6">
        <h2 className="text-xl font-semibold">Profile Settings</h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="profile-url" className="block text-sm font-medium">
              Your Profile Link
            </label>
            <div className="flex gap-2">
              <input
                id="profile-url"
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 rounded-md border bg-muted px-3 py-2 text-sm"
              />
              <Button variant="secondary" onClick={copyProfileUrl}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Message Settings
            </label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  {...register("acceptMessages")}
                  checked={acceptMessages}
                  onCheckedChange={toggleMessageAcceptance}
                  disabled={isSwitchLoading}
                  aria-label="Toggle message acceptance"
                />
                <span className="text-sm">
                  {acceptMessages
                    ? "Accepting messages"
                    : "Not accepting messages"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshMessages}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="mr-2 h-4 w-4" />
                )}
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Messages</h2>
          <span className="text-sm text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>

        {messages.length > 0 ? (
          <div className="grid gap-4">
            {messages.map((message) => (
              <MessageCard
                key={message._id as string}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border py-12 text-center">
            <Mail className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No messages yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your profile link to start receiving messages
            </p>
            <Button variant="ghost" className="mt-4" onClick={refreshMessages}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Check for new messages
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
