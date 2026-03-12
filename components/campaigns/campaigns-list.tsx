import type { CampaignRecord } from "@/lib/campaigns/types";

interface CampaignsListProps {
  campaigns: CampaignRecord[];
}

const statusLabel: Record<CampaignRecord["status"], string> = {
  draft: "Borrador",
  scheduled: "Programada",
  sent: "Enviada",
};

const statusStyle: Record<CampaignRecord["status"], string> = {
  draft: "bg-slate-100 text-slate-700",
  scheduled: "bg-amber-100 text-amber-800",
  sent: "bg-emerald-100 text-emerald-800",
};

export function CampaignsList({ campaigns }: CampaignsListProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Aun no hay campanas creadas.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100 md:hidden">
        {campaigns.map((campaign) => (
          <article key={campaign.id} className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-900">
                {campaign.name}
              </h3>
              <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyle[campaign.status]}`}
              >
                {statusLabel[campaign.status]}
              </span>
            </div>

            <p className="text-xs text-slate-600">{campaign.message}</p>

            <p className="text-xs text-slate-500">
              {campaign.campaign_type} · {campaign.audience_type}
              {campaign.target_inactive_days
                ? ` (${campaign.target_inactive_days}+ dias)`
                : ""}
            </p>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Campana</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Audiencia</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{campaign.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {campaign.message}
                  </p>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {campaign.campaign_type}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {campaign.audience_type}
                  {campaign.target_inactive_days ? (
                    <span className="ml-1 text-xs text-slate-500">
                      ({campaign.target_inactive_days}+ dias)
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusStyle[campaign.status]}`}
                  >
                    {statusLabel[campaign.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
