import type { CreateBusinessOwnerInput } from "@/lib/onboarding/onboarding-schema";

interface BusinessTypeSelectProps {
  value: CreateBusinessOwnerInput["businessType"];
  onChange: (businessType: CreateBusinessOwnerInput["businessType"]) => void;
  disabled?: boolean;
  error?: string;
}

const BUSINESS_TYPE_OPTIONS: Array<{
  value: CreateBusinessOwnerInput["businessType"];
  title: string;
  description: string;
}> = [
  {
    value: "bakery",
    title: "Panaderia / Cafeteria",
    description: "Ideal si vendes pan, cafe, postres o reposteria.",
  },
  {
    value: "restaurant",
    title: "Restaurante",
    description: "Ideal para fondas, cocinas y comida rapida.",
  },
];

export function BusinessTypeSelect({
  value,
  onChange,
  disabled = false,
  error,
}: BusinessTypeSelectProps) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-slate-700">
        Tipo de negocio
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {BUSINESS_TYPE_OPTIONS.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`rounded-lg border p-3 transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-slate-300 bg-white hover:border-slate-400"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              <input
                type="radio"
                name="businessType"
                value={option.value}
                checked={isSelected}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="sr-only"
              />
              <p className="text-sm font-semibold text-slate-900">
                {option.title}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {option.description}
              </p>
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </fieldset>
  );
}
