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

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MessageCounters({ campaign }: { campaign: CampaignRecord }) {
  if (campaign.total_messages === 0)
    return <span className="text-slate-400">—</span>;
  return (
    <span className="tabular-nums text-slate-700">
      {campaign.messages_sent}/{campaign.total_messages}
      {campaign.messages_failed > 0 && (
        <span className="ml-1 text-rose-600">
          ({campaign.messages_failed} fallidos)
        </span>
      )}
    </span>
  );
}

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

            <div className="flex gap-4 text-xs text-slate-500">
              {campaign.scheduled_at && (
                <span>Programada: {formatDate(campaign.scheduled_at)}</span>
              )}
              {campaign.sent_at && (
                <span>Último envío: {formatDate(campaign.sent_at)}</span>
              )}
            </div>

            {campaign.total_messages > 0 && (
              <p className="text-xs text-slate-500">
                Mensajes: <MessageCounters campaign={campaign} />
              </p>
            )}
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
              <th className="px-4 py-3 font-medium">Mensajes</th>
              <th className="px-4 py-3 font-medium">Programada</th>
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
                <td className="px-4 py-3 text-sm">
                  <MessageCounters campaign={campaign} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {formatDate(campaign.scheduled_at)}
                  {campaign.sent_at && (
                    <p className="text-xs text-slate-500">
                      Último:&nbsp;{formatDate(campaign.sent_at)}
                    </p>
                  )}
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
