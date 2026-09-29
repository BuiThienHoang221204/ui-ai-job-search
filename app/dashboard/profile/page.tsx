import type { Metadata } from "next";
import { ProfileView } from "./profile-view";

export const metadata: Metadata = { title: "Hồ sơ của tôi — Careelot" };

/** Trang hồ sơ; server component chỉ để khai metadata. */
export default function ProfilePage() {
  return <ProfileView />;
}
