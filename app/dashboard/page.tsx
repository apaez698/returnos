import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { MetricCard } from "@/components/dashboard/metric-card";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";
import { getInactiveCustomers } from "@/lib/customers/inactivity";

export default async function DashboardPage() {
  let inactiveSummary: ReturnType<typeof getInactiveCustomers> = [];

  try {
    const customers = await getCustomersWithPointsForCurrentBusiness();
    inactiveSummary = getInactiveCustomers(customers).slice(0, 5);
  } catch {
    inactiveSummary = [];
  }

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
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-600">
          <p>Recent visits and customer activity will appear here</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
