import { getSessionUser } from "@/lib/firebase/auth";
import { redirect } from "next/navigation";
import { AdminModelsPanel } from "@/components/admin/models-panel";
import { AdminAnalyticsPanel } from "@/components/admin/analytics-panel";
import { AdminCouponsPanel } from "@/components/admin/coupons-panel";
import { AdminSystemStatusPanel } from "@/components/admin/system-status-panel";
import { AdminIncidentFeedPanel } from "@/components/admin/incident-feed-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-8">Platform management and AI routing configuration</p>

      <div className="mb-8">
        <AdminAnalyticsPanel />
      </div>

      <div className="mb-8">
        <AdminSystemStatusPanel />
      </div>

      <div className="mb-8">
        <AdminIncidentFeedPanel />
      </div>

      <div className="mb-8">
        <AdminCouponsPanel />
      </div>

      <AdminModelsPanel />
    </div>
  );
}
