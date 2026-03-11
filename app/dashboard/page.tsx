import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/dashboard/metric-card";

export default function DashboardPage() {
  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Customers"
          value="284"
          icon="👥"
          trend="+12% this month"
        />
        <MetricCard
          label="Active Visits"
          value="1,234"
          icon="📍"
          trend="+8% vs last month"
        />
        <MetricCard
          label="Rewards Redeemed"
          value="156"
          icon="🎁"
          trend="+24% this month"
        />
        <MetricCard
          label="Campaign Reach"
          value="892"
          icon="📢"
          trend="+3% engagement"
        />
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recent Activity
        </h2>
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600">
          <p>Recent visits and customer activity will appear here</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
