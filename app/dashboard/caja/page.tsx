import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { PosPurchaseForm } from "@/components/pos/pos-purchase-form";
import {
  getActiveRewardThresholdsForCurrentBusiness,
  getPosCustomersForCurrentBusiness,
} from "@/lib/pos/queries";
import { PosCustomer, PosRewardThreshold } from "@/lib/pos/types";
import { registerPosPurchaseAction } from "./actions";
import { createPosCustomerInlineAction } from "./create-customer-inline";

export default async function DashboardCajaPage() {
  let customers: PosCustomer[] = [];
  let rewardThresholds: PosRewardThreshold[] = [];
  let error: string | null = null;

  try {
    customers = await getPosCustomersForCurrentBusiness();
    rewardThresholds = await getActiveRewardThresholdsForCurrentBusiness();
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el módulo de caja.";
    }
  }

  return (
    <DashboardLayout pageTitle="Caja">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <section className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
            Registro rápido de compras
          </h2>
          <p className="text-sm text-slate-600">
            Busca un cliente, selecciónalo y registra su compra en pocos pasos.
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
            Aun no hay clientes. Usa la busqueda para crear uno nuevo y
            registrar la compra al instante.
          </div>
        ) : null}

        {!error ? (
          <PosPurchaseForm
            initialCustomers={customers}
            rewardThresholds={rewardThresholds}
            action={registerPosPurchaseAction}
            createCustomerAction={createPosCustomerInlineAction}
          />
        ) : null}
      </div>
    </DashboardLayout>
  );
}
