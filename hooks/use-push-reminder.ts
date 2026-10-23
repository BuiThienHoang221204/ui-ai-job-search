"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage } from "@/lib/axios";
import { vapidKeyBytes } from "@/lib/push";
import { keys } from "@/lib/query-keys";
import { pushService } from "@/services";
import { useToast } from "@/hooks/use-toast";

export type PushState = "unsupported" | "install" | "denied" | "off" | "on";

const SW_URL = "/sw.js";

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration(SW_URL);
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Gửi thiết bị lên máy chủ; máy chủ ghi đè theo endpoint nên gửi lại bao nhiêu lần cũng được. */
async function saveSubscription(subscription: PushSubscription) {
  const { p256dh = "", auth = "" } = subscription.toJSON().keys ?? {};
  await pushService.subscribe({ endpoint: subscription.endpoint, keys: { p256dh, auth } });
}

/** Trạng thái nhắc học trên thiết bị này, đọc từ trình duyệt (iPhone chưa thêm app ra màn hình chính thì không có Web Push). Đang có đăng ký thì đồng bộ lại lên máy chủ: trình duyệt có thể cấp endpoint mới, hoặc tài khoản khác vừa đăng nhập. */
async function readState(): Promise<{ state: PushState; endpoint: string | null }> {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (ios && !window.matchMedia("(display-mode: standalone)").matches) {
    return { state: "install", endpoint: null };
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    return { state: "unsupported", endpoint: null };
  }
  if (Notification.permission === "denied") return { state: "denied", endpoint: null };
  const subscription = await currentSubscription();
  if (!subscription) return { state: "off", endpoint: null };
  await saveSubscription(subscription);
  return { state: "on", endpoint: subscription.endpoint };
}

/** Bật/tắt/gửi thử nhắc học trên thiết bị đang dùng; tự đăng ký service worker nên chạy được cả khi dev. */
export function usePushReminder() {
  const client = useQueryClient();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const status = useQuery({ queryKey: keys.pushStatus(), queryFn: readState, staleTime: Infinity });

  const run = async (action: () => Promise<void>, failure: string) => {
    setBusy(true);
    try {
      await action();
    } catch (cause) {
      toast.danger(apiErrorMessage(cause, failure));
    } finally {
      setBusy(false);
      await client.invalidateQueries({ queryKey: keys.pushStatus() });
    }
  };

  const enable = () =>
    run(async () => {
      if ((await Notification.requestPermission()) !== "granted") return;
      await navigator.serviceWorker.register(SW_URL);
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKeyBytes(await pushService.publicKey()),
      });
      try {
        await saveSubscription(subscription);
      } catch (cause) {
        await subscription.unsubscribe();
        throw cause;
      }
      toast.success("Đã bật nhắc học trên thiết bị này");
    }, "Không bật được nhắc học");

  const disable = () =>
    run(async () => {
      const subscription = await currentSubscription();
      if (!subscription) return;
      await pushService.unsubscribe(subscription.endpoint);
      await subscription.unsubscribe();
    }, "Không tắt được nhắc học");

  const sendTest = () =>
    run(async () => {
      if (!status.data?.endpoint) return;
      const { sent } = await pushService.test(status.data.endpoint);
      if (sent) toast.success("Đã gửi thông báo thử");
      else toast.danger("Không gửi được tới thiết bị này. Tắt rồi bật lại nhắc học.");
    }, "Không gửi được thông báo thử");

  return { state: status.data?.state ?? null, busy, enable, disable, sendTest };
}
