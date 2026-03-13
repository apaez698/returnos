"use client";

interface RewardsSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function RewardsSearchInput({
  value,
  onChange,
  placeholder = "Buscar por nombre o telefono",
  isLoading = false,
}: RewardsSearchInputProps) {
  return (
    <div>
      <label
        htmlFor="rewards_customer_search"
        className="mb-1 block text-sm font-medium text-slate-700"
      >
        Buscar cliente
      </label>
      <div className="relative">
        <input
          id="rewards_customer_search"
          name="rewards_customer_search"
          type="search"
          autoComplete="off"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-indigo-500 focus:ring-2"
        />
        {isLoading ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
            ...
          </span>
        ) : null}
      </div>
    </div>
  );
}
