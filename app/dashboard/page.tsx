import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { getDashboardDataForCurrentBusiness } from "@/lib/dashboard/data";

function formatMetric(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatActivityDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function DashboardPage() {
  let totalCustomers = 0;
  let totalVisits = 0;
  let totalRewardsRedeemed = 0;
  let campaignReach = 0;
  let inactiveSummary: Awaited<
    ReturnType<typeof getDashboardDataForCurrentBusiness>
  >["inactiveSummary"] = [];
  let recentActivity: Awaited<
    ReturnType<typeof getDashboardDataForCurrentBusiness>
  >["recentActivity"] = [];

  try {
    const dashboardData = await getDashboardDataForCurrentBusiness();

    totalCustomers = dashboardData.metrics.totalCustomers;
    totalVisits = dashboardData.metrics.totalVisits;
    totalRewardsRedeemed = dashboardData.metrics.rewardsRedeemed;
    campaignReach = dashboardData.metrics.campaignReach;
    inactiveSummary = dashboardData.inactiveSummary;
    recentActivity = dashboardData.recentActivity;
  } catch {
    totalCustomers = 0;
    totalVisits = 0;
    totalRewardsRedeemed = 0;
    campaignReach = 0;
    inactiveSummary = [];
    recentActivity = [];
  }

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Customers"
          value={formatMetric(totalCustomers)}
          icon="👥"
          trend="Current business total"
        />
        <MetricCard
          label="Active Visits"
          value={formatMetric(totalVisits)}
          icon="📍"
          trend="Last 30 days"
        />
        <MetricCard
          label="Rewards Redeemed"
          value={formatMetric(totalRewardsRedeemed)}
          icon="🎁"
          trend="All time"
        />
        <MetricCard
          label="Campaign Reach"
          value={formatMetric(campaignReach)}
          icon="📢"
          trend="From campaign deliveries"
        />
      </div>

      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Inactive Customers
            </h2>
            <p className="mt-1 text-slate-600">
              Top 5 customers with 14+ days since their last visit.
            </p>
          </div>
          <a
            href="/dashboard/inactive-customers"
            className="text-sm font-medium text-slate-700 underline underline-offset-4 hover:text-slate-900"
          >
            View all
          </a>
        </div>

        {inactiveSummary.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
            No inactive customers right now.
          </div>
        ) : (
          <ul className="space-y-3">
            {inactiveSummary.map((customer) => (
              <li
                key={customer.customerId}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">{customer.name}</p>
                  <p className="text-sm text-slate-600">
                    {customer.daysSinceLastVisit ?? "∞"} days inactive
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Recent Activity
        </h2>
        {recentActivity.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600">
            <p>No recent visits or reward redemptions yet.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((activity) => (
              <li
                key={`${activity.type}-${activity.id}`}
                className="rounded-lg border border-slate-200 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-slate-900">
                    {activity.description}
                  </p>
                  <p className="text-sm text-slate-600">
                    {formatActivityDate(activity.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
