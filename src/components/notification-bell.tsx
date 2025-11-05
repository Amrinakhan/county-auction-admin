"use client";

import useSWR, { mutate } from "swr";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axios from "axios";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NotificationBell() {
  const { data: notifications } = useSWR("/api/notifications", fetcher);
  const unreadCount =
    notifications && Array.isArray(notifications)
      ? notifications.filter((n: any) => !n.is_read).length
      : 0;

  const handleMarkRead = async (id: number) => {
    try {
      await axios.patch(`/api/notifications/${id}/markRead`);
      mutate("/api/notifications");
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const notificationsArray = Array.isArray(notifications) ? notifications : [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notificationsArray.length === 0 ? (
            <DropdownMenuItem disabled className="text-center">
              No notifications
            </DropdownMenuItem>
          ) : (
            notificationsArray.map((notification: any) => (
              <DropdownMenuItem
                key={notification.id}
                className={`${notification.is_read ? "" : "bg-blue-50"} cursor-pointer`}
                onClick={() => !notification.is_read && handleMarkRead(notification.id)}
              >
                <div className="flex flex-col w-full">
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {notification.type} •{" "}
                    {new Date(notification.created_at).toLocaleDateString()}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

