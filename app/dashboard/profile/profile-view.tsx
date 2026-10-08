"use client";

import { PageError } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { EditModal } from "./edit-modal";
import { ImprovePanel } from "./improve-panel";
import { unansweredWishes, type ProfileTab } from "./profile-config";
import { ProfileHeader, ProfileSkeleton } from "./profile-summary";
import { CareerSection } from "./sections/career-section";
import { ConditionsSection } from "./sections/conditions-section";
import { IdentitySection } from "./sections/identity-section";
import { RecordsSection } from "./sections/records-section";
import { SkillsSection } from "./sections/skills-section";
import { useProfile, useProfileUi } from "./use-profile";

/** Trang hồ sơ: đầu trang, hai tab (từ CV / mong muốn) và cột việc nên làm. */
export function ProfileView() {
  const { data: profile, error } = useProfile();
  const tab = useProfileUi((state) => state.tab);
  const setTab = useProfileUi((state) => state.setTab);

  if (error) return <PageError title="Không tải được hồ sơ" message={error} />;
  if (!profile) return <ProfileSkeleton />;

  const open = unansweredWishes(profile);
  const tabs = [
    { value: "cv", label: "Hồ sơ nghề nghiệp" },
    {
      value: "wish",
      label: open
        ? `Mong muốn tìm việc · còn ${open} câu`
        : "Mong muốn tìm việc",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-340 space-y-5 pb-6">
      <ProfileHeader />

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18.75rem,1fr)]">
        <Card className="min-w-0 overflow-hidden">
          <div className="border-b border-slate-100 p-3">
            <Tabs
              tabs={tabs}
              value={tab}
              onChange={(value) => setTab(value as ProfileTab)}
            />
          </div>
          {tab === "cv" ? (
            <div className="divide-y divide-slate-100">
              <IdentitySection />
              <SkillsSection />
              <RecordsSection />
            </div>
          ) : (
            <>
              <p className="border-b border-slate-100 bg-slate-50 px-5 py-3 text-sm text-slate-600">
                AI đọc các câu trả lời dưới đây khi chấm độ phù hợp của từng tin
                và khi viết CV, thư xin việc cho bạn. Danh sách việc làm không
                bị lọc theo các câu này.
              </p>
              <ConditionsSection />
              <CareerSection />
            </>
          )}
        </Card>
        <ImprovePanel />
      </div>

      <EditModal />
    </div>
  );
}
