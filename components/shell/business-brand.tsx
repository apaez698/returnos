const typeLabel: Record<string, string> = {
  bakery: "Panadería / Cafetería",
  restaurant: "Restaurante",
};

interface BusinessBrandProps {
  name: string;
  type: string;
}

export function BusinessBrand({ name, type }: BusinessBrandProps) {
  return (
    <div>
      <div className="font-bold text-xl text-white leading-tight">{name}</div>
      <div className="text-xs text-slate-400 mt-0.5">
        {typeLabel[type] ?? type}
      </div>
    </div>
  );
}
