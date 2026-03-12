import { getBusinessTypeLabel } from "@/lib/business/business-branding";

interface BusinessBrandProps {
  name: string;
  type: string;
  logoUrl?: string | null;
}

export function BusinessBrand({ name, type, logoUrl }: BusinessBrandProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={name}
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-white font-bold text-base">{initial}</span>
        </div>
      )}
      <div className="min-w-0">
        <div className="font-semibold text-sm text-white leading-snug truncate">
          {name}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 truncate">
          {getBusinessTypeLabel(type)}
        </div>
      </div>
    </div>
  );
}
