import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PosPurchaseForm } from "@/components/pos/pos-purchase-form";
import { getPosCustomersForCurrentBusiness } from "@/lib/pos/queries";
import { PosCustomer } from "@/lib/pos/types";
import { registerPosPurchaseAction } from "./actions";

export default async function DashboardCajaPage() {
  let customers: PosCustomer[] = [];
  let error: string | null = null;

  try {
    customers = await getPosCustomersForCurrentBusiness();
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el módulo de caja.";
    }
  }

  return (
    <DashboardLayout pageTitle="Caja">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            Registro rápido de compras
          </h2>
          <p className="text-sm text-slate-600">
            Registro rápido de compras en caja: busca un cliente, selecciónalo y
            registra su compra en pocos pasos.
          </p>
        </section>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se pudo cargar caja</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {!error && customers.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Primero agrega al menos un cliente para registrar compras.
          </div>
        ) : null}

        {!error ? (
          <PosPurchaseForm
            initialCustomers={customers}
            action={registerPosPurchaseAction}
          />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
