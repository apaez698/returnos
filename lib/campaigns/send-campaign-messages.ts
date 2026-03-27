import "server-only";

import { createServerClient } from "@/lib/supabase/server";
import { sendTwilioWhatsAppMessage } from "@/features/whatsapp/service/send-twilio-whatsapp-message";
import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";
import type { CampaignRecord } from "@/lib/campaigns/types";

export interface SendCampaignMessagesInput {
  campaign: CampaignRecord;
  customerPhoneNumbers: Array<{ customerId: string; phone: string }>;
  countryCode?: string;
}

export interface SendCampaignMessagesResult {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  messageGroups: Array<{
    customerId: string;
    status: "sent" | "failed" | "pending";
    messageId?: string;
    errorMessage?: string;
  }>;
}

/**
 * Envía mensajes de campaña vía WhatsApp a una lista de clientes
 * - Normaliza teléfonos
 * - Integra con Twilio/WhatsApp
 * - Registra historial en campaign_messages
 * - Maneja errores y reintentos
 */
export async function sendCampaignMessages(
  input: SendCampaignMessagesInput,
): Promise<SendCampaignMessagesResult> {
  const { campaign, customerPhoneNumbers, countryCode = "1" } = input;

  const supabase = createServerClient();
  const messageGroups: SendCampaignMessagesResult["messageGroups"] = [];

  let totalSent = 0;
  let totalFailed = 0;
  let totalPending = 0;

  // Procesar cada cliente
  for (const customer of customerPhoneNumbers) {
    try {
      // 1. Normalizar teléfono
      const normalizedPhone = normalizeWhatsAppPhone(customer.phone, {
        defaultCountryCode: countryCode,
      });

      if (!normalizedPhone) {
        // Registrar como fallido si no se puede normalizar
        messageGroups.push({
          customerId: customer.customerId,
          status: "failed",
          errorMessage: "Invalid phone number format",
        });
        totalFailed++;
        continue;
      }

      // 2. Enviar mensaje vía Twilio WhatsApp
      const sendResult = await sendTwilioWhatsAppMessage({
        to: normalizedPhone,
        text: campaign.message,
      });

      let status: "sent" | "failed" | "pending" = "pending";
      let messageId: string | undefined;
      let errorMessage: string | undefined;

      if (sendResult.ok) {
        status = "sent";
        messageId = sendResult.data.sid;
        totalSent++;
      } else {
        status = "failed";
        errorMessage = sendResult.error.message;
        totalFailed++;
      }

      // 3. Registrar en campaign_messages
      const now = new Date().toISOString();
      const { error: dbError } = await supabase
        .from("campaign_messages")
        .insert({
          campaign_id: campaign.id,
          customer_id: customer.customerId,
          delivery_status: status,
          sent_at: status === "sent" ? now : null,
          created_at: now,
        });

      if (dbError && status !== "failed") {
        status = "failed";
        errorMessage = `Database error: ${dbError.message}`;
        totalFailed++;
        totalSent--;
      }

      messageGroups.push({
        customerId: customer.customerId,
        status,
        messageId,
        errorMessage,
      });
    } catch (error) {
      totalFailed++;
      messageGroups.push({
        customerId: customer.customerId,
        status: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // 4. Actualizar estadísticas de la campaña
  try {
    await refreshCampaignStats(campaign.id);
  } catch (statsError) {
    console.error("Error refreshing campaign stats:", statsError);
  }

  return {
    totalSent,
    totalFailed,
    totalPending,
    messageGroups,
  };
}

/**
 * Refresca las estadísticas agregadas de una campaña
 */
async function refreshCampaignStats(campaignId: string): Promise<void> {
  const supabase = createServerClient();

  const { data: messages } = await supabase
    .from("campaign_messages")
    .select("delivery_status, sent_at")
    .eq("campaign_id", campaignId);

  if (!messages) {
    return;
  }

  const total = messages.length;
  const sent = messages.filter((m) => m.delivery_status === "sent").length;
  const failed = messages.filter((m) => m.delivery_status === "failed").length;
  const pending = total - sent - failed;

  const lastMessageSent = messages
    .filter((m) => m.delivery_status === "sent" && m.sent_at)
    .sort(
      (a, b) =>
        new Date(b.sent_at ?? "").getTime() -
        new Date(a.sent_at ?? "").getTime(),
    )[0]?.sent_at;

  // Actualizar tabla campaigns
  await supabase
    .from("campaigns")
    .update({
      total_messages: total,
      messages_sent: sent,
      messages_failed: failed,
      sent_at: lastMessageSent,
    })
    .eq("id", campaignId);

  // Actualizar o insertar en campaign_stats
  const { data: existingStats } = await supabase
    .from("campaign_stats")
    .select("id")
    .eq("campaign_id", campaignId)
    .single();

  const now = new Date().toISOString();

  if (existingStats) {
    await supabase
      .from("campaign_stats")
      .update({
        total_messages: total,
        messages_sent: sent,
        messages_failed: failed,
        messages_pending: pending,
        last_message_processed_at: lastMessageSent,
        updated_at: now,
      })
      .eq("campaign_id", campaignId);
  } else {
    await supabase.from("campaign_stats").insert({
      campaign_id: campaignId,
      total_messages: total,
      messages_sent: sent,
      messages_failed: failed,
      messages_pending: pending,
      last_message_processed_at: lastMessageSent,
      created_at: now,
      updated_at: now,
    });
  }
}
