import type { InactiveCustomer } from "@/lib/customers/inactivity";
import type { CampaignSuggestion } from "./types";

const REACTIVATION_DAYS = 14;

type ReactivationBusinessType = "bakery" | "restaurant";

interface ReactivationSuggestionTemplate {
  title: string;
  message: (
    inactiveCustomerCount: number,
    targetInactiveDays: number,
  ) => string;
}

export interface BuildBusinessReactivationSuggestionsInput {
  businessType: ReactivationBusinessType;
  inactiveCustomerCount: number;
  targetInactiveDays?: number;
}

const REACTIVATION_TEMPLATES: Record<
  ReactivationBusinessType,
  ReactivationSuggestionTemplate[]
> = {
  bakery: [
    {
      title: "Dulce regreso",
      message: (inactiveCustomerCount, targetInactiveDays) =>
        `${inactiveCustomerCount} clientes llevan ${targetInactiveDays}+ dias sin comprar. Envia: "Te esperamos con cafe y pan dulce de cortesia en tu regreso."`,
    },
    {
      title: "Pan recien horneado para volver",
      message: (inactiveCustomerCount, targetInactiveDays) =>
        `Reactiva ${inactiveCustomerCount} clientes inactivos (${targetInactiveDays}+ dias) con: "Vuelve hoy y recibe 2x1 en piezas seleccionadas despues de las 5 pm."`,
    },
  ],
  restaurant: [
    {
      title: "Regreso al menu favorito",
      message: (inactiveCustomerCount, targetInactiveDays) =>
        `${inactiveCustomerCount} clientes no visitan desde hace ${targetInactiveDays}+ dias. Prueba: "Regresa esta semana y recibe 10% en tu proximo almuerzo."`,
    },
    {
      title: "Noche de vuelta",
      message: (inactiveCustomerCount, targetInactiveDays) =>
        `Invita a ${inactiveCustomerCount} clientes inactivos con: "Tu mesa te espera. Vuelve y te damos una bebida de bienvenida en tu visita de regreso." (${targetInactiveDays}+ dias).`,
    },
  ],
};

export function buildBusinessReactivationSuggestions({
  businessType,
  inactiveCustomerCount,
  targetInactiveDays = REACTIVATION_DAYS,
}: BuildBusinessReactivationSuggestionsInput): CampaignSuggestion[] {
  if (inactiveCustomerCount === 0) {
    return [];
  }

  return REACTIVATION_TEMPLATES[businessType].map((template) => ({
    title: template.title,
    message: template.message(inactiveCustomerCount, targetInactiveDays),
    campaignType: "reactivation",
    audienceType: "inactive_customers",
    targetInactiveDays,
  }));
}

interface BuildReactivationSuggestionsInput {
  inactiveCustomers: InactiveCustomer[];
  targetInactiveDays?: number;
}

function getHighValueInactiveCount(
  inactiveCustomers: InactiveCustomer[],
): number {
  return inactiveCustomers.filter((customer) => customer.points >= 50).length;
}

export function buildReactivationCampaignSuggestions({
  inactiveCustomers,
  targetInactiveDays = REACTIVATION_DAYS,
}: BuildReactivationSuggestionsInput): CampaignSuggestion[] {
  const inactiveCount = inactiveCustomers.length;
  const highValueInactiveCount = getHighValueInactiveCount(inactiveCustomers);

  return [
    {
      title: "Regreso dulce de la casa",
      message: `Tenemos ${inactiveCount} clientes inactivos hace ${targetInactiveDays}+ dias. Invitalos con: "Vuelve esta semana y te damos pan dulce o cafe de cortesia."`,
      audienceType: "inactive_customers",
      targetInactiveDays: targetInactiveDays,
      campaignType: "reactivation",
    },
    {
      title: "Vuelve al almuerzo",
      message: `Activa clientes inactivos con una oferta simple: "Regresa por tu almuerzo y recibe 10% de descuento en tu proxima visita."`,
      audienceType: "inactive_customers",
      targetInactiveDays: targetInactiveDays,
      campaignType: "reactivation",
    },
    {
      title: "Tarde de cafe y regreso",
      message: `Campana para clientes con ${targetInactiveDays}+ dias sin visitar: "Te esperamos hoy por la tarde con cafe 2x1 en tu primera compra de regreso."`,
      audienceType: "inactive_customers",
      targetInactiveDays: targetInactiveDays,
      campaignType: "reactivation",
    },
    {
      title: "Reactiva clientes con mas puntos",
      message: `Hay ${highValueInactiveCount} clientes inactivos con 50+ puntos. Mensaje sugerido: "Tienes puntos acumulados, vuelvelos canjeables con una visita esta semana."`,
      audienceType: "inactive_customers",
      targetInactiveDays: targetInactiveDays,
      campaignType: "reactivation",
    },
  ];
}
