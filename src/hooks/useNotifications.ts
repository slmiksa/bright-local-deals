import { useState, useEffect, useCallback } from "react";

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = "lamha_notifications";

const getStored = (): AppNotification[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
};

const save = (notifs: AppNotification[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>(getStored);

  // Listen for push notifications from Capacitor
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const setup = async () => {
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");
        const listener = await PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            const newNotif: AppNotification = {
              id: Date.now().toString(),
              title: notification.title || "إشعار جديد",
              body: notification.body || "",
              timestamp: Date.now(),
              read: false,
            };
            setNotifications((prev) => {
              const updated = [newNotif, ...prev].slice(0, 50);
              save(updated);
              return updated;
            });
          }
        );
        cleanup = () => listener.remove();
      } catch {
        // Push not available (web)
      }
    };
    setup();
    return () => cleanup?.();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      save(updated);
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    save([]);
  }, []);

  return { notifications, unreadCount, markAllRead, clearAll };
};
