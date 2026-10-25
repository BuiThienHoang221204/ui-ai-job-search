import { api } from "@/lib/axios";
import type { PushPreferences, PushSubscriptionInput } from "@/types";

export const pushService = {
  publicKey: () =>
    api.get<{ publicKey: string }>("/push/public-key").then((r) => r.data.publicKey),

  subscribe: (subscription: PushSubscriptionInput) =>
    api.post<{ subscribed: boolean }>("/push/subscriptions", subscription).then((r) => r.data),

  unsubscribe: (endpoint: string) =>
    api
      .delete<{ removed: number }>("/push/subscriptions", { data: { endpoint } })
      .then((r) => r.data),

  preferences: () =>
    api.get<PushPreferences>("/push/preferences").then((r) => r.data),

  setPreferences: (patch: Partial<PushPreferences>) =>
    api.patch<PushPreferences>("/push/preferences", patch).then((r) => r.data),

  test: (endpoint: string) =>
    api.post<{ sent: number }>("/push/test", { endpoint }).then((r) => r.data),
};
